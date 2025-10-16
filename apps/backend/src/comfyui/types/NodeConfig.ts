/**
 * ComfyUI-Style Node Architecture
 *
 * Flexible node-based workflow system for video generation
 * Supports model swapping, A/B testing, and Temporal fault tolerance
 */

/**
 * Node Types
 * Each type represents a specific operation in the workflow
 */
export type NodeType =
  | 'image_generator'      // Generate character images (NanoBanana, Midjourney, DALL-E, Imagen)
  | 'video_generator'      // Generate videos (VEO3, Sora 2, Sora 2.2)
  | 'prompt_enhancer'      // Enhance prompts (Gemini, ChatGPT)
  | 'video_stitcher'       // Stitch multiple videos (FFmpeg)
  | 'video_enhancer'       // 4K upscaling (Topaz Video AI)
  | 'logo_overlay'         // Add logo/watermark
  | 'audio_processor'      // Audio processing
  | 'platform_optimizer';  // Platform-specific optimization

/**
 * Node Input/Output Slot Definition
 * Defines what data can be passed between nodes
 */
export interface NodeSlot {
  /** Unique name for this slot */
  name: string;

  /** Data type expected/provided */
  type: 'string' | 'number' | 'boolean' | 'image' | 'video' | 'audio' | 'object' | 'array';

  /** Human-readable description */
  description: string;

  /** Whether this slot is required */
  required: boolean;

  /** Default value if not connected */
  defaultValue?: any;

  /** Validation constraints */
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Node Connection
 * Defines data flow between nodes
 */
export interface NodeConnection {
  /** Source node ID */
  sourceNodeId: string;

  /** Source output slot name */
  sourceSlot: string;

  /** Target node ID */
  targetNodeId: string;

  /** Target input slot name */
  targetSlot: string;
}

/**
 * Node Configuration
 * Complete definition of a node in the workflow
 */
export interface NodeConfig {
  /** Unique node ID */
  id: string;

  /** Node type */
  type: NodeType;

  /** Human-readable label */
  label?: string;

  /** Node-specific parameters */
  params: Record<string, any>;

  /** Input slots definition */
  inputs: NodeSlot[];

  /** Output slots definition */
  outputs: NodeSlot[];

  /** Execution metadata */
  metadata?: {
    /** Position in visual editor (optional) */
    position?: { x: number; y: number };

    /** Execution priority (higher = earlier) */
    priority?: number;

    /** Whether this node can be skipped */
    optional?: boolean;

    /** Maximum execution time (ms) */
    timeout?: number;

    /** Retry configuration */
    retry?: {
      maxAttempts: number;
      backoffMs: number;
    };
  };
}

/**
 * Node Execution Context
 * Runtime context provided to nodes during execution
 */
export interface NodeExecutionContext {
  /** Workflow ID for tracking */
  workflowId: string;

  /** Current node ID */
  nodeId: string;

  /** Temporal context (if running in Temporal) */
  temporal?: {
    activityInfo?: any;
    heartbeat?: () => void;
  };

  /** Logger */
  logger: {
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
  };

  /** Cost tracking */
  costTracker: {
    addCost: (amount: number, description: string) => void;
    getTotalCost: () => number;
  };

  /** Progress tracking */
  progress: {
    update: (percent: number, message?: string) => void;
  };
}

/**
 * Node Execution Result
 * Result returned by node execution
 */
export interface NodeExecutionResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Output data mapped to output slots */
  outputs: Record<string, any>;

  /** Execution time (ms) */
  executionTime: number;

  /** Cost incurred (USD) */
  cost: number;

  /** Error if failed */
  error?: string;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Base Node Interface
 * All nodes must implement this interface
 */
export interface INode {
  /** Node configuration */
  config: NodeConfig;

  /**
   * Execute the node
   * @param inputs - Input data mapped to input slot names
   * @param context - Execution context
   * @returns Execution result
   */
  execute(
    inputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult>;

  /**
   * Validate node configuration
   * @returns Validation errors (empty if valid)
   */
  validate(): string[];

  /**
   * Get node cost estimate
   * @param inputs - Input data for estimation
   * @returns Estimated cost (USD)
   */
  estimateCost(inputs: Record<string, any>): number;
}

/**
 * Model Selection for Generator Nodes
 * Allows runtime model swapping
 */
export interface ModelSelection {
  /** Model provider/name */
  model: string;

  /** Model-specific parameters */
  parameters?: Record<string, any>;
}

/**
 * Image Generator Models
 */
export type ImageGeneratorModel =
  | 'nanobana'        // Gemini 2.5 Flash Image ($0.02/image)
  | 'midjourney'      // Midjourney API ($0.08/image)
  | 'dalle3'          // DALL-E 3 HD ($0.08/image)
  | 'imagen3'         // Google Imagen 3 ($0.08/image)
  | 'imagen4';        // Google Imagen 4 ($0.08/image)

/**
 * Video Generator Models
 */
export type VideoGeneratorModel =
  | 'veo3'            // VEO3 Standard ($1.20/4s)
  | 'veo3-fast'       // VEO3 Fast (lower quality, faster)
  | 'sora-2'          // Sora 2 (future integration)
  | 'sora-2.2';       // Sora 2.2 (future integration)

/**
 * Node Registry Entry
 * Metadata for registering node types
 */
export interface NodeRegistryEntry {
  /** Node type identifier */
  type: NodeType;

  /** Node class constructor */
  nodeClass: new (config: NodeConfig) => INode;

  /** Human-readable name */
  displayName: string;

  /** Description */
  description: string;

  /** Category for organization */
  category: 'input' | 'processing' | 'output' | 'enhancement';

  /** Default configuration */
  defaultConfig: Partial<NodeConfig>;
}
