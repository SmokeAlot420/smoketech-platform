// Test Pedro Generation Without Watermarks
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function testWatermarkRemoval() {
  console.log('🎨 TESTING PEDRO GENERATION WITHOUT WATERMARKS...\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // Test with a single hipster wardrobe generation (includes anti-watermark instruction)
    console.log('👔 Generating Pedro with anti-watermark hipster style...');
    const wardrobeResult = await ultraEngine.generateWardrobeStyleVariations('hipster');
    if (wardrobeResult) {
      console.log(`🎉 SUCCESS! Clean Pedro hipster image: ${wardrobeResult.imagePath}`);
    } else {
      console.log('❌ Failed to generate clean hipster Pedro');
    }

    console.log('\n✅ Watermark removal test completed!');
    console.log('📂 Check the generated image to verify no Gemini/Google watermarks appear');

  } catch (error) {
    console.error('❌ Watermark removal test failed:', error.message);
  }
}

testWatermarkRemoval();