/**
 * Storage Abstraction Layer
 * Allows easy switching between file-based and database storage
 */

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

export interface IContentStorage {
  // Core operations
  saveContent(content: StoredContent): Promise<string>;
  getContent(contentId: string): Promise<StoredContent | undefined>;
  deleteContent(contentId: string): Promise<boolean>;

  // Queue management
  queueContent(content: StoredContent): Promise<void>;
  getNextFromQueue(): Promise<StoredContent | undefined>;
  getQueueStatus(): Promise<QueueStatus>;

  // Status updates
  updateContentStatus(contentId: string, status: 'queued' | 'processing' | 'published' | 'failed'): Promise<void>;

  // Query operations
  getContentByStatus(status: string): Promise<StoredContent[]>;
  getContentByPersona(personaId: string): Promise<StoredContent[]>;
  getContentBySeries(seriesId: string): Promise<StoredContent[]>;

  // Maintenance
  cleanupOldContent(daysToKeep: number): Promise<number>;
  getStorageStats(): Promise<StorageStats>;

  // Batch operations
  saveContentBatch(contents: StoredContent[]): Promise<string[]>;
  getContentBatch(contentIds: string[]): Promise<(StoredContent | undefined)[]>;
}

export interface QueueStatus {
  total: number;
  high: number;
  normal: number;
  scheduled: number;
  processing: number;
}

export interface StorageStats {
  totalContent: number;
  byStatus: Record<string, number>;
  byPersona: Record<string, number>;
  bySeries: Record<string, number>;
  storageSize?: number; // In bytes, optional
  oldestEntry?: Date;
  newestEntry?: Date;
}

// Storage types enum
export enum StorageType {
  FILE = 'file',
  DATABASE = 'database',
  HYBRID = 'hybrid' // Use file for media, database for metadata
}

// Storage configuration
export interface StorageConfig {
  type: StorageType;
  fileConfig?: {
    baseDir: string;
    maxFileSize?: number;
    compression?: boolean;
  };
  databaseConfig?: {
    connectionString: string;
    poolSize?: number;
    timeout?: number;
  };
}

// Abstract base class with common functionality
export abstract class BaseContentStorage implements IContentStorage {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  // Abstract methods that must be implemented by subclasses
  abstract saveContent(content: StoredContent): Promise<string>;
  abstract getContent(contentId: string): Promise<StoredContent | undefined>;
  abstract deleteContent(contentId: string): Promise<boolean>;
  abstract queueContent(content: StoredContent): Promise<void>;
  abstract getNextFromQueue(): Promise<StoredContent | undefined>;
  abstract updateContentStatus(contentId: string, status: 'queued' | 'processing' | 'published' | 'failed'): Promise<void>;
  abstract getContentByStatus(status: string): Promise<StoredContent[]>;
  abstract getContentByPersona(personaId: string): Promise<StoredContent[]>;
  abstract getContentBySeries(seriesId: string): Promise<StoredContent[]>;
  abstract cleanupOldContent(daysToKeep: number): Promise<number>;
  abstract getStorageStats(): Promise<StorageStats>;
  abstract getQueueStatus(): Promise<QueueStatus>;

  // Default batch implementations using individual operations
  async saveContentBatch(contents: StoredContent[]): Promise<string[]> {
    const ids: string[] = [];
    for (const content of contents) {
      const id = await this.saveContent(content);
      ids.push(id);
    }
    return ids;
  }

  async getContentBatch(contentIds: string[]): Promise<(StoredContent | undefined)[]> {
    const results: (StoredContent | undefined)[] = [];
    for (const id of contentIds) {
      const content = await this.getContent(id);
      results.push(content);
    }
    return results;
  }

  // Helper method for date validation
  protected isValidDate(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Helper for generating unique IDs
  protected generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}