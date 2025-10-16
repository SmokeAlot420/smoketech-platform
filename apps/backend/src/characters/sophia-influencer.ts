// Sophia - Ultra-Realistic Female AI Influencer
// Advanced character profile for hyper-realistic VEO3 video generation

interface CharacterProfile {
  name: string;
  profession: string;
  baseDescription: string;
  brandElements?: {
    company: string;
    industry: string;
    colors: string[];
    logo: string;
    tagline: string;
  };
}

export interface SophiaInfluencerProfile extends CharacterProfile {
  beautySpecs: {
    skinTone: string;
    makeupStyle: string;
    hairStyle: string;
    bodyType: string;
  };
  contentNiches: string[];
  socialMediaPersonality: string;
  name: string;
}

export class SophiaInfluencer {
  public readonly profile: SophiaInfluencerProfile;
  public readonly referenceImages: Array<{ description: string; base64?: string }>;

  constructor() {
    this.profile = {
      name: 'Sophia',
      profession: 'Content Creator & Lifestyle Influencer',
      baseDescription: `Professional 25-year-old lifestyle content creator with confident and approachable personality.
        Mixed heritage with expressive eyes and long wavy dark brown hair.
        Professional appearance with polished makeup and stylish fashion sense.
        Educational content focus mixing practical advice with lifestyle tips.`,

      brandElements: {
        company: 'SophiaLive',
        industry: 'Lifestyle & Fashion',
        colors: ['#FF6B9D', '#C44569', '#F8B500'], // Pink, Rose, Gold
        logo: 'Stylized "S" with gradient effect',
        tagline: 'Live Your Best Life'
      },

      beautySpecs: {
        skinTone: 'Professional appearance with natural complexion',
        makeupStyle: 'Professional makeup - polished eyes, natural lips, well-groomed',
        hairStyle: 'Long wavy dark brown hair with highlights, professionally styled',
        bodyType: 'Professional posture and confident demeanor'
      },

      contentNiches: [
        'Fashion & Beauty',
        'Fitness & Wellness',
        'Travel & Lifestyle',
        'Brand Reviews',
        'Motivational Content'
      ],

      socialMediaPersonality: 'Confident, relatable, inspiring. Speaks directly to audience with authentic energy.'
    };

    this.referenceImages = [
      {
        description: 'Primary reference - frontal portrait with natural smile'
      },
      {
        description: 'Side profile showing hair texture and facial structure'
      },
      {
        description: 'Full body shot in casual athletic wear'
      },
      {
        description: 'Dressed up look with glamorous makeup'
      }
    ];
  }

  // Generate VEO3-optimized prompts for hyper-realistic videos
  public getVEO3Prompt(contentType: string, dialogue: string, platform: 'tiktok' | 'instagram' | 'youtube' = 'instagram'): string {
    const basePrompt = `
Professional lifestyle content creator named Sophia presenting educational content.
${this.profile.beautySpecs.skinTone}, ${this.profile.beautySpecs.makeupStyle}.
${this.profile.beautySpecs.hairStyle}, ${this.profile.beautySpecs.bodyType}.
Educational presenter speaking directly to camera with clear articulation.

DIALOGUE: "${dialogue}"

TECHNICAL SPECS:
- High quality, professional color grading
- Professional education lighting with soft key light
- Clear background with good depth of field
- Natural educational gestures and expressions
- Clear speech synchronization
- Direct eye contact with camera for educational delivery

STYLING:
${this.getOutfitForContent(contentType)}

ENVIRONMENT:
${this.getEnvironmentForPlatform(platform)}

MOVEMENT & EXPRESSION:
- Natural head tilts and subtle body language
- Authentic facial expressions matching dialogue tone
- Professional presenter energy with approachable warmth
- Smooth natural movements, no robotic gestures

QUALITY REQUIREMENTS:
- Skin: Natural pore texture, subtle skin imperfections for realism
- Eyes: Natural eye movement with realistic reflections
- Hair: Natural physics with individual strand movement
- Makeup: Professional application, not overdone
- Lighting: Soft, flattering but natural appearance
    `.trim();

    return basePrompt;
  }

  private getOutfitForContent(contentType: string): string {
    const outfits: { [key: string]: string } = {
      'fashion': 'Designer crop top with high-waisted jeans, layered gold jewelry, trendy sneakers',
      'fitness': 'Stylish athletic wear - sports bra and leggings set, hair in messy bun',
      'beauty': 'Elegant off-shoulder top in neutral tones, hair styled in loose waves',
      'lifestyle': 'Casual chic - oversized blazer over fitted top, statement accessories',
      'brand-review': 'Professional yet trendy outfit appropriate for product presentation',
      'default': 'Stylish casual wear that complements her natural beauty'
    };

    return outfits[contentType] || outfits['default'];
  }

  private getEnvironmentForPlatform(platform: string): string {
    const environments: { [key: string]: string } = {
      'tiktok': 'Trendy bedroom or living room setup with LED lights and modern decor',
      'instagram': 'Minimalist studio setup with white or gradient background, professional lighting',
      'youtube': 'Well-lit home studio with plants and aesthetic background elements'
    };

    return environments[platform] || environments['instagram'];
  }

  // Generate negative prompts to avoid common AI artifacts
  public getNegativePrompt(): string {
    return `
distorted face, unnatural mouth movement, robotic expressions,
plastic skin, over-processed makeup, fake-looking hair,
poor lip sync, dead eyes, artificial lighting, low quality,
watermarks, AI branding, unrealistic proportions,
masculine features, aged appearance, poor skin texture,
choppy hair movement, stiff body language, amateur lighting
    `.trim();
  }

  // Generate dialogue suggestions based on content type
  public generateDialogue(contentType: string, product?: string): string {
    const dialogues: { [key: string]: string } = {
      'fashion': `Hey gorgeous! I'm absolutely obsessed with this new ${product || 'outfit'} and I had to share it with you all. The way it fits is just *chef's kiss* - you're going to love it!`,

      'fitness': `What's up fit fam! Today I'm sharing my go-to routine that's been completely transforming my mindset and my body. Are you ready to level up with me?`,

      'beauty': `Okay beauties, can we talk about this ${product || 'product'} for a second? I've been testing it for weeks and the results are actually insane. Let me show you!`,

      'lifestyle': `Hi loves! So many of you have been asking about my daily routine and how I stay motivated, so I thought I'd give you the real behind-the-scenes tea.`,

      'brand-review': `Hey everyone! I've been trying out ${product || 'this amazing product'} and I'm genuinely shocked by the results. Let me break down everything you need to know.`,

      'motivational': `Beautiful souls, I want to remind you today that you have everything you need inside you to create the life you want. You're more powerful than you know!`
    };

    return dialogues[contentType] || dialogues['lifestyle'];
  }
}

export const sophiaInfluencer = new SophiaInfluencer();