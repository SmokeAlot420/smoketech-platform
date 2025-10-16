/**
 * VERIFY if the API is ACTUALLY generating real content
 * Not just returning success messages
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

async function verifyRealGeneration() {
  console.log('🔍 VERIFYING REAL CONTENT GENERATION');
  console.log('=====================================\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  try {
    const client = new GoogleGenAI({ apiKey });

    // TEST 1: Generate an image and check what we actually get
    console.log('📸 TEST 1: Checking Image Generation Response...\n');

    const imageResponse = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A simple red cube on white background',
      aspectRatio: '1:1'
    });

    console.log('Response type:', typeof imageResponse);
    console.log('Response keys:', Object.keys(imageResponse));
    console.log('Full response structure:', JSON.stringify(imageResponse, null, 2).substring(0, 500));

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      console.log(`\n✅ Got ${imageResponse.generatedImages.length} image(s)`);

      for (let i = 0; i < imageResponse.generatedImages.length; i++) {
        const img = imageResponse.generatedImages[i];
        console.log(`\nImage ${i + 1}:`);
        console.log('- Has image object:', !!img.image);

        if (img.image) {
          console.log('- Image keys:', Object.keys(img.image));

          // Check for actual image data
          if (img.image.imageBytes) {
            const bytes = img.image.imageBytes;
            console.log('- Image bytes type:', typeof bytes);
            console.log('- Image bytes length:', bytes.length);

            if (bytes.length > 0) {
              // Save the image!
              const outputDir = path.join(process.cwd(), 'generated');
              await fs.mkdir(outputDir, { recursive: true });

              const fileName = `imagen-test-${i + 1}.png`;
              const filePath = path.join(outputDir, fileName);

              await fs.writeFile(filePath, Buffer.from(bytes));
              console.log(`✅ SAVED IMAGE TO: ${filePath}`);
              console.log(`📁 Full path: ${path.resolve(filePath)}`);
            } else {
              console.log('❌ Image bytes is empty!');
            }
          } else if (img.image.uri) {
            console.log('- Image URI:', img.image.uri);
          } else {
            console.log('❌ No imageBytes or URI in image object');
          }
        }
      }
    } else {
      console.log('❌ No generated images in response');
    }

    // TEST 2: Start a video and check the response
    console.log('\n\n📹 TEST 2: Checking Video Generation Response...\n');

    const videoResponse = await client.models.generateVideos({
      model: 'veo-3.0-fast-generate-001',
      prompt: 'A red ball bouncing',
      config: {
        aspectRatio: '16:9',
        resolution: '720p'
      }
    });

    console.log('Video response type:', typeof videoResponse);
    console.log('Video response keys:', Object.keys(videoResponse));
    console.log('Operation name:', videoResponse.name);
    console.log('Operation done:', videoResponse.done);

    if (videoResponse.name) {
      console.log('\n✅ Got operation ID:', videoResponse.name);
      console.log('This means the video generation STARTED successfully');

      // Save operation ID for checking
      const opsFile = path.join(process.cwd(), 'generated', 'operations.txt');
      await fs.appendFile(opsFile, `${new Date().toISOString()}: ${videoResponse.name}\n`);
      console.log('Saved operation ID to:', opsFile);
    } else {
      console.log('❌ No operation name in video response');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
    console.error('\nFull error:', error);
  }

  console.log('\n=====================================');
  console.log('Check the generated/ folder for any saved images');
  console.log('If there are images there, the API IS working!');
}

// Run the verification
verifyRealGeneration();