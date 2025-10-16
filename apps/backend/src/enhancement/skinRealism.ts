// Skin Realism Enhancement Module
// Adds natural imperfections and realistic details to generated humans

export interface SkinImperfection {
  type: 'freckles' | 'pores' | 'wrinkles' | 'moles' | 'blemishes' | 'scars' | 'asymmetry';
  intensity: 'subtle' | 'moderate' | 'prominent';
  location: string[];
  description: string;
}

export interface SkinRealismConfig {
  age: number;
  gender: 'male' | 'female';
  ethnicity: string;
  skinTone: 'very-fair' | 'fair' | 'medium' | 'olive' | 'tan' | 'dark';
  imperfectionTypes: SkinImperfection['type'][];
  overallIntensity: 'minimal' | 'moderate' | 'high';
}

export interface EnhancedSkinDetails {
  imperfections: SkinImperfection[];
  textureDetails: string[];
  colorVariations: string[];
  asymmetryFeatures: string[];
  naturalElements: string[];
  promptEnhancements: string[];
}

export class SkinRealismEngine {

  // Face zones for future use in advanced placement logic
  // private faceZones = {
  //   tZone: ['forehead', 'nose', 'chin'],
  //   cheeks: ['upper cheeks', 'lower cheeks', 'cheekbones'],
  //   eyeArea: ['around eyes', 'upper eyelids', 'lower eyelids', 'eye corners'],
  //   mouth: ['around mouth', 'upper lip area', 'lower lip area'],
  //   jawline: ['jawline', 'near ears', 'neck transition'],
  //   general: ['across face', 'randomly distributed', 'concentrated areas']
  // };

  private imperfectionTemplates = {
    freckles: {
      descriptions: [
        'natural sun-kissed freckles with varying sizes and densities',
        'scattered light freckles creating authentic skin character',
        'subtle freckling that catches light naturally',
        'organic freckle patterns that follow natural facial contours'
      ],
      locations: ['nose bridge', 'upper cheeks', 'forehead', 'around eyes'],
      ageFactors: {
        young: 'light and scattered',
        adult: 'more pronounced with sun exposure',
        mature: 'deeper with age spots mixing in'
      }
    },
    pores: {
      descriptions: [
        'visible skin pores that catch light realistically',
        'natural pore texture with varying sizes across face',
        'subtle pore visibility that adds authentic skin grain',
        'microscopic skin texture showing individual pore patterns'
      ],
      locations: ['T-zone', 'nose', 'forehead', 'chin', 'cheeks'],
      ageFactors: {
        young: 'fine pores barely visible',
        adult: 'moderate pore visibility',
        mature: 'more pronounced pore structure'
      }
    },
    wrinkles: {
      descriptions: [
        'natural expression lines from authentic emotions',
        'subtle character lines that show life experience',
        'fine lines that appear with natural facial movement',
        'gentle aging marks that add human authenticity'
      ],
      locations: ['outer eyes', 'smile lines', 'forehead', 'between eyebrows'],
      ageFactors: {
        young: 'barely visible expression lines',
        adult: 'moderate laugh lines and expression marks',
        mature: 'well-defined character lines showing wisdom'
      }
    },
    moles: {
      descriptions: [
        'small natural beauty marks that add character',
        'tiny skin features that make the face unique',
        'subtle moles placed in realistic locations',
        'natural skin variations that enhance authenticity'
      ],
      locations: ['near eyes', 'cheeks', 'chin', 'forehead', 'neck area'],
      ageFactors: {
        young: 'few small beauty marks',
        adult: 'moderate number of natural moles',
        mature: 'various sizes and types of skin marks'
      }
    },
    blemishes: {
      descriptions: [
        'subtle skin imperfections that humans naturally have',
        'minor skin texture variations showing authenticity',
        'barely visible skin irregularities adding realism',
        'natural skin imperfections that catch light softly'
      ],
      locations: ['randomly across face', 'T-zone areas', 'jawline', 'temples'],
      ageFactors: {
        young: 'minor temporary skin variations',
        adult: 'subtle permanent skin character',
        mature: 'natural skin texture evolution'
      }
    },
    asymmetry: {
      descriptions: [
        'natural human facial asymmetry - left eye slightly different from right',
        'subtle eyebrow variations in thickness and arch',
        'natural nostril size differences',
        'authentic human feature variations that create character'
      ],
      locations: ['eyes', 'eyebrows', 'nostrils', 'smile', 'cheek heights'],
      ageFactors: {
        young: 'minimal but noticeable asymmetry',
        adult: 'moderate natural feature variations',
        mature: 'pronounced character asymmetry with age'
      }
    },
    scars: {
      descriptions: [
        'subtle character marks from life experiences',
        'faint skin texture variations adding authenticity',
        'natural skin history marks barely visible',
        'authentic skin character from natural living'
      ],
      locations: ['forehead', 'chin', 'near hairline', 'temple area'],
      ageFactors: {
        young: 'minimal character marks',
        adult: 'subtle life experience marks',
        mature: 'distinguished character marks'
      }
    }
  };

