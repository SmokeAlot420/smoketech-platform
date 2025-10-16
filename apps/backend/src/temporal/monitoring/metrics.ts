/**
 * Performance Metrics Collector
 *
 * Tracks workflow and activity performance metrics including duration,
 * cost, and success rates.
 */

export interface NodeMetrics {
  nodeId: string;
  nodeType: string;
  model?: string;
  startTime: number;
  endTime?: number;
  duration?: number; // milliseconds
  cost: number; // dollars
  success: boolean;
  error?: string;
  retryCount: number;
}

export interface WorkflowMetrics {
  workflowId: string;
  workflowType: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number; // milliseconds
  totalCost: number; // dollars
  nodesExecuted: number;
  nodesSucceeded: number;
  nodesFailed: number;
  success: boolean;
  error?: string;
  nodeMetrics: Map<string, NodeMetrics>;
}

export class MetricsCollector {
  private workflows: Map<string, WorkflowMetrics> = new Map();

  /**
   * Start tracking a new workflow
   */
  startWorkflow(workflowId: string, workflowType: string): void {
    this.workflows.set(workflowId, {
      workflowId,
      workflowType,
      startTime: Date.now(),
      totalCost: 0,
      nodesExecuted: 0,
      nodesSucceeded: 0,
      nodesFailed: 0,
      success: false,
      nodeMetrics: new Map()
    });
  }

  /**
   * Start tracking a node execution
   */
  startNode(workflowId: string, nodeId: string, nodeType: string, model?: string): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.warn(`⚠️  MetricsCollector: Workflow ${workflowId} not found`);
      return;
    }

    workflow.nodeMetrics.set(nodeId, {
      nodeId,
      nodeType,
      model,
      startTime: Date.now(),
      cost: 0,
      success: false,
      retryCount: 0
    });
  }

  /**
   * Record node completion
   */
  endNode(
    workflowId: string,
    nodeId: string,
    options: {
      success: boolean;
      cost: number;
      error?: string;
      retryCount?: number;
    }
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.warn(`⚠️  MetricsCollector: Workflow ${workflowId} not found`);
      return;
    }

    const nodeMetric = workflow.nodeMetrics.get(nodeId);
    if (!nodeMetric) {
      console.warn(`⚠️  MetricsCollector: Node ${nodeId} not found in workflow ${workflowId}`);
      return;
    }

    const endTime = Date.now();
    nodeMetric.endTime = endTime;
    nodeMetric.duration = endTime - nodeMetric.startTime;
    nodeMetric.cost = options.cost;
    nodeMetric.success = options.success;
    nodeMetric.error = options.error;
    nodeMetric.retryCount = options.retryCount || 0;

    // Update workflow totals
    workflow.totalCost += options.cost;
    workflow.nodesExecuted++;
    if (options.success) {
      workflow.nodesSucceeded++;
    } else {
      workflow.nodesFailed++;
    }
  }

  /**
   * Record workflow completion
   */
  endWorkflow(workflowId: string, success: boolean, error?: string): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.warn(`⚠️  MetricsCollector: Workflow ${workflowId} not found`);
      return;
    }

    const endTime = Date.now();
    workflow.endTime = endTime;
    workflow.totalDuration = endTime - workflow.startTime;
    workflow.success = success;
    workflow.error = error;
  }

  /**
   * Get metrics for a workflow
   */
  getWorkflowMetrics(workflowId: string): WorkflowMetrics | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, WorkflowMetrics> {
    return new Map(this.workflows);
  }

  /**
   * Get aggregated statistics
   */
  getAggregatedStats(): {
    totalWorkflows: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    totalCost: number;
    averageDuration: number;
    totalNodes: number;
    successfulNodes: number;
    failedNodes: number;
    costByModel: Map<string, number>;
    durationByModel: Map<string, number>;
  } {
    let totalCost = 0;
    let totalDuration = 0;
    let successfulWorkflows = 0;
    let totalNodes = 0;
    let successfulNodes = 0;
    let failedNodes = 0;
    const costByModel = new Map<string, number>();
    const durationByModel = new Map<string, number>();

    for (const workflow of this.workflows.values()) {
      totalCost += workflow.totalCost;
      if (workflow.totalDuration) {
        totalDuration += workflow.totalDuration;
      }
      if (workflow.success) {
        successfulWorkflows++;
      }
      totalNodes += workflow.nodesExecuted;
      successfulNodes += workflow.nodesSucceeded;
      failedNodes += workflow.nodesFailed;

      // Aggregate by model
      for (const nodeMetric of workflow.nodeMetrics.values()) {
        if (nodeMetric.model) {
          const modelCost = costByModel.get(nodeMetric.model) || 0;
          costByModel.set(nodeMetric.model, modelCost + nodeMetric.cost);

          if (nodeMetric.duration) {
            const modelDuration = durationByModel.get(nodeMetric.model) || 0;
            durationByModel.set(nodeMetric.model, modelDuration + nodeMetric.duration);
          }
        }
      }
    }

    return {
      totalWorkflows: this.workflows.size,
      successfulWorkflows,
      failedWorkflows: this.workflows.size - successfulWorkflows,
      totalCost,
      averageDuration: this.workflows.size > 0 ? totalDuration / this.workflows.size : 0,
      totalNodes,
      successfulNodes,
      failedNodes,
      costByModel,
      durationByModel
    };
  }

  /**
   * Export metrics to JSON
   */
  exportToJSON(): string {
    const data = {
      workflows: Array.from(this.workflows.entries()).map(([id, metrics]) => ({
        ...metrics,
        nodeMetrics: Array.from(metrics.nodeMetrics.entries()).map(([nodeId, nodeMetric]) => ({
          nodeId,
          ...nodeMetric
        }))
      })),
      aggregatedStats: this.getAggregatedStats()
    };

    return JSON.stringify(data, (key, value) => {
      // Convert Map to object for JSON serialization
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }, 2);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.workflows.clear();
  }

  /**
   * Clear metrics for completed workflows older than specified time
   */
  clearOld(maxAgeMs: number): void {
    const now = Date.now();
    for (const [workflowId, metrics] of this.workflows.entries()) {
      if (metrics.endTime && (now - metrics.endTime) > maxAgeMs) {
        this.workflows.delete(workflowId);
      }
    }
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
