// Character Consistency Enhancement Module
// Ensures consistent facial features across multiple generations and angles

export interface CharacterIdentity {
  name: string;
  coreFeatures: {
    faceShape: string;
    eyeShape: string;
    eyeColor: string;
    eyebrowShape: string;
    noseShape: string;
    lipShape: string;
    jawline: string;
    cheekbones: string;
    skinTone: string;
    hairColor: string;
    hairTexture: string;
  };
  distinctiveMarks: {
    moles: Array<{ location: string; size: string; description: string }>;
    freckles: { pattern: string; density: string; locations: string[] };
    scars: Array<{ location: string; type: string; visibility: string }>;
    asymmetry: Array<{ feature: string; variation: string }>;
  };
  personalityTraits: {
    defaultExpression: string;
    eyeExpression: string;
    smileType: string;
    energyLevel: string;
  };
  preserveIdentity?: boolean;
  context?: string;
}

export interface ConsistencyAnchors {
  identityPreservation: string[];
  featureConstraints: string[];
  proportionGuidelines: string[];
  expressionLimits: string[];
  lightingConsiderations: string[];
}

export interface MultiAngleGeneration {
  angles: Array<{
    name: string;
    description: string;
    specificInstructions: string;
    consistencyChecks: string[];
  }>;
  crossAngleValidation: string[];
}

export class CharacterConsistencyEngine {

  // CHARACTER CONSISTENCY PROMPT TEMPLATES - ACTIVE
  private consistencyPromptTemplates = {
    identityLock: [
      'PRESERVE: Exact same facial structure and bone geometry',
      'MAINTAIN: Identical eye shape, size, and color',
      'KEEP: Same nose proportions and shape',
      'RETAIN: Consistent lip shape and natural texture',
      'PRESERVE: Same jawline definition and cheekbone structure',
      'MAINTAIN: Identical skin tone and complexion',
      'KEEP: Same hair color, texture, and growth patterns'
    ],

    featureAnchors: [
      'Facial geometry must match reference exactly',
      'Eye positioning and shape cannot change',
      'Nose bridge and nostril proportions fixed',
      'Lip width and shape must remain consistent',
      'Facial proportions locked to reference',
      'Skin texture and tone variations preserved'
    ],

    crossAngleValidation: [
      'Same person recognizable from all angles',
      'Facial features maintain proper 3D consistency',
      'Profile view shows same nose and jaw structure',
      'Three-quarter view preserves eye and cheek proportions',
      'All angles show identical distinctive features'
    ]
  };


  /**
   * Build detailed character prompt with consistency anchors
   */
  buildCharacterPrompt(_character: CharacterIdentity, referenceImagePath?: string): string {
    let prompt = '';

    // Reference image instruction
    if (referenceImagePath) {
      prompt += `REFERENCE IMAGE CONSISTENCY: Generate the exact same person as shown in the reference image.\n`;
      prompt += `Maintain identical facial structure, features, and proportions.\n\n`;
    }

    // Identity lock
    prompt += `IDENTITY PRESERVATION:\n`;
    prompt += `- ${this.consistencyPromptTemplates.identityLock.join('\n- ')}\n\n`;

    // Feature anchors
    prompt += `FEATURE CONSISTENCY:\n`;
    prompt += `- ${this.consistencyPromptTemplates.featureAnchors.join('\n- ')}\n\n`;

    // Cross-angle validation
    prompt += `CROSS-ANGLE VALIDATION:\n`;
    prompt += `- ${this.consistencyPromptTemplates.crossAngleValidation.join('\n- ')}\n\n`;

    return prompt;
  }

