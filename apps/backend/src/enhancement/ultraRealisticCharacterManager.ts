import { VertexAINanoBananaService } from '../services/vertexAINanoBanana';
import { NanoBananaVEO3Pipeline, UltraRealisticConfig, VideoResult } from '../pipelines/nanoBananaVeo3Pipeline';
import { Character } from '../characters/types';
import { quoteMotoInfluencer } from '../characters/quotemoto-baddie';

export interface ZhoTechnique {
  id: number;
  name: string;
  prompt: string;
  useCase: string;
  viralPotential: 'low' | 'medium' | 'high' | 'extreme';
  appropriateFor: string[];
  avoidFor: string[];
}

export interface CharacterConsistencyConfig {
  useGreenScreen?: boolean;
  preserveFacialFeatures?: boolean;
  maintainLighting?: boolean;
  useFirstFrameReference?: boolean;
  multiAngleGeneration?: boolean;
  shotTypes?: ('headshot' | 'medium' | 'full-body-standing' | 'full-body-seated' | 'three-quarter')[];
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';

  // Advanced patterns from research
  characterStyle?: 'realistic' | 'anime-cel-shaded' | 'professional' | 'lifestyle';
  motionConstraint?: 'one-subtle-motion' | 'natural-movement' | 'energetic' | 'minimal';
  dialogueOptimization?: boolean; // Apply VEO3 dialogue rules
  sceneTransitions?: 'smooth-cut' | 'dissolve' | 'fade' | 'wipe' | 'none';
  preservationLevel?: 'strict' | 'moderate' | 'flexible';
}

export interface UltraRealisticVideoRequest {
  character: Character;
  scenes: string[];
  config: UltraRealisticConfig;
  characterConsistency?: CharacterConsistencyConfig;
  zhoTechniques?: number[]; // Array of ZHO technique IDs to apply
  storyStructure?: 'viral' | 'commercial' | 'educational' | 'custom';
}

/**
 * Ultra-Realistic Character Manager
 *
 * Orchestrates the complete pipeline for generating ultra-realistic videos
 * with perfect character consistency using our optimized techniques
 */
export class UltraRealisticCharacterManager {
  private pipeline: NanoBananaVEO3Pipeline;
  private nanoBanana: VertexAINanoBananaService;

  // ZHO Techniques Database
  private zhoTechniques: Map<number, ZhoTechnique> = new Map([
    [1, {
      id: 1,
      name: 'Image-to-Figure Transformation',
      prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible',
      useCase: 'Viral collectible content',
      viralPotential: 'extreme',
      appropriateFor: ['viral content', 'product showcase', 'brand mascots'],
      avoidFor: ['realistic portraits', 'professional headshots']
    }],
    [31, {
      id: 31,
      name: 'Universal Style-to-Realism',
      prompt: 'turn this illustration into realistic version',
      useCase: 'Style transformation',
      viralPotential: 'high',
      appropriateFor: ['anime to real', 'cartoon to real', 'artistic styles'],
      avoidFor: ['already realistic content', 'natural portraits']
    }],
    [23, {
      id: 23,
      name: 'Cyber Baby Generation',
      prompt: '生成图中两人物所生孩子的样子，专业摄影',
      useCase: 'Unique engagement content',
      viralPotential: 'high',
      appropriateFor: ['couple content', 'family planning', 'entertainment'],
      avoidFor: ['professional content', 'brand videos']
    }],
    [18, {
      id: 18,
      name: 'Funko Pop Transformation',
      prompt: 'Transform the person in the photo into the style of a Funko Pop figure packaging box, presented in an isometric perspective. Label the packaging with the title \'BRAND_NAME\'. Inside the box, showcase the figure based on the person in the photo, accompanied by their essential items. Next to the box, also display the actual figure itself outside of the packaging, rendered in a realistic and lifelike style.',
      useCase: 'Collectible brand content',
      viralPotential: 'high',
      appropriateFor: ['brand mascots', 'collectible content', 'gaming'],
      avoidFor: ['serious business content', 'medical content']
    }],
    [25, {
      id: 25,
      name: 'Amateur-to-Professional Photography',
      prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin, standing confidently against a bold green gradient background. Dramatic, cinematic lighting highlights her facial structure, evoking the look of a luxury fashion magazine cover. Editorial photography style, high-detail, 4K resolution, symmetrical composition, minimalistic background',
      useCase: 'Photo enhancement',
      viralPotential: 'medium',
      appropriateFor: ['photo restoration', 'professional headshots', 'portfolio'],
      avoidFor: ['natural lifestyle content', 'candid moments']
    }]
  ]);

