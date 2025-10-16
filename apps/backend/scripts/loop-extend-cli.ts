/**
 * Loop Extension CLI - Cost-Effective Video Extension
 *
 * Creates longer videos by looping/stitching the same video multiple times
 * WITHOUT generating new content with VEO3.
 *
 * Cost Comparison:
 * - Smart Extend (VEO3): $1.20 per 8 seconds
 * - Loop Extend (FFmpeg): $0.05 per 8 seconds (97% savings!)
 *
 * Use Cases:
 * - Create 60-second videos from 8-second clips
 * - Loop product demos or tutorials
 * - Extend B-roll footage
 * - Create longer social media content
 *
 * Process:
 * 1. Validate source video
 * 2. Create loop segments array
 * 3. Stitch with FFmpeg using optimized transitions
 * 4. Output Windows Media Player compatible video
 *
 * Outputs structured results in format expected by omega-service:
 * PROGRESS:{"stage":"...","progress":...,"message":"..."}
 * RESULT:{"success":true,"extendedVideoUrl":"...","cost":...}
 */

import dotenv from 'dotenv';
dotenv.config();

import { FFmpegStitchingEngine } from '../src/veo3/ffmpeg-stitching-engine';
import * as path from 'path';
import * as fs from 'fs/promises';

interface LoopExtensionRequest {
  videoPath: string;
  loopCount: number;
  platform: 'tiktok' | 'youtube' | 'instagram';
  transitionStyle?: 'cut' | 'fade' | 'crossfade';
}

async function getVideoDuration(videoPath: string): Promise<number> {
  const { spawn } = await import('child_process');

  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ]);

    let output = '';

    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(duration);
      } else {
        reject(new Error(`ffprobe failed with exit code ${code}`));
      }
    });

    ffprobe.on('error', (err) => {
      reject(new Error(`ffprobe spawn error: ${err.message}`));
    });
  });
}

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length < 3) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Usage: loop-extend-cli.ts <videoPath> <loopCount> <platform> [transitionStyle]'
      }));
      process.exit(1);
    }

    const request: LoopExtensionRequest = {
      videoPath: args[0],
      loopCount: parseInt(args[1]),
      platform: args[2] as 'tiktok' | 'youtube' | 'instagram',
      transitionStyle: (args[3] as 'cut' | 'fade' | 'crossfade') || 'fade'
    };

    // Validate loop count
    if (request.loopCount < 2 || request.loopCount > 10) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Loop count must be between 2 and 10'
      }));
      process.exit(1);
    }

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'initialization',
      progress: 5,
      message: 'Starting loop extension...'
    }));

    // Validate video file exists
    try {
      await fs.access(request.videoPath);
    } catch {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: `Video file not found: ${request.videoPath}`
      }));
      process.exit(1);
    }

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'validation',
      progress: 10,
      message: 'Validating video file...'
    }));

    // Get video duration
    const segmentDuration = await getVideoDuration(request.videoPath);

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'preparation',
      progress: 20,
      message: `Creating ${request.loopCount} loop segments...`
    }));

    // Create segments array (all pointing to same video)
    const segments = Array.from({ length: request.loopCount }, (_, i) => ({
      id: `loop-segment-${i + 1}`,
      prompt: { message: `Loop segment ${i + 1}` } as any,
      videoPath: request.videoPath,
      duration: segmentDuration,
      cost: 0, // No generation cost for loops
      characterConsistent: true,
      hasNativeAudio: true
    }));

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'stitching',
      progress: 30,
      message: `Stitching ${request.loopCount} segments with FFmpeg...`
    }));

    // Initialize FFmpeg stitching engine
    const stitchingEngine = new FFmpegStitchingEngine();
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3');
    const loopedPath = path.join(outputDir, `looped_${timestamp}.mp4`);

    // Determine transition type based on request
    let transitionType: 'dissolve' | 'fade' | 'wipeleft' = 'fade';
    let transitionDuration = 0.5;

    if (request.transitionStyle === 'cut') {
      transitionDuration = 0; // No transition, instant cut
    } else if (request.transitionStyle === 'fade') {
      transitionType = 'fade';
    } else if (request.transitionStyle === 'crossfade') {
      transitionType = 'dissolve'; // Dissolve is similar to crossfade
    }

    // Stitch all segments with simple, universally-supported transitions
    const stitchResult = await stitchingEngine.stitchSegments(
      segments,
      loopedPath,
      {
        platform: request.platform,
        outputQuality: 'production',
        transitionStyle: transitionType, // Use simple transition type directly
        transitionDuration: transitionDuration,
        audioSync: true
      }
    );

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'complete',
      progress: 100,
      message: `Loop extension complete! ${stitchResult.duration}s video ready!`
    }));

    // Calculate cost (FFmpeg processing only, no VEO3 generation)
    const stitchingCost = 0.05; // $0.05 per stitch operation
    const totalCost = stitchingCost;

    // Return the looped video URL
    const loopedUrl = `/generated/veo3/${path.basename(loopedPath)}`;

    console.log('RESULT:' + JSON.stringify({
      success: true,
      extendedVideoUrl: loopedUrl,
      loopedVideoPath: loopedPath,
      originalVideoPath: request.videoPath,
      loopCount: request.loopCount,
      cost: totalCost,
      savings: (request.loopCount - 1) * 1.20 - totalCost, // Savings vs Smart Extend
      duration: stitchResult.duration,
      transitionsUsed: stitchResult.transitionsUsed,
      processingTime: 5.2, // Estimated FFmpeg processing time
      method: 'loop_extend'
    }));

    process.exit(0);

  } catch (error) {
    console.error('RESULT:' + JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    process.exit(1);
  }
}

main();
