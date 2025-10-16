/**
 * Video Extension Utility
 * Based on Google Creative Studio's video chaining pattern
 *
 * Enables seamless video extension by extracting last frame from one video
 * and using it as the first frame of the next video
 *
 * Source: vertex-ai-creative-studio/experiments/veo3-item-consistency/extend_video/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
// @ts-ignore - FFmpeg installer packages
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// @ts-ignore - FFprobe installer packages
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const execAsync = promisify(exec);

// Use installed FFmpeg and FFprobe binaries
const ffmpegPath = ffmpegInstaller.path;
const ffprobePath = ffprobeInstaller.path;

export interface FrameExtractionResult {
  framePath: string;
  frameNumber: number;
  videoPath: string;
  extractionTime: number;
}

export interface VideoExtensionChain {
  videos: string[];
  lastFrames: string[];
  totalDuration: number;
}

/**
 * Video Extension Manager
 * Implements Google's video chaining pattern
 */
export class VideoExtensionManager {
  private outputDir: string;

  constructor(outputDir: string = './generated/frames') {
    this.outputDir = outputDir;
  }

  /**
   * Extract the last frame from a video
   * This frame can be used as firstFrame for the next video segment
   */
  async extractLastFrame(videoPath: string): Promise<FrameExtractionResult> {
    const startTime = Date.now();

    console.log(`🎬 Extracting last frame from: ${videoPath}`);

    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Get video duration
      const duration = await this.getVideoDuration(videoPath);
      console.log(`⏱️  Video duration: ${duration.toFixed(2)}s`);

      // Calculate last frame position (0.1 seconds before end to avoid artifacts)
      const lastFrameTime = Math.max(0, duration - 0.1);

      // Create output filename
      const videoBasename = path.basename(videoPath, path.extname(videoPath));
      const framePath = path.join(this.outputDir, `${videoBasename}_last_frame.png`);

      // Extract frame using FFmpeg
      const ffmpegCommand = `"${ffmpegPath}" -ss ${lastFrameTime} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}" -y`;

      await execAsync(ffmpegCommand);

      const extractionTime = Date.now() - startTime;

      console.log(`✅ Last frame extracted: ${framePath}`);
      console.log(`⏱️  Extraction time: ${extractionTime}ms`);

      return {
        framePath,
        frameNumber: Math.floor(lastFrameTime * 30), // Assuming 30fps
        videoPath,
        extractionTime
      };

    } catch (error) {
      console.error('❌ Frame extraction failed:', error);
      throw new Error(`Failed to extract last frame: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract the first frame from a video
   * Useful for creating interpolations or analyzing content
   */
  async extractFirstFrame(videoPath: string): Promise<FrameExtractionResult> {
    const startTime = Date.now();

    console.log(`🎬 Extracting first frame from: ${videoPath}`);

    try {
      await fs.mkdir(this.outputDir, { recursive: true });

      const videoBasename = path.basename(videoPath, path.extname(videoPath));
      const framePath = path.join(this.outputDir, `${videoBasename}_first_frame.png`);

      // Extract first frame
      const ffmpegCommand = `"${ffmpegPath}" -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}" -y`;

      await execAsync(ffmpegCommand);

      const extractionTime = Date.now() - startTime;

      console.log(`✅ First frame extracted: ${framePath}`);

      return {
        framePath,
        frameNumber: 0,
        videoPath,
        extractionTime
      };

    } catch (error) {
      console.error('❌ Frame extraction failed:', error);
      throw new Error(`Failed to extract first frame: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a video extension chain
   * Extracts last frame from each video to use for the next
   */
  async createExtensionChain(videoSegments: string[]): Promise<VideoExtensionChain> {
    console.log(`🔗 Creating extension chain for ${videoSegments.length} video segments...`);

    const lastFrames: string[] = [];
    let totalDuration = 0;

    for (let i = 0; i < videoSegments.length; i++) {
      const video = videoSegments[i];

      console.log(`\n📹 Processing segment ${i + 1}/${videoSegments.length}: ${path.basename(video)}`);

      // Get duration
      const duration = await this.getVideoDuration(video);
      totalDuration += duration;

      // Extract last frame (except for the final segment)
      if (i < videoSegments.length - 1) {
        const result = await this.extractLastFrame(video);
        lastFrames.push(result.framePath);
      }
    }

    console.log(`\n✅ Extension chain created:`);
    console.log(`   Videos: ${videoSegments.length}`);
    console.log(`   Last frames extracted: ${lastFrames.length}`);
    console.log(`   Total duration: ${totalDuration.toFixed(2)}s`);

    return {
      videos: videoSegments,
      lastFrames,
      totalDuration
    };
  }

  /**
   * Get video duration using FFmpeg
   */
  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
      );

      const duration = parseFloat(stdout.trim());

      if (isNaN(duration)) {
        throw new Error('Could not parse video duration');
      }

      return duration;

    } catch (error) {
      console.error('❌ Failed to get video duration:', error);
      throw new Error(`Failed to get video duration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract multiple frames at specific timestamps
   * Useful for analyzing video content or creating thumbnails
   */
  async extractFramesAtTimestamps(videoPath: string, timestamps: number[]): Promise<FrameExtractionResult[]> {
    console.log(`🎬 Extracting ${timestamps.length} frames from video...`);

    await fs.mkdir(this.outputDir, { recursive: true });

    const results: FrameExtractionResult[] = [];
    const videoBasename = path.basename(videoPath, path.extname(videoPath));

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const framePath = path.join(this.outputDir, `${videoBasename}_frame_${i}_${timestamp}s.png`);

      const ffmpegCommand = `"${ffmpegPath}" -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}" -y`;

      await execAsync(ffmpegCommand);

      results.push({
        framePath,
        frameNumber: Math.floor(timestamp * 30),
        videoPath,
        extractionTime: 0 // Not tracking individual times
      });
    }

    console.log(`✅ Extracted ${results.length} frames`);

    return results;
  }
}

/**
 * Helper function to quickly extract last frame
 */
export async function extractLastFrame(videoPath: string, outputDir?: string): Promise<string> {
  const manager = new VideoExtensionManager(outputDir);
  const result = await manager.extractLastFrame(videoPath);
  return result.framePath;
}

/**
 * Helper function to create a video extension chain
 */
export async function createVideoChain(videoSegments: string[], outputDir?: string): Promise<VideoExtensionChain> {
  const manager = new VideoExtensionManager(outputDir);
  return await manager.createExtensionChain(videoSegments);
}
