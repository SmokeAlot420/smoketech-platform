// Improved VEO3 Operation Polling Script
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function pollVEO3Operations() {
  console.log('🎬 IMPROVED VEO3 OPERATION POLLING...\n');

  // Operations to check (from previous generations)
  const operations = [
    'models/veo-3.0-generate-001/operations/pu6tlo0z17ao', // TikTok viral hook
    'models/veo-3.0-generate-001/operations/5n4e9iohavab', // YouTube explainer
    'models/veo-3.0-fast-generate-001/operations/l6b6x3u3m61e' // Latest
  ];

  for (const operationId of operations) {
    console.log(`🔍 Checking: ${operationId.split('/').pop()}`);

    try {
      // For existing operations (from string IDs), use direct REST API
      // This avoids the _fromAPIResponse SDK issue
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/${operationId}`, {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const currentOperation = await response.json();

      console.log(`Status: ${currentOperation.done ? '✅ COMPLETED' : '⏳ Processing'}`);

      if (currentOperation.done) {
        console.log('📹 Processing completed video...');

        // Check actual VEO3 response structure
        if (currentOperation.response && currentOperation.response.generateVideoResponse &&
            currentOperation.response.generateVideoResponse.generatedSamples &&
            currentOperation.response.generateVideoResponse.generatedSamples.length > 0) {
          const generatedSample = currentOperation.response.generateVideoResponse.generatedSamples[0];
          console.log('🎥 Video found in VEO3 response!');

          // Get video URL from correct VEO3 structure
          const videoUrl = generatedSample.video?.uri;

          if (videoUrl) {
            console.log('🔗 Video URL available!');
            console.log(`🔍 Full URL: ${videoUrl}`);
            console.log(`📥 Attempting download...`);

            // Download the video
            const timestamp = Date.now();
            const sanitizedId = operationId.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `pedro-video-${sanitizedId}-${timestamp}.mp4`;
            const videoDir = path.join(process.cwd(), 'generated', 'quotemoto', 'videos');

            // Ensure directory exists
            if (!fs.existsSync(videoDir)) {
              fs.mkdirSync(videoDir, { recursive: true });
            }

            const filePath = path.join(videoDir, fileName);

            try {
              // Try different authentication approaches
              let downloadUrl = videoUrl;

              // If URL doesn't already have API key, add it as query parameter
              if (!downloadUrl.includes('key=') && !downloadUrl.includes('alt=media')) {
                downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + `key=${process.env.GEMINI_API_KEY}`;
              }

              console.log(`🔍 Download URL: ${downloadUrl}`);

              const response = await fetch(downloadUrl, {
                headers: {
                  'x-goog-api-key': process.env.GEMINI_API_KEY || '',
                }
              });

              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filePath, buffer);

                console.log(`🎉 SUCCESS! Video downloaded: ${fileName}`);
                console.log(`📊 File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
                console.log(`📁 Location: ${filePath}`);
              } else {
                console.log(`❌ Download failed: HTTP ${response.status}`);
              }
            } catch (downloadError) {
              console.error('❌ Download error:', downloadError.message);
            }
          } else {
            console.log('❌ No video URL found');
            console.log('🔍 Sample structure:', JSON.stringify(generatedSample, null, 2));
          }
        } else {
          console.log('❌ No generated samples in VEO3 response');
          console.log('🔍 Response structure:', JSON.stringify(currentOperation.response, null, 2));
        }
      }

      console.log('');

    } catch (error) {
      console.error(`❌ Error checking ${operationId.split('/').pop()}:`, error.message);
      console.log('');
    }
  }

  console.log('🎉 OPERATION POLLING COMPLETED!');
}

pollVEO3Operations();