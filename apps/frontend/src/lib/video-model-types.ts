// VEO3 Video Model Type Definitions
// Type-safe video model, duration, and enhancement level definitions

export type VideoModel =
  | 'veo-2.0'           // VEO 2.0 baseline
  | 'veo-2.0-json'      // VEO 2.0 with JSON prompting
  | 'veo-3.0'           // VEO 3.0 baseline
  | 'veo-3.0-fast'      // VEO 3.0 Fast (62.5% cheaper - RECOMMENDED)
  | 'veo-3.0-json'      // VEO 3.0 with JSON prompting
  | 'veo-3.0-long'      // VEO 3.0 long-form (56 seconds)
  | 'veo-3.0-chained';  // VEO 3.0 with chaining

export interface VideoModelConfig {
  id: VideoModel;
  name: string;
  icon: string;         // Lucide React icon name
  description: string;
  costPer4s: number;    // Cost in dollars for 4 seconds
  maxDuration: number;  // Max duration in seconds
  features: string[];   // Array of feature descriptions
}

export const videoModels: VideoModelConfig[] = [
  {
    id: 'veo-3.0-fast',
    name: 'VEO 3.0 Fast',
    icon: 'Zap',
    description: '62.5% cheaper than standard - rapid generation',
    costPer4s: 0.60,
    maxDuration: 8,
    features: ['Fast generation', '62.5% cost savings', 'High quality', 'Default model']
  },
  {
    id: 'veo-3.0-json',
    name: 'VEO 3.0 (JSON)',
    icon: 'Sparkles',
    description: '300%+ quality boost with JSON prompting',
    costPer4s: 3.00,
    maxDuration: 8,
    features: ['JSON prompting', 'Cinematic quality', 'Native audio', 'Character consistency']
  },
  {
    id: 'veo-3.0',
    name: 'VEO 3.0',
    icon: 'Video',
    description: 'Standard VEO 3.0 generation',
    costPer4s: 3.00,
    maxDuration: 8,
    features: ['High quality', 'Fast generation', 'Basic prompting']
  },
  {
    id: 'veo-2.0-json',
    name: 'VEO 2.0 (JSON)',
    icon: 'Film',
    description: 'VEO 2.0 with JSON prompting',
    costPer4s: 2.25,
    maxDuration: 8,
    features: ['JSON prompting', 'Good quality', 'Lower cost']
  },
  {
    id: 'veo-2.0',
    name: 'VEO 2.0',
    icon: 'PlayCircle',
    description: 'Baseline VEO 2.0 generation',
    costPer4s: 2.25,
    maxDuration: 8,
    features: ['Standard quality', 'Fast generation', 'Budget-friendly']
  },
  {
    id: 'veo-3.0-long',
    name: 'VEO 3.0 Long',
    icon: 'Clock',
    description: 'VEO 3.0 long-form video (56 seconds)',
    costPer4s: 3.00,
    maxDuration: 56,
    features: ['Extended duration', 'Multi-segment', 'Character consistency', 'Video chaining']
  },
  {
    id: 'veo-3.0-chained',
    name: 'VEO 3.0 Chained',
    icon: 'Link',
    description: 'VEO 3.0 with frame-to-frame chaining',
    costPer4s: 3.00,
    maxDuration: 16,
    features: ['Video chaining', 'Seamless continuity', 'Last frame extraction', 'Extended scenes']
  }
];

export type VideoDuration = 4 | 6 | 8;

export interface VideoDurationConfig {
  value: VideoDuration;
  label: string;
  cost: (model: VideoModel) => number;  // Calculate cost based on model
}

export const videoDurations: VideoDurationConfig[] = [
  {
    value: 4,
    label: '4 seconds',
    cost: (model) => videoModels.find(m => m.id === model)!.costPer4s
  },
  {
    value: 6,
    label: '6 seconds',
    cost: (model) => videoModels.find(m => m.id === model)!.costPer4s * 1.5
  },
  {
    value: 8,
    label: '8 seconds',
    cost: (model) => videoModels.find(m => m.id === model)!.costPer4s * 2
  },
];

// Gemini enhancement levels
export type EnhancementLevel = 'none' | 'basic' | 'standard' | 'cinematic';

export interface EnhancementConfig {
  id: EnhancementLevel;
  name: string;
  qualityBoost: number;  // Quality improvement out of 10
  cost: number;          // Additional cost in dollars
  description: string;
}

export const enhancementLevels: EnhancementConfig[] = [
  {
    id: 'none',
    name: 'None',
    qualityBoost: 0,
    cost: 0,
    description: 'Use prompt as-is'
  },
  {
    id: 'basic',
    name: 'Basic',
    qualityBoost: 3.5,
    cost: 0.0001,
    description: 'Basic Gemini enhancement'
  },
  {
    id: 'standard',
    name: 'Standard',
    qualityBoost: 6.0,
    cost: 0.0003,
    description: 'Standard cinematic enhancement'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    qualityBoost: 8.5,
    cost: 0.0005,
    description: 'Full cinematic treatment'
  },
];
