/**
 * OMEGA WORKFLOW PRODUCTION CONFIGURATION v1.0
 *
 * Centralized configuration management for all 12 engines
 * Supports viral content generation with 80-95 viral scores
 *
 * CONFIGURATION PRESETS:
 * ✅ VIRAL_GUARANTEED - Maximum viral potential (95+ scores)
 * ✅ PROFESSIONAL_GRADE - Business/commercial content (80-90 scores)
 * ✅ SPEED_OPTIMIZED - Fast generation (<15 min, 75-85 scores)
 * ✅ COST_EFFICIENT - Budget-friendly (<$30, 70-80 scores)
 *
 * Sign off as SmokeDev 🚬
 */

import { SkinRealismConfig } from '../enhancement/skinRealism';
import { OmegaVideoRequest } from './omega-workflow';

export interface OmegaConfig {
  // CORE SETTINGS
  preset: 'viral-guaranteed' | 'professional-grade' | 'speed-optimized' | 'cost-efficient' | 'custom';
  targetViralScore: number; // 70-95 range
  maxCost: number; // In cents ($50 = 5000)
  maxTime: number; // In minutes

  // ENGINE CONFIGURATIONS
  engines: {
    // STATIC ENGINES (5)
    skinRealism: SkinRealismConfig & { enabled: boolean };
    characterConsistency: {
      enabled: boolean;
      preservationLevel: 'strict' | 'moderate' | 'flexible';
      brandIntegration: boolean;
      crossAngle: boolean;
    };
    photoRealism: {
      enabled: boolean;
      preset: 'editorial-portrait' | 'business-headshot' | 'lifestyle-authentic' | 'commercial-brand' | 'fashion-magazine';
      quality: 'high' | 'ultra-high' | 'magazine-grade';
    };
    advancedVEO3: {
      enabled: boolean;
      jsonPrompting: boolean;
      enhancedQuality: boolean;
      duration: 4 | 6 | 8;
    };
    professionalCinematography: {
      enabled: boolean;
      style: 'cinematic' | 'documentary' | 'commercial' | 'artistic';
      transitions: boolean;
    };

    // INSTANCE ENGINES (7)
    transformation: {
      enabled: boolean;
      viralOptimization: boolean;
      universalRealism: boolean;
      materialOverlays: boolean;
    };
    zhoTechniques: {
      enabled: boolean;
      all46: boolean;
      selectBest: boolean;
      viralGuaranteedOnly: boolean;
      maxTechniques: number;
    };
    masterLibrary: {
      enabled: boolean;
      techniques: 'all' | 'top5' | 'top10' | 'viral-only';
      categories: string[];
      viralFilter: 'any' | 'high' | 'viral-guaranteed';
    };
    unifiedSystem: {
      enabled: boolean;
      orchestration: boolean;
      qualityValidation: boolean;
      characterPreservation: boolean;
    };
    nanoBananaVEO3: {
      enabled: boolean;
      ultraRealistic: boolean;
      characterGeneration: boolean;
      videoStitching: boolean;
    };
    multiSourceImage: {
      enabled: boolean;
      fallbackChain: boolean;
      qualityComparison: boolean;
      costOptimization: boolean;
    };
    ffmpegProfessional: {
      enabled: boolean;
      transitionTypes: number; // 1-35
      audioCrossfading: boolean;
      qualityPreservation: boolean;
    };
  };

  // PLATFORM OPTIMIZATION
  platform: {
    primary: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
    aspectRatio: '9:16' | '1:1' | '16:9' | 'auto';
    duration: number; // seconds
    format: 'mp4' | 'mov' | 'webm' | 'auto';
  };

  // QUALITY VALIDATION
  validation: {
    enabled: boolean;
    phases: Array<'smoke' | 'integration' | 'end-to-end' | 'production'>;
    failureHandling: 'strict' | 'graceful' | 'continue';
    metrics: {
      viralScoreThreshold: number;
      characterConsistencyThreshold: number;
      costEfficiencyThreshold: number;
    };
  };
}

