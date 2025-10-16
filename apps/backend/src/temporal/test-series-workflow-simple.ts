/**
 * Simple Series Workflow Test
 *
 * Tests the series workflow in isolation (no crash simulation)
 * to debug why it's failing.
 */

import dotenv from 'dotenv';
dotenv.config();

import { Connection, Client } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASK_QUEUE = 'video-generation';

async function main() {
  console.log('🧪 Simple Series Workflow Test\n');

  // Connect to Temporal
  console.log('🔌 Connecting to Temporal server...');
  const connection = await Connection.connect({
    address: 'localhost:7233'
  });

  const client = new Client({
    connection,
    namespace: 'default'
  });
  console.log('✅ Connected\n');

  // Start worker
  console.log('👷 Starting worker...');
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, 'workflows'),
    activities: await import('./activities/index.js'),
    taskQueue: TASK_QUEUE
  });

  const workerRun = worker.run();
  console.log('✅ Worker started\n');

  try {
    // Start series workflow
    const workflowId = `test-series-simple-${Date.now()}`;
    console.log(`🎬 Starting Series Workflow: ${workflowId}`);

    const handle = await client.workflow.start('seriesVideoWorkflow', {
      workflowId,
      taskQueue: TASK_QUEUE,
      args: [{
        characterPrompt: 'Professional presenter, 35 years old, modern studio background',
        temperature: 0.3,
        scenarios: [
          {
            videoPrompt: 'Person explaining concept 1',
            duration: 4,
            aspectRatio: '16:9',
            model: 'fast'
          },
          {
            videoPrompt: 'Person explaining concept 2',
            duration: 4,
            aspectRatio: '16:9',
            model: 'fast'
          }
        ]
      }]
    });

    console.log('✅ Workflow started\n');

    // Monitor progress
    console.log('📊 Monitoring progress...\n');
    let lastProgress = '';

    const progressInterval = setInterval(async () => {
      try {
        const progress = await handle.query('progress');
        const progressStr = `${progress.currentStage} - ${progress.videosGenerated}/${progress.totalVideos} videos`;

        if (progressStr !== lastProgress) {
          console.log(`   ${new Date().toISOString()}: ${progressStr}`);
          lastProgress = progressStr;
        }
      } catch (error) {
        // Ignore query errors during workflow execution
      }
    }, 2000);

    // Wait for result
    console.log('⏳ Waiting for workflow to complete...\n');
    const result = await handle.result();

    clearInterval(progressInterval);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 WORKFLOW COMPLETE!');
    console.log('='.repeat(80));
    console.log(`Success: ${result.success}`);
    console.log(`Character: ${result.characterImagePath}`);
    console.log(`Videos generated: ${result.videos.filter(v => v.success).length}/${result.videos.length}`);
    console.log(`Total cost: $${result.totalCost.toFixed(4)}`);
    console.log(`Total time: ${(result.totalTime / 1000).toFixed(1)}s`);
    console.log('\nVideos:');
    result.videos.forEach((video, idx) => {
      if (video.success) {
        console.log(`  ${idx + 1}. ${video.videoPath} ($${video.cost.toFixed(4)})`);
      } else {
        console.log(`  ${idx + 1}. FAILED - ${video.error}`);
      }
    });

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
