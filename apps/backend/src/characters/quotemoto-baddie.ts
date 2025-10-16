/**
 * QuoteMoto Baddie Influencer - Ultra-Realistic Female Insurance Expert
 * Professional "baddie" aesthetic for Gen Z/Millennial appeal
 * Combines insurance expertise with modern influencer appeal
 */

import { CharacterIdentity, ConsistencyAnchors } from '../enhancement/characterConsistency';
import { SkinRealismConfig } from '../enhancement/skinRealism';

export interface QuoteMotoInfluencerProfile {
  name: string;
  profession: string;
  age: number;
  targetDemographic: string[];

  // Physical characteristics for "baddie" aesthetic
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

export class QuoteMotoInfluencer {
  public readonly profile: QuoteMotoInfluencerProfile;
  public readonly characterIdentity: CharacterIdentity;
  public readonly skinConfig: SkinRealismConfig;
  public readonly consistencyAnchors: ConsistencyAnchors;

  constructor() {
    this.profile = {
      name: 'Aria',
      profession: 'Insurance Expert & Content Creator',
      age: 26,
      targetDemographic: ['Gen Z', 'Young Millennials', 'First-time car buyers', 'Young professionals'],

      appearance: {
        ethnicity: 'Mixed Latina/Mediterranean heritage',
        skinTone: 'warm olive with golden undertones',
        bodyType: 'fit and confident, athletic build',
        height: '5\'7" - model-esque presence',
        distinctive_features: [
          'striking amber-brown eyes with gold flecks',
          'defined cheekbones and jawline',
          'naturally full lips with perfect cupid\'s bow',
          'small beauty mark near left eye',
          'confident posture and commanding presence'
        ]
      },

      fashion: {
        style_aesthetic: 'Modern professional baddie - sharp, confident, stylish',
        typical_outfits: [
          'Tailored blazer with fitted jeans and heels',
          'Bodycon midi dress with statement jewelry',
          'Crop blazer with high-waisted trousers',
          'Chic turtleneck with leather jacket',
          'Professional blouse with statement pants'
        ],
        makeup_style: 'Flawless "no-makeup makeup" with defined brows, subtle contouring, nude-pink lips',
        hair_signature: 'Long, layered honey-brown hair with face-framing highlights',
        accessories: [
          'Delicate gold jewelry',
          'Designer sunglasses',
          'Structured handbags',
          'Classic watch',
          'Minimalist earrings'
        ]
      },

      brand_elements: {
        company: 'QuoteMoto - California\'s #1 Insurance Marketplace',
        brand_colors: ['#0074c9', '#FFFFFF', '#4A4A4A'], // QuoteMoto Blue, White, Gray
        logo_integration: 'QuoteMoto logo on phone screens, branded materials, or office backgrounds',
        messaging_themes: [
          'California\'s #1 Insurance Marketplace',
          'Compare 30+ carriers and save up to $500/year',
          'Fast, Free, No Obligation quotes in 5 minutes',
          'Specialists in SR-22 and high-risk driver insurance',
          'Get quotes when you\'re ready - no spam calls'
        ],
        settings: [
          'Modern California office with QuoteMoto blue branding',
          'Car dealership showing QuoteMoto partnership',
          'Contemporary California home with city/beach view',
          'Coffee shop with laptop showing QuoteMoto comparison tool',
          'California street scene with cars and QuoteMoto billboard',
          'Professional meeting room with QuoteMoto presentation',
          'Modern co-working space with QuoteMoto materials'
        ]
      },

      personality: {
        core_traits: [
          'Confident and self-assured',
          'Approachable yet authoritative',
          'Trendy and fashion-forward',
          'Knowledgeable and trustworthy',
          'Empathetic to client needs'
        ],
        communication_style: 'Direct, clear, with a touch of sass. Speaks like a knowledgeable friend who has your back',
        expertise_areas: [
          'Auto insurance for young drivers',
          'Money-saving insurance tips',
          'Understanding coverage options',
          'Digital insurance management',
          'Claims process guidance'
        ],
        content_themes: [
          'Insurance education made fun',
          'Busting insurance myths',
          'Real client success stories',
          'Lifestyle content with insurance tips',
          'Behind-the-scenes at QuoteMoto'
        ]
      },

      insurance_expertise: {
        specialties: [
          'First-time buyer guidance',
          'Multi-policy discounts',
          'Digital insurance tools',
          'Claims advocacy',
          'Risk assessment for young drivers'
        ],
        target_clients: [
          'College students getting first cars',
          'Young professionals starting careers',
          'Couples combining policies',
          'Families upgrading coverage',
          'Tech-savvy consumers'
        ],
        selling_points: [
          'Saves clients average of $400/year',
          'Makes insurance simple and transparent',
          'Available 24/7 via app and social media',
          'Personalized coverage recommendations',
          'Fast, fair claims processing'
        ],
        approach: 'Educational first, sales second. Focus on empowering clients with knowledge'
      }
    };

    // Create CharacterConsistencyEngine identity
    this.characterIdentity = {
      name: 'Aria',
      coreFeatures: {
        faceShape: 'oval with defined jawline and high cheekbones',
        eyeShape: 'large almond eyes with subtle hooded lids',
        eyeColor: 'striking amber-brown with golden flecks',
        eyebrowShape: 'naturally arched, well-groomed, medium thickness',
        noseShape: 'straight with slight refinement, perfect proportions',
        lipShape: 'naturally full with defined cupid\'s bow, subtle asymmetry',
        jawline: 'defined and feminine with strong angles',
        cheekbones: 'high and prominent, creating elegant contours',
        skinTone: 'warm olive with golden undertones',
        hairColor: 'rich honey-brown with caramel highlights',
        hairTexture: 'long, layered, naturally wavy with body and movement'
      },
      distinctiveMarks: {
        moles: [
          {
            location: 'near left eye, slightly above cheekbone',
            size: 'small',
            description: 'distinctive beauty mark that enhances her appeal'
          }
        ],
        freckles: {
          pattern: 'very subtle, scattered',
          density: 'minimal but natural',
          locations: ['nose bridge', 'upper cheeks in sunlight']
        },
        scars: [],
        asymmetry: [
          {
            feature: 'smile',
            variation: 'left side lifts slightly higher creating charming asymmetry'
          },
          {
            feature: 'eyebrows',
            variation: 'left brow has slightly higher arch'
          },
          {
            feature: 'eyes',
            variation: 'right eye opens slightly wider than left'
          }
        ]
      },
      personalityTraits: {
        defaultExpression: 'confident smile with knowing look in her eyes',
        eyeExpression: 'intelligent and engaging with subtle sparkle of authority',
        smileType: 'genuine confident smile that projects trustworthiness and competence',
        energyLevel: 'high energy professional with magnetic presence'
      }
    };

    // SkinRealismEngine configuration
    this.skinConfig = {
      age: 26,
      gender: 'female',
      ethnicity: 'Mixed Latina/Mediterranean',
      skinTone: 'olive',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry', 'wrinkles'],
      overallIntensity: 'moderate'
    };

    // ConsistencyAnchors for reliable generation
    this.consistencyAnchors = {
      identityPreservation: [
        'PRESERVE: Aria\'s exact facial structure and bone architecture',
        'MAINTAIN: Amber-brown eyes with golden flecks',
        'KEEP: Beauty mark near left eye above cheekbone',
        'PRESERVE: Defined jawline and high cheekbones',
        'MAINTAIN: Honey-brown layered hair with highlights',
        'KEEP: Confident and magnetic presence'
      ],
      featureConstraints: [
        'Eyes must be large, almond-shaped, amber-brown with gold flecks',
        'Eyebrows naturally arched, medium thickness, well-groomed',
        'Lips full with defined cupid\'s bow and natural color',
        'Nose straight and proportioned, refined but natural',
        'Skin warm olive tone with golden undertones',
        'Face oval shape with defined jawline and high cheekbones'
      ],
      proportionGuidelines: [
        'Facial proportions follow golden ratio',
        'Eyes positioned 1 eye-width apart',
        'Nose length equals distance from nose tip to chin',
        'Lips positioned 1/3 distance from nose to chin',
        'Cheekbones at widest point of face',
        'Jawline creates strong but feminine angles'
      ],
      expressionLimits: [
        'Always maintain confident, professional demeanor',
        'Smile should be genuine and engaging',
        'Eyes should convey intelligence and trustworthiness',
        'Posture always confident and authoritative',
        'Expressions appropriate for insurance professional',
        'Energy level high but controlled and professional'
      ],
      lightingConsiderations: [
        'Lighting should enhance golden undertones in skin',
        'Highlight amber-gold flecks in eyes',
        'Bring out honey-brown tones in hair',
        'Create defined shadows on cheekbones',
        'Professional photography lighting standards',
        'Avoid harsh lighting that washes out features'
      ]
    };
  }

