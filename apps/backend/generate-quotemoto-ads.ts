import { UnifiedPromptSystem, UnifiedConfig } from './src/enhancement/unifiedPromptSystem';
import { CharacterIdentity } from './src/enhancement/characterConsistency';

interface BrandElements {
  name: string;
  colors: string[];
  logoPlacement: string;
  messaging: {
    primary: string;
    secondary: string;
    cta: string;
  };
  typography: string;
  visualStyle: string;
}

interface QuoteMotoAdScenario {
  id: string;
  name: string;
  setting: string;
  messageType: 'savings' | 'dui-friendly' | 'quick-quote' | 'customer-service' | 'testimonial';
  environment: 'office' | 'car' | 'studio' | 'outdoor' | 'home' | 'dealership';
  cameraAngle: 'professional-headshot' | 'medium-shot' | 'full-body' | 'environmental';
  mood: 'trustworthy' | 'friendly' | 'professional' | 'approachable' | 'confident';
}

class QuoteMotoAdGenerator {
  private unifiedSystem: UnifiedPromptSystem;
  private ariaIdentity: CharacterIdentity;
  private quoteMotoBlue: string = '#0066CC'; // QuoteMoto brand blue
  private quoteMotoOrange: string = '#FF6B35'; // QuoteMoto brand orange

  constructor() {
    this.unifiedSystem = new UnifiedPromptSystem();

    // Ultra-realistic Aria identity for professional advertising
    // Using the established Sophia identity as a base and customizing for QuoteMoto
    this.ariaIdentity = {
      name: 'Aria',
      coreFeatures: {
        faceShape: 'Heart-shaped with defined cheekbones',
        eyeShape: 'Almond-shaped, slightly asymmetrical (natural)',
        eyeColor: 'Warm brown with golden flecks',
        eyebrowShape: 'Naturally arched, medium thickness',
        noseShape: 'Straight, well-proportioned',
        lipShape: 'Full, naturally defined',
        jawline: 'Soft with subtle definition',
        cheekbones: 'Prominent, naturally defined',
        skinTone: 'Warm olive with natural undertones',
        hairColor: 'Rich dark brown with subtle highlights',
        hairTexture: 'Naturally wavy, professional shoulder-length'
      },
      distinctiveMarks: {
        moles: [
          { location: 'Left cheek near eye', size: 'small', description: 'Subtle beauty mark' }
        ],
        freckles: { pattern: 'light', density: 'subtle', locations: ['nose bridge', 'upper cheeks'] },
        scars: [],
        asymmetry: [
          { feature: 'eyes', variation: 'left eye slightly smaller (natural)' },
          { feature: 'eyebrows', variation: 'slight natural variation in arch' }
        ]
      },
      personalityTraits: {
        defaultExpression: 'Professional, trustworthy, approachable',
        eyeExpression: 'Warm, confident, understanding',
        smileType: 'Professional, genuine, reassuring',
        energyLevel: 'Calm confidence, professional authority'
      }
    };
  }

  private getQuoteMotoBrandElements(): BrandElements {
    return {
      name: 'QuoteMoto',
      colors: [this.quoteMotoBlue, this.quoteMotoOrange, '#FFFFFF'],
      logoPlacement: 'subtle-professional',
      messaging: {
        primary: 'Save money on car insurance, QuoteMoto',
        secondary: 'DUI no problem, QuoteMoto',
        cta: 'Get your quote today at QuoteMoto.com'
      },
      typography: 'Clean, modern, trustworthy',
      visualStyle: 'Professional insurance industry standard'
    };
  }

