const Replicate = require('replicate');
require('dotenv').config();

async function testReplicateAPI() {
  console.log('\n🔍 Testing Replicate API Connection\n');

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // Test with a simple, fast model first
    console.log('Testing with stability-ai/sdxl model...');

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "A simple test image of a cat",
          width: 512,
          height: 512,
          num_outputs: 1
        }
      }
    );

    console.log('✅ API Connection successful!');
    console.log('Output:', output);

  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testReplicateAPI();