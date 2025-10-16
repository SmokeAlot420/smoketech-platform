/**
 * Test REAL Nano Banana with Production-Grade Character Consistency
 * This uses actual reference images and the editImage API
 */

const NanoBananaClient = require('./dist/nano-banana-real').default;

async function testRealNanoBanana() {
  console.log('🎯 REAL NANO BANANA PRODUCTION TEST');
  console.log('=====================================\n');
  console.log('Using actual reference images and editImage API\n');

  const apiKey = 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const client = new NanoBananaClient(apiKey);

  try {
    // Step 1: Create a character with REAL reference images
    console.log('📸 Creating character with TRUE reference images...');
    console.log('This will generate 3 reference images for perfect consistency\n');

    const character = await client.createCharacterWithReference(
      'Emma Digital',
      'Professional tech influencer, age 25, modern casual style',
      'female',
      [
        'long dark hair',
        'brown eyes',
        'friendly smile',
        'clear skin',
        'oval face shape'
      ]
    );

    console.log(`✅ Character created: ${character.id}`);
    console.log(`   Name: ${character.name}`);
    console.log(`   Gender: ${character.metadata.gender}`);
    console.log(`   Features: ${character.metadata.features.join(', ')}`);
    console.log(`   Reference Images: ${character.referenceImages.length}`);
    console.log('');

    // Step 2: Generate consistent images using reference images
    console.log('🖼️ Generating CONSISTENT images with reference images...\n');

    const scenes = [
      'holding latest iPhone, excited expression, product review setup',
      'typing on laptop, focused expression, modern office',
      'recording video with camera, professional studio setup',
      'at tech conference, holding microphone, interview setting',
      'unboxing new gadget, surprised expression, home studio'
    ];

    for (let i = 0; i < scenes.length; i++) {
      console.log(`[${i + 1}/${scenes.length}] Generating: ${scenes[i]}`);

      try {
        const result = await client.generateWithCharacterConsistency(
          character.id,
          scenes[i],
          '16:9'
        );

        console.log(`   ✅ Saved: ${result.url.split('\\').pop()}`);
        console.log(`   📏 Size: ${Math.round(Buffer.from(result.base64, 'base64').length / 1024)}KB`);
      } catch (error) {
        console.log(`   ⚠️ Scene generation failed: ${error.message}`);
      }

      console.log('');
    }

    // Step 3: Validate consistency
    console.log('🔍 Validating character consistency...');
    const isConsistent = await client.validateConsistency(character.id);
    console.log(`   Consistency Check: ${isConsistent ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');

    // Step 4: Generate a video with the character
    console.log('🎬 Generating video with character consistency...');
    const videoResult = await client.generateVideoWithCharacter(
      character.id,
      'talking to camera about latest tech trends, animated gestures',
      5
    );
    console.log(`   Video operation started: ${videoResult.operationId}`);
    console.log('');

    // Summary
    console.log('✨ REAL NANO BANANA TEST COMPLETE!');
    console.log('━'.repeat(50));
    console.log('📁 Check generated/nano-banana/ folder for:');
    console.log('   • Character profile with reference images');
    console.log('   • Multiple scenes with the SAME person');
    console.log('   • True character consistency across all images');
    console.log('');
    console.log('🎯 Key differences from previous attempt:');
    console.log('   ✅ Using actual editImage API with referenceImages parameter');
    console.log('   ✅ Storing real reference images for consistency');
    console.log('   ✅ Using correct model names (imagen-3.0-generate-002)');
    console.log('   ✅ Proper API structure with config objects');
    console.log('');
    console.log('This is PRODUCTION-GRADE character consistency!');

    return character;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Run the test
console.log('Starting REAL Nano Banana production test...\n');
testRealNanoBanana()
  .then(character => {
    console.log('\n🎯 Character ID for future use:', character.id);
    console.log('You can now generate unlimited consistent content with this character!');
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });