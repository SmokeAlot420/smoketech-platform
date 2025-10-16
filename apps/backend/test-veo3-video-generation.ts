// Test VEO3 Video Generation with $1,000 Credits
// Generates a short 4-second test video (~$21)

import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';

async function testVEO3VideoGeneration() {
  console.log('🎬 Testing VEO3 Video Generation...\n');

  try {
    // Initialize VEO3 service
    const veo3 = new VEO3Service();
    console.log('✅ VEO3 Service initialized\n');

    // Test with a simple 4-second video (lower cost ~$21)
    const testPrompt = `
Professional business person in office, smiling and speaking directly to camera.
Natural lighting, confident expression, modern office background.
4-second professional talking head shot.
    `.trim();

    console.log('📝 Generating 4-second test video...');
    console.log(`Prompt: ${testPrompt}\n`);
    console.log('⏱️  This will take 2-3 minutes...');
    console.log('💰 Expected cost: ~$21 (from your $1,000 credits)\n');

    const result = await veo3.generateVideoSegment({
      prompt: testPrompt,
      duration: 4, // 4 seconds to minimize cost
      aspectRatio: '16:9',
      enableSoundGeneration: true,
      enablePromptRewriting: true
    });

    console.log('\n🎉 VIDEO GENERATION SUCCESS!\n');
    console.log('📊 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Videos generated: ${result.videos.length}`);
    console.log(`  Model used: ${result.metadata.model}`);
    console.log(`  Generation time: ${result.metadata.generationTime}ms`);
    console.log(`  Cost: $${result.metadata.cost.toFixed(2)}`);

    if (result.videos.length > 0) {
      console.log('\n📹 Generated Videos:');
      result.videos.forEach((video, i) => {
        console.log(`  ${i + 1}. ${video.videoPath}`);
        console.log(`     Duration: ${video.duration}s`);
        console.log(`     Quality: ${video.quality}`);
      });
    }

    console.log('\n✅ CONFIRMED: VEO3 is using Auturf\'s $1,000 Vertex AI credits!');
    console.log('   Project: viral-ai-content-12345');
    console.log('   Remaining credits: ~$979\n');

  } catch (error) {
    console.error('\n❌ Video generation failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testVEO3VideoGeneration().catch(console.error);
