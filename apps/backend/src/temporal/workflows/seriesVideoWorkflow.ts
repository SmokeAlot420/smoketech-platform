/**
 * Series Video Workflow - Temporal Orchestration
 *
 * Generates multiple videos with the same character for consistency across a series.
 *
 * Workflow Steps (with automatic checkpointing):
 * 1. Generate character image once (reused for all videos)
 * 2. Loop through scenarios generating videos with checkpoints
 * 3. Track progress for each video in the series
 *
 * Features:
 * - Single character generation for consistency
 * - Checkpoint after each video generation
 * - Batch processing optimization
 * - Per-video progress tracking
 * - Pause/Resume/Cancel support
 * - Character consistency across all videos
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
 * Video scenario configuration
 */
export interface VideoScenario {
  videoPrompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'fast' | 'standard';
}

/**
 * Workflow input configuration
 */
export interface SeriesVideoWorkflowInput {
  // Character configuration (used for all videos)
  characterPrompt: string;
  temperature?: number;

  // Video scenarios
  scenarios: VideoScenario[];

  // Optional platform optimization
  platform?: 'tiktok' | 'youtube' | 'instagram';
}

/**
 * Per-video result
 */
export interface VideoResult {
  scenarioIndex: number;
  videoPath: string;
  cost: number;
  duration: number;
  success: boolean;
  error?: string;
}

/**
 * Workflow progress state
 */
export interface SeriesWorkflowProgress {
  currentStage: 'initializing' | 'generating_character' | 'generating_videos' | 'complete' | 'failed';
  characterImagePath?: string;
  videosGenerated: number;
  totalVideos: number;
  currentVideoIndex: number;
  overallProgress: number; // 0-100
  totalCost: number;
  videos: VideoResult[];
  error?: string;
}

/**
 * Workflow result
 */
export interface SeriesVideoWorkflowResult {
  success: boolean;
  characterImagePath: string;
  videos: VideoResult[];
  totalCost: number;
  totalTime: number;
  stages: {
    characterGeneration: { time: number; cost: number };
    videoGeneration: { time: number; cost: number };
  };
  error?: string;
}

// Signals for workflow control
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');
export const cancelSignal = defineSignal('cancel');

// Queries for progress tracking
export const progressQuery = defineQuery<SeriesWorkflowProgress>('progress');
export const costQuery = defineQuery<number>('totalCost');
export const statusQuery = defineQuery<string>('status');

/**
 * Series Video Workflow
 *
 * Generates multiple videos with the same character for consistency.
 *
 * @param input - Workflow configuration with scenarios
 * @returns Result with all generated videos and metrics
 */
