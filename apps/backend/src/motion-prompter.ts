/**
 * Motion Prompter - Adds dynamic movement to prompts to avoid "cardboard cutout" effect
 * Key insight from YouTube guide: Static prompts create flat, lifeless images
 */

export interface MotionConfig {
  intensity: 'subtle' | 'moderate' | 'dynamic' | 'extreme';
  type: 'human' | 'object' | 'camera' | 'environmental';
  platform: 'tiktok' | 'instagram' | 'youtube';
}

export class MotionPrompter {
  // Motion vocabulary organized by intensity
  private motionLibrary = {
    subtle: {
      human: ['gently shifting', 'breathing naturally', 'slight head turn', 'soft eye movement'],
      object: ['subtle sway', 'gentle vibration', 'slight rotation', 'soft pulsing'],
      camera: ['slow zoom', 'gentle drift', 'subtle tilt', 'soft focus pull'],
      environmental: ['light breeze', 'soft shadows moving', 'gentle particles', 'subtle light shift']
    },
    moderate: {
      human: ['walking steadily', 'gesturing naturally', 'turning to camera', 'reaching forward'],
      object: ['rotating smoothly', 'floating gently', 'transforming slowly', 'expanding gradually'],
      camera: ['steady pan', 'smooth tracking', 'moderate zoom', 'orbiting slowly'],
      environmental: ['wind blowing', 'water rippling', 'clouds drifting', 'leaves rustling']
    },
    dynamic: {
      human: ['running energetically', 'jumping with excitement', 'dancing rhythmically', 'spinning quickly'],
      object: ['flying through space', 'exploding outward', 'morphing rapidly', 'colliding dramatically'],
      camera: ['fast whip pan', 'quick cuts', 'dramatic zoom', 'shaking intensely'],
      environmental: ['storm brewing', 'waves crashing', 'lightning flashing', 'fire blazing']
    },
    extreme: {
      human: ['explosive acrobatics', 'superhero landing', 'Matrix-style dodge', 'parkour sequence'],
      object: ['shattering violently', 'teleporting instantly', 'disintegrating rapidly', 'warping reality'],
      camera: ['360 spin', 'vertigo zoom', 'bullet time', 'impossible angles'],
      environmental: ['earthquake shaking', 'tornado spinning', 'apocalyptic chaos', 'time distortion']
    }
  };

  /**
   * Enhances a static prompt with dynamic motion
   */
  async enhancePrompt(
    staticPrompt: string,
    character?: any,
    config: Partial<MotionConfig> = {}
  ): Promise<string> {
    const motionConfig: MotionConfig = {
      intensity: config.intensity || 'moderate',
      type: config.type || this.detectPromptType(staticPrompt),
      platform: config.platform || 'tiktok'
    };

    // Detect and replace static words
    let enhancedPrompt = this.replaceStaticTerms(staticPrompt);

    // Add motion descriptors
    enhancedPrompt = this.injectMotion(enhancedPrompt, motionConfig);

    // Add platform-specific enhancements
    enhancedPrompt = this.addPlatformOptimizations(enhancedPrompt, motionConfig.platform);

    // Add character-specific motion if available
    if (character?.personality) {
      enhancedPrompt = this.addCharacterMotion(enhancedPrompt, character);
    }

    return enhancedPrompt;
  }

  /**
   * Generates motion-focused edit prompts for existing images
   */
  generateMotionEditPrompt(script: string): string {
    const actions = this.extractActionsFromScript(script);

    if (actions.length === 0) {
      // Fallback to generic motion
      return 'Add dynamic motion blur, natural movement, and kinetic energy to the scene';
    }

    // Build specific motion edit
    return `Transform to show ${actions[0]}, with motion blur on moving elements,
            dynamic composition, and natural movement flow`;
  }

  /**
   * Creates variation prompts with different motion styles
   */
  async generateMotionVariations(basePrompt: string, count: number = 3): Promise<string[]> {
    const variations: string[] = [];
    const intensities: Array<MotionConfig['intensity']> = ['subtle', 'moderate', 'dynamic'];

    for (let i = 0; i < count; i++) {
      const config: Partial<MotionConfig> = {
        intensity: intensities[i % intensities.length]
      };

      variations.push(await this.enhancePrompt(basePrompt, undefined, config));
    }

    return variations;
  }

