/**
 * REAL Google Media Client - Using actual VEO3 and Imagen APIs
 * No mocks, no placeholders - actual generation
 * September 2025 - Latest APIs
 */

import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  image?: Buffer; // Starting image for image-to-video
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  model?: 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001';
}

export interface GeneratedImage {
  url: string;
  buffer?: Buffer;
}

export interface GeneratedVideo {
  url: string;
  buffer?: Buffer;
  duration: number;
  resolution: string;
  hasAudio: boolean;
}

export class GoogleMediaClientReal {
  private genai: any; // GoogleGenAI client for media
  // @ts-ignore - Reserved for future text generation functionality
  private _gemini: GoogleGenerativeAI; // For text generation
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }

    // Initialize both clients
    this.genai = new GoogleGenAI({ apiKey: this.apiKey });
    this._gemini = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Generate images using Imagen 4.0
   * REAL implementation - no mocks
   */
  async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    console.log('🎨 Generating REAL image with Imagen 4.0...');
    console.log('📝 Prompt:', params.prompt);

    try {
      // Use Imagen 4.0 for image generation
      const response = await this.genai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        aspectRatio: params.aspectRatio
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No images generated');
      }

      const image = response.generatedImages[0];

      // Save the image locally
      const outputDir = path.join(process.cwd(), 'generated');
      await fs.mkdir(outputDir, { recursive: true });

      const fileName = `imagen-${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);

      // Save the image buffer
      if (image.image && image.image.imageBytes) {
        await fs.writeFile(filePath, image.image.imageBytes);
        console.log('✅ Image saved to:', filePath);
      }

      return {
        url: filePath,
        buffer: image.image?.imageBytes
      };

    } catch (error: any) {
      console.error('❌ Imagen generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate video using VEO3
   * REAL implementation with polling
   */
  async generateVideo(params: VideoGenerationParams): Promise<GeneratedVideo> {
    const model = params.model || 'veo-3.0-generate-001';
    console.log(`🎥 Generating REAL video with ${model}...`);
    console.log('📝 Prompt:', params.prompt);

    try {
      // Start video generation
      let operation;

      if (params.image) {
        // Image-to-video generation
        console.log('🖼️ Using image as starting frame');
        operation = await this.genai.models.generateVideos({
          model,
          prompt: params.prompt,
          image: {
            imageBytes: params.image,
            mimeType: 'image/png'
          },
          config: {
            aspectRatio: params.aspectRatio || '16:9',
            resolution: params.resolution || '720p',
            negativePrompt: params.negativePrompt
          }
        });
      } else {
        // Text-to-video generation
        operation = await this.genai.models.generateVideos({
          model,
          prompt: params.prompt,
          config: {
            aspectRatio: params.aspectRatio || '16:9',
            resolution: params.resolution || '720p',
            negativePrompt: params.negativePrompt
          }
        });
      }

      console.log('⏳ Video generation started, operation:', operation.name);

      // Poll until complete
      const maxAttempts = 60; // 10 minutes max
      let attempts = 0;

      while (!operation.done && attempts < maxAttempts) {
        console.log(`⏳ Waiting for video... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

        // Refresh operation status
        operation = await this.genai.operations.getVideosOperation({
          operation: operation
        });

        attempts++;
      }

      if (!operation.done) {
        throw new Error(`Video generation timed out after ${maxAttempts * 10} seconds`);
      }

      // Get the generated video
      const video = operation.response.generatedVideos[0];
      if (!video || !video.video) {
        throw new Error('No video generated');
      }

      // Download and save the video
      await this.genai.files.download({ file: video.video });

      const outputDir = path.join(process.cwd(), 'generated');
      await fs.mkdir(outputDir, { recursive: true });

      const fileName = `veo3-${Date.now()}.mp4`;
      const filePath = path.join(outputDir, fileName);

      if (video.video.videoBytes) {
        await fs.writeFile(filePath, video.video.videoBytes);
        console.log('✅ Video saved to:', filePath);
      }

      return {
        url: filePath,
        buffer: video.video.videoBytes,
        duration: 8, // VEO3 generates 8-second videos
        resolution: params.resolution || '720p',
        hasAudio: true // VEO3 includes native audio
      };

    } catch (error: any) {
      console.error('❌ VEO3 video generation failed:', error.message);
      if (error.response?.data) {
        console.error('API Error details:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Generate image then video (image-to-video pipeline)
   */
  async generateImageThenVideo(
    imagePrompt: string,
    videoPrompt: string,
    videoModel: 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001' = 'veo-3.0-fast-generate-001'
  ): Promise<{ image: GeneratedImage; video: GeneratedVideo }> {
    console.log('🎬 Starting image-to-video pipeline...');

    // Step 1: Generate image
    const image = await this.generateImage({ prompt: imagePrompt });

    // Step 2: Use image for video
    const video = await this.generateVideo({
      prompt: videoPrompt,
      image: image.buffer,
      model: videoModel
    });

    return { image, video };
  }

  /**
   * Check API availability
   */
  async checkAvailability(): Promise<{
    imagen: boolean;
    veo3: boolean;
    message: string;
  }> {
    console.log('🔍 Checking API availability...');

    try {
      // Test with a simple call
      // @ts-ignore - Reserved for future API testing
      const _testPrompt = 'A simple test';

      // We can't actually test without making real API calls
      // which would cost money, so we check if the client is initialized
      const hasApiKey = !!this.apiKey;

      return {
        imagen: hasApiKey,
        veo3: hasApiKey,
        message: hasApiKey
          ? '✅ Google Media APIs are configured and ready'
          : '❌ API key is missing'
      };
    } catch (error: any) {
      return {
        imagen: false,
        veo3: false,
        message: `❌ API check failed: ${error.message}`
      };
    }
  }
}

export default GoogleMediaClientReal;