  generateProfessionalAdScenarios(): QuoteMotoAdScenario[] {
    return [
      // Office/Studio Professional Shots
      {
        id: 'aria-office-savings',
        name: 'Aria - Office Savings Expert',
        setting: 'Modern professional office with QuoteMoto branding',
        messageType: 'savings',
        environment: 'office',
        cameraAngle: 'professional-headshot',
        mood: 'trustworthy'
      },
      {
        id: 'aria-studio-dui-friendly',
        name: 'Aria - Studio DUI Specialist',
        setting: 'Professional studio with insurance documentation backdrop',
        messageType: 'dui-friendly',
        environment: 'studio',
        cameraAngle: 'medium-shot',
        mood: 'approachable'
      },

      // Automotive Settings
      {
        id: 'aria-car-quick-quote',
        name: 'Aria - In-Car Quote Demo',
        setting: 'Inside modern vehicle showing mobile quote process',
        messageType: 'quick-quote',
        environment: 'car',
        cameraAngle: 'medium-shot',
        mood: 'friendly'
      },
      {
        id: 'aria-dealership-expert',
        name: 'Aria - Dealership Insurance Expert',
        setting: 'Car dealership showroom with vehicles in background',
        messageType: 'customer-service',
        environment: 'dealership',
        cameraAngle: 'environmental',
        mood: 'professional'
      },

      // Customer Service Scenarios
      {
        id: 'aria-consultation-desk',
        name: 'Aria - Customer Consultation',
        setting: 'Professional consultation desk with insurance documents',
        messageType: 'customer-service',
        environment: 'office',
        cameraAngle: 'medium-shot',
        mood: 'trustworthy'
      },
      {
        id: 'aria-outdoor-testimonial',
        name: 'Aria - Outdoor Brand Testimonial',
        setting: 'Clean outdoor setting with subtle QuoteMoto elements',
        messageType: 'testimonial',
        environment: 'outdoor',
        cameraAngle: 'full-body',
        mood: 'confident'
      }
    ];
  }

  generateEnterpriseAdPrompt(scenario: QuoteMotoAdScenario): string {
    const brandElements = this.getQuoteMotoBrandElements();

    // Base professional prompt with scenario-specific elements
    const basePrompt = this.buildScenarioPrompt(scenario);

    // Create unified configuration for ultra-realistic professional advertising
    const config: UnifiedConfig = {
      character: {
        identity: this.ariaIdentity,
        preserveIdentity: true,
        consistencyLevel: 'absolute'
      },
      quality: {
        skinRealism: {
          age: 28,
          gender: 'female',
          ethnicity: 'Mixed heritage',
          skinTone: 'olive',
          imperfectionTypes: ['pores', 'freckles', 'asymmetry'],
          overallIntensity: 'minimal'
        },
        photography: {
          photographyStyle: 'commercial',
          qualityLevel: '8K',
          lightingSetup: 'studio',
          cameraAngle: 'eye-level',
          postProcessing: 'professional',
          colorGrading: 'commercial'
        },
        resolution: '8K',
        professionalGrade: true
      },
      brand: {
        colors: brandElements.colors,
        context: 'Insurance advertising campaign',
        messaging: brandElements.messaging.primary,
        professionalLevel: 'corporate'
      },
      viral: {
        targetPlatform: 'cross-platform',
        viralTechniques: [1, 3, 14], // Universal realism + Professional photography + Brand integration
        engagementGoal: 'brand-recognition',
        viralPotential: 'high'
      }
    };

    // Generate enhanced prompt using unified system
    const result = this.unifiedSystem.generateEnhancedPrompt(basePrompt, config);

    return result.finalPrompt;
  }

