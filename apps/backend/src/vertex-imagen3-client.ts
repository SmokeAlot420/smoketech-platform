import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { selectImageModel, calculateCost } from './config/models';

const execAsync = promisify(exec);

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  numberOfResults?: number;
  referenceImages?: string[];
  characterConsistency?: boolean;
  addTextOverlay?: {
    text: string;
    position?: 'bottom' | 'top';
    style?: string;
  };
}

export interface ImageGenerationResult {
  url: string;
  base64?: string;
  metadata?: any;
}

export class VertexImagen3Client {
  private projectId: string;
  private location: string = 'us-central1';

  constructor(projectId?: string) {
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || '';
    if (!this.projectId) {
      console.warn('[VertexImagen3] No project ID specified, will attempt to use default');
    }
  }

  /**
   * Get access token using gcloud CLI
   * In production, you'd use a service account instead
   */
  private async getAccessToken(): Promise<string> {
    try {
      const { stdout } = await execAsync('gcloud auth print-access-token');
      return stdout.trim();
    } catch (error) {
      console.error('[VertexImagen3] Failed to get access token:', error);
      // Fallback to environment variable if gcloud fails
      return process.env.GOOGLE_ACCESS_TOKEN || '';
    }
  }

  /**
   * Generate image using NanoBanana (imagegeneration@006) for basic generation
   * or imagen-3.0-capability-001 for editing/customization
   */
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    console.log('[VertexImagen3] Generating image:', params.prompt.substring(0, 100) + '...');

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Use centralized configuration to select the appropriate model
      const needsCustomization = params.characterConsistency || false;
      const hasReferenceImages = !!(params.referenceImages && params.referenceImages.length > 0);
      const model = selectImageModel(needsCustomization, hasReferenceImages);

      console.log(`[VertexImagen3] Using model: ${model}`);
      console.log(`[VertexImagen3] Cost per image: $${calculateCost(model, 1)}`);

      const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}:predict`;

      // Build the request body
      const requestBody: any = {
        instances: [{
          prompt: params.prompt
        }],
        parameters: {
          sampleCount: params.numberOfResults || 1
        }
      };

      // Add negative prompt if provided
      if (params.negativePrompt) {
        requestBody.instances[0].negativePrompt = params.negativePrompt;
      }

      // Add aspect ratio if provided
      if (params.aspectRatio) {
        requestBody.parameters.aspectRatio = params.aspectRatio;
      }

      // Add reference images for character consistency
      if (params.referenceImages && params.referenceImages.length > 0) {
        requestBody.instances[0].referenceImages = params.referenceImages.map(url => ({
          gcsUri: url // Assumes images are in GCS
        }));
        requestBody.parameters.characterConsistency = params.characterConsistency !== false;
      }

      // Add text overlay instructions to prompt if requested
      if (params.addTextOverlay) {
        const overlayPrompt = `, with text "${params.addTextOverlay.text}" at the ${params.addTextOverlay.position || 'bottom'} in ${params.addTextOverlay.style || 'professional'} style`;
        requestBody.instances[0].prompt += overlayPrompt;
      }

      console.log('[VertexImagen3] Making request to Vertex AI...');
      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        timeout: 60000 // 60 second timeout
      });

      if (!response.data.predictions || response.data.predictions.length === 0) {
        throw new Error('No predictions returned from Vertex AI');
      }

      const prediction = response.data.predictions[0];

      // Handle the response - imagen-3.0 returns base64 encoded image
      if (prediction.bytesBase64Encoded) {
        // Convert base64 to a data URL
        const dataUrl = `data:image/png;base64,${prediction.bytesBase64Encoded}`;

        console.log('[VertexImagen3] Image generated successfully');
        return {
          url: dataUrl,
          base64: prediction.bytesBase64Encoded,
          metadata: prediction.metadata || {}
        };
      } else if (prediction.gcsUri) {
        // If the image is stored in GCS
        console.log('[VertexImagen3] Image generated and stored in GCS:', prediction.gcsUri);
        return {
          url: prediction.gcsUri,
          metadata: prediction.metadata || {}
        };
      } else {
        throw new Error('Unexpected response format from Vertex AI');
      }

    } catch (error: any) {
      console.error('[VertexImagen3] Image generation failed:', error.response?.data || error.message);
      throw new Error(`Vertex AI image generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate multiple variations with character consistency
   */
  async generateCharacterVariations(
    basePrompt: string,
    characterDescription: string,
    poses: string[],
    brandText?: string
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];
    let referenceImage: string | undefined;

    for (let i = 0; i < poses.length; i++) {
      const pose = poses[i];
      const prompt = `${characterDescription}, ${pose}, ${basePrompt}`;

      const params: ImageGenerationParams = {
        prompt,
        negativePrompt: 'low quality, blurry, distorted, inconsistent',
        aspectRatio: '16:9',
        characterConsistency: i > 0 // Use consistency after first image
      };

      // Add branding text if specified
      if (brandText) {
        params.addTextOverlay = {
          text: brandText,
          position: 'bottom',
          style: 'professional corporate branding'
        };
      }

      // Use first image as reference for subsequent generations
      if (i > 0 && referenceImage) {
        params.referenceImages = [referenceImage];
      }

      const result = await this.generateImage(params);
      results.push(result);

      // Store first image as reference (would need to upload to GCS in production)
      if (i === 0 && result.base64) {
        // In production, upload this to GCS and get the URL
        referenceImage = result.url; // For now, using data URL
      }

      // Add delay between requests to avoid rate limiting
      if (i < poses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  /**
   * Generate QuoteMoto branded content
   */
  async generateQuoteMotoContent(): Promise<ImageGenerationResult[]> {
    const characterDescription = 'Professional young woman, friendly smile, business casual attire, insurance agent';
    const poses = [
      'standing confidently holding a tablet showing insurance quotes',
      'sitting at desk explaining benefits to camera',
      'pointing to a savings chart with enthusiasm'
    ];
    const brandText = 'QuoteMoto Insurance';
    const basePrompt = 'modern office setting, bright lighting, professional photography, high quality';

    console.log('[VertexImagen3] Generating QuoteMoto branded content...');
    return this.generateCharacterVariations(basePrompt, characterDescription, poses, brandText);
  }
}

export default VertexImagen3Client;