  /**
   * Generate comprehensive skin realism details
   */
  generateSkinRealism(config: SkinRealismConfig): EnhancedSkinDetails {
    console.log(`🎨 Generating skin realism for ${config.age}-year-old ${config.gender}...`);

    const imperfections: SkinImperfection[] = [];
    const textureDetails: string[] = [];
    const colorVariations: string[] = [];
    const asymmetryFeatures: string[] = [];
    const naturalElements: string[] = [];
    const promptEnhancements: string[] = [];

    // Generate imperfections based on config
    config.imperfectionTypes.forEach(type => {
      const imperfection = this.generateImperfection(type, config);
      imperfections.push(imperfection);
    });

    // Add texture details
    textureDetails.push(...this.generateTextureDetails(config));

    // Add color variations
    colorVariations.push(...this.generateColorVariations(config));

    // Add asymmetry features
    asymmetryFeatures.push(...this.generateAsymmetryFeatures(config));

    // Add natural elements
    naturalElements.push(...this.generateNaturalElements(config));

    // Generate prompt enhancements
    promptEnhancements.push(...this.buildPromptEnhancements(imperfections, config));

    console.log(`✅ Generated ${imperfections.length} imperfections with ${promptEnhancements.length} enhancements`);

    return {
      imperfections,
      textureDetails,
      colorVariations,
      asymmetryFeatures,
      naturalElements,
      promptEnhancements
    };
  }

  /**
   * Generate specific imperfection
   */
  private generateImperfection(type: SkinImperfection['type'], config: SkinRealismConfig): SkinImperfection {
    const template = this.imperfectionTemplates[type];
    const ageCategory = this.getAgeCategory(config.age);

    // Select appropriate intensity
    let intensity: SkinImperfection['intensity'] = 'subtle';

    switch (config.overallIntensity) {
      case 'minimal':
        intensity = 'subtle';
        break;
      case 'moderate':
        intensity = Math.random() > 0.7 ? 'moderate' : 'subtle';
        break;
      case 'high':
        intensity = Math.random() > 0.5 ? 'moderate' : (Math.random() > 0.8 ? 'prominent' : 'subtle');
        break;
    }

    // Select locations based on imperfection type
    const availableLocations = template.locations;
    const selectedLocations = availableLocations.slice(0, Math.max(1, Math.floor(Math.random() * 3) + 1));

    // Build description
    const baseDescription = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    const ageSpecificFactor = template.ageFactors[ageCategory as keyof typeof template.ageFactors];
    const description = `${baseDescription} - ${ageSpecificFactor}`;

    return {
      type,
      intensity,
      location: selectedLocations,
      description
    };
  }

