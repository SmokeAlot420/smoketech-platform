/**
 * Storage Factory
 * Creates appropriate storage implementation based on configuration
 */

import { IContentStorage, StorageType, StorageConfig } from './storage-interface';
import { FileContentStorage } from './file-storage';
// import { DatabaseContentStorage } from './database-storage'; // Future implementation
// import { HybridContentStorage } from './hybrid-storage'; // Future implementation

export class StorageFactory {
  private static instances: Map<string, IContentStorage> = new Map();

  /**
   * Create or get a storage instance
   * @param type Storage type (file, database, or hybrid)
   * @param config Optional storage configuration
   * @returns Storage implementation instance
   */
  static create(
    type: StorageType = StorageType.FILE,
    config?: Partial<StorageConfig>
  ): IContentStorage {
    const cacheKey = `${type}_${JSON.stringify(config || {})}`;

    // Check if instance already exists (singleton pattern)
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    let instance: IContentStorage;

    // Create appropriate storage implementation
    switch (type) {
      case StorageType.FILE:
        const fileConfig: StorageConfig = {
          type: StorageType.FILE,
          fileConfig: {
            baseDir: config?.fileConfig?.baseDir || 'generated/storage',
            maxFileSize: config?.fileConfig?.maxFileSize,
            compression: config?.fileConfig?.compression || false
          }
        };
        instance = new FileContentStorage(fileConfig);
        break;

      case StorageType.DATABASE:
        // Placeholder for future database implementation
        throw new Error('Database storage not yet implemented. Please use FILE storage for now.');
        /*
        const dbConfig: StorageConfig = {
          type: StorageType.DATABASE,
          databaseConfig: {
            connectionString: config?.databaseConfig?.connectionString || process.env.DATABASE_URL || '',
            poolSize: config?.databaseConfig?.poolSize || 10,
            timeout: config?.databaseConfig?.timeout || 30000
          }
        };
        instance = new DatabaseContentStorage(dbConfig);
        */
        break;

      case StorageType.HYBRID:
        // Placeholder for future hybrid implementation
        throw new Error('Hybrid storage not yet implemented. Please use FILE storage for now.');
        /*
        const hybridConfig: StorageConfig = {
          type: StorageType.HYBRID,
          fileConfig: {
            baseDir: config?.fileConfig?.baseDir || 'generated/media',
            compression: config?.fileConfig?.compression || true
          },
          databaseConfig: {
            connectionString: config?.databaseConfig?.connectionString || process.env.DATABASE_URL || '',
            poolSize: config?.databaseConfig?.poolSize || 5
          }
        };
        instance = new HybridContentStorage(hybridConfig);
        */
        break;

      default:
        throw new Error(`Unknown storage type: ${type}`);
    }

    // Cache the instance
    this.instances.set(cacheKey, instance);
    return instance;
  }

  /**
   * Get the default storage instance
   * Uses environment variable STORAGE_TYPE if set, otherwise defaults to FILE
   */
  static getDefault(): IContentStorage {
    const storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.FILE;
    return this.create(storageType);
  }

  /**
   * Clear all cached instances
   * Useful for testing or when configuration changes
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Get storage type from environment or config
   */
  static getConfiguredType(): StorageType {
    const envType = process.env.STORAGE_TYPE?.toLowerCase();

    switch (envType) {
      case 'database':
      case 'db':
        return StorageType.DATABASE;
      case 'hybrid':
        return StorageType.HYBRID;
      case 'file':
      default:
        return StorageType.FILE;
    }
  }

  /**
   * Check if a storage type is available
   */
  static isAvailable(type: StorageType): boolean {
    switch (type) {
      case StorageType.FILE:
        return true; // Always available
      case StorageType.DATABASE:
        // Check if database connection string is configured
        return !!process.env.DATABASE_URL;
      case StorageType.HYBRID:
        // Requires both file system and database
        return !!process.env.DATABASE_URL;
      default:
        return false;
    }
  }
}