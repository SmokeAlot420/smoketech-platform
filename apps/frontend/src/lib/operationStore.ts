/**
 * Operation Store for tracking long-running video generation operations
 * Uses Supabase for persistence (survives hot-reloads and server restarts)
 * Falls back to in-memory Map if Supabase is not configured
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface Operation {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  createdAt: number;
  updatedAt: number;
  result?: any;
  error?: string;
  metadata?: any;
}

class OperationStore {
  private operations: Map<string, Operation> = new Map(); // Fallback for non-Supabase
  private readonly MAX_AGE = 3600000; // 1 hour
  private usingSupabase: boolean;

  constructor() {
    this.usingSupabase = isSupabaseConfigured;
    if (this.usingSupabase) {
      console.log('✅ OperationStore using Supabase (persistent storage)');
    } else {
      console.warn('⚠️  OperationStore using in-memory Map (not persistent across hot-reloads)');
    }
  }

  /**
   * Create a new operation
   */
  async create(id: string): Promise<Operation> {
    const operation: Operation = {
      id,
      status: 'pending',
      progress: 0,
      message: 'Initializing...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (this.usingSupabase && supabase) {
      const { error } = await supabase
        .from('operations')
        .insert({
          id: operation.id,
          status: operation.status,
          progress: operation.progress,
          message: operation.message,
          created_at: operation.createdAt,
          updated_at: operation.updatedAt,
        });

      if (error) {
        console.error('❌ Supabase insert error:', error);
        // Fall back to in-memory
        this.operations.set(id, operation);
      }
    } else {
      this.operations.set(id, operation);
    }

    return operation;
  }

  /**
   * Get operation by ID
   */
  async get(id: string): Promise<Operation | undefined> {
    if (this.usingSupabase && supabase) {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Supabase query error:', error);
        return this.operations.get(id);
      }

      if (!data) return undefined;

      return {
        id: data.id,
        status: data.status,
        progress: data.progress,
        message: data.message,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        result: data.result,
        error: data.error,
        metadata: data.metadata,
      };
    }

    return this.operations.get(id);
  }

  /**
   * Update operation status
   */
  async update(id: string, updates: Partial<Operation>): Promise<Operation | undefined> {
    if (this.usingSupabase && supabase) {
      // Get current operation first
      const current = await this.get(id);
      if (!current) return undefined;

      const updated = {
        ...current,
        ...updates,
        updatedAt: Date.now(),
      };

      const { error } = await supabase
        .from('operations')
        .update({
          status: updated.status,
          progress: updated.progress,
          message: updated.message,
          result: updated.result,
          error: updated.error,
          metadata: updated.metadata,
          updated_at: updated.updatedAt,
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase update error:', error);
        // Fall back to in-memory
        const operation = this.operations.get(id);
        if (!operation) return undefined;
        const fallbackUpdated = { ...operation, ...updates, updatedAt: Date.now() };
        this.operations.set(id, fallbackUpdated);
        return fallbackUpdated;
      }

      return updated;
    }

    // In-memory fallback
    const operation = this.operations.get(id);
    if (!operation) return undefined;

    const updated = {
      ...operation,
      ...updates,
      updatedAt: Date.now(),
    };
    this.operations.set(id, updated);
    return updated;
  }

  /**
   * Delete operation
   */
  async delete(id: string): Promise<boolean> {
    if (this.usingSupabase && supabase) {
      const { error } = await supabase
        .from('operations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        return this.operations.delete(id);
      }

      return true;
    }

    return this.operations.delete(id);
  }

  /**
   * Clean up old operations (called periodically)
   */
  async cleanup(): Promise<number> {
    if (this.usingSupabase && supabase) {
      const cutoff = Date.now() - this.MAX_AGE;
      const { error, count } = await supabase
        .from('operations')
        .delete()
        .lt('updated_at', cutoff);

      if (error) {
        console.error('❌ Supabase cleanup error:', error);
        return this.cleanupInMemory();
      }

      return count || 0;
    }

    return this.cleanupInMemory();
  }

  private cleanupInMemory(): number {
    const now = Date.now();
    let deleted = 0;

    for (const [id, operation] of this.operations.entries()) {
      if (now - operation.updatedAt > this.MAX_AGE) {
        this.operations.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Get all operations (for debugging)
   */
  async getAll(): Promise<Operation[]> {
    if (this.usingSupabase && supabase) {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Supabase getAll error:', error);
        return Array.from(this.operations.values());
      }

      return (data || []).map(row => ({
        id: row.id,
        status: row.status,
        progress: row.progress,
        message: row.message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        result: row.result,
        error: row.error,
        metadata: row.metadata,
      }));
    }

    return Array.from(this.operations.values());
  }

  /**
   * Get operation count
   */
  async count(): Promise<number> {
    if (this.usingSupabase && supabase) {
      const { count, error } = await supabase
        .from('operations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Supabase count error:', error);
        return this.operations.size;
      }

      return count || 0;
    }

    return this.operations.size;
  }
}

// Singleton instance
export const operationStore = new OperationStore();

// Clean up old operations every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(async () => {
    const deleted = await operationStore.cleanup();
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} old operations`);
    }
  }, 600000); // 10 minutes
}
