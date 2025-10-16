import { Client, Connection, WorkflowIdReusePolicy } from '@temporalio/client';
import { viralContentPipeline } from './orchestrator';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Load configuration files
const personasConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/personas.json'), 'utf-8')
);
const viralSeriesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/viral-series.json'), 'utf-8')
);

async function startWorkflow() {
  // Connect to Temporal
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  // Prepare workflow input
  const workflowInput = {
    personas: personasConfig.personas.slice(0, 3), // Start with first 3 personas
    viralSeries: viralSeriesConfig.viralSeries.slice(0, 3), // Start with first 3 series
    targetPlatforms: [
      {
        name: 'tiktok' as const,
        accounts: [
          {
            id: 'tiktok-account-1',
            username: 'viral_ai_1',
            status: 'active' as const,
          },
        ],
      },
      {
        name: 'instagram' as const,
        accounts: [
          {
            id: 'instagram-account-1',
            username: 'viral_ai_1',
            status: 'active' as const,
          },
        ],
      },
    ],
    batchSize: 5, // Start conservative
    viralThreshold: 70, // Viral score threshold
  };

  // Generate workflow ID
  const workflowId = `viral-pipeline-${uuidv4()}`;

  console.log('🎬 Starting Viral Content Pipeline');
  console.log(`📋 Workflow ID: ${workflowId}`);
  console.log(`👥 Active Personas: ${workflowInput.personas.length}`);
  console.log(`📹 Viral Series: ${workflowInput.viralSeries.length}`);
  console.log(`📱 Target Platforms: ${workflowInput.targetPlatforms.map(p => p.name).join(', ')}`);
  console.log(`📦 Batch Size: ${workflowInput.batchSize}`);
  console.log(`🎯 Viral Threshold: ${workflowInput.viralThreshold}`);

  // Start the workflow
  const handle = await client.workflow.start(viralContentPipeline, {
    taskQueue: 'viral-content-queue',
    args: [workflowInput],
    workflowId,
    workflowIdReusePolicy: WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY,

    // Workflow execution timeout (30 days for continuous operation)
    workflowExecutionTimeout: '30 days',

    // Workflow run timeout (24 hours per run)
    workflowRunTimeout: '24 hours',

    // Retry policy for workflow
    retry: {
      initialInterval: '1 minute',
      backoffCoefficient: 2,
      maximumInterval: '1 hour',
      maximumAttempts: 10,
    },
  });

  console.log(`\n✅ Workflow started successfully!`);
  console.log(`🔗 View in Temporal UI: http://localhost:8233/namespaces/default/workflows/${workflowId}`);

  // Commands to interact with the workflow
  console.log('\n📝 Useful commands:');
  console.log(`\n  Query metrics:`);
  console.log(`  temporal workflow query --workflow-id ${workflowId} --name getMetrics`);
  console.log(`\n  Query status:`);
  console.log(`  temporal workflow query --workflow-id ${workflowId} --name getStatus`);
  console.log(`\n  Pause workflow:`);
  console.log(`  temporal workflow signal --workflow-id ${workflowId} --name pause`);
  console.log(`\n  Resume workflow:`);
  console.log(`  temporal workflow signal --workflow-id ${workflowId} --name resume`);
  console.log(`\n  Scale up/down (2x example):`);
  console.log(`  temporal workflow signal --workflow-id ${workflowId} --name scale --input 2.0`);

  // Optional: Wait for initial results
  console.log('\n⏳ Monitoring initial performance (press Ctrl+C to exit)...\n');

  // Poll for metrics every minute
  const pollInterval = setInterval(async () => {
    try {
      const metrics: any = await handle.query('getMetrics');
      const status: any = await handle.query('getStatus');

      console.log('📊 Current Metrics:');
      console.log(`  Videos Generated: ${metrics.totalVideosGenerated}`);
      console.log(`  Total Views: ${metrics.totalViews.toLocaleString()}`);
      console.log(`  Viral Hits: ${metrics.viralHits}`);
      console.log(`  Avg Engagement: ${metrics.averageEngagement.toFixed(2)}%`);
      console.log(`  Revenue: $${metrics.revenue.toFixed(2)}`);
      console.log(`  Costs: $${metrics.costs.toFixed(2)}`);
      console.log(`  ROI: ${((metrics.revenue / metrics.costs - 1) * 100).toFixed(1)}%`);
      console.log(`  Status: ${status.isPaused ? '⏸️ Paused' : '▶️ Running'}`);
      console.log(`  Current Batch: ${status.currentBatch}`);
      console.log('---');
    } catch (error) {
      console.error('Error querying workflow:', error);
    }
  }, 60000); // Poll every minute

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping monitoring (workflow continues running)...');
    clearInterval(pollInterval);
    await connection.close();
    process.exit(0);
  });
}

// Run the starter
startWorkflow().catch((err) => {
  console.error('❌ Failed to start workflow:', err);
  process.exit(1);
});