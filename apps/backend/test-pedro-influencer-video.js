// Test Pedro Influencer Video Generation with VEO3
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function generatePedroInfluencerVideo() {
  console.log('🎬 GENERATING PEDRO INFLUENCER VIDEO WITH VEO3...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // Generate different types of influencer videos
    const videoTypes = [
      {
        type: 'viral-hook',
        platform: 'tiktok',
        style: 'trendy',
        description: 'TikTok viral hook'
      },
      {
        type: 'insurance-tips',
        platform: 'instagram',
        style: 'casual',
        description: 'Instagram tips video'
      },
      {
        type: 'explainer',
        platform: 'youtube',
        style: 'professional',
        description: 'YouTube explainer'
      }
    ];

    for (const video of videoTypes) {
      console.log(`🎥 Generating ${video.description}...`);

      const result = await ultraEngine.generatePedroInfluencerVideo(video.type, {
        platform: video.platform,
        style: video.style,
        duration: 'medium'
      });

      if (result) {
        console.log(`🎉 SUCCESS! ${video.description}: Operation ${result.operationId}`);
        console.log(`📁 Video path: ${result.videoPath}\n`);
      } else {
        console.log(`❌ Failed to generate ${video.description}\n`);
      }

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 PEDRO INFLUENCER VIDEO GENERATION COMPLETED!');
    console.log('📝 Note: VEO3 videos take time to process. Check operation status for completion.');

  } catch (error) {
    console.error('❌ Pedro influencer video generation failed:', error.message);
  }
}

generatePedroInfluencerVideo();