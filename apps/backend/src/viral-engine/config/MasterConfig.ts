/**
 * MASTER VIRAL ENGINE CONFIGURATION
 *
 * Centralized configuration for all engines and techniques
 * Nothing left on the table - every setting available
 *
 * Sign off as SmokeDev 🚬
 */

export interface SkinRealismConfig {
  enabled: boolean;
  intensity: 'light' | 'moderate' | 'ultra';
  imperfectionTypes: {
    freckles: boolean;
    pores: boolean;
    wrinkles: boolean;
    moles: boolean;
    blemishes: boolean;
    scars: boolean;
    asymmetry: boolean;
  };
  ageSpecific: boolean;
  ethnicitySpecific: boolean;
}

export interface CharacterConsistencyConfig {
  enabled: boolean;
  level: 'basic' | 'advanced' | 'strict';
  useAnchors: boolean;
  preservationPattern: 'minimal' | 'standard' | 'full-identity';
  brandIntegration: boolean;
  multiAngleGeneration: boolean;
}

export interface PhotoRealismConfig {
  enabled: boolean;
  preset: 'auto' | 'professional' | 'editorial' | 'commercial' | 'lifestyle';
  availablePresets: string[];
  customSettings: {
    lighting: string;
    composition: string;
    grading: string;
  };
}

export interface TransformationConfig {
  enabled: boolean;
  chains: boolean;
  viralOptimization: boolean;
  universalRealism: boolean;
  platformSpecific: boolean;
  materialOverlays: boolean;
}

export interface ZHOTechniquesConfig {
  enabled: boolean;
  all46: boolean;
  selectBest: boolean;
  viralGuaranteedOnly: boolean;
  categoriesEnabled: string[];
  customTechniques: string[];
}

export interface MasterLibraryConfig {
  enabled: boolean;
  techniques: 'top5' | 'top10' | 'all';
  categories: string[];
  viralPotentialFilter: 'any' | 'high' | 'viral-guaranteed';
  customRecommendations: boolean;
}

export interface VEO3Config {
  jsonPrompting: boolean;
  advancedRules: boolean;
  dialogueOptimization: boolean;
  cameraPositioning: boolean;
  eightSecondRule: boolean;
  capsLockPrevention: boolean;
  oneSubtleMotion: boolean;
}

export interface CinematographyConfig {
  enabled: boolean;
  shotTypes: string[];
  lightingSetups: string[];
  colorGrading: string[];
  cameraMovements: string[];
  professionalPatterns: string[];
}

export interface ScoringConfig {
  viralTracking: boolean;
  qualityMetrics: boolean;
  brandIntegration: boolean;
  techniqueCounting: boolean;
  performanceAnalytics: boolean;
}

export interface MasterEngineConfig {
  // ENGINE CONFIGURATIONS
  engines: {
    skinRealism: SkinRealismConfig;
    characterConsistency: CharacterConsistencyConfig;
    photoRealism: PhotoRealismConfig;
    transformation: TransformationConfig;
    zhoTechniques: ZHOTechniquesConfig;
    masterLibrary: MasterLibraryConfig;
  };

  // VEO3 CONFIGURATION
  veo3: VEO3Config;

  // CINEMATOGRAPHY CONFIGURATION
  cinematography: CinematographyConfig;

  // SCORING & METRICS
  scoring: ScoringConfig;

  // GENERAL SETTINGS
  general: {
    outputPath: string;
    defaultDuration: number;
    defaultAspectRatio: '9:16' | '16:9' | '1:1';
    defaultQuality: 'standard' | 'high';
    enableLogging: boolean;
    verboseOutput: boolean;
  };

  // PLATFORM SETTINGS
  platforms: {
    tiktok: {
      aspectRatio: '9:16';
      maxDuration: 60;
      recommendedTechniques: string[];
    };
    instagram: {
      aspectRatio: '9:16' | '1:1';
      maxDuration: 90;
      recommendedTechniques: string[];
    };
    youtube: {
      aspectRatio: '16:9';
      maxDuration: 300;
      recommendedTechniques: string[];
    };
  };
}

