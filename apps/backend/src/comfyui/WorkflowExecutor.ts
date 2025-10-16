/**
 * Workflow Executor
 *
 * Executes ComfyUI-style workflows by processing nodes in topological order
 * Manages node registry and handles input/output resolution
 */

import {
  INode,
  NodeConfig,
  NodeExecutionContext,
  NodeExecutionResult,
  NodeType
} from './types/NodeConfig.js';
import {
  WorkflowConfig,
  WorkflowExecutionResult,
  WorkflowGraph
} from './types/WorkflowConfig.js';
import { WorkflowValidator } from './WorkflowValidator.js';
import { ImageGeneratorNode } from './nodes/ImageGeneratorNode.js';
import { VideoGeneratorNode } from './nodes/VideoGeneratorNode.js';

/**
 * Node Factory Function
 * Creates a node instance from configuration
 */
export type NodeFactory = (config: NodeConfig) => INode;

/**
 * Node Registry Entry
 */
export interface NodeRegistryEntry {
  type: NodeType;
  factory: NodeFactory;
  displayName: string;
  description: string;
  category: 'input' | 'processing' | 'output' | 'utility';
}

/**
 * Workflow Executor
 * Executes node-based workflows with proper dependency resolution
 */
export class WorkflowExecutor {
  private static nodeRegistry: Map<NodeType, NodeRegistryEntry> = new Map();

  /**
   * Initialize default node registry
   */
  static {
    // Register built-in nodes
    this.registerNode({
      type: 'image_generator',
      factory: (config) => new ImageGeneratorNode(config),
      displayName: 'Image Generator',
      description: 'Generate images with multiple AI models',
      category: 'processing'
    });

    this.registerNode({
      type: 'video_generator',
      factory: (config) => new VideoGeneratorNode(config),
      displayName: 'Video Generator',
      description: 'Generate videos with multiple AI models',
      category: 'processing'
    });

    // Placeholder for future nodes
    // TODO: Add prompt_enhancer, video_stitcher, video_enhancer, etc.
  }

  /**
   * Register a new node type
   */
  static registerNode(entry: NodeRegistryEntry): void {
    if (this.nodeRegistry.has(entry.type)) {
      throw new Error(`Node type '${entry.type}' is already registered`);
    }
    this.nodeRegistry.set(entry.type, entry);
  }

  /**
   * Get registered node types
   */
  static getRegisteredNodes(): NodeRegistryEntry[] {
    return Array.from(this.nodeRegistry.values());
  }

  /**
   * Check if node type is registered
   */
  static isNodeRegistered(type: NodeType): boolean {
    return this.nodeRegistry.has(type);
  }

  /**
   * Create node instance from config
   */
  private static createNodeInstance(config: NodeConfig): INode {
    const entry = this.nodeRegistry.get(config.type);
    if (!entry) {
      throw new Error(`Node type '${config.type}' is not registered. Available types: ${Array.from(this.nodeRegistry.keys()).join(', ')}`);
    }
    return entry.factory(config);
  }