  constructor() {
    this.pipeline = new NanoBananaVEO3Pipeline();
    this.nanoBanana = new VertexAINanoBananaService();
  }

  /**
   * Generate ultra-realistic video with complete character consistency
   */
  async generateUltraRealisticVideo(request: UltraRealisticVideoRequest): Promise<VideoResult> {
    console.log('🚀 Starting ultra-realistic video generation with character consistency...');

    try {
      // Step 1: Optimize character for realism
      const optimizedCharacter = this.optimizeCharacterForRealism(request.character);

      // Step 2: Apply character consistency techniques
      const characterLibrary = await this.generateCharacterLibrary(
        optimizedCharacter,
        request.characterConsistency || {}
      );

      // Step 3: Create story structure
      const storyboard = this.createStoryStructure(request.scenes, request.storyStructure);

      // Step 4: Apply ZHO techniques if specified
      if (request.zhoTechniques && request.zhoTechniques.length > 0) {
        await this.applyZhoTechniques(
          characterLibrary,
          request.zhoTechniques
        );
      }

      // Step 5: Generate video using pipeline
      const result = await this.pipeline.generateUltraRealisticVideo(
        optimizedCharacter,
        storyboard,
        request.config
      );

      console.log('✅ Ultra-realistic video generation completed successfully!');
      return result;

    } catch (error) {
      console.error('❌ Ultra-realistic video generation failed:', error);
      throw error;
    }
  }

  /**
   * Optimize character using our "less is more" discoveries
   */
  private optimizeCharacterForRealism(character: Character): Character {
    // Create optimized version of character
    const optimized = { ...character };

    // Apply our key optimizations
    if (optimized.generateBasePrompt) {
      const originalPrompt = optimized.generateBasePrompt.bind(optimized);

      optimized.generateBasePrompt = (context?: string) => {
        let prompt = originalPrompt(context);

        // Apply our discovered optimizations
        prompt = prompt
          .replace('Flawless makeup', 'Professional natural makeup')
          .replace('stunning', 'attractive professional')
          .replace('perfect skin texture', 'natural skin texture');

        // Replace detailed imperfection lists with simplified realism
        const detailedRealismRegex = /SKIN REALISM[\s\S]*?(?=\n\n|CONTEXT:|$)/;
        if (detailedRealismRegex.test(prompt)) {
          prompt = prompt.replace(detailedRealismRegex, `NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections`);
        }

        // Add character preservation instruction
        if (!prompt.includes('PRESERVE:')) {
          prompt = `PRESERVE: Exact facial features and identity markers\n${prompt}`;
        }

        return prompt;
      };
    }

    return optimized;
  }