// DEFAULT CONFIGURATION - EVERYTHING ENABLED!
export const DEFAULT_MASTER_CONFIG: MasterEngineConfig = {
  engines: {
    skinRealism: {
      enabled: true,
      intensity: 'ultra',
      imperfectionTypes: {
        freckles: true,
        pores: true,
        wrinkles: true,
        moles: true,
        blemishes: true,
        scars: true,
        asymmetry: true
      },
      ageSpecific: true,
      ethnicitySpecific: true
    },

    characterConsistency: {
      enabled: true,
      level: 'strict',
      useAnchors: true,
      preservationPattern: 'full-identity',
      brandIntegration: true,
      multiAngleGeneration: true
    },

    photoRealism: {
      enabled: true,
      preset: 'professional',
      availablePresets: [
        'fashion-magazine',
        'business-headshot',
        'editorial-portrait',
        'commercial-brand',
        'lifestyle-authentic'
      ],
      customSettings: {
        lighting: 'three_point',
        composition: 'rule_of_thirds',
        grading: 'broadcast_standard'
      }
    },

    transformation: {
      enabled: true,
      chains: true,
      viralOptimization: true,
      universalRealism: true,
      platformSpecific: true,
      materialOverlays: true
    },

    zhoTechniques: {
      enabled: true,
      all46: true,
      selectBest: true,
      viralGuaranteedOnly: false,
      categoriesEnabled: [
        'viral',
        'professional',
        'transformation',
        'style-transfer',
        'enhancement'
      ],
      customTechniques: []
    },

    masterLibrary: {
      enabled: true,
      techniques: 'all', // Use all 90+ techniques!
      categories: [
        'viral',
        'professional',
        'enhancement',
        'transformation',
        'style',
        'cinematic'
      ],
      viralPotentialFilter: 'any',
      customRecommendations: true
    }
  },

  veo3: {
    jsonPrompting: true,
    advancedRules: true,
    dialogueOptimization: true,
    cameraPositioning: true,
    eightSecondRule: true,
    capsLockPrevention: true,
    oneSubtleMotion: true
  },

  cinematography: {
    enabled: true,
    shotTypes: [
      'close_up',
      'medium_close_up',
      'medium_shot',
      'medium_wide',
      'wide_shot',
      'extreme_wide',
      'over_shoulder',
      'point_of_view'
    ],
    lightingSetups: [
      'three_point',
      'natural_window',
      'soft_box',
      'dramatic',
      'golden_hour',
      'commercial_bright'
    ],
    colorGrading: [
      'broadcast_standard',
      'cinematic',
      'social_media',
      'warm_personal',
      'neutral_professional',
      'high_key_bright'
    ],
    cameraMovements: [
      'dolly_in',
      'dolly_out',
      'pan_left',
      'pan_right',
      'pan_follow',
      'tilt_up',
      'tilt_down',
      'crane_up',
      'crane_down',
      'tracking_follow',
      'handheld_natural',
      'zoom_emphasis'
    ],
    professionalPatterns: [
      'authority_pattern',
      'engagement_pattern',
      'educational_pattern',
      'sales_pattern',
      'connection_pattern'
    ]
  },

  scoring: {
    viralTracking: true,
    qualityMetrics: true,
    brandIntegration: true,
    techniqueCounting: true,
    performanceAnalytics: true
  },

  general: {
    outputPath: './generated/master-viral-engine',
    defaultDuration: 8,
    defaultAspectRatio: '9:16',
    defaultQuality: 'high',
    enableLogging: true,
    verboseOutput: true
  },

  platforms: {
    tiktok: {
      aspectRatio: '9:16',
      maxDuration: 60,
      recommendedTechniques: [
        'figure-transformation',
        'universal-realism',
        'handheld-natural',
        'energetic-movement',
        'viral-hooks'
      ]
    },
    instagram: {
      aspectRatio: '9:16',
      maxDuration: 90,
      recommendedTechniques: [
        'lifestyle-authentic',
        'professional-lighting',
        'brand-integration',
        'engagement-patterns',
        'story-telling'
      ]
    },
    youtube: {
      aspectRatio: '16:9',
      maxDuration: 300,
      recommendedTechniques: [
        'educational-patterns',
        'professional-cinematography',
        'authority-building',
        'quality-enhancement',
        'detailed-explanations'
      ]
    }
  }
};

// PRESET CONFIGURATIONS FOR DIFFERENT USE CASES

export const MAXIMUM_VIRAL_CONFIG: Partial<MasterEngineConfig> = {
  engines: {
    skinRealism: {
      enabled: true,
      intensity: 'ultra',
      imperfectionTypes: {
        freckles: true,
        pores: true,
        wrinkles: true,
        moles: true,
        blemishes: true,
        scars: true,
        asymmetry: true
      },
      ageSpecific: true,
      ethnicitySpecific: true
    },
    characterConsistency: {
      enabled: true,
      level: 'strict',
      useAnchors: true,
      preservationPattern: 'full-identity',
      brandIntegration: true,
      multiAngleGeneration: true
    },
    photoRealism: {
      enabled: true,
      preset: 'editorial',
      availablePresets: ['editorial', 'professional', 'commercial'],
      customSettings: {
        lighting: 'professional',
        composition: 'expert',
        grading: 'ultra-high'
      }
    },
    zhoTechniques: {
      enabled: true,
      all46: true,
      selectBest: true,
      viralGuaranteedOnly: true,
      categoriesEnabled: ['viral'],
      customTechniques: []
    },
    masterLibrary: {
      enabled: true,
      techniques: 'all',
      categories: ['viral'],
      viralPotentialFilter: 'viral-guaranteed',
      customRecommendations: true
    },
    transformation: {
      enabled: true,
      chains: true,
      viralOptimization: true,
      universalRealism: true,
      platformSpecific: true,
      materialOverlays: true
    }
  }
};