  /**
   * Generate consistency anchors for character
   */
  generateConsistencyAnchors(identity: CharacterIdentity): ConsistencyAnchors {
    const identityPreservation = [
      `Character name: ${identity.name} - exact same person`,
      `Face shape: ${identity.coreFeatures.faceShape}`,
      `Eye shape and color: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}`,
      `Eyebrow shape: ${identity.coreFeatures.eyebrowShape}`,
      `Nose shape: ${identity.coreFeatures.noseShape}`,
      `Lip shape: ${identity.coreFeatures.lipShape}`,
      `Jawline: ${identity.coreFeatures.jawline}`,
      `Cheekbones: ${identity.coreFeatures.cheekbones}`,
      `Skin tone: ${identity.coreFeatures.skinTone}`,
      `Hair: ${identity.coreFeatures.hairColor} ${identity.coreFeatures.hairTexture}`
    ];

    const featureConstraints = [
      'Facial geometry must match reference exactly',
      'Eye positioning and shape cannot change',
      'Nose bridge and nostril proportions fixed',
      'Lip width and shape must remain consistent',
      'Facial proportions locked to reference',
      'Skin texture and tone variations preserved'
    ];

    const proportionGuidelines = [
      'Golden ratio facial proportions (1.618)',
      'Eye spacing: 0.46 facial width ratio',
      'Nose width: 0.36 facial width ratio',
      'Natural facial asymmetry maintained',
      'Distinctive marks precisely positioned'
    ];

    const expressionLimits = [
      `Default expression: ${identity.personalityTraits.defaultExpression}`,
      `Eye expression baseline: ${identity.personalityTraits.eyeExpression}`,
      `Smile type: ${identity.personalityTraits.smileType}`,
      `Energy level: ${identity.personalityTraits.energyLevel}`,
      'Expressions can vary but core personality traits visible',
      'Micro-expressions must be consistent with character'
    ];

    const lightingConsiderations = [
      'Lighting can change but facial features must remain visible',
      'Shadows cannot hide distinctive features',
      'Color temperature can vary but skin tone stays consistent',
      'Dramatic lighting allowed if character features clear',
      'All distinctive marks must be visible in all lighting'
    ];

    // Add distinctive marks to identity preservation
    identity.distinctiveMarks.moles.forEach(mole => {
      identityPreservation.push(`${mole.size} mole on ${mole.location}: ${mole.description}`);
    });

    if (identity.distinctiveMarks.freckles.pattern !== 'none') {
      identityPreservation.push(`Freckle pattern: ${identity.distinctiveMarks.freckles.pattern} ${identity.distinctiveMarks.freckles.density} on ${identity.distinctiveMarks.freckles.locations.join(', ')}`);
    }

    identity.distinctiveMarks.asymmetry.forEach(asym => {
      identityPreservation.push(`Asymmetry: ${asym.feature} ${asym.variation}`);
    });

    console.log(`✅ Generated consistency anchors with ${identityPreservation.length} identity markers`);

    return {
      identityPreservation,
      featureConstraints,
      proportionGuidelines,
      expressionLimits,
      lightingConsiderations
    };
  }

  /**
   * Generate multi-angle generation plan
   */
  generateMultiAnglePlan(identity: CharacterIdentity): MultiAngleGeneration {
    const angles = [
      {
        name: 'frontal',
        description: 'Direct front-facing view, looking straight at camera',
        specificInstructions: `
          - Direct eye contact with camera
          - Symmetrical composition
          - Both eyes and eyebrows clearly visible
          - Full nose shape visible
          - Both sides of face equally lit
          - ${identity.personalityTraits.defaultExpression}
        `,
        consistencyChecks: [
          'Both eyes same size and shape',
          'Facial symmetry appropriate for character',
          'All distinctive marks visible'
        ]
      },
      {
        name: 'three-quarter',
        description: 'Three-quarter view showing both front and profile elements',
        specificInstructions: `
          - 45-degree angle from front
          - Both eyes visible (far eye partially)
          - Nose profile and front visible
          - Cheekbone structure prominent
          - Jaw and ear line visible
          - Natural head position
        `,
        consistencyChecks: [
          'Far eye correctly foreshortened but same shape',
          'Nose maintains same shape in 3D',
          'Cheekbone prominence matches character'
        ]
      },
      {
        name: 'profile',
        description: 'Side profile view showing facial structure',
        specificInstructions: `
          - Pure side view (90 degrees)
          - Clear nose profile shape
          - Jaw and chin line defined
          - Forehead to chin curve
          - Ear shape and position
          - One eye visible from side
        `,
        consistencyChecks: [
          'Nose profile matches front view structure',
          'Jaw angle consistent with front view',
          'Forehead curve matches character'
        ]
      },
      {
        name: 'slight-turn',
        description: 'Subtle head turn, mostly front-facing',
        specificInstructions: `
          - 15-20 degree turn from front
          - Both eyes fully visible
          - Slight nose asymmetry natural
          - Natural neck position
          - Comfortable pose
          - ${identity.personalityTraits.defaultExpression}
        `,
        consistencyChecks: [
          'Eyes maintain same shape and color',
          'Turn feels natural not forced',
          'All facial features proportionally correct'
        ]
      }
    ];

    const crossAngleValidation = [
      'Same person recognizable across all angles',
      'Facial structure maintains 3D consistency',
      'Distinctive marks appear in appropriate angles',
      'Skin tone and texture consistent across views',
      'Hair behaves naturally in different angles',
      'Expression personality consistent across views',
      'Lighting may change but features stay consistent'
    ];

    return { angles, crossAngleValidation };
  }

