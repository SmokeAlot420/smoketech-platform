/**
 * Temporal Activity Wrapper for NanoBanana (Gemini 2.5 Flash Image) Service
 *
 * This module wraps the VertexAINanoBananaService for use in Temporal workflows.
 *
 * Activity Configuration (set in workflow):
 * - startToCloseTimeout: '10 minutes'
 * - retry: {
 *     initialInterval: '5s',
 *     maximumAttempts: 3,
 *     backoffCoefficient: 2.0
 *   }
 *
 * Features:
 * - Automatic state persistence at activity boundaries
 * - Exponential backoff retry on failures
 * - Activity heartbeat for progress tracking
 * - Comprehensive error handling and logging
 */

// CRITICAL: Load environment variables for activities
// Temporal activities are bundled separately and need explicit dotenv loading
import dotenv from 'dotenv';
dotenv.config();

import { Context } from '@temporalio/activity';
import { VertexAINanoBananaService, VertexAIGeneratedImage } from '../../services/vertexAINanoBanana.js';

/**
 * Input parameters for character image generation activity
 */
export interface GenerateCharacterImageInput {
  prompt: string;
  temperature?: number;
  numImages?: number;
  context?: string;
}

/**
 * Result from character image generation activity
 */
export interface GenerateCharacterImageResult {
  images: VertexAIGeneratedImage[];
  totalCost: number;
  totalTime: number;
  modelUsed: string;
}

/**
 * Generate character images using NanoBanana (Gemini 2.5 Flash Image)
 *
 * This activity wraps the VertexAINanoBananaService for Temporal workflows,
 * adding automatic checkpointing, retries, and heartbeat monitoring.
 *
 * @param input - Generation parameters
 * @returns Generated images with metadata
 *
 * @example
 * ```typescript
 * // In workflow:
 * const images = await proxyActivities<typeof activities>({
 *   startToCloseTimeout: '10 minutes',
 *   retry: {
 *     initialInterval: '5s',
 *     maximumAttempts: 3,
 *     backoffCoefficient: 2.0
 *   }
 * }).generateCharacterImage({
 *   prompt: characterPrompt,
 *   temperature: 0.3,
 *   numImages: 1
 * });
 * ```
 */
export async function generateCharacterImage(
  input: GenerateCharacterImageInput
): Promise<GenerateCharacterImageResult> {
  // Activity context is optional for standalone testing
  let activityContext;
  try {
    activityContext = Context.current();
  } catch {
    // Not in Temporal worker context - standalone execution
    activityContext = null;
  }
  const startTime = Date.now();

  try {
    console.log('🎬 [Activity] Starting NanoBanana character image generation');
    console.log(`📝 [Activity] Prompt length: ${input.prompt.length} characters`);
    console.log(`🌡️ [Activity] Temperature: ${input.temperature || 0.4}`);
    console.log(`🔢 [Activity] Number of images: ${input.numImages || 1}`);

    // Send initial heartbeat to indicate activity is alive (if in Temporal context)
    activityContext?.heartbeat({ stage: 'initialization', progress: 0 });

    // Initialize NanoBanana service
    const nanoBananaService = new VertexAINanoBananaService();

    // Send heartbeat before generation starts (if in Temporal context)
    activityContext?.heartbeat({ stage: 'generating', progress: 10 });

    // Generate images
    const images = await nanoBananaService.generateImage(input.prompt, {
      temperature: input.temperature,
      numImages: input.numImages
    });

    // Send heartbeat after generation completes (if in Temporal context)
    activityContext?.heartbeat({ stage: 'processing_results', progress: 90 });

    // Calculate total cost and time
    const totalCost = images.reduce((sum, img) => sum + img.metadata.cost, 0);
    const totalTime = Date.now() - startTime;

    console.log(`✅ [Activity] Generated ${images.length} image(s) in ${totalTime}ms`);
    console.log(`💰 [Activity] Total cost: $${totalCost.toFixed(4)}`);
    console.log(`🖼️ [Activity] Images saved to: ${images.map(img => img.imagePath).join(', ')}`);

    // Send final heartbeat (if in Temporal context)
    activityContext?.heartbeat({ stage: 'complete', progress: 100 });

    return {
      images,
      totalCost,
      totalTime,
      modelUsed: images[0]?.metadata.modelUsed || 'gemini-2.5-flash-image-preview'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] NanoBanana generation failed:', errorMessage);
    console.error('🔍 [Activity] Error details:', error);

    // Throw error to trigger Temporal retry mechanism
    throw new Error(`NanoBanana generation failed: ${errorMessage}`);
  }
}

