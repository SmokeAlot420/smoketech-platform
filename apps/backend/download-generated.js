/**
 * Download the generated video from the operation
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

async function downloadGenerated() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const client = new GoogleGenAI({ apiKey });

  // The operation ID from our test
  const operationName = 'models/veo-3.0-fast-generate-001/operations/84db6xgschf0';

  console.log('🔍 Checking operation status:', operationName);

  try {
    // Get the operation status
    const operation = await client.operations.get({
      name: operationName
    });

    console.log('Status:', operation.done ? '✅ Complete' : '⏳ Still processing...');

    if (operation.done && operation.response?.generatedVideos) {
      console.log('🎥 Video is ready!');

      const video = operation.response.generatedVideos[0];

      if (video?.video) {
        // Create output directory
        const outputDir = path.join(process.cwd(), 'generated');
        await fs.mkdir(outputDir, { recursive: true });

        // Download the video
        console.log('📥 Downloading video...');
        await client.files.download({ file: video.video });

        // Save to file
        const fileName = `veo3-cat-piano-${Date.now()}.mp4`;
        const filePath = path.join(outputDir, fileName);

        if (video.video.videoBytes) {
          await fs.writeFile(filePath, video.video.videoBytes);
          console.log('✅ Video saved to:', filePath);
          console.log('\n📁 Full path:', path.resolve(filePath));
        } else if (video.video.uri) {
          console.log('📎 Video URI:', video.video.uri);
          console.log('Note: You may need to download from this URI with authentication');
        }
      }
    } else if (!operation.done) {
      console.log('\n⏳ Video is still being generated...');
      console.log('This can take 2-6 minutes. Try again in a moment.');
    } else {
      console.log('❌ No video found in the operation response');
      console.log('Response:', JSON.stringify(operation, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

downloadGenerated();