  /**
   * Generate character library with multiple angles and shot types for consistency
   */
  private async generateCharacterLibrary(
    character: Character,
    config: CharacterConsistencyConfig
  ): Promise<{ [angleOrShot: string]: string }> {
    const library: { [angleOrShot: string]: string } = {};

    // Determine what to generate - angles or shot types
    if (config.shotTypes && config.shotTypes.length > 0) {
      // Generate specific shot types
      for (const shotType of config.shotTypes) {
        console.log(`📸 Generating ${shotType} shot for character library...`);

        let prompt = '';

        // Check if we have a proper character object with methods
        if (typeof character.generateBasePrompt === 'function') {
          prompt = character.generateBasePrompt(`${shotType} shot`);
          console.log(`✅ Generated prompt from character method for ${shotType}`);
        } else {
          // Character object lost methods - generate prompt from data
          console.log(`⚠️ Character object missing methods, using data for ${shotType}`);
          prompt = this.generatePromptFromCharacterData(character, shotType);
        }

        // Apply shot type specific modifications
        prompt = this.applyShotTypeModifications(prompt, shotType, config);

        // Apply advanced consistency patterns from research
        prompt = this.applyAdvancedConsistencyPatterns(prompt, config);

        // Apply green screen method if enabled
        if (config.useGreenScreen && shotType !== 'headshot') {
          prompt += '\n\nBackground: Solid bright green background (#00FF00) for easy character extraction and background replacement. Clean green screen setup with even lighting to avoid shadows or color spill.';
        }

        library[shotType] = prompt;
      }

      return library;
    } else {
      // Generate traditional angles for backward compatibility
      const angles = config.multiAngleGeneration
        ? ['front', 'three_quarter_left', 'three_quarter_right', 'profile_left', 'profile_right']
        : ['front', 'three_quarter_left'];

      for (const angle of angles) {
        console.log(`📸 Generating ${angle} view for character consistency...`);

        let prompt = '';

      // Check if we have a proper character object with methods
      if (typeof character.generateBasePrompt === 'function') {
        prompt = character.generateBasePrompt(`${angle} view`);
        console.log(`✅ Generated prompt from character method for ${angle}`);
      } else {
        // Character object lost methods - generate prompt from data
        prompt = this.generatePromptFromCharacterData(character, `${angle} view`);
        console.log(`✅ Generated prompt from character data for ${angle}`);
      }

      // Apply green screen method if enabled
      if (config.useGreenScreen) {
        prompt += '\n\nBackground: Solid bright green background for easy character extraction and background replacement';
      }

      // Apply advanced consistency patterns from research
      prompt = this.applyAdvancedConsistencyPatterns(prompt, config);

      // Add consistency preservation
      if (config.preserveFacialFeatures) {
        prompt = `PRESERVE: Exact facial features, eye color, facial structure, and identity markers\n${prompt}`;
      }

      try {
        const result = await this.nanoBanana.generateImage(prompt, {
          temperature: 0.3, // Optimal for consistency
          numImages: 1
        });

        if (result && result.length > 0) {
          library[angle] = result[0].imagePath;
        }

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to generate ${angle} view:`, error);
      }
    }

    return library;
    }
  }

  /**
   * Generate prompt from character data when methods are not available
   */
  private generatePromptFromCharacterData(character: any, context: string): string {
    // Extract character data
    const profile = character.profile || {};
    const identity = character.characterIdentity || {};
    const appearance = profile.appearance || {};
    const features = identity.coreFeatures || {};

    // Base character description
    let prompt = `Ultra-photorealistic portrait of ${profile.name || 'professional woman'}, `;
    prompt += `${profile.age || 26}-year-old ${profile.profession || 'insurance expert'}.

PHYSICAL FEATURES:
- ${appearance.ethnicity || 'Mixed heritage'} with ${appearance.skinTone || 'warm skin tone'}
- ${features.eyeShape || 'Large almond-shaped'} ${features.eyeColor || 'amber-brown eyes'}
- ${features.faceShape || 'Oval face'} with ${features.jawline || 'defined jawline'}
- ${features.lipShape || 'Naturally full lips'}
- ${features.hairColor || 'Honey-brown hair'} that is ${features.hairTexture || 'layered and wavy'}

NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

CONTEXT: ${context}
Professional photography, natural lighting, confident expression`;

    return prompt;
  }

  /**
   * Apply ZHO techniques strategically
   */
  private async applyZhoTechniques(
    characterLibrary: { [angle: string]: string },
    techniqueIds: number[]
  ): Promise<{ [angle: string]: string }> {
    const enhanced: { [angle: string]: string } = { ...characterLibrary };

    for (const techniqueId of techniqueIds) {
      const technique = this.zhoTechniques.get(techniqueId);

      if (!technique) {
        console.warn(`ZHO technique ${techniqueId} not found`);
        continue;
      }

      console.log(`🎭 Applying ZHO technique #${techniqueId}: ${technique.name}`);

      // Apply technique to front-facing image (primary)
      if (enhanced.front) {
        try {
          // Only apply if appropriate for the content type
          if (this.shouldApplyZhoTechnique(technique, 'realistic_character')) {
            const enhancedPrompt = technique.prompt.replace('BRAND_NAME', 'QuoteMoto');

            const result = await this.nanoBanana.generateImage(enhancedPrompt, {
              temperature: 0.3,
              numImages: 1
            });

            if (result && result.length > 0) {
              enhanced[`front_zho_${techniqueId}`] = result[0].imagePath;
            }
          } else {
            console.log(`⚠️ Skipping ZHO technique #${techniqueId} - not appropriate for realistic character`);
          }

        } catch (error) {
          console.error(`Failed to apply ZHO technique #${techniqueId}:`, error);
        }
      }
    }

    return enhanced;
  }

  /**
   * Check if ZHO technique should be applied
   */
  private shouldApplyZhoTechnique(technique: ZhoTechnique, contentType: string): boolean {
    // Our discovery: Don't use ZHO on already realistic content unless it's for viral transformation
    if (contentType === 'realistic_character') {
      return technique.appropriateFor.includes('viral content') &&
             !technique.avoidFor.includes('realistic portraits');
    }

    return true;
  }

  /**
   * Create story structure based on type
   */
  private createStoryStructure(scenes: string[], type: string = 'viral'): string[] {
    switch (type) {
      case 'viral':
        return this.createViralStoryStructure(scenes);
      case 'commercial':
        return this.createCommercialStoryStructure(scenes);
      case 'educational':
        return this.createEducationalStoryStructure(scenes);
      default:
        return scenes;
    }
  }

  /**
   * Create viral story structure (3-act, 56 seconds)
   */
  private createViralStoryStructure(scenes: string[]): string[] {
    const viralStructure = [
      // Act 1: Setup (16 seconds - 2 segments)
      "Opening hook: Attention-grabbing introduction with confident smile and welcoming gesture",
      "Problem setup: Present the challenge with concerned expression and relatable gestures",

      // Act 2: Development (24 seconds - 3 segments)
      "Solution preview: Excited demonstration of the solution with dynamic movement",
      "Benefits showcase: Explaining advantages with clear gestures and examples",
      "Social proof: Success story or testimonial with authentic emotion",

      // Act 3: Resolution (16 seconds - 2 segments)
      "Call to action: Direct engagement request with clear instructions",
      "Brand reinforcement: QuoteMoto logo and contact information with confident closing"
    ];

    // If custom scenes provided, integrate them into structure
    if (scenes.length > 0) {
      const integrated = [];
      for (let i = 0; i < Math.min(scenes.length, viralStructure.length); i++) {
        integrated.push(`${viralStructure[i]}: ${scenes[i]}`);
      }
      return integrated;
    }

    return viralStructure;
  }

  /**
   * Create commercial story structure
   */
  private createCommercialStoryStructure(scenes: string[]): string[] {
    const structure = [
      "Brand introduction: Professional presentation of QuoteMoto services",
      "Problem identification: Common insurance challenges customers face",
      "Solution demonstration: How QuoteMoto solves these problems",
      "Benefits overview: Cost savings and coverage advantages",
      "Customer testimonial: Real success story with emotional impact",
      "Call to action: Clear steps to get a quote",
      "Contact information: Logo, website, and contact details"
    ];

    return scenes.length > 0 ? scenes : structure.slice(0, 7); // Max 7 segments for 56 seconds
  }

  /**
   * Create educational story structure
   */
  private createEducationalStoryStructure(scenes: string[]): string[] {
    const structure = [
      "Topic introduction: Clear explanation of what will be covered",
      "Key concept 1: First important principle with examples",
      "Key concept 2: Second important principle with demonstrations",
      "Key concept 3: Third principle with practical applications",
      "Real-world example: Practical case study or demonstration",
      "Summary: Recap of main points and key takeaways",
      "Next steps: What viewers should do with this information"
    ];

    return scenes.length > 0 ? scenes : structure;
  }

  /**
   * Get recommended ZHO techniques for content type
   */
  getRecommendedZhoTechniques(contentType: 'viral' | 'commercial' | 'educational'): number[] {
    const recommendations = {
      viral: [1, 18, 23], // Figure transformation, Funko Pop, Cyber Baby
      commercial: [25], // Professional photography enhancement
      educational: [] // No ZHO for educational content
    };

    return recommendations[contentType] || [];
  }

  /**
   * Validate character for ultra-realistic generation
   */
  validateCharacterForRealism(character: Character): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!character.generateBasePrompt) {
      issues.push('Character must have generateBasePrompt method');
    }

    // Check for contradictory prompts
    if (character.generateBasePrompt) {
      const prompt = character.generateBasePrompt();

      if (prompt.includes('flawless') && prompt.includes('imperfections')) {
        issues.push('Character prompt contains contradictory elements (flawless + imperfections)');
      }

      if (prompt.includes('perfect') && prompt.includes('natural')) {
        issues.push('Character prompt may have contradictory perfection vs natural elements');
      }

      if (!prompt.includes('professional') && !prompt.includes('attractive')) {
        issues.push('Character should include professional or attractive descriptors for best results');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate Aria QuoteMoto demo video
   */
  /**
   * Apply advanced character consistency patterns from research
   */
  private applyAdvancedConsistencyPatterns(
    prompt: string,
    config: CharacterConsistencyConfig
  ): string {
    let enhancedPrompt = prompt;

    // Apply character style patterns (from shabbirun research)
    if (config.characterStyle) {
      enhancedPrompt = this.applyCharacterStylePattern(enhancedPrompt, config.characterStyle);
    }

    // Apply motion constraint patterns (ONE subtle motion rule)
    if (config.motionConstraint) {
      enhancedPrompt = this.applyMotionConstraint(enhancedPrompt, config.motionConstraint);
    }

    // Apply VEO3 dialogue optimization
    if (config.dialogueOptimization) {
      enhancedPrompt = this.applyDialogueOptimization(enhancedPrompt);
    }

    // Apply preservation level settings
    if (config.preservationLevel) {
      enhancedPrompt = this.applyPreservationLevel(enhancedPrompt, config.preservationLevel);
    }

    // Apply scene transition patterns (using generateSceneTransition function)
    if (config.sceneTransitions && config.sceneTransitions !== 'none') {
      const transition = this.generateSceneTransition(
        config.sceneTransitions,
        'current scene',
        'next scene'
      );
      enhancedPrompt += `\n\nSCENE TRANSITION:\n${transition}`;
    }

    return enhancedPrompt;
  }

  /**
   * Apply character style patterns based on research findings
   */
  private applyCharacterStylePattern(prompt: string, style: string): string {
    const stylePatterns = {
      'realistic': `
REALISM ENHANCEMENT:
- Ultra-photorealistic human appearance
- Natural skin texture with visible pores
- Authentic facial asymmetry and expressions
- Professional quality with natural imperfections`,

      'anime-cel-shaded': `
ANIME STYLE ENHANCEMENT:
- 2D cel-shaded anime character style
- Clean linework and expressive features
- Bright, saturated colors with sharp edges
- Minimal background to focus on character`,

      'professional': `
PROFESSIONAL ENHANCEMENT:
- Corporate business attire and styling
- Confident, authoritative presence
- Professional lighting and composition
- Brand-appropriate appearance and demeanor`,

      'lifestyle': `
LIFESTYLE ENHANCEMENT:
- Approachable, friendly appearance
- Natural, relaxed styling and poses
- Authentic, relatable expressions
- Lifestyle-appropriate clothing and setting`
    };

    return prompt + '\n\n' + (stylePatterns[style as keyof typeof stylePatterns] || '');
  }

  /**
   * Apply motion constraint patterns (critical for VEO3 consistency)
   */
  private applyMotionConstraint(prompt: string, constraint: string): string {
    const motionPatterns = {
      'one-subtle-motion': `
MOTION CONSTRAINT (CRITICAL):
- ONE subtle motion per scene only
- Options: gentle head nod, slight smile, hand gesture, eye movement
- Maintain consistent character positioning
- Avoid multiple simultaneous movements`,

      'natural-movement': `
NATURAL MOVEMENT:
- Authentic human movement patterns
- Natural breathing and micro-expressions
- Realistic physics governing all actions
- Fluid, organic movement quality`,

      'energetic': `
ENERGETIC MOVEMENT:
- Dynamic gestures and expressions
- Animated body language and enthusiasm
- Higher energy level with purposeful movement
- Engaging, vibrant character presentation`,

      'minimal': `
MINIMAL MOVEMENT:
- Extremely subtle or no movement
- Focus on static character presentation
- Minimal facial expression changes
- Statue-like stability for consistency`
    };

    return prompt + '\n\n' + (motionPatterns[constraint as keyof typeof motionPatterns] || '');
  }

  /**
   * Apply VEO3 dialogue optimization rules
   */
  private applyDialogueOptimization(prompt: string): string {
    // Apply critical VEO3 dialogue rules discovered from research
    let optimized = prompt;

    // Fix caps lock issues
    optimized = optimized.replace(/"([^"]*?)"/g, (match, dialogue) => {
      if (dialogue.length > 3 && dialogue === dialogue.toUpperCase()) {
        return `"${dialogue.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}"`;
      }
      return match;
    });

    return optimized + `

VEO3 DIALOGUE OPTIMIZATION:
- NEVER use ALL CAPS in dialogue (VEO3 spells them out)
- Maximum 12-15 words per dialogue segment
- Use natural lowercase or Title Case only
- Include colon syntax for audio: "Character says: 'dialogue here'"
- Professional broadcast quality speech patterns`;
  }

