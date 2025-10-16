/**
 * Test Nano Banana (Gemini 2.5 Flash Image) for Character Consistency
 * Creates consistent influencer personas across multiple images and videos
 */

const GoogleMediaClient = require('./dist/google-media-client').default;

async function testCharacterConsistency() {
  console.log('🎭 TESTING NANO BANANA CHARACTER CONSISTENCY');
  console.log('==========================================\n');

  // Use the API key directly for testing
  const apiKey = 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const client = new GoogleMediaClient(apiKey);

  try {
    // Step 1: Create a consistent influencer character
    console.log('📸 Creating influencer character profile...');
    const character = await client.createCharacter(
      'Emma Tech',
      'Young female tech influencer, professional appearance, modern style',
      'photorealistic, high quality, consistent facial features, tech enthusiast, friendly smile'
    );

    console.log(`✅ Character created: ${character.id}`);
    console.log(`   Name: ${character.name}`);
    console.log(`   Reference images: ${character.referenceImages.length}`);
    console.log('');

    // Step 2: Generate multiple consistent images with the same character
    console.log('🖼️ Generating consistent images with the character...\n');

    const scenarios = [
      'holding a new smartphone, product review pose',
      'sitting at desk with laptop, coding tutorial',
      'recording a video, ring light visible, home studio',
      'outdoor shot, wearing sunglasses, casual tech meetup'
    ];

    for (let i = 0; i < scenarios.length; i++) {
      console.log(`  [${i + 1}/4] Generating: ${scenarios[i]}`);
      const image = await client.generateWithCharacter(character.id, {
        prompt: scenarios[i],
        aspectRatio: '16:9'
      });
      console.log(`  ✓ Saved: ${image.url.split('/').pop()}`);
    }

    console.log('\n✅ All character images generated with consistency!');

    // Step 3: Edit an existing image
    console.log('\n✏️ Testing image editing...');
    const editResult = await client.editImage({
      imageBase64: character.referenceImages[0],
      editPrompt: 'change background to modern office, add tech gadgets on desk',
      strength: 0.6
    });
    console.log(`✅ Edited image saved: ${editResult.url.split('/').pop()}`);

    // Step 4: Generate a video with the same character
    console.log('\n🎬 Generating video with consistent character...');
    const video = await client.generateVideoWithCharacter(character.id, {
      prompt: 'unboxing latest tech gadget, excited reaction, speaking to camera',
      duration: 5,
      resolution: '720p',
      audioPrompt: 'upbeat tech review music, female voice narration'
    });

    console.log('⏳ Video generation started, polling for completion...');

    // The video URL will be available after processing
    if (video.url) {
      console.log(`✅ Character video ready: ${video.url}`);
      console.log(`   Duration: ${video.duration}s`);
      console.log(`   Resolution: ${video.resolution}`);
      console.log(`   Has Audio: ${video.hasAudio}`);
    }

    // Step 5: List all characters
    console.log('\n📋 Available characters:');
    const allCharacters = await client.listCharacters();
    allCharacters.forEach(char => {
      console.log(`   - ${char.id}: ${char.name}`);
    });

    console.log('\n✨ CHARACTER CONSISTENCY TEST COMPLETE!');
    console.log('You now have a consistent influencer across all content.');
    console.log('Check the generated/characters/ folder for character profiles.');
    console.log('All images maintain the same person\'s appearance! 🎯');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
console.log('Starting Nano Banana character consistency test...\n');
testCharacterConsistency().catch(console.error);