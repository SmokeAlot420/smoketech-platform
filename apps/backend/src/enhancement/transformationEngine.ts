// Multi-Step Transformation Engine
// Handles complex multi-step effects and transformation chains

import { CharacterIdentity } from './characterConsistency';
import { EnhancedSkinDetails } from './skinRealism';
import { PhotoRealismConfig } from './photoRealism';

export interface TransformationStep {
  id: string;
  name: string;
  type: 'style-transform' | 'material-overlay' | 'perspective-change' | 'quality-enhancement' |
        'character-preservation' | 'viral-technique' | 'brand-integration' | 'platform-optimization';
  prompt: string;
  parameters?: Record<string, any>;
  preserveCharacter: boolean;
  viralPotential: 'low' | 'medium' | 'high' | 'viral-guaranteed';
}

export interface TransformationChain {
  name: string;
  description: string;
  steps: TransformationStep[];
  expectedOutcome: string;
  viralScore: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}

export interface TransformationParameters {
  basePrompt: string;
  characterIdentity?: CharacterIdentity;
  skinDetails?: EnhancedSkinDetails;
  photoConfig?: PhotoRealismConfig;
  brandElements?: {
    colors: string[];
    logo?: string;
    context: string;
    messaging: string;
  };
  targetPlatform?: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
  viralGoal?: 'engagement' | 'recognition' | 'shares' | 'saves' | 'brand-awareness';
}

export class TransformationEngine {

  private viralTransformationChains: TransformationChain[] = [
    {
      name: 'Universal Style-to-Realism',
      description: 'Transform any artistic style to photorealistic human',
      steps: [
        {
          id: 'universal-realism',
          name: 'Universal Realism Transformation',
          type: 'style-transform',
          prompt: 'turn this illustration into realistic version',
          preserveCharacter: true,
          viralPotential: 'high'
        }
      ],
      expectedOutcome: 'Photorealistic human conversion from any artistic style',
      viralScore: 85,
      complexity: 'simple'
    },
    {
      name: 'Image-to-Figure Viral',
      description: 'Most viral ZHO technique - turns photo into character figure',
      steps: [
        {
          id: 'figure-transformation',
          name: 'Character Figure Creation',
          type: 'viral-technique',
          prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image on it, showing it\'s a collectible figure. The character should be standing on a round plastic base. The scene should be indoors with good lighting.',
          preserveCharacter: true,
          viralPotential: 'viral-guaranteed'
        }
      ],
      expectedOutcome: 'Character figure with branded box, guaranteed viral potential',
      viralScore: 95,
      complexity: 'moderate'
    },
    {
      name: 'Professional Brand Transformation',
      description: 'Transform character to professional brand representative',
      steps: [
        {
          id: 'character-preservation',
          name: 'Character Identity Lock',
          type: 'character-preservation',
          prompt: 'PRESERVE: Exact facial features and core expression',
          preserveCharacter: true,
          viralPotential: 'medium'
        },
        {
          id: 'professional-enhancement',
          name: 'Professional Photography Upgrade',
          type: 'quality-enhancement',
          prompt: 'Transform to professional photography quality with expert lighting and composition',
          preserveCharacter: true,
          viralPotential: 'high'
        },
        {
          id: 'brand-integration',
          name: 'Brand Context Integration',
          type: 'brand-integration',
          prompt: 'Integrate brand elements while maintaining character authenticity',
          preserveCharacter: true,
          viralPotential: 'high'
        }
      ],
      expectedOutcome: 'Professional brand representative with character consistency',
      viralScore: 78,
      complexity: 'complex'
    },
    {
      name: 'Time Period Transformation Series',
      description: 'Same character through different historical periods',
      steps: [
        {
          id: 'character-lock',
          name: 'Character Identity Preservation',
          type: 'character-preservation',
          prompt: 'PRESERVE: Character through different historical periods',
          preserveCharacter: true,
          viralPotential: 'medium'
        },
        {
          id: 'period-transformation',
          name: 'Historical Period Adaptation',
          type: 'style-transform',
          prompt: 'Transform to [PERIOD] era while preserving exact facial features',
          parameters: { period: '1950s|1970s|1990s|2020s' },
          preserveCharacter: true,
          viralPotential: 'high'
        }
      ],
      expectedOutcome: 'Character timeline across different eras',
      viralScore: 88,
      complexity: 'moderate'
    },
    {
      name: 'Multi-Style Grid Viral',
      description: 'Same character in 3x3 grid with different styles',
      steps: [
        {
          id: 'grid-preservation',
          name: 'Grid Character Consistency',
          type: 'character-preservation',
          prompt: 'PRESERVE: Same character across all grid variations',
          preserveCharacter: true,
          viralPotential: 'medium'
        },
        {
          id: 'style-variations',
          name: 'Style Variation Generation',
          type: 'viral-technique',
          prompt: 'Create 3x3 grid of same person with different hairstyles/styles',
          preserveCharacter: true,
          viralPotential: 'viral-guaranteed'
        }
      ],
      expectedOutcome: '3x3 grid with 100% character recognition across styles',
      viralScore: 92,
      complexity: 'complex'
    }
  ];

