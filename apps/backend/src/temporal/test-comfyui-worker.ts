/**
 * Test Worker for ComfyUI Temporal Workflow
 *
 * Registers the ComfyUI workflow and activities for testing.
 */

import { Worker } from '@temporalio/worker';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as activities from './activities/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Starting ComfyUI Test Worker...\n');

  const worker = await Worker.create({
    workflowsPath: join(__dirname, 'workflows'),
    activities,
    taskQueue: 'comfyui-test-queue',
    maxConcurrentActivityTaskExecutions: 5,
    maxConcurrentWorkflowTaskExecutions: 10
  });

  console.log('✅ Worker registered successfully');
  console.log('📋 Task Queue: comfyui-test-queue');
  console.log('🔧 Workflows: comfyUIWorkflow');
  console.log('⚙️  Activities: executeComfyUINode, veo3Activity, nanoBananaActivity\n');
  console.log('🎯 Worker is ready and waiting for workflows...\n');

  await worker.run();
}

main().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
