/**
 * Video Generator Node
 *
 * Unified node for generating videos across multiple AI models
 * Supports: VEO3, VEO3-Fast, Sora 2 (future), Sora 2.2 (future)
 */

import { BaseNode } from '../BaseNode.js';
import {
  NodeConfig,
  NodeExecutionContext,
  NodeExecutionResult,
  VideoGeneratorModel
} from '../types/NodeConfig.js';
import { VEO3Service } from '../../services/veo3Service.js';

/**
 * Video Generator Node Configuration
 */
export interface VideoGeneratorParams {
  /** Model to use for generation */
  model: VideoGeneratorModel;

  /** Video duration in seconds */
  duration?: 4 | 6 | 8;

  /** Aspect ratio */
  aspectRatio?: '16:9' | '9:16' | '1:1';

  /** Video quality */
  quality?: 'standard' | 'high';

  /** Number of videos to generate */
  count?: 1 | 2;

  /** Enable sound generation */
  enableSound?: boolean;

  /** Use prompt enhancement */
  enablePromptRewriting?: boolean;

  /** Model-specific parameters */
  modelSpecific?: Record<string, any>;
}

/**
 * Video Generation Result
 */
export interface VideoGenerationOutput {
  /** Path to generated video */
  videoPath: string;

  /** Video URL (if applicable) */
  videoUrl?: string;

  /** Video duration in seconds */
  duration: number;

  /** Generation metadata */
  metadata: {
    model: string;
    prompt: string;
    cost: number;
    executionTime: number;
    quality: string;
    aspectRatio: string;
  };
}

/**
 * Video Generator Node
 * Handles video generation across multiple AI models
 */
