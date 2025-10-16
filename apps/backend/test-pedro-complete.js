// Complete Pedro QuoteMoto Ultra-Engine Generation Test
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function generateAllPedroContent() {
  console.log('🚀 GENERATING ALL PEDRO QUOTEMOTO CONTENT...');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('\n📋 PHASE 1: Initializing Pedro character...');
    const pedroCharacter = await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized:', pedroCharacter.name);

    // Test illustration-to-figure conversion
    console.log('\n🎯 PHASE 2: Generating illustration-to-figure conversion...');
    const figureResult = await ultraEngine.generateIllustrationToFigure();

    if (figureResult) {
      console.log('🎉 SUCCESS! Pedro figure conversion generated:', figureResult.imagePath);
    } else {
      console.log('❌ Failed to generate figure conversion');
    }

    // Test professional photography series
    console.log('\n📸 PHASE 3: Generating professional photography series...');
    const photoResult = await ultraEngine.generateProfessionalPhotographySeries(
      'studio',
      'three-quarter',
      'confident'
    );

    if (photoResult) {
      console.log('🎉 SUCCESS! Pedro professional photo generated:', photoResult.imagePath);
    } else {
      console.log('❌ Failed to generate professional photo');
    }

    // Generate multiple time periods
    console.log('\n⏰ PHASE 4: Generating multiple time periods...');
    const eras = ['1950s', '2000s', '2024'];

    for (const era of eras) {
      console.log(`📅 Generating ${era} Pedro...`);
      const eraResult = await ultraEngine.generateTimePeriodTransformation(era);

      if (eraResult) {
        console.log(`✅ ${era} Pedro generated: ${eraResult.imagePath}`);
      } else {
        console.log(`❌ Failed to generate ${era} Pedro`);
      }
    }

    // Calculate consistency score
    console.log('\n📊 FINAL ANALYSIS:');
    const consistencyScore = await ultraEngine.calculateConsistencyScore();
    console.log(`Pedro consistency score: ${consistencyScore}%`);

    const availableTechniques = await ultraEngine.getAdvancedTechniques();
    console.log(`Available techniques: ${availableTechniques.join(', ')}`);

    console.log('\n🎉 ALL PEDRO QUOTEMOTO GENERATION COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Complete Pedro generation failed:', error.message);
  }
}

generateAllPedroContent();