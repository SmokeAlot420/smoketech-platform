/**
 * Marcus Professional - Ultra-Realistic Male Business Executive
 * Professional masculine presence for corporate/business content
 * Designed to complement the female influencer trio (Aria, Bianca, Sophia)
 */

import { CharacterIdentity, ConsistencyAnchors } from '../enhancement/characterConsistency';
import { SkinRealismConfig } from '../enhancement/skinRealism';

export interface MarcusProfessionalProfile {
  name: string;
  profession: string;
  age: number;
  targetDemographic: string[];

  // Physical characteristics for professional male executive
  appearance: {
    ethnicity: string;
    skinTone: string;
    bodyType: string;
    height: string;
    distinctive_features: string[];
  };

  // Style and fashion
  fashion: {
    style_aesthetic: string;
    typical_outfits: string[];
    grooming_style: string;
    hair_signature: string;
    accessories: string[];
  };

  // Brand integration
  brand_elements: {
    settings: string[];
    messaging_themes: string[];
    expertise_areas: string[];
  };

  // Social media persona
  personality: {
    core_traits: string[];
    communication_style: string;
    content_themes: string[];
  };

  // Professional specialization
  business_expertise: {
    specialties: string[];
    target_audience: string[];
    selling_points: string[];
    approach: string;
  };
}

export class MarcusProfessional {
  public readonly profile: MarcusProfessionalProfile;
  public readonly characterIdentity: CharacterIdentity;
  public readonly skinConfig: SkinRealismConfig;
  public readonly consistencyAnchors: ConsistencyAnchors;

  constructor() {
    this.profile = {
      name: 'Marcus',
      profession: 'Business Executive & Corporate Advisor',
      age: 35,
      targetDemographic: ['Business professionals', 'Entrepreneurs', 'Corporate decision makers', 'C-suite executives'],

      appearance: {
        ethnicity: 'Mixed European/Mediterranean heritage',
        skinTone: 'warm tan with neutral undertones',
        bodyType: 'athletic and confident, professional build',
        height: '6\'1" - commanding executive presence',
        distinctive_features: [
          'sharp steel-blue eyes with natural intensity',
          'strong jawline and defined facial structure',
          'well-groomed facial hair (trimmed beard/stubble)',
          'subtle confidence lines around eyes',
          'professional posture and executive demeanor'
        ]
      },

      fashion: {
        style_aesthetic: 'Sharp executive professional - authoritative, polished, successful',
        typical_outfits: [
          'Tailored navy blue or charcoal suit with crisp white shirt',
          'Business casual blazer with premium dress shirt',
          'Smart-casual look with designer sweater and slacks',
          'Professional polo with tailored pants',
          'Executive athleisure for modern tech meetings'
        ],
        grooming_style: 'Impeccably groomed with natural professional appearance',
        hair_signature: 'Short, styled dark hair with natural texture, professional cut',
        accessories: [
          'Premium watch (subtle luxury)',
          'Professional leather briefcase or portfolio',
          'Designer eyewear (when needed)',
          'Minimalist cufflinks',
          'Quality leather shoes'
        ]
      },

      brand_elements: {
        settings: [
          'Modern corporate office',
          'Executive boardroom',
          'Professional conference room',
          'Upscale business lounge',
          'Contemporary workspace',
          'Financial district environments'
        ],
        messaging_themes: [
          'Leadership and success',
          'Business strategy and growth',
          'Corporate excellence',
          'Professional development',
          'Executive decision-making'
        ],
        expertise_areas: [
          'Business strategy',
          'Corporate leadership',
          'Financial planning',
          'Investment advice',
          'Market analysis'
        ]
      },

      personality: {
        core_traits: [
          'Confident and authoritative',
          'Strategic thinker',
          'Professional and polished',
          'Results-driven',
          'Natural leadership presence'
        ],
        communication_style: 'Direct, confident, and professional - executive presence with approachable expertise',
        content_themes: [
          'Business insights and strategy',
          'Professional development tips',
          'Market trends and analysis',
          'Leadership principles',
          'Success strategies'
        ]
      },

      business_expertise: {
        specialties: [
          'Corporate strategy',
          'Business development',
          'Executive coaching',
          'Investment planning',
          'Market positioning'
        ],
        target_audience: [
          'Business executives',
          'Entrepreneurs',
          'Corporate professionals',
          'Startup founders',
          'Investors'
        ],
        selling_points: [
          'Proven track record',
          'Strategic insights',
          'Results-oriented approach',
          'Executive experience',
          'Market expertise'
        ],
        approach: 'Confident professional guidance backed by experience and strategic thinking'
      }
    };

    // Character identity for consistency across generations
    this.characterIdentity = {
      name: 'Marcus',
      coreFeatures: {
        faceShape: 'square to rectangular with strong features',
        eyeShape: 'sharp almond-shaped eyes',
        eyeColor: 'steel-blue with natural intensity',
        eyebrowShape: 'strong, well-defined masculine brows',
        noseShape: 'straight, proportionate nose',
        lipShape: 'firm, masculine lips',
        jawline: 'strong, defined angular jawline',
        cheekbones: 'prominent, masculine cheekbone structure',
        skinTone: 'warm tan with neutral undertones',
        hairColor: 'dark brown',
        hairTexture: 'short, professionally styled'
      },
      distinctiveMarks: {
        moles: [],
        freckles: {
          pattern: 'none',
          density: 'none',
          locations: []
        },
        scars: [],
        asymmetry: [
          {
            feature: 'expression lines',
            variation: 'subtle confidence lines around eyes'
          }
        ]
      },
      personalityTraits: {
        defaultExpression: 'confident professional demeanor',
        eyeExpression: 'natural intensity and focus',
        smileType: 'professional confident smile',
        energyLevel: 'composed executive presence'
      }
    };

    // Skin realism configuration for ultra-realistic male appearance
    this.skinConfig = {
      age: 35,
      gender: 'male',
      ethnicity: 'Mixed European/Mediterranean heritage',
      skinTone: 'tan',
      imperfectionTypes: ['pores', 'wrinkles', 'asymmetry'],
      overallIntensity: 'moderate'
    };

    // Consistency anchors to prevent character drift
    this.consistencyAnchors = {
      identityPreservation: [
        'Steel-blue eyes with natural intensity',
        'Strong, defined jawline',
        'Well-groomed facial hair (beard/stubble)',
        'Short, professionally styled dark hair',
        'Warm tan skin tone with neutral undertones',
        'Athletic professional build',
        'Confident executive posture',
        '6\'1" commanding height',
        'Sharp masculine facial features',
        'Professional business attire',
        'Natural masculine appearance',
        'Executive presence and demeanor',
        'Subtle confidence lines around eyes',
        'Natural male skin texture',
        'Professional grooming standard'
      ],
      featureConstraints: [
        'Facial geometry must match reference exactly',
        'Eye shape and color cannot change',
        'Jawline definition must remain consistent',
        'Facial hair style maintained',
        'Professional posture preserved'
      ],
      proportionGuidelines: [
        'Masculine facial proportions',
        'Athletic build with professional demeanor',
        'Executive presence maintained',
        'Natural asymmetry preserved'
      ],
      expressionLimits: [
        'Confident professional expressions',
        'Authoritative but approachable demeanor',
        'Executive-level composure',
        'Natural masculine energy'
      ],
      lightingConsiderations: [
        'Professional lighting suitable for corporate settings',
        'Executive photography standards',
        'Natural lighting that enhances masculine features',
        'Business-appropriate lighting conditions'
      ]
    };
  }

