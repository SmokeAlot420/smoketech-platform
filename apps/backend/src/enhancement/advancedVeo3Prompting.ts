/**
 * Advanced VEO3 Prompting System
 *
 * Based on research from:
 * - snubroot's Veo-3-Meta-Framework
 * - snubroot's Veo-JSON critical rules
 * - jax-explorer's awesome-veo3-videos patterns
 * - shabbirun's character consistency workflows
 *
 * Implements advanced techniques for ultra-realistic video generation
 */

export interface CameraMovement {
  type: 'dolly' | 'tracking' | 'pan' | 'tilt' | 'crane' | 'handheld' | 'zoom' | 'orbit';
  description: string;
  timing: string;
  quality: 'smooth' | 'natural' | 'cinematic' | 'dramatic';
  physics: string;
}

export interface MovementQuality {
  type: 'natural' | 'energetic' | 'slow' | 'graceful' | 'confident' | 'fluid';
  description: string;
  physics: string;
  timing: string;
}

export interface SceneTransition {
  type: 'cut' | 'dissolve' | 'fade' | 'wipe' | 'zoom' | 'dolly';
  description: string;
  duration: string;
  effect: string;
}

export interface AudioIntegration {
  type: 'dialogue' | 'ambient' | 'music' | 'effects';
  rules: string[];
  timing: string;
  quality: string;
}

export class AdvancedVEO3Prompting {

  /**
   * Professional Camera Movement Library
   * Based on snubroot's Meta Framework cinematography patterns
   */
  static readonly CAMERA_MOVEMENTS: Record<string, CameraMovement> = {
    dolly_in: {
      type: 'dolly',
      description: 'Smooth dolly-in from wide to medium shot',
      timing: 'Gradual movement over 2-4 seconds',
      quality: 'cinematic',
      physics: 'realistic momentum conservation and smooth acceleration'
    },
    dolly_out: {
      type: 'dolly',
      description: 'Professional dolly-out revealing context',
      timing: 'Steady movement over 3-5 seconds',
      quality: 'smooth',
      physics: 'natural deceleration with professional stabilization'
    },
    tracking_follow: {
      type: 'tracking',
      description: 'Smooth tracking shot following subject movement',
      timing: 'Continuous movement matching subject pace',
      quality: 'natural',
      physics: 'fluid camera movement with realistic tracking physics'
    },
    tracking_parallel: {
      type: 'tracking',
      description: 'Parallel tracking maintaining consistent distance',
      timing: 'Steady movement alongside subject',
      quality: 'smooth',
      physics: 'professional stabilization with natural movement'
    },
    pan_reveal: {
      type: 'pan',
      description: 'Dramatic pan revealing key information',
      timing: 'Controlled movement over 2-3 seconds',
      quality: 'dramatic',
      physics: 'smooth rotational movement with natural momentum'
    },
    pan_follow: {
      type: 'pan',
      description: 'Natural pan following action or dialogue',
      timing: 'Responsive movement matching action',
      quality: 'natural',
      physics: 'authentic camera operator movement patterns'
    },
    crane_up: {
      type: 'crane',
      description: 'Majestic crane movement rising to reveal scale',
      timing: 'Slow dramatic movement over 4-6 seconds',
      quality: 'cinematic',
      physics: 'smooth vertical movement with professional stabilization'
    },
    crane_down: {
      type: 'crane',
      description: 'Intimate crane movement descending to subject',
      timing: 'Gentle descent over 3-5 seconds',
      quality: 'dramatic',
      physics: 'controlled vertical movement with natural physics'
    },
    handheld_natural: {
      type: 'handheld',
      description: 'Natural handheld movement with professional stabilization',
      timing: 'Continuous natural movement',
      quality: 'natural',
      physics: 'authentic camera shake with human breathing patterns'
    },
    handheld_dynamic: {
      type: 'handheld',
      description: 'Dynamic handheld following intense action',
      timing: 'Responsive movement matching energy',
      quality: 'dramatic',
      physics: 'realistic handheld movement with professional control'
    },
    zoom_emphasis: {
      type: 'zoom',
      description: 'Subtle zoom for dramatic emphasis',
      timing: 'Controlled zoom over 1-2 seconds',
      quality: 'dramatic',
      physics: 'smooth focal length transition with natural focus'
    },
    orbit_reveal: {
      type: 'orbit',
      description: 'Orbital movement revealing character from all angles',
      timing: 'Circular movement over 4-8 seconds',
      quality: 'cinematic',
      physics: 'smooth circular motion with consistent distance'
    }
  };

