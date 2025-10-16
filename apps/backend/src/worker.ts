import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

async function run() {
  try {
    console.log('🚀 Starting Temporal Worker...');

    // Create a connection to Temporal server
    const connection = await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      tls: false // Set to true if using TLS in production
    });

    // Create the worker
    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      taskQueue: 'single-video-queue',
      workflowsPath: path.resolve(__dirname, './temporal/workflows'),
      activities,

      // Worker configuration
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,

      // Worker identity (useful for debugging)
      identity: `viral-worker-${process.pid}`,

      // Enable SDK logging
      enableSDKTracing: true,

      // Sticky cache size (for workflow caching)
      stickyQueueScheduleToStartTimeout: '10s',

      // Resource limits
      maxHeartbeatThrottleInterval: '30s',
      defaultHeartbeatThrottleInterval: '30s',
    });

    console.log('✅ Worker created successfully');
    console.log(`📋 Task Queue: single-video-queue`);
    console.log(`🔗 Connected to: ${process.env.TEMPORAL_ADDRESS || 'localhost:7233'}`);
    console.log(`📦 Namespace: ${process.env.TEMPORAL_NAMESPACE || 'default'}`);
    console.log(`🆔 Worker ID: viral-worker-${process.pid}`);

    // Start the worker
    await worker.run();

    console.log('🏃 Worker is running...');
  } catch (err) {
    console.error('❌ Worker failed to start:', err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down worker gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📴 Shutting down worker gracefully...');
  process.exit(0);
});

// Run the worker
run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});