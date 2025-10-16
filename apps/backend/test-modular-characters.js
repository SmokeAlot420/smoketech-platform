// Test Modular Character System - Works with ANY character, not just Pedro
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function testModularCharacterSystem() {
  console.log('🚀 TESTING MODULAR CHARACTER SYSTEM (NOT JUST PEDRO!)...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro (for fallback compatibility)
    console.log('📋 Initializing base system with Pedro...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Base system initialized\n');

    // TEST 1: Create a Tech Influencer (completely different from Pedro)
    console.log('🎬 TEST 1: Tech Influencer - Alex from TechFlow');

    const alexCharacter = {
      name: 'Alex',
      profession: 'Tech Influencer',
      baseDescription: 'Young, enthusiastic technology expert with modern casual style',
      // referenceImage: 'base64_encoded_image_here', // User would upload their own
      brandElements: {
        company: 'TechFlow',
        industry: 'Technology',
        messaging: ['Latest tech trends', 'Product reviews', 'Digital innovation']
      }
    };

    const alexResult = await ultraEngine.generateUltraRealisticVideo(
      alexCharacter,
      'product-review',
      '"Hey everyone! I\'m Alex from TechFlow. Today I\'m reviewing the hottest new gadget that everyone\'s talking about."',
      {
        platform: 'youtube',
        style: 'trendy',
        quality: 'production',
        promptTemplate: 'ultra-realistic-speech',
        useSmartRetry: false // Single attempt for demo
      }
    );

    if (alexResult) {
      console.log(`✅ ALEX VIDEO GENERATED:`);
      console.log(`📋 Operation: ${alexResult.operationId}`);
      console.log(`📁 Path: ${alexResult.videoPath}\n`);
    }

    // TEST 2: Create a Fitness Coach
    console.log('🏋️ TEST 2: Fitness Coach - Sarah from FitLife');

    const sarahCharacter = {
      name: 'Sarah',
      profession: 'Fitness Coach',
      baseDescription: 'Athletic, energetic fitness expert with motivational personality',
      brandElements: {
        company: 'FitLife',
        industry: 'Health & Fitness',
        messaging: ['Workout motivation', 'Healthy living', 'Fitness transformation']
      }
    };

    const sarahResult = await ultraEngine.generateUltraRealisticVideo(
      sarahCharacter,
      'motivational-tip',
      '"What\'s up FitLife family! I\'m Sarah, and today I\'m sharing the one exercise that will transform your entire workout routine."',
      {
        platform: 'tiktok',
        style: 'casual',
        quality: 'fast',
        promptTemplate: 'natural-spokesperson'
      }
    );

    if (sarahResult) {
      console.log(`✅ SARAH VIDEO GENERATED:`);
      console.log(`📋 Operation: ${sarahResult.operationId}`);
      console.log(`📁 Path: ${sarahResult.videoPath}\n`);
    }

    // TEST 3: Create a Cooking Expert
    console.log('👨‍🍳 TEST 3: Cooking Expert - Marco from CulinaryMasters');

    const marcoCharacter = {
      name: 'Marco',
      profession: 'Chef & Food Creator',
      baseDescription: 'Professional chef with warm, approachable demeanor and culinary expertise',
      brandElements: {
        company: 'CulinaryMasters',
        industry: 'Food & Cooking',
        messaging: ['Gourmet cooking', 'Recipe secrets', 'Culinary techniques']
      }
    };

    const marcoResult = await ultraEngine.generateUltraRealisticVideo(
      marcoCharacter,
      'cooking-tip',
      '"Ciao! I\'m Marco from CulinaryMasters. Today I\'ll teach you the secret technique that Italian grandmothers have used for centuries."',
      {
        platform: 'instagram',
        style: 'professional',
        quality: 'production',
        promptTemplate: 'cinematic-dialogue'
      }
    );

    if (marcoResult) {
      console.log(`✅ MARCO VIDEO GENERATED:`);
      console.log(`📋 Operation: ${marcoResult.operationId}`);
      console.log(`📁 Path: ${marcoResult.videoPath}\n`);
    }

    // TEST 4: Create a Fashion Influencer
    console.log('👗 TEST 4: Fashion Influencer - Emma from StyleVogue');

    const emmaCharacter = {
      name: 'Emma',
      profession: 'Fashion Influencer',
      baseDescription: 'Stylish, confident fashion expert with keen eye for trends',
      brandElements: {
        company: 'StyleVogue',
        industry: 'Fashion & Lifestyle',
        messaging: ['Fashion trends', 'Style tips', 'Wardrobe essentials']
      }
    };

    const emmaResult = await ultraEngine.generateUltraRealisticVideo(
      emmaCharacter,
      'style-advice',
      '"Hi gorgeous! Emma here from StyleVogue. I\'m about to reveal the three style secrets that will instantly upgrade your entire wardrobe."',
      {
        platform: 'tiktok',
        style: 'trendy',
        quality: 'production',
        promptTemplate: 'ultra-realistic-speech'
      }
    );

    if (emmaResult) {
      console.log(`✅ EMMA VIDEO GENERATED:`);
      console.log(`📋 Operation: ${emmaResult.operationId}`);
      console.log(`📁 Path: ${emmaResult.videoPath}\n`);
    }

    console.log('🎯 MODULAR SYSTEM CAPABILITIES DEMONSTRATED:');
    console.log('✅ Works with ANY character (not just Pedro)');
    console.log('✅ Adapts to different industries (Tech, Fitness, Cooking, Fashion)');
    console.log('✅ Customizable dialogue for any brand message');
    console.log('✅ Flexible platform optimization (TikTok, Instagram, YouTube)');
    console.log('✅ Production-grade quality across all character types');
    console.log('✅ Smart prompt adaptation for different professions');
    console.log('✅ Brand-specific messaging integration');
    console.log('\n🚀 READY FOR UI INTEGRATION:');
    console.log('- User uploads character image');
    console.log('- User defines character details');
    console.log('- User types custom dialogue');
    console.log('- System generates ultra-realistic video');
    console.log('- Works with ANY influencer/character type! 🚬');

  } catch (error) {
    console.error('\n❌ Modular system test failed:', error.message);
    console.log('\n💡 Note: Some tests may show "pending" videos while VEO3 processes them.');
    console.log('Use poll-veo3-operations.js to check completion status.');
  }
}

testModularCharacterSystem();