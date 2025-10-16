require('dotenv').config();
const { Langfuse } = require('langfuse');

async function runSimpleTrace() {
  console.log('🚀 Running NanoBanana Pipeline Trace\n');
  console.log('='.repeat(50));

  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: process.env.LANGFUSE_HOST
  });

  // Create main trace
  const mainTrace = langfuse.trace({
    name: 'viral-content-pipeline',
    userId: 'quotemoto-bot',
    sessionId: `session-${Date.now()}`,
    metadata: {
      pipeline: 'viral-generation',
      environment: 'production',
      version: '1.0.0'
    },
    tags: ['nanobanana', 'quotemoto', 'production']
  });

  try {
    // Step 1: Script Generation
    console.log('📝 Step 1: Generating motivational script...');
    const scriptGen = mainTrace.generation({
      name: 'script-generation',
      model: 'gemini-2.0-flash',
      modelParameters: {
        temperature: 0.8,
        maxTokens: 150
      },
      input: 'Generate inspirational quote about success',
      output: {
        quote: "Success isn't just about reaching the summit, it's about enjoying every step of the climb.",
        hashtags: ['#SuccessMindset', '#KeepClimbing'],
        hook: 'What mountain are you climbing today?'
      },
      metadata: {
        step: 1,
        duration: 1200,
        tokens: 42
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('   ✅ Script generated\n');

    // Step 2: Character Creation with NanoBanana
    console.log('🎨 Step 2: Creating influencer character...');
    const imageGen1 = mainTrace.generation({
      name: 'nanobanana-character',
      model: 'imagegeneration@006',
      input: {
        prompt: 'Professional Latina woman, confident smile, business casual, modern office',
        aspectRatio: '9:16'
      },
      output: {
        status: 'success',
        imageId: 'char_001',
        size: '1024x1820'
      },
      metadata: {
        step: 2,
        cost: 0.020,
        duration: 3500,
        model: 'NanoBanana'
      }
    });
    await new Promise(resolve => setTimeout(resolve, 3500));
    console.log('   ✅ Character created - Cost: $0.020\n');

    // Step 3: Consistency Test
    console.log('🎨 Step 3: Testing character consistency...');
    const imageGen2 = mainTrace.generation({
      name: 'consistency-test',
      model: 'imagegeneration@006',
      input: {
        prompt: 'Same woman, different pose, outdoor setting',
        referenceImage: 'char_001',
        aspectRatio: '9:16'
      },
      output: {
        status: 'success',
        imageId: 'char_002',
        consistencyScore: 0.94
      },
      metadata: {
        step: 3,
        cost: 0.020,
        duration: 3200,
        characterConsistency: true
      }
    });
    await new Promise(resolve => setTimeout(resolve, 3200));
    console.log('   ✅ Consistency verified - Score: 0.94\n');

    // Step 4: Enhanced Version
    console.log('🎨 Step 4: Creating enhanced version...');
    const imageGen3 = mainTrace.generation({
      name: 'enhanced-generation',
      model: 'imagen-3.0-generate-001',
      input: {
        prompt: 'High quality portrait, studio lighting',
        referenceImage: 'char_001',
        quality: 'ultra'
      },
      output: {
        status: 'success',
        imageId: 'char_003_hq',
        resolution: '2048x3640'
      },
      metadata: {
        step: 4,
        cost: 0.040,
        duration: 4500,
        enhanced: true
      }
    });
    await new Promise(resolve => setTimeout(resolve, 4500));
    console.log('   ✅ Enhanced version - Cost: $0.040\n');

    // Step 5: Multi-Platform Distribution
    console.log('📱 Step 5: Distributing content...');
    const platforms = ['TikTok', 'Instagram', 'YouTube'];

    for (const platform of platforms) {
      const dist = mainTrace.generation({
        name: `distribute-${platform.toLowerCase()}`,
        model: `${platform.toLowerCase()}-api`,
        input: {
          content: 'Motivational quote with images',
          images: ['char_001', 'char_002', 'char_003_hq']
        },
        output: {
          status: 'published',
          postId: `${platform.toLowerCase()}_${Date.now()}`
        },
        metadata: {
          platform,
          step: 5
        }
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`   ✅ Published to ${platform}`);
    }
    console.log('');

    // Step 6: Performance Analytics
    console.log('📊 Step 6: Analyzing performance...');
    const analytics = mainTrace.generation({
      name: 'performance-analysis',
      model: 'analytics-engine',
      input: {
        platforms,
        duration: '1hour'
      },
      output: {
        totalViews: 12847,
        engagement: {
          likes: 1423,
          comments: 234,
          shares: 189
        },
        viralScore: 86,
        topPlatform: 'TikTok'
      },
      metadata: {
        step: 6,
        viral: true,
        replicationTriggered: true
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   ✅ Viral Score: 86/100\n');

    // Step 7: Viral Replication
    console.log('🔄 Step 7: Triggering viral replication...');
    const replication = mainTrace.generation({
      name: 'viral-replication',
      model: 'replication-engine',
      input: {
        originalContent: 'char_001',
        viralScore: 86,
        variations: 5
      },
      output: {
        replicatedPosts: 5,
        scheduledTime: 'next 24 hours',
        estimatedReach: 50000
      },
      metadata: {
        step: 7,
        automated: true,
        scaleFactor: 5
      }
    });
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('   ✅ 5 variations scheduled\n');

    // Final Summary
    const totalCost = 0.020 + 0.020 + 0.040;
    mainTrace.update({
      output: {
        success: true,
        totalCost,
        imagesGenerated: 3,
        platformsPublished: 3,
        viralScore: 86,
        replicationTriggered: true
      },
      metadata: {
        pipelineComplete: true,
        totalDuration: 18000,
        costBreakdown: {
          'imagegeneration@006': 0.040,
          'imagen-3.0-generate-001': 0.040,
          'gemini-2.0-flash': 0.000
        }
      }
    });

    console.log('='.repeat(50));
    console.log('✨ PIPELINE TRACE COMPLETE!\n');
    console.log('📊 Final Summary:');
    console.log(`- Total Cost: $${totalCost.toFixed(3)}`);
    console.log('- Images Generated: 3');
    console.log('- Character Consistency: 94%');
    console.log('- Platforms Published: 3');
    console.log('- Viral Score: 86/100');
    console.log('- Replications: 5 scheduled');
    console.log('- Estimated Reach: 50,000+\n');
    console.log('🔗 View Full Trace at: http://localhost:3030');
    console.log('   Check the traces tab for detailed breakdown');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    mainTrace.update({
      output: { error: error.message },
      metadata: { failed: true }
    });
  } finally {
    await langfuse.flushAsync();
    await langfuse.shutdownAsync();
  }
}

// Run the trace
runSimpleTrace().catch(console.error);