/**
 * TEST IMAGEN 3.0 CAPABILITY - Test if we can access the newer model
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

const PROJECT_ID = 'viral-ai-content-12345';
const LOCATION = 'us-central1';

async function testImagen3Capability() {
  console.log('\n🔬 TESTING IMAGEN-3.0-CAPABILITY-001 ACCESS\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error('Failed to get access token');
    }

    console.log('✅ Authentication successful\n');

    // Test 1: Try imagegeneration@006 first (we know this works)
    console.log('📝 Test 1: imagegeneration@006 (Original NanoBanana)\n');

    const endpoint006 = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;

    const request006 = {
      instances: [{
        prompt: "A simple test image of a red circle on white background"
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
      }
    };

    try {
      const response = await axios.post(endpoint006, request006, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.predictions && response.data.predictions.length > 0) {
        console.log('✅ imagegeneration@006 WORKS!');
        console.log('   Response contains image data\n');
      }
    } catch (error) {
      console.log('❌ imagegeneration@006 failed:', error.response?.status, error.response?.data?.error?.message || error.message);
    }

    // Wait before next request
    console.log('⏳ Waiting 30 seconds for rate limit...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test 2: Try imagen-3.0-capability-001
    console.log('📝 Test 2: imagen-3.0-capability-001 (Enhanced NanoBanana)\n');

    const endpointImagen3 = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-capability-001:predict`;

    const requestImagen3 = {
      instances: [{
        prompt: "A simple test image of a blue square on white background"
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult"
      }
    };

    try {
      const response = await axios.post(endpointImagen3, requestImagen3, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.predictions && response.data.predictions.length > 0) {
        console.log('✅ imagen-3.0-capability-001 WORKS!');
        console.log('   This model is available for character consistency!\n');

        // Save the test image to verify
        const imageBuffer = Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
        const outputPath = path.join(process.cwd(), 'test-imagen3-output.png');
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`   Test image saved to: ${outputPath}\n`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ imagen-3.0-capability-001 NOT FOUND');
        console.log('   This model is not available in your project\n');
      } else if (error.response?.status === 403) {
        console.log('❌ imagen-3.0-capability-001 ACCESS DENIED');
        console.log('   You may need to request access or enable this model\n');
      } else {
        console.log('❌ imagen-3.0-capability-001 failed:', error.response?.status);
        console.log('   Error:', error.response?.data?.error?.message || error.message, '\n');
      }
    }

    // Wait before next request
    console.log('⏳ Waiting 30 seconds for rate limit...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test 3: Try other possible model names
    console.log('📝 Test 3: Checking other possible model variants\n');

    const otherModels = [
      'imagen-3.0-generate-001',
      'imagen-3.0-fast-generate-001',
      'imagegeneration@005',
      'imagegeneration@007'
    ];

    for (const modelName of otherModels) {
      console.log(`🔍 Testing: ${modelName}`);

      const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelName}:predict`;

      try {
        const response = await axios.post(endpoint, {
          instances: [{ prompt: "test" }],
          parameters: { sampleCount: 1 }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.predictions) {
          console.log(`   ✅ ${modelName} is AVAILABLE!\n`);

          // Wait between requests
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ Not found`);
        } else if (error.response?.status === 429) {
          console.log(`   ⏰ Rate limit hit`);
        } else {
          console.log(`   ❌ Error: ${error.response?.status || 'Unknown'}`);
        }
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 SUMMARY\n');
    console.log('imagegeneration@006: The original NanoBanana that we know works');
    console.log('imagen-3.0-capability-001: Enhanced version - check results above');
    console.log('\nUse whichever model shows ✅ WORKS above!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }
}

// Run the test
console.log('🔑 Using credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
testImagen3Capability();