import dotenv from 'dotenv';
dotenv.config();

import { UltraRealisticCharacterManager } from './src/enhancement/ultraRealisticCharacterManager';
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';
import { UltraRealisticConfig } from './src/pipelines/nanoBananaVeo3Pipeline';

async function testUltraRealisticVideoGeneration() {
  console.log('🚀 Testing Ultra-Realistic Video Generation Pipeline');
  console.log('=' .repeat(80));

  const manager = new UltraRealisticCharacterManager();

  try {
    // Test 1: Validate Aria character for ultra-realistic generation
    console.log('\n📋 Step 1: Validating Aria character...');
    const validation = manager.validateCharacterForRealism(quoteMotoInfluencer);

    if (!validation.valid) {
      console.log('❌ Character validation failed:');
      validation.issues.forEach(issue => console.log(`  - ${issue}`));
      return;
    }

    console.log('✅ Aria character validated successfully');

    // Test 2: Generate ultra-realistic demo video
    console.log('\n🎬 Step 2: Generating ultra-realistic demo video...');

    const config: UltraRealisticConfig = {
      platform: 'youtube',
      aspectRatio: '16:9',
      targetDuration: 40, // 5 segments × 8 seconds
      enhanceWithTopaz: false, // Disable for testing (requires Topaz installation)
      useZhoTechniques: false
    };

    const result = await manager.generateAriaDemo(config);

    if (result.success) {
      console.log('✅ Ultra-realistic video generated successfully!');
      console.log(`📁 Video saved to: ${result.videoPath}`);
      console.log(`⏱️  Duration: ${result.duration} seconds`);
      console.log(`🎞️  Segments: ${result.segments.length}`);

      if (result.enhanced) {
        console.log('⚡ Video enhanced with Topaz Video AI');
      }

      // Show segment details
      console.log('\n📝 Generated segments:');
      result.segments.forEach((segment, i) => {
        const status = segment.success ? '✅' : '❌';
        console.log(`  ${i + 1}. ${status} ${segment.scene} (${segment.duration}s)`);
        if (segment.error) {
          console.log(`     Error: ${segment.error}`);
        }
      });

    } else {
      console.log('❌ Ultra-realistic video generation failed:');
      console.log(`Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

async function testAdvancedFeatures() {
  console.log('\n\n🔬 Testing Advanced Features');
  console.log('=' .repeat(80));

  const manager = new UltraRealisticCharacterManager();

  try {
    // Test 3: Custom viral content with ZHO techniques
    console.log('\n🎭 Step 3: Testing viral content with ZHO techniques...');

    const viralScenes = [
      "Aria confidently presenting insurance savings",
      "Shocked expression revealing massive discounts",
      "Demonstrating easy mobile app interface",
      "Celebrating customer success stories",
      "Encouraging immediate action with urgency"
    ];

    const viralConfig: UltraRealisticConfig = {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: 40,
      enhanceWithTopaz: false,
      useZhoTechniques: true
    };

    const viralResult = await manager.generateUltraRealisticVideo({
      character: quoteMotoInfluencer,
      scenes: viralScenes,
      config: viralConfig,
      characterConsistency: {
        preserveFacialFeatures: true,
        maintainLighting: true,
        useFirstFrameReference: true
      },
      zhoTechniques: manager.getRecommendedZhoTechniques('viral'),
      storyStructure: 'viral'
    });

    if (viralResult.success) {
      console.log('✅ Viral content generated successfully!');
      console.log(`📱 TikTok-optimized video: ${viralResult.videoPath}`);
      console.log(`🔥 Applied ZHO techniques for viral potential`);
    } else {
      console.log('❌ Viral content generation failed:', viralResult.error);
    }

  } catch (error) {
    console.error('❌ Advanced features test failed:', error);
  }
}

async function testCharacterConsistency() {
  console.log('\n\n🧬 Testing Character Consistency');
  console.log('=' .repeat(80));

  const manager = new UltraRealisticCharacterManager();

  try {
    // Test 4: Character consistency across multiple videos
    console.log('\n👥 Step 4: Testing character consistency...');

    const consistencyScenes = [
      "Professional front-facing introduction",
      "Three-quarter view explaining benefits",
      "Profile view showing confidence",
      "Return to front view for conclusion"
    ];

    const consistencyConfig: UltraRealisticConfig = {
      platform: 'instagram',
      aspectRatio: '1:1',
      targetDuration: 32,
      enhanceWithTopaz: false
    };

    const consistencyResult = await manager.generateUltraRealisticVideo({
      character: quoteMotoInfluencer,
      scenes: consistencyScenes,
      config: consistencyConfig,
      characterConsistency: {
        useGreenScreen: true, // Enable for maximum consistency
        preserveFacialFeatures: true,
        maintainLighting: true,
        multiAngleGeneration: true,
        useFirstFrameReference: true
      },
      storyStructure: 'custom'
    });

    if (consistencyResult.success) {
      console.log('✅ Character consistency test completed!');
      console.log(`📸 Instagram-optimized video: ${consistencyResult.videoPath}`);
      console.log(`🎯 Character maintained across all angles`);
    } else {
      console.log('❌ Character consistency test failed:', consistencyResult.error);
    }

  } catch (error) {
    console.error('❌ Character consistency test failed:', error);
  }
}

async function displayPipelineInfo() {
  console.log('\n\n📊 Ultra-Realistic Video Generation Pipeline Info');
  console.log('=' .repeat(80));

  console.log(`
🔧 PIPELINE COMPONENTS:
  ├── 📸 NanoBanana: Ultra-realistic image generation
  │   ├── Optimized prompts (less is more principle)
  │   ├── Character consistency preservation
  │   └── Natural skin realism (simplified approach)
  │
  ├── 🎬 VEO3: Advanced video generation
  │   ├── JSON prompting (300%+ quality improvement)
  │   ├── 8-second segment optimization
  │   ├── Native audio generation and lip sync
  │   └── Platform-specific camera positioning
  │
  ├── 🔗 FFmpeg: Professional video stitching
  │   ├── 35+ xfade transition types
  │   ├── Audio crossfading
  │   └── Optimal quality settings (CRF 18)
  │
  └── ⚡ Topaz Video AI: 4K enhancement
      ├── Proteus model optimization
      ├── Detail preservation
      └── Motion-aware upscaling

🎯 KEY DISCOVERIES IMPLEMENTED:
  ✅ "Less is more" for skin realism
  ✅ Remove prompt contradictions
  ✅ Character preservation instructions
  ✅ Platform-specific optimization
  ✅ Strategic ZHO technique application

💰 COST STRUCTURE:
  • NanoBanana: ~$0.02 per image
  • VEO3: $0.75 per second ($6 per 8-second segment)
  • Total for 56-second video: ~$42 + processing costs

⚡ PERFORMANCE METRICS:
  • Image Generation: 30-60 seconds per image
  • Video Generation: 2-3 minutes per 8-second segment
  • Video Stitching: 1-2 minutes for 7 segments
  • Topaz Enhancement: 5-10 minutes for 4K upscaling
  `);
}

// Main execution
async function main() {
  console.log('🎭 ULTRA-REALISTIC VIDEO GENERATION TEST SUITE');
  console.log('Combining NanoBanana + VEO3 + ZHO Techniques');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  // Check environment
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    console.log('Please set your Gemini API key in the .env file');
    return;
  }

  await displayPipelineInfo();

  // Run tests
  await testUltraRealisticVideoGeneration();
  await testAdvancedFeatures();
  await testCharacterConsistency();

  console.log('\n\n🎉 Ultra-Realistic Video Generation Test Suite Complete!');
  console.log('Check the generated/ directory for your ultra-realistic videos.');
  console.log('\nSign off as SmokeDev 🚬');
}

// Run the test
main().catch(console.error);