  /**
   * Generate base prompt for Aria
   */
  generateBasePrompt(context: string = 'professional headshot'): string {
    return `Ultra-photorealistic portrait of Aria, an attractive professional 26-year-old QuoteMoto insurance expert.

PHYSICAL FEATURES:
- Mixed Latina/Mediterranean heritage with warm olive skin and golden undertones
- Large almond-shaped amber-brown eyes with golden flecks
- High defined cheekbones and strong feminine jawline
- Naturally full lips with perfect cupid's bow
- Small beauty mark near left eye above cheekbone
- Long layered honey-brown hair with caramel highlights
- Confident, magnetic presence with professional authority

STYLE & APPEARANCE:
- Modern professional "baddie" aesthetic
- Professional natural makeup: defined brows, subtle contouring, nude-pink lips
- Delicate gold jewelry and minimalist accessories
- Confident posture projecting expertise and trustworthiness

NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

CONTEXT: ${context}
QuoteMoto branding elements subtly integrated
Professional photography, 8K resolution, natural lighting
Confident smile conveying insurance expertise and reliability`;
  }

  /**
   * Generate ultra-realistic prompt with maximum natural imperfections
   * Based on ZHO technique #31: turn this illustration into realistic version
   */
  generateUltraRealisticPrompt(context: string = 'professional headshot'): string {
    return `Ultra-photorealistic portrait of Aria, a stunning 26-year-old QuoteMoto insurance expert.

PHYSICAL FEATURES:
- Mixed Latina/Mediterranean heritage with warm olive skin and golden undertones
- Large almond-shaped amber-brown eyes with golden flecks
- High defined cheekbones and strong feminine jawline
- Naturally full lips with perfect cupid's bow
- Small beauty mark near left eye above cheekbone
- Long layered honey-brown hair with caramel highlights
- Confident, magnetic presence with professional authority

STYLE & APPEARANCE:
- Modern professional "baddie" aesthetic
- Flawless makeup: defined brows, subtle contouring, nude-pink lips
- Delicate gold jewelry and minimalist accessories
- Confident posture projecting expertise and trustworthiness

ULTRA-REALISTIC SKIN DETAILS (ZHO #31 ENHANCED):
- PORE VISIBILITY: Clearly visible pores across entire face, especially T-zone
- TEXTURE VARIATION: Mix of rougher areas (cheeks) and smoother areas (temples)
- MICRO-WRINKLES: Fine lines around eyes, mouth corners, forehead
- NATURAL OILS: Slight shine on nose bridge, forehead center, chin
- CAPILLARY VISIBILITY: Tiny red vessels near nostrils and eye corners
- SKIN TONE VARIATIONS: Darker patches under eyes, lighter on cheekbones
- FACIAL HAIR: Barely visible peach fuzz on upper lip and jawline
- SURFACE IMPERFECTIONS: 2-3 tiny blemishes, slight texture irregularities
- NATURAL ASYMMETRY: Left and right side slightly different (realistic)
- REAL HUMAN FLAWS: Not AI-perfect, genuinely human appearance

turn this illustration into realistic version

CONTEXT: ${context}
QuoteMoto branding elements subtly integrated
Professional photography, 8K resolution, natural lighting
Maximum realism with visible human imperfections
Confident smile conveying insurance expertise and reliability`;
  }