  /**
   * Build consistency-enhanced prompt
   */
  buildConsistencyPrompt(
    basePrompt: string,
    identity: CharacterIdentity,
    angle: 'frontal' | 'three-quarter' | 'profile' | 'slight-turn',
    anchors: ConsistencyAnchors
  ): string {
    const multiAnglePlan = this.generateMultiAnglePlan(identity);
    const angleSpec = multiAnglePlan.angles.find(a => a.name === angle);

    return `
${basePrompt}

CHARACTER IDENTITY LOCK:
${anchors.identityPreservation.join('\n- ')}

FEATURE CONSTRAINTS:
${anchors.featureConstraints.join('\n- ')}

ANGLE SPECIFICATIONS (${angle.toUpperCase()}):
${angleSpec?.specificInstructions || 'Standard positioning'}

CONSISTENCY CHECKS:
${angleSpec?.consistencyChecks.join('\n- ') || 'Standard consistency'}

PROPORTION GUIDELINES:
${anchors.proportionGuidelines.join('\n- ')}

CRITICAL REQUIREMENTS:
- Must be recognizable as ${identity.name}
- All distinctive features must be visible and accurate
- Facial geometry must match exactly across angles
- Natural pose but identity preserved perfectly
- Professional quality but human authenticity maintained

AVOID:
- Any changes to facial structure or features
- Generic faces or different people
- Artificial or plastic appearance
- Inconsistent proportions or features
    `.trim();
  }

  /**
   * Create Aria QuoteMoto Insurance Expert Identity (MAIN CHARACTER)
   */
  static createAriaQuoteMotoIdentity(): CharacterIdentity {
    return {
      name: 'Aria',
      coreFeatures: {
        faceShape: 'Heart-shaped with defined cheekbones, golden ratio 1.618 proportions',
        eyeShape: 'Almond-shaped with slight upward tilt, 0.46 eye spacing ratio',
        eyeColor: 'Rich warm brown (#8B4513 with gold flecks)',
        eyebrowShape: 'Naturally arched with left eyebrow slightly higher arch',
        noseShape: 'Straight bridge nose (0.36 facial width ratio)',
        lipShape: 'Full cupid\'s bow lips with natural texture',
        jawline: 'Soft square jawline with 7/10 definition',
        cheekbones: 'High prominent cheekbones (7/10 definition)',
        skinTone: 'Golden olive base (#D4A574) with natural variations',
        hairColor: 'Dark brown with natural highlights',
        hairTexture: 'Professional styling suitable for business context'
      },
      distinctiveMarks: {
        moles: [
          {
            location: '1.2cm below left eye',
            size: '2mm diameter medium brown',
            description: 'distinctive beauty mark that aids character recognition'
          }
        ],
        freckles: {
          pattern: 'light scatter freckles',
          density: '15-20 small freckles',
          locations: ['nose bridge', 'upper cheeks']
        },
        scars: [],
        asymmetry: [
          {
            feature: 'eyes',
            variation: 'left eye 3% smaller than right eye (natural asymmetry)'
          },
          {
            feature: 'eyebrows',
            variation: 'left eyebrow slightly higher arch'
          },
          {
            feature: 'smile',
            variation: 'right side smile lifts slightly more'
          }
        ]
      },
      personalityTraits: {
        defaultExpression: 'confident and trustworthy professional smile with natural warmth',
        eyeExpression: 'composed professional insurance expert energy',
        smileType: 'genuine professional smile that builds trust',
        energyLevel: 'composed professional insurance expert energy'
      }
    };
  }