  /**
   * Apply preservation level settings
   */
  private applyPreservationLevel(prompt: string, level: string): string {
    const preservationLevels = {
      'strict': `
STRICT PRESERVATION:
- PRESERVE: Exact facial features, bone structure, eye color, hair texture
- Maintain identical lighting conditions across all segments
- Keep consistent camera angles and positioning
- Zero deviation from established character appearance`,

      'moderate': `
MODERATE PRESERVATION:
- PRESERVE: Core facial features and identity markers
- Allow natural expression variations
- Maintain consistent overall appearance
- Permit subtle lighting and angle adjustments`,

      'flexible': `
FLEXIBLE PRESERVATION:
- PRESERVE: Basic character identity and recognizability
- Allow natural expression and pose variations
- Permit environmental and lighting changes
- Focus on maintaining character essence over exact details`
    };

    return prompt + '\n\n' + (preservationLevels[level as keyof typeof preservationLevels] || '');
  }

  /**
   * Generate scene transition instruction based on research
   */
  private generateSceneTransition(
    transitionType: string,
    fromScene: string,
    toScene: string
  ): string {
    const transitions = {
      'smooth-cut': `Cut on action during natural movement from "${fromScene}" to "${toScene}" for invisible transition`,
      'dissolve': `Gentle 1-2 second dissolve indicating progression from "${fromScene}" to "${toScene}"`,
      'fade': `0.5-1 second fade to black for dramatic emphasis between "${fromScene}" and "${toScene}"`,
      'wipe': `Dynamic 1-2 second wipe revealing transition from "${fromScene}" to "${toScene}"`,
      'none': 'Direct cut without special transition effects'
    };

    return transitions[transitionType as keyof typeof transitions] || 'Direct cut transition';
  }