  private buildScenarioPrompt(scenario: QuoteMotoAdScenario): string {
    const settingDetails = this.getSettingDetails(scenario);
    const messageDetails = this.getMessageDetails(scenario);
    const technicalSpecs = this.getTechnicalSpecs(scenario);

    return `
Ultra-professional insurance commercial photograph of Aria, 28-year-old mixed Latina/European insurance expert and QuoteMoto spokesperson.

SCENARIO: ${scenario.name}
${settingDetails}

ARIA'S APPEARANCE:
- Professional business attire with QuoteMoto blue polo/blazer
- Heart-shaped face with defined cheekbones
- Warm brown eyes with golden flecks, natural asymmetry
- Rich dark brown hair, professional shoulder-length waves
- Warm olive skin with natural undertones
- Confident, trustworthy expression perfect for insurance advertising

BRAND INTEGRATION:
${messageDetails}
- Subtle QuoteMoto logo placement on clothing/materials
- Brand colors: ${this.quoteMotoBlue} blue, ${this.quoteMotoOrange} orange, white
- Clean, trustworthy visual style

TECHNICAL REQUIREMENTS:
${technicalSpecs}
- Enterprise commercial photography quality
- Professional lighting setup
- Sharp focus, commercial-ready resolution
- Advertising industry standard composition

CRITICAL REALISM:
- Natural skin texture with subtle imperfections
- Professional makeup suitable for commercial photography
- Confident body language appropriate for insurance expert
- Genuine, trustworthy facial expression
- Real-world lighting and shadows
`;
  }

  private getSettingDetails(scenario: QuoteMotoAdScenario): string {
    const settingMap = {
      'office': 'Modern professional office with clean desk, computer, insurance documents, QuoteMoto branded materials visible in background',
      'studio': 'Professional photography studio with neutral backdrop, subtle QuoteMoto branding elements, clean commercial lighting',
      'car': 'Interior of modern, clean vehicle with smartphone showing QuoteMoto app, professional automotive setting',
      'dealership': 'Bright car dealership showroom with vehicles in background, professional sales environment',
      'outdoor': 'Clean outdoor setting with professional backdrop, minimal distractions, natural lighting',
      'home': 'Clean, professional home office setting with QuoteMoto materials visible'
    };

    return settingMap[scenario.environment] || 'Professional setting';
  }

  private getMessageDetails(scenario: QuoteMotoAdScenario): string {
    const messageMap = {
      'savings': 'Aria explaining car insurance savings with confident, helpful expression - "Save money on car insurance, QuoteMoto"',
      'dui-friendly': 'Aria providing reassuring consultation about DUI insurance options - "DUI no problem, QuoteMoto"',
      'quick-quote': 'Aria demonstrating the quick quote process on mobile device with friendly, approachable demeanor',
      'customer-service': 'Aria in customer consultation pose, professional and trustworthy, helping with insurance needs',
      'testimonial': 'Aria delivering confident brand testimonial with authentic, trustworthy expression'
    };

    return messageMap[scenario.messageType] || 'Professional insurance consultation';
  }

  private getTechnicalSpecs(scenario: QuoteMotoAdScenario): string {
    const cameraMap = {
      'professional-headshot': 'Professional headshot framing, shoulders up, direct eye contact with camera',
      'medium-shot': 'Medium shot from waist up, professional posture, slight angle for dynamic composition',
      'full-body': 'Full body professional shot with appropriate business posture and confident stance',
      'environmental': 'Environmental shot showing Aria in context of setting, professional interaction pose'
    };

    return cameraMap[scenario.cameraAngle] || 'Professional commercial photography angle';
  }

  async generateCompleteQuoteMotoAds(): Promise<{
    scenario: QuoteMotoAdScenario;
    prompt: string;
    recommendedSettings: any;
  }[]> {
    const scenarios = this.generateProfessionalAdScenarios();
    const adCampaign = [];

    for (const scenario of scenarios) {
      const prompt = this.generateEnterpriseAdPrompt(scenario);

      const recommendedSettings = {
        model: 'gemini-2.5-flash-image-preview', // NanoBanana
        aspectRatio: scenario.cameraAngle === 'full-body' ? '9:16' : '4:5',
        quality: 'enterprise',
        stylePreset: 'commercial-photography',
        enhancedRealism: true,
        brandConsistency: true
      };

      adCampaign.push({
        scenario,
        prompt,
        recommendedSettings
      });
    }

    return adCampaign;
  }