  private replaceStaticTerms(prompt: string): string {
    const replacements = {
      // Static postures → Dynamic actions
      'standing still': 'moving dynamically',
      'standing': 'striding forward',
      'sitting': 'leaning forward actively',
      'holding': 'reaching for',
      'looking at': 'turning toward',
      'wearing': 'adjusting',
      'posing': 'moving naturally',

      // Static descriptions → Dynamic descriptions
      'stationary': 'moving',
      'still': 'in motion',
      'fixed': 'shifting',
      'motionless': 'animated',
      'frozen': 'fluid',

      // Weak verbs → Strong action verbs
      'is': 'becomes',
      'has': 'gains',
      'shows': 'reveals dramatically',
      'displays': 'demonstrates actively'
    };

    let enhanced = prompt;
    for (const [staticWord, dynamic] of Object.entries(replacements)) {
      enhanced = enhanced.replace(new RegExp(`\\b${staticWord}\\b`, 'gi'), dynamic);
    }

    return enhanced;
  }

  private injectMotion(prompt: string, config: MotionConfig): string {
    const motions = this.motionLibrary[config.intensity][config.type];
    const selectedMotion = motions[Math.floor(Math.random() * motions.length)];

    // Add motion at strategic points
    const injectionPoints = [
      { marker: ',', prefix: `, ${selectedMotion},` },
      { marker: '.', prefix: ` while ${selectedMotion}.` },
      { marker: 'with', prefix: `with ${selectedMotion} and` }
    ];

    for (const point of injectionPoints) {
      if (prompt.includes(point.marker)) {
        return prompt.replace(point.marker, point.prefix);
      }
    }

    // Fallback: append motion
    return `${prompt}, ${selectedMotion}`;
  }

  private detectPromptType(prompt: string): MotionConfig['type'] {
    const lowercase = prompt.toLowerCase();

    if (lowercase.match(/person|people|man|woman|character|human/)) {
      return 'human';
    }
    if (lowercase.match(/product|object|item|thing|device/)) {
      return 'object';
    }
    if (lowercase.match(/scene|landscape|environment|background/)) {
      return 'environmental';
    }

    return 'camera'; // Default to camera movement
  }

  private addPlatformOptimizations(prompt: string, platform: string): string {
    const optimizations: Record<string, string> = {
      tiktok: ', vertical format with eye-catching movement in first frame',
      instagram: ', square format with smooth, aesthetic motion',
      youtube: ', cinematic widescreen with professional camera movement'
    };

    return prompt + (optimizations[platform] || '');
  }

  private addCharacterMotion(prompt: string, character: any): string {
    const personalityMotions: Record<string, string> = {
      energetic: 'bouncing with enthusiasm',
      calm: 'moving with serene grace',
      mysterious: 'shifting enigmatically',
      funny: 'wobbling comically',
      professional: 'gesturing confidently',
      casual: 'swaying relaxedly'
    };

    const motion = personalityMotions[character.personality] || 'moving characteristically';
    return prompt.replace(/moving \w+|in motion/, motion);
  }

  private extractActionsFromScript(script: string): string[] {
    // Look for action verbs in script
    const actionPattern = /\b(running|jumping|walking|dancing|reaching|grabbing|throwing|spinning|turning|moving)\b/gi;
    const matches = script.match(actionPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Analyzes prompt for motion quality score
   */
  analyzeMotionQuality(prompt: string): number {
    let score = 0;

    // Check for motion verbs (40 points)
    const motionVerbs = prompt.match(/\b(run|jump|walk|dance|fly|spin|move|flow|drift|float)\w*/gi);
    if (motionVerbs) {
      score += Math.min(motionVerbs.length * 10, 40);
    }

    // Check for motion descriptors (30 points)
    const hasDescriptors = /dynamic|kinetic|flowing|moving|active|energetic/i.test(prompt);
    if (hasDescriptors) score += 30;

    // Penalize static words (minus 20 points)
    const hasStatic = /still|static|frozen|motionless|stationary/i.test(prompt);
    if (hasStatic) score -= 20;

    // Bonus for specific motion types (30 points)
    const hasSpecificMotion = /blur|trail|streak|wave|ripple|shake/i.test(prompt);
    if (hasSpecificMotion) score += 30;

    return Math.max(0, Math.min(100, score));
  }
}

export default MotionPrompter;