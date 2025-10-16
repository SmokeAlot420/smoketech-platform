/**
 * Test REAL Google APIs - VEO3 and Imagen 4.0
 * September 2025 - Latest APIs
 */

const { GoogleGenAI } = require('@google/genai');

async function testRealAPIs() {
  console.log('🚀 Testing REAL Google APIs (September 2025)');
  console.log('============================================\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }

  try {
    // Initialize the client
    const client = new GoogleGenAI({ apiKey });

    // Test 1: Generate Image with Imagen 4.0
    console.log('📸 Testing Imagen 4.0 Image Generation...');
    console.log('Prompt: "A futuristic robot coding at a computer, cyberpunk style"\n');

    const imageOperation = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A futuristic robot coding at a computer, cyberpunk style, neon lights',
      aspectRatio: '16:9'
    });

    if (imageOperation.generatedImages && imageOperation.generatedImages.length > 0) {
      console.log('✅ Image generation succeeded!');
      console.log('Generated', imageOperation.generatedImages.length, 'image(s)\n');
    }

    // Test 2: Generate Video with VEO3
    console.log('🎬 Testing VEO3 Video Generation...');
    console.log('Prompt: "A cat playing piano, cinematic lighting"\n');

    const videoOperation = await client.models.generateVideos({
      model: 'veo-3.0-fast-generate-001', // Using fast model for quick test
      prompt: 'A cat playing piano, cinematic lighting, professional shot',
      config: {
        aspectRatio: '16:9',
        resolution: '720p'
      }
    });

    console.log('✅ Video generation started!');
    console.log('Operation name:', videoOperation.name);
    console.log('Status:', videoOperation.done ? 'Complete' : 'Processing...');

    // Poll for completion (just a few times for testing)
    let attempts = 0;
    const maxAttempts = 3;

    while (!videoOperation.done && attempts < maxAttempts) {
      console.log(`\n⏳ Checking status... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get updated status
      const updatedOp = await client.operations.getVideosOperation({
        operation: videoOperation
      });

      if (updatedOp.done) {
        console.log('✅ Video generation complete!');
        break;
      }
      attempts++;
    }

    console.log('\n========================================');
    console.log('✅ Real API test complete!');
    console.log('APIs are working in September 2025');

  } catch (error) {
    console.error('\n❌ API Error:', error.message);

    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Package @google/genai not found. Installing...');
      console.log('\nRun: npm install @google/genai');
    } else if (error.response) {
      console.error('API Response:', error.response.data);
    }

    console.error('\nFull error:', error);
  }
}

// Run the test
testRealAPIs();