  /**
   * Create Sophia character identity
   */
  static createSophiaIdentity(): CharacterIdentity {
    return {
      name: 'Sophia',
      coreFeatures: {
        faceShape: 'oval with soft angles',
        eyeShape: 'almond-shaped with natural fold',
        eyeColor: 'striking hazel-green with golden flecks',
        eyebrowShape: 'naturally arched, medium thickness',
        noseShape: 'straight with slight upturn',
        lipShape: 'naturally full with subtle asymmetry',
        jawline: 'soft and feminine',
        cheekbones: 'high and defined',
        skinTone: 'warm olive with golden undertones',
        hairColor: 'rich dark brown',
        hairTexture: 'wavy with natural volume'
      },
      distinctiveMarks: {
        moles: [
          {
            location: 'near left eye',
            size: 'tiny',
            description: 'small beauty mark that adds character'
          }
        ],
        freckles: {
          pattern: 'light scatter',
          density: 'subtle',
          locations: ['nose bridge', 'upper cheeks']
        },
        scars: [],
        asymmetry: [
          {
            feature: 'eyes',
            variation: 'left eye slightly smaller than right'
          },
          {
            feature: 'eyebrows',
            variation: 'left eyebrow naturally thicker'
          },
          {
            feature: 'smile',
            variation: 'left side of mouth slightly higher'
          }
        ]
      },
      personalityTraits: {
        defaultExpression: 'confident and approachable smile with natural warmth',
        eyeExpression: 'intelligent and engaging with subtle sparkle',
        smileType: 'genuine smile that reaches the eyes',
        energyLevel: 'vibrant but composed professional energy'
      }
    };
  }

  /**
   * Generate consistency validation checklist
   */
  generateValidationChecklist(identity: CharacterIdentity): string[] {
    return [
      `Is this clearly ${identity.name}?`,
      `Does the face shape match: ${identity.coreFeatures.faceShape}?`,
      `Are the eyes correct: ${identity.coreFeatures.eyeShape} with ${identity.coreFeatures.eyeColor}?`,
      `Is the nose shape accurate: ${identity.coreFeatures.noseShape}?`,
      `Do the lips match: ${identity.coreFeatures.lipShape}?`,
      `Is the jawline consistent: ${identity.coreFeatures.jawline}?`,
      `Are the cheekbones right: ${identity.coreFeatures.cheekbones}?`,
      `Is the skin tone correct: ${identity.coreFeatures.skinTone}?`,
      `Does the hair match: ${identity.coreFeatures.hairColor} ${identity.coreFeatures.hairTexture}?`,
      'Are all distinctive marks present and accurate?',
      'Does the expression match the character personality?',
      'Would this be recognizable in a lineup of similar people?'
    ];
  }

  /**
   * Apply consistency to existing prompt
   */
  static applyConsistencyToPrompt(
    basePrompt: string,
    character: CharacterIdentity,
    angle: 'frontal' | 'three-quarter' | 'profile' | 'slight-turn' = 'frontal'
  ): string {
    const engine = new CharacterConsistencyEngine();
    const anchors = engine.generateConsistencyAnchors(character);
    return engine.buildConsistencyPrompt(basePrompt, character, angle, anchors);
  }

  // ========================================================================
  // ZHO PRESERVATION PATTERNS INTEGRATION - 46 VIRAL TECHNIQUES
  // ========================================================================

  /**
   * Apply ZHO Technique #31: Universal Style-to-Realism (MOST IMPORTANT)
   * Converts any style to photorealistic while preserving character
   */
  static applyZHOTechnique31UniversalStyleToRealism(
    basePrompt: string,
    identity: CharacterIdentity,
    sourceStyle?: string
  ): string {
    const styleInstruction = sourceStyle ?
      `turn this ${sourceStyle} into realistic version` :
      'transform to ultra-photorealistic version';

    return `
${styleInstruction}
${basePrompt}

ZHO TECHNIQUE #31 - UNIVERSAL STYLE-TO-REALISM:
- Works across all styles, angles, contexts, and platforms
- Maintains exact character identity through any transformation
- Preserves human authenticity and natural imperfections
- Keeps character recognition at 100% accuracy

PRESERVE EXACT CHARACTER IDENTITY:
- Name: ${identity.name} (exact same person)
- Face: ${identity.coreFeatures.faceShape} with ${identity.coreFeatures.skinTone}
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}
- Features: ${identity.coreFeatures.noseShape} nose, ${identity.coreFeatures.lipShape} lips
- Structure: ${identity.coreFeatures.jawline}, ${identity.coreFeatures.cheekbones}
- Expression: ${identity.personalityTraits.defaultExpression}
- Energy: ${identity.personalityTraits.energyLevel}

SKIN REALISM REQUIREMENTS (ZHO TECHNIQUES 41-46):
- Visible skin pore texture throughout face (Technique 41: Pore-level detail mapping)
- Natural skin tone variations and gradients
- Realistic subsurface light scattering (Technique 7)
- Mix of matte and naturally shiny areas (T-zone slight shine)
- Natural human imperfections for authenticity (Technique 44: Natural aging indicators)
- Photographic imperfection emulation (Technique 46)

NEGATIVE PROMPT: CGI, synthetic, plastic skin, perfect symmetry, airbrushed, smooth texture, doll-like, mannequin, artificial, cartoon, illustration, painting, drawing, different person, wrong face, inconsistent features, generic woman
    `.trim();
  }

