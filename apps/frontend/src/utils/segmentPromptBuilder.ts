/**
 * Segment Prompt Builder Utility
 *
 * Converts user-friendly SegmentBuilderConfig into VEO3JSONPrompt format
 */

import { SegmentBuilderConfig, SEGMENT_PRESETS, LABELS } from '@/types/segmentBuilder';

// VEO3 JSON Prompt structure (matching viral repo)
export interface VEO3JSONPrompt {
  prompt: string;
  negative_prompt?: string;
  timing: {
    "0-2s": string;
    "2-6s": string;
    "6-8s": string;
  };
  config: {
    duration_seconds: 4 | 6 | 8;
    aspect_ratio: string;
    resolution: '720p' | '1080p';
    camera: {
      motion: string;
      angle: string;
      lens_type: string;
      position: string;
      movements?: string[];
    };
    lighting: {
      mood: string;
      time_of_day?: string;
      consistency?: string;
      enhancement?: string;
    };
    character: {
      description: string;
      action: string;
      preservation?: string;
      micro_expressions?: string[];
      movement_quality?: string;
    };
    environment: {
      location: string;
      atmosphere: string;
      interaction_elements?: string[];
      spatial_awareness?: string;
    };
    audio: {
      primary: string;
      ambient: string[];
      quality: string;
      lip_sync?: string;
      music?: string;
      sound_effects?: string[];
      dialogue_timing?: string;
    };
    technical: {
      skin_realism: string;
      movement_physics: string;
      environmental_integration: string;
      quality_target: string;
    };
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Convert SegmentBuilderConfig to VEO3JSONPrompt
 */
export function buildVEO3JSONPrompt(
  config: SegmentBuilderConfig,
  segmentIndex: number,
  totalSegments: number,
  duration: 4 | 6 | 8 = 8
): VEO3JSONPrompt {
  // Split dialogue into timing phases
  const dialogueParts = splitDialogueIntoTimingPhases(config.dialogue, duration);

  // Build camera motion description
  const cameraMotion = LABELS.cameraMotion[config.camera.motion].split(' (')[0];
  const cameraAngle = LABELS.cameraAngle[config.camera.angle].split(' (')[0];
  const cameraLens = LABELS.cameraLens[config.camera.lens].split(' (')[0];
  const cameraPosition = LABELS.cameraPosition[config.camera.position].split(' (')[0];

  // Build lighting description
  const lightingMood = LABELS.lightingMood[config.lighting.mood].split(' (')[0];
  const timeOfDay = LABELS.timeOfDay[config.lighting.timeOfDay].split(' (')[0];
  const lightingStyle = LABELS.lightingStyle[config.lighting.style].split(' (')[0];

  // Build character description
  const characterAction = LABELS.characterAction[config.character.action].split(' (')[0];
  const characterExpression = LABELS.characterExpression[config.character.expression].split(' (')[0];
  const bodyLanguage = LABELS.bodyLanguage[config.character.bodyLanguage].split(' (')[0];

  // Build environment description
  const location = LABELS.location[config.environment.location].split(' (')[0];
  const atmosphere = LABELS.atmosphere[config.environment.atmosphere].split(' (')[0];

  // Determine if this is first, middle, or last segment
  const isFirst = segmentIndex === 0;
  const isLast = segmentIndex === totalSegments - 1;
  const continuationInstruction = isFirst
    ? 'BEGIN: Character starts in setting.'
    : 'CONTINUE from previous segment: Maintain exact character positioning, lighting, and environment.';

  // Build the main prompt
  const prompt = `${continuationInstruction} ${config.dialogue || 'Character continues naturally.'}`;

  // Build timing phases
  const timing = {
    "0-2s": dialogueParts.hook,
    "2-6s": dialogueParts.main,
    "6-8s": dialogueParts.conclusion
  };

  // Build the complete JSON prompt
  return {
    prompt,
    negative_prompt: 'blurry, distorted, artificial, plastic skin, unnatural movement, jerky motion, poor lighting',
    timing,
    config: {
      duration_seconds: duration,
      aspect_ratio: '16:9',
      resolution: '1080p',
      camera: {
        motion: cameraMotion,
        angle: cameraAngle,
        lens_type: cameraLens,
        position: cameraPosition,
        movements: config.camera.motion !== 'static' ? [cameraMotion] : undefined
      },
      lighting: {
        mood: lightingMood,
        time_of_day: timeOfDay,
        consistency: isFirst ? 'Establish lighting' : 'Match previous segment lighting exactly',
        enhancement: lightingStyle
      },
      character: {
        description: 'Professional presenter, natural appearance',
        action: characterAction,
        preservation: isFirst ? undefined : 'CRITICAL: Preserve exact facial features, expression, and clothing from previous segment',
        micro_expressions: [characterExpression],
        movement_quality: bodyLanguage
      },
      environment: {
        location,
        atmosphere,
        interaction_elements: config.props.length > 0 ? config.props : undefined,
        spatial_awareness: isFirst ? 'Establish scene geography' : 'Maintain exact spatial positioning from previous segment'
      },
      audio: {
        primary: 'Natural dialogue',
        ambient: [atmosphere + ' ambient sounds'],
        quality: 'Professional recording',
        lip_sync: 'Perfect synchronization with dialogue',
        music: undefined,
        sound_effects: config.props.length > 0 ? ['Realistic prop interaction sounds'] : undefined,
        dialogue_timing: 'Natural pacing with pauses'
      },
      technical: {
        skin_realism: 'Natural skin texture with visible pores, subtle imperfections',
        movement_physics: 'Realistic, natural body movement and gestures',
        environmental_integration: 'Character naturally integrated into environment lighting and space',
        quality_target: 'Professional broadcast quality, photorealistic'
      }
    }
  };
}

/**
 * Split dialogue into timing phases for VEO3
 */
function splitDialogueIntoTimingPhases(dialogue: string, duration: 4 | 6 | 8): {
  hook: string;
  main: string;
  conclusion: string;
} {
  if (!dialogue || dialogue.trim() === '') {
    return {
      hook: 'Character begins speaking naturally',
      main: 'Character continues with main content',
      conclusion: 'Character concludes and holds neutral expression'
    };
  }

  // Split dialogue into sentences
  const sentences = dialogue.match(/[^.!?]+[.!?]+/g) || [dialogue];

  if (duration === 4) {
    // 4 seconds: Very concise
    return {
      hook: sentences[0] || dialogue,
      main: sentences.slice(1).join(' ') || 'Continue naturally',
      conclusion: 'Hold final expression'
    };
  } else if (duration === 6) {
    // 6 seconds: Moderate pacing
    const mid = Math.ceil(sentences.length / 2);
    return {
      hook: sentences.slice(0, mid).join(' ') || dialogue,
      main: sentences.slice(mid).join(' ') || 'Continue speaking',
      conclusion: 'Conclude naturally with pause'
    };
  } else {
    // 8 seconds: Full pacing
    const third = Math.ceil(sentences.length / 3);
    return {
      hook: sentences.slice(0, third).join(' ') || dialogue.substring(0, dialogue.length / 3),
      main: sentences.slice(third, third * 2).join(' ') || dialogue.substring(dialogue.length / 3, (dialogue.length / 3) * 2),
      conclusion: sentences.slice(third * 2).join(' ') || dialogue.substring((dialogue.length / 3) * 2) + ' [Hold neutral expression]'
    };
  }
}

/**
 * Validate SegmentBuilderConfig
 */
export function validateConfig(config: SegmentBuilderConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check dialogue length (approximate 2-3 sentences for 8s = ~150-250 chars)
  if (config.dialogue.length > 300) {
    errors.push('Dialogue too long. Keep to 2-3 sentences (~150-250 characters) for 8-second segment.');
  }

  if (config.dialogue.length < 10 && config.dialogue.trim() !== '') {
    warnings.push('Dialogue seems very short. Consider adding more detail.');
  }

  // Check for incompatible settings
  if (config.lighting.timeOfDay === 'night' && config.lighting.mood === 'high_key') {
    warnings.push('High-key lighting is unusual for night scenes. Consider Natural or Low-key lighting.');
  }

  if (config.lighting.timeOfDay === 'midday' && config.lighting.mood === 'moody') {
    warnings.push('Moody lighting is unusual for midday. Consider Cinematic or Dramatic instead.');
  }

  // Check camera settings logic
  if (config.camera.motion === 'static' && config.camera.position === 'extreme_wide') {
    warnings.push('Static extreme wide shots can feel distant. Consider adding slow pan or using a closer position.');
  }

  // Check character consistency
  if (config.character.expression === 'excited' && config.character.bodyLanguage === 'formal') {
    warnings.push('Excited expression with formal body language may look inconsistent. Consider matching energy levels.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Apply preset to create SegmentBuilderConfig
 */
export function applyPreset(presetKey: keyof typeof SEGMENT_PRESETS): SegmentBuilderConfig {
  const preset = SEGMENT_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetKey}`);
  }

  // Return a deep copy to avoid mutations
  return JSON.parse(JSON.stringify(preset.defaults)) as SegmentBuilderConfig;
}

/**
 * Get all available presets
 */
export function getAvailablePresets(): Array<{ key: string; name: string; description: string }> {
  return Object.entries(SEGMENT_PRESETS).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description
  }));
}

/**
 * Merge user changes with preset defaults
 */
export function mergeWithPreset(
  presetKey: keyof typeof SEGMENT_PRESETS,
  overrides: Partial<SegmentBuilderConfig>
): SegmentBuilderConfig {
  const baseConfig = applyPreset(presetKey);

  return {
    ...baseConfig,
    ...overrides,
    camera: { ...baseConfig.camera, ...(overrides.camera || {}) },
    lighting: { ...baseConfig.lighting, ...(overrides.lighting || {}) },
    character: { ...baseConfig.character, ...(overrides.character || {}) },
    environment: { ...baseConfig.environment, ...(overrides.environment || {}) }
  };
}
