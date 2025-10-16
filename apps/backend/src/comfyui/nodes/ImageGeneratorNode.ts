/**
 * Image Generator Node
 *
 * Unified node for generating images across multiple AI models
 * Supports: NanoBanana, Midjourney, DALL-E 3, Imagen 3, Imagen 4
 */

import { BaseNode } from '../BaseNode.js';
import {
  NodeConfig,
  NodeExecutionContext,
  NodeExecutionResult,
  ImageGeneratorModel
} from '../types/NodeConfig.js';
import { getVertexAINanoBananaService } from '../../services/vertexAINanoBanana.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Image Generator Node Configuration
 */
export interface ImageGeneratorParams {
  /** Model to use for generation */
  model: ImageGeneratorModel;

  /** Temperature for generation (0-1) */
  temperature?: number;

  /** Number of images to generate */
  count?: number;

  /** Image quality/resolution */
  quality?: 'standard' | 'hd' | 'ultra';

  /** Aspect ratio */
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

  /** Model-specific parameters */
  modelSpecific?: Record<string, any>;
}

/**
 * Image Generation Result
 */
export interface ImageGenerationOutput {
  /** Path to generated image */
  imagePath: string;

  /** Image URL (if applicable) */
  imageUrl?: string;

  /** Base64 encoded image data (optional) */
  imageData?: string;

  /** Generation metadata */
  metadata: {
    model: string;
    prompt: string;
    cost: number;
    executionTime: number;
    resolution?: string;
  };
}

/**
 * Image Generator Node
 * Handles image generation across multiple AI models
 */
