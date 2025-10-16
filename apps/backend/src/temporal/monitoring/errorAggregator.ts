/**
 * Error Aggregation and Alerting
 *
 * Tracks errors across workflows and provides alerting capabilities.
 */

export interface ErrorEntry {
  timestamp: number;
  workflowId: string;
  nodeId?: string;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  errorCode?: string;
  retryCount: number;
  context?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<string, number>;
  errorsByWorkflow: Map<string, number>;
  errorsByNode: Map<string, number>;
  recentErrors: ErrorEntry[];
}

export type AlertHandler = (error: ErrorEntry) => void | Promise<void>;

export class ErrorAggregator {
  private errors: ErrorEntry[] = [];
  private maxErrors: number = 1000; // Keep last 1000 errors
  private alertHandlers: AlertHandler[] = [];
  private alertThresholds: Map<string, { count: number; windowMs: number }> = new Map();

  /**
   * Register error
   */
  recordError(error: ErrorEntry): void {
    // Add to error log
    this.errors.push(error);

    // Trim if exceeds max
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Trigger alerts
    this.checkAlerts(error);
  }

  /**
   * Register alert handler
   */
  onAlert(handler: AlertHandler): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Set alert threshold for error type
   */
  setAlertThreshold(errorType: string, count: number, windowMs: number): void {
    this.alertThresholds.set(errorType, { count, windowMs });
  }

  /**
   * Check if alerts should be triggered
   */
  private async checkAlerts(error: ErrorEntry): Promise<void> {
    const threshold = this.alertThresholds.get(error.errorType);
    if (!threshold) {
      return;
    }

    // Count recent errors of this type
    const now = Date.now();
    const recentErrors = this.errors.filter(
      e => e.errorType === error.errorType && (now - e.timestamp) < threshold.windowMs
    );

    if (recentErrors.length >= threshold.count) {
      // Trigger all alert handlers
      for (const handler of this.alertHandlers) {
        try {
          await handler(error);
        } catch (err) {
          console.error('❌ Alert handler failed:', err);
        }
      }
    }
  }

  /**
   * Get error statistics
   */
  getStats(options?: { since?: number; errorType?: string }): ErrorStats {
    let filteredErrors = this.errors;

    if (options?.since) {
      filteredErrors = filteredErrors.filter(e => e.timestamp >= options.since);
    }

    if (options?.errorType) {
      filteredErrors = filteredErrors.filter(e => e.errorType === options.errorType);
    }

    const errorsByType = new Map<string, number>();
    const errorsByWorkflow = new Map<string, number>();
    const errorsByNode = new Map<string, number>();

    for (const error of filteredErrors) {
      // By type
      errorsByType.set(error.errorType, (errorsByType.get(error.errorType) || 0) + 1);

      // By workflow
      errorsByWorkflow.set(error.workflowId, (errorsByWorkflow.get(error.workflowId) || 0) + 1);

      // By node
      if (error.nodeId) {
        errorsByNode.set(error.nodeId, (errorsByNode.get(error.nodeId) || 0) + 1);
      }
    }

    return {
      totalErrors: filteredErrors.length,
      errorsByType,
      errorsByWorkflow,
      errorsByNode,
      recentErrors: filteredErrors.slice(-10) // Last 10 errors
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorEntry[] {
    return this.errors.slice(-count);
  }

  /**
   * Get errors for specific workflow
   */
  getWorkflowErrors(workflowId: string): ErrorEntry[] {
    return this.errors.filter(e => e.workflowId === workflowId);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(errorType: string): ErrorEntry[] {
    return this.errors.filter(e => e.errorType === errorType);
  }

  /**
   * Check if workflow has errors
   */
  hasWorkflowErrors(workflowId: string): boolean {
    return this.errors.some(e => e.workflowId === workflowId);
  }

  /**
   * Export errors to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      errors: this.errors,
      stats: {
        ...this.getStats(),
        errorsByType: Object.fromEntries(this.getStats().errorsByType),
        errorsByWorkflow: Object.fromEntries(this.getStats().errorsByWorkflow),
        errorsByNode: Object.fromEntries(this.getStats().errorsByNode)
      }
    }, null, 2);
  }

  /**
   * Clear old errors
   */
  clearOld(maxAgeMs: number): void {
    const now = Date.now();
    this.errors = this.errors.filter(e => (now - e.timestamp) <= maxAgeMs);
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }
}

// Singleton instance
export const errorAggregator = new ErrorAggregator();

// Setup default alert handlers
if (process.env.NODE_ENV === 'production') {
  // Alert on 5 errors of same type within 5 minutes
  errorAggregator.setAlertThreshold('APIError', 5, 5 * 60 * 1000);
  errorAggregator.setAlertThreshold('TimeoutError', 3, 5 * 60 * 1000);

  // Default console alert
  errorAggregator.onAlert((error) => {
    console.error('🚨 ERROR ALERT:', {
      type: error.errorType,
      workflow: error.workflowId,
      node: error.nodeId,
      message: error.errorMessage,
      retryCount: error.retryCount
    });
  });
}
