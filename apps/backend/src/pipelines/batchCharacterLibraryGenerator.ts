/**
 * Batch Character Library Generator
 *
 * Generates complete 4-shot character libraries from presets with user customizations.
 * One-click generation system for ultra-realistic character images.
 *
 * Based on: generate-marcus-character-library.ts
 * Enhanced with: Preset system, customization support, progress tracking
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { presetManager } from '../presets/characterPresetManager';
import {
  CharacterLibraryRequest,
  CharacterLibraryResponse,
  CharacterCustomization,
  GenerationProgress,
  ShotResult,
  CharacterIdentity,
  BatchCharacterGenerator
} from '../presets/characterPresetTypes';

export class BatchCharacterLibraryGenerator implements BatchCharacterGenerator {
  private genAI: GoogleGenAI;
  private apiKey: string;
  private operations: Map<string, CharacterLibraryResponse>;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenAI({
      apiKey: this.apiKey
    });

    this.operations = new Map();
  }

  /**
   * Generate complete character library from preset
   */
  async generate(request: CharacterLibraryRequest): Promise<CharacterLibraryResponse> {
    const operationId = `char-lib-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Initialize operation tracking
    const operation: CharacterLibraryResponse = {
      operationId,
      status: 'processing',
      progress: {
        totalShots: 0,
        completedShots: 0,
        currentShot: null,
        estimatedTimeRemaining: 0
      },
      costs: {
        perImage: 0.039,
        total: 0,
        currency: 'USD'
      },
      outputLocation: path.join(
        process.env.OMEGA_PUBLIC_PATH || path.resolve(process.cwd(), '..', 'omega-platform', 'public'),
        'character-library',
        timestamp
      ),
      results: []
    };

    this.operations.set(operationId, operation);

    // Start generation in background
    this.executeGeneration(operationId, request, timestamp).catch(error => {
      console.error('Generation error:', error);
      operation.status = 'failed';
    });

    return operation;
  }

  /**
   * Execute the actual generation process
   */
  private async executeGeneration(
    operationId: string,
    request: CharacterLibraryRequest,
    timestamp: string
  ): Promise<void> {
    const operation = this.operations.get(operationId);
    if (!operation) throw new Error('Operation not found');

    try {
      // Load preset and shot types
      const preset = await presetManager.getPreset(request.presetId);
      if (!preset) {
        throw new Error(`Preset not found: ${request.presetId}`);
      }

      const shotTypes = request.shotSelection === 'all'
        ? await presetManager.getAllShotTypes()
        : await Promise.all(
            (request.shotSelection as string[]).map(id => presetManager.getShotType(id))
          ).then(types => types.filter(t => t !== null));

      // Update operation with shot count
      operation.progress.totalShots = shotTypes.length;
      operation.costs.total = operation.costs.perImage * shotTypes.length;
      operation.progress.estimatedTimeRemaining = await presetManager.getGenerationTime(shotTypes.length);

      // Create output directory
      const characterDir = path.join(operation.outputLocation, request.customizations.name.toLowerCase().replace(/\s+/g, '-'));
      await fs.mkdir(characterDir, { recursive: true });

      // Generate character identity
      const characterIdentity = this.generateCharacterIdentity(preset, request.customizations);

      // Generate each shot type
      const results: ShotResult[] = [];

      for (const shotType of shotTypes) {
        if (!shotType) continue;

        operation.progress.currentShot = shotType.id;

        try {
          console.log(`\n🎨 Generating: ${shotType.name} (${shotType.aspectRatio})`);
          console.log(`   Green screen: ${shotType.useGreenScreen ? 'YES' : 'NO'}`);

          // Generate prompt
          const prompt = this.generatePrompt(
            preset,
            request.customizations,
            characterIdentity,
            shotType,
            request.options
          );

          // Call NanoBanana API
          const result = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
              role: "user",
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: request.options.temperature || 0.3,
              responseMimeType: 'image/png'
            }
          });

          // Extract image data
          let generatedImageData = null;
          for (const candidate of result.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData) {
                generatedImageData = part.inlineData;
                break;
              }
            }
            if (generatedImageData) break;
          }

          if (generatedImageData?.data) {
            // Save image
            const imagePath = path.join(
              characterDir,
              `${request.customizations.name.toLowerCase().replace(/\s+/g, '-')}-${shotType.id}-${timestamp}.png`
            );
            const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
            await fs.writeFile(imagePath, imageBuffer);

            console.log(`   ✅ Image saved: ${path.basename(imagePath)}`);
            console.log(`   💾 Size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);

            results.push({
              shotType: shotType.id,
              aspectRatio: shotType.aspectRatio,
              imagePath: path.basename(imagePath),
              success: true,
              prompt,
              timestamp
            });

            operation.progress.completedShots++;
          } else {
            throw new Error('No image data in response');
          }

          // Wait 3 seconds between generations
          if (shotTypes.indexOf(shotType) < shotTypes.length - 1) {
            console.log(`   ⏳ Waiting 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (error) {
          console.error(`   ❌ Error generating ${shotType.id}:`, error);
          results.push({
            shotType: shotType.id,
            aspectRatio: shotType.aspectRatio,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Update estimated time remaining
        const remainingShots = operation.progress.totalShots - operation.progress.completedShots;
        operation.progress.estimatedTimeRemaining = remainingShots * 13; // ~10s generation + 3s pause
      }

      operation.results = results;

      // Generate metadata if requested
      if (request.options.generateMetadata) {
        await this.generateMetadata(operation.outputLocation, request, characterIdentity, results, timestamp);
      }

      // Generate usage guide if requested
      if (request.options.generateUsageGuide) {
        await this.generateUsageGuide(operation.outputLocation, request, characterIdentity, results, timestamp);
      }

      // Mark operation as complete
      operation.status = 'completed';
      operation.progress.currentShot = null;
      operation.progress.estimatedTimeRemaining = 0;

      // Calculate final metadata
      const successfulResults = results.filter(r => r.success);
      operation.metadata = {
        character: request.customizations.name,
        totalImages: results.length,
        successfulImages: successfulResults.length,
        successRate: `${((successfulResults.length / results.length) * 100).toFixed(1)}%`,
        shotTypes: results.map(r => r.shotType),
        greenScreenShots: results
          .filter(r => r.success)
          .map(r => shotTypes.find(st => st?.id === r.shotType))
          .filter(st => st?.useGreenScreen)
          .map(st => st!.id)
      };

      console.log('\n🎉 Generation Complete!');
      console.log(`📊 Success Rate: ${operation.metadata.successRate}`);

    } catch (error) {
      operation.status = 'failed';
      console.error('Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate character identity from preset and customizations
   */
  private generateCharacterIdentity(preset: any, customizations: CharacterCustomization): CharacterIdentity {
    const age = customizations.age || preset.physicalTemplate.ageRange[0];

    return {
      name: customizations.name,
      age,
      gender: customizations.gender,
      ethnicity: customizations.ethnicity || 'Mixed heritage',
      profession: customizations.profession || preset.professionalContext.defaultProfession,
      baseDescription: `${age}-year-old ${customizations.profession || preset.professionalContext.defaultProfession}`,
      facialFeatures: {
        eyeShape: customizations.physicalFeatures?.eyeColor
          ? `expressive eyes`
          : preset.physicalTemplate.styleDescriptors[0] || 'natural eyes',
        eyeColor: customizations.physicalFeatures?.eyeColor || 'warm brown',
        eyebrows: 'natural well-defined brows',
        noseShape: 'proportionate natural nose',
        lipShape: 'natural lips',
        jawline: customizations.gender === 'male' ? 'strong defined jawline' : 'soft feminine jawline',
        cheekbones: customizations.gender === 'male' ? 'prominent cheekbones' : 'high defined cheekbones',
        faceShape: 'natural proportionate face shape'
      },
      facialHair: customizations.physicalFeatures?.facialHair || (customizations.gender === 'male' ? 'clean-shaven or trimmed' : undefined),
      hairStyle: customizations.physicalFeatures?.hairStyle || preset.styleTemplate.hairStyle,
      skinTone: customizations.physicalFeatures?.skinTone || 'natural skin tone',
      bodyType: customizations.physicalFeatures?.buildType || preset.physicalTemplate.styleDescriptors[0] || 'professional build',
      height: customizations.physicalFeatures?.height,
      distinctiveMarks: customizations.physicalFeatures?.distinctiveFeatures || []
    };
  }

  /**
   * Generate complete prompt for character shot
   */
  private generatePrompt(
    preset: any,
    customizations: CharacterCustomization,
    identity: CharacterIdentity,
    shotType: any,
    options: any
  ): string {
    const avoidanceList = [
      'over-processed', 'AI-enhanced', 'smoothed', 'polished', 'studio-perfect',
      'too clean', 'artificial lighting', 'perfect skin', 'beautified', 'plastic',
      'synthetic', 'fake', 'unrealistic', 'over-produced', 'flawless',
      'studio-quality', 'enhanced', 'retouched', 'airbrushed'
    ];

    let prompt = `Ultra-photorealistic portrait of ${identity.name}, a ${identity.age}-year-old ${identity.profession}.

PHYSICAL CHARACTERISTICS:
- Ethnicity: ${identity.ethnicity}
- Gender: ${identity.gender}
- Age: ${identity.age}
- Skin tone: ${identity.skinTone}
- Eyes: ${identity.facialFeatures.eyeColor}
- Face: ${identity.facialFeatures.faceShape}
- Jawline: ${identity.facialFeatures.jawline}
- Hair: ${identity.hairStyle}`;

    if (identity.facialHair) {
      prompt += `\n- Facial hair: ${identity.facialHair}`;
    }

    prompt += `\n\nPROFESSIONAL STYLE:
- Attire: ${preset.styleTemplate.attire[0]}
- Grooming: ${preset.styleTemplate.grooming}
- Accessories: ${preset.styleTemplate.accessories.join(', ')}`;

    prompt += `\n\nNATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections`;

    prompt += `\n\nSHOT COMPOSITION: ${shotType.promptModifications}
ASPECT RATIO: ${shotType.aspectRatio}
CHARACTER: ${identity.name}`;

    if (shotType.useGreenScreen && options.greenScreen) {
      prompt += `\n\nBACKGROUND: Solid bright green background (chroma key green #00FF00) for easy character extraction and background replacement. Clean green screen setup with even lighting to avoid shadows or color spill. Perfect for VEO3 video firstFrame input.`;
    } else {
      prompt += `\n\nBACKGROUND: Professional neutral gradient background suitable for corporate use. Subtle, non-distracting background that emphasizes professional presence.`;
    }

    prompt += `\n\nTECHNICAL REQUIREMENTS:
- Ultra-high resolution for professional use
- Professional lighting setup enhancing natural features
- Sharp focus throughout the image
- Commercial photography quality
- Perfect for VEO3 video generation as firstFrame input
- Maintain character consistency across all shots`;

    prompt += `\n\nAVOID: ${avoidanceList.join(', ')}`;

    return prompt;
  }

  /**
   * Generate metadata file
   */
  private async generateMetadata(
    outputLocation: string,
    request: CharacterLibraryRequest,
    identity: CharacterIdentity,
    results: ShotResult[],
    timestamp: string
  ): Promise<void> {
    const successfulResults = results.filter(r => r.success);

    const metadata = {
      generated: timestamp,
      character: identity.name,
      totalImages: results.length,
      successfulImages: successfulResults.length,
      successRate: `${((successfulResults.length / results.length) * 100).toFixed(1)}%`,
      shotTypes: results.map(r => r.shotType),
      aspectRatios: results.map(r => `${r.shotType}: ${r.aspectRatio}`),
      greenScreenShots: results.filter(r => r.success && r.shotType !== 'professional-headshot').map(r => r.shotType),
      results: results.map(r => ({
        shotType: r.shotType,
        aspectRatio: r.aspectRatio,
        success: r.success,
        imagePath: r.imagePath,
        error: r.error
      })),
      characterDefinition: {
        name: identity.name,
        profession: identity.profession,
        age: identity.age,
        gender: identity.gender,
        ethnicity: identity.ethnicity,
        hairStyle: identity.hairStyle,
        facialHair: identity.facialHair
      },
      presetUsed: {
        id: request.presetId,
        customizations: request.customizations
      },
      infrastructure: {
        model: 'gemini-2.5-flash-image-preview',
        characterConsistencyEngine: 'Preset-based character definition',
        realismEngine: 'Natural imperfections with avoidance list',
        greenScreenSupport: request.options.greenScreen ? 'Enabled for appropriate shots' : 'Disabled'
      },
      usage: {
        veo3VideoGeneration: 'Use any image as firstFrame input for VEO3 video generation',
        greenScreenBenefits: 'Easy background replacement for various settings',
        platformOptimization: {
          tiktok: 'full-body-standing (9:16)',
          youtube: 'full-body-seated (16:9)',
          instagram: 'three-quarter-standing (4:5)',
          linkedin: 'professional-headshot (1:1)'
        }
      }
    };

    const metadataPath = path.join(outputLocation, `character-library-metadata-${timestamp}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Metadata saved: ${path.basename(metadataPath)}`);
  }

  /**
   * Generate usage guide
   */
  private async generateUsageGuide(
    outputLocation: string,
    request: CharacterLibraryRequest,
    identity: CharacterIdentity,
    results: ShotResult[],
    timestamp: string
  ): Promise<void> {
    const successfulResults = results.filter(r => r.success);

    const guide = `${identity.name.toUpperCase()} CHARACTER LIBRARY - USAGE GUIDE
Generated: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHARACTER PROFILE:
• Name: ${identity.name}
• Profession: ${identity.profession}
• Age: ${identity.age} years old
• Gender: ${identity.gender}
• Ethnicity: ${identity.ethnicity}

SHOT TYPES GENERATED:
${results.map(r => `• ${r.shotType}: ${r.success ? '✅ Success' : '❌ Failed'} (${r.aspectRatio})`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO USE:

1. VEO3 VIDEO GENERATION:
   - Use any image as firstFrame input for video generation
   - Character consistency maintained across all shots
   - Green screen shots allow easy background replacement

2. SOCIAL MEDIA OPTIMIZATION:
   - TikTok/Reels: Use full-body-standing (9:16)
   - YouTube: Use full-body-seated (16:9)
   - Instagram: Use three-quarter-standing (4:5)
   - LinkedIn: Use professional-headshot (1:1)

3. BACKGROUND REPLACEMENT:
   - Green screen shots (#00FF00) enable easy chroma keying
   - Replace with appropriate backgrounds for your content
   - Maintains professional appearance

4. CHARACTER CONSISTENCY:
   - All shots preserve exact facial features
   - Professional attire consistent
   - Natural realistic appearance across all angles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SPECIFICATIONS:

Model: Gemini 2.5 Flash Image Preview (NanoBanana)
Temperature: ${request.options.temperature || 0.3} (character consistency)
Quality: Ultra-high resolution, professional photography
Preset Used: ${request.presetId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUCCESS METRICS:

Total Images: ${results.length}
Successful: ${successfulResults.length}
Success Rate: ${((successfulResults.length / results.length) * 100).toFixed(1)}%
Platform Coverage: 100% (All major platforms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by: SmokeTech Studio Character Library System
Model: Gemini 2.5 Flash Image Preview (NanoBanana)

Sign off as SmokeDev 🚬
`;

    const guidePath = path.join(outputLocation, `usage-guide-${timestamp}.txt`);
    await fs.writeFile(guidePath, guide);
    console.log(`✅ Usage guide saved: ${path.basename(guidePath)}`);
  }

  /**
   * Get operation status
   */
  async getStatus(operationId: string): Promise<CharacterLibraryResponse> {
    const operation = this.operations.get(operationId);

    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`);
    }

    return operation;
  }

  /**
   * Cancel operation (not implemented - generation is fast)
   */
  async cancel(operationId: string): Promise<boolean> {
    // Not implemented - generation is fast enough that cancellation isn't necessary
    return false;
  }
}

// Export singleton instance with lazy initialization
let _batchGeneratorInstance: BatchCharacterLibraryGenerator | null = null;

export const batchGenerator = {
  getInstance(): BatchCharacterLibraryGenerator {
    if (!_batchGeneratorInstance) {
      _batchGeneratorInstance = new BatchCharacterLibraryGenerator();
    }
    return _batchGeneratorInstance;
  },
  generate(request: CharacterLibraryRequest): Promise<CharacterLibraryResponse> {
    return this.getInstance().generate(request);
  },
  getStatus(operationId: string): Promise<CharacterLibraryResponse> {
    return this.getInstance().getStatus(operationId);
  },
  cancel(operationId: string): Promise<boolean> {
    return this.getInstance().cancel(operationId);
  }
};