  /**
   * Apply ZHO Technique #1: Image-to-Figure Transformation (Highest Viral Potential)
   */
  static applyZHOTechnique1ImageToFigure(
    basePrompt: string,
    identity: CharacterIdentity,
    brandName: string = 'Character'
  ): string {
    return `
turn this photo into a character figure. Behind it, place a box with
the character's image printed on it, and a computer showing the Blender
modeling process on its screen. In front of the box, add a round plastic
base with the character figure standing on it. set the scene indoors if possible

${basePrompt}

ZHO TECHNIQUE #1 - IMAGE-TO-FIGURE TRANSFORMATION:
- Highest viral potential technique
- Creates collectible figure representation
- Shows creation process for engagement

CHARACTER FIGURE SPECIFICATIONS:
- Figure based on ${identity.name} with exact facial features preserved
- Box packaging labeled "${brandName}"
- Computer screen showing 3D modeling process
- Round plastic base for figure
- Professional lighting setup
- Indoor studio environment

PRESERVE CHARACTER IN FIGURE FORM:
- Face: ${identity.coreFeatures.faceShape} maintained in 3D
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}
- Features: All distinctive marks visible on figure
- Proportions: Human scale translated to figure scale
- Expression: ${identity.personalityTraits.defaultExpression} captured

CRITICAL CONSISTENCY:
- Same person recognizable in both photo and figure
- Figure maintains exact facial geometry
- All distinctive features present on figure
- Professional collectible quality presentation
    `.trim();
  }

  /**
   * Apply ZHO Technique #25: Professional Photography Enhancement
   */
  static applyZHOTechnique25ProfessionalEnhancement(
    basePrompt: string,
    identity: CharacterIdentity
  ): string {
    return `
Transform the person in the photo into highly stylized ultra-realistic portrait,
with sharp facial features and flawless fair skin, standing confidently against
a bold gradient background. Dramatic, cinematic lighting highlights facial
structure, evoking the look of a luxury fashion magazine cover.
Editorial photography style, high-detail, 4K resolution, symmetrical
composition, minimalistic background

${basePrompt}

ZHO TECHNIQUE #25 - PROFESSIONAL PHOTOGRAPHY ENHANCEMENT:
- Transforms amateur photos to professional quality
- Magazine-grade lighting and composition
- Ultra-high resolution detail

PRESERVE CHARACTER THROUGH ENHANCEMENT:
- Name: ${identity.name} enhanced to professional standard
- Face: ${identity.coreFeatures.faceShape} with enhanced definition
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor} with professional lighting
- Features: ${identity.coreFeatures.noseShape} nose, ${identity.coreFeatures.lipShape} lips enhanced
- Skin: ${identity.coreFeatures.skinTone} with professional retouching
- Expression: ${identity.personalityTraits.defaultExpression} enhanced

ENHANCEMENT SPECIFICATIONS:
- Editorial photography quality
- Dramatic cinematic lighting
- 4K ultra-high resolution
- Professional gradient background
- Magazine cover presentation
- Luxury fashion aesthetic

MAINTAIN AUTHENTICITY:
- Character identity preserved through enhancement
- Natural features enhanced, not changed
- Professional quality maintains human authenticity
    `.trim();
  }