  private materialOverlayTransforms = {
    glass: {
      prompt: '为照片叠加上玻璃材质的效果\nApply glass material effects overlaid on the photo',
      effects: [
        'Glass-like transparency effects overlaid on skin',
        'Refraction patterns that follow facial contours',
        'Glass surface reflections on skin texture',
        'Realistic glass physics interaction with features'
      ]
    },
    metal: {
      prompt: '为照片叠加上金属材质的效果\nApply metal material effects overlaid on the photo',
      effects: [
        'Metallic sheen effects integrated with skin texture',
        'Chrome-like reflections following facial structure',
        'Metallic overlay that respects skin imperfections',
        'Realistic metal surface interaction with lighting'
      ]
    },
    fabric: {
      prompt: '为照片叠加上织物材质的效果\nApply fabric material effects overlaid on the photo',
      effects: [
        'Fabric texture patterns overlaid on skin surface',
        'Textile weave effects that follow skin contours',
        'Cloth-like texture integration with natural skin',
        'Realistic fabric physics and draping effects'
      ]
    },
    liquid: {
      prompt: '为照片叠加上液体材质的效果\nApply liquid material effects overlaid on the photo',
      effects: [
        'Liquid surface effects on skin texture',
        'Water-like reflections and ripple patterns',
        'Fluid dynamics effects on facial features',
        'Realistic liquid interaction with skin surface'
      ]
    },
    light: {
      prompt: '为照片叠加上光线材质的效果\nApply light material effects overlaid on the photo',
      effects: [
        'Light ray effects projected onto skin surface',
        'Luminous overlay patterns following skin texture',
        'Photonic effects integrated with natural skin',
        'Realistic light scattering and absorption effects'
      ]
    }
  };

  private platformOptimizations = {
    tiktok: {
      aspectRatio: '9:16',
      format: 'vertical',
      optimizations: [
        'Optimized for TikTok vertical format',
        'Character positioned for vertical viewing',
        'Mobile-first composition and framing',
        'TikTok-appropriate visual style and energy'
      ]
    },
    instagram: {
      aspectRatio: '1:1',
      format: 'square',
      optimizations: [
        'Optimized for Instagram square format',
        'Character centered for square composition',
        'Instagram-appropriate professional aesthetic',
        'Social media optimized visual presentation'
      ]
    },
    youtube: {
      aspectRatio: '16:9',
      format: 'horizontal',
      optimizations: [
        'Optimized for YouTube horizontal format',
        'Character positioned for widescreen viewing',
        'YouTube thumbnail and video appropriate',
        'Professional presentation for video platform'
      ]
    },
    'cross-platform': {
      aspectRatio: '4:5',
      format: 'universal',
      optimizations: [
        'Optimized for multi-platform distribution',
        'Character positioned for universal viewing',
        'Platform-agnostic professional composition',
        'Adaptable format for all social media platforms'
      ]
    }
  };