export const PROFESSIONAL_QUALITY_CONFIG: Partial<MasterEngineConfig> = {
  engines: {
    skinRealism: {
      enabled: true,
      intensity: 'ultra',
      imperfectionTypes: {
        freckles: true,
        pores: true,
        wrinkles: true,
        moles: true,
        blemishes: true,
        scars: true,
        asymmetry: true
      },
      ageSpecific: true,
      ethnicitySpecific: true
    },
    characterConsistency: {
      enabled: true,
      level: 'strict',
      useAnchors: true,
      preservationPattern: 'full-identity',
      brandIntegration: false,
      multiAngleGeneration: true
    },
    photoRealism: {
      enabled: true,
      preset: 'professional',
      availablePresets: ['business-headshot', 'commercial-brand', 'editorial-portrait'],
      customSettings: {
        lighting: 'three_point',
        composition: 'professional',
        grading: 'broadcast_standard'
      }
    },
    transformation: {
      enabled: false,
      chains: false,
      viralOptimization: false,
      universalRealism: true,
      platformSpecific: true,
      materialOverlays: false
    },
    zhoTechniques: {
      enabled: false,
      all46: false,
      selectBest: false,
      viralGuaranteedOnly: false,
      categoriesEnabled: [],
      customTechniques: []
    },
    masterLibrary: {
      enabled: true,
      techniques: 'top10',
      categories: ['professional', 'character'],
      viralPotentialFilter: 'high',
      customRecommendations: false
    }
  }
};

export const SPEED_OPTIMIZED_CONFIG: Partial<MasterEngineConfig> = {
  engines: {
    skinRealism: {
      enabled: true,
      intensity: 'moderate',
      imperfectionTypes: {
        freckles: true,
        pores: true,
        wrinkles: false,
        moles: false,
        blemishes: false,
        scars: false,
        asymmetry: true
      },
      ageSpecific: false,
      ethnicitySpecific: false
    },
    characterConsistency: {
      enabled: true,
      level: 'advanced',
      useAnchors: true,
      preservationPattern: 'standard',
      brandIntegration: false,
      multiAngleGeneration: false
    },
    photoRealism: {
      enabled: true,
      preset: 'lifestyle',
      availablePresets: ['lifestyle', 'professional', 'editorial'],
      customSettings: {
        lighting: 'natural',
        composition: 'portrait',
        grading: 'high'
      }
    },
    transformation: {
      enabled: false,
      chains: false,
      viralOptimization: false,
      universalRealism: false,
      platformSpecific: false,
      materialOverlays: false
    },
    masterLibrary: {
      enabled: true,
      techniques: 'top5',
      categories: ['essential'],
      viralPotentialFilter: 'high',
      customRecommendations: false
    },
    zhoTechniques: {
      enabled: true,
      all46: false,
      selectBest: true,
      viralGuaranteedOnly: true,
      categoriesEnabled: ['viral'],
      customTechniques: []
    }
  }
};

// CONFIGURATION UTILITY FUNCTIONS

export function mergeConfigs(base: MasterEngineConfig, override: Partial<MasterEngineConfig>): MasterEngineConfig {
  return {
    engines: { ...base.engines, ...override.engines },
    veo3: { ...base.veo3, ...override.veo3 },
    cinematography: { ...base.cinematography, ...override.cinematography },
    scoring: { ...base.scoring, ...override.scoring },
    general: { ...base.general, ...override.general },
    platforms: { ...base.platforms, ...override.platforms }
  };
}

export function getConfigForPlatform(platform: 'tiktok' | 'instagram' | 'youtube'): Partial<MasterEngineConfig> {
  const baseConfig = DEFAULT_MASTER_CONFIG;
  const platformConfig = baseConfig.platforms[platform];

  return {
    general: {
      ...baseConfig.general,
      defaultAspectRatio: platformConfig.aspectRatio,
      defaultDuration: Math.min(8, platformConfig.maxDuration)
    },
    engines: {
      ...baseConfig.engines,
      zhoTechniques: {
        ...baseConfig.engines.zhoTechniques,
        categoriesEnabled: platformConfig.recommendedTechniques
      }
    }
  };
}

export function validateConfig(config: MasterEngineConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate engine settings
  if (!config.engines) {
    errors.push('Engines configuration is required');
  }

  // Validate VEO3 settings
  if (!config.veo3) {
    errors.push('VEO3 configuration is required');
  }

  // Validate general settings
  if (!config.general.outputPath) {
    errors.push('Output path is required');
  }

  if (config.general.defaultDuration <= 0 || config.general.defaultDuration > 300) {
    errors.push('Default duration must be between 1 and 300 seconds');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}