/**
 * Bianca QuoteMoto Influencer - Ultra-Realistic Female Insurance Expert
 * Professional yet approachable aesthetic for millennial appeal
 * Combines insurance expertise with warm, trustworthy influence
 */

import { CharacterIdentity, ConsistencyAnchors } from '../enhancement/characterConsistency';
import { SkinRealismConfig } from '../enhancement/skinRealism';

export interface BiancaInfluencerProfile {
  name: string;
  profession: string;
  age: number;
  targetDemographic: string[];

  // Physical characteristics for professional approachable aesthetic
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
    makeup_style: string;
    hair_signature: string;
    accessories: string[];
  };

  // QuoteMoto brand integration
  brand_elements: {
    company: string;
    brand_colors: string[];
    logo_integration: string;
    messaging_themes: string[];
    settings: string[];
  };

  // Social media persona
  personality: {
    core_traits: string[];
    communication_style: string;
    expertise_areas: string[];
    content_themes: string[];
  };

  // Insurance specialization
  insurance_expertise: {
    specialties: string[];
    target_clients: string[];
    selling_points: string[];
    approach: string;
  };
}

export class BiancaInfluencer {
  public readonly profile: BiancaInfluencerProfile;
  public readonly characterIdentity: CharacterIdentity;
  public readonly skinConfig: SkinRealismConfig;
  public readonly consistencyAnchors: ConsistencyAnchors;

