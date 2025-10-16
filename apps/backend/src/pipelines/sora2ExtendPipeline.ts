import { Sora2Service } from '../services/sora2Service';
import { SequentialPromptGenerator } from '../services/sequentialPromptGenerator';
import { VideoFrameExtractor } from '../utils/videoFrameExtractor';
import { FFmpegVideoStitcher } from './ffmpegStitcher';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface Sora2Segment {
  videoPath: string;
  duration: number;
  segmentIndex: number;
  prompt: string;
  finalFramePath?: string; // Frame extracted for next segment
  cost: number;
  success: boolean;
  error?: string;
}

export interface Sora2ExtendResult {
  videoPath: string; // Final concatenated video
  totalDuration: number; // Total video duration in seconds
  totalCost: number; // Total cost for all segments
  segments: Sora2Segment[]; // Individual segment details
  model: 'sora-2' | 'sora-2-pro';
  success: boolean;
  error?: string;
}

export interface Sora2ExtendConfig {
  model?: 'sora-2' | 'sora-2-pro'; // Default: sora-2
  segmentDuration?: number; // 4, 8, 12, 16, or 20 seconds (default: 12)
  numberOfSegments?: number; // How many segments to generate (default: 5)
  aspectRatio?: '16:9' | '9:16' | '1:1'; // Default: 16:9
  contentType?: 'product-demo' | 'explainer' | 'story' | 'testimonial' | 'tutorial'; // Default: explainer
  characterDescription?: string; // Optional character for consistency
  outputPath?: string; // Custom output directory
  enableTransitions?: boolean; // Use FFmpeg xfade transitions (default: true)
  transitionType?: string; // FFmpeg transition type (default: 'fade')
  transitionDuration?: number; // Transition duration in seconds (default: 0.5)
  tier?: 1 | 2 | 3 | 4 | 5; // OpenAI tier for rate limiting (default: 2)
}

/**
 * Sora 2 Sequential Extend Pipeline
 *
 * Orchestrates the full sequential video generation workflow using OpenAI Sora 2:
 *
 * Architecture:
 * 1. SequentialPromptGenerator: Split master prompt into segment-specific prompts
 * 2. Sora2Service: Generate first video segment
 * 3. VideoFrameExtractor: Extract final frame from segment
 * 4. Sora2Service: Generate next segment with previous frame as input_reference
 * 5. Repeat steps 3-4 for all segments
 * 6. FFmpegVideoStitcher: Concatenate all segments with optional transitions
 *
 * Key Features:
 * - Sequential extend with perfect continuity using final frame technique
 * - "Context + Prompt" structure from mshumer/sora-extend
 * - Variable segment lengths: 4s, 8s, 12s, 16s, 20s
 * - 86% cost savings vs VEO3 ($5.60 vs $42 for 60-second video)
 * - Tier-aware rate limiting matching OpenAI usage tiers
 *
 * Example Usage:
 * ```typescript
 * const pipeline = new Sora2ExtendPipeline();
 * const result = await pipeline.generateSequentialVideo(
 *   "Create a professional product demonstration for QuoteMoto insurance...",
 *   {
 *     segmentDuration: 12,
 *     numberOfSegments: 5,
 *     model: 'sora-2',
 *     contentType: 'product-demo'
 *   }
 * );
 * ```
 */
export class Sora2ExtendPipeline {
  private sora2Service: Sora2Service;
  private promptGenerator: SequentialPromptGenerator;
  private stitcher: FFmpegVideoStitcher;

  constructor() {
    this.sora2Service = new Sora2Service();
    this.promptGenerator = new SequentialPromptGenerator();
    this.stitcher = new FFmpegVideoStitcher();
  }

