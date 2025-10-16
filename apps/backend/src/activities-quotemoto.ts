import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleMediaClient } from './google-media-client';
import { ContentStorage } from './storage';

// QuoteMoto brand configuration
const QUOTEMOTO_BRAND = {
  name: 'QuoteMoto',
  primaryColor: '#0066CC', // Blue
  secondaryColor: '#FF6B35', // Orange
  accentColor: '#FFFFFF', // White
  tagline: 'Save money on car insurance, QuoteMoto',
  duiTagline: 'DUI no problem, QuoteMoto',
  cta: 'Visit QuoteMoto.com'
};

// Initialize services
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const googleMediaClient = new GoogleMediaClient(GEMINI_KEY);
const storage = new ContentStorage();

// Aria spokesperson character definition
const ARIA_CHARACTER = {
  name: 'Aria',
  age: 28,
  profession: 'Insurance Expert',
  ethnicity: 'Mixed Latina/European heritage',
  appearance: {
    face: 'Heart-shaped face',
    eyes: 'Warm brown eyes',
    features: 'Natural asymmetry (left eye slightly smaller)',
    imperfections: [
      'Subtle freckles on nose bridge and upper cheeks',
      'Visible pores in T-zone areas',
      'Natural facial asymmetry',
      'Subtle expression lines around eyes',
      'Small beauty mark near left eye'
    ]
  },
  style: 'Professional insurance expert, trustworthy demeanor',
  personality: 'Approachable, knowledgeable, confident'
};

interface QuoteMotoContentParams {
  campaignType: 'savings' | 'dui-friendly' | 'quick-quote';
  variations: number;
  platforms?: string[];
}

/**
 * Generate QuoteMoto insurance advertising content with ultra-realistic Aria spokesperson
 * Makes real API calls to NanaBanana and VEO3 to generate actual images and videos
 */
export async function generateQuoteMotoContent(params: QuoteMotoContentParams): Promise<any> {
  const { campaignType, variations } = params;

  console.log(`[QuoteMoto] Starting ${campaignType} campaign generation with ${variations} variations`);

  const results = {
    campaignType,
    variations: [],
    totalCost: 0,
    generatedAt: new Date().toISOString(),
    spokesperson: ARIA_CHARACTER.name,
    brandColors: QUOTEMOTO_BRAND
  };

  try {
    // Generate content for each variation
    for (let i = 1; i <= variations; i++) {
      console.log(`[QuoteMoto] Generating variation ${i}/${variations}`);

      const variation = await generateSingleQuoteMotoVariation(campaignType, i);
      (results.variations as any[]).push(variation);
      results.totalCost += variation.cost;

      // Store each variation
      try {
        await storage.saveContent({
          id: variation.id,
          campaign: campaignType,
          variation: i,
          content: variation,
          platform: 'multi',
          status: 'generated',
          generatedAt: new Date()
        } as any);
      } catch (error) {
        console.log(`[QuoteMoto] Note: Storage not available in current configuration`);
      }
    }

    console.log(`[QuoteMoto] Campaign complete - ${variations} variations generated`);
    console.log(`[QuoteMoto] Total cost: $${results.totalCost.toFixed(2)}`);

    return results;

  } catch (error) {
    console.error(`[QuoteMoto] Campaign generation failed:`, error);
    throw error;
  }
}

