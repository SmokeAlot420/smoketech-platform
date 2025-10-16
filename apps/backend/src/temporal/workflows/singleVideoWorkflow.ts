/**
 * Single Video Workflow - Temporal Orchestration
 *
 * Executes the ultra-realistic single video generation pipeline using Temporal.
 *
 * Workflow Steps (with automatic checkpointing):
 * 1. Generate character image with NanoBanana
 * 2. Generate video segment with VEO3
 * 3. Optional: Enhance with Topaz (if configured)
 *
 * Features:
 * - Automatic checkpointing after each step
 * - Pause/Resume via signals
 * - Progress tracking via queries
 * - Crash recovery with state persistence
 * - Cost tracking throughout workflow
 */

import {
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  proxyActivities,
  ApplicationFailure
} from '@temporalio/workflow';

import type * as activities from '../activities/index.js';

/**
 * Workflow input configuration
 */
export interface SingleVideoWorkflowInput {
  // Character configuration
  characterPrompt: string;
  temperature?: number;

  // Video configuration
  videoPrompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'fast' | 'standard';
  platform?: 'tiktok' | 'youtube' | 'instagram';

  // Optional enhancement
  enhanceWithTopaz?: boolean;
}

/**
 * Workflow progress state
 */
export interface WorkflowProgress {
  currentStage: 'initializing' | 'generating_character' | 'generating_video' | 'enhancing' | 'complete' | 'failed';
  stageProgress: number; // 0-100
  overallProgress: number; // 0-100
  characterImagePath?: string;
  videoPath?: string;
  enhancedVideoPath?: string;
  totalCost: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

/**
 * Workflow result
 */
export interface SingleVideoWorkflowResult {
  success: boolean;
  videoPath: string;
  characterImagePath: string;
  enhancedVideoPath?: string;
  totalCost: number;
  totalTime: number;
  stages: {
    characterGeneration: { time: number; cost: number };
    videoGeneration: { time: number; cost: number };
    enhancement?: { time: number; cost: number };
  };
  error?: string;
}

// Signals for workflow control
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');
export const cancelSignal = defineSignal('cancel');

// Queries for progress tracking
export const progressQuery = defineQuery<WorkflowProgress>('progress');
export const costQuery = defineQuery<number>('totalCost');
export const statusQuery = defineQuery<string>('status');

/**
 * Single Video Workflow
 *
 * Generates one ultra-realistic video with automatic checkpointing and fault tolerance.
 *
 * @param input - Workflow configuration
 * @returns Result with video paths and metrics
 */
export async function singleVideoWorkflow(
  input: SingleVideoWorkflowInput
): Promise<SingleVideoWorkflowResult> {
  // Workflow state (persisted across crashes)
  let isPaused = false;
  let isCancelled = false;

  const progress: WorkflowProgress = {
    currentStage: 'initializing',
    stageProgress: 0,
    overallProgress: 0,
    totalCost: 0
  };

  const startTime = Date.now();

  // Configure activities with appropriate timeouts
  const {
    generateCharacterImage,
    generateVideoFromImage
  } = proxyActivities<typeof activities>({
    startToCloseTimeout: '30 minutes', // Max time for entire activity
    retry: {
      initialInterval: '10 seconds',
      maximumAttempts: 3,
      backoffCoefficient: 2.0,
      nonRetryableErrorTypes: ['ApplicationFailure']
    }
  });

  // Signal handlers
  setHandler(pauseSignal, () => {
    console.log('⏸️  [Workflow] Pause signal received');
    isPaused = true;
  });

  setHandler(resumeSignal, () => {
    console.log('▶️  [Workflow] Resume signal received');
    isPaused = false;
  });

  setHandler(cancelSignal, () => {
    console.log('🛑 [Workflow] Cancel signal received');
    isCancelled = true;
  });

  // Query handlers
  setHandler(progressQuery, () => progress);
  setHandler(costQuery, () => progress.totalCost);
  setHandler(statusQuery, () => progress.currentStage);

  try {
    console.log('🚀 [Workflow] Starting Single Video generation');
    console.log(`📋 [Workflow] Character prompt: ${input.characterPrompt.substring(0, 100)}...`);
    console.log(`🎬 [Workflow] Video prompt: ${input.videoPrompt.substring(0, 100)}...`);

    // === CHECKPOINT 1: Character Generation ===
    progress.currentStage = 'generating_character';
    progress.stageProgress = 0;
    progress.overallProgress = 10;

    // Check for pause before starting
    await condition(() => !isPaused);
    if (isCancelled) {
      throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
    }

    console.log('📸 [Workflow] Stage 1: Generating character image with NanoBanana...');

    const characterResult = await generateCharacterImage({
      prompt: input.characterPrompt,
      temperature: input.temperature || 0.3,
      numImages: 1
    });

    progress.characterImagePath = characterResult.images[0].imagePath;
    progress.totalCost += characterResult.totalCost;
    progress.stageProgress = 100;
    progress.overallProgress = 40;

    console.log(`✅ [Workflow] Character generated: ${progress.characterImagePath}`);
    console.log(`💰 [Workflow] Stage 1 cost: $${characterResult.totalCost.toFixed(4)}`);

    // === CHECKPOINT 2: Video Generation ===
    // Check for pause before continuing
    await condition(() => !isPaused);
    if (isCancelled) {
      throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
    }

    progress.currentStage = 'generating_video';
    progress.stageProgress = 0;
    progress.overallProgress = 50;

    console.log('🎬 [Workflow] Stage 2: Generating video with VEO3...');

    const videoResult = await generateVideoFromImage({
      prompt: input.videoPrompt,
      duration: input.duration || 8,
      aspectRatio: input.aspectRatio || '16:9',
      model: input.model || 'fast',
      firstFrame: progress.characterImagePath!
    });

    progress.videoPath = videoResult.result.videos[0].videoPath;
    progress.totalCost += videoResult.cost;
    progress.stageProgress = 100;
    progress.overallProgress = 90;

    console.log(`✅ [Workflow] Video generated: ${progress.videoPath}`);
    console.log(`💰 [Workflow] Stage 2 cost: $${videoResult.cost.toFixed(4)}`);

    // === CHECKPOINT 3: Enhancement (Optional) ===
    if (input.enhanceWithTopaz) {
      await condition(() => !isPaused);
      if (isCancelled) {
        throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
      }

      progress.currentStage = 'enhancing';
      progress.stageProgress = 0;
      progress.overallProgress = 95;

      console.log('✨ [Workflow] Stage 3: Enhancing with Topaz...');

      // TODO: Add Topaz enhancement activity when implemented
      // For now, skip this step
      console.log('⚠️  [Workflow] Topaz enhancement not yet implemented, skipping...');

      progress.stageProgress = 100;
    }

    // === WORKFLOW COMPLETE ===
    progress.currentStage = 'complete';
    progress.overallProgress = 100;

    const totalTime = Date.now() - startTime;

    console.log('🎉 [Workflow] Single Video generation complete!');
    console.log(`💰 [Workflow] Total cost: $${progress.totalCost.toFixed(4)}`);
    console.log(`⏱️  [Workflow] Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`🎥 [Workflow] Final video: ${progress.videoPath}`);

    return {
      success: true,
      videoPath: progress.videoPath!,
      characterImagePath: progress.characterImagePath!,
      enhancedVideoPath: progress.enhancedVideoPath,
      totalCost: progress.totalCost,
      totalTime,
      stages: {
        characterGeneration: {
          time: characterResult.totalTime,
          cost: characterResult.totalCost
        },
        videoGeneration: {
          time: videoResult.totalTime,
          cost: videoResult.cost
        }
      }
    };

  } catch (error) {
    progress.currentStage = 'failed';
    progress.error = error instanceof Error ? error.message : String(error);

    console.error('❌ [Workflow] Single Video generation failed');
    console.error('Error:', progress.error);

    const totalTime = Date.now() - startTime;

    return {
      success: false,
      videoPath: progress.videoPath || '',
      characterImagePath: progress.characterImagePath || '',
      totalCost: progress.totalCost,
      totalTime,
      error: progress.error,
      stages: {
        characterGeneration: { time: 0, cost: 0 },
        videoGeneration: { time: 0, cost: 0 }
      }
    };
  }
}
