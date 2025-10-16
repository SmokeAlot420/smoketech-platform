/**
 * Temporal Client for SmokeTech Studio
 *
 * Provides client-side interface to Temporal workflows from omega-platform.
 * Connects SmokeTech Studio UI to viral engine's Temporal workflows.
 *
 * Features:
 * - Connection pooling for performance
 * - Workflow execution (start, pause, resume, cancel)
 * - Progress tracking via queries
 * - Error handling and retry logic
 */

import { Connection, Client, WorkflowHandle } from '@temporalio/client';

/**
 * Workflow input types (matching viral/src/temporal/workflows)
 */
export interface SingleVideoWorkflowInput {
  characterPrompt: string;
  temperature?: number;
  videoPrompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'fast' | 'standard';
  platform?: 'tiktok' | 'youtube' | 'instagram';
  enhanceWithTopaz?: boolean;
}

export interface VideoScenario {
  videoPrompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'fast' | 'standard';
}

export interface SeriesVideoWorkflowInput {
  characterPrompt: string;
  temperature?: number;
  scenarios: VideoScenario[];
  platform?: 'tiktok' | 'youtube' | 'instagram';
}

/**
 * Workflow progress state (matching viral/src/temporal/workflows)
 */
export interface WorkflowProgress {
  currentStage: string;
  stageProgress?: number;
  overallProgress: number;
  characterImagePath?: string;
  videoPath?: string;
  videosGenerated?: number;
  totalVideos?: number;
  currentVideoIndex?: number;
  totalCost: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

/**
 * Temporal client configuration
 */
export interface TemporalClientConfig {
  address?: string;
  namespace?: string;
  taskQueue?: string;
}

/**
 * Temporal Client Manager
 *
 * Manages connection pooling and provides workflow control functions.
 */
class TemporalClientManager {
  private connection: Connection | null = null;
  private client: Client | null = null;
  private config: Required<TemporalClientConfig>;

  constructor(config: TemporalClientConfig = {}) {
    this.config = {
      address: config.address || 'localhost:7233',
      namespace: config.namespace || 'default',
      taskQueue: config.taskQueue || 'video-generation'
    };
  }