  /**
   * Generate texture details
   */
  private generateTextureDetails(config: SkinRealismConfig): string[] {
    const details = [
      'natural skin grain with micro-texture variations',
      'subtle subsurface light scattering showing skin depth',
      'organic skin pattern following facial contours',
      'realistic skin surface with natural shine and matte areas'
    ];

    // Add age-specific texture
    if (config.age < 25) {
      details.push('youthful skin elasticity and smoothness');
    } else if (config.age < 40) {
      details.push('mature skin with character and life experience');
    } else {
      details.push('distinguished skin showing wisdom and experience');
    }

    // Add gender-specific details
    if (config.gender === 'male') {
      details.push('subtle stubble shadow or beard texture areas');
    } else {
      details.push('smooth skin with natural feminine softness');
    }

    return details;
  }

  /**
   * Generate color variations
   */
  private generateColorVariations(config: SkinRealismConfig): string[] {
    const variations = [
      'natural skin tone gradients from warm to cool',
      'subtle redness in cheeks and nose areas',
      'darker tones under eyes and in shadow areas',
      'warm undertones in highlighted facial areas'
    ];

    // Add skin tone specific variations
    switch (config.skinTone) {
      case 'very-fair':
        variations.push('pale complexion with pink undertones');
        break;
      case 'fair':
        variations.push('light skin with peachy undertones');
        break;
      case 'medium':
        variations.push('balanced skin tone with warm undertones');
        break;
      case 'olive':
        variations.push('olive complexion with golden undertones');
        break;
      case 'tan':
        variations.push('sun-kissed skin with bronze undertones');
        break;
      case 'dark':
        variations.push('rich skin tone with deep warm undertones');
        break;
    }

    return variations;
  }

  /**
   * Generate asymmetry features
   */
  private generateAsymmetryFeatures(_config: SkinRealismConfig): string[] {
    return [
      'left eye slightly smaller than right eye',
      'eyebrows with different thickness - left thicker than right',
      'subtle smile asymmetry - left side of mouth higher',
      'natural nostril size variation',
      'one cheekbone slightly more prominent than the other',
      'ear positions at slightly different heights',
      'natural facial feature variations that create character'
    ];
  }

  /**
   * Generate natural elements
   */
  private generateNaturalElements(_config: SkinRealismConfig): string[] {
    return [
      'individual eyelash details with natural variations',
      'eyebrow hairs with different lengths and directions',
      'natural lip texture with subtle vertical lines',
      'realistic hair growth patterns and directions',
      'authentic eye reflections with natural catchlights',
      'natural skin elasticity and subtle movement',
      'organic facial proportions with human imperfection'
    ];
  }

  /**
   * Build prompt enhancements
   */
  private buildPromptEnhancements(imperfections: SkinImperfection[], _config: SkinRealismConfig): string[] {
    const enhancements: string[] = [];

    // Core realism requirements
    enhancements.push('CRITICAL: Must include visible skin pores');
    enhancements.push('CRITICAL: Must have natural facial asymmetry');
    enhancements.push('CRITICAL: Must show natural skin texture variations');
    enhancements.push('CRITICAL: Must avoid plastic or synthetic appearance');
    enhancements.push('CRITICAL: Must include subtle imperfections for authenticity');

    // Imperfection-specific enhancements
    imperfections.forEach(imp => {
      enhancements.push(`${imp.intensity} ${imp.type} on ${imp.location.join(', ')}: ${imp.description}`);
    });

    // Technical requirements
    enhancements.push('Professional photography quality with natural lighting');
    enhancements.push('Authentic color grading showing real human skin tones');
    enhancements.push('Natural depth of field with focus on facial features');
    enhancements.push('Realistic subsurface scattering in skin');
    enhancements.push('Individual hair strand details with natural flyaways');

    return enhancements;
  }

  /**
   * Get age category
   */
  private getAgeCategory(age: number): 'young' | 'adult' | 'mature' {
    if (age < 25) return 'young';
    if (age < 45) return 'adult';
    return 'mature';
  }

