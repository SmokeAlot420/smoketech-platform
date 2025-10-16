// Generate Quick Pedro Influencer Video
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function generateQuickPedroVideo() {
  console.log('🎬 GENERATING QUICK PEDRO INFLUENCER VIDEO...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // Generate a short TikTok viral hook with trendy style
    console.log('🎥 Generating Pedro TikTok viral hook (short duration)...');

    const result = await ultraEngine.generatePedroInfluencerVideo('viral-hook', {
      platform: 'tiktok',
      style: 'trendy',
      duration: 'short'
    });

    if (result) {
      console.log(`🎉 SUCCESS! Pedro video operation started: ${result.operationId}`);
      console.log(`📁 Video will be available at: ${result.videoPath}\n`);

      // Save operation ID for future checking
      const fs = require('fs');
      fs.writeFileSync('E:\\v2 repo\\viral\\generated\\latest-pedro-video-op.txt', result.operationId);
      console.log('💾 Operation ID saved to latest-pedro-video-op.txt');

      console.log('\n⏳ Video is now being processed by VEO3...');
      console.log('🔄 Run check-video-status.js in a few minutes to check completion status');

    } else {
      console.log('❌ Failed to generate Pedro video');
    }

  } catch (error) {
    console.error('❌ Pedro video generation failed:', error.message);
  }
}

generateQuickPedroVideo();