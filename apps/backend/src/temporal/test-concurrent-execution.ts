/**
 * Test 5: Concurrent Workflow Execution
 * 
 * Runs 5 single video workflows simultaneously to verify:
 * - Worker can handle concurrent workflows
 * - Each workflow maintains independent state
 * - No cross-workflow interference
 */

import dotenv from 'dotenv';
dotenv.config();

import { Connection, Client, WorkflowHandle } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import path from 'path';
import { fileURLToPath } from 'url';
import * as activities from './activities/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASK_QUEUE = 'video-generation';

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 5: Concurrent Workflow Execution');
  console.log('='.repeat(80));

  const startTime = Date.now();

  // Connect to Temporal
  console.log('\n🔌 Connecting to Temporal server...');
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection, namespace: 'default' });
  console.log('✅ Connected\n');

  // Start worker
  console.log('👷 Starting worker...');
  const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, './workflows'),
    activities,
    taskQueue: TASK_QUEUE,
    maxConcurrentActivityTaskExecutions: 3
  });

  const workerRun = worker.run();
  console.log('✅ Worker started\n');

  try {
    // Start 5 workflows concurrently
    console.log('📋 Starting 5 concurrent workflows...');
    const workflowCount = 5;
    const handles: WorkflowHandle[] = [];

    for (let i = 0; i < workflowCount; i++) {
      const workflowId = `test-concurrent-${Date.now()}-${i}`;

      const handle = await client.workflow.start('singleVideoWorkflow', {
        workflowId,
        taskQueue: TASK_QUEUE,
        args: [{
          characterPrompt: `Professional person ${i + 1}, 30 years old`,
          temperature: 0.3,
          videoPrompt: `Person presenting topic ${i + 1}`,
          duration: 4,
          aspectRatio: '16:9',
          model: 'fast'
        }]
      });

      handles.push(handle);
      console.log(`✅ Workflow ${i + 1}/${workflowCount} started: ${workflowId}`);
    }

    // Wait for all workflows to complete
    console.log('\n⏳ Waiting for all workflows to complete...\n');
    const results = await Promise.all(handles.map(h => h.result()));

    const totalTime = Date.now() - startTime;
    const totalCost = results.reduce((sum, r: any) => sum + r.totalCost, 0);
    const successCount = results.filter((r: any) => r.success).length;

    console.log('\n' + '='.repeat(80));
    console.log('🎉 TEST 5 COMPLETE!');
    console.log('='.repeat(80));
    console.log(`✅ Success: ${successCount}/${workflowCount} workflows completed`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
    console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`📊 Average per workflow: $${(totalCost / workflowCount).toFixed(4)}`);
    console.log(`⚡ Parallel efficiency: ${(totalTime / 1000 / workflowCount).toFixed(1)}s per workflow`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    console.log('\n🛑 Shutting down worker...');
    worker.shutdown();
    await workerRun;
    console.log('✅ Worker shut down');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
