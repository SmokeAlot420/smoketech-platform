/**
 * Test Client for ComfyUI Temporal Workflow
 *
 * Loads a workflow JSON template and executes it via Temporal.
 */

import { Connection, Client } from '@temporalio/client';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowValidator } from '../comfyui/WorkflowValidator.js';
import type { WorkflowConfig } from '../comfyui/types/WorkflowConfig.js';
import type {
  ComfyUIWorkflowInput,
  ComfyUIWorkflowResult
} from './workflows/comfyUIWorkflow.js';

async function loadWorkflowTemplate(filename: string): Promise<WorkflowConfig> {
  const filePath = path.join(process.cwd(), 'workflows', filename);
  const jsonContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonContent) as WorkflowConfig;
}

async function main() {
  console.log('🚀 ComfyUI Temporal Workflow Test Client\n');
  console.log('='.repeat(80));

  // Load workflow template
  const templateFile = 'single-video-template.json';
  console.log(`📄 Loading workflow template: ${templateFile}`);
  const workflow = await loadWorkflowTemplate(templateFile);

  console.log(`   Workflow: ${workflow.name} (${workflow.id})`);
  console.log(`   Description: ${workflow.description}`);
  console.log(`   Nodes: ${workflow.nodes.length}`);
  console.log(`   Estimated cost: $${workflow.metadata?.estimatedCost?.toFixed(4) || 'N/A'}`);
  console.log(`   Estimated duration: ${workflow.metadata?.estimatedDuration || 'N/A'}s\n`);

  // Build execution graph (topological order)
  console.log('🔍 Building execution graph...');
  const graph = WorkflowValidator.buildGraph(workflow);
  console.log(`✅ Execution order: ${graph.executionOrder.join(' → ')}\n`);

  // Prepare workflow inputs
  const workflowInputs: ComfyUIWorkflowInput = {
    workflow,
    executionOrder: graph.executionOrder,
    inputs: {
      characterPrompt: 'Professional female business consultant, 28-32 years old, warm smile, confident posture, modern office background, natural lighting, ultra-photorealistic',
      videoPrompt: 'Business consultant explaining quarterly financial projections with confident hand gestures, warm engaging smile, professional setting, 8 seconds'
    }
  };

  console.log('📋 Workflow Inputs:');
  console.log(`   characterPrompt: ${workflowInputs.inputs.characterPrompt.substring(0, 80)}...`);
  console.log(`   videoPrompt: ${workflowInputs.inputs.videoPrompt.substring(0, 80)}...\n`);

  // Connect to Temporal
  console.log('🔌 Connecting to Temporal server...');
  const connection = await Connection.connect({
    address: 'localhost:7233'
  });

  const client = new Client({
    connection
  });

  console.log('✅ Connected to Temporal server\n');

  // Start workflow
  const workflowId = `comfyui-test-${Date.now()}`;
  console.log(`🎬 Starting workflow: ${workflowId}`);
  console.log('='.repeat(80));

  const handle = await client.workflow.start('comfyUIWorkflow', {
    workflowId,
    taskQueue: 'comfyui-test-queue',
    args: [workflowInputs]
  });

  console.log(`✅ Workflow started successfully`);
  console.log(`   Workflow ID: ${workflowId}`);
  console.log(`   Run ID: ${handle.firstExecutionRunId}\n`);

  // Monitor progress
  console.log('📊 Monitoring workflow progress...\n');

  const progressInterval = setInterval(async () => {
    try {
      const progress = await handle.query('progress');
      console.log(`[${new Date().toLocaleTimeString()}] Stage: ${progress.currentStage}`);
      console.log(`   Progress: ${progress.overallProgress}% (${progress.nodesCompleted}/${progress.totalNodes} nodes)`);
      console.log(`   Current node: ${progress.currentNodeId || 'None'}`);
      console.log(`   Total cost so far: $${progress.totalCost.toFixed(4)}\n`);
    } catch (error) {
      // Workflow might have completed
      clearInterval(progressInterval);
    }
  }, 5000);

  // Wait for workflow to complete
  console.log('⏳ Waiting for workflow to complete...\n');

  try {
    const result: ComfyUIWorkflowResult = await handle.result();

    clearInterval(progressInterval);

    console.log('='.repeat(80));
    console.log('🎉 WORKFLOW COMPLETED SUCCESSFULLY!\n');

    console.log('📊 Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Total cost: $${result.totalCost.toFixed(4)}`);
    console.log(`   Total time: ${(result.totalTime / 1000).toFixed(1)}s`);
    console.log(`   Nodes executed: ${result.nodeResults.size}\n`);

    console.log('📤 Outputs:');
    for (const [key, value] of Object.entries(result.outputs)) {
      console.log(`   ${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
    }

    console.log('\n💰 Node Cost Breakdown:');
    for (const [nodeId, nodeResult] of result.nodeResults.entries()) {
      console.log(`   ${nodeId}:`);
      console.log(`      Success: ${nodeResult.success ? '✅' : '❌'}`);
      console.log(`      Cost: $${nodeResult.cost.toFixed(4)}`);
      console.log(`      Time: ${(nodeResult.executionTime / 1000).toFixed(1)}s`);
      if (nodeResult.error) {
        console.log(`      Error: ${nodeResult.error}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test completed successfully!');

  } catch (error) {
    clearInterval(progressInterval);

    console.log('='.repeat(80));
    console.log('❌ WORKFLOW FAILED\n');
    console.error('Error:', error instanceof Error ? error.message : String(error));

    // Try to get final state
    try {
      const progress = await handle.query('progress');
      console.log('\n📊 Final State:');
      console.log(`   Stage: ${progress.currentStage}`);
      console.log(`   Progress: ${progress.overallProgress}%`);
      console.log(`   Nodes completed: ${progress.nodesCompleted}/${progress.totalNodes}`);
      console.log(`   Total cost: $${progress.totalCost.toFixed(4)}`);
      if (progress.error) {
        console.log(`   Error: ${progress.error}`);
      }
    } catch (queryError) {
      console.log('   Could not query final state');
    }

    console.log('\n' + '='.repeat(80));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
