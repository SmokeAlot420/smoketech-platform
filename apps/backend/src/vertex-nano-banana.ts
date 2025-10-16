/**
 * VERTEX AI NANO BANANA (Gemini 2.5 Flash Image) Implementation
 * Production-grade character consistency with reference images
 * Uses Google Cloud Vertex AI for access to the real Nano Banana model
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];  // GCS URIs or base64
  metadata: {
    createdAt: string;
    gender: string;
    features: string[];
  };
}

interface VertexAIConfig {
  projectId: string;
  location?: string;
  bucketName?: string;
}

export class VertexNanoBananaClient {
  private vertexAI: VertexAI;
  private model: any;
  private storage: Storage;
  private bucketName: string;
  private outputDir: string;
  private characters: Map<string, CharacterProfile>;

  constructor(config: VertexAIConfig) {
    if (!config.projectId) {
      throw new Error('Google Cloud PROJECT_ID is required');
    }

    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location || 'us-central1'
    });

    // Get the REAL Nano Banana model
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash-002',  // Latest Nano Banana model
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.9,
      },
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      }]
    });

    // Initialize storage
    this.storage = new Storage({ projectId: config.projectId });
    this.bucketName = config.bucketName || `${config.projectId}-nano-banana`;

    this.outputDir = path.join(process.cwd(), 'generated', 'vertex-nano-banana');
    this.characters = new Map();
  }

  /**
   * Initialize storage bucket
   */
  async initializeStorage(): Promise<void> {
    try {
      const [_bucket] = await this.storage.bucket(this.bucketName).get();
      console.log(`[VertexNanoBanana] Using existing bucket: ${this.bucketName}`);
    } catch (error) {
      console.log(`[VertexNanoBanana] Creating bucket: ${this.bucketName}`);
      await this.storage.createBucket(this.bucketName, {
        location: 'US',
        storageClass: 'STANDARD'
      });
    }
  }

  /**
   * Upload image to Google Cloud Storage
   */
  private async uploadToGCS(imageBuffer: Buffer, fileName: string): Promise<string> {
    const file = this.storage.bucket(this.bucketName).file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png'
      }
    });

    return `gs://${this.bucketName}/${fileName}`;
  }

  /**
   * Create character with REAL reference images using Vertex AI
   */
  async createCharacterWithReference(
    name: string,
    description: string,
    gender: 'male' | 'female',
    features: string[]
  ): Promise<CharacterProfile> {
    console.log('[VertexNanoBanana] Creating character with TRUE Nano Banana reference images...');

    await fs.mkdir(this.outputDir, { recursive: true });
    await this.initializeStorage();

    // Generate reference images using REAL Nano Banana
    const referencePrompts = [
      `Create a photorealistic portrait of a ${gender} person: ${description}, ${features.join(', ')}, professional headshot, front facing, studio lighting, ultra detailed`,
      `Show the EXACT SAME ${gender} person from the first image: ${description}, ${features.join(', ')}, 3/4 view, natural lighting`,
      `Show the EXACT SAME ${gender} person again: ${description}, ${features.join(', ')}, side profile, soft lighting`
    ];

    const referenceImages: string[] = [];
    let previousImages: string[] = [];

    for (let i = 0; i < referencePrompts.length; i++) {
      try {
        // Build request with reference to previous images for consistency
        const parts: any[] = [{ text: referencePrompts[i] }];

        // Add previous images as reference for consistency
        for (const prevImage of previousImages) {
          parts.push({
            fileData: {
              fileUri: prevImage,
              mimeType: 'image/png'
            }
          });
        }

        const request = {
          contents: [{
            role: 'user',
            parts: parts
          }]
        };

        // Generate with Nano Banana
        const result = await this.model.generateContent(request);
        const response = result.response;

        // Extract generated image
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];

          // Check for inline image data in response
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageBuffer = Buffer.from(part.inlineData.data, 'base64');

              // Upload to GCS
              const gcsFileName = `references/${name.toLowerCase()}-ref-${i + 1}.png`;
              const gcsUri = await this.uploadToGCS(imageBuffer, gcsFileName);

              referenceImages.push(gcsUri);
              previousImages.push(gcsUri);

              // Save locally too
              const localPath = path.join(this.outputDir, 'references', `${name.toLowerCase()}-ref-${i + 1}.png`);
              await fs.mkdir(path.dirname(localPath), { recursive: true });
              await fs.writeFile(localPath, imageBuffer);

              console.log(`[VertexNanoBanana] Reference ${i + 1} saved: ${gcsUri}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error(`[VertexNanoBanana] Reference generation error:`, error);
      }
    }

    const characterId = `vertex-nano-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const character: CharacterProfile = {
      id: characterId,
      name,
      description,
      referenceImages,
      metadata: {
        createdAt: new Date().toISOString(),
        gender,
        features
      }
    };

    // Store character
    this.characters.set(characterId, character);

    // Save to disk
    const charFile = path.join(this.outputDir, 'characters', `${characterId}.json`);
    await fs.mkdir(path.dirname(charFile), { recursive: true });
    await fs.writeFile(charFile, JSON.stringify(character, null, 2));

    console.log(`[VertexNanoBanana] Character created: ${characterId} with ${referenceImages.length} reference images`);
    return character;
  }

  /**
   * Generate image with REAL character consistency using Vertex AI
   */
  async generateWithCharacterConsistency(
    characterId: string,
    scenePrompt: string,
    aspectRatio: string = '16:9'
  ): Promise<{ url: string; gcsUri: string }> {
    console.log('[VertexNanoBanana] Generating with TRUE Nano Banana character consistency...');

    const character = await this.loadCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    try {
      // Build multi-modal request with reference images
      const parts: any[] = [
        {
          text: `
            Using the reference images provided, generate a new image of the EXACT SAME PERSON.
            Character: ${character.name}
            Original description: ${character.description}
            Gender: ${character.metadata.gender}
            Features: ${character.metadata.features.join(', ')}

            CRITICAL: This must be the exact same person as in the reference images. Maintain all facial features, hair, and identifying characteristics.

            New scene: ${scenePrompt}
            Aspect ratio: ${aspectRatio}
          `.trim()
        }
      ];

      // Add reference images for character consistency
      for (const refImage of character.referenceImages) {
        parts.push({
          fileData: {
            fileUri: refImage,
            mimeType: 'image/png'
          }
        });
      }

      const request = {
        contents: [{
          role: 'user',
          parts: parts
        }]
      };

      // Generate with Nano Banana
      const result = await this.model.generateContent(request);
      const response = result.response;

      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');

            // Upload to GCS
            const gcsFileName = `generated/${characterId}-${Date.now()}.png`;
            const gcsUri = await this.uploadToGCS(imageBuffer, gcsFileName);

            // Save locally
            const localPath = path.join(this.outputDir, `${characterId}-${Date.now()}.png`);
            await fs.writeFile(localPath, imageBuffer);

            console.log(`[VertexNanoBanana] Character-consistent image saved: ${gcsUri}`);

            return {
              url: localPath,
              gcsUri: gcsUri
            };
          }
        }
      }

      throw new Error('Failed to generate consistent image');

    } catch (error: any) {
      console.error('[VertexNanoBanana] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Multi-image fusion with character consistency
   */
  async fuseImagesWithCharacter(
    characterId: string,
    additionalImageUris: string[],
    fusionPrompt: string
  ): Promise<{ url: string; gcsUri: string }> {
    console.log('[VertexNanoBanana] Performing multi-image fusion with Nano Banana...');

    const character = await this.loadCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    try {
      const parts: any[] = [
        {
          text: `
            Fuse these images together while maintaining the identity of the main character.
            Character: ${character.name} (${character.description})

            Fusion instructions: ${fusionPrompt}

            IMPORTANT: Keep the main character's face and features identical.
          `.trim()
        }
      ];

      // Add character reference images
      for (const refImage of character.referenceImages.slice(0, 2)) {
        parts.push({
          fileData: {
            fileUri: refImage,
            mimeType: 'image/png'
          }
        });
      }

      // Add additional images to fuse
      for (const imageUri of additionalImageUris.slice(0, 6)) {
        parts.push({
          fileData: {
            fileUri: imageUri,
            mimeType: 'image/png'
          }
        });
      }

      const request = {
        contents: [{
          role: 'user',
          parts: parts
        }]
      };

      const result = await this.model.generateContent(request);
      const response = result.response;

      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');

            const gcsFileName = `fusion/${characterId}-fusion-${Date.now()}.png`;
            const gcsUri = await this.uploadToGCS(imageBuffer, gcsFileName);

            const localPath = path.join(this.outputDir, `${characterId}-fusion-${Date.now()}.png`);
            await fs.writeFile(localPath, imageBuffer);

            return {
              url: localPath,
              gcsUri: gcsUri
            };
          }
        }
      }

      throw new Error('Failed to fuse images');

    } catch (error: any) {
      console.error('[VertexNanoBanana] Fusion failed:', error);
      throw error;
    }
  }

  /**
   * Load character from disk or memory
   */
  private async loadCharacter(characterId: string): Promise<CharacterProfile | null> {
    if (this.characters.has(characterId)) {
      return this.characters.get(characterId)!;
    }

    try {
      const charFile = path.join(this.outputDir, 'characters', `${characterId}.json`);
      const data = await fs.readFile(charFile, 'utf-8');
      const character = JSON.parse(data) as CharacterProfile;
      this.characters.set(characterId, character);
      return character;
    } catch {
      return null;
    }
  }

  /**
   * Batch generate multiple consistent images
   */
  async batchGenerateConsistent(
    characterId: string,
    scenes: string[],
    aspectRatio: string = '16:9'
  ): Promise<Array<{ url: string; gcsUri: string }>> {
    console.log(`[VertexNanoBanana] Batch generating ${scenes.length} consistent images...`);

    const results = [];
    for (const scene of scenes) {
      try {
        const result = await this.generateWithCharacterConsistency(characterId, scene, aspectRatio);
        results.push(result);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[VertexNanoBanana] Failed to generate scene: ${scene}`, error);
      }
    }

    return results;
  }
}

export default VertexNanoBananaClient;