  /**
   * Create Sophia-specific skin realism
   */
  static createSophiaSkinRealism(): EnhancedSkinDetails {
    const engine = new SkinRealismEngine();

    const config: SkinRealismConfig = {
      age: 25,
      gender: 'female',
      ethnicity: 'Mixed Latin/Mediterranean heritage',
      skinTone: 'olive',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry', 'wrinkles', 'moles'],
      overallIntensity: 'moderate'
    };

    return engine.generateSkinRealism(config);
  }

  /**
   * Apply skin realism to existing prompt
   */
  static enhancePromptWithRealism(basePrompt: string, skinDetails: EnhancedSkinDetails): string {
    return `
${basePrompt}

SKIN REALISM ENHANCEMENTS:
${skinDetails.promptEnhancements.join('\n- ')}

TEXTURE DETAILS:
${skinDetails.textureDetails.join('\n- ')}

COLOR VARIATIONS:
${skinDetails.colorVariations.join('\n- ')}

NATURAL ASYMMETRY:
${skinDetails.asymmetryFeatures.join('\n- ')}

NATURAL ELEMENTS:
${skinDetails.naturalElements.join('\n- ')}
    `.trim();
  }

  // ========================================================================
  // ZHO ADVANCED TECHNIQUES INTEGRATION
  // ========================================================================

  /**
   * Apply ZHO professional photography enhancement to skin realism
   */
  static enhanceForProfessionalPhotography(
    basePrompt: string,
    skinDetails: EnhancedSkinDetails,
    photographyStyle: 'fashion' | 'portrait' | 'editorial' | 'commercial' = 'editorial'
  ): string {
    const photographyEnhancements = {
      fashion: [
        'sharp facial features and flawless fair skin',
        'dramatic, cinematic lighting highlights facial structure',
        'luxury fashion magazine cover aesthetic',
        'high-detail, 4K resolution, symmetrical composition',
        'professional studio lighting with controlled shadows'
      ],
      portrait: [
        'professional portrait lighting with soft shadows',
        'natural skin texture with professional retouching',
        'headshot quality with magazine-grade post-processing',
        'controlled background with subject focus'
      ],
      editorial: [
        'editorial photography style with artistic lighting',
        'bold contrast and dramatic mood lighting',
        'magazine-quality professional presentation',
        'creative composition with technical excellence'
      ],
      commercial: [
        'commercial photography standards with brand-appropriate lighting',
        'product photography quality applied to portraits',
        'clean, professional aesthetic suitable for advertising',
        'high-end commercial production values'
      ]
    };

    const qualityEnhancers = [
      'professional photography',
      '4K resolution',
      'realistic and lifelike style',
      'high-detail rendering',
      'professional studio lighting',
      'expertly controlled shadows and highlights'
    ];

    return `
${basePrompt}

ZHO PROFESSIONAL PHOTOGRAPHY ENHANCEMENT:
${photographyEnhancements[photographyStyle].join('\n- ')}

SKIN REALISM (PROFESSIONAL GRADE):
${skinDetails.promptEnhancements.join('\n- ')}

TECHNICAL QUALITY:
${qualityEnhancers.join('\n- ')}

TEXTURE DETAILS (HD):
${skinDetails.textureDetails.map(detail => `${detail} (professional photography quality)`).join('\n- ')}

LIGHTING INTEGRATION:
- Natural skin tone variations enhanced by professional lighting
- Subtle subsurface scattering effects
- Realistic shadow play on facial contours
- Professional color grading and balance
    `.trim();
  }

  /**
   * Generate high-resolution skin enhancement (ZHO technique)
   */
  static generateHighResolutionSkinEnhancement(skinDetails: EnhancedSkinDetails): string[] {
    return [
      'Enhance this image to high resolution with ultra-realistic skin texture',
      'Professional 8K quality skin rendering with natural imperfections',
      'High-definition skin pores and texture details visible at close inspection',
      'Ultra-sharp facial features with flawless but natural skin appearance',
      'Professional retouching while maintaining authentic human characteristics',
      ...skinDetails.promptEnhancements.map(enhancement => `HD quality: ${enhancement}`),
      'Photorealistic skin subsurface scattering and natural light absorption',
      'Professional photography grade skin texture and detail enhancement'
    ];
  }