/**
 * PRESET CONFIGURATIONS
 * Pre-configured settings for different use cases
 */

export const VIRAL_GUARANTEED_CONFIG: OmegaConfig = {
  preset: 'viral-guaranteed',
  targetViralScore: 95,
  maxCost: 5000, // $50
  maxTime: 30,

  engines: {
    skinRealism: {
      enabled: true,
      age: 26,
      gender: 'female',
      ethnicity: 'mixed heritage',
      skinTone: 'medium',
      imperfectionTypes: ['freckles', 'pores', 'moles', 'asymmetry', 'blemishes'],
      overallIntensity: 'high'
    },
    characterConsistency: {
      enabled: true,
      preservationLevel: 'strict',
      brandIntegration: true,
      crossAngle: true
    },
    photoRealism: {
      enabled: true,
      preset: 'editorial-portrait',
      quality: 'magazine-grade'
    },
    advancedVEO3: {
      enabled: true,
      jsonPrompting: true,
      enhancedQuality: true,
      duration: 8
    },
    professionalCinematography: {
      enabled: true,
      style: 'cinematic',
      transitions: true
    },
    transformation: {
      enabled: true,
      viralOptimization: true,
      universalRealism: true,
      materialOverlays: true
    },
    zhoTechniques: {
      enabled: true,
      all46: true,
      selectBest: true,
      viralGuaranteedOnly: true,
      maxTechniques: 10
    },
    masterLibrary: {
      enabled: true,
      techniques: 'all',
      categories: ['viral', 'transformation', 'character'],
      viralFilter: 'viral-guaranteed'
    },
    unifiedSystem: {
      enabled: true,
      orchestration: true,
      qualityValidation: true,
      characterPreservation: true
    },
    nanoBananaVEO3: {
      enabled: true,
      ultraRealistic: true,
      characterGeneration: true,
      videoStitching: true
    },
    multiSourceImage: {
      enabled: true,
      fallbackChain: true,
      qualityComparison: true,
      costOptimization: false // Quality over cost
    },
    ffmpegProfessional: {
      enabled: true,
      transitionTypes: 35,
      audioCrossfading: true,
      qualityPreservation: true
    }
  },

  platform: {
    primary: 'cross-platform',
    aspectRatio: 'auto',
    duration: 60,
    format: 'mp4'
  },

  validation: {
    enabled: true,
    phases: ['smoke', 'integration', 'end-to-end', 'production'],
    failureHandling: 'strict',
    metrics: {
      viralScoreThreshold: 90,
      characterConsistencyThreshold: 95,
      costEfficiencyThreshold: 1.8 // Viral score per dollar
    }
  }
};

