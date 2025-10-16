// Check and Download Completed Pedro Videos
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function checkPedroVideos() {
  console.log('🎬 CHECKING PEDRO VIDEO OPERATIONS...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // List of operations to check
    const operations = [
      'models/veo-3.0-generate-001/operations/pu6tlo0z17ao', // TikTok viral hook
      'models/veo-3.0-generate-001/operations/5n4e9iohavab', // YouTube explainer
      'models/veo-3.0-fast-generate-001/operations/l6b6x3u3m61e' // From latest-video-op.txt
    ];

    for (const operationId of operations) {
      console.log(`🔍 Checking operation: ${operationId.split('/').pop()}`);

      try {
        // Use the polling method to check and download
        const videoResult = await ultraEngine.pollVideoCompletion(operationId, 3); // Only 3 attempts

        if (videoResult) {
          console.log(`🎉 SUCCESS! Pedro video downloaded: ${videoResult.videoPath}\n`);
        } else {
          console.log(`⏳ Video still processing or failed: ${operationId.split('/').pop()}\n`);
        }

      } catch (error) {
        console.error(`❌ Error checking operation ${operationId.split('/').pop()}:`, error.message);
      }

      // Wait between checks
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 PEDRO VIDEO CHECK COMPLETED!');
    console.log('📁 Check generated/quotemoto/videos/ folder for downloaded videos');

  } catch (error) {
    console.error('❌ Pedro video check failed:', error.message);
  }
}

checkPedroVideos();