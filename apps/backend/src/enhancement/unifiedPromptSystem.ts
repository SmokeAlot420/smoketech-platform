// Unified Prompt System - Master Orchestrator
// Integrates all engines and techniques into a cohesive system

import { SkinRealismEngine, SkinRealismConfig } from './skinRealism';
import { CharacterConsistencyEngine, CharacterIdentity } from './characterConsistency';
import { PhotoRealismEngine, PhotoRealismConfig } from './photoRealism';
import { TransformationEngine } from './transformationEngine';
// import { ZHOTechniquesEngine } from './zhoTechniques';
import { MasterTechniqueLibrary, MasterTechnique } from './masterTechniqueLibrary';

export interface UnifiedConfig {
  // Character Configuration
  character?: {
    identity: CharacterIdentity;
    preserveIdentity: boolean;
    consistencyLevel: 'basic' | 'standard' | 'strict' | 'absolute';
  };

  // Visual Quality Configuration
  quality?: {
    skinRealism: SkinRealismConfig;
    photography: PhotoRealismConfig;
    resolution: '4K' | '8K' | 'ultra-high';
    professionalGrade: boolean;
  };

  // Brand Integration Configuration
  brand?: {
    colors: string[];
    logo?: string;
    context: string;
    messaging: string;
    professionalLevel: 'casual' | 'business' | 'luxury' | 'corporate';
  };

  // Viral Optimization Configuration
  viral?: {
    targetPlatform: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
    viralTechniques: number[]; // Technique IDs from master library
    engagementGoal: 'views' | 'shares' | 'saves' | 'comments' | 'brand-recognition';
    viralPotential: 'medium' | 'high' | 'viral-guaranteed';
  };

  // Advanced Configuration
  advanced?: {
    techniqueChain: string[]; // Chain transformation techniques
    customTechniques: MasterTechnique[];
    fallbackStrategy: 'graceful' | 'strict';
    optimizeFor: 'speed' | 'quality' | 'viral-potential';
  };
}

export interface GenerationResult {
  finalPrompt: string;
  techniquesApplied: string[];
  viralScore: number;
  qualityMetrics: {
    characterConsistency: number;
    skinRealism: number;
    photographyQuality: number;
    brandIntegration: number;
  };
  metadata: {
    promptLength: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    estimatedProcessingTime: string;
    recommendedIterations: number;
  };
}

export interface PromptPreset {
  name: string;
  description: string;
  config: UnifiedConfig;
  useCases: string[];
  viralPotential: number;
}

export class UnifiedPromptSystem {

  private skinEngine: SkinRealismEngine;
  private characterEngine: CharacterConsistencyEngine;
  // private photoEngine: PhotoRealismEngine;
  private transformEngine: TransformationEngine;
  // private zhoEngine: ZHOTechniquesEngine;
  private masterLibrary: MasterTechniqueLibrary;