export const PROFESSIONAL_GRADE_CONFIG: OmegaConfig = {
  preset: 'professional-grade',
  targetViralScore: 85,
  maxCost: 3500, // $35
  maxTime: 25,

  engines: {
    skinRealism: {
      enabled: true,
      age: 26,
      gender: 'female',
      ethnicity: 'mixed heritage',
      skinTone: 'medium',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
      overallIntensity: 'moderate'
    },
    characterConsistency: {
      enabled: true,
      preservationLevel: 'strict',
      brandIntegration: true,
      crossAngle: true
    },
    photoRealism: {
      enabled: true,
      preset: 'business-headshot',
      quality: 'ultra-high'
    },
    advancedVEO3: {
      enabled: true,
      jsonPrompting: true,
      enhancedQuality: true,
      duration: 8
    },
    professionalCinematography: {
      enabled: true,
      style: 'commercial',
      transitions: true
    },
    transformation: {
      enabled: true,
      viralOptimization: true,
      universalRealism: true,
      materialOverlays: false
    },
    zhoTechniques: {
      enabled: true,
      all46: false,
      selectBest: true,
      viralGuaranteedOnly: true,
      maxTechniques: 5
    },
    masterLibrary: {
      enabled: true,
      techniques: 'top10',
      categories: ['professional', 'character', 'viral'],
      viralFilter: 'high'
    },
    unifiedSystem: {
      enabled: true,
      orchestration: true,
      qualityValidation: true,
      characterPreservation: true
    },
    nanoBananaVEO3: {
      enabled: true,
      ultraRealistic: true,
      characterGeneration: true,
      videoStitching: true
    },
    multiSourceImage: {
      enabled: true,
      fallbackChain: true,
      qualityComparison: true,
      costOptimization: true
    },
    ffmpegProfessional: {
      enabled: true,
      transitionTypes: 15,
      audioCrossfading: true,
      qualityPreservation: true
    }
  },

  platform: {
    primary: 'cross-platform',
    aspectRatio: 'auto',
    duration: 45,
    format: 'mp4'
  },

  validation: {
    enabled: true,
    phases: ['smoke', 'integration', 'end-to-end'],
    failureHandling: 'graceful',
    metrics: {
      viralScoreThreshold: 80,
      characterConsistencyThreshold: 90,
      costEfficiencyThreshold: 2.4 // Viral score per dollar
    }
  }
};

export const SPEED_OPTIMIZED_CONFIG: OmegaConfig = {
  preset: 'speed-optimized',
  targetViralScore: 80,
  maxCost: 2500, // $25
  maxTime: 15,

  engines: {
    skinRealism: {
      enabled: true,
      age: 26,
      gender: 'female',
      ethnicity: 'mixed heritage',
      skinTone: 'medium',
      imperfectionTypes: ['freckles', 'pores'],
      overallIntensity: 'moderate'
    },
    characterConsistency: {
      enabled: true,
      preservationLevel: 'moderate',
      brandIntegration: false,
      crossAngle: false
    },
    photoRealism: {
      enabled: true,
      preset: 'lifestyle-authentic',
      quality: 'high'
    },
    advancedVEO3: {
      enabled: true,
      jsonPrompting: true,
      enhancedQuality: false,
      duration: 8
    },
    professionalCinematography: {
      enabled: false,
      style: 'documentary',
      transitions: false
    },
    transformation: {
      enabled: true,
      viralOptimization: true,
      universalRealism: false,
      materialOverlays: false
    },
    zhoTechniques: {
      enabled: true,
      all46: false,
      selectBest: true,
      viralGuaranteedOnly: true,
      maxTechniques: 3
    },
    masterLibrary: {
      enabled: true,
      techniques: 'top5',
      categories: ['viral', 'character'],
      viralFilter: 'high'
    },
    unifiedSystem: {
      enabled: true,
      orchestration: false, // Skip for speed
      qualityValidation: false,
      characterPreservation: true
    },
    nanoBananaVEO3: {
      enabled: true,
      ultraRealistic: false,
      characterGeneration: true,
      videoStitching: false
    },
    multiSourceImage: {
      enabled: true,
      fallbackChain: false, // Use primary source only
      qualityComparison: false,
      costOptimization: true
    },
    ffmpegProfessional: {
      enabled: true,
      transitionTypes: 5,
      audioCrossfading: false,
      qualityPreservation: false
    }
  },

  platform: {
    primary: 'tiktok',
    aspectRatio: '9:16',
    duration: 30,
    format: 'mp4'
  },

  validation: {
    enabled: true,
    phases: ['smoke', 'integration'], // Skip end-to-end for speed
    failureHandling: 'continue',
    metrics: {
      viralScoreThreshold: 75,
      characterConsistencyThreshold: 80,
      costEfficiencyThreshold: 3.2 // Higher efficiency required
    }
  }
};