export class VideoGeneratorNode extends BaseNode {
  /**
   * Create node with configuration
   */
  constructor(config?: Partial<NodeConfig>) {
    const fullConfig: NodeConfig = {
      id: config?.id || 'video_gen',
      type: 'video_generator',
      label: config?.label || 'Video Generator',
      params: config?.params || {
        model: 'veo3-fast',
        duration: 8,
        aspectRatio: '16:9',
        quality: 'high',
        count: 1,
        enableSound: true,
        enablePromptRewriting: false
      },
      inputs: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Video generation prompt',
          required: true
        },
        {
          name: 'characterImage',
          type: 'string',
          description: 'Character image path for image-to-video',
          required: false
        },
        {
          name: 'negativePrompt',
          type: 'string',
          description: 'Negative prompt (what to avoid)',
          required: false,
          defaultValue: ''
        }
      ],
      outputs: [
        {
          name: 'video',
          type: 'video',
          description: 'Generated video path',
          required: false
        },
        {
          name: 'videoPath',
          type: 'string',
          description: 'File path to generated video',
          required: false
        },
        {
          name: 'metadata',
          type: 'object',
          description: 'Generation metadata',
          required: false
        }
      ],
      metadata: config?.metadata
    };

    super(fullConfig);
  }

  /**
   * Execute video generation
   */
  async execute(
    inputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const errors = this.validateInputs(inputs);
      if (errors.length > 0) {
        return this.createErrorResult(errors.join(', '), Date.now() - startTime);
      }

      // Apply defaults
      const processedInputs = this.applyDefaults(inputs);
      const params = this.config.params as VideoGeneratorParams;

      this.log(context, 'info', `Generating video with ${params.model}`);
      this.updateProgress(context, 10, `Initializing ${params.model}...`);

      // Route to appropriate model
      const result = await this.generateWithModel(
        params.model,
        processedInputs.prompt,
        processedInputs.characterImage,
        params,
        context
      );

      this.updateProgress(context, 100, 'Complete');

      const executionTime = Date.now() - startTime;

      return this.createSuccessResult(
        {
          video: result.videoPath,
          videoPath: result.videoPath,
          metadata: result.metadata
        },
        executionTime,
        result.metadata.cost,
        {
          model: params.model,
          duration: result.duration,
          quality: result.metadata.quality
        }
      );
    } catch (error) {
      this.log(context, 'error', 'Video generation failed', error);
      return this.createErrorResult(
        error instanceof Error ? error.message : String(error),
        Date.now() - startTime
      );
    }
  }

  /**
   * Route generation to specific model
   */
  private async generateWithModel(
    model: VideoGeneratorModel,
    prompt: string,
    characterImage: string | undefined,
    params: VideoGeneratorParams,
    context: NodeExecutionContext
  ): Promise<VideoGenerationOutput> {
    switch (model) {
      case 'veo3':
        return await this.generateWithVEO3(prompt, characterImage, params, context, 'standard');

      case 'veo3-fast':
        return await this.generateWithVEO3(prompt, characterImage, params, context, 'fast');

      case 'sora-2':
        return await this.generateWithSora2(prompt, characterImage, params, context);

      case 'sora-2.2':
        return await this.generateWithSora22(prompt, characterImage, params, context);

      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }

  /**
   * Generate with VEO3 (standard or fast)
   */
  private async generateWithVEO3(
    prompt: string,
    characterImage: string | undefined,
    params: VideoGeneratorParams,
    context: NodeExecutionContext,
    modelType: 'fast' | 'standard'
  ): Promise<VideoGenerationOutput> {
    const service = new VEO3Service();

    this.updateProgress(context, 30, `Generating with VEO3 ${modelType}...`);
    this.heartbeat(context);

    const result = await service.generateVideoSegment({
      prompt,
      duration: params.duration || 8,
      aspectRatio: params.aspectRatio || '16:9',
      firstFrame: characterImage,
      quality: params.quality || 'high',
      videoCount: params.count || 1,
      model: modelType,
      enablePromptRewriting: params.enablePromptRewriting || false,
      enableSoundGeneration: params.enableSound !== false
    });

    if (!result.success || !result.videos || result.videos.length === 0) {
      throw new Error(result.error || 'VEO3 generation failed - no videos returned');
    }

    this.updateProgress(context, 80, 'Video generated successfully...');

    const firstVideo = result.videos[0];
    const cost = result.metadata?.cost || (modelType === 'fast' ? 1.20 : 3.20);
    this.trackCost(context, cost, `VEO3 ${modelType} video generation`);

    return {
      videoPath: firstVideo.videoPath,
      videoUrl: firstVideo.videoUrl,
      duration: firstVideo.duration,
      metadata: {
        model: `veo3-${modelType}`,
        prompt,
        cost,
        executionTime: result.metadata?.generationTime || 0,
        quality: firstVideo.quality,
        aspectRatio: params.aspectRatio || '16:9'
      }
    };
  }

  /**
   * Generate with Sora 2
   * @todo Implement Sora 2 integration
   */
  private async generateWithSora2(
    prompt: string,
    characterImage: string | undefined,
    params: VideoGeneratorParams,
    context: NodeExecutionContext
  ): Promise<VideoGenerationOutput> {
    throw new Error('Sora 2 integration not yet implemented. Use VEO3 for now.');

    // Future implementation:
    // const sora2Service = new Sora2Service();
    // const result = await sora2Service.generate({
    //   prompt,
    //   referenceImage: characterImage,
    //   duration: params.duration || 8,
    //   aspectRatio: params.aspectRatio || '16:9'
    // });
    // return result;
  }

  /**
   * Generate with Sora 2.2
   * @todo Implement Sora 2.2 integration
   */
  private async generateWithSora22(
    prompt: string,
    characterImage: string | undefined,
    params: VideoGeneratorParams,
    context: NodeExecutionContext
  ): Promise<VideoGenerationOutput> {
    throw new Error('Sora 2.2 integration not yet implemented. Use VEO3 for now.');

    // Future implementation:
    // const sora22Service = new Sora22Service();
    // const result = await sora22Service.generate({
    //   prompt,
    //   referenceImage: characterImage,
    //   duration: params.duration || 8,
    //   aspectRatio: params.aspectRatio || '16:9',
    //   quality: 'ultra' // Sora 2.2 may have enhanced quality options
    // });
    // return result;
  }

  /**
   * Estimate cost based on model and parameters
   */
  estimateCost(inputs: Record<string, any>): number {
    const params = this.config.params as VideoGeneratorParams;
    const count = params.count || 1;
    const duration = params.duration || 8;

    // Cost per second for each model
    const costPerSecond: Record<VideoGeneratorModel, number> = {
      'veo3': 3.20 / 8, // $3.20 for 8 seconds
      'veo3-fast': 1.20 / 8, // $1.20 for 8 seconds
      'sora-2': 2.00 / 8, // Estimated $2.00 for 8 seconds
      'sora-2.2': 2.50 / 8 // Estimated $2.50 for 8 seconds
    };

    return costPerSecond[params.model] * duration * count;
  }

  /**
   * Validate node-specific configuration
   */
  validate(): string[] {
    const errors = super.validate();
    const params = this.config.params as VideoGeneratorParams;

    // Validate model
    if (!params.model) {
      errors.push('Model selection is required');
    }

    const validModels: VideoGeneratorModel[] = [
      'veo3',
      'veo3-fast',
      'sora-2',
      'sora-2.2'
    ];

    if (!validModels.includes(params.model)) {
      errors.push(`Invalid model: ${params.model}. Must be one of: ${validModels.join(', ')}`);
    }

    // Validate duration
    if (params.duration !== undefined) {
      if (![4, 6, 8].includes(params.duration)) {
        errors.push('Duration must be 4, 6, or 8 seconds');
      }
    }

    // Validate count
    if (params.count !== undefined) {
      if (![1, 2].includes(params.count)) {
        errors.push('Count must be 1 or 2');
      }
    }

    return errors;
  }

  /**
   * Create a pre-configured VideoGeneratorNode
   */
  static create(model: VideoGeneratorModel, options?: Partial<VideoGeneratorParams>): VideoGeneratorNode {
    return new VideoGeneratorNode({
      params: {
        model,
        duration: options?.duration || 8,
        aspectRatio: options?.aspectRatio || '16:9',
        quality: options?.quality || 'high',
        count: options?.count || 1,
        enableSound: options?.enableSound !== false,
        enablePromptRewriting: options?.enablePromptRewriting || false,
        ...options
      }
    });
  }

  /**
   * Helper: Create VEO3 Fast node (most common)
   */
  static veo3Fast(options?: Partial<VideoGeneratorParams>): VideoGeneratorNode {
    return VideoGeneratorNode.create('veo3-fast', options);
  }

  /**
   * Helper: Create VEO3 Standard node
   */
  static veo3(options?: Partial<VideoGeneratorParams>): VideoGeneratorNode {
    return VideoGeneratorNode.create('veo3', options);
  }

  /**
   * Helper: Create Sora 2 node
   */
  static sora2(options?: Partial<VideoGeneratorParams>): VideoGeneratorNode {
    return VideoGeneratorNode.create('sora-2', options);
  }

  /**
   * Helper: Create Sora 2.2 node
   */
  static sora22(options?: Partial<VideoGeneratorParams>): VideoGeneratorNode {
    return VideoGeneratorNode.create('sora-2.2', options);
  }
}
