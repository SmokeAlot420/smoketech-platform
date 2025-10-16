import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';

const execAsync = promisify(exec);

// Set ffmpeg paths from installers
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

export interface FrameExtractionOptions {
  outputPath?: string; // Custom output path
  format?: 'jpg' | 'png'; // Output format (default: jpg)
  quality?: number; // JPEG quality 1-100 (default: 95)
  width?: number; // Resize width (maintains aspect ratio)
  height?: number; // Resize height (maintains aspect ratio)
}

export interface FrameExtractionResult {
  framePath: string;
  frameNumber: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

/**
 * Video Frame Extractor Utility
 *
 * Supports extraction of:
 * - Final frame (for sequential extend continuity)
 * - First frame (for reference)
 * - Frame at specific timestamp
 * - Multiple frames at intervals
 *
 * Uses FFmpeg for reliable video processing
 */
export class VideoFrameExtractor {

  /**
   * Extract the final frame from a video
   * Critical for Sora 2 sequential extend (input_reference continuity)
   */
  static async extractFinalFrame(
    videoPath: string,
    options: FrameExtractionOptions = {}
  ): Promise<FrameExtractionResult> {
    try {
      console.log(`🖼️ Extracting final frame from: ${videoPath}`);

      // Get video duration and total frames
      const videoInfo = await this.getVideoInfo(videoPath);
      const duration = videoInfo.duration;
      const frameCount = videoInfo.frameCount;

      // Generate output path
      const outputPath = options.outputPath || this.generateOutputPath(videoPath, 'final', options.format || 'jpg');

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Extract last frame using FFmpeg
      // Method 1: Use sseof -1 (seek to 1 second before end, then get last frame)
      const command = `"${ffmpegPath.path}" -sseof -1 -i "${videoPath}" -update 1 -frames:v 1 ${this.buildFilterString(options)} "${outputPath}" -y`;

      await execAsync(command);

      console.log(`✅ Final frame extracted: ${outputPath}`);

      return {
        framePath: outputPath,
        frameNumber: frameCount,
        timestamp: duration,
        success: true
      };

    } catch (error) {
      console.error('❌ Failed to extract final frame:', error);
      return {
        framePath: '',
        frameNumber: 0,
        timestamp: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract the first frame from a video
   * Useful for thumbnail generation and reference images
   */
  static async extractFirstFrame(
    videoPath: string,
    options: FrameExtractionOptions = {}
  ): Promise<FrameExtractionResult> {
    try {
      console.log(`🖼️ Extracting first frame from: ${videoPath}`);

      const outputPath = options.outputPath || this.generateOutputPath(videoPath, 'first', options.format || 'jpg');

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Extract first frame
      const command = `"${ffmpegPath.path}" -i "${videoPath}" -vframes 1 ${this.buildFilterString(options)} "${outputPath}" -y`;

      await execAsync(command);

      console.log(`✅ First frame extracted: ${outputPath}`);

      return {
        framePath: outputPath,
        frameNumber: 1,
        timestamp: 0,
        success: true
      };

    } catch (error) {
      console.error('❌ Failed to extract first frame:', error);
      return {
        framePath: '',
        frameNumber: 0,
        timestamp: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract frame at specific timestamp
   */
  static async extractFrameAtTime(
    videoPath: string,
    timestamp: number, // In seconds
    options: FrameExtractionOptions = {}
  ): Promise<FrameExtractionResult> {
    try {
      console.log(`🖼️ Extracting frame at ${timestamp}s from: ${videoPath}`);

      const outputPath = options.outputPath || this.generateOutputPath(videoPath, `time_${timestamp}`, options.format || 'jpg');

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Extract frame at timestamp
      const command = `"${ffmpegPath.path}" -ss ${timestamp} -i "${videoPath}" -vframes 1 ${this.buildFilterString(options)} "${outputPath}" -y`;

      await execAsync(command);

      console.log(`✅ Frame at ${timestamp}s extracted: ${outputPath}`);

      return {
        framePath: outputPath,
        frameNumber: 0, // Unknown without probing
        timestamp,
        success: true
      };

    } catch (error) {
      console.error(`❌ Failed to extract frame at ${timestamp}s:`, error);
      return {
        framePath: '',
        frameNumber: 0,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract multiple frames at regular intervals
   * Useful for creating thumbnails or preview grids
   */
  static async extractFramesAtIntervals(
    videoPath: string,
    intervalSeconds: number,
    options: FrameExtractionOptions = {}
  ): Promise<FrameExtractionResult[]> {
    try {
      console.log(`🖼️ Extracting frames every ${intervalSeconds}s from: ${videoPath}`);

      const videoInfo = await this.getVideoInfo(videoPath);
      const duration = videoInfo.duration;
      const frameCount = Math.floor(duration / intervalSeconds);

      const results: FrameExtractionResult[] = [];

      for (let i = 0; i < frameCount; i++) {
        const timestamp = i * intervalSeconds;
        const result = await this.extractFrameAtTime(videoPath, timestamp, {
          ...options,
          outputPath: options.outputPath
            ? options.outputPath.replace(/(\.jpg|\.png)$/, `_${i}$1`)
            : undefined
        });
        results.push(result);
      }

      console.log(`✅ Extracted ${results.length} frames at ${intervalSeconds}s intervals`);

      return results;

    } catch (error) {
      console.error('❌ Failed to extract frames at intervals:', error);
      return [];
    }
  }

  /**
   * Get video information (duration, frame count, resolution)
   */
  private static async getVideoInfo(videoPath: string): Promise<{
    duration: number;
    frameCount: number;
    width: number;
    height: number;
    fps: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const duration = metadata.format.duration || 0;
        const fps = this.parseFps(videoStream.r_frame_rate || '30/1');
        const frameCount = Math.floor(duration * fps);

        resolve({
          duration,
          frameCount,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps
        });
      });
    });
  }

  /**
   * Parse FPS from FFmpeg format (e.g., "30/1" -> 30)
   */
  private static parseFps(fpsString: string): number {
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(fpsString);
  }

  /**
   * Build FFmpeg filter string for quality and resizing
   */
  private static buildFilterString(options: FrameExtractionOptions): string {
    const filters: string[] = [];

    // Add quality flag for JPEG
    if (options.format === 'jpg' || !options.format) {
      const quality = options.quality || 95;
      filters.push(`-q:v ${Math.floor((100 - quality) / 3)}`); // FFmpeg quality scale is inverse
    }

    // Add resize filter if dimensions specified
    if (options.width || options.height) {
      const scaleFilter = options.width && options.height
        ? `scale=${options.width}:${options.height}`
        : options.width
        ? `scale=${options.width}:-1`
        : `scale=-1:${options.height}`;

      filters.push(`-vf "${scaleFilter}"`);
    }

    return filters.join(' ');
  }

  /**
   * Generate output path for extracted frame
   */
  private static generateOutputPath(
    videoPath: string,
    suffix: string,
    format: 'jpg' | 'png'
  ): string {
    const videoDir = path.dirname(videoPath);
    const videoName = path.basename(videoPath, path.extname(videoPath));
    return path.join(videoDir, `${videoName}_frame_${suffix}.${format}`);
  }

  /**
   * Batch extract final frames from multiple videos
   * Useful for preparing sequential extend input_references
   */
  static async extractFinalFramesBatch(
    videoPaths: string[],
    options: FrameExtractionOptions = {}
  ): Promise<FrameExtractionResult[]> {
    console.log(`🖼️ Batch extracting final frames from ${videoPaths.length} videos...`);

    const results: FrameExtractionResult[] = [];

    for (let i = 0; i < videoPaths.length; i++) {
      const videoPath = videoPaths[i];
      console.log(`Processing ${i + 1}/${videoPaths.length}: ${path.basename(videoPath)}`);

      const result = await this.extractFinalFrame(videoPath, options);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch extraction complete: ${successCount}/${videoPaths.length} successful`);

    return results;
  }

  /**
   * Clean up extracted frames (delete files)
   */
  static async cleanupFrames(framePaths: string[]): Promise<void> {
    console.log(`🧹 Cleaning up ${framePaths.length} extracted frames...`);

    for (const framePath of framePaths) {
      try {
        await fs.unlink(framePath);
      } catch (error) {
        console.warn(`⚠️ Could not delete frame: ${framePath}`);
      }
    }

    console.log('✅ Cleanup complete');
  }
}

/**
 * Convenience functions for common use cases
 */

/**
 * Extract final frame for Sora 2 sequential extend
 * Returns path to extracted frame for use as input_reference
 */
export async function extractFinalFrameForSequentialExtend(
  videoPath: string,
  segmentIndex: number
): Promise<string> {
  const outputDir = path.join(path.dirname(videoPath), 'frames');
  const outputPath = path.join(outputDir, `segment_${segmentIndex}_final.jpg`);

  const result = await VideoFrameExtractor.extractFinalFrame(videoPath, {
    outputPath,
    format: 'jpg',
    quality: 95
  });

  if (!result.success) {
    throw new Error(`Failed to extract final frame: ${result.error}`);
  }

  return result.framePath;
}

/**
 * Extract frames for A/B testing thumbnails
 */
export async function extractThumbnailGrid(
  videoPath: string,
  gridSize: number = 9
): Promise<string[]> {
  const videoInfo = await VideoFrameExtractor['getVideoInfo'](videoPath);
  const interval = videoInfo.duration / gridSize;

  const results = await VideoFrameExtractor.extractFramesAtIntervals(videoPath, interval, {
    format: 'jpg',
    quality: 85,
    width: 320 // Thumbnail size
  });

  return results
    .filter(r => r.success)
    .map(r => r.framePath);
}