  /**
   * Apply ZHO "PRESERVE:" pattern for absolute character consistency
   */
  static applyZHOPreservationPattern(
    basePrompt: string,
    identity: CharacterIdentity,
    preservationType: 'facial-features' | 'full-identity' | 'brand-context' | 'cross-platform' = 'facial-features'
  ): string {
    const preservationPatterns = {
      'facial-features': [
        'PRESERVE: Exact facial features',
        'PRESERVE: Same facial structure and bone geometry',
        'PRESERVE: Identical eye shape, size, and color',
        'PRESERVE: Same nose proportions and shape',
        'PRESERVE: Consistent lip shape and natural texture',
        'PRESERVE: Same jawline definition and cheekbone structure',
        'PRESERVE: Identical skin tone and complexion',
        'PRESERVE: Same hair color, texture, and growth patterns'
      ],
      'full-identity': [
        'PRESERVE: Complete character identity',
        'PRESERVE: All distinctive features and marks',
        'PRESERVE: Personality expression and energy',
        'PRESERVE: Character recognition across all angles',
        'PRESERVE: Natural asymmetry and imperfections',
        'PRESERVE: Same person in different contexts',
        'PRESERVE: Core character essence unchanged'
      ],
      'brand-context': [
        'PRESERVE: Professional brand representation',
        'PRESERVE: Brand colors and visual elements',
        'PRESERVE: Professional context and setting',
        'PRESERVE: Brand-appropriate expression and pose',
        'PRESERVE: Consistent brand messaging through character',
        'PRESERVE: Professional quality and presentation'
      ],
      'cross-platform': [
        'PRESERVE: Character consistency across platforms',
        'PRESERVE: Same person for TikTok, Instagram, YouTube',
        'PRESERVE: Platform-appropriate but consistent identity',
        'PRESERVE: Format variations while maintaining character',
        'PRESERVE: Aspect ratio changes without identity loss',
        'PRESERVE: Platform optimization with character integrity'
      ]
    };

    return `
${basePrompt}

ZHO PRESERVATION PATTERN (${preservationType.toUpperCase().replace('-', ' ')}):
${preservationPatterns[preservationType].join('\n')}

CHARACTER IDENTITY LOCK (${identity.name}):
- Face: ${identity.coreFeatures.faceShape} with ${identity.coreFeatures.skinTone}
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}
- Features: ${identity.coreFeatures.noseShape} nose, ${identity.coreFeatures.lipShape} lips
- Structure: ${identity.coreFeatures.jawline}, ${identity.coreFeatures.cheekbones}
- Expression: ${identity.personalityTraits.defaultExpression}

CRITICAL PRESERVATION REQUIREMENTS:
- Never change the character's face
- Maintain exact facial geometry and proportions
- Keep all distinctive marks and asymmetries
- Preserve character personality and energy
- Same person recognizable across all variations
    `.trim();
  }

  /**
   * Generate character preservation for style transformations
   */
  static preserveCharacterDuringStyleTransformation(
    basePrompt: string,
    identity: CharacterIdentity,
    transformationType: 'time-period' | 'artistic-style' | 'professional-context' | 'platform-format'
  ): string {
    const transformationGuidance = {
      'time-period': [
        'Transform setting and clothing to specified era',
        'PRESERVE: Exact facial features unchanged by era',
        'Add period-appropriate elements while maintaining identity',
        'Character remains the same person in different time'
      ],
      'artistic-style': [
        'Convert artistic style while preserving character identity',
        'PRESERVE: All facial features during style conversion',
        'Turn illustration/cartoon into realistic version',
        'Maintain character essence across style changes'
      ],
      'professional-context': [
        'Adapt to professional setting while preserving character',
        'PRESERVE: Personal identity within professional context',
        'Add business elements without changing facial features',
        'Maintain approachable personality in professional setting'
      ],
      'platform-format': [
        'Optimize for platform format while preserving character',
        'PRESERVE: Same person across different aspect ratios',
        'Adapt composition without changing facial features',
        'Maintain identity in vertical, horizontal, square formats'
      ]
    };

    return `
${basePrompt}

STYLE TRANSFORMATION WITH CHARACTER PRESERVATION:
${transformationGuidance[transformationType].join('\n')}

IDENTITY PRESERVATION DURING TRANSFORMATION:
PRESERVE: ${identity.name} - exact same person
PRESERVE: Face shape ${identity.coreFeatures.faceShape}
PRESERVE: ${identity.coreFeatures.eyeShape} eyes with ${identity.coreFeatures.eyeColor}
PRESERVE: ${identity.coreFeatures.noseShape} nose proportions
PRESERVE: ${identity.coreFeatures.lipShape} lips and smile
PRESERVE: ${identity.coreFeatures.jawline} and ${identity.coreFeatures.cheekbones}
PRESERVE: ${identity.coreFeatures.skinTone} complexion
PRESERVE: All distinctive marks and natural asymmetries
PRESERVE: ${identity.personalityTraits.defaultExpression}

TRANSFORMATION RULES:
- Change everything EXCEPT facial features
- Maintain character recognition through all changes
- Preserve personality and energy in new context
- Keep human authenticity and natural imperfections
    `.trim();
  }

