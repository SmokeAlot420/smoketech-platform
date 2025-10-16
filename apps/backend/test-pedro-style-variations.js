// Complete Pedro QuoteMoto Style Variations Test
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

async function generateAllPedroStyleVariations() {
  console.log('🎨 GENERATING ALL PEDRO STYLE VARIATIONS...');
  console.log('Demonstrating 46+ advanced techniques with modern styling!\n');

  try {
    const ultraEngine = new UltraQuoteMotoCharacterEngine();

    // Initialize Pedro character
    console.log('📋 PHASE 1: Initializing Pedro character...');
    await ultraEngine.initializePedroCharacter();
    console.log('✅ Pedro initialized\n');

    // ===========================================================================
    // PHASE 1A: MODERN HAIRSTYLE VARIATIONS
    // ===========================================================================
    console.log('✂️ PHASE 1A: Generating Modern Hairstyle Variations...\n');

    console.log('👨‍💼 Creating Short Professional Hairstyles...');
    const shortProfessionalHair = await ultraEngine.generateModernHairstyleVariations('short-professional');
    if (shortProfessionalHair) {
      console.log(`🎉 SUCCESS! Short professional hairstyles: ${shortProfessionalHair.imagePath}`);
    } else {
      console.log('❌ Failed to generate short professional hairstyles');
    }

    console.log('\n🎯 Creating Trendy Modern Hairstyles...');
    const trendyModernHair = await ultraEngine.generateModernHairstyleVariations('trendy-modern');
    if (trendyModernHair) {
      console.log(`🎉 SUCCESS! Trendy modern hairstyles: ${trendyModernHair.imagePath}`);
    } else {
      console.log('❌ Failed to generate trendy modern hairstyles');
    }

    // ===========================================================================
    // PHASE 2: WARDROBE STYLE VARIATIONS
    // ===========================================================================
    console.log('\n👔 PHASE 2: Generating Wardrobe Style Variations...\n');

    const wardrobeStyles = ['hipster', 'streetwear', 'tech-bro', 'athleisure', 'formal-modern'];

    for (const style of wardrobeStyles) {
      console.log(`🎽 Creating ${style} wardrobe...`);
      const wardrobeResult = await ultraEngine.generateWardrobeStyleVariations(style);
      if (wardrobeResult) {
        console.log(`🎉 SUCCESS! ${style} wardrobe: ${wardrobeResult.imagePath}`);
      } else {
        console.log(`❌ Failed to generate ${style} wardrobe`);
      }
    }

    // ===========================================================================
    // PHASE 3: COMBINATION MATRIX (Hair + Wardrobe)
    // ===========================================================================
    console.log('\n🎨 PHASE 3: Generating Style Combinations...\n');

    const combinations = [
      { hair: 'buzz', wardrobe: 'athletic', desc: 'Military Gym Pedro' },
      { hair: 'man-bun', wardrobe: 'hipster', desc: 'Hipster Pedro' },
      { hair: 'fade', wardrobe: 'tech', desc: 'Tech Startup Pedro' },
      { hair: 'slicked', wardrobe: 'formal', desc: 'Wall Street Pedro' },
      { hair: 'messy', wardrobe: 'streetwear', desc: 'Urban Pedro' },
      { hair: 'quiff', wardrobe: 'hipster', desc: 'Creative Pedro' }
    ];

    for (const combo of combinations) {
      console.log(`🎭 Creating ${combo.desc} (${combo.hair} + ${combo.wardrobe})...`);
      const comboResult = await ultraEngine.generateStyleCombination(combo.hair, combo.wardrobe);
      if (comboResult) {
        console.log(`🎉 SUCCESS! ${combo.desc}: ${comboResult.imagePath}`);
      } else {
        console.log(`❌ Failed to generate ${combo.desc}`);
      }
    }

    // ===========================================================================
    // PHASE 4: SPECIAL SHOWCASES
    // ===========================================================================
    console.log('\n📈 PHASE 4: Generating Special Showcases...\n');

    console.log('📊 Creating Pedro Style Evolution Timeline...');
    const evolutionResult = await ultraEngine.generateStyleEvolution();
    if (evolutionResult) {
      console.log(`🎉 SUCCESS! Style evolution timeline: ${evolutionResult.imagePath}`);
    } else {
      console.log('❌ Failed to generate style evolution');
    }

    console.log('\n🕵️ Creating Pedro Undercover Series...');
    const undercoverResult = await ultraEngine.generateUndercoverSeries();
    if (undercoverResult) {
      console.log(`🎉 SUCCESS! Undercover series: ${undercoverResult.imagePath}`);
    } else {
      console.log('❌ Failed to generate undercover series');
    }

    // ===========================================================================
    // PHASE 5: TRADITIONAL TECHNIQUES WITH NEW STYLES
    // ===========================================================================
    console.log('\n🎯 PHASE 5: Demonstrating Traditional Techniques with New Styles...\n');

    console.log('💇 Generating updated multi-hairstyle grid...');
    const updatedGrid = await ultraEngine.generateMultiHairstyleGrid();
    if (updatedGrid) {
      console.log(`🎉 SUCCESS! Updated hairstyle grid: ${updatedGrid.imagePath}`);
    } else {
      console.log('❌ Failed to generate updated grid');
    }

    console.log('\n🎭 Generating illustration-to-figure with modern styling...');
    const modernFigure = await ultraEngine.generateIllustrationToFigure();
    if (modernFigure) {
      console.log(`🎉 SUCCESS! Modern figure conversion: ${modernFigure.imagePath}`);
    } else {
      console.log('❌ Failed to generate modern figure');
    }

    // ===========================================================================
    // FINAL ANALYSIS
    // ===========================================================================
    console.log('\n📊 FINAL ANALYSIS:');
    const consistencyScore = await ultraEngine.calculateConsistencyScore();
    console.log(`Pedro consistency score across all styles: ${consistencyScore}%`);

    const pedroCharacter = await ultraEngine.getPedroCharacter();
    console.log(`Total advanced techniques used: ${pedroCharacter.metadata.advancedTechniquesUsed.length}`);
    console.log(`Total generations completed: ${pedroCharacter.metadata.totalGenerations}`);

    console.log('\n🎉 ALL PEDRO STYLE VARIATIONS COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n📂 Check the generated/quotemoto/advanced-techniques/ folder for all variations!');

  } catch (error) {
    console.error('❌ Pedro style variations generation failed:', error.message);
  }
}

generateAllPedroStyleVariations();