  // Predefined configuration presets
  private presets: PromptPreset[] = [
    {
      name: 'Viral Figure Creation',
      description: 'Create viral collectible figure content (ZHO\'s most viral technique)',
      config: {
        character: {
          identity: CharacterConsistencyEngine.createSophiaIdentity(),
          preserveIdentity: true,
          consistencyLevel: 'absolute'
        },
        quality: {
          skinRealism: {
            age: 26,
            gender: 'female',
            ethnicity: 'Mixed heritage',
            skinTone: 'olive',
            imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
            overallIntensity: 'moderate'
          },
          photography: PhotoRealismEngine.createConfigPreset('commercial-brand'),
          resolution: '8K',
          professionalGrade: true
        },
        viral: {
          targetPlatform: 'cross-platform',
          viralTechniques: [2], // Figure transformation
          engagementGoal: 'shares',
          viralPotential: 'viral-guaranteed'
        }
      },
      useCases: ['viral content creation', 'collectible merchandise', 'brand mascot content'],
      viralPotential: 95
    },
    {
      name: 'Professional Brand Representative',
      description: 'Create professional brand spokesperson content',
      config: {
        character: {
          identity: CharacterConsistencyEngine.createSophiaIdentity(),
          preserveIdentity: true,
          consistencyLevel: 'strict'
        },
        quality: {
          skinRealism: {
            age: 30,
            gender: 'female',
            ethnicity: 'Mixed heritage',
            skinTone: 'olive',
            imperfectionTypes: ['pores', 'asymmetry'],
            overallIntensity: 'minimal'
          },
          photography: PhotoRealismEngine.createConfigPreset('business-headshot'),
          resolution: '4K',
          professionalGrade: true
        },
        brand: {
          colors: ['#0074c9', '#ffffff'],
          context: 'Professional insurance services',
          messaging: 'Trust, expertise, and value',
          professionalLevel: 'business'
        }
      },
      useCases: ['brand content', 'professional services', 'corporate communications'],
      viralPotential: 78
    },
    {
      name: 'Ultra-Realistic Character',
      description: 'Maximum realism with skin imperfections and professional photography',
      config: {
        character: {
          identity: CharacterConsistencyEngine.createSophiaIdentity(),
          preserveIdentity: true,
          consistencyLevel: 'standard'
        },
        quality: {
          skinRealism: {
            age: 25,
            gender: 'female',
            ethnicity: 'Mixed heritage',
            skinTone: 'olive',
            imperfectionTypes: ['freckles', 'pores', 'wrinkles', 'moles', 'asymmetry'],
            overallIntensity: 'high'
          },
          photography: PhotoRealismEngine.createConfigPreset('editorial-portrait'),
          resolution: '8K',
          professionalGrade: true
        },
        viral: {
          targetPlatform: 'instagram',
          viralTechniques: [1, 3], // Universal realism + Professional photography upgrade
          engagementGoal: 'saves',
          viralPotential: 'high'
        }
      },
      useCases: ['realistic character creation', 'human-centered content', 'authenticity-focused brands'],
      viralPotential: 85
    },
    {
      name: 'Cross-Platform Viral Series',
      description: 'Character content optimized for viral distribution across platforms',
      config: {
        character: {
          identity: CharacterConsistencyEngine.createSophiaIdentity(),
          preserveIdentity: true,
          consistencyLevel: 'absolute'
        },
        quality: {
          skinRealism: {
            age: 26,
            gender: 'female',
            ethnicity: 'Mixed heritage',
            skinTone: 'olive',
            imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
            overallIntensity: 'moderate'
          },
          photography: PhotoRealismEngine.createConfigPreset('lifestyle-authentic'),
          resolution: '4K',
          professionalGrade: true
        },
        viral: {
          targetPlatform: 'cross-platform',
          viralTechniques: [1, 2, 3], // Universal realism + Figure transformation + Professional photography
          engagementGoal: 'brand-recognition',
          viralPotential: 'viral-guaranteed'
        }
      },
      useCases: ['viral series content', 'multi-platform campaigns', 'trend-following content'],
      viralPotential: 92
    }
  ];

  constructor() {
    this.skinEngine = new SkinRealismEngine();
    this.characterEngine = new CharacterConsistencyEngine();
    // this.photoEngine = new PhotoRealismEngine();
    this.transformEngine = new TransformationEngine();
    // this.zhoEngine = new ZHOTechniquesEngine();
    this.masterLibrary = new MasterTechniqueLibrary();
  }

