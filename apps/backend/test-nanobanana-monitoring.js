require('dotenv').config();
const { Langfuse } = require('langfuse');

async function testNanoBananaMonitoring() {
  console.log('🚀 Testing NanoBanana with Langfuse Monitoring\n');

  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: process.env.LANGFUSE_HOST
  });

  // Create a trace for the entire workflow
  const trace = langfuse.trace({
    name: 'viral-content-generation',
    userId: 'quotemoto-influencer',
    metadata: {
      workflow: 'NanoBanana Character Consistency',
      influencer: 'Sofia Martinez',
      platform: 'QuoteMoto'
    }
  });

  // Track script generation
  const scriptGen = trace.generation({
    name: 'script-generation',
    model: 'gemini-2.0-flash',
    input: {
      prompt: 'Generate motivational quote about perseverance',
      style: 'inspirational'
    },
    output: {
      quote: 'Every expert was once a beginner who refused to give up',
      caption: '#MotivationMonday #NeverGiveUp'
    },
    metadata: {
      duration: 1200,
      tokens: 150
    }
  });

  // Track image generation with NanoBanana
  const imageGen1 = trace.generation({
    name: 'nanobanana-image-generation',
    model: 'imagegeneration@006',
    input: {
      prompt: 'Latina woman, professional attire, confident smile, office setting',
      characterReference: true,
      aspectRatio: '9:16'
    },
    output: {
      status: 'success',
      imageCount: 1,
      imageId: 'img_001'
    },
    metadata: {
      cost: 0.020,
      duration: 3500,
      characterConsistency: true,
      influencer: 'Sofia Martinez'
    }
  });

  // Track second image with character consistency
  const imageGen2 = trace.generation({
    name: 'nanobanana-consistency-check',
    model: 'imagegeneration@006',
    input: {
      prompt: 'Same Latina woman, casual outfit, outdoor setting, natural lighting',
      referenceImage: 'img_001',
      aspectRatio: '9:16'
    },
    output: {
      status: 'success',
      imageCount: 1,
      imageId: 'img_002'
    },
    metadata: {
      cost: 0.020,
      duration: 3200,
      characterConsistency: true,
      consistencyScore: 0.95
    }
  });

  // Track enhanced version with imagen-3.0
  const imageGen3 = trace.generation({
    name: 'imagen3-enhanced',
    model: 'imagen-3.0-generate-001',
    input: {
      prompt: 'Latina professional woman, high quality portrait, studio lighting',
      referenceImage: 'img_001',
      quality: 'high',
      aspectRatio: '9:16'
    },
    output: {
      status: 'success',
      imageCount: 1,
      imageId: 'img_003_enhanced'
    },
    metadata: {
      cost: 0.040,
      duration: 4500,
      characterConsistency: true,
      enhancedQuality: true
    }
  });

  // Track platform distribution
  const distribution = trace.generation({
    name: 'content-distribution',
    model: 'platform-api',
    input: {
      platforms: ['TikTok', 'Instagram', 'YouTube'],
      content: {
        quote: 'Every expert was once a beginner',
        images: ['img_001', 'img_002', 'img_003_enhanced']
      }
    },
    output: {
      tiktok: { status: 'published', postId: 'tt_123' },
      instagram: { status: 'published', postId: 'ig_456' },
      youtube: { status: 'scheduled', postId: 'yt_789' }
    },
    metadata: {
      totalPlatforms: 3,
      successRate: 1.0
    }
  });

  // Track performance metrics
  const metrics = trace.generation({
    name: 'performance-analysis',
    model: 'analytics',
    input: {
      postIds: ['tt_123', 'ig_456', 'yt_789'],
      duration: '1 hour'
    },
    output: {
      views: 5234,
      engagement: 423,
      shares: 89,
      viralScore: 78
    },
    metadata: {
      viral: true,
      replicationTriggered: true
    }
  });

  // Calculate total cost
  const totalCost = 0.020 + 0.020 + 0.040; // 2x @006 + 1x @001

  console.log('📊 Session Summary:');
  console.log('- Script generated with Gemini 2.0 Flash');
  console.log('- 3 images generated with character consistency');
  console.log('- Content distributed to 3 platforms');
  console.log('- Viral score: 78/100 (replication triggered)');
  console.log(`- Total cost: $${totalCost.toFixed(3)}\n`);

  // Flush and close
  await langfuse.flushAsync();
  await langfuse.shutdownAsync();

  console.log('✅ Monitoring complete! View detailed trace at:');
  console.log('🔗 http://localhost:3030\n');
  console.log('You should see:');
  console.log('- Complete viral content pipeline trace');
  console.log('- Cost breakdown by model');
  console.log('- Character consistency tracking');
  console.log('- Performance metrics');
}

testNanoBananaMonitoring().catch(console.error);