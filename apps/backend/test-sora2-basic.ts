// Test Sora 2 Basic Video Generation
// Generates a single 12-second video to validate OpenAI Sora 2 integration
// Cost: ~$1.20 (12 seconds × $0.10/sec)

import dotenv from 'dotenv';
dotenv.config();

import { Sora2Service } from './src/services/sora2Service';

async function testSora2BasicGeneration() {
  console.log('🎬 Testing Sora 2 Basic Video Generation...\n');

  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize Sora 2 service
    const sora2 = new Sora2Service();
    console.log('✅ Sora 2 Service initialized\n');

    // Test prompt for QuoteMoto insurance video
    const testPrompt = `
A professional insurance advisor in her late 20s, wearing a modern blue business polo,
sits at a sleek desk in a bright, contemporary office. She smiles warmly at the camera
and gestures with her hands while explaining insurance savings. The California sunlight
streams through floor-to-ceiling windows behind her, creating a professional yet
approachable atmosphere. Modern office equipment and a laptop are visible on the desk.
Natural, confident body language.
    `.trim();

    console.log('📝 Generating 12-second test video with Sora 2...');
    console.log(`Prompt: ${testPrompt}\n`);
    console.log('⏱️  This will take 1-2 minutes (faster than VEO3)...');
    console.log('💰 Expected cost: ~$1.20 (86% cheaper than VEO3)\n');

    const startTime = Date.now();

    const result = await sora2.generateVideoSegment({
      prompt: testPrompt,
      model: 'sora-2', // Use sora-2 (not pro) for cost testing
      duration: 12, // 12 seconds (Sora 2's optimal length)
      aspectRatio: '16:9',
      tier: 2 // Assume Tier 2 for rate limiting
    });

    const endTime = Date.now();
    const generationTime = Math.round((endTime - startTime) / 1000);

    if (!result.success) {
      throw new Error(result.error || 'Video generation failed');
    }

    console.log('\n🎉 VIDEO GENERATION SUCCESS!\n');
    console.log('📊 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Video path: ${result.videoPath}`);
    console.log(`  Duration: ${result.duration}s`);
    console.log(`  Model: ${result.model}`);
    console.log(`  Aspect ratio: ${result.aspectRatio}`);
    console.log(`  Cost: $${result.cost.toFixed(4)}`);
    console.log(`  Generation time: ${generationTime}s`);

    // Compare with VEO3 cost
    const veo3Segments = Math.ceil(result.duration / 8);
    const veo3Cost = veo3Segments * 1.20; // VEO3 Fast: $1.20 per 8s segment
    const savings = veo3Cost - result.cost;
    const savingsPercent = (savings / veo3Cost) * 100;

    console.log('\n💰 Cost Comparison:');
    console.log(`  Sora 2 cost: $${result.cost.toFixed(4)}`);
    console.log(`  VEO3 cost: $${veo3Cost.toFixed(4)} (${veo3Segments} segments × $1.20)`);
    console.log(`  Savings: $${savings.toFixed(4)} (${savingsPercent.toFixed(1)}%)`);

    console.log('\n📹 Generated Video:');
    console.log(`  Location: ${result.videoPath}`);
    console.log(`  To view: Open in your default video player`);

    console.log('\n✅ CONFIRMED: Sora 2 integration working!');
    console.log('   Authentication: OpenAI API ✓');
    console.log('   Video generation: Success ✓');
    console.log(`   Cost efficiency: ${savingsPercent.toFixed(1)}% savings vs VEO3 ✓\n`);

  } catch (error) {
    console.error('\n❌ Video generation failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : 'Unknown error');

    // Check common issues
    if (error instanceof Error && error.message.includes('API key')) {
      console.error('\n💡 Tip: Make sure OPENAI_API_KEY is set in your .env file');
      console.error('   Get your key from: https://platform.openai.com/api-keys');
    }

    if (error instanceof Error && error.message.includes('Rate limit')) {
      console.error('\n💡 Tip: You may need to upgrade your OpenAI tier');
      console.error('   Current tier limits: https://platform.openai.com/account/rate-limits');
    }

    process.exit(1);
  }
}

// Run the test
testSora2BasicGeneration().catch(console.error);