  /**
   * Initialize connection to Temporal server
   * Uses connection pooling for performance
   */
  private async ensureConnection(): Promise<void> {
    if (!this.connection) {
      try {
        console.log(`🔌 [Temporal Client] Connecting to ${this.config.address}...`);
        this.connection = await Connection.connect({
          address: this.config.address
        });
        console.log('✅ [Temporal Client] Connected successfully');
      } catch (error) {
        console.error('❌ [Temporal Client] Connection failed:', error);
        throw new Error(`Failed to connect to Temporal server: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!this.client) {
      this.client = new Client({
        connection: this.connection,
        namespace: this.config.namespace
      });
    }
  }

  /**
   * Start a Single Video workflow
   *
   * @param input - Workflow configuration
   * @returns Workflow ID for tracking
   */
  async startSingleVideoWorkflow(input: SingleVideoWorkflowInput): Promise<string> {
    await this.ensureConnection();

    const workflowId = `single-video-${Date.now()}`;

    try {
      console.log(`🚀 [Temporal Client] Starting Single Video workflow: ${workflowId}`);

      const handle = await this.client!.workflow.start('singleVideoWorkflow', {
        workflowId,
        taskQueue: this.config.taskQueue,
        args: [input]
      });

      console.log(`✅ [Temporal Client] Workflow started: ${workflowId}`);
      return workflowId;

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to start workflow:`, error);
      throw new Error(`Failed to start Single Video workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Start a Series Video workflow
   *
   * @param input - Workflow configuration with multiple scenarios
   * @returns Workflow ID for tracking
   */
  async startSeriesVideoWorkflow(input: SeriesVideoWorkflowInput): Promise<string> {
    await this.ensureConnection();

    const workflowId = `series-video-${Date.now()}`;

    try {
      console.log(`🚀 [Temporal Client] Starting Series Video workflow: ${workflowId}`);

      const handle = await this.client!.workflow.start('seriesVideoWorkflow', {
        workflowId,
        taskQueue: this.config.taskQueue,
        args: [input]
      });

      console.log(`✅ [Temporal Client] Workflow started: ${workflowId}`);
      return workflowId;

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to start workflow:`, error);
      throw new Error(`Failed to start Series Video workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Query workflow status and progress
   *
   * @param workflowId - ID of the workflow to query
   * @returns Current progress state
   */
  async queryWorkflowStatus(workflowId: string): Promise<WorkflowProgress> {
    await this.ensureConnection();

    try {
      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);

      // Query progress using the 'progress' query handler
      const progress = await handle.query<WorkflowProgress>('progress');

      return progress;

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to query workflow ${workflowId}:`, error);
      throw new Error(`Failed to query workflow status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get total cost for a workflow
   *
   * @param workflowId - ID of the workflow to query
   * @returns Total cost in dollars
   */
  async queryWorkflowCost(workflowId: string): Promise<number> {
    await this.ensureConnection();

    try {
      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);
      const cost = await handle.query<number>('totalCost');
      return cost;

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to query cost for ${workflowId}:`, error);
      throw new Error(`Failed to query workflow cost: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Pause a running workflow
   *
   * @param workflowId - ID of the workflow to pause
   */
  async pauseWorkflow(workflowId: string): Promise<void> {
    await this.ensureConnection();

    try {
      console.log(`⏸️  [Temporal Client] Pausing workflow: ${workflowId}`);

      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);
      await handle.signal('pause');

      console.log(`✅ [Temporal Client] Workflow paused: ${workflowId}`);

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to pause workflow ${workflowId}:`, error);
      throw new Error(`Failed to pause workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Resume a paused workflow
   *
   * @param workflowId - ID of the workflow to resume
   */
  async resumeWorkflow(workflowId: string): Promise<void> {
    await this.ensureConnection();

    try {
      console.log(`▶️  [Temporal Client] Resuming workflow: ${workflowId}`);

      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);
      await handle.signal('resume');

      console.log(`✅ [Temporal Client] Workflow resumed: ${workflowId}`);

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to resume workflow ${workflowId}:`, error);
      throw new Error(`Failed to resume workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel a running workflow
   *
   * @param workflowId - ID of the workflow to cancel
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    await this.ensureConnection();

    try {
      console.log(`🛑 [Temporal Client] Cancelling workflow: ${workflowId}`);

      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);
      await handle.signal('cancel');

      console.log(`✅ [Temporal Client] Workflow cancelled: ${workflowId}`);

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to cancel workflow ${workflowId}:`, error);
      throw new Error(`Failed to cancel workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get workflow result (waits for completion)
   *
   * @param workflowId - ID of the workflow
   * @returns Workflow result
   */
  async getWorkflowResult<T = any>(workflowId: string): Promise<T> {
    await this.ensureConnection();

    try {
      const handle: WorkflowHandle = this.client!.workflow.getHandle(workflowId);
      const result = await handle.result();
      return result as T;

    } catch (error) {
      console.error(`❌ [Temporal Client] Failed to get result for ${workflowId}:`, error);
      throw new Error(`Failed to get workflow result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close connection (cleanup)
   */
  async close(): Promise<void> {
    if (this.connection) {
      console.log('🔌 [Temporal Client] Closing connection...');
      await this.connection.close();
      this.connection = null;
      this.client = null;
      console.log('✅ [Temporal Client] Connection closed');
    }
  }
}

// Singleton instance for connection pooling
let temporalClientInstance: TemporalClientManager | null = null;

/**
 * Get Temporal client instance (singleton)
 *
 * @param config - Optional configuration override
 * @returns Temporal client instance
 */
export function getTemporalClient(config?: TemporalClientConfig): TemporalClientManager {
  if (!temporalClientInstance) {
    temporalClientInstance = new TemporalClientManager(config);
  }
  return temporalClientInstance;
}

/**
 * Close Temporal client connection
 */
export async function closeTemporalClient(): Promise<void> {
  if (temporalClientInstance) {
    await temporalClientInstance.close();
    temporalClientInstance = null;
  }
}

// Export the client manager class for direct use
export { TemporalClientManager };
