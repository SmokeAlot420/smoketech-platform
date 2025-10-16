// Test Pedro QuoteMoto Ultra-Engine Generation
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function testPedroGeneration() {
  console.log('🧪 Testing Pedro QuoteMoto Ultra-Engine...');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 Initializing Pedro character...');
    const pedroCharacter = await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized:', pedroCharacter.name);

    // Test multi-hairstyle grid generation
    console.log('💇‍♂️ Generating multi-hairstyle grid...');
    const hairstyleResult = await ultraEngine.generateMultiHairstyleGrid();

    if (hairstyleResult) {
      console.log('🎉 SUCCESS! Pedro multi-hairstyle grid generated:', hairstyleResult.imagePath);
    } else {
      console.log('❌ Failed to generate hairstyle grid');
    }

    // Test time period transformation
    console.log('⏰ Generating 1980s time period transformation...');
    const timeResult = await ultraEngine.generateTimePeriodTransformation('1980s');

    if (timeResult) {
      console.log('🎉 SUCCESS! Pedro 1980s transformation generated:', timeResult.imagePath);
    } else {
      console.log('❌ Failed to generate time transformation');
    }

  } catch (error) {
    console.error('❌ Pedro generation test failed:', error.message);
  }
}

testPedroGeneration();