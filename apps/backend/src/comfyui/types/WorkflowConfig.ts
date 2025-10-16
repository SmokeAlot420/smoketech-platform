/**
 * ComfyUI-Style Workflow Configuration
 *
 * Defines the complete workflow structure including nodes, connections,
 * and execution parameters
 */

import { NodeConfig, NodeConnection } from './NodeConfig.js';

/**
 * Workflow Execution Mode
 */
export type WorkflowExecutionMode =
  | 'sequential'   // Execute nodes in topological order
  | 'parallel'     // Execute independent nodes in parallel
  | 'conditional'; // Execute based on runtime conditions

/**
 * Workflow Configuration
 * Complete definition of a video generation workflow
 */
export interface WorkflowConfig {
  /** Workflow ID */
  id: string;

  /** Workflow name */
  name: string;

  /** Workflow description */
  description?: string;

  /** Workflow version */
  version: string;

  /** Execution mode */
  executionMode: WorkflowExecutionMode;

  /** Nodes in the workflow */
  nodes: NodeConfig[];

  /** Connections between nodes */
  connections: NodeConnection[];

  /** Workflow input parameters */
  inputs: WorkflowInput[];

  /** Workflow output definitions */
  outputs: WorkflowOutput[];

  /** Workflow metadata */
  metadata?: {
    /** Author/creator */
    author?: string;

    /** Creation date */
    created?: string;

    /** Last modified date */
    modified?: string;

    /** Tags for organization */
    tags?: string[];

    /** Category */
    category?: 'single-video' | 'series-video' | 'asset-animation' | 'custom';

    /** Whether this is a template */
    isTemplate?: boolean;
  };

  /** Execution settings */
  settings?: {
    /** Maximum execution time (ms) */
    timeout?: number;

    /** Maximum cost limit (USD) */
    costLimit?: number;

    /** Whether to checkpoint after each node */
    checkpointEnabled?: boolean;

    /** Retry configuration */
    retry?: {
      enabled: boolean;
      maxAttempts: number;
      backoffMs: number;
    };

    /** Temporal-specific settings */
    temporal?: {
      taskQueue?: string;
      workflowId?: string;
    };
  };
}

/**
 * Workflow Input Parameter
 * Defines an input that can be provided when starting the workflow
 */
export interface WorkflowInput {
  /** Input name */
  name: string;

  /** Data type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  /** Human-readable label */
  label: string;

  /** Description */
  description?: string;

  /** Whether required */
  required: boolean;

  /** Default value */
  defaultValue?: any;

  /** Validation constraints */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Workflow Output Definition
 * Defines what the workflow produces
 */
export interface WorkflowOutput {
  /** Output name */
  name: string;

  /** Data type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'image' | 'video';

  /** Human-readable label */
  label: string;

  /** Description */
  description?: string;

  /** Source node ID */
  sourceNodeId: string;

  /** Source output slot */
  sourceSlot: string;
}

/**
 * Workflow Execution Result
 * Result of running a complete workflow
 */
export interface WorkflowExecutionResult {
  /** Workflow ID */
  workflowId: string;

  /** Whether execution succeeded */
  success: boolean;

  /** Output data mapped to output names */
  outputs: Record<string, any>;

  /** Total execution time (ms) */
  totalExecutionTime: number;

  /** Total cost (USD) */
  totalCost: number;

  /** Node execution details */
  nodeResults: Record<string, NodeExecutionDetails>;

  /** Error if failed */
  error?: string;

  /** Warnings */
  warnings?: string[];

  /** Execution metadata */
  metadata?: {
    startTime: string;
    endTime: string;
    temporalRunId?: string;
  };
}

/**
 * Node Execution Details
 * Detailed information about individual node execution
 */
export interface NodeExecutionDetails {
  /** Node ID */
  nodeId: string;

  /** Node type */
  nodeType: string;

  /** Execution status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

  /** Start time */
  startTime?: string;

  /** End time */
  endTime?: string;

  /** Execution time (ms) */
  executionTime?: number;

  /** Cost incurred (USD) */
  cost?: number;

  /** Number of retries */
  retries?: number;

  /** Error if failed */
  error?: string;

  /** Checkpoint saved */
  checkpointed?: boolean;
}

/**
 * Workflow Validation Result
 * Result of validating a workflow configuration
 */
export interface WorkflowValidationResult {
  /** Whether workflow is valid */
  valid: boolean;

  /** Validation errors */
  errors: WorkflowValidationError[];

  /** Validation warnings */
  warnings: WorkflowValidationWarning[];
}

/**
 * Workflow Validation Error
 * Critical error that prevents workflow execution
 */
export interface WorkflowValidationError {
  /** Error type */
  type: 'missing_node' | 'invalid_connection' | 'circular_dependency' | 'missing_input' | 'invalid_config' | 'type_mismatch';

  /** Error message */
  message: string;

  /** Related node ID (if applicable) */
  nodeId?: string;

  /** Related connection (if applicable) */
  connection?: NodeConnection;

  /** Additional context */
  context?: any;
}

/**
 * Workflow Validation Warning
 * Non-critical issue that might affect workflow execution
 */
export interface WorkflowValidationWarning {
  /** Warning type */
  type: 'unused_node' | 'unused_output' | 'high_cost' | 'long_execution' | 'deprecated';

  /** Warning message */
  message: string;

  /** Related node ID (if applicable) */
  nodeId?: string;

  /** Suggested fix */
  suggestion?: string;
}

/**
 * Workflow Graph
 * Internal representation of workflow as a directed acyclic graph
 */
export interface WorkflowGraph {
  /** Nodes mapped by ID */
  nodes: Map<string, NodeConfig>;

  /** Adjacency list (node -> connected nodes) */
  adjacencyList: Map<string, string[]>;

  /** Reverse adjacency list (node -> dependencies) */
  dependencies: Map<string, string[]>;

  /** Topologically sorted node IDs */
  executionOrder: string[];

  /** Entry nodes (no dependencies) */
  entryNodes: string[];

  /** Exit nodes (no dependents) */
  exitNodes: string[];
}

/**
 * A/B Testing Configuration
 * Supports comparing different models/parameters
 */
export interface ABTestConfig {
  /** Test name */
  name: string;

  /** Node ID to test */
  nodeId: string;

  /** Variants to test */
  variants: ABTestVariant[];

  /** Number of runs per variant */
  runsPerVariant: number;

  /** Metrics to compare */
  metrics: ('cost' | 'time' | 'quality')[];
}

/**
 * A/B Test Variant
 * Single variant in an A/B test
 */
export interface ABTestVariant {
  /** Variant name */
  name: string;

  /** Parameter overrides */
  params: Record<string, any>;
}

/**
 * A/B Test Result
 * Result of running an A/B test
 */
export interface ABTestResult {
  /** Test name */
  testName: string;

  /** Variant results */
  variants: Record<string, ABTestVariantResult>;

  /** Winner variant name */
  winner?: string;

  /** Win confidence (0-1) */
  confidence?: number;
}

/**
 * A/B Test Variant Result
 * Results for a single variant
 */
export interface ABTestVariantResult {
  /** Variant name */
  name: string;

  /** Number of successful runs */
  successCount: number;

  /** Number of failed runs */
  failureCount: number;

  /** Average cost (USD) */
  avgCost: number;

  /** Average execution time (ms) */
  avgTime: number;

  /** Quality score (0-100, if applicable) */
  qualityScore?: number;

  /** Sample outputs */
  sampleOutputs: any[];
}
