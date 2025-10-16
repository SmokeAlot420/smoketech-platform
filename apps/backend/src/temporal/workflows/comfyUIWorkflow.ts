/**
 * ComfyUI Workflow - Temporal Integration
 *
 * Executes ComfyUI-style workflows using Temporal for orchestration.
 *
 * Features:
 * - Accepts workflow JSON as input
 * - Executes each node as Temporal activity with checkpointing
 * - Supports pause/resume/cancel signals
 * - Handles node failures with automatic retries
 * - Tracks progress and costs across all nodes
 * - Maintains workflow state for crash recovery
 */

import {
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  proxyActivities,
  ApplicationFailure
} from '@temporalio/workflow';

import type { WorkflowConfig } from '../../comfyui/types/WorkflowConfig.js';
import type { NodeExecutionResult } from '../../comfyui/types/NodeConfig.js';

/**
 * Workflow input
 */
export interface ComfyUIWorkflowInput {
  /** Workflow configuration (JSON) */
  workflow: WorkflowConfig;

  /** Input values for workflow-level inputs */
  inputs: Record<string, any>;

  /** Execution order (topologically sorted node IDs) */
  executionOrder: string[];

  /** Optional: Continue from specific node (for resume) */
  resumeFromNode?: string;
}

/**
 * Per-node execution result
 */
export interface NodeResult {
  nodeId: string;
  success: boolean;
  outputs: Record<string, any>;
  cost: number;
  executionTime: number;
  error?: string;
}

/**
 * Workflow progress state
 */
export interface ComfyUIWorkflowProgress {
  currentStage: 'initializing' | 'executing' | 'complete' | 'failed';
  currentNodeId?: string;
  currentNodeIndex: number;
  totalNodes: number;
  nodesCompleted: number;
  overallProgress: number; // 0-100
  totalCost: number;
  nodeResults: Map<string, NodeResult>;
  error?: string;
}

/**
 * Workflow result
 */
export interface ComfyUIWorkflowResult {
  success: boolean;
  outputs: Record<string, any>;
  totalCost: number;
  totalTime: number;
  nodeResults: Map<string, NodeResult>;
  error?: string;
}

// Activity interface for node execution
interface ComfyUIActivities {
  executeComfyUINode: (params: {
    workflow: WorkflowConfig;
    nodeId: string;
    nodeInputs: Record<string, any>;
  }) => Promise<NodeExecutionResult>;
}

// Signals for workflow control
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');
export const cancelSignal = defineSignal('cancel');

// Queries for progress tracking
export const progressQuery = defineQuery<ComfyUIWorkflowProgress>('progress');
export const costQuery = defineQuery<number>('totalCost');
export const statusQuery = defineQuery<string>('status');

/**
 * ComfyUI Workflow
 *
 * Executes a ComfyUI-style workflow with Temporal orchestration.
 *
 * @param input - Workflow configuration and inputs
 * @returns Result with outputs and execution metrics
 */