  // VEO3 Video Commercial Generation
  generateVEO3VideoPrompts(scenario: QuoteMotoAdScenario): {
    imageToVideoPrompt: string;
    videoDescription: string;
  } {
    const videoPromptMap = {
      'savings': {
        imageToVideoPrompt: 'Aria looks directly at camera with confident smile, slight head nod, professional hand gesture explaining savings, 3-second commercial-quality movement',
        videoDescription: 'Professional insurance commercial: Aria explains car insurance savings with trustworthy demeanor'
      },
      'dui-friendly': {
        imageToVideoPrompt: 'Aria maintains reassuring eye contact, gentle understanding expression, professional consulting gesture, empathetic but confident movement',
        videoDescription: 'Compassionate insurance consultation: Aria provides DUI-friendly insurance guidance'
      },
      'quick-quote': {
        imageToVideoPrompt: 'Aria demonstrates mobile app with animated hand movements, looks between phone and camera, friendly approachable expression',
        videoDescription: 'Mobile insurance demo: Aria shows quick quote process on smartphone'
      },
      'customer-service': {
        imageToVideoPrompt: 'Aria maintains professional posture, slight forward lean showing engagement, confident consulting gestures, trustworthy interaction',
        videoDescription: 'Professional consultation: Aria providing expert insurance guidance'
      },
      'testimonial': {
        imageToVideoPrompt: 'Aria delivers confident testimonial with authentic expression, natural professional movements, direct camera engagement',
        videoDescription: 'Brand testimonial: Aria endorses QuoteMoto insurance with professional confidence'
      }
    };

    return videoPromptMap[scenario.messageType] || {
      imageToVideoPrompt: 'Professional insurance expert movement with confident expression',
      videoDescription: 'QuoteMoto insurance commercial'
    };
  }
}

// Main execution function
async function generateQuoteMotoAdCampaign() {
  console.log('🎬 Generating QuoteMoto Enterprise Ad Campaign with Ultra-Realistic Aria...\n');

  const generator = new QuoteMotoAdGenerator();
  const adCampaign = await generator.generateCompleteQuoteMotoAds();

  console.log(`📸 Generated ${adCampaign.length} professional ad scenarios:\n`);

  adCampaign.forEach((ad, index) => {
    console.log(`--- AD ${index + 1}: ${ad.scenario.name} ---`);
    console.log(`Setting: ${ad.scenario.setting}`);
    console.log(`Message: ${ad.scenario.messageType.toUpperCase()}`);
    console.log(`Environment: ${ad.scenario.environment}`);
    console.log(`Mood: ${ad.scenario.mood}`);
    console.log('\n📝 ENTERPRISE PROMPT:');
    console.log(ad.prompt);
    console.log('\n⚙️ RECOMMENDED SETTINGS:');
    console.log(JSON.stringify(ad.recommendedSettings, null, 2));

    // Add VEO3 video prompts
    const videoPrompts = generator.generateVEO3VideoPrompts(ad.scenario);
    console.log('\n🎥 VEO3 VIDEO PROMPTS:');
    console.log(`Image-to-Video: ${videoPrompts.imageToVideoPrompt}`);
    console.log(`Description: ${videoPrompts.videoDescription}`);
    console.log('\n' + '='.repeat(80) + '\n');
  });

  return adCampaign;
}

// Execute if run directly
if (require.main === module) {
  generateQuoteMotoAdCampaign()
    .then(campaign => {
      console.log('✅ QuoteMoto Ad Campaign Generated Successfully!');
      console.log(`📊 Total Ads: ${campaign.length}`);
      console.log('🚀 Ready for NanoBanana image generation and VEO3 video production');
    })
    .catch(error => {
      console.error('❌ Error generating ad campaign:', error);
    });
}

export { QuoteMotoAdGenerator, QuoteMotoAdScenario };