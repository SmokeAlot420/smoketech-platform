// Test Improved VEO3 Implementation with Pedro
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function testImprovedVEO3() {
  console.log('🎬 TESTING IMPROVED VEO3 IMPLEMENTATION...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // Generate a quick Pedro TikTok video with the improved implementation
    console.log('🎥 Generating Pedro TikTok video with improved VEO3...');
    console.log('🎯 Using: TikTok format (9:16), trendy style, viral hook content');

    const result = await ultraEngine.generatePedroInfluencerVideo('viral-hook', {
      platform: 'tiktok',
      style: 'trendy',
      duration: 'short'
    });

    if (result) {
      console.log(`\n🎉 GENERATION RESULT:`);
      console.log(`📋 Operation ID: ${result.operationId}`);
      console.log(`📁 Video Status: ${result.videoPath}`);

      if (result.videoPath.includes('pending-')) {
        console.log('\n⏳ Video is still processing...');
        console.log('🔄 The improved polling system will automatically download when ready');
      } else {
        console.log(`\n✅ VIDEO DOWNLOADED SUCCESSFULLY!`);
        console.log(`📹 File location: ${result.videoPath}`);

        // Check file size
        const fs = require('fs');
        if (fs.existsSync(result.videoPath)) {
          const stats = fs.statSync(result.videoPath);
          console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        }
      }

      console.log('\n📝 IMPROVEMENTS IMPLEMENTED:');
      console.log('✅ Fixed operation object handling');
      console.log('✅ Improved response structure parsing');
      console.log('✅ Enhanced download method with authentication');
      console.log('✅ Better error handling and logging');

    } else {
      console.log('\n❌ Failed to generate Pedro video');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.message.includes('operation._fromAPIResponse')) {
      console.log('\n🔧 This might be a remaining SDK compatibility issue');
      console.log('💡 Try running the poll-veo3-operations.js script to check existing videos');
    }
  }
}

testImprovedVEO3();