  /**
   * Apply shot type specific modifications to the prompt
   */
  private applyShotTypeModifications(
    prompt: string,
    shotType: string,
    config: CharacterConsistencyConfig
  ): string {
    let modifiedPrompt = prompt;

    // Add shot-specific composition instructions
    const shotModifications = {
      'headshot': '\n\nSHOT COMPOSITION: Professional headshot from shoulders up, direct eye contact with camera, corporate business attire visible',
      'medium': '\n\nSHOT COMPOSITION: Medium shot from waist up, professional posture with hands visible, business attire clearly shown, confident stance',
      'full-body-standing': '\n\nSHOT COMPOSITION: Full body professional shot standing confidently, complete business outfit visible from head to toe, professional stance with good posture',
      'full-body-seated': '\n\nSHOT COMPOSITION: Full body shot seated professionally at consultation desk or table, professional attire visible, welcoming posture, hands positioned naturally on desk or arms of chair',
      'three-quarter': '\n\nSHOT COMPOSITION: Three-quarter shot from waist up, professional posture with hands visible, business attire clearly shown, confident stance'
    };

    // Apply the modification for this shot type
    if (shotModifications[shotType as keyof typeof shotModifications]) {
      modifiedPrompt += shotModifications[shotType as keyof typeof shotModifications];
    }

    // Add aspect ratio guidance if specified
    if (config.aspectRatio) {
      modifiedPrompt += `\n\nASPECT RATIO: ${config.aspectRatio} - optimized for ${this.getAspectRatioUsage(config.aspectRatio)}`;
    }

    // Add technical requirements for shot type
    modifiedPrompt += `

TECHNICAL REQUIREMENTS:
- Ultra-high resolution for professional use
- Professional lighting setup enhancing natural features
- Sharp focus throughout the image
- Commercial photography quality
- Perfect for VEO3 video generation as firstFrame input

AVOID: over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed`;

    return modifiedPrompt;
  }

