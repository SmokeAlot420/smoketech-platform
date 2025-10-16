// NanoBanana Image Generator - Gemini 2.5 Flash Image API
// Generates ultra-realistic human images with natural imperfections for VEO3

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface RealisticSkinOptions {
  age: number;
  skinTone: 'fair' | 'medium' | 'olive' | 'dark';
  imperfections: ('freckles' | 'pores' | 'wrinkles' | 'blemishes' | 'asymmetry')[];
  lighting: 'natural' | 'studio' | 'soft' | 'dramatic';
  expression: string;
}

export interface CharacterImageRequest {
  characterName: string;
  baseDescription: string;
  skinOptions: RealisticSkinOptions;
  angle: 'front' | 'profile' | '3quarter' | 'slight-turn';
  outfit: string;
  environment: string;
}

export class NanoBananaImageGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Use Gemini 2.5 Flash Image (NanoBanana) - Correct model name
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
  }

  /**
   * Generate realistic character reference images with natural imperfections
   */
  async generateCharacterImages(request: CharacterImageRequest): Promise<string[]> {
    console.log(`🍌 Generating NanoBanana images for ${request.characterName}...`);

    const realisticPrompt = this.buildRealisticPrompt(request);
    console.log('📝 NanoBanana Prompt:', realisticPrompt);

    try {
      // Use Gemini 2.5 Flash Image generation with proper format
      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: realisticPrompt
          }]
        }]
      });

      console.log('📦 NanoBanana response received, extracting images...');
      const images = await this.extractImagesFromResponse(result);

      // Save images and return paths
      const imagePaths = await this.saveCharacterImages(request.characterName, images);

      console.log(`✅ Generated ${imagePaths.length} NanoBanana images for ${request.characterName}`);
      return imagePaths;

    } catch (error) {
      console.error('❌ NanoBanana image generation failed:', error);
      throw new Error(`Failed to generate images for ${request.characterName}: ${error}`);
    }
  }

  /**
   * Build ultra-realistic prompt with natural imperfections
   */
  private buildRealisticPrompt(request: CharacterImageRequest): string {
    const { characterName, baseDescription, skinOptions, angle, outfit, environment } = request;

    // Build imperfection details
    const imperfectionDetails = this.buildImperfectionDetails(skinOptions);
    const lightingDetails = this.buildLightingDetails(skinOptions.lighting);
    const angleDetails = this.buildAngleDetails(angle);

    return `
Ultra-photorealistic portrait of ${characterName}, ${baseDescription}

SKIN REALISM:
${imperfectionDetails}
- Natural skin tone variations and gradients
- Visible but subtle skin texture throughout
- Realistic subsurface light scattering
- Natural shine and matte areas
- Authentic skin coloration with warm and cool undertones

FACIAL DETAILS:
- Subtle facial asymmetry (eyes slightly different sizes)
- Natural eyebrow variations (different hair densities)
- Realistic eyelash details with individual lashes
- Natural lip texture with subtle lines
- Authentic eye reflections and catchlights
- Slight variations in nostril size
- Natural ear shape asymmetry

HAIR REALISM:
- Individual strand detail and natural flyaways
- Realistic hair texture with volume variations
- Natural hair growth patterns
- Subtle color variations throughout
- Authentic hair movement and layering

EXPRESSION & POSE:
${angleDetails}
Expression: ${skinOptions.expression}
Natural micro-expressions and relaxed facial muscles

OUTFIT & STYLING:
${outfit}

ENVIRONMENT:
${environment}
${lightingDetails}

TECHNICAL QUALITY:
- 8K resolution, professional photography quality
- Perfect focus on facial features
- Natural depth of field
- Authentic color grading
- No AI artifacts or synthetic appearance
- Professional portrait photography standards

AVOID:
- Plastic or synthetic skin appearance
- Perfect symmetry or flawless features
- Over-processed or filtered look
- Artificial lighting or studio perfection
- Uniform skin tone or texture
- Computer-generated appearance
    `.trim();
  }

  /**
   * Build detailed imperfection specifications
   */
  private buildImperfectionDetails(skinOptions: RealisticSkinOptions): string {
    const { age, skinTone, imperfections } = skinOptions;

    let details = `Age: ${age} years old with age-appropriate features\n`;
    details += `Skin tone: ${skinTone} complexion with natural variation\n`;

    imperfections.forEach(imperfection => {
      switch (imperfection) {
        case 'freckles':
          details += '- Scattered natural freckles across nose and cheeks\n';
          details += '- Varying freckle sizes and densities\n';
          break;
        case 'pores':
          details += '- Visible skin pores, especially on T-zone areas\n';
          details += '- Natural pore size variation across face\n';
          break;
        case 'wrinkles':
          if (age > 25) {
            details += '- Subtle expression lines around eyes (crow\'s feet)\n';
            details += '- Natural forehead lines when expressions change\n';
            details += '- Slight nasolabial folds\n';
          }
          break;
        case 'blemishes':
          details += '- One or two very subtle skin imperfections\n';
          details += '- Natural skin texture variations\n';
          break;
        case 'asymmetry':
          details += '- Subtle facial asymmetry (natural human variation)\n';
          details += '- Slightly different eye sizes and shapes\n';
          details += '- Natural eyebrow variations\n';
          break;
      }
    });

    return details;
  }

  /**
   * Build lighting specifications
   */
  private buildLightingDetails(lighting: RealisticSkinOptions['lighting']): string {
    switch (lighting) {
      case 'natural':
        return 'Natural window lighting with soft shadows and warm tones';
      case 'studio':
        return 'Professional studio lighting with key light and fill light';
      case 'soft':
        return 'Soft diffused lighting that flatters skin naturally';
      case 'dramatic':
        return 'Dramatic lighting with strong shadows and highlights';
      default:
        return 'Natural lighting with realistic shadows';
    }
  }

  /**
   * Build angle specifications
   */
  private buildAngleDetails(angle: CharacterImageRequest['angle']): string {
    switch (angle) {
      case 'front':
        return 'Direct frontal view, looking straight at camera';
      case 'profile':
        return 'Side profile view showing facial structure';
      case '3quarter':
        return 'Three-quarter angle showing both front and side features';
      case 'slight-turn':
        return 'Slight head turn to the side, still facing mostly forward';
      default:
        return 'Natural head position looking at camera';
    }
  }

  /**
   * Extract images from Gemini 2.5 Flash Image API response
   */
  private async extractImagesFromResponse(result: any): Promise<Buffer[]> {
    console.log('🔄 Extracting images from NanoBanana (Gemini 2.5 Flash Image) response...');

    const images: Buffer[] = [];

    try {
      // Handle Gemini 2.5 Flash Image response structure
      if (result.candidates && result.candidates.length > 0) {
        for (const candidate of result.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              // Check for inline image data
              if (part.inlineData && part.inlineData.data) {
                console.log('✅ Found image data in response');
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                images.push(imageBuffer);
              }
            }
          }
        }
      }

      // Alternative response structure (if different)
      if (result.response && result.response.candidates) {
        for (const candidate of result.response.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                console.log('✅ Found image data in alternative response structure');
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                images.push(imageBuffer);
              }
            }
          }
        }
      }

      console.log(`🎉 Extracted ${images.length} images from NanoBanana response`);
      return images;

    } catch (error) {
      console.error('❌ Error extracting images from response:', error);
      console.log('🔍 Full response structure:', JSON.stringify(result, null, 2));
      return [];
    }
  }

  /**
   * Save generated images to disk
   */
  private async saveCharacterImages(characterName: string, images: Buffer[]): Promise<string[]> {
    const outputDir = path.join(process.cwd(), 'generated', 'characters', characterName.toLowerCase());
    await fs.mkdir(outputDir, { recursive: true });

    const imagePaths: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const imagePath = path.join(outputDir, `reference_${i + 1}.png`);
      await fs.writeFile(imagePath, images[i]);
      imagePaths.push(imagePath);
    }

    return imagePaths;
  }

  /**
   * Generate complete character reference set
   */
  async generateCharacterReferenceSet(
    characterName: string,
    baseDescription: string,
    outfit: string,
    environment: string = 'Professional studio setup with neutral background'
  ): Promise<{ images: string[], metadata: any }> {

    const skinOptions: RealisticSkinOptions = {
      age: 25,
      skinTone: 'olive',
      imperfections: ['freckles', 'pores', 'asymmetry', 'blemishes'],
      lighting: 'natural',
      expression: 'confident and approachable smile with natural warmth'
    };

    // Generate multiple angles for character consistency
    const angles: CharacterImageRequest['angle'][] = ['front', '3quarter', 'slight-turn'];
    const allImages: string[] = [];

    for (const angle of angles) {
      const request: CharacterImageRequest = {
        characterName,
        baseDescription,
        skinOptions,
        angle,
        outfit,
        environment
      };

      try {
        const images = await this.generateCharacterImages(request);
        allImages.push(...images);
      } catch (error) {
        console.error(`❌ Failed to generate ${angle} angle for ${characterName}:`, error);
      }
    }

    const metadata = {
      characterName,
      baseDescription,
      skinOptions,
      angles: angles,
      outfit,
      environment,
      generatedAt: new Date().toISOString(),
      totalImages: allImages.length
    };

    // Save metadata
    const metadataPath = path.join(process.cwd(), 'generated', 'characters', characterName.toLowerCase(), 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return { images: allImages, metadata };
  }
}

export const nanoBananaGenerator = new NanoBananaImageGenerator();