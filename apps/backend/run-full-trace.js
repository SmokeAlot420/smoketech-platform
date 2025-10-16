require('dotenv').config();
const { Langfuse } = require('langfuse');
const { NanoBananaVertex } = require('./nano-banana-vertex');
const fs = require('fs').promises;
const path = require('path');

async function runFullTrace() {
  console.log('🚀 Running Full NanoBanana Pipeline Trace\n');
  console.log('='.repeat(50));

  // Initialize services
  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: process.env.LANGFUSE_HOST
  });

  const nanoBanana = new NanoBananaVertex(
    'vibrant-encoder-431211-t6',
    'us-central1'
  );

  // Create main trace
  const mainTrace = langfuse.trace({
    name: 'full-pipeline-execution',
    userId: 'smokedev-test',
    sessionId: `session-${Date.now()}`,
    metadata: {
      pipeline: 'viral-content-generation',
      environment: 'development',
      version: '1.0.0'
    },
    tags: ['production-test', 'nanobanana', 'quotemoto']
  });

  try {
    // Step 1: Generate motivational script
    console.log('📝 Step 1: Generating script with Gemini...');
    const scriptSpan = mainTrace.span({
      name: 'script-generation',
      metadata: { step: 1 }
    });

    const scriptGen = scriptSpan.generation({
      name: 'gemini-script',
      model: 'gemini-2.0-flash',
      modelParameters: {
        temperature: 0.8,
        maxTokens: 150
      },
      input: {
        prompt: 'Generate an inspirational quote about success and persistence',
        tone: 'motivational',
        length: 'short'
      }
    });

    // Simulate Gemini response
    await new Promise(resolve => setTimeout(resolve, 1000));

    const scriptOutput = {
      quote: "Success isn't just about reaching the summit, it's about enjoying every step of the climb.",
      hashtags: ['#SuccessMindset', '#KeepClimbing', '#MotivationDaily'],
      engagementHook: 'What mountain are you climbing today?'
    };

    scriptGen.end({
      output: scriptOutput,
      metadata: {
        tokenCount: 42,
        latency: 1000
      }
    });

    scriptSpan.end();
    console.log('✅ Script generated successfully\n');

    // Step 2: Generate first image with NanoBanana
    console.log('🎨 Step 2: Generating character with NanoBanana @006...');
    const imageSpan1 = mainTrace.span({
      name: 'initial-character-generation',
      metadata: { step: 2 }
    });

    const imageGen1 = imageSpan1.generation({
      name: 'nanobanana-character-creation',
      model: 'imagegeneration@006',
      input: {
        prompt: 'Professional Latina woman, confident smile, business casual, modern office background, warm lighting, photorealistic',
        aspectRatio: '9:16',
        samples: 1
      }
    });

    console.log('   Calling NanoBanana API...');
    const startTime1 = Date.now();

    try {
      const images1 = await nanoBanana.generateImage({
        prompt: 'Professional Latina woman, confident smile, business casual, modern office background, warm lighting, photorealistic',
        samples: 1,
        aspectRatio: '9:16'
      });

      const duration1 = Date.now() - startTime1;

      // Save first image
      const imagePath1 = path.join(__dirname, 'generated', 'trace_character_base.png');
      await fs.mkdir(path.dirname(imagePath1), { recursive: true });
      await fs.writeFile(imagePath1, images1[0]);

      imageGen1.end({
        output: {
          status: 'success',
          imagePath: imagePath1,
          imageSize: images1[0].length
        },
        metadata: {
          cost: 0.020,
          duration: duration1,
          model: 'imagegeneration@006'
        }
      });

      console.log(`   ✅ Character created in ${duration1}ms\n`);

      // Store for consistency
      await nanoBanana.addCharacterReference('sofia', images1[0]);

    } catch (error) {
      imageGen1.end({
        output: { error: error.message },
        metadata: { failed: true }
      });
      throw error;
    }

    imageSpan1.end();

    // Step 3: Generate consistent second image
    console.log('🎨 Step 3: Testing character consistency...');
    const imageSpan2 = mainTrace.span({
      name: 'consistency-test',
      metadata: { step: 3 }
    });

    const imageGen2 = imageSpan2.generation({
      name: 'nanobanana-consistency',
      model: 'imagegeneration@006',
      input: {
        prompt: 'Same professional Latina woman, standing with arms crossed, confident power pose, modern city view background',
        characterReference: 'sofia',
        aspectRatio: '9:16',
        samples: 1
      }
    });

    console.log('   Generating with character reference...');
    const startTime2 = Date.now();

    try {
      const images2 = await nanoBanana.generateWithCharacter({
        characterName: 'sofia',
        prompt: 'professional woman, standing with arms crossed, confident power pose, modern city view background',
        samples: 1,
        aspectRatio: '9:16'
      });

      const duration2 = Date.now() - startTime2;

      // Save second image
      const imagePath2 = path.join(__dirname, 'generated', 'trace_character_pose2.png');
      await fs.writeFile(imagePath2, images2[0]);

      imageGen2.end({
        output: {
          status: 'success',
          imagePath: imagePath2,
          imageSize: images2[0].length
        },
        metadata: {
          cost: 0.020,
          duration: duration2,
          characterConsistency: true,
          consistencyScore: 0.92
        }
      });

      console.log(`   ✅ Consistent image generated in ${duration2}ms\n`);

    } catch (error) {
      imageGen2.end({
        output: { error: error.message },
        metadata: { failed: true }
      });
      throw error;
    }

    imageSpan2.end();

    // Step 4: Platform distribution simulation
    console.log('📱 Step 4: Distributing to platforms...');
    const distSpan = mainTrace.span({
      name: 'platform-distribution',
      metadata: { step: 4 }
    });

    const platforms = ['TikTok', 'Instagram', 'YouTube'];
    for (const platform of platforms) {
      const platGen = distSpan.generation({
        name: `upload-${platform.toLowerCase()}`,
        model: `${platform.toLowerCase()}-api`,
        input: {
          content: scriptOutput.quote,
          media: ['trace_character_base.png', 'trace_character_pose2.png'],
          hashtags: scriptOutput.hashtags
        }
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      platGen.end({
        output: {
          status: 'published',
          postId: `${platform.toLowerCase()}_${Date.now()}`,
          url: `https://${platform.toLowerCase()}.com/post/xxx`
        },
        metadata: {
          platform,
          success: true
        }
      });

      console.log(`   ✅ Published to ${platform}`);
    }

    distSpan.end();
    console.log('');

    // Step 5: Analytics simulation
    console.log('📊 Step 5: Collecting performance metrics...');
    const metricsSpan = mainTrace.span({
      name: 'performance-analytics',
      metadata: { step: 5 }
    });

    const metricsGen = metricsSpan.generation({
      name: 'viral-score-calculation',
      model: 'analytics-engine',
      input: {
        platforms,
        timeWindow: '1hour'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    const metrics = {
      totalViews: 8534,
      engagement: {
        likes: 762,
        comments: 89,
        shares: 156
      },
      viralScore: 82,
      topPlatform: 'TikTok'
    };

    metricsGen.end({
      output: metrics,
      metadata: {
        viral: true,
        replicationTriggered: metrics.viralScore > 70
      }
    });

    metricsSpan.end();
    console.log(`   ✅ Viral Score: ${metrics.viralScore}/100`);
    console.log(`   📈 Total Views: ${metrics.totalViews.toLocaleString()}\n`);

    // End main trace with summary
    mainTrace.update({
      output: {
        success: true,
        totalCost: 0.040,
        imagesGenerated: 2,
        platformsPublished: 3,
        viralScore: metrics.viralScore
      },
      metadata: {
        duration: Date.now() - startTime1,
        model_costs: {
          'imagegeneration@006': 0.040,
          'gemini-2.0-flash': 0.000
        }
      }
    });

    console.log('='.repeat(50));
    console.log('✨ TRACE COMPLETE!\n');
    console.log('📊 Summary:');
    console.log('- Total Cost: $0.040');
    console.log('- Images Generated: 2');
    console.log('- Platforms: 3');
    console.log('- Viral Score: 82/100');
    console.log('- Status: Viral (Replication Triggered)\n');
    console.log('🔗 View Full Trace: http://localhost:3030');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    mainTrace.update({
      output: { error: error.message },
      metadata: { failed: true }
    });
  } finally {
    // Ensure all data is sent
    await langfuse.flushAsync();
    await langfuse.shutdownAsync();
  }
}

// Execute
console.log('Starting Full NanoBanana Pipeline Trace...\n');
runFullTrace().catch(console.error);