export class ImageGeneratorNode extends BaseNode {
  /**
   * Create node with configuration
   */
  constructor(config?: Partial<NodeConfig>) {
    const fullConfig: NodeConfig = {
      id: config?.id || 'image_gen',
      type: 'image_generator',
      label: config?.label || 'Image Generator',
      params: config?.params || {
        model: 'nanobana',
        temperature: 0.3,
        count: 1,
        quality: 'hd',
        aspectRatio: '1:1'
      },
      inputs: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Image generation prompt',
          required: true
        },
        {
          name: 'negativePrompt',
          type: 'string',
          description: 'Negative prompt (what to avoid)',
          required: false,
          defaultValue: ''
        },
        {
          name: 'referenceImage',
          type: 'image',
          description: 'Reference image for style transfer',
          required: false
        }
      ],
      outputs: [
        {
          name: 'image',
          type: 'image',
          description: 'Generated image path',
          required: false
        },
        {
          name: 'imagePath',
          type: 'string',
          description: 'File path to generated image',
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
   * Execute image generation
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
      const params = this.config.params as ImageGeneratorParams;

      this.log(context, 'info', `Generating image with ${params.model}`);
      this.updateProgress(context, 10, `Initializing ${params.model}...`);

      // Route to appropriate model
      const result = await this.generateWithModel(
        params.model,
        processedInputs.prompt,
        params,
        context
      );

      this.updateProgress(context, 100, 'Complete');

      const executionTime = Date.now() - startTime;

      return this.createSuccessResult(
        {
          image: result.imagePath,
          imagePath: result.imagePath,
          metadata: result.metadata
        },
        executionTime,
        result.metadata.cost,
        {
          model: params.model,
          resolution: result.metadata.resolution
        }
      );
    } catch (error) {
      this.log(context, 'error', 'Image generation failed', error);
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
    model: ImageGeneratorModel,
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    switch (model) {
      case 'nanobana':
        return await this.generateWithNanoBanana(prompt, params, context);

      case 'midjourney':
        return await this.generateWithMidjourney(prompt, params, context);

      case 'dalle3':
        return await this.generateWithDALLE3(prompt, params, context);

      case 'imagen3':
        return await this.generateWithImagen3(prompt, params, context);

      case 'imagen4':
        return await this.generateWithImagen4(prompt, params, context);

      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }

  /**
   * Generate with NanoBanana (Gemini 2.5 Flash Image)
   */
  private async generateWithNanoBanana(
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    const service = getVertexAINanoBananaService();

    this.updateProgress(context, 30, 'Generating with NanoBanana...');
    this.heartbeat(context);

    const results = await service.generateImage(prompt, {
      temperature: params.temperature || 0.3,
      numImages: params.count || 1
    });

    if (!results || results.length === 0) {
      throw new Error('NanoBanana generation failed - no images returned');
    }

    this.updateProgress(context, 80, 'Image generated successfully...');

    const firstImage = results[0];
    const cost = firstImage.metadata.cost;
    this.trackCost(context, cost, `NanoBanana image generation`);

    return {
      imagePath: firstImage.imagePath,
      metadata: {
        model: 'nanobana',
        prompt,
        cost,
        executionTime: firstImage.metadata.generationTime,
        resolution: '1024x1024' // NanoBanana default
      }
    };
  }

  /**
   * Generate with Midjourney
   * @todo Implement Midjourney API integration
   */
  private async generateWithMidjourney(
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    throw new Error('Midjourney integration not yet implemented. Use NanoBanana for now.');

    // Future implementation:
    // const midjourneyService = new MidjourneyService();
    // const result = await midjourneyService.generate(prompt, params);
    // return result;
  }

  /**
   * Generate with DALL-E 3
   * @todo Implement DALL-E 3 integration
   */
  private async generateWithDALLE3(
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    throw new Error('DALL-E 3 integration not yet implemented. Use NanoBanana for now.');

    // Future implementation:
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const response = await openai.images.generate({
    //   model: 'dall-e-3',
    //   prompt,
    //   quality: params.quality === 'hd' ? 'hd' : 'standard',
    //   size: '1024x1024'
    // });
    // return result;
  }

  /**
   * Generate with Imagen 3
   * @todo Implement Imagen 3 integration
   */
  private async generateWithImagen3(
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    throw new Error('Imagen 3 integration not yet implemented. Use NanoBanana for now.');

    // Future implementation will use Vertex AI Imagen 3
    // Similar to NanoBanana but with Imagen 3 endpoint
  }

  /**
   * Generate with Imagen 4
   * @todo Implement Imagen 4 integration
   */
  private async generateWithImagen4(
    prompt: string,
    params: ImageGeneratorParams,
    context: NodeExecutionContext
  ): Promise<ImageGenerationOutput> {
    throw new Error('Imagen 4 integration not yet implemented. Use NanoBanana for now.');

    // Future implementation will use Vertex AI Imagen 4
  }

  /**
   * Estimate cost based on model and parameters
   */
  estimateCost(inputs: Record<string, any>): number {
    const params = this.config.params as ImageGeneratorParams;
    const count = params.count || 1;

    const costPerImage: Record<ImageGeneratorModel, number> = {
      nanobana: 0.02,
      midjourney: 0.08,
      dalle3: 0.08,
      imagen3: 0.08,
      imagen4: 0.08
    };

    return costPerImage[params.model] * count;
  }

  /**
   * Validate node-specific configuration
   */
  validate(): string[] {
    const errors = super.validate();
    const params = this.config.params as ImageGeneratorParams;

    // Validate model
    if (!params.model) {
      errors.push('Model selection is required');
    }

    const validModels: ImageGeneratorModel[] = [
      'nanobana',
      'midjourney',
      'dalle3',
      'imagen3',
      'imagen4'
    ];

    if (!validModels.includes(params.model)) {
      errors.push(`Invalid model: ${params.model}. Must be one of: ${validModels.join(', ')}`);
    }

    // Validate temperature
    if (params.temperature !== undefined) {
      if (params.temperature < 0 || params.temperature > 1) {
        errors.push('Temperature must be between 0 and 1');
      }
    }

    // Validate count
    if (params.count !== undefined) {
      if (params.count < 1 || params.count > 10) {
        errors.push('Count must be between 1 and 10');
      }
    }

    return errors;
  }

  /**
   * Create a pre-configured ImageGeneratorNode
   */
  static create(model: ImageGeneratorModel, options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return new ImageGeneratorNode({
      params: {
        model,
        temperature: options?.temperature || 0.3,
        count: options?.count || 1,
        quality: options?.quality || 'hd',
        aspectRatio: options?.aspectRatio || '1:1',
        ...options
      }
    });
  }

  /**
   * Helper: Create NanoBanana node (most common)
   */
  static nanoBanana(options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return ImageGeneratorNode.create('nanobana', options);
  }

  /**
   * Helper: Create Midjourney node
   */
  static midjourney(options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return ImageGeneratorNode.create('midjourney', options);
  }

  /**
   * Helper: Create DALL-E 3 node
   */
  static dalle3(options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return ImageGeneratorNode.create('dalle3', options);
  }

  /**
   * Helper: Create Imagen 3 node
   */
  static imagen3(options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return ImageGeneratorNode.create('imagen3', options);
  }

  /**
   * Helper: Create Imagen 4 node
   */
  static imagen4(options?: Partial<ImageGeneratorParams>): ImageGeneratorNode {
    return ImageGeneratorNode.create('imagen4', options);
  }
}
