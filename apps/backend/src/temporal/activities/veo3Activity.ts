/**
 * Temporal Activity Wrapper for VEO3 (Gemini Video Generation) Service
 *
 * This module wraps the VEO3Service for use in Temporal workflows.
 *
 * Activity Configuration (set in workflow):
 * - startToCloseTimeout: '15 minutes'
 * - retry: {
 *     initialInterval: '10s',
 *     maximumAttempts: 3,
 *     backoffCoefficient: 2.0
 *   }
 *
 * Features:
 * - Automatic state persistence at activity boundaries
 * - Exponential backoff retry on API failures
 * - Progress tracking via heartbeat
 * - Checkpoint saving for long video generation
 */

// CRITICAL: Load environment variables for activities
// Temporal activities are bundled separately and need explicit dotenv loading
import dotenv from 'dotenv';
dotenv.config();

import { Context } from '@temporalio/activity';
import { VEO3Service, VideoGenerationRequest, VideoGenerationResult } from '../../services/veo3Service.js';

/**
 * Input parameters for video generation activity
 */
export interface GenerateVideoInput extends VideoGenerationRequest {
  // All parameters from VideoGenerationRequest are available
}

/**
 * Result from video generation activity
 */
export interface GenerateVideoActivityResult {
  result: VideoGenerationResult;
  totalTime: number;
  cost: number;
}

/**
 * Generate video using VEO3 (Gemini Video Generation)
 *
 * This activity wraps the VEO3Service for Temporal workflows,
 * adding automatic checkpointing, retries, and heartbeat monitoring.
 *
 * @param input - Video generation parameters
 * @returns Generated video with metadata
 *
 * @example
 * ```typescript
 * // In workflow:
 * const video = await proxyActivities<typeof activities>({
 *   startToCloseTimeout: '15 minutes',
 *   retry: {
 *     initialInterval: '10s',
 *     maximumAttempts: 3,
 *     backoffCoefficient: 2.0
 *   }
 * }).generateVideo({
 *   prompt: videoPrompt,
 *   duration: 8,
 *   firstFrame: characterImagePath
 * });
 * ```
 */
export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoActivityResult> {
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
    console.log('🎬 [Activity] Starting VEO3 video generation');
    console.log(`📝 [Activity] Prompt type: ${typeof input.prompt}`);
    console.log(`⏱️ [Activity] Duration: ${input.duration || 8}s`);
    console.log(`📐 [Activity] Aspect ratio: ${input.aspectRatio || '16:9'}`);
    console.log(`🎭 [Activity] Model: ${input.model || 'fast'}`);

    // Send initial heartbeat (if in Temporal context)
    activityContext?.heartbeat({ stage: 'initialization', progress: 0 });

    // Initialize VEO3 service
    const veo3Service = new VEO3Service();

    // Send heartbeat before generation starts
    activityContext?.heartbeat({ stage: 'generating', progress: 10 });

    // Generate video
    const result = await veo3Service.generateVideoSegment(input);

    // Send heartbeat after generation completes
    activityContext?.heartbeat({ stage: 'processing_results', progress: 90 });

    // Calculate total time and cost
    const totalTime = Date.now() - startTime;
    const cost = result.metadata?.cost || calculateVEO3Cost(input);

    console.log(`✅ [Activity] Generated ${result.videos.length} video(s) in ${totalTime}ms`);
    console.log(`💰 [Activity] Total cost: $${cost.toFixed(4)}`);
    console.log(`🎥 [Activity] Videos saved to: ${result.videos.map(v => v.videoPath).join(', ')}`);

    // Send final heartbeat
    activityContext?.heartbeat({ stage: 'complete', progress: 100 });

    return {
      result,
      totalTime,
      cost
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] VEO3 generation failed:', errorMessage);
    console.error('🔍 [Activity] Error details:', error);

    // Throw error to trigger Temporal retry mechanism
    throw new Error(`VEO3 generation failed: ${errorMessage}`);
  }
}

