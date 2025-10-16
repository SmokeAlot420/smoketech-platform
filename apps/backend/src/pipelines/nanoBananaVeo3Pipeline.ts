import { VertexAINanoBananaService } from '../services/vertexAINanoBanana';
import { VEO3Service } from '../services/veo3Service';
import { Character } from '../characters/types';
import { FFmpegVideoStitcher } from './ffmpegStitcher';
import { TopazVEO3Enhancer } from '../enhancement/topazEnhancer';

export interface ImageResult {
  imagePath: string;
  angle: string;
  prompt: string;
  success: boolean;
  error?: string;
}

export interface VideoSegment {
  videoPath: string;
  duration: number;
  scene: string;
  success: boolean;
  error?: string;
}

export interface VideoResult {
  videoPath: string;
  duration: number;
  segments: VideoSegment[];
  enhanced: boolean;
  success: boolean;
  error?: string;
}

export interface UltraRealisticConfig {
  useZhoTechniques?: boolean;
  enhanceWithTopaz?: boolean;
  targetDuration?: number; // in seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  platform?: 'tiktok' | 'youtube' | 'instagram';
}

/**
 * Ultra-Realistic Video Generation Pipeline
 * Combines NanoBanana's optimized image generation with VEO3's video capabilities
 *
 * Architecture:
 * 1. NanoBanana: Generate ultra-realistic base images with optimized prompts
 * 2. VEO3: Create 8-second video segments using JSON prompting
 * 3. FFmpeg: Stitch segments with xfade transitions
 * 4. Topaz: Enhance to 4K quality (optional)
 */
export class NanoBananaVEO3Pipeline {
  private nanoBanana: VertexAINanoBananaService;
  private veo3: VEO3Service;
  private stitcher: FFmpegVideoStitcher;
  private enhancer: TopazVEO3Enhancer;

  constructor() {
    this.nanoBanana = new VertexAINanoBananaService();
    this.veo3 = new VEO3Service();
    this.stitcher = new FFmpegVideoStitcher();
    this.enhancer = new TopazVEO3Enhancer();
  }

