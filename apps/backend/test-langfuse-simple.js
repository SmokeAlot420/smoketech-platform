require('dotenv').config();
const { Langfuse } = require('langfuse');

async function testLangfuse() {
  console.log('Testing Langfuse connection...\n');

  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: process.env.LANGFUSE_HOST  // Use baseUrl instead of host
  });

  // Create a simple trace
  const trace = langfuse.trace({
    name: 'test-trace',
    userId: 'test-user',
    metadata: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });

  // Add a generation to the trace
  trace.generation({
    name: 'test-generation',
    model: 'imagegeneration@006',
    input: { prompt: 'Test prompt for NanoBanana' },
    output: { status: 'success', imageCount: 1 },
    metadata: {
      cost: 0.020,
      duration: 1500
    }
  });

  // Flush and shutdown
  await langfuse.flushAsync();
  await langfuse.shutdownAsync();

  console.log('✅ Test complete! Check http://localhost:3030 for the trace.');
}

testLangfuse().catch(console.error);