export async function seriesVideoWorkflow(
  input: SeriesVideoWorkflowInput
): Promise<SeriesVideoWorkflowResult> {
  // Workflow state (persisted across crashes)
  let isPaused = false;
  let isCancelled = false;

  const progress: SeriesWorkflowProgress = {
    currentStage: 'initializing',
    videosGenerated: 0,
    totalVideos: input.scenarios.length,
    currentVideoIndex: 0,
    overallProgress: 0,
    totalCost: 0,
    videos: []
  };

  const startTime = Date.now();
  let characterGenTime = 0;
  let characterGenCost = 0;
  let videoGenTime = 0;
  let videoGenCost = 0;

  // Configure activities with appropriate timeouts
  const {
    generateCharacterImage,
    generateVideoFromImage
  } = proxyActivities<typeof activities>({
    startToCloseTimeout: '30 minutes',
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
    console.log('🚀 [Workflow] Starting Series Video generation');
    console.log(`📋 [Workflow] Character prompt: ${input.characterPrompt.substring(0, 100)}...`);
    console.log(`🎬 [Workflow] Generating ${input.scenarios.length} videos in series`);

    // === CHECKPOINT 1: Character Generation ===
    progress.currentStage = 'generating_character';
    progress.overallProgress = 5;

    await condition(() => !isPaused);
    if (isCancelled) {
      throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
    }

    console.log('📸 [Workflow] Stage 1: Generating character image (used for all videos)...');

    const charStartTime = Date.now();
    const characterResult = await generateCharacterImage({
      prompt: input.characterPrompt,
      temperature: input.temperature || 0.3,
      numImages: 1
    });

    progress.characterImagePath = characterResult.images[0].imagePath;
    progress.totalCost += characterResult.totalCost;
    characterGenTime = Date.now() - charStartTime;
    characterGenCost = characterResult.totalCost;

    console.log(`✅ [Workflow] Character generated: ${progress.characterImagePath}`);
    console.log(`💰 [Workflow] Character cost: $${characterResult.totalCost.toFixed(4)}`);

    // === CHECKPOINT 2+: Video Generation Loop ===
    progress.currentStage = 'generating_videos';
    progress.overallProgress = 20;

    const videoStartTime = Date.now();

    console.log(`🎬 [Workflow] Stage 2: Generating ${input.scenarios.length} videos with same character...`);

    for (let i = 0; i < input.scenarios.length; i++) {
      // Check for pause/cancel before each video
      await condition(() => !isPaused);
      if (isCancelled) {
        throw ApplicationFailure.create({ message: 'Workflow cancelled by user' });
      }

      const scenario = input.scenarios[i];
      progress.currentVideoIndex = i;

      const videoProgress = 20 + ((i / input.scenarios.length) * 70);
      progress.overallProgress = Math.round(videoProgress);

      console.log(`\n🎥 [Workflow] Generating video ${i + 1}/${input.scenarios.length}...`);
      console.log(`📝 [Workflow] Prompt: ${scenario.videoPrompt.substring(0, 100)}...`);

      try {
        const videoResult = await generateVideoFromImage({
          prompt: scenario.videoPrompt,
          duration: scenario.duration || 8,
          aspectRatio: scenario.aspectRatio || '16:9',
          model: scenario.model || 'fast',
          firstFrame: progress.characterImagePath!
        });

        const videoData: VideoResult = {
          scenarioIndex: i,
          videoPath: videoResult.result.videos[0].videoPath,
          cost: videoResult.cost,
          duration: videoResult.totalTime,
          success: true
        };

        progress.videos.push(videoData);
        progress.videosGenerated++;
        progress.totalCost += videoResult.cost;
        videoGenCost += videoResult.cost;

        console.log(`✅ [Workflow] Video ${i + 1} complete: ${videoData.videoPath}`);
        console.log(`💰 [Workflow] Video ${i + 1} cost: $${videoResult.cost.toFixed(4)}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ [Workflow] Video ${i + 1} failed: ${errorMessage}`);

        // Record failed video but continue with remaining videos
        progress.videos.push({
          scenarioIndex: i,
          videoPath: '',
          cost: 0,
          duration: 0,
          success: false,
          error: errorMessage
        });
      }
    }

    videoGenTime = Date.now() - videoStartTime;

    // === WORKFLOW COMPLETE ===
    progress.currentStage = 'complete';
    progress.overallProgress = 100;

    const totalTime = Date.now() - startTime;
    const successfulVideos = progress.videos.filter(v => v.success).length;

    console.log('\n🎉 [Workflow] Series Video generation complete!');
    console.log(`📊 [Workflow] Generated ${successfulVideos}/${input.scenarios.length} videos successfully`);
    console.log(`💰 [Workflow] Total cost: $${progress.totalCost.toFixed(4)}`);
    console.log(`⏱️  [Workflow] Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`🎥 [Workflow] Character image: ${progress.characterImagePath}`);
    progress.videos.forEach((video, idx) => {
      if (video.success) {
        console.log(`   Video ${idx + 1}: ${video.videoPath}`);
      } else {
        console.log(`   Video ${idx + 1}: FAILED - ${video.error}`);
      }
    });

    return {
      success: successfulVideos > 0,
      characterImagePath: progress.characterImagePath!,
      videos: progress.videos,
      totalCost: progress.totalCost,
      totalTime,
      stages: {
        characterGeneration: {
          time: characterGenTime,
          cost: characterGenCost
        },
        videoGeneration: {
          time: videoGenTime,
          cost: videoGenCost
        }
      }
    };

  } catch (error) {
    progress.currentStage = 'failed';
    progress.error = error instanceof Error ? error.message : String(error);

    console.error('❌ [Workflow] Series Video generation failed');
    console.error('Error:', progress.error);

    const totalTime = Date.now() - startTime;

    return {
      success: false,
      characterImagePath: progress.characterImagePath || '',
      videos: progress.videos,
      totalCost: progress.totalCost,
      totalTime,
      error: progress.error,
      stages: {
        characterGeneration: {
          time: characterGenTime,
          cost: characterGenCost
        },
        videoGeneration: {
          time: videoGenTime,
          cost: videoGenCost
        }
      }
    };
  }
}
