// Content Storage and Management
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StoredContent {
  id: string;
  persona: any;
  series: any;
  script: any;
  video: any;
  metadata: {
    generatedAt: Date;
    attempt: number;
    status: 'queued' | 'processing' | 'published' | 'failed';
    priority?: 'high' | 'normal' | 'low';
    scheduledFor?: Date;
  };
}

export class ContentStorage {
  private contentStore: Map<string, StoredContent>;
  private queue: StoredContent[];
  private storageDir: string;
  private indexFile: string;
  private queueFile: string;

  constructor(storageDir: string = path.join(process.cwd(), 'generated', 'storage')) {
    this.contentStore = new Map();
    this.queue = [];
    this.storageDir = storageDir;
    this.indexFile = path.join(storageDir, 'content-index.json');
    this.queueFile = path.join(storageDir, 'queue.json');

    // Initialize storage directory and load existing data
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
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
          console.warn(`Failed to load content ${contentId}:`, e);
        }
      }
    } catch (e) {
      // Index doesn't exist yet, will be created on first save
      console.log('No existing storage index found, starting fresh');
    }

    // Load queue if available
    try {
      const queueData = await fs.readFile(this.queueFile, 'utf-8');
      this.queue = JSON.parse(queueData, this.dateReviver);
    } catch (e) {
      // Queue doesn't exist yet
      console.log('No existing queue found, starting fresh');
    }
  }

  private dateReviver(_key: string, value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  private async updateIndex(): Promise<void> {
    const index = {
      contentIds: Array.from(this.contentStore.keys()),
      lastUpdated: new Date().toISOString(),
      totalContent: this.contentStore.size
    };
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  private async saveQueue(): Promise<void> {
    await fs.writeFile(this.queueFile, JSON.stringify(this.queue, null, 2));
  }

  async saveContent(content: StoredContent): Promise<string> {
    // Save to memory
    this.contentStore.set(content.id, content);

    // Save to disk
    const contentFile = path.join(this.storageDir, 'content', `${content.id}.json`);
    await fs.writeFile(contentFile, JSON.stringify(content, null, 2));

    // Update index
    await this.updateIndex();

    console.log(`Saved content to disk: ${contentFile}`);
    return content.id;
  }

  async getContent(contentId: string): Promise<StoredContent | undefined> {
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

  async queueContent(content: StoredContent): Promise<void> {
    // Save to store
    await this.saveContent(content);

    // Add to queue with priority sorting
    if (content.metadata.priority === 'high') {
      this.queue.unshift(content);
    } else {
      this.queue.push(content);
    }

    // Save queue to disk
    await this.saveQueue();

    console.log(`Queued content: ${content.id} (Priority: ${content.metadata.priority || 'normal'})`);
  }

  async getNextFromQueue(): Promise<StoredContent | undefined> {
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
    const content = await this.getContent(contentId);

    if (content) {
      content.metadata.status = status;
      // Save updated content to disk
      await this.saveContent(content);
      console.log(`Updated content ${contentId} status to: ${status}`);
    }
  }

  async getContentByStatus(status: string): Promise<StoredContent[]> {
    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.metadata.status === status) {
        results.push(content);
      }
    }

    return results;
  }

  async getContentByPersona(personaId: string): Promise<StoredContent[]> {
    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.persona.id === personaId) {
        results.push(content);
      }
    }

    return results;
  }

  async getContentBySeries(seriesId: string): Promise<StoredContent[]> {
    const results: StoredContent[] = [];

    for (const content of this.contentStore.values()) {
      if (content.series.id === seriesId) {
        results.push(content);
      }
    }

    return results;
  }

  async cleanupOldContent(daysToKeep: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [id, content] of this.contentStore.entries()) {
      if (content.metadata.generatedAt < cutoff) {
        this.contentStore.delete(id);
        deleted++;
      }
    }

    console.log(`Cleaned up ${deleted} old content items`);
    return deleted;
  }

  getQueueStatus(): {
    total: number;
    high: number;
    normal: number;
    scheduled: number;
  } {
    const now = new Date();

    return {
      total: this.queue.length,
      high: this.queue.filter(c => c.metadata.priority === 'high').length,
      normal: this.queue.filter(c => !c.metadata.priority || c.metadata.priority === 'normal').length,
      scheduled: this.queue.filter(c => c.metadata.scheduledFor && c.metadata.scheduledFor > now).length
    };
  }

  getStorageStats(): {
    totalContent: number;
    byStatus: Record<string, number>;
    byPersona: Record<string, number>;
    bySeries: Record<string, number>;
  } {
    const byStatus: Record<string, number> = {};
    const byPersona: Record<string, number> = {};
    const bySeries: Record<string, number> = {};

    for (const content of this.contentStore.values()) {
      // By status
      const status = content.metadata.status;
      byStatus[status] = (byStatus[status] || 0) + 1;

      // By persona
      const personaId = content.persona.id;
      byPersona[personaId] = (byPersona[personaId] || 0) + 1;

      // By series
      const seriesId = content.series.id;
      bySeries[seriesId] = (bySeries[seriesId] || 0) + 1;
    }

    return {
      totalContent: this.contentStore.size,
      byStatus,
      byPersona,
      bySeries
    };
  }
}