async function generateSingleQuoteMotoVariation(campaignType: 'savings' | 'dui-friendly' | 'quick-quote', variationNumber: number): Promise<any> {
  const variationId = `quotemoto-${campaignType}-${variationNumber}-${Date.now()}`;
  let totalCost = 0;

  // Get campaign-specific configuration
  const config = getCampaignConfig(campaignType);

  // Step 1: Generate ultra-realistic Aria photo with NanaBanana
  console.log(`[QuoteMoto] Generating ultra-realistic Aria photo for ${campaignType}`);

  const imagePrompt = generateAriaImagePrompt(config, variationNumber);
  const imageResult = await googleMediaClient.generateImageNanoBanana({
    prompt: imagePrompt,
    aspectRatio: '4:5' // Optimized for social media
  });

  totalCost += 0.02; // NanaBanana cost per image

  // Step 2: Generate commercial script using Gemini
  console.log(`[QuoteMoto] Generating commercial script`);

  const scriptPrompt = generateScriptPrompt(config);
  const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const scriptResult = await textModel.generateContent(scriptPrompt);
  const scriptText = scriptResult.response.text();

  // Parse script JSON
  const jsonMatch = scriptText.match(/```json\n?([\s\S]*?)\n?```/) || scriptText.match(/{[\s\S]*}/);
  const script = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : scriptText);

  totalCost += 0.01; // Gemini text generation cost

  // Step 3: Generate commercial video with VEO3
  console.log(`[QuoteMoto] Generating 30-second commercial video with VEO3`);

  const videoPrompt = generateVideoPrompt(config, script);
  const videoResult = await googleMediaClient.generateVideoVEO3({
    prompt: videoPrompt,
    aspectRatio: '16:9',
    resolution: '1080p',
    duration: 30 // 30-second commercial
  });

  totalCost += 1.50; // VEO3 cost per 30-second video

  // Step 4: Generate platform-specific variations
  const platformVariations: any = {};
  for (const platform of ['tiktok', 'instagram', 'youtube'] as const) {
    platformVariations[platform] = {
      imageUrl: imageResult.url, // Same image, different optimization
      videoUrl: videoResult.url, // Same video, different format
      script: script,
      hashtags: generatePlatformHashtags(platform, campaignType)
    };
  }

  const variation = {
    id: variationId,
    campaignType,
    variationNumber,
    spokesperson: ARIA_CHARACTER,
    brand: QUOTEMOTO_BRAND,
    content: {
      imageUrl: imageResult.url,
      videoUrl: videoResult.url,
      script: script,
      voiceover: script.voiceover,
      duration: 30
    },
    platformVariations,
    cost: totalCost,
    generatedAt: new Date().toISOString(),
    readyForPosting: true
  };

  console.log(`[QuoteMoto] Variation ${variationNumber} generated - Cost: $${totalCost.toFixed(2)}`);

  return variation;
}

function getCampaignConfig(campaignType: 'savings' | 'dui-friendly' | 'quick-quote') {
  const configs = {
    'savings': {
      title: 'QuoteMoto Savings Expert',
      setting: 'Modern professional office with QuoteMoto branding',
      message: 'Insurance savings consultation',
      voiceover: '"Hi, I\'m Aria from QuoteMoto. Did you know you could be saving hundreds on car insurance? At QuoteMoto, we specialize in finding coverage for drivers others won\'t insure. Save money on car insurance, QuoteMoto. Visit QuoteMoto.com today."',
      visualStyle: 'Professional insurance consultation',
      cta: QUOTEMOTO_BRAND.tagline
    },
    'dui-friendly': {
      title: 'QuoteMoto DUI-Friendly Specialist',
      setting: 'Professional studio with insurance documentation',
      message: 'DUI-friendly insurance options',
      voiceover: '"I\'m Aria from QuoteMoto, and I understand that everyone deserves a second chance. Whether you\'ve had tickets, accidents, or a DUI - we can help. Your past doesn\'t define your rates. DUI no problem, QuoteMoto. Get your quote at QuoteMoto.com."',
      visualStyle: 'Compassionate insurance expert',
      cta: QUOTEMOTO_BRAND.duiTagline
    },
    'quick-quote': {
      title: 'QuoteMoto Quick Quote Demo',
      setting: 'Modern vehicle interior with mobile app demo',
      message: 'Quick quote process demonstration',
      voiceover: '"Getting car insurance shouldn\'t take all day. I\'m Aria from QuoteMoto, and I\'ll show you how easy it is. Just open our app, enter your info, and get your quote in under 2 minutes. It\'s really that simple. Quick quotes, real savings - QuoteMoto.com."',
      visualStyle: 'Mobile app demonstration',
      cta: 'Quick quotes, real savings - ' + QUOTEMOTO_BRAND.cta
    }
  };

  return configs[campaignType] || configs.savings;
}