  /**
   * Execute a single transformation step
   */
  executeTransformationStep(
    step: TransformationStep,
    parameters: TransformationParameters
  ): string {
    console.log(`🔄 Executing transformation: ${step.name}`);

    let transformationPrompt = `${parameters.basePrompt}\n\n`;

    // Apply character preservation if required
    if (step.preserveCharacter && parameters.characterIdentity) {
      transformationPrompt += `PRESERVE CHARACTER IDENTITY:\n`;
      transformationPrompt += `- Same ${parameters.characterIdentity.name} - exact same person\n`;
      transformationPrompt += `- Face: ${parameters.characterIdentity.coreFeatures.faceShape}\n`;
      transformationPrompt += `- Eyes: ${parameters.characterIdentity.coreFeatures.eyeShape} ${parameters.characterIdentity.coreFeatures.eyeColor}\n`;
      transformationPrompt += `- Features: ${parameters.characterIdentity.coreFeatures.noseShape}, ${parameters.characterIdentity.coreFeatures.lipShape}\n`;
      transformationPrompt += `- Expression: ${parameters.characterIdentity.personalityTraits.defaultExpression}\n\n`;
    }

    // Apply step-specific transformation
    switch (step.type) {
      case 'style-transform':
        transformationPrompt += this.applyStyleTransformation(step, parameters);
        break;
      case 'material-overlay':
        transformationPrompt += this.applyMaterialOverlay(step, parameters);
        break;
      case 'perspective-change':
        transformationPrompt += this.applyPerspectiveChange(step, parameters);
        break;
      case 'quality-enhancement':
        transformationPrompt += this.applyQualityEnhancement(step, parameters);
        break;
      case 'viral-technique':
        transformationPrompt += this.applyViralTechnique(step, parameters);
        break;
      case 'brand-integration':
        transformationPrompt += this.applyBrandIntegration(step, parameters);
        break;
      case 'platform-optimization':
        transformationPrompt += this.applyPlatformOptimization(step, parameters);
        break;
    }

    console.log(`✅ Transformation step completed: ${step.name}`);
    return transformationPrompt;
  }

  /**
   * Execute a full transformation chain
   */
  executeTransformationChain(
    chainName: string,
    parameters: TransformationParameters
  ): string[] {
    console.log(`🔗 Executing transformation chain: ${chainName}`);

    const chain = this.viralTransformationChains.find(c => c.name === chainName);
    if (!chain) {
      throw new Error(`Transformation chain "${chainName}" not found`);
    }

    const results: string[] = [];
    let currentPrompt = parameters.basePrompt;

    for (const step of chain.steps) {
      const stepParameters = { ...parameters, basePrompt: currentPrompt };
      const transformedPrompt = this.executeTransformationStep(step, stepParameters);
      results.push(transformedPrompt);
      currentPrompt = transformedPrompt; // Chain the results
    }

    console.log(`✅ Transformation chain completed: ${chainName} (${results.length} steps)`);
    return results;
  }

  /**
   * Apply style transformation
   */
  private applyStyleTransformation(
    step: TransformationStep,
    _parameters: TransformationParameters
  ): string {
    let prompt = `STYLE TRANSFORMATION:\n${step.prompt}\n\n`;

    if (step.parameters?.period) {
      const periods = step.parameters.period.split('|');
      const selectedPeriod = periods[0]; // For now, use first period
      prompt += `PERIOD TRANSFORMATION:\n`;
      prompt += `- Transform to ${selectedPeriod} styling and aesthetics\n`;
      prompt += `- Period-appropriate clothing and setting\n`;
      prompt += `- Historical accuracy in styling details\n`;
      prompt += `- Era-appropriate photography style\n\n`;
    }

    return prompt;
  }