  constructor() {
    this.profile = {
      name: 'Bianca',
      profession: 'Insurance Specialist & Content Creator',
      age: 29,
      targetDemographic: ['Millennials', 'Young families', 'First-time homeowners', 'Working professionals'],

      appearance: {
        ethnicity: 'Italian/Northern European heritage',
        skinTone: 'warm porcelain with peachy undertones',
        bodyType: 'professional and polished, confident bearing',
        height: '5\'6" - approachable professional presence',
        distinctive_features: [
          'expressive hazel-green eyes with warm flecks',
          'soft rounded cheekbones and gentle jawline',
          'naturally curved lips with warm rose tone',
          'gentle dimple on right cheek when smiling',
          'warm and trustworthy demeanor'
        ]
      },

      fashion: {
        style_aesthetic: 'Professional approachable - polished yet warm',
        typical_outfits: [
          'Navy blazer with orange QuoteMoto branded top',
          'Professional blouse with tailored pants',
          'Sophisticated cardigan with dress shirt',
          'Classic business dress with statement necklace',
          'Polished sweater with professional skirt'
        ],
        makeup_style: 'Natural professional look with warm earth tones, defined eyes, subtle pink lips',
        hair_signature: 'Medium-length chestnut brown hair with caramel highlights, styled in soft waves',
        accessories: [
          'Classic pearl or gold jewelry',
          'Professional watch',
          'QuoteMoto branded pins or accessories',
          'Subtle statement earrings',
          'Professional eyeglasses (optional)'
        ]
      },

      brand_elements: {
        company: 'QuoteMoto',
        brand_colors: ['#FF6B35', '#0066CC', '#FFFFFF'], // QuoteMoto orange, blue, white
        logo_integration: 'QuoteMoto logo on clothing, materials, or subtle accessories',
        messaging_themes: [
          'Family protection and security',
          'Smart financial decisions',
          'Trusted insurance guidance',
          'Professional reliability',
          'Personalized service'
        ],
        settings: [
          'Professional office environment',
          'Comfortable home consultation space',
          'Modern insurance office',
          'Client meeting rooms',
          'Educational presentation spaces'
        ]
      },

      personality: {
        core_traits: [
          'Trustworthy and reliable',
          'Warm and approachable',
          'Knowledgeable and professional',
          'Patient and understanding',
          'Detail-oriented and thorough'
        ],
        communication_style: 'Warm, clear, and educational. Speaks with authority but remains approachable',
        expertise_areas: [
          'Family insurance planning',
          'Home and auto bundles',
          'Life insurance guidance',
          'Claims assistance',
          'Insurance education'
        ],
        content_themes: [
          'Insurance basics and education',
          'Family protection strategies',
          'Money-saving tips',
          'Claims process guidance',
          'Insurance myth-busting'
        ]
      },

      insurance_expertise: {
        specialties: [
          'Family insurance planning',
          'Multi-policy bundles and discounts',
          'First-time buyer education',
          'Claims advocacy and support',
          'Insurance compliance and regulations'
        ],
        target_clients: [
          'Young families with children',
          'First-time homeowners',
          'Millennials starting careers',
          'Small business owners',
          'Clients needing claims assistance'
        ],
        selling_points: [
          'Personalized family protection plans',
          'Comprehensive coverage reviews',
          'Bundle discounts and savings',
          'Educational approach to insurance',
          'Long-term relationship building'
        ],
        approach: 'Educational and consultative - focuses on teaching clients about their options'
      }
    };

    // CharacterIdentity for consistency engine
    this.characterIdentity = {
      name: 'Bianca',
      coreFeatures: {
        faceShape: 'oval with soft angles and gentle curves',
        eyeShape: 'large and expressive, slightly rounded',
        eyeColor: 'hazel-green with warm gold and brown flecks',
        eyebrowShape: 'naturally arched, medium thickness, well-groomed',
        noseShape: 'straight with gentle curve, refined and proportioned',
        lipShape: 'naturally curved with defined cupid\'s bow',
        jawline: 'soft and feminine with gentle definition',
        cheekbones: 'softly defined, creating warm facial structure',
        skinTone: 'warm porcelain with peachy undertones',
        hairColor: 'chestnut brown with caramel highlights',
        hairTexture: 'medium-length with soft waves, professionally styled'
      },
      distinctiveMarks: {
        moles: [
          {
            location: 'right cheek near dimple',
            size: 'tiny',
            description: 'small beauty mark that appears when smiling'
          }
        ],
        freckles: {
          pattern: 'light scattered pattern',
          density: 'subtle and natural',
          locations: ['nose bridge', 'upper cheeks', 'slight dusting across forehead']
        },
        scars: [],
        asymmetry: [
          {
            feature: 'dimple',
            variation: 'right cheek dimple appears when smiling'
          },
          {
            feature: 'eyebrows',
            variation: 'right brow has slightly more pronounced arch'
          },
          {
            feature: 'eyes',
            variation: 'left eye has slightly more pronounced upper lid'
          }
        ]
      },
      personalityTraits: {
        defaultExpression: 'warm, professional smile with genuine caring in her eyes',
        eyeExpression: 'kind and intelligent with natural warmth and trustworthiness',
        smileType: 'genuine warm smile that creates dimple and conveys approachability',
        energyLevel: 'calm confidence with professional warmth and accessibility'
      }
    };

    // SkinRealismEngine configuration
    this.skinConfig = {
      age: 29,
      gender: 'female',
      ethnicity: 'Italian/Northern European',
      skinTone: 'fair',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
      overallIntensity: 'minimal'
    };

    // ConsistencyAnchors for reliable generation
    this.consistencyAnchors = {
      identityPreservation: [
        'PRESERVE: Bianca\'s exact facial structure and soft bone architecture',
        'MAINTAIN: Hazel-green eyes with warm gold and brown flecks',
        'KEEP: Small beauty mark on right cheek near dimple',
        'PRESERVE: Soft feminine jawline and gentle cheekbones',
        'MAINTAIN: Chestnut brown hair with caramel highlights',
        'KEEP: Warm and trustworthy professional presence'
      ],
      featureConstraints: [
        'Eyes must be large, expressive, hazel-green with warm flecks',
        'Eyebrows naturally arched, medium thickness, well-groomed',
        'Lips naturally curved with defined cupid\'s bow and warm rose tone',
        'Nose straight with gentle curve, refined and proportioned',
        'Skin warm porcelain tone with peachy undertones',
        'Face oval shape with soft angles and gentle curves'
      ],
      proportionGuidelines: [
        'Facial proportions follow classic beauty standards',
        'Eyes positioned with gentle spacing',
        'Nose length proportioned to face structure',
        'Lips positioned to create warm, approachable appearance',
        'Cheekbones softly defined for feminine appeal',
        'Jawline creates gentle but defined angles'
      ],
      expressionLimits: [
        'Always maintain warm, professional demeanor',
        'Smile should be genuine and trustworthy',
        'Eyes should convey warmth and intelligence',
        'Posture always professional but approachable',
        'Expressions appropriate for family-focused insurance professional',
        'Energy level calm but engaging'
      ],
      lightingConsiderations: [
        'Lighting should enhance peachy undertones in skin',
        'Highlight warm flecks in hazel-green eyes',
        'Bring out caramel tones in chestnut hair',
        'Create soft shadows on gentle cheekbones',
        'Professional but warm photography lighting',
        'Avoid harsh lighting that diminishes warm features'
      ]
    };
  }

