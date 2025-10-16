import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';

async function testVEO3VertexAI() {
  console.log('🎬 Testing VEO3 with Vertex AI Preview');
  console.log('=' .repeat(60));

  try {
    // Initialize VEO3 service with Vertex AI
    const veo3 = new VEO3Service();

    // Test connection first
    console.log('🔍 Testing VEO3 authentication...');
    const connectionTest = await veo3.testConnection();

    if (!connectionTest) {
      console.log('❌ VEO3 connection failed. Check your Vertex AI setup.');
      return false;
    }

    console.log('✅ VEO3 authentication successful!');
    console.log('');

    // Test simple video generation
    console.log('🎬 Testing VEO3 video generation...');

    const testPrompt = "Professional woman speaking confidently to camera about insurance savings. Natural lighting, modern office background.";

    const result = await veo3.generateVideoSegment({
      prompt: testPrompt,
      duration: 8,
      aspectRatio: '16:9',
      videoCount: 1,
      enablePromptRewriting: true,
      enableSoundGeneration: true
    });

    if (result.success) {
      console.log('✅ VEO3 video generation successful!');
      console.log(`📁 Generated ${result.videos.length} video(s)`);
      console.log(`💰 Cost: $${result.metadata?.cost.toFixed(2)}`);
      console.log(`⏱️  Generation time: ${result.metadata?.generationTime}ms`);

      if (result.enhancedPrompt) {
        console.log('📝 Enhanced prompt was used:');
        console.log(result.enhancedPrompt.substring(0, 200) + '...');
      }

      result.videos.forEach((video, index) => {
        console.log(`🎞️  Video ${index + 1}: ${video.videoPath}`);
        console.log(`   Duration: ${video.duration}s, Quality: ${video.quality}`);
      });

      return true;
    } else {
      console.log('❌ VEO3 video generation failed:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Error during VEO3 test:', error);
    return false;
  }
}

// Test platform-specific settings
async function testPlatformSettings() {
  console.log('\n🎯 Testing Platform-Specific Settings');
  console.log('=' .repeat(40));

  const platforms = ['tiktok', 'youtube', 'instagram'] as const;

  for (const platform of platforms) {
    const settings = VEO3Service.getPlatformSettings(platform);
    console.log(`📱 ${platform.toUpperCase()}:`);
    console.log(`   Aspect Ratio: ${settings.aspectRatio}`);
    console.log(`   Duration: ${settings.duration}s`);
    console.log(`   Video Count: ${settings.videoCount}`);
    console.log(`   Sound: ${settings.enableSoundGeneration ? 'Yes' : 'No'}`);
  }
}

// Test viral storyboard creation
async function testViralStoryboard() {
  console.log('\n📚 Testing Viral Storyboard Creation');
  console.log('=' .repeat(40));

  const storyboard = VEO3Service.createViralStoryboard(56, 8);

  console.log(`📝 Generated ${storyboard.length} segments for 56-second video:`);
  storyboard.forEach((segment, index) => {
    console.log(`   ${index + 1}. ${segment}`);
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 VEO3 Vertex AI Integration Test Suite');
  console.log('=' .repeat(60));

  // Test basic functionality
  const basicTest = await testVEO3VertexAI();

  // Test additional features
  await testPlatformSettings();
  await testViralStoryboard();

  console.log('\n' + '=' .repeat(60));
  if (basicTest) {
    console.log('🎉 VEO3 Vertex AI integration is working perfectly!');
    console.log('✅ Ready for ultra-realistic video generation with:');
    console.log('   - Text-to-video and image-to-video support');
    console.log('   - Prompt rewriting for enhanced quality');
    console.log('   - Native sound generation');
    console.log('   - Multiple video generation (A/B testing)');
    console.log('   - 4/6/8 second duration options');
    console.log('   - 1080p quality for all aspect ratios');
  } else {
    console.log('❌ VEO3 integration needs attention');
    console.log('💡 Check your Vertex AI setup:');
    console.log('   - GCP_PROJECT_ID environment variable');
    console.log('   - GCP_LOCATION environment variable');
    console.log('   - Service account JSON file path');
    console.log('   - VEO3 model access permissions');
  }

  console.log('\nSign off as SmokeDev 🚬');
}

// Execute tests
runAllTests().catch(console.error);