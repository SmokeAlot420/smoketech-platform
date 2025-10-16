const { replicateClient } = require('./dist/replicate-client.js');
require('dotenv').config();

async function testReplicate() {
  console.log('\n🧪 Testing Replicate Integration\n');
  console.log('================================\n');

  // Check if API token is configured
  const hasToken = process.env.REPLICATE_API_TOKEN &&
                   process.env.REPLICATE_API_TOKEN !== 'your_replicate_api_token_here';

  if (!hasToken) {
    console.log('⚠️  No Replicate API token configured');
    console.log('📝 Running in mock mode - returning placeholders\n');
  } else {
    console.log('✅ Replicate API token configured\n');
  }

  try {
    // Test 1: Nano Banana Image Generation
    console.log('1️⃣ Testing Nano Banana Image Generation...');
    const imageUrl = await replicateClient.generateImageNanoBanana({
      prompt: 'A young content creator filming a TikTok video in a modern studio',
      quality: '2k',
      style: 'realistic'
    });
    console.log('   Result:', imageUrl);
    console.log('   Cost: $0.039\n');

    // Test 2: Alternative Image Generation
    console.log('2️⃣ Testing Alternative Image Model...');
    const altImageUrl = await replicateClient.generateImageAlternative({
      prompt: 'A viral thumbnail with bright colors and engaging composition',
      quality: '2k'
    });
    console.log('   Result:', altImageUrl);
    console.log('   Cost: $0.42\n');

    // Test 3: VEO3 Video Generation (Fast)
    console.log('3️⃣ Testing VEO3 Fast Video Generation...');
    const fastVideoUrl = await replicateClient.generateVideo({
      prompt: 'A content creator presenting an exciting product review',
      inputImage: imageUrl,
      aspectRatio: '9:16',
      resolution: '720p',
      duration: 8,
      useFastModel: true
    });
    console.log('   Result:', fastVideoUrl);
    console.log('   Cost: $1.20\n');

    // Test 4: VEO3 Video Generation (Full Quality)
    console.log('4️⃣ Testing VEO3 Full Quality Video...');
    const fullVideoUrl = await replicateClient.generateVideo({
      prompt: 'A professional content creator sharing tips and tricks',
      inputImage: altImageUrl,
      aspectRatio: '16:9',
      resolution: '1080p',
      duration: 8,
      useFastModel: false
    });
    console.log('   Result:', fullVideoUrl);
    console.log('   Cost: $3.20\n');

    // Show cost summary
    console.log('💰 Cost Summary');
    console.log('===============');
    const costs = replicateClient.getTotalCosts();
    costs.forEach(({ model, cost }) => {
      console.log(`   ${model}: $${cost.toFixed(2)}`);
    });
    console.log(`   TOTAL: $${replicateClient.getTotalCost().toFixed(2)}\n`);

    console.log('✅ All tests completed successfully!\n');

    if (!hasToken) {
      console.log('📌 To use real Replicate models:');
      console.log('   1. Sign up at https://replicate.com');
      console.log('   2. Get your API token from https://replicate.com/account/api-tokens');
      console.log('   3. Add it to .env: REPLICATE_API_TOKEN=your_token_here');
      console.log('   4. Run this test again\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testReplicate();