  /**
   * Apply amateur-to-professional transformation (ZHO technique)
   */
  static enhanceAmateurToProfessional(
    basePrompt: string,
    skinDetails: EnhancedSkinDetails
  ): string {
    return `
Transform the person in the photo into highly stylized ultra-realistic portrait,
with sharp facial features and flawless fair skin. Professional photography quality.

${basePrompt}

PROFESSIONAL TRANSFORMATION:
- Amateur photo quality → Professional magazine grade
- Enhanced skin texture while maintaining authenticity
- Professional lighting and composition
- Editorial photography style presentation
- High-detail, 4K resolution output

SKIN REALISM (PROFESSIONAL GRADE):
${skinDetails.promptEnhancements.join('\n- ')}

PROFESSIONAL QUALITY MARKERS:
- Dramatic, cinematic lighting highlights facial structure
- Luxury fashion magazine cover aesthetic
- Symmetrical composition with professional framing
- Expert color grading and post-processing effects
- Professional studio lighting with controlled environment

TEXTURE ENHANCEMENT:
${skinDetails.textureDetails.map(detail => `Professional quality: ${detail}`).join('\n- ')}
    `.trim();
  }

  /**
   * Apply virtual makeup with skin realism (ZHO technique)
   */
  static enhanceForVirtualMakeup(
    basePrompt: string,
    skinDetails: EnhancedSkinDetails,
    makeupStyle: 'natural' | 'glamorous' | 'editorial' | 'commercial' = 'natural'
  ): string {
    const makeupIntegration = {
      natural: [
        'Natural makeup that enhances existing skin texture',
        'Subtle foundation that works with skin imperfections',
        'Makeup application that follows natural facial contours'
      ],
      glamorous: [
        'Glamorous makeup with professional application',
        'Full coverage foundation with flawless finish',
        'Dramatic makeup that enhances natural features'
      ],
      editorial: [
        'Editorial makeup with artistic flair',
        'Professional makeup artist quality application',
        'Creative makeup that maintains skin authenticity'
      ],
      commercial: [
        'Commercial makeup suitable for brand representation',
        'Professional makeup with broad appeal',
        'Polished makeup that enhances professional appearance'
      ]
    };

    return `
${basePrompt}

VIRTUAL MAKEUP APPLICATION:
为图一人物化上指定的妆，还保持图一的姿势
Apply specified makeup to the person while maintaining original pose and skin characteristics

MAKEUP INTEGRATION WITH SKIN REALISM:
${makeupIntegration[makeupStyle].join('\n- ')}

SKIN TEXTURE PRESERVATION:
${skinDetails.promptEnhancements.map(enhancement => `Under makeup: ${enhancement}`).join('\n- ')}

NATURAL INTERACTION:
- Makeup follows natural skin texture and imperfections
- Foundation settles into pores and skin grain naturally
- Lighting interacts realistically with makeup and skin
- Makeup enhances rather than masks natural skin character

PROFESSIONAL APPLICATION:
- Expert makeup artist quality application
- Proper color matching to skin tone
- Realistic makeup-skin interaction and blending
    `.trim();
  }

