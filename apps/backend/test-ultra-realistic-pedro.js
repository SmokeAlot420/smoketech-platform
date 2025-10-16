// Test Ultra-Realistic Pedro Video Generation with Production-Grade Enhancements
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function testUltraRealisticPedro() {
  console.log('🚀 TESTING ULTRA-REALISTIC PEDRO VIDEO GENERATION...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized with advanced techniques\n');

    // Test 1: Production-grade video with smart retry
    console.log('🎥 TEST 1: Ultra-realistic Pedro with smart retry system...');
    console.log('🎯 Settings: Production quality, ultra-realistic-speech template, smart retry enabled');

    const test1Result = await ultraEngine.generateUltraRealisticPedroVideo('viral-hook', {
      platform: 'youtube',
      style: 'professional',
      quality: 'production',
      promptTemplate: 'ultra-realistic-speech',
      useSmartRetry: true
    });

    if (test1Result) {
      console.log(`\n🎉 TEST 1 RESULTS:`);
      console.log(`📋 Operation ID: ${test1Result.operationId}`);
      console.log(`📁 Video Location: ${test1Result.videoPath}`);
      console.log(`🔄 Attempts Used: ${test1Result.attempts || 1}`);

      if (test1Result.quality) {
        console.log(`📊 Quality Metrics:`);
        console.log(`   - Overall Quality: ${(test1Result.quality.overallQuality * 100).toFixed(0)}%`);
        console.log(`   - Lip Sync Quality: ${(test1Result.quality.lipSyncQuality * 100).toFixed(0)}%`);
        console.log(`   - Facial Consistency: ${(test1Result.quality.facialConsistency * 100).toFixed(0)}%`);
        console.log(`   - Production Grade: ${test1Result.quality.productionGrade ? '✅ Yes' : '❌ No'}`);

        if (test1Result.quality.issues && test1Result.quality.issues.length > 0) {
          console.log(`   - Issues: ${test1Result.quality.issues.join(', ')}`);
        }

        if (test1Result.quality.recommendations && test1Result.quality.recommendations.length > 0) {
          console.log(`   - Recommendations: ${test1Result.quality.recommendations.join(', ')}`);
        }
      }

      // Test 2: Different prompt template
      console.log('\n🎬 TEST 2: Cinematic dialogue template...');

      const test2Result = await ultraEngine.generateUltraRealisticPedroVideo('testimonial', {
        platform: 'instagram',
        style: 'professional',
        quality: 'production',
        promptTemplate: 'cinematic-dialogue',
        useSmartRetry: false // Test single generation
      });

      if (test2Result) {
        console.log(`\n🎉 TEST 2 RESULTS:`);
        console.log(`📋 Operation ID: ${test2Result.operationId}`);
        console.log(`📁 Video Location: ${test2Result.videoPath}`);

        if (test2Result.quality) {
          console.log(`📊 Quality: ${(test2Result.quality.overallQuality * 100).toFixed(0)}%`);
        }
      }

      // Test 3: Natural spokesperson template
      console.log('\n🎤 TEST 3: Natural spokesperson template...');

      const test3Result = await ultraEngine.generateProductionGradeVideo('insurance-tips', {
        platform: 'tiktok',
        style: 'trendy',
        quality: 'fast',
        promptTemplate: 'natural-spokesperson'
      });

      if (test3Result) {
        console.log(`\n🎉 TEST 3 RESULTS:`);
        console.log(`📋 Operation ID: ${test3Result.operationId}`);
        console.log(`📁 Video Location: ${test3Result.videoPath}`);
      }

      console.log('\n✅ PRODUCTION-GRADE ENHANCEMENTS SUMMARY:');
      console.log('🔧 Enhanced prompt templates with facial quality keywords');
      console.log('🚫 Negative prompts to prevent distortions');
      console.log('📺 1080p resolution support for higher quality');
      console.log('🔍 Facial quality analyzer with production metrics');
      console.log('🔄 Smart retry system with parameter adjustment');
      console.log('🎯 Dialogue formatting for better lip sync');
      console.log('🌟 Seed parameter for consistency improvements');

    } else {
      console.log('\n❌ Ultra-realistic video generation failed');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('- GEMINI_API_KEY is set in .env file');
    console.log('- Pedro character images exist in the correct directory');
    console.log('- TypeScript code has been compiled (npm run build)');
  }
}

testUltraRealisticPedro();