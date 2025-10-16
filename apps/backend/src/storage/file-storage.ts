/**
 * File-based Storage Implementation
 * Stores content as JSON files on disk
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseContentStorage, StoredContent, StorageConfig, QueueStatus, StorageStats } from './storage-interface';

export class FileContentStorage extends BaseContentStorage {
  private contentStore: Map<string, StoredContent>;
  private queue: StoredContent[];
  private storageDir: string;
  private indexFile: string;
  private queueFile: string;
  private initialized: boolean = false;

  constructor(config: StorageConfig) {
    super(config);
    this.contentStore = new Map();
    this.queue = [];
    this.storageDir = path.join(process.cwd(), config.fileConfig?.baseDir || 'generated/storage');
    this.indexFile = path.join(this.storageDir, 'content-index.json');
    this.queueFile = path.join(this.storageDir, 'queue.json');

    // Initialize storage in background
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    if (this.initialized) return;

    // Create storage directories
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.mkdir(path.join(this.storageDir, 'content'), { recursive: true });
    await fs.mkdir(path.join(this.storageDir, 'media'), { recursive: true });

    // Load existing index if available
    try {
      const indexData = await fs.readFile(this.indexFile, 'utf-8');
      const index = JSON.parse(indexData);

      // Load each content item
      for (const contentId of index.contentIds || []) {
        const contentFile = path.join(this.storageDir, 'content', `${contentId}.json`);
        try {
          const contentData = await fs.readFile(contentFile, 'utf-8');
          const content = JSON.parse(contentData, this.dateReviver);
          this.contentStore.set(contentId, content);
        } catch (e) {
          console.warn(`[FileStorage] Failed to load content ${contentId}:`, e);
        }
      }
      console.log(`[FileStorage] Loaded ${this.contentStore.size} content items from disk`);
    } catch (e) {
      console.log('[FileStorage] No existing index found, starting fresh');
    }

    // Load queue if available
    try {
      const queueData = await fs.readFile(this.queueFile, 'utf-8');
      this.queue = JSON.parse(queueData, this.dateReviver);
      console.log(`[FileStorage] Loaded queue with ${this.queue.length} items`);
    } catch (e) {
      console.log('[FileStorage] No existing queue found, starting fresh');
    }

    this.initialized = true;
  }

  private dateReviver(_key: string, value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  private async updateIndex(): Promise<void> {
    await this.ensureInitialized();
    const index = {
      contentIds: Array.from(this.contentStore.keys()),
      lastUpdated: new Date().toISOString(),
      totalContent: this.contentStore.size
    };
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  private async saveQueue(): Promise<void> {
    await this.ensureInitialized();
    await fs.writeFile(this.queueFile, JSON.stringify(this.queue, null, 2));
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeStorage();
    }
  }

  async saveContent(content: StoredContent): Promise<string> {
    await this.ensureInitialized();

    // Generate ID if not present
    if (!content.id) {
      content.id = this.generateContentId();
    }

    // Save to memory
    this.contentStore.set(content.id, content);

    // Save to disk
    const contentFile = path.join(this.storageDir, 'content', `${content.id}.json`);
    await fs.writeFile(contentFile, JSON.stringify(content, null, 2));

    // Update index
    await this.updateIndex();

    console.log(`[FileStorage] Saved content: ${content.id}`);
    return content.id;
  }

  async getContent(contentId: string): Promise<StoredContent | undefined> {
    await this.ensureInitialized();

    // Try memory first
    let content = this.contentStore.get(contentId);

    // If not in memory, try loading from disk
    if (!content) {
      const contentFile = path.join(this.storageDir, 'content', `${contentId}.json`);
      try {
        const contentData = await fs.readFile(contentFile, 'utf-8');
        content = JSON.parse(contentData, this.dateReviver);
        // Cache in memory
        if (content) {
          this.contentStore.set(contentId, content);
        }
      } catch (e) {
        // Content doesn't exist on disk
        return undefined;
      }
    }

    return content;
  }

  async deleteContent(contentId: string): Promise<boolean> {
    await this.ensureInitialized();

    // Remove from memory
    const deleted = this.contentStore.delete(contentId);

    if (deleted) {
      // Remove from disk
      const contentFile = path.join(this.storageDir, 'content', `${contentId}.json`);
      try {
        await fs.unlink(contentFile);
      } catch (e) {
        console.warn(`[FileStorage] Failed to delete file for ${contentId}:`, e);
      }

      // Update index
      await this.updateIndex();
    }

    return deleted;
  }

  async queueContent(content: StoredContent): Promise<void> {
    await this.ensureInitialized();

    // Save content first
    await this.saveContent(content);

    // Add to queue with priority sorting
    if (content.metadata.priority === 'high') {
      this.queue.unshift(content);
    } else {
      this.queue.push(content);
    }

    // Save queue to disk
    await this.saveQueue();

    console.log(`[FileStorage] Queued content: ${content.id} (Priority: ${content.metadata.priority || 'normal'})`);
  }

  async getNextFromQueue(): Promise<StoredContent | undefined> {
    await this.ensureInitialized();

    const now = new Date();

    // Find next scheduled content that's ready
    const readyIndex = this.queue.findIndex(c =>
      !c.metadata.scheduledFor || c.metadata.scheduledFor <= now
    );

    if (readyIndex !== -1) {
      const [content] = this.queue.splice(readyIndex, 1);
      // Update queue on disk
      await this.saveQueue();
      return content;
    }

    return undefined;
  }

  async updateContentStatus(
    contentId: string,
    status: 'queued' | 'processing' | 'published' | 'failed'
  ): Promise<void> {
    await this.ensureInitialized();

    const content = await this.getContent(contentId);

    if (content) {
      content.metadata.status = status;
      // Save updated content to disk
      await this.saveContent(content);
      console.log(`[FileStorage] Updated content ${contentId} status to: ${status}`);
    }
  }

  async getContentByStatus(status: string): Promise<StoredContent[]> {
    await this.ensureInitialized();

    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.metadata.status === status) {
        results.push(content);
      }
    }

    return results;
  }

  async getContentByPersona(personaId: string): Promise<StoredContent[]> {
    await this.ensureInitialized();

    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.persona?.id === personaId) {
        results.push(content);
      }
    }

    return results;
  }

  async getContentBySeries(seriesId: string): Promise<StoredContent[]> {
    await this.ensureInitialized();

    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.series?.id === seriesId) {
        results.push(content);
      }
    }

    return results;
  }

  async cleanupOldContent(daysToKeep: number = 30): Promise<number> {
    await this.ensureInitialized();

    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [id, content] of this.contentStore.entries()) {
      if (content.metadata.generatedAt < cutoff) {
        await this.deleteContent(id);
        deleted++;
      }
    }

    console.log(`[FileStorage] Cleaned up ${deleted} old content items`);
    return deleted;
  }

  async getQueueStatus(): Promise<QueueStatus> {
    await this.ensureInitialized();

    const now = new Date();

    return {
      total: this.queue.length,
      high: this.queue.filter(c => c.metadata.priority === 'high').length,
      normal: this.queue.filter(c => !c.metadata.priority || c.metadata.priority === 'normal').length,
      scheduled: this.queue.filter(c => c.metadata.scheduledFor && c.metadata.scheduledFor > now).length,
      processing: this.queue.filter(c => c.metadata.status === 'processing').length
    };
  }

  async getStorageStats(): Promise<StorageStats> {
    await this.ensureInitialized();

    const byStatus: Record<string, number> = {};
    const byPersona: Record<string, number> = {};
    const bySeries: Record<string, number> = {};

    let oldestEntry: Date | undefined;
    let newestEntry: Date | undefined;

    for (const content of this.contentStore.values()) {
      // By status
      const status = content.metadata.status;
      byStatus[status] = (byStatus[status] || 0) + 1;

      // By persona
      const personaId = content.persona?.id || 'unknown';
      byPersona[personaId] = (byPersona[personaId] || 0) + 1;

      // By series
      const seriesId = content.series?.id || 'unknown';
      bySeries[seriesId] = (bySeries[seriesId] || 0) + 1;

      // Track oldest/newest
      const generatedAt = content.metadata.generatedAt;
      if (!oldestEntry || generatedAt < oldestEntry) {
        oldestEntry = generatedAt;
      }
      if (!newestEntry || generatedAt > newestEntry) {
        newestEntry = generatedAt;
      }
    }

    // Calculate storage size (approximate)
    let storageSize = 0;
    try {
      const files = await fs.readdir(path.join(this.storageDir, 'content'));
      for (const file of files) {
        const stats = await fs.stat(path.join(this.storageDir, 'content', file));
        storageSize += stats.size;
      }
    } catch (e) {
      // Ignore size calculation errors
    }

    return {
      totalContent: this.contentStore.size,
      byStatus,
      byPersona,
      bySeries,
      storageSize,
      oldestEntry,
      newestEntry
    };
  }
}