/**
 * Generate a sequence of video segments
 *
 * Useful for creating longer videos by stitching multiple 8-second segments.
 * Each segment gets checkpointed automatically.
 *
 * @param segments - Array of video generation requests
 * @returns Array of results for each segment
 */
export async function generateVideoSequence(
  segments: GenerateVideoInput[]
): Promise<GenerateVideoActivityResult[]> {
  let activityContext;
  try {
    activityContext = Context.current();
  } catch {
    activityContext = null;
  }

  const veo3Service = new VEO3Service();
  const results: GenerateVideoActivityResult[] = [];

  try {
    console.log(`🎬 [Activity] Starting video sequence generation (${segments.length} segments)`);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const progress = ((i + 1) / segments.length) * 100;

      activityContext?.heartbeat({ stage: `segment_${i + 1}/${segments.length}`, progress });

      console.log(`🎥 [Activity] Generating segment ${i + 1}/${segments.length}...`);

      const startTime = Date.now();
      const result = await veo3Service.generateVideoSegment(segment);
      const totalTime = Date.now() - startTime;
      const cost = result.metadata?.cost || calculateVEO3Cost(segment);

      results.push({
        result,
        totalTime,
        cost
      });

      console.log(`✅ [Activity] Segment ${i + 1} complete in ${totalTime}ms ($${cost.toFixed(4)})`);
    }

    const overallCost = results.reduce((sum, r) => sum + r.cost, 0);
    console.log(`✅ [Activity] Sequence complete. Total cost: $${overallCost.toFixed(4)}`);

    return results;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] Video sequence generation failed:', errorMessage);
    throw new Error(`Video sequence generation failed: ${errorMessage}`);
  }
}

/**
 * Generate video from character image (image-to-video workflow)
 *
 * This is the primary use case for ultra-realistic video generation:
 * - NanoBanana generates ultra-realistic character image
 * - VEO3 animates that image into video
 *
 * @param input - Video generation parameters with firstFrame
 * @returns Generated video result
 */
export async function generateVideoFromImage(
  input: GenerateVideoInput & { firstFrame: string }
): Promise<GenerateVideoActivityResult> {
  let activityContext;
  try {
    activityContext = Context.current();
  } catch {
    activityContext = null;
  }
  const startTime = Date.now();

  try {
    console.log('🎬 [Activity] Starting image-to-video generation');
    console.log(`🖼️ [Activity] Reference image: ${input.firstFrame}`);
    console.log(`📝 [Activity] Action prompt: ${typeof input.prompt === 'string' ? input.prompt.substring(0, 100) : 'JSON'}`);

    activityContext?.heartbeat({ stage: 'loading_image', progress: 5 });

    const veo3Service = new VEO3Service();

    activityContext?.heartbeat({ stage: 'generating_video', progress: 20 });

    const result = await veo3Service.generateVideoSegment(input);

    const totalTime = Date.now() - startTime;
    const cost = result.metadata?.cost || calculateVEO3Cost(input);

    activityContext?.heartbeat({ stage: 'complete', progress: 100 });

    console.log(`✅ [Activity] Image-to-video complete in ${totalTime}ms`);
    console.log(`💰 [Activity] Cost: $${cost.toFixed(4)}`);
    console.log(`🎥 [Activity] Video: ${result.videos[0]?.videoPath}`);

    return {
      result,
      totalTime,
      cost
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Activity] Image-to-video generation failed:', errorMessage);
    throw new Error(`Image-to-video generation failed: ${errorMessage}`);
  }
}

/**
 * Calculate VEO3 cost based on request parameters
 *
 * Pricing (as of 2025):
 * - Fast model: $1.20 per video
 * - Standard model: $3.20 per video
 *
 * @param input - Video generation request
 * @returns Estimated cost in dollars
 */
function calculateVEO3Cost(input: GenerateVideoInput): number {
  const videoCount = input.videoCount || 1;
  const costPerVideo = input.model === 'standard' ? 3.20 : 1.20;
  return videoCount * costPerVideo;
}
