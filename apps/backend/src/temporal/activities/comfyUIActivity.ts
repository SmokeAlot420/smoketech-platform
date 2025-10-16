/**
 * ComfyUI Node Execution Activity
 *
 * Temporal activity for executing individual ComfyUI nodes.
 * Each node execution becomes a checkpointed activity.
 */

import { WorkflowExecutor } from '../../comfyui/WorkflowExecutor.js';
import type { WorkflowConfig } from '../../comfyui/types/WorkflowConfig.js';
import type {
  NodeExecutionResult,
  NodeExecutionContext
} from '../../comfyui/types/NodeConfig.js';

/**
 * Execute a single ComfyUI node
 *
 * This is a Temporal activity that:
 * - Creates a node instance from the workflow config
 * - Executes the node with resolved inputs
 * - Returns the execution result with outputs and cost
 *
 * @param params - Node execution parameters
 * @returns Node execution result
 */
export async function executeComfyUINode(params: {
  workflow: WorkflowConfig;
  nodeId: string;
  nodeInputs: Record<string, any>;
}): Promise<NodeExecutionResult> {
  const { workflow, nodeId, nodeInputs } = params;

  // Find node configuration
  const nodeConfig = workflow.nodes.find((n) => n.id === nodeId);
  if (!nodeConfig) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  console.log(`[Activity] Executing ComfyUI node: ${nodeId} (${nodeConfig.type})`);

  // Create execution context
  const context: NodeExecutionContext = {
    workflowId: workflow.id,
    nodeId,
    logger: {
      info: (msg: string, data?: any) => {
        console.log(`[${nodeId}] INFO: ${msg}`, data || '');
      },
      warn: (msg: string, data?: any) => {
        console.warn(`[${nodeId}] WARN: ${msg}`, data || '');
      },
      error: (msg: string, err?: any) => {
        console.error(`[${nodeId}] ERROR: ${msg}`, err || '');
      }
    },
    costTracker: {
      addCost: (amount: number, description: string) => {
        console.log(`[${nodeId}] 💰 Cost: $${amount.toFixed(4)} - ${description}`);
      },
      getTotalCost: () => 0
    },
    progress: {
      update: (percent: number, message?: string) => {
        console.log(`[${nodeId}] 📊 Progress: ${percent}% ${message || ''}`);
      }
    }
  };

  try {
    // Create node instance using WorkflowExecutor's node registry
    const node = (WorkflowExecutor as any).createNodeInstance(nodeConfig);

    // Validate inputs
    const validationErrors = node.validateInputs(nodeInputs);
    if (validationErrors.length > 0) {
      throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
    }

    // Execute node
    console.log(`[Activity] Node ${nodeId} inputs:`, Object.keys(nodeInputs));
    const result = await node.execute(nodeInputs, context);

    console.log(`[Activity] Node ${nodeId} completed: success=${result.success}, cost=$${result.cost.toFixed(4)}`);

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Activity] Node ${nodeId} failed:`, errorMessage);

    return {
      success: false,
      outputs: {},
      executionTime: 0,
      cost: 0,
      error: errorMessage,
      metadata: {
        nodeId,
        nodeType: nodeConfig.type,
        failed: true
      }
    };
  }
}
