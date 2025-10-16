/**
 * Video Frame Extractor Utility
 * Wrapper around /api/extract-frame for server-side use
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract final frame from video for sequential extend
 * Used by Sora 2 and VEO3 extension workflows
 *
 * @param videoPath - Absolute path to video file
 * @param segmentIndex - Segment index for naming (timestamp or index)
 * @returns Path to extracted frame
 */
export async function extractFinalFrameForSequentialExtend(
  videoPath: string,
  segmentIndex: number
): Promise<string> {
  console.log(`[FRAME] Extracting final frame from: ${videoPath}`);

  // Ensure video file exists
  try {
    await fs.access(videoPath);
  } catch {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Generate output path
  const videoDir = path.dirname(videoPath);
  const framesDir = path.join(videoDir, 'frames');

  // Ensure frames directory exists
  await fs.mkdir(framesDir, { recursive: true });

  const framePath = path.join(framesDir, `segment_${segmentIndex}_final.jpg`);

  // Extract last frame using FFmpeg
  // -sseof -1: seek to 1 second before end
  // -frames:v 1: extract 1 frame
  // -q:v 2: high quality JPEG (2 = ~95% quality)
  const command = `ffmpeg -sseof -1 -i "${videoPath}" -update 1 -frames:v 1 -q:v 2 "${framePath}" -y`;

  try {
    await execAsync(command);
    console.log(`[SUCCESS] Final frame extracted: ${framePath}`);
    return framePath;
  } catch (error) {
    console.error('[ERROR] FFmpeg extraction failed:', error);
    throw new Error(`Failed to extract frame: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract frame from video at specific timestamp
 *
 * @param videoPath - Absolute path to video file
 * @param timestamp - Timestamp in seconds
 * @param outputPath - Path to save extracted frame
 */
export async function extractFrameAtTimestamp(
  videoPath: string,
  timestamp: number,
  outputPath: string
): Promise<string> {
  console.log(`[FRAME] Extracting frame at ${timestamp}s from: ${videoPath}`);

  // Ensure video file exists
  try {
    await fs.access(videoPath);
  } catch {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Extract frame at timestamp using FFmpeg
  // -ss: seek to timestamp
  // -frames:v 1: extract 1 frame
  // -q:v 2: high quality JPEG
  const command = `ffmpeg -ss ${timestamp} -i "${videoPath}" -frames:v 1 -q:v 2 "${outputPath}" -y`;

  try {
    await execAsync(command);
    console.log(`[SUCCESS] Frame extracted: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[ERROR] FFmpeg extraction failed:', error);
    throw new Error(`Failed to extract frame: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get video duration using FFmpeg
 *
 * @param videoPath - Absolute path to video file
 * @returns Duration in seconds
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const { stdout } = await execAsync(command);
    const duration = parseFloat(stdout.trim());

    if (isNaN(duration)) {
      throw new Error('Failed to parse video duration');
    }

    return duration;
  } catch (error) {
    console.error('[ERROR] Failed to get video duration:', error);
    throw new Error(`Failed to get duration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