/**
 * Generate multiple character angles for consistency
 *
 * Generates front, 3/4, and profile views of the same character
 * for maximum consistency across video segments.
 *
 * @param input - Base character prompt
 * @returns Object with images for each angle
 */
export async function generateCharacterAngles(
  input: GenerateCharacterImageInput
): Promise<{
  front: VertexAIGeneratedImage;
  threeQuarter: VertexAIGeneratedImage;
  profile: VertexAIGeneratedImage;
  totalCost: number;
  totalTime: number;
}> {
  let activityContext;
  try {
    activityContext = Context.current();
  } catch {
    activityContext = null;
  }
  const startTime = Date.now();
  const nanoBananaService = new VertexAINanoBananaService();

  try {
    console.log('🎬 [Activity] Starting multi-angle character generation');

    // Front view
    activityContext?.heartbeat({ stage: 'front_view', progress: 10 });
    console.log('📸 [Activity] Generating front view...');
    const frontImages = await nanoBananaService.generateImage(
      `${input.prompt}\n\nCamera angle: Direct front-facing view`,
      { temperature: input.temperature || 0.3, numImages: 1 }
    );

    // 3/4 view
    activityContext?.heartbeat({ stage: 'three_quarter_view', progress: 45 });
    console.log('📸 [Activity] Generating 3/4 view...');
    const threeQuarterImages = await nanoBananaService.generateImage(
      `${input.prompt}\n\nCamera angle: 3/4 angle view, preserve exact facial features`,
      { temperature: input.temperature || 0.3, numImages: 1 }
    );

    // Profile view
    activityContext?.heartbeat({ stage: 'profile_view', progress: 80 });
    console.log('📸 [Activity] Generating profile view...');
    const profileImages = await nanoBananaService.generateImage(
      `${input.prompt}\n\nCamera angle: Side profile view, preserve exact facial features`,
      { temperature: input.temperature || 0.3, numImages: 1 }
    );

    const totalCost = [frontImages[0], threeQuarterImages[0], profileImages[0]]
      .reduce((sum, img) => sum + img.metadata.cost, 0);
    const totalTime = Date.now() - startTime;

    activityContext?.heartbeat({ stage: 'complete', progress: 100 });

    console.log(`✅ [Activity] Generated all 3 angles in ${totalTime}ms`);
    console.log(`💰 [Activity] Total cost: $${totalCost.toFixed(4)}`);

    return {
      front: frontImages[0],
      threeQuarter: threeQuarterImages[0],
      profile: profileImages[0],
      totalCost,
      totalTime
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] Multi-angle generation failed:', errorMessage);
    throw new Error(`Multi-angle generation failed: ${errorMessage}`);
  }
}

/**
 * Batch generate multiple character images
 *
 * Useful for generating variations or A/B testing different prompts.
 *
 * @param inputs - Array of generation inputs
 * @returns Array of results for each input
 */
export async function batchGenerateCharacterImages(
  inputs: GenerateCharacterImageInput[]
): Promise<GenerateCharacterImageResult[]> {
  let activityContext;
  try {
    activityContext = Context.current();
  } catch {
    activityContext = null;
  }
  const nanoBananaService = new VertexAINanoBananaService();
  const results: GenerateCharacterImageResult[] = [];

  try {
    console.log(`🎬 [Activity] Starting batch generation of ${inputs.length} images`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const progress = ((i + 1) / inputs.length) * 100;

      activityContext?.heartbeat({ stage: `batch_${i + 1}/${inputs.length}`, progress });

      console.log(`📸 [Activity] Generating image ${i + 1}/${inputs.length}...`);

      const startTime = Date.now();
      const images = await nanoBananaService.generateImage(input.prompt, {
        temperature: input.temperature,
        numImages: input.numImages
      });

      const totalCost = images.reduce((sum, img) => sum + img.metadata.cost, 0);
      const totalTime = Date.now() - startTime;

      results.push({
        images,
        totalCost,
        totalTime,
        modelUsed: images[0]?.metadata.modelUsed || 'gemini-2.5-flash-image-preview'
      });

      console.log(`✅ [Activity] Generated batch ${i + 1} in ${totalTime}ms ($${totalCost.toFixed(4)})`);
    }

    const overallCost = results.reduce((sum, r) => sum + r.totalCost, 0);
    console.log(`✅ [Activity] Batch complete. Total cost: $${overallCost.toFixed(4)}`);

    return results;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] Batch generation failed:', errorMessage);
    throw new Error(`Batch generation failed: ${errorMessage}`);
  }
}
