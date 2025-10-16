// Image generation model types and configurations

export type ImageModel = 'imagen-3' | 'imagen-4' | 'nanobana';

export interface ModelConfig {
  id: ImageModel;
  name: string;
  description: string;
  capabilities: string[];
  cost: number; // USD per image
  estimatedTime: number; // seconds
  maxImages: number;
  quality: 'Good' | 'High' | 'Ultra';
  speciality: string;
  apiEndpoint: string;
  modelIdentifier: string;
}

export const MODEL_CONFIGS: Record<ImageModel, ModelConfig> = {
  'imagen-3': {
    id: 'imagen-3',
    name: 'Imagen 3',
    description: 'Google\'s advanced image generation model with excellent prompt following',
    capabilities: [
      'High-quality photorealistic images',
      'Excellent text rendering',
      'Complex scene composition',
      'Fast generation speed'
    ],
    cost: 0.04,
    estimatedTime: 8,
    maxImages: 8,
    quality: 'High',
    speciality: 'General purpose, text rendering',
    apiEndpoint: '/api/generate-images',
    modelIdentifier: 'imagen-3.0-generate-001'
  },
  'imagen-4': {
    id: 'imagen-4',
    name: 'Imagen 4',
    description: 'Latest generation with improved prompt adherence and visual quality',
    capabilities: [
      'Superior prompt following',
      'Enhanced visual quality',
      'Better artistic styles',
      'Improved text integration'
    ],
    cost: 0.08,
    estimatedTime: 12,
    maxImages: 4,
    quality: 'Ultra',
    speciality: 'Premium quality, artistic styles',
    apiEndpoint: '/api/generate-images',
    modelIdentifier: 'imagen-4.0-generate-preview-06-06'
  },
  'nanobana': {
    id: 'nanobana',
    name: 'NanoBanana',
    description: 'Ultra-realistic human generation with character consistency (Gemini 2.5 Flash)',
    capabilities: [
      'Ultra-realistic human portraits',
      'Character consistency',
      'Natural skin textures',
      'Professional photography style'
    ],
    cost: 0.02,
    estimatedTime: 15,
    maxImages: 3,
    quality: 'Ultra',
    speciality: 'Human portraits, character consistency',
    apiEndpoint: '/api/generate-nanobana',
    modelIdentifier: 'gemini-2.5-flash-image-preview'
  }
};

export const DEFAULT_MODEL: ImageModel = 'imagen-4';

// Helper functions
export const getModelConfig = (model: ImageModel): ModelConfig => {
  return MODEL_CONFIGS[model];
};

export const getModelDisplayName = (model: ImageModel): string => {
  return MODEL_CONFIGS[model].name;
};

export const getModelCost = (model: ImageModel, numImages: number = 1): number => {
  return MODEL_CONFIGS[model].cost * numImages;
};

export const getModelCapabilityBadge = (model: ImageModel): string => {
  const config = MODEL_CONFIGS[model];
  return `${config.quality} • ${config.speciality}`;
};