/**
 * Advanced VEO3 Prompt Builder - Shared Utility for Ultra-Realistic Video Generation
 *
 * This builder provides pre-configured advanced techniques for VEO3 generation:
 * - Multi-layer audio system
 * - Professional camera movements
 * - Natural lighting presets
 * - Technical quality configurations
 * - ZHO technique integration
 */

import { VEO3JSONPrompt } from '../../../viral/src/services/veo3Service';

export interface CameraPreset {
  motion: string;
  angle: string;
  lens_type: string;
  position: string;
}

export interface LightingPreset {
  mood: string;
  time_of_day?: string;
  consistency?: string;
  enhancement?: string;
}

export interface AudioLayers {
  primary: string;
  action?: string[];
  ambient?: string[];
  emotional?: string;
  music?: string;
  sound_effects?: string[];
}

export class AdvancedVEO3PromptBuilder {

  // ═══════════════════════════════════════════════════════════════════════
  // PRE-CONFIGURED CAMERA MOVEMENTS (From VEO3_CORE_TECHNIQUES.md)
  // ═══════════════════════════════════════════════════════════════════════

  static readonly CAMERA_PRESETS: Record<string, CameraPreset> = {
    'dolly-in-overhead': {
      motion: "very slow smooth dolly-in shot from wide view to detailed area, professional steadicam movement quality",
      angle: "perfectly centered overhead perspective looking straight down at subject (thats where the camera is)",
      lens_type: "35mm natural perspective with clean aesthetic, no distortion",
      position: "fixed overhead tripod position capturing entire scene clearly"
    },
    'eye-level-conversational': {
      motion: "stable handheld shot with subtle natural movement",
      angle: "eye-level conversational angle",
      lens_type: "35mm natural perspective",
      position: "medium shot showing subject and background"
    },
    'over-shoulder': {
      motion: "stable over-shoulder view with natural framing",
      angle: "slightly elevated natural angle showing workspace",
      lens_type: "35mm natural perspective",
      position: "positioned to show both subject and interaction area clearly"
    },
    'screen-recording': {
      motion: "smooth screen recording with slow zoom into details",
      angle: "direct front view of screen interface (thats where the camera is)",
      lens_type: "screen capture perspective",
      position: "centered on interface showing full workspace"
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // NATURAL LIGHTING PRESETS (User prefers natural over professional)
  // ═══════════════════════════════════════════════════════════════════════

  static readonly LIGHTING_PRESETS: Record<string, LightingPreset> = {
    'outdoor-natural': {
      mood: "natural daylight outdoor lighting",
      time_of_day: "mid-morning natural light",
      consistency: "soft natural outdoor lighting with realistic shadows",
      enhancement: "authentic natural light with subtle cloud diffusion"
    },
    'office-window': {
      mood: "natural office window lighting",
      time_of_day: "daytime with natural window light",
      consistency: "soft natural indoor lighting from windows",
      enhancement: "authentic mixed lighting from windows and ambient office light"
    },
    'residential-indoor': {
      mood: "natural indoor home lighting",
      time_of_day: "daytime with natural window and room light",
      consistency: "soft natural mixed indoor lighting",
      enhancement: "authentic residential lighting with warm color temperature"
    },
    'screen-illumination': {
      mood: "bright professional screen illumination with soft diffused lighting",
      time_of_day: "consistent digital screen brightness throughout duration",
      consistency: "perfectly even lighting with authentic monitor color temperature, no harsh shadows or glare",
      enhancement: "crisp bright appearance with perfect clarity and professional software interface clarity"
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MULTI-LAYER AUDIO SYSTEM (From VEO3_ADVANCED_MASTERY.md)
  // ═══════════════════════════════════════════════════════════════════════

  static buildMultiLayerAudio(
    primary: string,
    options?: {
      action?: string[];
      ambient?: string[];
      emotional?: string;
      music?: string;
      soundEffects?: string[];
    }
  ): any {
    return {
      primary: primary,
      action: options?.action || [],
      ambient: options?.ambient || ["natural environmental ambience"],
      emotional: options?.emotional || "authentic and measured tone",
      quality: "professional recording quality with crisp clean audio",
      lip_sync: primary.includes('saying') ? "precise natural mouth movement matching speech rhythm" : "not applicable",
      dialogue_timing: "natural pacing with realistic pauses",
      music: options?.music,
      sound_effects: options?.soundEffects || []
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TECHNICAL QUALITY CONFIGURATIONS
  // ═══════════════════════════════════════════════════════════════════════

  static readonly ULTRA_REALISTIC_TECHNICAL = {
    skin_realism: "VISIBLE skin pores and texture, natural facial asymmetry, authentic imperfections, subtle subsurface scattering, realistic skin tone variations",
    movement_physics: "natural breathing affecting torso and shoulders, realistic weight shifting, authentic gesture physics, natural head movements",
    environmental_integration: "realistic shadows on face, natural color temperature, authentic environmental reflections",
    quality_target: "ultra-photorealistic authentic footage indistinguishable from real video"
  };

  static readonly SCREEN_INTERFACE_TECHNICAL = {
    skin_realism: "not applicable - no human present in video",
    movement_physics: "extremely slow smooth digital UI overlay animations with professional easing curves, very deliberate pacing allowing crystal clear viewing of all interface elements, precise technical animation quality",
    environmental_integration: "photorealistic assets with authentic appearance, professional digital UI overlay elements integrated as separate screen interface layers",
    quality_target: "ultra-professional software demonstration with perfect clarity, flawless spelling, slow deliberate animations, and broadcast-quality indistinguishable from real screen recording"
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CHARACTER PRESERVATION (Critical for consistency)
  // ═══════════════════════════════════════════════════════════════════════

  static buildCharacterPreservation(
    description: string,
    action: string,
    options?: {
      microExpressions?: string[];
      movementQuality?: string;
    }
  ): any {
    return {
      description: description,
      action: action,
      preservation: "maintain exact facial features and authentic appearance from reference image",
      movement_quality: options?.movementQuality || "natural conversational body language, authentic hand gestures, subtle breathing movement",
      micro_expressions: options?.microExpressions || [
        "natural blinking",
        "authentic facial asymmetry",
        "realistic eye contact variations",
        "natural mouth movements during speech"
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NEGATIVE PROMPTS (Common issues to avoid)
  // ═══════════════════════════════════════════════════════════════════════

  static readonly STANDARD_NEGATIVE_PROMPT = "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted, professional studio lighting, dramatic lighting, harsh lighting, perfect skin, flawless";

  static readonly SCREEN_RECORDING_NEGATIVE_PROMPT = "people, human, person, face, hands, body parts, blurry, distorted text, misspelled words, spelling errors, unclear labels, fast movements, rushed animations, poor quality, pixelated, messy interface, cluttered screen";

  // ═══════════════════════════════════════════════════════════════════════
  // COMPLETE PROMPT BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Build a complete VEO3JSONPrompt with all advanced techniques applied
   */
  static buildCompletePrompt(config: {
    mainPrompt: string;
    negativePrompt?: string;
    timing: {
      "0-2s": string;
      "2-6s": string;
      "6-8s": string;
    };
    cameraPreset: keyof typeof AdvancedVEO3PromptBuilder.CAMERA_PRESETS | CameraPreset;
    lightingPreset: keyof typeof AdvancedVEO3PromptBuilder.LIGHTING_PRESETS | LightingPreset;
    character?: {
      description: string;
      action: string;
      microExpressions?: string[];
      movementQuality?: string;
    };
    environment: {
      location: string;
      atmosphere: string;
      interactionElements?: string[];
      spatialAwareness?: string;
    };
    audio: AudioLayers;
    technical?: 'ultra-realistic' | 'screen-interface' | any;
    duration?: 4 | 6 | 8;
  }): VEO3JSONPrompt {

    // Resolve camera preset
    const camera = typeof config.cameraPreset === 'string'
      ? this.CAMERA_PRESETS[config.cameraPreset]
      : config.cameraPreset;

    // Resolve lighting preset
    const lighting = typeof config.lightingPreset === 'string'
      ? this.LIGHTING_PRESETS[config.lightingPreset]
      : config.lightingPreset;

    // Resolve technical preset
    let technical: any;
    if (config.technical === 'ultra-realistic') {
      technical = this.ULTRA_REALISTIC_TECHNICAL;
    } else if (config.technical === 'screen-interface') {
      technical = this.SCREEN_INTERFACE_TECHNICAL;
    } else {
      technical = config.technical || this.ULTRA_REALISTIC_TECHNICAL;
    }

    // Build character section
    const character = config.character
      ? this.buildCharacterPreservation(
          config.character.description,
          config.character.action,
          {
            microExpressions: config.character.microExpressions,
            movementQuality: config.character.movementQuality
          }
        )
      : {
          description: "No human present - pure interface and elements only",
          action: "automated elements and smooth animations",
          preservation: "maintain clean professional aesthetic throughout",
          movement_quality: "smooth precise movements, natural interactions"
        };

    return {
      prompt: config.mainPrompt,
      negative_prompt: config.negativePrompt || this.STANDARD_NEGATIVE_PROMPT,
      timing: config.timing,
      config: {
        duration_seconds: config.duration || 8,
        aspect_ratio: "9:16",
        resolution: "1080p",
        camera: camera,
        lighting: lighting,
        character: character,
        environment: {
          location: config.environment.location,
          atmosphere: config.environment.atmosphere,
          spatial_awareness: config.environment.spatialAwareness || "natural awareness of surroundings",
          interaction_elements: config.environment.interactionElements || []
        },
        audio: {
          primary: config.audio.primary,
          action: config.audio.action,
          ambient: config.audio.ambient || ["natural environmental ambience"],
          emotional: config.audio.emotional || "authentic and measured tone",
          quality: "professional recording quality with crisp clean audio",
          lip_sync: config.audio.primary.includes('saying') ? "precise natural mouth movement matching speech rhythm" : "not applicable",
          dialogue_timing: "natural pacing with realistic pauses",
          music: config.audio.music,
          sound_effects: config.audio.sound_effects
        },
        technical: technical
      }
    };
  }
}
