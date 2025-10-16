/**
 * Demo Nano Banana Character Generation
 * Creates a consistent influencer and generates images
 */

const GoogleMediaClient = require('./dist/google-media-client').default;
const fs = require('fs');
const path = require('path');

async function demoNanoBanana() {
  console.log('🎨 NANO BANANA CHARACTER DEMO');
  console.log('=============================\n');

  const apiKey = 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const client = new GoogleMediaClient(apiKey);

  try {
    // Step 1: Create a character profile
    console.log('📸 Creating Tech Influencer Character...');
    console.log('This will generate 3 reference images for consistency\n');

    const character = await client.createCharacter(
      'Sophia Digital',
      'Young female tech content creator, 24 years old, shoulder-length dark hair with subtle purple highlights, warm brown eyes, friendly and approachable expression, modern casual style with tech-savvy aesthetic',
      'ultra-realistic portrait, professional photography, consistent facial features, high detail, natural lighting'
    );

    console.log(`✅ Character Created: ${character.id}`);
    console.log(`   Name: ${character.name}`);
    console.log(`   Reference Images: ${character.referenceImages.length} created`);
    console.log(`   Profile saved to: generated/characters/${character.id}.json\n`);

    // Step 2: Generate consistent images with the character
    console.log('🖼️ Generating Consistent Content with Sophia...\n');

    // Scene 1: Product Review
    console.log('[1/3] Generating: Product Review Scene');
    const reviewImage = await client.generateWithCharacter(character.id, {
      prompt: 'reviewing new iPhone 16 Pro, holding phone up to camera, excited expression, professional studio setup with ring light',
      aspectRatio: '16:9'
    });
    console.log(`✅ Saved: ${reviewImage.url.split('/').pop()}\n`);

    // Scene 2: Coding Tutorial
    console.log('[2/3] Generating: Coding Tutorial Scene');
    const codingImage = await client.generateWithCharacter(character.id, {
      prompt: 'sitting at modern desk setup, multiple monitors showing code, explaining to camera, RGB lighting, developer environment',
      aspectRatio: '16:9'
    });
    console.log(`✅ Saved: ${codingImage.url.split('/').pop()}\n`);

    // Scene 3: Outdoor Tech Event
    console.log('[3/3] Generating: Tech Event Scene');
    const eventImage = await client.generateWithCharacter(character.id, {
      prompt: 'at tech conference, wearing event badge, holding microphone for interview, busy convention center background',
      aspectRatio: '16:9'
    });
    console.log(`✅ Saved: ${eventImage.url.split('/').pop()}\n`);

    console.log('✨ NANO BANANA DEMO COMPLETE!');
    console.log('━'.repeat(40));
    console.log('📁 Check the "generated" folder to see:');
    console.log('   • 3 reference images of Sophia');
    console.log('   • 3 content scenes with the SAME character');
    console.log('   • Character profile JSON file');
    console.log('\n💡 Notice how Sophia maintains:');
    console.log('   • Same facial features');
    console.log('   • Same hair style and color');
    console.log('   • Consistent appearance across scenes');
    console.log('\nThis is the power of Nano Banana character consistency!');

    // Show file paths
    const generatedDir = path.join(process.cwd(), 'generated');
    console.log('\n📍 Generated Files Location:');
    console.log(`   ${generatedDir}\\`);

    return character;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run the demo
console.log('Starting Nano Banana Character Demo...\n');
demoNanoBanana()
  .then(character => {
    console.log('\n🎯 Character ID for future use:', character.id);
    console.log('You can use this ID to generate more content with the same character!');
  })
  .catch(console.error);