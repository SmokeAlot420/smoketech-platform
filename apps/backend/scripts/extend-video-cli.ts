/**
 * Video Extension CLI for Omega Service Integration
 *
 * This script extends existing videos using VEO3's lastFrame parameter.
 * Process:
 * 1. Extract last frame from original video using FFmpeg
 * 2. Generate new 8-second segment with VEO3 using lastFrame
 * 3. Stitch original + extended videos with FFmpeg into seamless 16-second video
 *
 * Outputs structured results in format expected by omega-service:
 * PROGRESS:{"stage":"...","progress":...,"message":"..."}
 * RESULT:{"success":true,"extendedVideoUrl":"...","cost":...}
 */

import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from '../src/services/veo3Service';
import { FFmpegStitchingEngine } from '../src/veo3/ffmpeg-stitching-engine';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ExtensionRequest {
  videoPath: string;
  prompt: string;
  duration: 4 | 6 | 8;
  platform: string;
}

async function extractLastFrame(videoPath: string): Promise<string> {
  const outputDir = path.dirname(videoPath);
  const timestamp = Date.now();
  const lastFramePath = path.join(outputDir, `lastframe_${timestamp}.png`);

  console.log('PROGRESS:' + JSON.stringify({
    stage: 'extraction',
    progress: 10,
    message: 'Extracting last frame with FFmpeg...'
  }));

  return new Promise((resolve, reject) => {
    // FFmpeg command to extract the very last frame
    const ffmpegArgs = [
      '-sseof', '-1',  // Seek to 1 second before end of file
      '-i', videoPath,
      '-update', '1',  // Update single frame
      '-q:v', '1',     // Highest quality
      '-frames:v', '1', // Extract only 1 frame
      lastFramePath
    ];

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', async (code) => {
      if (code === 0) {
        // Verify file was created
        try {
          await fs.access(lastFramePath);
          console.log('PROGRESS:' + JSON.stringify({
            stage: 'extraction',
            progress: 20,
            message: 'Last frame extracted successfully'
          }));
          resolve(lastFramePath);
        } catch {
          reject(new Error('Last frame file was not created'));
        }
      } else {
        reject(new Error(`FFmpeg failed with code ${code}: ${errorOutput}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Usage: extend-video-cli.ts <videoPath> <prompt> <duration> <platform>'
      }));
      process.exit(1);
    }

    const request: ExtensionRequest = {
      videoPath: args[0],
      prompt: args[1],
      duration: parseInt(args[2]) as 4 | 6 | 8,
      platform: args[3]
    };

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'initialization',
      progress: 5,
      message: 'Starting video extension...'
    }));

    // Step 1: Extract last frame
    const lastFramePath = await extractLastFrame(request.videoPath);

    // Step 2: Convert PNG to base64
    console.log('PROGRESS:' + JSON.stringify({
      stage: 'preparation',
      progress: 25,
      message: 'Converting last frame to base64...'
    }));

    const imageBuffer = await fs.readFile(lastFramePath);
    const base64Image = imageBuffer.toString('base64');

    // Step 3: Initialize VEO3 service
    console.log('PROGRESS:' + JSON.stringify({
      stage: 'veo3',
      progress: 30,
      message: 'Initializing VEO3 service...'
    }));

    const veo3Service = new VEO3Service({
      projectId: process.env.GCP_PROJECT_ID || 'viral-ai-content-12345',
      location: process.env.GCP_LOCATION || 'us-central1',
      outputPath: path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3')
    });

    // Step 4: Generate extension segment with VEO3
    console.log('PROGRESS:' + JSON.stringify({
      stage: 'veo3',
      progress: 35,
      message: 'Generating extension with VEO3 (this takes ~2 minutes)...'
    }));

    const result = await veo3Service.generateVideoSegment({
      prompt: request.prompt,
      duration: request.duration,
      aspectRatio: '16:9',
      model: 'fast',
      videoCount: 1,
      useGeminiEnhancement: false,  // Disable to avoid rate limits
      geminiEnhancementLevel: 'basic',
      enableSoundGeneration: true,
      lastFrame: base64Image
    });

    if (!result.success || result.videos.length === 0) {
      throw new Error(result.error || 'VEO3 generation failed');
    }

    const extensionVideo = result.videos[0];

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'stitching',
      progress: 85,
      message: 'Stitching original + extended videos with FFmpeg...'
    }));

    // Step 5: Stitch original + extended videos into seamless 16-second video
    const stitchingEngine = new FFmpegStitchingEngine();
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3');
    const stitchedPath = path.join(outputDir, `extended_${timestamp}.mp4`);

    const stitchResult = await stitchingEngine.stitchSegments(
      [
        {
          id: 'original-segment',
          prompt: { message: 'Original video segment' } as any,
          videoPath: request.videoPath,
          duration: 8, // Original 8 seconds
          cost: 0,
          characterConsistent: true,
          hasNativeAudio: true
        },
        {
          id: 'extended-segment',
          prompt: { message: request.prompt } as any,
          videoPath: extensionVideo.videoPath,
          duration: request.duration, // Extension duration (4, 6, or 8 seconds)
          cost: result.metadata?.cost || 1.2,
          characterConsistent: true,
          hasNativeAudio: true
        }
      ],
      stitchedPath,
      {
        platform: request.platform as 'tiktok' | 'youtube' | 'instagram',
        outputQuality: 'production',
        transitionStyle: 'platform-optimized',
        transitionDuration: 0.5,
        audioSync: true
      }
    );

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'complete',
      progress: 100,
      message: 'Stitching complete! 16-second video ready!'
    }));

    // Clean up last frame temp file
    try {
      await fs.unlink(lastFramePath);
    } catch (err) {
      // Ignore cleanup errors
    }

    // Return the stitched video URL (accessible via /generated/veo3/)
    const stitchedUrl = `/generated/veo3/${path.basename(stitchedPath)}`;

    console.log('RESULT:' + JSON.stringify({
      success: true,
      extendedVideoUrl: stitchedUrl, // Return the STITCHED video URL
      stitchedVideoPath: stitchedPath,
      originalVideoPath: request.videoPath,
      extensionVideoPath: extensionVideo.videoPath,
      cost: (result.metadata?.cost || 1.2) + 0.05, // VEO3 cost + stitching cost
      duration: stitchResult.duration,
      generationTime: result.metadata?.generationTime || 0,
      transitionsUsed: stitchResult.transitionsUsed
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
