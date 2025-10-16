// Modular Character Video Generation API - Ready for UI Integration
require('dotenv').config();
const { UltraQuoteMotoCharacterEngine } = require('./dist/ultra-quotemoto-engine.js');

class ModularCharacterVideoAPI {
  constructor() {
    this.engine = new UltraQuoteMotoCharacterEngine();
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isInitialized) {
      await this.engine.initializePedroCharacter(); // Base system initialization
      this.isInitialized = true;
      console.log('🚀 Modular Character Video API initialized and ready!');
    }
  }

  /**
   * Generate ultra-realistic video for ANY character - Main API Method
   * This is what a UI would call when user submits their character
   */
  async generateCharacterVideo(userInput) {
    await this.initialize();

    // Validate user input
    const validation = this.validateInput(userInput);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // Extract character info from user input
    const character = {
      name: userInput.characterName,
      profession: userInput.profession,
      baseDescription: userInput.description,
      referenceImage: userInput.uploadedImage, // base64 from user upload
      brandElements: {
        company: userInput.companyName,
        industry: userInput.industry,
        messaging: userInput.brandMessages || []
      }
    };

    console.log(`🎬 Generating video for ${character.name} (${character.profession})`);

    // Generate the video
    return await this.engine.generateUltraRealisticVideo(
      character,
      userInput.contentType,
      userInput.dialogue,
      {
        platform: userInput.platform || 'youtube',
        style: userInput.style || 'professional',
        quality: userInput.quality || 'production',
        promptTemplate: userInput.promptTemplate || 'ultra-realistic-speech',
        useSmartRetry: userInput.useSmartRetry !== false
      }
    );
  }

  /**
   * Validate user input from UI
   */
  validateInput(input) {
    const errors = [];

    if (!input.characterName || input.characterName.trim().length === 0) {
      errors.push('Character name is required');
    }

    if (!input.profession || input.profession.trim().length === 0) {
      errors.push('Profession is required');
    }

    if (!input.dialogue || input.dialogue.trim().length === 0) {
      errors.push('Dialogue is required');
    }

    if (!input.dialogue.startsWith('"') || !input.dialogue.endsWith('"')) {
      errors.push('Dialogue should be wrapped in quotes for better lip sync');
    }

    if (input.platform && !['tiktok', 'instagram', 'youtube'].includes(input.platform)) {
      errors.push('Platform must be tiktok, instagram, or youtube');
    }

    if (input.quality && !['production', 'fast'].includes(input.quality)) {
      errors.push('Quality must be production or fast');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available options for UI dropdowns
   */
  getAvailableOptions() {
    return {
      platforms: ['tiktok', 'instagram', 'youtube'],
      styles: ['casual', 'professional', 'trendy'],
      qualities: ['production', 'fast'],
      promptTemplates: [
        {
          id: 'ultra-realistic-speech',
          name: 'Ultra Realistic Speech',
          description: 'Maximum lip sync accuracy and natural expressions'
        },
        {
          id: 'cinematic-dialogue',
          name: 'Cinematic Dialogue',
          description: 'Film-quality production with dramatic flair'
        },
        {
          id: 'natural-spokesperson',
          name: 'Natural Spokesperson',
          description: 'Conversational, approachable delivery'
        }
      ],
      contentTypes: [
        'product-review',
        'tutorial',
        'motivational-message',
        'brand-introduction',
        'testimonial',
        'viral-hook',
        'explainer',
        'announcement',
        'social-media-post'
      ]
    };
  }

  /**
   * Generate suggested dialogue based on character and content type
   */
  generateSuggestedDialogue(character, contentType, industry) {
    const templates = {
      'product-review': `"Hi everyone! I'm ${character.name}. Today I'm reviewing the latest ${industry} innovation that's changing everything."`,
      'tutorial': `"What's up! ${character.name} here. I'm about to teach you the exact technique I use to get incredible results."`,
      'motivational-message': `"Hey there! It's ${character.name}. I want to share something that completely transformed my approach to ${industry}."`,
      'brand-introduction': `"Hello! I'm ${character.name}, and I'm excited to introduce you to something revolutionary in ${industry}."`,
      'testimonial': `"I never believed it was possible until I tried it myself. I'm ${character.name}, and this is my story."`,
      'viral-hook': `"This ${industry} secret will blow your mind. I'm ${character.name}, and here's what nobody tells you."`,
      'explainer': `"Confused about ${industry}? I'm ${character.name}, and I'm here to break it down simply for you."`,
      'announcement': `"Big news! I'm ${character.name}, and I have something incredible to share with you today."`,
      'social-media-post': `"Quick question for you all! ${character.name} here with today's ${industry} tip that you need to know."`
    };

    return templates[contentType] || `"Hi! I'm ${character.name}, and I have something amazing to share with you today."`;
  }

  /**
   * Example method showing how UI would integrate this
   */
  async exampleUIIntegration() {
    // This simulates what a user would input through a UI form
    const userFormInput = {
      // Character details
      characterName: 'Jessica',
      profession: 'Marketing Expert',
      description: 'Energetic marketing professional with 10+ years experience',
      companyName: 'GrowthHackers',
      industry: 'Digital Marketing',
      brandMessages: ['Growth strategies', 'Marketing automation', 'ROI optimization'],

      // Content details
      contentType: 'tutorial',
      dialogue: '"Hey marketers! I\'m Jessica from GrowthHackers. Today I\'m revealing the 3-step system that increased our client ROI by 300%."',

      // Video settings
      platform: 'youtube', // Professional platform for marketing content
      style: 'professional',
      quality: 'production',
      promptTemplate: 'ultra-realistic-speech',

      // Advanced options
      useSmartRetry: true
      // uploadedImage: 'base64_image_data_here' // User would upload their photo
    };

    console.log('📝 UI Form Input Example:');
    console.log(JSON.stringify(userFormInput, null, 2));

    const result = await this.generateCharacterVideo(userFormInput);

    console.log('\n🎉 UI Integration Result:');
    console.log(`Video generated for ${userFormInput.characterName}`);
    console.log(`Operation: ${result.operationId}`);
    console.log(`Path: ${result.videoPath}`);

    return result;
  }
}

// Example usage for UI integration
async function demonstrateModularAPI() {
  const api = new ModularCharacterVideoAPI();

  console.log('🎯 MODULAR CHARACTER VIDEO API DEMONSTRATION\n');

  // Show available options for UI
  console.log('📋 Available Options for UI:');
  console.log(JSON.stringify(api.getAvailableOptions(), null, 2));

  // Example UI integration
  console.log('\n🖥️ Example UI Integration:');
  await api.exampleUIIntegration();

  console.log('\n✅ READY FOR CHATBOT/UI INTEGRATION:');
  console.log('1. User fills out character form');
  console.log('2. User uploads reference photo');
  console.log('3. User types/selects dialogue');
  console.log('4. System generates ultra-realistic video');
  console.log('5. Works with ANY character/industry! 🚬');
}

// Export for UI integration
module.exports = { ModularCharacterVideoAPI };

// Run demonstration if called directly
if (require.main === module) {
  demonstrateModularAPI();
}