  /**
   * Generate enhanced prompt with unified system
   */
  generateEnhancedPrompt(
    basePrompt: string,
    config: UnifiedConfig
  ): GenerationResult {
    console.log('🎯 Generating enhanced prompt with unified system...');

    let workingPrompt = basePrompt;
    const appliedTechniques: string[] = [];
    let viralScore = 0;
    const qualityMetrics = {
      characterConsistency: 0,
      skinRealism: 0,
      photographyQuality: 0,
      brandIntegration: 0
    };

    // Step 1: Apply Character Consistency
    if (config.character) {
      console.log('👤 Applying character consistency...');

      const anchors = this.characterEngine.generateConsistencyAnchors(config.character.identity);

      if (config.character.consistencyLevel === 'absolute') {
        workingPrompt = CharacterConsistencyEngine.applyZHOPreservationPattern(
          workingPrompt,
          config.character.identity,
          'full-identity'
        );
        qualityMetrics.characterConsistency = 100;
      } else {
        workingPrompt = this.characterEngine.buildConsistencyPrompt(
          workingPrompt,
          config.character.identity,
          'frontal',
          anchors
        );
        qualityMetrics.characterConsistency = 85;
      }

      appliedTechniques.push('Character Consistency');
      viralScore += 15;
    }

    // Step 2: Apply Skin Realism
    if (config.quality?.skinRealism) {
      console.log('🎨 Applying skin realism enhancements...');

      const skinDetails = this.skinEngine.generateSkinRealism(config.quality.skinRealism);
      workingPrompt = SkinRealismEngine.enhancePromptWithRealism(workingPrompt, skinDetails);

      appliedTechniques.push('Skin Realism');
      qualityMetrics.skinRealism = 90;
      viralScore += 10;
    }

    // Step 3: Apply Professional Photography
    if (config.quality?.photography) {
      console.log('📸 Applying professional photography enhancement...');

      workingPrompt = PhotoRealismEngine.enhanceWithProfessionalPhotography(
        workingPrompt,
        config.quality.photography
      );

      appliedTechniques.push('Professional Photography');
      qualityMetrics.photographyQuality = 95;
      viralScore += 20;
    }

    // Step 4: Apply Brand Integration
    if (config.brand) {
      console.log('🏢 Applying brand integration...');

      if (config.character) {
        workingPrompt = CharacterConsistencyEngine.preserveCharacterWithBrandIntegration(
          workingPrompt,
          config.character.identity,
          {
            colors: config.brand.colors,
            logo: config.brand.logo,
            context: config.brand.context,
            messaging: config.brand.messaging
          }
        );
      }

      appliedTechniques.push('Brand Integration');
      qualityMetrics.brandIntegration = 88;
      viralScore += 15;
    }

    // Step 5: Apply Viral Techniques
    if (config.viral?.viralTechniques) {
      console.log('🚀 Applying viral techniques...');

      config.viral.viralTechniques.forEach(techniqueId => {
        const technique = this.masterLibrary.getTechnique(techniqueId);
        if (technique) {
          workingPrompt += `\n\n${technique.name.toUpperCase()}:\n${technique.prompt}`;
          appliedTechniques.push(technique.name);

          const viralBoost = {
            'viral-guaranteed': 25,
            'high': 20,
            'medium': 10,
            'low': 5
          };
          viralScore += viralBoost[technique.viralPotential];
        }
      });
    }

    // Step 6: Apply Transformation Chain (if specified)
    if (config.advanced?.techniqueChain) {
      console.log('🔗 Applying transformation chain...');

      config.advanced.techniqueChain.forEach(chainName => {
        const chainResults = this.transformEngine.executeTransformationChain(chainName, {
          basePrompt: workingPrompt,
          characterIdentity: config.character?.identity,
          brandElements: config.brand,
          targetPlatform: config.viral?.targetPlatform
        });

        if (chainResults.length > 0) {
          workingPrompt = chainResults[chainResults.length - 1]; // Use final result
          appliedTechniques.push(`Chain: ${chainName}`);
          viralScore += 15;
        }
      });
    }

    // Calculate complexity
    const complexity = this.calculateComplexity(appliedTechniques.length, viralScore);

    // Generate metadata
    const metadata = {
      promptLength: workingPrompt.length,
      complexity,
      estimatedProcessingTime: this.estimateProcessingTime(complexity),
      recommendedIterations: this.getRecommendedIterations(viralScore)
    };

    console.log(`✅ Enhanced prompt generated with ${appliedTechniques.length} techniques (Viral Score: ${viralScore})`);

    return {
      finalPrompt: workingPrompt,
      techniquesApplied: appliedTechniques,
      viralScore: Math.min(viralScore, 100),
      qualityMetrics,
      metadata
    };
  }