  /**
   * Movement Quality Specifications
   * Based on snubroot's movement quality framework
   */
  static readonly MOVEMENT_QUALITIES: Record<string, MovementQuality> = {
    natural: {
      type: 'natural',
      description: 'Natural human movement with authentic physics',
      physics: 'realistic movement deformation, natural breathing, authentic gait and gestures',
      timing: 'Human-paced movement with natural rhythm'
    },
    energetic: {
      type: 'energetic',
      description: 'Energetic movement with dynamic expressions',
      physics: 'dynamic movement with increased tempo and animated gestures',
      timing: 'Quick, responsive movement with high energy'
    },
    slow_deliberate: {
      type: 'slow',
      description: 'Slow and deliberate movement with intention',
      physics: 'controlled movement with purposeful gestures and measured pace',
      timing: 'Deliberate pacing with thoughtful transitions'
    },
    graceful: {
      type: 'graceful',
      description: 'Graceful movement with elegant transitions',
      physics: 'fluid movement with smooth transitions and elegant posture',
      timing: 'Flowing movement with natural grace'
    },
    confident: {
      type: 'confident',
      description: 'Confident movement with authoritative presence',
      physics: 'strong posture with decisive gestures and assertive movement',
      timing: 'Purposeful movement with clear intention'
    },
    fluid: {
      type: 'fluid',
      description: 'Fluid movement with seamless transitions',
      physics: 'continuous movement with natural flow and smooth transitions',
      timing: 'Seamless movement without abrupt changes'
    }
  };

  /**
   * Professional Scene Transitions
   * Based on research into viral video structures
   */
  static readonly SCENE_TRANSITIONS: Record<string, SceneTransition> = {
    smooth_cut: {
      type: 'cut',
      description: 'Smooth cut on action for seamless continuity',
      duration: 'Instantaneous transition',
      effect: 'Cut during natural movement for invisible transition'
    },
    dissolve_time: {
      type: 'dissolve',
      description: 'Gentle dissolve indicating time passage',
      duration: '1-2 second dissolve',
      effect: 'Soft transition suggesting temporal change'
    },
    fade_emphasis: {
      type: 'fade',
      description: 'Fade to black for dramatic emphasis',
      duration: '0.5-1 second fade',
      effect: 'Strong punctuation for dramatic moments'
    },
    wipe_reveal: {
      type: 'wipe',
      description: 'Dynamic wipe revealing new information',
      duration: '1-2 second wipe',
      effect: 'Energetic transition for information reveal'
    },
    zoom_transition: {
      type: 'zoom',
      description: 'Zoom transition connecting related scenes',
      duration: '2-3 second zoom',
      effect: 'Smooth connection between different scales'
    },
    dolly_connect: {
      type: 'dolly',
      description: 'Dolly movement connecting scene elements',
      duration: '3-4 second movement',
      effect: 'Physical connection between story elements'
    }
  };

  /**
   * Audio Integration Protocols
   * Based on snubroot's audio optimization patterns
   */
  static readonly AUDIO_INTEGRATION: Record<string, AudioIntegration> = {
    dialogue: {
      type: 'dialogue',
      rules: [
        'NEVER use ALL CAPS (VEO3 spells them out)',
        'Maximum 12-15 words for 8-second segments',
        'Use lowercase or Title Case only',
        'Include colon syntax to prevent subtitles',
        'Specify expected background audio environment'
      ],
      timing: 'Synchronized with visual timing segments',
      quality: 'Professional broadcast quality with frame-perfect lip sync'
    },
    ambient: {
      type: 'ambient',
      rules: [
        'Layer multiple ambient sounds for realism',
        'Match ambient to environment type',
        'Maintain consistent audio throughout segment',
        'Balance ambient with primary audio'
      ],
      timing: 'Continuous throughout segment',
      quality: 'Natural environmental audio with spatial awareness'
    },
    music: {
      type: 'music',
      rules: [
        'Subtle background music that enhances mood',
        'Corporate/professional style for business content',
        'Never overpower dialogue or primary audio',
        'Match energy level to visual content'
      ],
      timing: 'Underlying soundtrack throughout',
      quality: 'Professional production music with appropriate licensing'
    },
    effects: {
      type: 'effects',
      rules: [
        'Use subtle interaction sounds for realism',
        'Match sound effects to visual actions',
        'Avoid overwhelming the primary audio',
        'Include natural environmental sounds'
      ],
      timing: 'Synchronized with visual actions',
      quality: 'High-quality foley and interaction sounds'
    }
  };