export async function comfyUIWorkflow(
  input: ComfyUIWorkflowInput
): Promise<ComfyUIWorkflowResult> {
  // Workflow state (persisted across crashes)
  let isPaused = false;
  let isCancelled = false;

  const progress: ComfyUIWorkflowProgress = {
    currentStage: 'initializing',
    currentNodeIndex: 0,
    totalNodes: input.workflow.nodes.length,
    nodesCompleted: 0,
    overallProgress: 0,
    totalCost: 0,
    nodeResults: new Map()
  };

  const startTime = Date.now();

  // Configure activities with appropriate timeouts
  const { executeComfyUINode } = proxyActivities<ComfyUIActivities>({
    startToCloseTimeout: '30 minutes',
    retry: {
      initialInterval: '10 seconds',
      maximumAttempts: 3,
      backoffCoefficient: 2.0,
      nonRetryableErrorTypes: ['ApplicationFailure']
    }
  });

  // Signal handlers
  setHandler(pauseSignal, () => {
    console.log('⏸️  [ComfyUI Workflow] Pause signal received');
    isPaused = true;
  });

  setHandler(resumeSignal, () => {
    console.log('▶️  [ComfyUI Workflow] Resume signal received');
    isPaused = false;
  });

  setHandler(cancelSignal, () => {
    console.log('🛑 [ComfyUI Workflow] Cancel signal received');
    isCancelled = true;
  });

  // Query handlers
  setHandler(progressQuery, () => progress);
  setHandler(costQuery, () => progress.totalCost);
  setHandler(statusQuery, () => progress.currentStage);

  try {
    console.log('🚀 [ComfyUI Workflow] Starting workflow execution');
    console.log(`📋 [ComfyUI Workflow] Workflow: ${input.workflow.name} (${input.workflow.id})`);
    console.log(`🔢 [ComfyUI Workflow] Total nodes: ${input.workflow.nodes.length}`);
    console.log(`📊 [ComfyUI Workflow] Execution order: ${input.executionOrder.join(' → ')}`);

    progress.currentStage = 'executing';

    // Track node outputs for connection resolution
    const nodeOutputs = new Map<string, Record<string, any>>();

    // Execute nodes in topological order
    for (let i = 0; i < input.executionOrder.length; i++) {
      const nodeId = input.executionOrder[i];

      // Skip if resuming from a later node
      if (input.resumeFromNode && nodeId !== input.resumeFromNode) {
        const resumeIndex = input.executionOrder.indexOf(input.resumeFromNode);
        if (i < resumeIndex) {
          console.log(`⏭️  [ComfyUI Workflow] Skipping node ${nodeId} (resuming from ${input.resumeFromNode})`);
          continue;
        }
      }

      // Check for pause/cancel before each node
      await condition(() => !isPaused);
      if (isCancelled) {
        throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
      }

      progress.currentNodeId = nodeId;
      progress.currentNodeIndex = i;
      progress.overallProgress = Math.round((i / input.executionOrder.length) * 100);

      const nodeConfig = input.workflow.nodes.find(n => n.id === nodeId)!;
      console.log(`\n🔷 [ComfyUI Workflow] Executing node ${i + 1}/${input.executionOrder.length}: ${nodeId} (${nodeConfig.type})`);

      // Resolve inputs for this node
      const nodeInputs = resolveNodeInputs(
        nodeId,
        input.workflow,
        input.inputs,
        nodeOutputs
      );

      console.log(`   Inputs: ${Object.keys(nodeInputs).join(', ')}`);

      // Execute node as Temporal activity (with checkpoint)
      const nodeStartTime = Date.now();

      try {
        const result = await executeComfyUINode({
          workflow: input.workflow,
          nodeId,
          nodeInputs
        });

        const nodeTime = Date.now() - nodeStartTime;

        // Store result
        const nodeResult: NodeResult = {
          nodeId,
          success: result.success,
          outputs: result.outputs,
          cost: result.cost,
          executionTime: nodeTime
        };

        progress.nodeResults.set(nodeId, nodeResult);

        if (result.success) {
          nodeOutputs.set(nodeId, result.outputs);
          progress.totalCost += result.cost;
          progress.nodesCompleted++;

          console.log(`   ✅ Node ${nodeId} completed successfully`);
          console.log(`   💰 Cost: $${result.cost.toFixed(4)}`);
          console.log(`   ⏱️  Time: ${(nodeTime / 1000).toFixed(1)}s`);
          console.log(`   📤 Outputs: ${Object.keys(result.outputs).join(', ')}`);
        } else {
          // Node failed - stop workflow
          console.error(`   ❌ Node ${nodeId} failed: ${result.error}`);
          throw ApplicationFailure.create({
            message: `Node ${nodeId} failed: ${result.error}`,
            nonRetryable: true
          });
        }

      } catch (error) {
        const nodeTime = Date.now() - nodeStartTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`   ❌ Node ${nodeId} execution error: ${errorMessage}`);

        progress.nodeResults.set(nodeId, {
          nodeId,
          success: false,
          outputs: {},
          cost: 0,
          executionTime: nodeTime,
          error: errorMessage
        });

        throw error;
      }
    }

    // Collect workflow outputs
    const workflowOutputs = collectWorkflowOutputs(
      input.workflow,
      nodeOutputs
    );

    progress.currentStage = 'complete';
    progress.overallProgress = 100;

    const totalTime = Date.now() - startTime;

    console.log('\n🎉 [ComfyUI Workflow] Workflow completed successfully!');
    console.log(`💰 [ComfyUI Workflow] Total cost: $${progress.totalCost.toFixed(4)}`);
    console.log(`⏱️  [ComfyUI Workflow] Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`📤 [ComfyUI Workflow] Outputs: ${Object.keys(workflowOutputs).join(', ')}`);

    return {
      success: true,
      outputs: workflowOutputs,
      totalCost: progress.totalCost,
      totalTime,
      nodeResults: progress.nodeResults
    };

  } catch (error) {
    progress.currentStage = 'failed';
    progress.error = error instanceof Error ? error.message : String(error);

    console.error('❌ [ComfyUI Workflow] Workflow execution failed');
    console.error('Error:', progress.error);

    const totalTime = Date.now() - startTime;

    return {
      success: false,
      outputs: {},
      totalCost: progress.totalCost,
      totalTime,
      error: progress.error,
      nodeResults: progress.nodeResults
    };
  }
}

/**
 * Resolve inputs for a specific node
 */
function resolveNodeInputs(
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
        const workflowInput = workflow.inputs.find(
          (wi) => wi.targetNodeId === nodeId && wi.targetSlot === inputSlot.name
        );
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
function collectWorkflowOutputs(
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
