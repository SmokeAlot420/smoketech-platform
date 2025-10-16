import dotenv from 'dotenv';
dotenv.config();

import { UltraRealisticCharacterManager } from './src/enhancement/ultraRealisticCharacterManager';
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';

async function generateSimpleUltraRealisticVideo() {
  console.log('🎬 Generating Simple Ultra-Realistic Video Demo');
  console.log('=' .repeat(60));

  const manager = new UltraRealisticCharacterManager();

  try {
    // Simple scenes that should work
    const simpleScenes = [
      "Professional woman speaking confidently to camera about insurance",
      "Explaining cost savings with clear hand gestures and smile",
      "Demonstrating mobile app features with enthusiasm"
    ];

    const result = await manager.generateUltraRealisticVideo({
      character: quoteMotoInfluencer,
      scenes: simpleScenes,
      config: {
        platform: 'youtube',
        aspectRatio: '16:9',
        targetDuration: 24, // 3 segments × 8 seconds
        enhanceWithTopaz: false, // Disable for speed
        useZhoTechniques: false  // Disable for safety
      },
      characterConsistency: {
        preserveFacialFeatures: false, // Disable problematic features
        maintainLighting: true,
        useFirstFrameReference: false,
        multiAngleGeneration: false
      },
      storyStructure: 'commercial'
    });

    if (result.success) {
      console.log('✅ Ultra-realistic video generated successfully!');
      console.log(`📁 Video location: ${result.videoPath}`);
      console.log(`⏱️  Duration: ${result.duration} seconds`);
      console.log(`🎞️  Segments: ${result.segments.length}`);

      return result.videoPath;
    } else {
      console.log('❌ Video generation failed:', result.error);
      return null;
    }

  } catch (error) {
    console.error('❌ Error during video generation:', error);
    return null;
  }
}

// Run the simple test
generateSimpleUltraRealisticVideo()
  .then((videoPath) => {
    if (videoPath) {
      console.log(`\n🎉 SUCCESS! Check your video at: ${videoPath}`);
    } else {
      console.log('\n❌ No video was generated');
    }
    console.log('\nSign off as SmokeDev 🚬');
  })
  .catch(console.error);