  /**
   * Generate material/texture overlay effects (ZHO technique)
   */
  static generateMaterialOverlay(
    basePrompt: string,
    skinDetails: EnhancedSkinDetails,
    materialType: 'glass' | 'metal' | 'fabric' | 'liquid' | 'light' = 'glass'
  ): string {
    const materialEffects = {
      glass: [
        'Glass-like transparency effects overlaid on skin',
        'Refraction patterns that follow facial contours',
        'Glass surface reflections on skin texture'
      ],
      metal: [
        'Metallic sheen effects integrated with skin texture',
        'Chrome-like reflections following facial structure',
        'Metallic overlay that respects skin imperfections'
      ],
      fabric: [
        'Fabric texture patterns overlaid on skin surface',
        'Textile weave effects that follow skin contours',
        'Cloth-like texture integration with natural skin'
      ],
      liquid: [
        'Liquid surface effects on skin texture',
        'Water-like reflections and ripple patterns',
        'Fluid dynamics effects on facial features'
      ],
      light: [
        'Light ray effects projected onto skin surface',
        'Luminous overlay patterns following skin texture',
        'Photonic effects integrated with natural skin'
      ]
    };

    return `
${basePrompt}

MATERIAL OVERLAY TECHNIQUE:
为照片叠加上指定材质的效果
Apply specified material effects overlaid on the photo

MATERIAL EFFECTS (${materialType.toUpperCase()}):
${materialEffects[materialType].join('\n- ')}

SKIN TEXTURE INTEGRATION:
${skinDetails.promptEnhancements.map(enhancement => `With ${materialType} overlay: ${enhancement}`).join('\n- ')}

REALISTIC INTERACTION:
- Material effects respect natural skin topology
- Overlay follows facial contours and skin texture
- Natural lighting interaction between material and skin
- Seamless integration maintaining skin authenticity

PROFESSIONAL RENDERING:
- High-quality material simulation
- Realistic physics of material-skin interaction
- Professional post-processing effects
- Photorealistic material properties
    `.trim();
  }

  /**
   * Create ZHO-style realism configuration for specific use cases
   */
  static createZHOStyleRealism(
    useCase: 'viral-figure' | 'professional-photo' | 'makeup-tryout' | 'material-overlay',
    age: number = 26,
    gender: 'male' | 'female' = 'female',
    ethnicity: string = 'Mixed heritage'
  ): EnhancedSkinDetails {
    const engine = new SkinRealismEngine();

    const baseConfig: SkinRealismConfig = {
      age,
      gender,
      ethnicity,
      skinTone: 'olive',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry', 'wrinkles', 'moles'],
      overallIntensity: 'moderate'
    };

    const baseRealism = engine.generateSkinRealism(baseConfig);

    // Enhance based on use case
    const useCaseEnhancements = {
      'viral-figure': [
        'Ultra-realistic skin suitable for figure/collectible transformation',
        'High-detail skin texture that translates well to 3D representation',
        'Character-defining skin features for figure accuracy'
      ],
      'professional-photo': [
        'Professional photography grade skin realism',
        'Magazine-quality skin texture and detail',
        'Commercial photography suitable skin enhancement'
      ],
      'makeup-tryout': [
        'Skin texture optimized for makeup application',
        'Foundation-ready skin with realistic pore structure',
        'Makeup-compatible skin surface details'
      ],
      'material-overlay': [
        'Skin texture suitable for material overlay effects',
        'High-contrast skin details for material integration',
        'Surface topology optimized for overlay techniques'
      ]
    };

    return {
      ...baseRealism,
      promptEnhancements: [
        ...baseRealism.promptEnhancements,
        ...useCaseEnhancements[useCase]
      ]
    };
  }

  /**
   * Apply ZHO universal style-to-realism transformation
   */
  static applyUniversalRealismTransformation(
    basePrompt: string,
    skinDetails: EnhancedSkinDetails
  ): string {
    return `
turn this illustration into realistic version

${basePrompt}

REALISM TRANSFORMATION REQUIREMENTS:
- Convert any artistic style to photorealistic human
- Maintain character identity while adding realistic skin
- Professional photography quality output

SKIN REALISM INTEGRATION:
${skinDetails.promptEnhancements.join('\n- ')}

UNIVERSAL REALISM PRINCIPLES:
- Works on anime, cartoons, paintings, sketches
- Preserves character essence while adding human realism
- Professional quality photorealistic conversion
- Natural skin texture and imperfections
- Realistic lighting and subsurface scattering

QUALITY STANDARDS:
- Ultra-photorealistic 8K resolution
- Professional photography lighting standards
- Realistic human skin characteristics
- Natural imperfections and authentic appearance
    `.trim();
  }
}

export const skinRealismEngine = new SkinRealismEngine();