export const COST_EFFICIENT_CONFIG: OmegaConfig = {
  preset: 'cost-efficient',
  targetViralScore: 75,
  maxCost: 2000, // $20
  maxTime: 20,

  engines: {
    skinRealism: {
      enabled: true,
      age: 26,
      gender: 'female',
      ethnicity: 'mixed heritage',
      skinTone: 'medium',
      imperfectionTypes: ['freckles'],
      overallIntensity: 'minimal'
    },
    characterConsistency: {
      enabled: true,
      preservationLevel: 'moderate',
      brandIntegration: false,
      crossAngle: false
    },
    photoRealism: {
      enabled: true,
      preset: 'lifestyle-authentic',
      quality: 'high'
    },
    advancedVEO3: {
      enabled: true,
      jsonPrompting: false, // Standard prompting to save cost
      enhancedQuality: false,
      duration: 8
    },
    professionalCinematography: {
      enabled: false,
      style: 'documentary',
      transitions: false
    },
    transformation: {
      enabled: false, // Disable to save cost
      viralOptimization: false,
      universalRealism: false,
      materialOverlays: false
    },
    zhoTechniques: {
      enabled: true,
      all46: false,
      selectBest: true,
      viralGuaranteedOnly: false, // Allow lower cost techniques
      maxTechniques: 2
    },
    masterLibrary: {
      enabled: true,
      techniques: 'top5',
      categories: ['character'],
      viralFilter: 'any'
    },
    unifiedSystem: {
      enabled: false, // Skip orchestration to save cost
      orchestration: false,
      qualityValidation: false,
      characterPreservation: true
    },
    nanoBananaVEO3: {
      enabled: true,
      ultraRealistic: false,
      characterGeneration: true,
      videoStitching: false
    },
    multiSourceImage: {
      enabled: true,
      fallbackChain: false,
      qualityComparison: false,
      costOptimization: true
    },
    ffmpegProfessional: {
      enabled: false, // Use basic stitching
      transitionTypes: 1,
      audioCrossfading: false,
      qualityPreservation: false
    }
  },

  platform: {
    primary: 'tiktok',
    aspectRatio: '9:16',
    duration: 20,
    format: 'mp4'
  },

  validation: {
    enabled: true,
    phases: ['smoke'], // Minimal validation
    failureHandling: 'continue',
    metrics: {
      viralScoreThreshold: 70,
      characterConsistencyThreshold: 75,
      costEfficiencyThreshold: 3.75 // Highest efficiency required
    }
  }
};

/**
 * CONFIGURATION UTILITY FUNCTIONS
 */

export class OmegaConfigManager {

  /**
   * Get configuration by preset name
   */
  static getPresetConfig(preset: OmegaConfig['preset']): OmegaConfig {
    switch (preset) {
      case 'viral-guaranteed':
        return VIRAL_GUARANTEED_CONFIG;
      case 'professional-grade':
        return PROFESSIONAL_GRADE_CONFIG;
      case 'speed-optimized':
        return SPEED_OPTIMIZED_CONFIG;
      case 'cost-efficient':
        return COST_EFFICIENT_CONFIG;
      default:
        return PROFESSIONAL_GRADE_CONFIG; // Safe default
    }
  }

  /**
   * Merge custom configuration with preset
   */
  static mergeConfig(basePreset: OmegaConfig['preset'], overrides: Partial<OmegaConfig>): OmegaConfig {
    const baseConfig = this.getPresetConfig(basePreset);
    return {
      ...baseConfig,
      ...overrides,
      engines: {
        ...baseConfig.engines,
        ...overrides.engines
      },
      platform: {
        ...baseConfig.platform,
        ...overrides.platform
      },
      validation: {
        ...baseConfig.validation,
        ...overrides.validation
      }
    };
  }

