/**
 * Actually download the generated video - keep polling until ready
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

async function getVideoNow() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const client = new GoogleGenAI({ apiKey });

  // Create the generated folder first
  const outputDir = path.join(process.cwd(), 'generated');
  await fs.mkdir(outputDir, { recursive: true });
  console.log('📁 Created folder:', path.resolve(outputDir));

  // The operation from our test
  const operationName = 'models/veo-3.0-fast-generate-001/operations/84db6xgschf0';

  console.log('🎬 Getting video from operation:', operationName);
  console.log('⏳ This may take a few minutes...\n');

  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max

  try {
    let operation = {
      name: operationName,
      done: false
    };

    // Keep polling until done
    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      console.log(`[Attempt ${attempts}/${maxAttempts}] Checking status...`);

      try {
        // Get operation status
        operation = await client.operations.getVideosOperation({
          operation: { name: operationName }
        });

        if (operation.done) {
          console.log('\n✅ VIDEO IS READY!\n');

          if (operation.response?.generatedVideos?.[0]) {
            const video = operation.response.generatedVideos[0];

            if (video.video) {
              // Download the video
              console.log('📥 Downloading video file...');
              await client.files.download({ file: video.video });

              // Save it
              const fileName = `veo3-cat-piano-${Date.now()}.mp4`;
              const filePath = path.join(outputDir, fileName);

              if (video.video.videoBytes) {
                await fs.writeFile(filePath, Buffer.from(video.video.videoBytes));
                console.log('\n🎉 VIDEO SAVED!');
                console.log('📍 Location:', path.resolve(filePath));
                console.log('\nOpen this file to watch your video:');
                console.log(path.resolve(filePath));
                return;
              } else if (video.video.uri) {
                console.log('🔗 Video URI:', video.video.uri);
                console.log('Note: Direct download may require additional auth');
              }
            }
          } else {
            console.log('❌ No video in response');
            console.log('Response:', JSON.stringify(operation.response, null, 2));
          }
        } else {
          console.log('Status: Still processing... waiting 10 seconds');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error) {
        console.log('Error checking status:', error.message);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    if (!operation.done) {
      console.log('\n⏱️ Timeout - video is taking longer than expected');
      console.log('The video may still be processing. Try again later.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Run it
getVideoNow().catch(console.error);