  /**
   * Generate ultra-realistic video with character consistency
   *
   * @param character - Character to generate video for
   * @param storyboard - Array of scene descriptions
   * @param config - Configuration options
   * @returns VideoResult with generated video
   */
  async generateUltraRealisticVideo(
    character: Character,
    storyboard: string[],
    config: UltraRealisticConfig = {}
  ): Promise<VideoResult> {
    try {
      console.log('🚀 Starting ultra-realistic video generation...');

      // Stage 1: Generate character library with NanoBanana
      console.log('📸 Stage 1: Generating character images with NanoBanana...');
      const baseImages = await this.generateCharacterLibrary(character, config);

      if (!baseImages.length || !baseImages[0].success) {
        throw new Error('Failed to generate base character images');
      }

      // Stage 2: Generate video segments with VEO3
      console.log('🎬 Stage 2: Generating video segments with VEO3...');
      const segments = await this.generateVideoSegments(
        baseImages[0], // Use front-facing image as primary
        storyboard,
        config
      );

      if (!segments.length) {
        throw new Error('Failed to generate video segments');
      }

      // Stage 3: Stitch segments with FFmpeg
      console.log('🔗 Stage 3: Stitching segments with FFmpeg...');
      const stitchedVideo = await this.stitcher.stitchVEO3Segments(segments);

      // Stage 4: Enhance with Topaz (optional)
      let finalVideoPath = stitchedVideo.path;
      let finalDuration = stitchedVideo.duration;
      if (config.enhanceWithTopaz) {
        console.log('⚡ Stage 4: Enhancing with Topaz Video AI...');
        const enhancement = await this.enhancer.enhanceVideo(stitchedVideo.path);
        if (enhancement.success) {
          finalVideoPath = enhancement.path;
        }
      }

      console.log('✅ Ultra-realistic video generation complete!');

      return {
        videoPath: finalVideoPath,
        duration: finalDuration,
        segments,
        enhanced: config.enhanceWithTopaz || false,
        success: true
      };

    } catch (error) {
      console.error('❌ Ultra-realistic video generation failed:', error);
      return {
        videoPath: '',
        duration: 0,
        segments: [],
        enhanced: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate character library with multiple angles for consistency
   */
  private async generateCharacterLibrary(
    character: Character,
    _config: UltraRealisticConfig // Prefix with underscore to indicate intentionally unused
  ): Promise<ImageResult[]> {
    const angles = ['front', 'three_quarter_left', 'profile_left'];
    const images: ImageResult[] = [];

    for (const angle of angles) {
      try {
        // Get optimized prompt (handle both method and data-only character objects)
        let basePrompt = '';
        if (typeof character.generateBasePrompt === 'function') {
          basePrompt = character.generateBasePrompt(`${angle} view`);
        } else {
          // Generate prompt from character data
          basePrompt = this.generatePromptFromCharacterData(character, `${angle} view`);
        }

        // Apply optimizations
        const optimizedPrompt = this.optimizePromptForRealism(basePrompt);

        // Generate image with NanoBanana
        const result = await this.nanoBanana.generateImage(optimizedPrompt, {
          temperature: 0.3, // Optimal for character consistency
          numImages: 1
        });

        if (result && result.length > 0) {
          images.push({
            imagePath: result[0].imagePath,
            angle,
            prompt: optimizedPrompt,
            success: true
          });
        } else {
          images.push({
            imagePath: '',
            angle,
            prompt: optimizedPrompt,
            success: false,
            error: 'No image generated'
          });
        }

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        images.push({
          imagePath: '',
          angle,
          prompt: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return images;
  }

  /**
   * Generate video segments using VEO3 with JSON prompting
   */
  private async generateVideoSegments(
    baseImage: ImageResult,
    storyboard: string[],
    config: UltraRealisticConfig
  ): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [];

    for (let i = 0; i < storyboard.length; i++) {
      try {
        const scene = storyboard[i];

        // Create VEO3 JSON prompt structure (300%+ quality improvement)
        const veo3Prompt = this.createVEO3JSONPrompt(
          scene,
          config,
          i
        );

        // Generate 8-second segment (optimal for VEO3)
        const result = await this.veo3.generateVideoSegment({
          prompt: veo3Prompt,
          duration: 8,
          aspectRatio: config.aspectRatio || '16:9',
          firstFrame: baseImage.imagePath
        });

        if (result.success && result.videos.length > 0) {
          segments.push({
            videoPath: result.videos[0].videoPath, // Use first video from array
            duration: result.videos[0].duration,
            scene,
            success: true
          });
        } else {
          segments.push({
            videoPath: '',
            duration: 0,
            scene,
            success: false,
            error: result.error
          });
        }

        // Delay between generations to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        segments.push({
          videoPath: '',
          duration: 0,
          scene: storyboard[i],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return segments;
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
   * Optimize prompt for realism using our discoveries
   */
  private optimizePromptForRealism(prompt: string): string {
    let optimized = prompt;

    // Apply our key discoveries
    optimized = optimized
      .replace('Flawless makeup', 'Professional natural makeup')
      .replace('stunning', 'attractive professional')
      .replace('perfect skin texture', 'natural skin texture');

    // Replace detailed imperfection lists with simplified realism
    const detailedRealismRegex = /SKIN REALISM[\s\S]*?(?=\n\n|$)/;
    if (detailedRealismRegex.test(optimized)) {
      optimized = optimized.replace(detailedRealismRegex, `NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections`);
    }

    // Add character preservation instruction
    if (!optimized.includes('PRESERVE:')) {
      optimized = `PRESERVE: Exact facial features and identity markers\n${optimized}`;
    }

    return optimized;
  }

  /**
   * Create VEO3 JSON prompt structure for 300%+ quality improvement
   */
  private createVEO3JSONPrompt(
    scene: string,
    config: UltraRealisticConfig,
    segmentIndex: number
  ): any {
    // Platform-specific camera positioning
    const cameraPosition = this.getPlatformCameraPosition(config.platform);

    return {
      prompt: `${scene}. PRESERVE: Exact facial features from reference image. Natural realistic movement.`,
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, over-specified imperfections",
      config: {
        duration_seconds: 8,
        aspect_ratio: config.aspectRatio || "16:9",
        camera: {
          motion: segmentIndex === 0 ? "stable shot" : "smooth tracking shot",
          angle: "eye-level",
          lens_type: "50mm",
          position: cameraPosition
        },
        lighting: {
          mood: "professional natural lighting",
          time_of_day: "golden hour",
          consistency: "match reference image lighting"
        },
        character: {
          description: "Same character as reference image",
          action: scene,
          preservation: "maintain exact facial features and identity"
        },
        environment: {
          location: "professional setting",
          atmosphere: "confident and engaging"
        },
        audio: {
          primary: "character dialogue with clear enunciation",
          ambient: ["professional background ambience"],
          quality: "studio recording quality",
          lip_sync: "precise mouth movement matching speech patterns"
        }
      }
    };
  }

  /**
   * Get platform-specific camera positioning
   */
  private getPlatformCameraPosition(platform?: string): string {
    switch (platform) {
      case 'tiktok':
        return 'holding a selfie stick (thats where the camera is)';
      case 'youtube':
        return 'tripod-mounted camera (thats where the camera is)';
      case 'instagram':
        return 'holding phone at arm\'s length (thats where the camera is)';
      default:
        return 'professional camera setup (thats where the camera is)';
    }
  }

  /**
   * Apply ZHO techniques when appropriate
   */
  async applyZhoTechnique(
    image: ImageResult,
    technique: number,
    prompt?: string
  ): Promise<ImageResult> {
    try {
      // Only apply ZHO for style transformations, not realistic content
      if (technique === 31 && prompt) {
        // ZHO #31: "turn this illustration into realistic version"
        const zhoPrompt = `turn this illustration into realistic version. ${prompt}`;

        const result = await this.nanoBanana.generateImage(zhoPrompt, {
          temperature: 0.3,
          numImages: 1
        });

        if (result && result.length > 0) {
          return {
            imagePath: result[0].imagePath,
            angle: image.angle,
            prompt: zhoPrompt,
            success: true
          };
        }
      }

      return image; // Return original if ZHO not applicable

    } catch (error) {
      console.warn('ZHO technique application failed:', error);
      return image; // Fallback to original
    }
  }
}