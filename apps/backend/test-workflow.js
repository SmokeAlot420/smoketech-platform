const { Client, Connection } = require('@temporalio/client');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function testWorkflow() {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  const workflowId = `test-workflow-${uuidv4()}`;

  console.log('Starting test workflow:', workflowId);

  const handle = await client.workflow.start('viralContentPipeline', {
    taskQueue: 'viral-content-queue',
    args: [{
      personas: [{ id: 'test-1', name: 'Test Persona', age: 25, personality: 'energetic' }],
      viralSeries: [{ id: 'series-1', name: 'Test Series', template: { hook: 'Test hook' } }],
      targetPlatforms: [{ name: 'tiktok', accounts: [{ id: 'test', username: 'test', status: 'active' }] }],
      batchSize: 1,
      viralThreshold: 70,
    }],
    workflowId,
  });

  console.log('Workflow started!');

  setTimeout(async () => {
    const result = await handle.query('getStatus');
    console.log('Status:', result);
    await connection.close();
    process.exit(0);
  }, 5000);
}

testWorkflow().catch(console.error);