  /**
   * Generate prompt using preset configuration
   */
  generateFromPreset(
    basePrompt: string,
    presetName: string,
    customizations?: Partial<UnifiedConfig>
  ): GenerationResult {
    console.log(`🎯 Generating from preset: ${presetName}`);

    const preset = this.presets.find(p => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    // Merge preset config with customizations
    const finalConfig = this.mergeConfigs(preset.config, customizations || {});

    return this.generateEnhancedPrompt(basePrompt, finalConfig);
  }

  /**
   * Quick viral content generation
   */
  generateViralContent(
    basePrompt: string,
    character: CharacterIdentity,
    viralTechnique: 'figure-transformation' | 'multi-style-grid' | 'time-period-series' | 'universal-realism' = 'figure-transformation'
  ): GenerationResult {
    console.log(`🚀 Generating viral content: ${viralTechnique}`);

    const techniqueMap = {
      'figure-transformation': [2], // Image-to-Figure Transformation
      'multi-style-grid': [5], // Material overlay effects
      'time-period-series': [3], // Professional photography upgrade
      'universal-realism': [1] // Universal Style-to-Realism
    };

    const config: UnifiedConfig = {
      character: {
        identity: character,
        preserveIdentity: true,
        consistencyLevel: 'absolute'
      },
      quality: {
        skinRealism: {
          age: 26,
          gender: 'female',
          ethnicity: 'Mixed heritage',
          skinTone: 'olive',
          imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
          overallIntensity: 'moderate'
        },
        photography: PhotoRealismEngine.createConfigPreset('commercial-brand'),
        resolution: '8K',
        professionalGrade: true
      },
      viral: {
        targetPlatform: 'cross-platform',
        viralTechniques: techniqueMap[viralTechnique],
        engagementGoal: 'shares',
        viralPotential: 'viral-guaranteed'
      }
    };

    return this.generateEnhancedPrompt(basePrompt, config);
  }

  /**
   * Professional brand content generation
   */
  generateProfessionalBrandContent(
    basePrompt: string,
    character: CharacterIdentity,
    brandElements: {
      colors: string[];
      logo?: string;
      context: string;
      messaging: string;
    }
  ): GenerationResult {
    console.log('🏢 Generating professional brand content...');

    const config: UnifiedConfig = {
      character: {
        identity: character,
        preserveIdentity: true,
        consistencyLevel: 'strict'
      },
      quality: {
        skinRealism: {
          age: character.coreFeatures.faceShape.includes('young') ? 25 : 30,
          gender: 'female',
          ethnicity: 'Mixed heritage',
          skinTone: 'olive',
          imperfectionTypes: ['pores', 'asymmetry'],
          overallIntensity: 'minimal'
        },
        photography: PhotoRealismEngine.createConfigPreset('business-headshot'),
        resolution: '4K',
        professionalGrade: true
      },
      brand: {
        ...brandElements,
        professionalLevel: 'business'
      }
    };

    return this.generateEnhancedPrompt(basePrompt, config);
  }

  /**
   * Get available presets
   */
  getAvailablePresets(): PromptPreset[] {
    return this.presets;
  }

  /**
   * Get preset by name
   */
  getPreset(name: string): PromptPreset | null {
    return this.presets.find(p => p.name === name) || null;
  }

  /**
   * Recommend techniques for use case
   */
  recommendTechniquesForUseCase(useCase: string): MasterTechnique[] {
    return this.masterLibrary.recommendTechniques(useCase, 5);
  }

  /**
   * Get random viral technique
   */
  getRandomViralTechnique(): MasterTechnique {
    return this.masterLibrary.getRandomViralTechnique();
  }

  /**
   * Validate configuration
   */
  validateConfiguration(config: UnifiedConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.character?.preserveIdentity && !config.character.identity) {
      errors.push('Character identity required when preserveIdentity is true');
    }

    if (config.viral?.viralTechniques) {
      config.viral.viralTechniques.forEach(id => {
        if (!this.masterLibrary.getTechnique(id)) {
          errors.push(`Invalid technique ID: ${id}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate complexity based on techniques and viral score
   */
  private calculateComplexity(techniqueCount: number, viralScore: number): 'simple' | 'moderate' | 'complex' | 'expert' {
    if (techniqueCount <= 2 && viralScore <= 50) return 'simple';
    if (techniqueCount <= 4 && viralScore <= 75) return 'moderate';
    if (techniqueCount <= 6 && viralScore <= 90) return 'complex';
    return 'expert';
  }

  /**
   * Estimate processing time based on complexity
   */
  private estimateProcessingTime(complexity: 'simple' | 'moderate' | 'complex' | 'expert'): string {
    const times = {
      simple: '30-60 seconds',
      moderate: '1-2 minutes',
      complex: '2-5 minutes',
      expert: '5-10 minutes'
    };
    return times[complexity];
  }

  /**
   * Get recommended iterations based on viral score
   */
  private getRecommendedIterations(viralScore: number): number {
    if (viralScore >= 90) return 1; // High viral potential, fewer iterations needed
    if (viralScore >= 70) return 2;
    if (viralScore >= 50) return 3;
    return 5; // Lower viral potential, more iterations for optimization
  }

  /**
   * Merge configuration objects
   */
  private mergeConfigs(baseConfig: UnifiedConfig, customConfig: Partial<UnifiedConfig>): UnifiedConfig {
    return {
      character: {
        identity: {
          name: '',
          age: 0,
          ethnicity: '',
          personality: '',
          appearance: {},
          coreFeatures: {
            faceShape: '',
            eyeShape: '',
            eyeColor: '',
            eyebrowShape: '',
            noseShape: '',
            lipShape: '',
            jawline: '',
            cheekbones: '',
            skinTone: '',
            hairColor: '',
            hairTexture: ''
          },
          distinctiveMarks: {
            moles: [],
            freckles: { pattern: '', density: '', locations: [] },
            scars: [],
            asymmetry: []
          },
          personalityTraits: {
            defaultExpression: '',
            eyeExpression: '',
            smileType: '',
            energyLevel: ''
          }
        } as CharacterIdentity,
        preserveIdentity: true,
        consistencyLevel: 'standard',
        ...baseConfig.character,
        ...customConfig.character
      },
      quality: {
        skinRealism: {
          intensity: 'moderate',
          types: [],
          locations: [],
          age: 25,
          gender: 'female',
          ethnicity: 'mixed',
          skinTone: 'medium',
          imperfectionTypes: [],
          realismLevel: 'professional',
          overallIntensity: 'moderate'
        } as SkinRealismConfig,
        photography: {
          photographyStyle: 'portrait',
          qualityLevel: '4K',
          lightingSetup: 'natural',
          cameraAngle: 'eye-level',
          postProcessing: 'professional',
          colorGrading: 'natural'
        } as PhotoRealismConfig,
        resolution: '4K',
        professionalGrade: true,
        ...baseConfig.quality,
        ...customConfig.quality
      },
      brand: {
        colors: [],
        context: '',
        messaging: '',
        professionalLevel: 'business',
        ...baseConfig.brand,
        ...customConfig.brand
      },
      viral: {
        targetPlatform: 'tiktok',
        viralTechniques: [],
        engagementGoal: 'views',
        viralPotential: 'high',
        ...baseConfig.viral,
        ...customConfig.viral
      },
      advanced: {
        techniqueChain: [],
        customTechniques: [],
        fallbackStrategy: 'graceful',
        optimizeFor: 'quality',
        ...baseConfig.advanced,
        ...customConfig.advanced
      }
    };
  }
}

export const unifiedPromptSystem = new UnifiedPromptSystem();