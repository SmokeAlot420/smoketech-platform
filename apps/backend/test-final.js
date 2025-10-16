/**
 * Final test - Simple and direct
 */

const { Connection, Client } = require('@temporalio/client');
const { nanoid } = require('nanoid');

async function runFinalTest() {
  console.log('🚀 FINAL TEST - Ultra-Enhanced Content Generation');
  console.log('==============================================\n');

  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection, namespace: 'default' });

  const workflowInput = {
    personas: [{
      id: 'test_1',
      name: 'Tech Guru',
      age: 25,
      personality: 'energetic',
      style: 'modern',
      tone: 'enthusiastic'
    }],
    viralSeries: [{
      id: 'series_1',
      name: 'Quick Tech Tips',
      theme: 'productivity',
      format: 'short video',
      template: { hook: 'Amazing tech trick', style: 'fast-paced' }
    }],
    batchSize: 1,
    targetPlatforms: [
      { name: 'tiktok', accounts: [] }
    ],
    platforms: ['tiktok'],
    viralThreshold: 50,
    useEnhancedMode: true,
    generateVariations: true,
    costMode: 'fast'
  };

  console.log('Starting workflow with:');
  console.log('- Enhanced Mode: ON');
  console.log('- Variations: ON');
  console.log('- Cost Mode: Fast\n');

  const handle = await client.workflow.start('viralContentPipeline', {
    taskQueue: 'viral-content-queue',
    workflowId: `final-test-${nanoid()}`,
    args: [workflowInput],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}\n`);

  // Wait and check status
  console.log('⏳ Waiting 20 seconds...\n');
  await new Promise(r => setTimeout(r, 20000));

  const status = await handle.query('getStatus');
  console.log('📊 Status:', JSON.stringify(status, null, 2));

  // Cancel workflow
  await handle.signal('cancel', { reason: 'Test complete' });
  console.log('\n✅ Test complete! Check worker logs for details.');

  process.exit(0);
}

runFinalTest().catch(console.error);