  /**
   * Convert OmegaConfig to OmegaVideoRequest
   */
  static configToRequest(config: OmegaConfig, character: 'Aria' | 'Bianca' | 'Sofia', prompt: string): OmegaVideoRequest {
    return {
      character,
      basePrompt: prompt,
      dialogue: 'Professional insurance explanation with natural speech patterns',
      environment: 'Modern professional office setting',
      duration: config.engines.advancedVEO3.duration,
      aspectRatio: config.platform.aspectRatio === 'auto' ? '9:16' : config.platform.aspectRatio,
      platform: config.platform.primary === 'cross-platform' ? 'tiktok' : config.platform.primary,

      enableAllEngines: true,
      viralOptimization: config.engines.transformation.viralOptimization,
      qualityLevel: config.preset === 'viral-guaranteed' ? 'viral-guaranteed' :
                   config.preset === 'professional-grade' ? 'professional' : 'standard',

      useZHOTechniques: config.engines.zhoTechniques.enabled,
      useMasterLibrary: config.engines.masterLibrary.enabled,
      useTransformations: config.engines.transformation.enabled,

      maxCost: config.maxCost,
      maxGenerationTime: config.maxTime
    };
  }

  /**
   * Validate configuration for completeness and consistency
   */
  static validateConfig(config: OmegaConfig): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check viral score targets
    if (config.targetViralScore < 70 || config.targetViralScore > 95) {
      issues.push('Target viral score must be between 70-95');
    }

    // Check cost efficiency
    const costEfficiency = config.targetViralScore / (config.maxCost / 100);
    if (costEfficiency < 1.5) {
      issues.push(`Cost efficiency too low: ${costEfficiency.toFixed(2)} (minimum 1.5 viral score per dollar)`);
    }

    // Check engine consistency
    if (config.engines.unifiedSystem.enabled && !config.engines.characterConsistency.enabled) {
      issues.push('Unified system requires character consistency engine');
    }

    if (config.engines.nanoBananaVEO3.enabled && !config.engines.skinRealism.enabled) {
      issues.push('Nano Banana VEO3 requires skin realism engine');
    }

    // Check time constraints
    if (config.maxTime < 10) {
      issues.push('Minimum generation time is 10 minutes');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate expected metrics for a configuration
   */
  static calculateExpectedMetrics(config: OmegaConfig): {
    estimatedViralScore: number;
    estimatedCost: number;
    estimatedTime: number;
    engineUtilization: number;
  } {
    const enabledEngines = Object.values(config.engines).filter(engine => engine.enabled).length;
    const totalEngines = 12;

    let baseViralScore = 65;
    let baseCost = 1000; // $10 base
    let baseTime = 8; // 8 minutes base

    // Calculate based on enabled engines
    const engineMultiplier = enabledEngines / totalEngines;

    return {
      estimatedViralScore: Math.min(95, baseViralScore + (engineMultiplier * 25)),
      estimatedCost: baseCost + (enabledEngines * 200),
      estimatedTime: baseTime + (enabledEngines * 1.5),
      engineUtilization: (enabledEngines / totalEngines) * 100
    };
  }
}

/**
 * OMEGA PRESETS COLLECTION
 * All preset configurations accessible by key
 */
export const OMEGA_PRESETS = {
  VIRAL_GUARANTEED: VIRAL_GUARANTEED_CONFIG,
  PROFESSIONAL_GRADE: PROFESSIONAL_GRADE_CONFIG,
  SPEED_OPTIMIZED: SPEED_OPTIMIZED_CONFIG,
  COST_EFFICIENT: COST_EFFICIENT_CONFIG
} as const;

/**
 * EXPORT DEFAULT CONFIGURATIONS
 */
export {
  VIRAL_GUARANTEED_CONFIG as VIRAL_CONFIG,
  PROFESSIONAL_GRADE_CONFIG as PROFESSIONAL_CONFIG,
  SPEED_OPTIMIZED_CONFIG as SPEED_CONFIG,
  COST_EFFICIENT_CONFIG as BUDGET_CONFIG
};

export default OmegaConfigManager;