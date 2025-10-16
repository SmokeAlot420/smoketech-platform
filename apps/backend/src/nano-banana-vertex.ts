/**
 * NANO BANANA VERTEX AI - Production Implementation
 * Uses the REAL imagegeneration@006 and imagen-3.0-capability-001 endpoints
 */

import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CharacterReference {
  id: string;
  name: string;
  description: string;
  referenceImage: string; // base64 encoded
  createdAt: Date;
}

export interface GenerationOptions {
  prompt: string;
  characterRef?: CharacterReference;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  sampleCount?: number;
  safetyFilterLevel?: 'block_some' | 'block_few' | 'block_most';
  personGeneration?: 'allow_adult' | 'allow_all';
  addWatermark?: boolean;
}

export class NanoBananaVertex {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;
  private modelVersion: 'imagen-3.0-capability-001' | 'imagegeneration@006';
  // @ts-ignore - Reserved for future authentication functionality
  private _accessToken: string | null = null;

  constructor(projectId: string, location: string = 'us-central1') {
    this.projectId = projectId;
    this.location = location;
    this.modelVersion = 'imagen-3.0-capability-001'; // Use latest for character consistency

    // Initialize Google Auth
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  /**
   * Get access token for API calls
   */
  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    if (!tokenResponse.token) {
      throw new Error('Failed to get access token');
    }
    return tokenResponse.token;
  }

  /**
   * Create a character reference from an image
   */
  async createCharacterReference(
    imagePath: string,
    name: string,
    description: string
  ): Promise<CharacterReference> {
    console.log(`📸 Creating character reference for ${name}...`);

    // Read and encode image
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const characterRef: CharacterReference = {
      id: `char_${Date.now()}`,
      name,
      description,
      referenceImage: base64Image,
      createdAt: new Date(),
    };

    // Save reference for later use
    const refsDir = path.join(process.cwd(), 'character-refs');
    await fs.mkdir(refsDir, { recursive: true });

    const refPath = path.join(refsDir, `${characterRef.id}.json`);
    await fs.writeFile(refPath, JSON.stringify(characterRef, null, 2));

    console.log(`✅ Character reference created: ${characterRef.id}`);
    return characterRef;
  }

  /**
   * Generate image with character consistency
   */
  async generateWithCharacter(options: GenerationOptions): Promise<Buffer[]> {
    const token = await this.getAccessToken();

    // Build the API endpoint
    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelVersion}:predict`;

    // Build the request payload
    const requestBody: any = {
      instances: [{
        prompt: options.characterRef
          ? options.prompt.replace(/\[character\]/g, '[1]')
          : options.prompt,
      }],
      parameters: {
        sampleCount: options.sampleCount || 1,
        aspectRatio: options.aspectRatio || '1:1',
        safetyFilterLevel: options.safetyFilterLevel || 'block_some',
        personGeneration: options.personGeneration || 'allow_adult',
        addWatermark: options.addWatermark !== false,
      }
    };

    // Add reference images for character consistency
    if (options.characterRef) {
      requestBody.instances[0].referenceImages = [{
        referenceType: 'REFERENCE_TYPE_SUBJECT',
        referenceId: 1,
        referenceImage: {
          bytesBase64Encoded: options.characterRef.referenceImage
        },
        subjectImageConfig: {
          subjectType: 'SUBJECT_TYPE_PERSON',
          subjectDescription: options.characterRef.description
        }
      }];
    }

    console.log(`🎨 Generating image with prompt: ${options.prompt.substring(0, 100)}...`);

    try {
      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.predictions || response.data.predictions.length === 0) {
        throw new Error('No predictions returned');
      }

      // Extract base64 images from response
      const images: Buffer[] = [];
      for (const prediction of response.data.predictions) {
        if (prediction.bytesBase64Encoded) {
          const imageBuffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
          images.push(imageBuffer);
        }
      }

      console.log(`✅ Generated ${images.length} images successfully`);
      return images;

    } catch (error: any) {
      if (error.response?.status === 404) {
        // Fallback to imagegeneration@006 if newer model not available
        console.log('⚠️ Falling back to imagegeneration@006...');
        this.modelVersion = 'imagegeneration@006';
        return this.generateWithCharacter(options); // Retry with older model
      }

      console.error('❌ Generation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate multiple consistent images for a character
   */
  async generateCharacterSeries(
    characterRef: CharacterReference,
    prompts: string[]
  ): Promise<Buffer[][]> {
    console.log(`🎬 Generating series for ${characterRef.name}...`);

    const allImages: Buffer[][] = [];

    for (const prompt of prompts) {
      const images = await this.generateWithCharacter({
        prompt,
        characterRef,
        sampleCount: 1, // Generate one at a time for consistency
      });

      allImages.push(images);

      // Save generated images
      const outputDir = path.join(process.cwd(), 'generated', characterRef.id);
      await fs.mkdir(outputDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const filename = `${Date.now()}_${i}.png`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, images[i]);
        console.log(`  💾 Saved: ${filename}`);
      }

      // Rate limiting - NanoBanana has 2 requests/minute quota
      await this.delay(30000); // Wait 30 seconds between requests
    }

    return allImages;
  }

  /**
   * Load existing character reference
   */
  async loadCharacterReference(characterId: string): Promise<CharacterReference> {
    const refPath = path.join(process.cwd(), 'character-refs', `${characterId}.json`);
    const data = await fs.readFile(refPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Helper method for delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in Temporal activities
export default NanoBananaVertex;