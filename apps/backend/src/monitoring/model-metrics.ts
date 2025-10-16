/**
 * Model Metrics Tracking
 * Tracks usage, performance, and costs for all AI models
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { MODEL_COSTS } from '../config/models';

export interface ModelUsageEntry {
  model: string;
  operation: string;
  startTime: Date;
  endTime?: Date;
  latencyMs?: number;
  cost: number;
  success: boolean;
  error?: string;
  inputSize?: number;
  outputSize?: number;
  metadata?: Record<string, any>;
}

export interface ModelStats {
  count: number;
  totalCost: number;
  avgCost: number;
  avgLatency: number;
  successRate: number;
  errors: number;
  totalInputSize: number;
  totalOutputSize: number;
}

export interface MetricsReport {
  period: {
    start: Date;
    end: Date;
  };
  totalCost: number;
  totalOperations: number;
  byModel: Record<string, ModelStats>;
  byOperation: Record<string, ModelStats>;
  topErrors: Array<{ error: string; count: number }>;
  hourlyCosts: Array<{ hour: string; cost: number }>;
}

export class ModelMetrics {
  private static instance: ModelMetrics;
  private usage: Map<string, ModelUsageEntry[]> = new Map();
  private metricsFile: string;
  private saveInterval: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;

  private constructor() {
    this.metricsFile = path.join(process.cwd(), 'generated', 'metrics', 'model-usage.json');
    this.loadMetrics();
    this.startAutoSave();
  }

  static getInstance(): ModelMetrics {
    if (!ModelMetrics.instance) {
      ModelMetrics.instance = new ModelMetrics();
    }
    return ModelMetrics.instance;
  }

  /**
   * Start tracking a model operation
   */
  startOperation(
    model: string,
    operation: string,
    metadata?: Record<string, any>
  ): string {
    const operationId = `${model}_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry: ModelUsageEntry = {
      model,
      operation,
      startTime: new Date(),
      cost: 0,
      success: false,
      metadata
    };

    if (!this.usage.has(operationId)) {
      this.usage.set(operationId, []);
    }
    this.usage.get(operationId)!.push(entry);
    this.isDirty = true;

    return operationId;
  }

  /**
   * Complete a model operation
   */
  endOperation(
    operationId: string,
    success: boolean,
    cost?: number,
    error?: string,
    additionalData?: {
      inputSize?: number;
      outputSize?: number;
      metadata?: Record<string, any>;
    }
  ): void {
    const entries = this.usage.get(operationId);
    if (entries && entries.length > 0) {
      const entry = entries[entries.length - 1];
      entry.endTime = new Date();
      entry.latencyMs = entry.endTime.getTime() - entry.startTime.getTime();
      entry.success = success;
      entry.cost = cost || this.estimateCost(entry.model, entry.operation);
      entry.error = error;

      if (additionalData) {
        entry.inputSize = additionalData.inputSize;
        entry.outputSize = additionalData.outputSize;
        entry.metadata = { ...entry.metadata, ...additionalData.metadata };
      }

      this.isDirty = true;

      // Log significant events
      if (!success) {
        console.error(`[ModelMetrics] Operation failed: ${entry.model}/${entry.operation} - ${error}`);
      } else if (entry.latencyMs > 30000) {
        console.warn(`[ModelMetrics] Slow operation: ${entry.model}/${entry.operation} took ${entry.latencyMs}ms`);
      }
    }
  }

  /**
   * Track a complete operation in one call
   */
  async trackOperation<T>(
    model: string,
    operation: string,
    fn: () => Promise<T>,
    estimatedCost?: number
  ): Promise<T> {
    const operationId = this.startOperation(model, operation);

    try {
      const startTime = Date.now();
      const result = await fn();
      const latency = Date.now() - startTime;

      this.endOperation(operationId, true, estimatedCost, undefined, {
        metadata: { latency }
      });

      return result;
    } catch (error: any) {
      this.endOperation(operationId, false, estimatedCost, error.message);
      throw error;
    }
  }

  /**
   * Get usage statistics for a specific model
   */
  getModelStats(model: string, since?: Date): ModelStats {
    const allEntries = Array.from(this.usage.values()).flat();
    const modelEntries = allEntries.filter(e =>
      e.model === model &&
      (!since || e.startTime >= since)
    );

    return this.calculateStats(modelEntries);
  }

  /**
   * Get usage statistics for a specific operation type
   */
  getOperationStats(operation: string, since?: Date): ModelStats {
    const allEntries = Array.from(this.usage.values()).flat();
    const operationEntries = allEntries.filter(e =>
      e.operation === operation &&
      (!since || e.startTime >= since)
    );

    return this.calculateStats(operationEntries);
  }

  /**
   * Generate a comprehensive metrics report
   */
  generateReport(hours: number = 24): MetricsReport {
    const now = new Date();
    const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const allEntries = Array.from(this.usage.values()).flat();
    const periodEntries = allEntries.filter(e => e.startTime >= since);

    // Calculate totals
    const totalCost = periodEntries.reduce((sum, e) => sum + e.cost, 0);
    const totalOperations = periodEntries.length;

    // Group by model
    const byModel: Record<string, ModelStats> = {};
    const modelGroups = this.groupBy(periodEntries, 'model');
    for (const [model, entries] of Object.entries(modelGroups)) {
      byModel[model] = this.calculateStats(entries);
    }

    // Group by operation
    const byOperation: Record<string, ModelStats> = {};
    const operationGroups = this.groupBy(periodEntries, 'operation');
    for (const [operation, entries] of Object.entries(operationGroups)) {
      byOperation[operation] = this.calculateStats(entries);
    }

    // Top errors
    const errorCounts = new Map<string, number>();
    periodEntries
      .filter(e => !e.success && e.error)
      .forEach(e => {
        errorCounts.set(e.error!, (errorCounts.get(e.error!) || 0) + 1);
      });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly costs
    const hourlyCosts = this.calculateHourlyCosts(periodEntries, hours);

    return {
      period: {
        start: since,
        end: now
      },
      totalCost,
      totalOperations,
      byModel,
      byOperation,
      topErrors,
      hourlyCosts
    };
  }

  /**
   * Get cost breakdown for the current billing period
   */
  getBillingPeriodCosts(): Record<string, number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allEntries = Array.from(this.usage.values()).flat();
    const monthEntries = allEntries.filter(e => e.startTime >= startOfMonth);

    const costs: Record<string, number> = {};
    for (const entry of monthEntries) {
      const key = `${entry.model}_${entry.operation}`;
      costs[key] = (costs[key] || 0) + entry.cost;
    }

    return costs;
  }

  /**
   * Clear old metrics data
   */
  async cleanupOldMetrics(daysToKeep: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let removed = 0;

    for (const [id, entries] of this.usage.entries()) {
      const filtered = entries.filter(e => e.startTime >= cutoff);
      if (filtered.length === 0) {
        this.usage.delete(id);
        removed += entries.length;
      } else if (filtered.length < entries.length) {
        this.usage.set(id, filtered);
        removed += entries.length - filtered.length;
      }
    }

    if (removed > 0) {
      this.isDirty = true;
      console.log(`[ModelMetrics] Cleaned up ${removed} old metric entries`);
    }

    return removed;
  }

  /**
   * Export metrics to CSV format
   */
  async exportToCSV(filePath: string, since?: Date): Promise<void> {
    const allEntries = Array.from(this.usage.values()).flat();
    const entries = since ? allEntries.filter(e => e.startTime >= since) : allEntries;

    const headers = ['Timestamp', 'Model', 'Operation', 'Latency (ms)', 'Cost ($)', 'Success', 'Error'];
    const rows = entries.map(e => [
      e.startTime.toISOString(),
      e.model,
      e.operation,
      e.latencyMs || '',
      e.cost.toFixed(4),
      e.success ? 'Yes' : 'No',
      e.error || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    await fs.writeFile(filePath, csv);

    console.log(`[ModelMetrics] Exported ${entries.length} entries to ${filePath}`);
  }

  // Private helper methods

  private calculateStats(entries: ModelUsageEntry[]): ModelStats {
    if (entries.length === 0) {
      return {
        count: 0,
        totalCost: 0,
        avgCost: 0,
        avgLatency: 0,
        successRate: 0,
        errors: 0,
        totalInputSize: 0,
        totalOutputSize: 0
      };
    }

    const successful = entries.filter(e => e.success);
    const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
    const totalLatency = entries
      .filter(e => e.latencyMs)
      .reduce((sum, e) => sum + (e.latencyMs || 0), 0);
    const latencyCount = entries.filter(e => e.latencyMs).length;

    return {
      count: entries.length,
      totalCost,
      avgCost: totalCost / entries.length,
      avgLatency: latencyCount > 0 ? totalLatency / latencyCount : 0,
      successRate: (successful.length / entries.length) * 100,
      errors: entries.length - successful.length,
      totalInputSize: entries.reduce((sum, e) => sum + (e.inputSize || 0), 0),
      totalOutputSize: entries.reduce((sum, e) => sum + (e.outputSize || 0), 0)
    };
  }

  private groupBy(entries: ModelUsageEntry[], key: keyof ModelUsageEntry): Record<string, ModelUsageEntry[]> {
    const groups: Record<string, ModelUsageEntry[]> = {};

    for (const entry of entries) {
      const groupKey = String(entry[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    }

    return groups;
  }

  private calculateHourlyCosts(entries: ModelUsageEntry[], hours: number): Array<{ hour: string; cost: number }> {
    const hourlyCosts = new Map<string, number>();
    const now = new Date();

    // Initialize all hours with 0
    for (let i = 0; i < hours; i++) {
      const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hourTime.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyCosts.set(hourKey, 0);
    }

    // Sum costs by hour
    for (const entry of entries) {
      const hourKey = entry.startTime.toISOString().substring(0, 13);
      hourlyCosts.set(hourKey, (hourlyCosts.get(hourKey) || 0) + entry.cost);
    }

    // Convert to array and sort
    return Array.from(hourlyCosts.entries())
      .map(([hour, cost]) => ({ hour, cost }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  private estimateCost(model: string, operation: string): number {
    // Try to find exact model cost
    if (MODEL_COSTS[model]) {
      return MODEL_COSTS[model];
    }

    // Estimate based on operation type
    if (operation.includes('image')) {
      return 0.039; // Default image cost
    } else if (operation.includes('video')) {
      return 1.20; // Default video cost
    } else if (operation.includes('text') || operation.includes('script')) {
      return 0.001; // Estimated text generation cost
    }

    return 0; // Unknown operation
  }

  private async loadMetrics(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      const parsed = JSON.parse(data, this.dateReviver);

      // Restore usage map
      for (const [id, entries] of Object.entries(parsed)) {
        this.usage.set(id, entries as ModelUsageEntry[]);
      }

      console.log(`[ModelMetrics] Loaded ${this.usage.size} metric entries`);
    } catch (e) {
      console.log('[ModelMetrics] No existing metrics found, starting fresh');
    }
  }

  private async saveMetrics(): Promise<void> {
    if (!this.isDirty) return;

    try {
      await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });

      // Convert Map to object for JSON serialization
      const dataObject: Record<string, ModelUsageEntry[]> = {};
      for (const [id, entries] of this.usage.entries()) {
        dataObject[id] = entries;
      }

      await fs.writeFile(this.metricsFile, JSON.stringify(dataObject, null, 2));
      this.isDirty = false;
    } catch (e) {
      console.error('[ModelMetrics] Failed to save metrics:', e);
    }
  }

  private dateReviver(_key: string, value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  private startAutoSave(): void {
    // Save every 30 seconds if there are changes
    this.saveInterval = setInterval(() => {
      if (this.isDirty) {
        this.saveMetrics();
      }
    }, 30000);
  }

  /**
   * Cleanup and save on shutdown
   */
  async shutdown(): Promise<void> {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    await this.saveMetrics();
    console.log('[ModelMetrics] Shutdown complete');
  }
}

// Export singleton instance
export const metrics = ModelMetrics.getInstance();