  /**
   * Generate base prompt for Bianca
   */
  generateBasePrompt(context: string = 'professional headshot'): string {
    return `Ultra-photorealistic portrait of Bianca, a warm professional 29-year-old QuoteMoto insurance specialist.

PHYSICAL FEATURES:
- Italian/Northern European heritage with warm porcelain skin and peachy undertones
- Large expressive hazel-green eyes with warm gold and brown flecks
- Soft rounded cheekbones and gentle feminine jawline
- Naturally curved lips with warm rose tone
- Small beauty mark on right cheek near dimple
- Medium-length chestnut brown hair with caramel highlights, soft waves

PROFESSIONAL APPEARANCE:
- Navy QuoteMoto blazer with orange branded top
- Natural professional makeup with warm earth tones
- Classic pearl or gold jewelry
- Polished and approachable business attire

NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

CHARACTER ESSENCE:
- Warm, trustworthy insurance professional
- Approachable expertise and genuine care
- Professional confidence with family-focused warmth
- Educational and consultative demeanor

CONTEXT: ${context}

BRAND INTEGRATION:
- QuoteMoto branding: orange (#FF6B35) and blue (#0066CC) color scheme
- Professional insurance office or consultation setting
- Focus on family protection and trusted guidance`;
  }

  /**
   * Generate prompt for specific shot types
   */
  generatePromptForShotType(shotType: 'headshot' | 'medium' | 'full-body' | 'seated'): string {
    const basePrompt = this.generateBasePrompt();

    const shotModifications = {
      'headshot': 'Professional headshot from shoulders up, direct eye contact with camera',
      'medium': 'Medium shot from waist up, professional posture with hands visible',
      'full-body': 'Full body professional shot standing confidently, complete QuoteMoto outfit visible',
      'seated': 'Professional seated pose at consultation desk, welcoming and approachable'
    };

    return `${basePrompt}

SHOT COMPOSITION: ${shotModifications[shotType]}`;
  }

  /**
   * Generate VEO3 video prompts for Bianca
   */
  generateVEO3Prompt(dialogue: string, setting: string = 'professional office'): string {
    return `Professional insurance specialist Bianca explaining ${setting} services to camera.

PRESERVE: Exact facial features and warm professional identity
MOVEMENT:
- Natural professional gestures explaining insurance concepts
- Warm, engaging eye contact with camera
- Gentle hand movements emphasizing key points
- Professional seated or standing posture

DIALOGUE: "${dialogue}"

ENVIRONMENT: ${setting}
BRAND: QuoteMoto orange and blue color scheme visible
LIGHTING: Professional warm lighting enhancing natural features`;
  }
}

export const biancaInfluencer = new BiancaInfluencer();