  /**
   * Generate base prompt for Marcus character
   */
  public generateBasePrompt(context?: {
    setting?: string;
    mood?: string;
    action?: string;
  }): string {
    const setting = context?.setting || 'modern corporate office';
    const mood = context?.mood || 'confident professional';
    const action = context?.action || 'presenting business strategy';

    return `Ultra-photorealistic portrait of Marcus, a ${this.profile.age}-year-old ${this.profile.profession}.

PHYSICAL CHARACTERISTICS:
- Ethnicity: ${this.profile.appearance.ethnicity}
- Skin tone: ${this.profile.appearance.skinTone}
- Height: ${this.profile.appearance.height}
- Build: ${this.profile.appearance.bodyType}
- Eyes: ${this.characterIdentity.coreFeatures.eyeColor}
- Facial structure: ${this.characterIdentity.coreFeatures.faceShape}
- Jawline: ${this.characterIdentity.coreFeatures.jawline}
- Facial hair: Well-groomed trimmed beard/designer stubble
- Hair: ${this.characterIdentity.coreFeatures.hairColor} ${this.characterIdentity.coreFeatures.hairTexture}

PROFESSIONAL STYLE:
- Attire: ${this.profile.fashion.typical_outfits[0]}
- Grooming: ${this.profile.fashion.grooming_style}
- Presence: ${mood}
- Setting: ${setting}
- Action: ${action}

NATURAL REALISM:
- Natural masculine skin texture with visible pores
- Subtle expression lines around eyes
- Slight facial hair shadow
- Authentic male skin characteristics
- Professional yet natural appearance

CRITICAL CONSISTENCY:
- PRESERVE: Exact facial features, steel-blue eyes, strong jawline
- PRESERVE: Professional executive presence and demeanor
- PRESERVE: Well-groomed facial hair style
- PRESERVE: Athletic professional build and confident posture
- MAINTAIN: Natural masculine appearance with authentic imperfections`;
  }

  /**
   * Generate prompt with ZHO technique integration
   */
  public generateWithTechnique(technique: string, context?: any): string {
    const basePrompt = this.generateBasePrompt(context);
    return `${basePrompt}\n\n${technique}`;
  }

  /**
   * Generate prompt for specific platform
   */
  public generateForPlatform(platform: 'tiktok' | 'instagram' | 'youtube', contentType: string): string {
    const platformSettings = {
      tiktok: {
        mood: 'engaging and approachable professional',
        action: 'sharing business insights directly to camera',
        setting: 'modern professional office with natural lighting'
      },
      instagram: {
        mood: 'polished executive confidence',
        action: 'presenting corporate strategy',
        setting: 'upscale corporate boardroom'
      },
      youtube: {
        mood: 'authoritative yet accessible expert',
        action: 'explaining business concepts in detail',
        setting: 'professional studio with corporate branding'
      }
    };

    const platformContext = platformSettings[platform];
    return this.generateBasePrompt(platformContext);
  }
}

// Export singleton instance
export const marcusProfessional = new MarcusProfessional();