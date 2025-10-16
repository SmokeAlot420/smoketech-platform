/**
 * Complete video generation test with VEO3
 * Generates a video and downloads it when ready
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

async function testVideoGeneration() {
  console.log('🎬 TESTING VEO3 VIDEO GENERATION');
  console.log('================================\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const outputDir = path.join(process.cwd(), 'generated');

  try {
    // Initialize client
    const client = new GoogleGenAI({ apiKey });

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Step 1: Start video generation
    console.log('📹 Starting video generation...');
    console.log('Prompt: "A happy golden retriever running through a sunny park, slow motion, cinematic"');
    console.log('Duration: 5 seconds');
    console.log('Resolution: 720p\n');

    const operation = await client.models.generateVideos({
      model: 'veo-3.0-fast-generate-001', // Fast model for quicker results
      prompt: 'A happy golden retriever running through a sunny park, slow motion, cinematic, with upbeat background music',
      config: {
        aspectRatio: '16:9',
        resolution: '720p',
        duration: 5
      }
    });

    console.log('✅ Video generation started!');
    console.log('Operation ID:', operation.name);
    console.log('\n⏳ Waiting for video to generate (this usually takes 2-6 minutes)...\n');

    // Save operation ID
    const opsFile = path.join(outputDir, 'latest-video-op.txt');
    await fs.writeFile(opsFile, operation.name);

    // Step 2: Poll for completion
    const maxAttempts = 60; // 10 minutes max
    let videoReady = false;
    let attempts = 0;

    while (!videoReady && attempts < maxAttempts) {
      attempts++;

      // Check status via REST API
      const status = await checkVideoStatus(operation.name, apiKey);

      if (status.done) {
        console.log('\n🎉 VIDEO IS READY!\n');

        if (status.response?.generatedVideos?.[0]?.video) {
          const video = status.response.generatedVideos[0].video;

          if (video.videoBytes) {
            // Decode and save video
            console.log('💾 Saving video to disk...');
            const videoBuffer = Buffer.from(video.videoBytes, 'base64');
            const fileName = `veo3-dog-park-${Date.now()}.mp4`;
            const filePath = path.join(outputDir, fileName);

            await fs.writeFile(filePath, videoBuffer);

            console.log('✅ VIDEO SAVED SUCCESSFULLY!');
            console.log(`📁 Location: ${path.resolve(filePath)}`);
            console.log(`📊 Size: ${Math.round(videoBuffer.length / 1024 / 1024)}MB`);
            console.log('\n🎬 Open this file to watch your AI-generated video:');
            console.log(path.resolve(filePath));

            videoReady = true;
          } else if (video.uri) {
            console.log('🔗 Video available at URI:', video.uri);
            console.log('Note: Direct download may require additional authentication');
            videoReady = true;
          }
        } else {
          console.log('⚠️ Video completed but no data found in response');
          break;
        }
      } else {
        // Still processing
        const progress = Math.min(Math.round((attempts / 12) * 100), 95);
        process.stdout.write(`\r[${attempts}/${maxAttempts}] Processing... ${progress}% (checking every 10 seconds)`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
    }

    if (!videoReady && attempts >= maxAttempts) {
      console.log('\n\n⏱️ Timeout - video is taking longer than expected');
      console.log('The video may still be processing. You can check status later with:');
      console.log(`Operation ID: ${operation.name}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n================================');
}

// Helper function to check video status via REST API
function checkVideoStatus(operationName, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/${operationName}?key=${apiKey}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Run the test
testVideoGeneration().catch(console.error);