  /**
   * Get usage description for aspect ratio
   */
  private getAspectRatioUsage(aspectRatio: string): string {
    const usageMap = {
      '9:16': 'TikTok/Instagram Reels vertical content',
      '16:9': 'YouTube/horizontal platform content',
      '1:1': 'Instagram square posts and LinkedIn',
      '4:5': 'Instagram portrait posts and stories'
    };
    return usageMap[aspectRatio as keyof typeof usageMap] || 'multi-platform content';
  }

  async generateAriaDemo(
    config: UltraRealisticConfig = {}
  ): Promise<VideoResult> {
    const defaultScenes = [
      "Introducing QuoteMoto insurance comparison service with confident smile",
      "Explaining how customers save money on insurance with animated gestures",
      "Demonstrating the easy quote process with professional presentation",
      "Showing customer testimonials and success stories with authentic emotion",
      "Encouraging viewers to get their free quote with clear call-to-action"
    ];

    return this.generateUltraRealisticVideo({
      character: quoteMotoInfluencer,
      scenes: defaultScenes,
      config: {
        platform: 'youtube',
        aspectRatio: '16:9',
        enhanceWithTopaz: true,
        ...config
      },
      characterConsistency: {
        useGreenScreen: false, // Aria already optimized
        preserveFacialFeatures: true,
        maintainLighting: true,
        multiAngleGeneration: false
      },
      storyStructure: 'commercial'
    });
  }
}