  /**
   * Generate cross-perspective character preservation
   */
  static preserveCharacterAcrossPerspectives(
    basePrompt: string,
    identity: CharacterIdentity,
    targetAngle: 'frontal' | 'three-quarter' | 'profile' | 'high-angle' | 'low-angle' | 'close-up'
  ): string {
    const anglePreservation = {
      'frontal': [
        'Change camera angle to frontal perspective',
        'PRESERVE: Exact facial features and expression',
        'Show full face symmetry and all distinctive features',
        'Maintain same lighting and professional quality'
      ],
      'three-quarter': [
        'Change camera angle to 3/4 perspective',
        'PRESERVE: Same facial features from new angle',
        'Show depth and dimension while maintaining identity',
        'Far eye correctly foreshortened but same character'
      ],
      'profile': [
        'Change camera angle to profile perspective',
        'PRESERVE: Nose, jaw, and forehead profile match character',
        'Side view shows same person from different angle',
        'Maintain character recognition in profile'
      ],
      'high-angle': [
        'Change camera angle to high angle (looking down)',
        'PRESERVE: Character features visible from above',
        'Maintain facial proportions in high-angle view',
        'Same person recognizable from elevated perspective'
      ],
      'low-angle': [
        'Change camera angle to low angle (looking up)',
        'PRESERVE: Character features visible from below',
        'Show jawline and facial structure from low angle',
        'Same person recognizable from below perspective'
      ],
      'close-up': [
        'Change camera angle to close-up perspective',
        'PRESERVE: Facial details and skin texture',
        'Show character features in intimate detail',
        'Maintain identity in close facial shot'
      ]
    };

    return `
${basePrompt}

CROSS-PERSPECTIVE CHARACTER PRESERVATION:
${anglePreservation[targetAngle].join('\n')}

PRESERVE EXACT CHARACTER IDENTITY:
- Same ${identity.name} from ${targetAngle} angle
- Face: ${identity.coreFeatures.faceShape} unchanged
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}
- Nose: ${identity.coreFeatures.noseShape} from new angle
- Lips: ${identity.coreFeatures.lipShape} properly positioned
- Structure: ${identity.coreFeatures.jawline}, ${identity.coreFeatures.cheekbones}
- Expression: ${identity.personalityTraits.defaultExpression}

ANGLE-SPECIFIC CONSISTENCY:
- Maintain proper 3D facial geometry
- All distinctive marks visible from this angle
- Natural perspective without feature distortion
- Same person immediately recognizable
- Preserve character personality in new view
    `.trim();
  }

  /**
   * Generate brand integration with character preservation
   */
  static preserveCharacterWithBrandIntegration(
    basePrompt: string,
    identity: CharacterIdentity,
    brandElements: {
      colors: string[];
      logo?: string;
      context: string;
      messaging: string;
    }
  ): string {
    return `
${basePrompt}

BRAND INTEGRATION WITH CHARACTER PRESERVATION:
- Integrate brand elements while preserving ${identity.name} identity
- Brand colors: ${brandElements.colors ? brandElements.colors.join(', ') : 'Brand colors'}
- Professional context: ${brandElements.context}
- Brand messaging: ${brandElements.messaging}
${brandElements.logo ? `- Brand logo: ${brandElements.logo}` : ''}

PRESERVE EXACT CHARACTER IDENTITY:
PRESERVE: ${identity.name} - same person in brand context
PRESERVE: Face ${identity.coreFeatures.faceShape} with ${identity.coreFeatures.skinTone}
PRESERVE: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor} eyes
PRESERVE: ${identity.coreFeatures.noseShape} nose and ${identity.coreFeatures.lipShape} lips
PRESERVE: ${identity.coreFeatures.jawline} and ${identity.coreFeatures.cheekbones}
PRESERVE: All distinctive marks and natural features
PRESERVE: ${identity.personalityTraits.defaultExpression}

BRAND HARMONY RULES:
- Character personality aligns with brand values
- Professional presentation maintains character authenticity
- Brand colors complement character's natural features
- Context appropriate but character identity unchanged
- Trustworthy, professional energy through character
- Brand elements enhance rather than mask character
    `.trim();
  }