  /**
   * Generate advanced camera instruction with snubroot positioning syntax
   */
  static generateCameraInstruction(
    movementType: keyof typeof AdvancedVEO3Prompting.CAMERA_MOVEMENTS,
    position: string = 'professional camera operator position'
  ): string {
    const movement = this.CAMERA_MOVEMENTS[movementType];
    return `
Camera Setup: ${movement.description}
Position: ${position} (that's where the camera is)
Movement: ${movement.timing}
Quality: ${movement.quality} with ${movement.physics}
Physics: Realistic movement deformation and natural dynamics
    `.trim();
  }

  /**
   * Generate movement quality specification
   */
  static generateMovementQuality(
    qualityType: keyof typeof AdvancedVEO3Prompting.MOVEMENT_QUALITIES,
    characterAction: string
  ): string {
    const quality = this.MOVEMENT_QUALITIES[qualityType];
    return `
Character Movement: ${characterAction} with ${quality.description}
Physics: ${quality.physics}
Timing: ${quality.timing}
Constraint: ONE subtle motion per scene for consistency
    `.trim();
  }

  /**
   * Generate professional dialogue with VEO3 rules
   */
  static generateDialogue(text: string, maxWords: number = 15): string {
    // Apply critical VEO3 dialogue rules
    let processedText = text;

    // 1. Convert ALL CAPS to title case (VEO3 spells out caps)
    processedText = processedText.replace(/\b[A-Z]{2,}\b/g, (match) => {
      return match.charAt(0) + match.slice(1).toLowerCase();
    });

    // 2. Enforce word limit
    const words = processedText.split(' ').filter(w => w.length > 0);
    if (words.length > maxWords) {
      processedText = words.slice(0, maxWords).join(' ');
    }

    // 3. Format with professional delivery
    return `Professional dialogue: "${processedText}" with clear enunciation and natural pacing`;
  }

  /**
   * Generate scene transition instruction
   */
  static generateSceneTransition(
    transitionType: keyof typeof AdvancedVEO3Prompting.SCENE_TRANSITIONS,
    fromScene: string,
    toScene: string
  ): string {
    const transition = this.SCENE_TRANSITIONS[transitionType];
    return `
Transition: ${transition.description}
From: ${fromScene}
To: ${toScene}
Duration: ${transition.duration}
Effect: ${transition.effect}
    `.trim();
  }

  /**
   * Generate comprehensive audio instruction
   */
  static generateAudioInstruction(
    primaryType: keyof typeof AdvancedVEO3Prompting.AUDIO_INTEGRATION,
    content: string,
    environment: string = 'professional indoor setting'
  ): string {
    const audio = this.AUDIO_INTEGRATION[primaryType];
    return `
Primary Audio: ${content}
Environment: ${environment}
Quality: ${audio.quality}
Timing: ${audio.timing}
Rules Applied: ${audio.rules.join(', ')}
    `.trim();
  }

