import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service, VideoGenerationRequest } from './src/services/veo3Service';
import path from 'path';

/**
 * Quick VEO3 test with single image
 */
async function testSingleVeo3(): Promise<void> {
  console.log('🎬 QUICK VEO3 TEST');
  console.log('Testing single video generation with master image');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(60));

  try {
    const veo3 = new VEO3Service({
      outputPath: './generated/veo3-test'
    });

    const testImagePath = path.join(
      process.cwd(),
      'generated',
      'improved-master',
      '2025-09-28T01-37-57-620Z',
      'aria-home-consultation-branded.png'
    );

    console.log(`📸 Test image: ${testImagePath}`);

    const request: VideoGenerationRequest = {
      prompt: "Professional insurance expert Aria from QuoteMoto speaking: \"Hi! I'm Aria. Let me help you save on insurance with our exclusive discounts. Get your free quote today!\"",
      duration: 8,
      aspectRatio: '9:16',
      firstFrame: testImagePath,
      quality: 'high',
      enableSoundGeneration: true,
      videoCount: 1
    };

    console.log('🎥 Starting VEO3 test generation...');
    const result = await veo3.generateVideoSegment(request);

    if (result.success) {
      console.log('✅ VEO3 TEST SUCCESSFUL!');
      console.log(`📹 Video: ${result.videos[0]?.videoPath}`);
      console.log('🚀 Ready to run full batch generation!');
    } else {
      console.log('❌ VEO3 Test failed:', result.error);
    }

  } catch (error: any) {
    console.error('❌ Test error:', error.message);
  }
}

// Execute
if (require.main === module) {
  testSingleVeo3()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}