  /**
   * Generate QuoteMoto-branded professional settings
   */
  generateBrandedSettings(): string[] {
    return [
      'Modern QuoteMoto office with orange accent walls and sleek furniture',
      'Luxury car dealership showroom with QuoteMoto partnership signage',
      'Contemporary apartment with city skyline, QuoteMoto app on phone screen',
      'Professional conference room during insurance consultation',
      'Sleek car interior with QuoteMoto dashboard display visible',
      'Coffee shop with laptop showing QuoteMoto website and branding',
      'Modern co-working space with QuoteMoto promotional materials'
    ];
  }

  /**
   * Get outfit variations for different content types
   */
  getOutfitVariations(): { [key: string]: string } {
    return {
      'professional': 'Tailored navy blazer, white silk blouse, high-waisted trousers, gold watch',
      'casual-chic': 'Cream turtleneck, camel blazer, dark jeans, ankle boots, delicate jewelry',
      'contemporary': 'Bodycon midi dress in QuoteMoto orange, statement necklace, heels',
      'business-casual': 'Crop blazer, high-waisted wide-leg pants, fitted camisole, minimalist earrings',
      'trendy-professional': 'Leather jacket over silk blouse, tailored pants, designer bag'
    };
  }
}

// Export singleton instance
export const quoteMotoInfluencer = new QuoteMotoInfluencer();