  /**
   * Create viral video structure with advanced prompting
   */
  static createViralStructure(
    duration: number = 56,
    segmentLength: number = 8
  ): Array<{
    segment: number;
    timing: string;
    camera: string;
    movement: string;
    transition?: string;
  }> {
    const segments = Math.ceil(duration / segmentLength);
    const structure = [];

    for (let i = 0; i < segments; i++) {
      const isOpening = i === 0;
      const isClosing = i === segments - 1;
      const isMidpoint = i === Math.floor(segments / 2);

      let cameraType: keyof typeof AdvancedVEO3Prompting.CAMERA_MOVEMENTS;
      let movementType: keyof typeof AdvancedVEO3Prompting.MOVEMENT_QUALITIES;
      let transitionType: keyof typeof AdvancedVEO3Prompting.SCENE_TRANSITIONS | undefined;

      if (isOpening) {
        cameraType = 'dolly_in';
        movementType = 'confident';
        transitionType = 'smooth_cut';
      } else if (isClosing) {
        cameraType = 'dolly_out';
        movementType = 'natural';
      } else if (isMidpoint) {
        cameraType = 'tracking_follow';
        movementType = 'energetic';
        transitionType = 'zoom_transition';
      } else {
        cameraType = i % 2 === 0 ? 'pan_follow' : 'handheld_natural';
        movementType = 'natural';
        transitionType = 'dissolve_time';
      }

      structure.push({
        segment: i + 1,
        timing: `${i * segmentLength}-${(i + 1) * segmentLength}s`,
        camera: this.generateCameraInstruction(cameraType),
        movement: this.generateMovementQuality(movementType, 'speaking to camera'),
        transition: transitionType ? this.generateSceneTransition(transitionType, `segment ${i}`, `segment ${i + 1}`) : undefined
      });
    }

    return structure;
  }

  /**
   * Apply character consistency rules from shabbirun research
   */
  static generateCharacterConsistency(
    baseCharacter: string,
    preservationElements: string[] = []
  ): string {
    const defaultPreservation = [
      'exact facial features',
      'core identity markers',
      'consistent expressions',
      'clothing and style',
      'professional demeanor'
    ];

    const allElements = [...defaultPreservation, ...preservationElements];

    return `
Character Preservation: ${baseCharacter}
PRESERVE: ${allElements.join(', ')}
Consistency Rule: Maintain identical appearance across all segments
Identity Anchors: Core characteristics must remain constant
Natural Variation: Only allow natural expression changes
    `.trim();
  }

  /**
   * Generate professional prompt with all advanced techniques applied
   */
  static generateAdvancedPrompt(config: {
    character: string;
    action: string;
    environment: string;
    dialogue?: string;
    cameraMovement?: keyof typeof AdvancedVEO3Prompting.CAMERA_MOVEMENTS;
    movementQuality?: keyof typeof AdvancedVEO3Prompting.MOVEMENT_QUALITIES;
    duration?: number;
  }): string {
    const cameraType = config.cameraMovement || 'tracking_follow';
    const movementType = config.movementQuality || 'natural';

    let prompt = `
${config.character} in ${config.environment}
${config.action}

${this.generateCameraInstruction(cameraType)}

${this.generateMovementQuality(movementType, config.action)}

${this.generateCharacterConsistency(config.character)}
    `.trim();

    if (config.dialogue) {
      prompt += `\n\n${this.generateDialogue(config.dialogue)}`;
      prompt += `\n\n${this.generateAudioInstruction('dialogue', config.dialogue, config.environment)}`;
    }

    return prompt;
  }
}

/**
 * Preset configurations for common viral content types
 */
export const VIRAL_PRESETS = {
  insurance_expert: {
    character: 'Professional insurance advisor, 30-35 years old, confident expression',
    basePrompts: {
      hook: 'Attention-grabbing opening about insurance savings',
      explanation: 'Clear explanation of insurance benefits',
      call_to_action: 'Direct engagement request with contact information'
    },
    cameraMovements: ['dolly_in', 'tracking_follow', 'dolly_out'] as const,
    movementQualities: ['confident', 'natural', 'professional'] as const
  },

  lifestyle_influencer: {
    character: 'Attractive lifestyle influencer, 25-30 years old, engaging personality',
    basePrompts: {
      hook: 'Lifestyle tip that changes everything',
      demonstration: 'Step-by-step demonstration with enthusiasm',
      conclusion: 'Encouraging conclusion with social media engagement'
    },
    cameraMovements: ['handheld_natural', 'tracking_follow', 'zoom_emphasis'] as const,
    movementQualities: ['energetic', 'graceful', 'confident'] as const
  },

  educational_content: {
    character: 'Professional educator, 35-45 years old, authoritative presence',
    basePrompts: {
      introduction: 'Clear introduction of educational topic',
      explanation: 'Detailed explanation with visual aids',
      summary: 'Concise summary with key takeaways'
    },
    cameraMovements: ['dolly_in', 'pan_follow', 'crane_down'] as const,
    movementQualities: ['natural', 'confident', 'deliberate'] as const
  }
};