  /**
   * Apply universal character preservation pattern (ZHO technique)
   */
  static applyUniversalCharacterPreservation(
    basePrompt: string,
    identity: CharacterIdentity
  ): string {
    return `
preserve exact facial features and core expression
${basePrompt}

UNIVERSAL CHARACTER PRESERVATION:
- Works across all styles, angles, contexts, and platforms
- Maintains exact character identity through any transformation
- Preserves human authenticity and natural imperfections
- Keeps character recognition at 100% accuracy

PRESERVE IDENTITY MARKERS:
- Name: ${identity.name} (exact same person)
- Face: ${identity.coreFeatures.faceShape}
- Eyes: ${identity.coreFeatures.eyeShape} ${identity.coreFeatures.eyeColor}
- Features: ${identity.coreFeatures.noseShape}, ${identity.coreFeatures.lipShape}
- Structure: ${identity.coreFeatures.jawline}, ${identity.coreFeatures.cheekbones}
- Skin: ${identity.coreFeatures.skinTone} with natural variations
- Expression: ${identity.personalityTraits.defaultExpression}
- Energy: ${identity.personalityTraits.energyLevel}

DISTINCTIVE PRESERVATION:
${identity.distinctiveMarks.moles.map(mole => `- ${mole.size} mole ${mole.location}`).join('\n')}
${identity.distinctiveMarks.asymmetry.map(asym => `- ${asym.feature}: ${asym.variation}`).join('\n')}

NEVER CHANGE:
- Facial geometry or bone structure
- Eye shape, color, or positioning
- Nose proportions or angle
- Lip shape or natural texture
- Jawline definition or cheek structure
- Skin tone or natural complexion
- Character personality or energy
- Any distinctive marks or features
    `.trim();
  }

  /**
   * Create enhanced character preservation for viral content
   */
  static createViralContentPreservation(
    basePrompt: string,
    identity: CharacterIdentity,
    viralTechnique: 'figure-transformation' | 'multi-style-grid' | 'time-period-series' | 'platform-optimization'
  ): string {
    const viralPreservationPatterns = {
      'figure-transformation': [
        'PRESERVE: Character identity during figure/toy transformation',
        'Turn photo into character figure while keeping exact facial features',
        'Behind figure: branded box with character\'s image',
        'Character recognizable in both photo and figure form',
        'Maintain facial accuracy in 3D representation'
      ],
      'multi-style-grid': [
        'PRESERVE: Same character across all grid variations',
        'Create variations while maintaining core identity',
        '100% character recognition in every grid cell',
        'Different styles but identical facial features',
        'Consistent personality across all variations'
      ],
      'time-period-series': [
        'PRESERVE: Character through different historical periods',
        'Same person in 1950s, 1970s, 1990s, 2020s styling',
        'Era-appropriate but character identity unchanged',
        'Timeline showing same person across decades',
        'Historical accuracy without losing character features'
      ],
      'platform-optimization': [
        'PRESERVE: Character across TikTok, Instagram, YouTube',
        'Same person optimized for different platform formats',
        'Aspect ratio changes without identity loss',
        'Platform-specific but character-consistent presentation',
        'Cross-platform character recognition'
      ]
    };

    return `
${basePrompt}

VIRAL CONTENT CHARACTER PRESERVATION:
${viralPreservationPatterns[viralTechnique].join('\n')}

ABSOLUTE CHARACTER CONSISTENCY:
PRESERVE: ${identity.name} identity through viral transformation
PRESERVE: Face structure ${identity.coreFeatures.faceShape}
PRESERVE: Eyes ${identity.coreFeatures.eyeShape} with ${identity.coreFeatures.eyeColor}
PRESERVE: Nose ${identity.coreFeatures.noseShape} proportions
PRESERVE: Lips ${identity.coreFeatures.lipShape} and natural smile
PRESERVE: Jawline ${identity.coreFeatures.jawline}
PRESERVE: Cheekbones ${identity.coreFeatures.cheekbones}
PRESERVE: Skin ${identity.coreFeatures.skinTone} and texture
PRESERVE: Expression ${identity.personalityTraits.defaultExpression}

VIRAL SUCCESS FACTORS:
- Character instantly recognizable across all variations
- Maintains human authenticity for audience connection
- Professional quality with natural personality
- Consistent brand representation through character
- High engagement through character consistency
- Memorable character that builds recognition and trust
    `.trim();
  }
}

export const characterConsistencyEngine = new CharacterConsistencyEngine();