  /**
   * Apply material overlay
   */
  private applyMaterialOverlay(
    step: TransformationStep,
    _parameters: TransformationParameters
  ): string {
    const materialType = step.parameters?.materialType || 'glass';
    const material = this.materialOverlayTransforms[materialType as keyof typeof this.materialOverlayTransforms];

    return `MATERIAL OVERLAY TRANSFORMATION:\n${material.prompt}\n\nMATERIAL EFFECTS:\n${material.effects.join('\n')}\n\n`;
  }

  /**
   * Apply perspective change
   */
  private applyPerspectiveChange(
    step: TransformationStep,
    _parameters: TransformationParameters
  ): string {
    const angle = step.parameters?.angle || 'frontal';
    return `PERSPECTIVE CHANGE:\n- Change camera angle to ${angle} perspective\n- Maintain character identity from new viewpoint\n- Professional composition from new angle\n\n`;
  }

  /**
   * Apply quality enhancement
   */
  private applyQualityEnhancement(
    step: TransformationStep,
    _parameters: TransformationParameters
  ): string {
    return `QUALITY ENHANCEMENT:\n${step.prompt}\n- Professional photography standards\n- Ultra-high resolution quality\n- Expert technical execution\n- Commercial-grade output\n\n`;
  }

  /**
   * Apply viral technique
   */
  private applyViralTechnique(
    step: TransformationStep,
    _parameters: TransformationParameters
  ): string {
    let prompt = `VIRAL TECHNIQUE APPLICATION:\n${step.prompt}\n\n`;

    if (step.id === 'figure-transformation') {
      prompt += `FIGURE TRANSFORMATION SPECIFICS:\n`;
      prompt += `- Character figure with branded packaging box\n`;
      prompt += `- Round plastic base for stability\n`;
      prompt += `- Professional product photography setup\n`;
      prompt += `- Indoor lighting optimized for figure photography\n`;
      prompt += `- Collectible figure aesthetic and quality\n\n`;
    }

    if (step.id === 'style-variations') {
      prompt += `MULTI-STYLE GRID SPECIFICS:\n`;
      prompt += `- 3x3 grid layout with consistent spacing\n`;
      prompt += `- Different hairstyle in each grid cell\n`;
      prompt += `- Same facial features across all variations\n`;
      prompt += `- Professional grid composition and alignment\n`;
      prompt += `- High engagement potential through variety\n\n`;
    }

    return prompt;
  }

  /**
   * Apply brand integration
   */
  private applyBrandIntegration(
    step: TransformationStep,
    parameters: TransformationParameters
  ): string {
    if (!parameters.brandElements) {
      return `BRAND INTEGRATION:\n${step.prompt}\n\n`;
    }

    const brand = parameters.brandElements;
    return `BRAND INTEGRATION:\n${step.prompt}\n\nBRAND ELEMENTS:\n- Colors: ${brand.colors.join(', ')}\n- Context: ${brand.context}\n- Messaging: ${brand.messaging}\n${brand.logo ? `- Logo: ${brand.logo}\n` : ''}\n`;
  }

  /**
   * Apply platform optimization
   */
  private applyPlatformOptimization(
    step: TransformationStep,
    parameters: TransformationParameters
  ): string {
    if (!parameters.targetPlatform) {
      return `PLATFORM OPTIMIZATION:\n${step.prompt}\n\n`;
    }

    const platform = this.platformOptimizations[parameters.targetPlatform as keyof typeof this.platformOptimizations];
    return `PLATFORM OPTIMIZATION (${parameters.targetPlatform.toUpperCase()}):\n- Aspect ratio: ${platform.aspectRatio}\n- Format: ${platform.format}\n\nOPTIMIZATIONS:\n${platform.optimizations.join('\n')}\n\n`;
  }