  /**
   * Execute a complete workflow
   */
  static async executeWorkflow(
    workflow: WorkflowConfig,
    workflowInputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate workflow
      const validation = WorkflowValidator.validate(workflow);
      if (!validation.valid) {
        return {
          success: false,
          outputs: {},
          executionTime: Date.now() - startTime,
          totalCost: 0,
          error: `Workflow validation failed: ${validation.errors.map((e) => e.message).join('; ')}`,
          nodeResults: new Map()
        };
      }

      // Build execution graph
      const graph = WorkflowValidator.buildGraph(workflow);

      // Execute nodes in topological order
      const nodeResults = new Map<string, NodeExecutionResult>();
      const nodeOutputs = new Map<string, Record<string, any>>();
      let totalCost = 0;

      context.logger.info(`Executing workflow: ${workflow.name} (${workflow.nodes.length} nodes)`);

      for (const nodeId of graph.executionOrder) {
        const nodeConfig = graph.nodes.get(nodeId)!;

        context.logger.info(`Executing node: ${nodeId} (${nodeConfig.type})`);

        // Create node instance
        const node = this.createNodeInstance(nodeConfig);

        // Resolve inputs from workflow inputs and previous node outputs
        const nodeInputs = this.resolveNodeInputs(
          nodeId,
          workflow,
          workflowInputs,
          nodeOutputs
        );

        // Execute node
        const nodeContext: NodeExecutionContext = {
          ...context,
          nodeId,
          workflowId: workflow.id
        };

        const result = await node.execute(nodeInputs, nodeContext);

        // Store result
        nodeResults.set(nodeId, result);

        if (result.success) {
          nodeOutputs.set(nodeId, result.outputs);
          totalCost += result.cost;
          context.logger.info(`Node ${nodeId} completed successfully (cost: $${result.cost.toFixed(4)})`);
        } else {
          // Node failed - stop workflow execution
          context.logger.error(`Node ${nodeId} failed: ${result.error}`);
          return {
            success: false,
            outputs: {},
            executionTime: Date.now() - startTime,
            totalCost,
            error: `Node ${nodeId} failed: ${result.error}`,
            nodeResults
          };
        }
      }

      // Collect workflow outputs
      const workflowOutputs = this.collectWorkflowOutputs(
        workflow,
        nodeOutputs
      );

      const executionTime = Date.now() - startTime;

      context.logger.info(`Workflow completed successfully in ${(executionTime / 1000).toFixed(2)}s (total cost: $${totalCost.toFixed(4)})`);

      return {
        success: true,
        outputs: workflowOutputs,
        executionTime,
        totalCost,
        nodeResults,
        metadata: {
          workflowId: workflow.id,
          workflowName: workflow.name,
          nodeCount: workflow.nodes.length,
          executionMode: workflow.executionMode
        }
      };
    } catch (error) {
      context.logger.error('Workflow execution failed', error);
      return {
        success: false,
        outputs: {},
        executionTime: Date.now() - startTime,
        totalCost: 0,
        error: error instanceof Error ? error.message : String(error),
        nodeResults: new Map()
      };
    }
  }

  /**
   * Resolve inputs for a specific node
   */
  private static resolveNodeInputs(
    nodeId: string,
    workflow: WorkflowConfig,
    workflowInputs: Record<string, any>,
    nodeOutputs: Map<string, Record<string, any>>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    // Find connections targeting this node
    const incomingConnections = workflow.connections.filter(
      (conn) => conn.targetNodeId === nodeId
    );

    // Resolve each connection
    for (const conn of incomingConnections) {
      const sourceOutputs = nodeOutputs.get(conn.sourceNodeId);
      if (!sourceOutputs) {
        throw new Error(`Node ${nodeId} depends on ${conn.sourceNodeId}, but no outputs found`);
      }

      const value = sourceOutputs[conn.sourceSlot];
      if (value === undefined) {
        throw new Error(`Node ${conn.sourceNodeId} has no output slot '${conn.sourceSlot}'`);
      }

      inputs[conn.targetSlot] = value;
    }

    // Add workflow-level inputs
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (node) {
      for (const inputSlot of node.inputs) {
        // Workflow inputs take precedence if not already set by connections
        if (inputs[inputSlot.name] === undefined) {
          const workflowInput = workflow.inputs.find((wi) => wi.targetNodeId === nodeId && wi.targetSlot === inputSlot.name);
          if (workflowInput && workflowInputs[workflowInput.name] !== undefined) {
            inputs[inputSlot.name] = workflowInputs[workflowInput.name];
          }
        }
      }
    }

    return inputs;
  }

  /**
   * Collect outputs from exit nodes
   */
  private static collectWorkflowOutputs(
    workflow: WorkflowConfig,
    nodeOutputs: Map<string, Record<string, any>>
  ): Record<string, any> {
    const outputs: Record<string, any> = {};

    for (const outputDef of workflow.outputs) {
      const nodeOutput = nodeOutputs.get(outputDef.sourceNodeId);
      if (nodeOutput) {
        const value = nodeOutput[outputDef.sourceSlot];
        if (value !== undefined) {
          outputs[outputDef.name] = value;
        }
      }
    }

    return outputs;
  }

  /**
   * Estimate total workflow cost
   */
  static estimateWorkflowCost(
    workflow: WorkflowConfig,
    inputs: Record<string, any>
  ): number {
    let totalCost = 0;

    for (const nodeConfig of workflow.nodes) {
      try {
        const node = this.createNodeInstance(nodeConfig);
        totalCost += node.estimateCost(inputs);
      } catch (error) {
        // Skip unregistered nodes
        console.warn(`Cannot estimate cost for node ${nodeConfig.id}: ${error}`);
      }
    }

    return totalCost;
  }

  /**
   * Dry run validation (doesn't execute, just validates)
   */
  static validateWorkflow(workflow: WorkflowConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimatedCost: number;
  } {
    const validation = WorkflowValidator.validate(workflow);
    const estimatedCost = this.estimateWorkflowCost(workflow, {});

    return {
      valid: validation.valid,
      errors: validation.errors.map((e) => e.message),
      warnings: validation.warnings.map((w) => w.message),
      estimatedCost
    };
  }
}