  /**
   * Generate sequential video with multiple segments
   *
   * @param masterPrompt - High-level description of entire video content
   * @param config - Configuration options for generation
   * @returns Sora2ExtendResult with final video and metadata
   */
  async generateSequentialVideo(
    masterPrompt: string,
    config: Sora2ExtendConfig = {}
  ): Promise<Sora2ExtendResult> {
    try {
      // Set defaults
      const {
        model = 'sora-2',
        segmentDuration = 12,
        numberOfSegments = 5,
        aspectRatio = '16:9',
        contentType = 'explainer',
        characterDescription,
        outputPath = './generated/sora2',
        enableTransitions = true,
        transitionType = 'fade',
        transitionDuration = 0.5,
        tier = 2
      } = config;

      console.log('🚀 Starting Sora 2 sequential extend pipeline...');
      console.log(`📊 Config: ${numberOfSegments}x${segmentDuration}s = ${numberOfSegments * segmentDuration}s total`);
      console.log(`💰 Model: ${model} (Tier ${tier})`);
      console.log(`📐 Aspect Ratio: ${aspectRatio}`);

      // Ensure output directory exists
      await fs.mkdir(outputPath, { recursive: true });

      // Stage 1: Generate segment-specific prompts using AI
      console.log('📝 Stage 1: Generating segment-specific prompts...');
      const promptResult = await this.promptGenerator.generateSora2SequentialPrompts({
        masterPrompt,
        numberOfSegments,
        segmentDuration,
        contentType,
        characterDescription
      });

      if (!promptResult.success || promptResult.segmentPrompts.length === 0) {
        throw new Error('Failed to generate segment prompts');
      }

      console.log(`✅ Generated ${promptResult.segmentPrompts.length} segment prompts`);
      promptResult.segmentPrompts.forEach((segment, i) => {
        console.log(`  ${i + 1}. ${segment.prompt.substring(0, 80)}...`);
      });

      // Stage 2-5: Generate segments sequentially with frame continuity
      console.log('🎬 Stage 2-5: Generating video segments with sequential extend...');
      const segments: Sora2Segment[] = [];
      let previousFramePath: string | undefined = undefined;

      for (let i = 0; i < promptResult.segmentPrompts.length; i++) {
        const segmentPrompt = promptResult.segmentPrompts[i];
        const isLastSegment = i === promptResult.segmentPrompts.length - 1;

        console.log(`\n🎥 Generating segment ${i + 1}/${promptResult.segmentPrompts.length}...`);
        console.log(`📝 Prompt: ${segmentPrompt.prompt.substring(0, 100)}...`);

        try {
          // Generate video segment with Sora 2
          const result = await this.sora2Service.generateVideoSegment({
            prompt: segmentPrompt.prompt,
            model,
            duration: segmentDuration,
            aspectRatio,
            inputReference: previousFramePath, // Pass previous frame for continuity
            tier
          });

          if (!result.success || !result.videoPath) {
            throw new Error(`Segment ${i + 1} generation failed: ${result.error}`);
          }

          console.log(`✅ Segment ${i + 1} generated successfully`);
          console.log(`   Video: ${result.videoPath}`);
          console.log(`   Duration: ${result.duration}s`);
          console.log(`   Cost: $${result.cost.toFixed(4)}`);

          // Extract final frame for next segment (unless it's the last segment)
          let finalFramePath: string | undefined = undefined;
          if (!isLastSegment) {
            console.log(`🖼️  Extracting final frame for next segment...`);
            const frameResult = await VideoFrameExtractor.extractFinalFrame(result.videoPath, {
              outputPath: path.join(outputPath, `segment_${i}_final_frame.jpg`),
              format: 'jpg',
              quality: 95
            });

            if (frameResult.success) {
              finalFramePath = frameResult.framePath;
              previousFramePath = finalFramePath; // Use for next segment
              console.log(`   ✅ Final frame extracted: ${finalFramePath}`);
            } else {
              console.warn(`   ⚠️  Frame extraction failed: ${frameResult.error}`);
              // Continue without frame - Sora 2 will do its best
            }
          }

          // Store segment result
          segments.push({
            videoPath: result.videoPath,
            duration: result.duration,
            segmentIndex: i,
            prompt: segmentPrompt.prompt,
            finalFramePath,
            cost: result.cost,
            success: true
          });

        } catch (error) {
          console.error(`❌ Segment ${i + 1} failed:`, error);
          segments.push({
            videoPath: '',
            duration: 0,
            segmentIndex: i,
            prompt: segmentPrompt.prompt,
            cost: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          // Stop processing if a segment fails
          throw error;
        }

        // Small delay between generations to respect rate limits
        if (!isLastSegment) {
          console.log('⏱️  Waiting 2 seconds before next segment...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Calculate total cost
      const totalCost = segments.reduce((sum, seg) => sum + seg.cost, 0);
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

      console.log(`\n💰 Total cost: $${totalCost.toFixed(4)}`);
      console.log(`⏱️  Total duration: ${totalDuration}s`);

      // Stage 6: Concatenate segments with FFmpeg
      console.log('\n🔗 Stage 6: Stitching segments with FFmpeg...');
      const segmentPaths = segments.map(seg => seg.videoPath);

      const stitchResult = await this.stitcher.stitchVideos(segmentPaths, {
        outputPath: path.join(outputPath, `sora2_extended_${Date.now()}.mp4`),
        useTransitions: enableTransitions,
        transitionType,
        transitionDuration
      });

      if (!stitchResult.success) {
        throw new Error(`Video stitching failed: ${stitchResult.error}`);
      }

      console.log(`✅ Final video created: ${stitchResult.outputPath}`);
      console.log(`   Duration: ${stitchResult.totalDuration}s`);

      // Optional: Clean up extracted frames
      console.log('\n🧹 Cleaning up extracted frames...');
      const framePaths = segments
        .filter(seg => seg.finalFramePath)
        .map(seg => seg.finalFramePath!);

      if (framePaths.length > 0) {
        await VideoFrameExtractor.cleanupFrames(framePaths);
      }

      console.log('✅ Sora 2 sequential extend pipeline complete!');

      return {
        videoPath: stitchResult.outputPath,
        totalDuration: stitchResult.totalDuration,
        totalCost,
        segments,
        model,
        success: true
      };

    } catch (error) {
      console.error('❌ Sora 2 sequential extend pipeline failed:', error);
      return {
        videoPath: '',
        totalDuration: 0,
        totalCost: 0,
        segments: [],
        model: config.model || 'sora-2',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Compare costs between Sora 2 and VEO3 for a given video duration
   *
   * @param durationSeconds - Total video duration in seconds
   * @param model - Sora 2 model to compare
   * @returns Cost comparison object
   */
  static compareCosts(
    durationSeconds: number,
    model: 'sora-2' | 'sora-2-pro' = 'sora-2'
  ): {
    sora2Cost: number;
    veo3Cost: number;
    savings: number;
    savingsPercent: number;
  } {
    // Sora 2 pricing: per second
    const sora2PricePerSecond = model === 'sora-2' ? 0.10 : 0.30;
    const sora2Cost = durationSeconds * sora2PricePerSecond;

    // VEO3 pricing: per 8-second segment
    const veo3Segments = Math.ceil(durationSeconds / 8);
    const veo3Cost = veo3Segments * 1.20; // $1.20 per 8-second segment (VEO3 Fast)

    // Calculate savings
    const savings = veo3Cost - sora2Cost;
    const savingsPercent = (savings / veo3Cost) * 100;

    return {
      sora2Cost,
      veo3Cost,
      savings,
      savingsPercent
    };
  }

  /**
   * Get recommended segment duration based on content type
   *
   * @param contentType - Type of content being generated
   * @returns Recommended segment duration in seconds
   */
  static getRecommendedSegmentDuration(
    contentType: 'product-demo' | 'explainer' | 'story' | 'testimonial' | 'tutorial'
  ): number {
    switch (contentType) {
      case 'product-demo':
        return 12; // Medium pacing for showcasing features
      case 'explainer':
        return 16; // Slower pacing for complex concepts
      case 'story':
        return 20; // Longest for narrative development
      case 'testimonial':
        return 8; // Quick, punchy customer quotes
      case 'tutorial':
        return 12; // Medium pacing for step-by-step instructions
      default:
        return 12; // Default medium pacing
    }
  }

  /**
   * Calculate optimal number of segments for target duration
   *
   * @param targetDuration - Desired total video duration in seconds
   * @param segmentDuration - Duration of each segment (4-20s)
   * @returns Recommended number of segments
   */
  static calculateOptimalSegments(
    targetDuration: number,
    segmentDuration: number
  ): number {
    return Math.ceil(targetDuration / segmentDuration);
  }
}
