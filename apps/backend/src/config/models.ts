/**
 * Centralized AI Model Configuration
 * All model names and costs in one place for easy maintenance
 */

export const AI_MODELS = {
  IMAGE: {
    GENERATION: process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image-preview',     // NanoBanana for basic generation
    CAPABILITY: process.env.IMAGEN_CAPABILITY_MODEL || 'imagen-3.0-capability-001', // For editing/customization
    FALLBACK: process.env.IMAGEN_FALLBACK_MODEL || 'imagen-3.0-generate-001'     // Backup option
  },
  VIDEO: {
    FAST: process.env.VEO3_FAST_MODEL || 'veo-3.0-fast-generate-001',
    STANDARD: process.env.VEO3_STANDARD_MODEL || 'veo-3.0-standard-generate-001'
  },
  TEXT: {
    FLASH: process.env.GEMINI_FLASH_MODEL || 'gemini-2.0-flash-latest',
    PRO: process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro-latest',
    LEGACY_FLASH: 'gemini-1.5-flash'
  }
};

export const MODEL_COSTS = {
  // Image generation costs per image
  [AI_MODELS.IMAGE.GENERATION]: 0.039,        // NanoBanana (gemini-2.5-flash-image-preview)
  [AI_MODELS.IMAGE.CAPABILITY]: 0.045,        // Imagen 3.0 capability
  [AI_MODELS.IMAGE.FALLBACK]: 0.040,          // Imagen 3.0 generate

  // Video generation costs per video
  [AI_MODELS.VIDEO.FAST]: 1.20,               // VEO3 fast
  [AI_MODELS.VIDEO.STANDARD]: 3.20,           // VEO3 standard

  // Text generation costs per 1M tokens
  [AI_MODELS.TEXT.FLASH]: 0.27,               // Gemini Flash
  [AI_MODELS.TEXT.PRO]: 1.25,                 // Gemini Pro
  [AI_MODELS.TEXT.LEGACY_FLASH]: 0.25         // Legacy Flash
};

export const MODEL_LIMITS = {
  IMAGE: {
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_IMAGES_PER_REQUEST: 4,
    MAX_INPUT_SIZE_MB: 10,
    MAX_PROMPT_TOKENS: 480
  },
  VIDEO: {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_DURATION_SECONDS: 10,
    SUPPORTED_RESOLUTIONS: ['720p', '1080p', '4k'],
    SUPPORTED_ASPECT_RATIOS: ['16:9', '9:16', '1:1']
  },
  TEXT: {
    MAX_TOKENS_PER_REQUEST: 8192,
    MAX_CONTEXT_WINDOW: 1000000  // Gemini 2.0 Flash
  }
};

export const MODEL_FEATURES = {
  [AI_MODELS.IMAGE.GENERATION]: {
    supports: ['generation', 'negative_prompts', 'aspect_ratios'],
    doesNotSupport: ['editing', 'customization', 'reference_images']
  },
  [AI_MODELS.IMAGE.CAPABILITY]: {
    supports: ['editing', 'customization', 'reference_images', 'style_transfer', 'mask_editing'],
    doesNotSupport: ['basic_generation']
  },
  [AI_MODELS.VIDEO.FAST]: {
    supports: ['quick_generation', 'basic_audio'],
    processingTime: '1-2 minutes'
  },
  [AI_MODELS.VIDEO.STANDARD]: {
    supports: ['high_quality', 'advanced_audio', 'longer_duration'],
    processingTime: '3-5 minutes'
  }
};

// Helper function to get the right model based on features needed
export function selectImageModel(needsCustomization: boolean, hasReferenceImages: boolean): string {
  if (needsCustomization || hasReferenceImages) {
    return AI_MODELS.IMAGE.CAPABILITY;
  }
  return AI_MODELS.IMAGE.GENERATION;
}

export function selectVideoModel(costMode: 'fast' | 'premium' | 'dynamic'): string {
  if (costMode === 'fast') {
    return AI_MODELS.VIDEO.FAST;
  } else if (costMode === 'premium') {
    return AI_MODELS.VIDEO.STANDARD;
  } else {
    // Dynamic selection based on content importance
    return AI_MODELS.VIDEO.FAST;
  }
}

export function calculateCost(model: string, quantity: number = 1): number {
  const costPerUnit = MODEL_COSTS[model] || 0;
  return costPerUnit * quantity;
}

export function isModelAvailable(model: string): boolean {
  return Object.values(AI_MODELS).some(category =>
    Object.values(category).includes(model)
  );
}