  /**
   * Create custom transformation chain
   */
  createCustomTransformationChain(
    name: string,
    steps: TransformationStep[],
    description?: string
  ): TransformationChain {
    const viralScore = steps.reduce((score, step) => {
      const potentialScores = { low: 20, medium: 50, high: 75, 'viral-guaranteed': 95 };
      return score + potentialScores[step.viralPotential];
    }, 0) / steps.length;

    const complexity = steps.length <= 2 ? 'simple' : steps.length <= 4 ? 'moderate' : 'complex';

    return {
      name,
      description: description || `Custom transformation chain with ${steps.length} steps`,
      steps,
      expectedOutcome: `Custom transformation result with ${steps.length} sequential effects`,
      viralScore,
      complexity
    };
  }

  /**
   * Get available transformation chains
   */
  getAvailableChains(): string[] {
    return this.viralTransformationChains.map(chain => chain.name);
  }

  /**
   * Get transformation chain details
   */
  getChainDetails(chainName: string): TransformationChain | null {
    return this.viralTransformationChains.find(chain => chain.name === chainName) || null;
  }

  /**
   * Apply universal realism transformation (most used ZHO technique)
   */
  static applyUniversalRealism(
    basePrompt: string,
    preserveCharacter: boolean = true,
    characterIdentity?: CharacterIdentity
  ): string {
    let prompt = `turn this illustration into realistic version\n\n${basePrompt}\n\n`;

    if (preserveCharacter && characterIdentity) {
      prompt += `CHARACTER PRESERVATION:\n`;
      prompt += `PRESERVE: ${characterIdentity.name} - exact same person\n`;
      prompt += `PRESERVE: Face shape ${characterIdentity.coreFeatures.faceShape}\n`;
      prompt += `PRESERVE: Eyes ${characterIdentity.coreFeatures.eyeShape} ${characterIdentity.coreFeatures.eyeColor}\n`;
      prompt += `PRESERVE: All distinctive features and expressions\n\n`;
    }

    prompt += `REALISM TRANSFORMATION:\n`;
    prompt += `- Convert any artistic style to photorealistic human\n`;
    prompt += `- Professional photography quality output\n`;
    prompt += `- Natural skin texture and imperfections\n`;
    prompt += `- Realistic lighting and subsurface scattering\n`;
    prompt += `- Ultra-photorealistic 8K resolution\n`;

    return prompt;
  }

  /**
   * Apply viral figure transformation (highest viral potential)
   */
  static applyViralFigureTransformation(
    basePrompt: string,
    characterIdentity?: CharacterIdentity,
    brandElements?: { colors: string[]; logo?: string }
  ): string {
    let prompt = `turn this photo into a character figure. Behind it, place a box with the character's image on it, showing it's a collectible figure. The character should be standing on a round plastic base. The scene should be indoors with good lighting.\n\n`;

    prompt += `${basePrompt}\n\n`;

    if (characterIdentity) {
      prompt += `CHARACTER FIGURE ACCURACY:\n`;
      prompt += `PRESERVE: ${characterIdentity.name} facial features in figure form\n`;
      prompt += `- Figure maintains exact character identity\n`;
      prompt += `- All distinctive features visible on figure\n`;
      prompt += `- Character personality visible in figure pose\n\n`;
    }

    prompt += `FIGURE SPECIFICATIONS:\n`;
    prompt += `- High-quality collectible figure aesthetic\n`;
    prompt += `- Professional product photography setup\n`;
    prompt += `- Branded packaging box with character image\n`;
    prompt += `- Round plastic base for authenticity\n`;
    prompt += `- Indoor professional lighting for figure display\n`;

    if (brandElements) {
      prompt += `\nBRAND INTEGRATION:\n`;
      prompt += `- Brand colors: ${brandElements.colors.join(', ')}\n`;
      if (brandElements.logo) {
        prompt += `- Brand logo on packaging: ${brandElements.logo}\n`;
      }
    }

    return prompt;
  }
}

export const transformationEngine = new TransformationEngine();