function generateAriaImagePrompt(config: any, variationNumber: number): string {
  return `Ultra-photorealistic portrait of ${ARIA_CHARACTER.age}-year-old professional insurance expert named ${ARIA_CHARACTER.name}.

FACIAL STRUCTURE:
- ${ARIA_CHARACTER.appearance.face} with ${ARIA_CHARACTER.ethnicity}
- ${ARIA_CHARACTER.appearance.eyes} with natural warmth
- Natural facial asymmetry (${ARIA_CHARACTER.appearance.features})

SKIN REALISM (CRITICAL):
- ${ARIA_CHARACTER.appearance.imperfections.join('\n- ')}
- Natural skin tone variations and gradients
- Visible but subtle pore texture throughout face
- Realistic subsurface light scattering
- Natural shine and matte areas

SETTING: ${config.setting}
PROFESSIONAL STYLE: ${ARIA_CHARACTER.style}
BRAND COLORS: Blue ${QUOTEMOTO_BRAND.primaryColor} and Orange ${QUOTEMOTO_BRAND.secondaryColor}

POSE VARIATION ${variationNumber}:
- Professional gesture explaining ${config.message}
- Confident, trustworthy expression
- Direct eye contact with camera
- QuoteMoto branded elements visible

TECHNICAL SPECS:
- 8K professional quality
- Commercial photography grade
- Perfect lighting for insurance advertising
- Ultra-realistic with natural imperfections

CRITICAL REQUIREMENTS:
- Must include visible skin pores
- Must have natural facial asymmetry
- Must show natural skin texture variations
- Must avoid plastic or synthetic appearance
- Must maintain character consistency`;
}

function generateScriptPrompt(config: any): string {
  return `Create a professional 30-second insurance commercial script for QuoteMoto featuring Aria as spokesperson.

Campaign: ${config.title}
Message: ${config.message}
Voiceover: ${config.voiceover}

Requirements:
- Professional insurance industry standard
- Trustworthy and approachable tone
- Include QuoteMoto branding
- 30-second duration
- Clear call-to-action

Output as JSON:
{
  "hook": "attention-grabbing opening",
  "voiceover": "complete voiceover script",
  "visualCues": ["scene descriptions"],
  "callToAction": "${config.cta}",
  "duration": 30,
  "brandElements": ["QuoteMoto logo", "Blue and orange colors"]
}`;
}

function generateVideoPrompt(config: any, script: any): string {
  return `PROFESSIONAL QUOTEMOTO COMMERCIAL - 30 SECONDS

SPOKESPERSON: ${ARIA_CHARACTER.name} - ${ARIA_CHARACTER.profession}
BRAND COLORS: ${QUOTEMOTO_BRAND.primaryColor} (Blue) and ${QUOTEMOTO_BRAND.secondaryColor} (Orange)

SCENARIO: ${config.setting}

ARIA'S PERFORMANCE:
- ${config.visualStyle}
- Professional insurance expert presentation
- Trustworthy, approachable demeanor
- Natural gestures and expressions
- Direct camera engagement

VISUAL ELEMENTS:
${script.visualCues?.join('\n') || '- Professional insurance consultation setup'}
- QuoteMoto logo prominently displayed
- Blue and orange color scheme throughout
- Clean, professional background

VOICEOVER SCRIPT:
${script.voiceover}

BRAND INTEGRATION:
- QuoteMoto branding throughout
- ${config.cta}
- Professional insurance industry aesthetic
- Call-to-action: ${QUOTEMOTO_BRAND.cta}

TECHNICAL REQUIREMENTS:
- 30-second commercial format
- 1920x1080 HD resolution
- 30fps frame rate
- Commercial broadcast quality
- Professional spokesperson delivery`;
}

function generatePlatformHashtags(platform: 'tiktok' | 'instagram' | 'youtube', campaignType: 'savings' | 'dui-friendly' | 'quick-quote'): string[] {
  const baseHashtags = ['#QuoteMoto', '#CarInsurance', '#SaveMoney'];

  const platformSpecific = {
    tiktok: ['#InsuranceTok', '#SaveMoney', '#CarTok', '#FinTok'],
    instagram: ['#InsuranceExpert', '#AutoInsurance', '#FinancialTips'],
    youtube: ['#InsuranceReview', '#CarInsuranceQuote', '#SaveOnInsurance']
  };

  const campaignSpecific = {
    'savings': ['#InsuranceSavings', '#CheapInsurance'],
    'dui-friendly': ['#SecondChances', '#DUIInsurance'],
    'quick-quote': ['#QuickQuote', '#EasyInsurance']
  };

  return [
    ...baseHashtags,
    ...(platformSpecific[platform] || []),
    ...(campaignSpecific[campaignType] || [])
  ];
}