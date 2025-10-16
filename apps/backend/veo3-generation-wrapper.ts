/**
 * VEO3 Generation Wrapper for Omega Service Integration
 *
 * This script wraps VEO3 generation and outputs structured results
 * in the format expected by omega-service.js:
 *
 * PROGRESS:{"stage":"generation","progress":50,"message":"..."}
 * RESULT:{"success":true,"videoPath":"...","cost":...}
 */

import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';
import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';

interface VEO3WrapperRequest {
  prompt: string;
  videoModel: string;
  duration: 4 | 6 | 8;
  platform?: string;
  enhancementLevel?: 'none' | 'basic' | 'standard' | 'cinematic';
  addLogo?: boolean; // Enable logo overlay
  logoPath?: string; // Path to logo PNG
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'left-center';
  logoSize?: number; // Logo width in pixels (default: 150)
  logoOpacity?: number; // 0.0 to 1.0 (default: 1.0)
  logoStartTime?: number; // When logo appears (seconds, e.g., 3.0)
  logoEndTime?: number; // When logo disappears (seconds, e.g., 8.0)
  logoFadeIn?: number; // Fade-in duration (seconds, default: 0.3)
  logoFadeOut?: number; // Fade-out duration (seconds, default: 0.3)
}

async function main() {
  try {
    // Parse environment variables from omega-service
    const request: VEO3WrapperRequest = {
      prompt: process.env.VEO3_PROMPT || '',
      videoModel: process.env.VEO3_MODEL || 'veo-3.0-json',
      duration: parseInt(process.env.VEO3_DURATION || '4') as 4 | 6 | 8,
      platform: process.env.VEO3_PLATFORM || 'youtube',
      enhancementLevel: (process.env.VEO3_ENHANCEMENT || 'standard') as any,
      // Logo overlay parameters
      addLogo: process.env.VEO3_ADD_LOGO === 'true',
      logoPath: process.env.VEO3_LOGO_PATH || undefined,
      logoPosition: (process.env.VEO3_LOGO_POSITION as any) || 'bottom-right',
      logoSize: parseInt(process.env.VEO3_LOGO_SIZE || '150'),
      logoOpacity: parseFloat(process.env.VEO3_LOGO_OPACITY || '0.9'),
      // Dynamic timing parameters
      logoStartTime: process.env.VEO3_LOGO_START_TIME ? parseFloat(process.env.VEO3_LOGO_START_TIME) : undefined,
      logoEndTime: process.env.VEO3_LOGO_END_TIME ? parseFloat(process.env.VEO3_LOGO_END_TIME) : undefined,
      logoFadeIn: parseFloat(process.env.VEO3_LOGO_FADE_IN || '0.3'),
      logoFadeOut: parseFloat(process.env.VEO3_LOGO_FADE_OUT || '0.3')
    };

    if (!request.prompt) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'VEO3_PROMPT environment variable is required'
      }));
      process.exit(1);
    }

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'initialization',
      progress: 5,
      message: 'Initializing VEO3 service...'
    }));

    // Initialize VEO3 service - generate directly to omega-platform public directory
    const veo3Service = new VEO3Service({
      projectId: process.env.GCP_PROJECT_ID || 'viral-ai-content-12345',
      location: process.env.GCP_LOCATION || 'us-central1',
      outputPath: path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3')
    });

    // Extract model type from videoModel (veo-3.0-fast/veo-3.0-json → 'fast')
    // Note: VEO3 only has 'fast' model available (veo-3.0-fast-generate-001)
    const modelType: 'fast' | 'standard' = 'fast';

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'enhancement',
      progress: 15,
      message: `Using VEO3 ${modelType} model${modelType === 'fast' ? ' (62.5% cheaper!)' : ''}...`
    }));

    // Generate video with VEO3
    const result = await veo3Service.generateVideoSegment({
      prompt: request.prompt,
      duration: request.duration,
      aspectRatio: '16:9',
      model: modelType,  // ✅ Pass the model type (fast or standard)
      videoCount: 1,     // ✅ Always generate 1 video by default
      useGeminiEnhancement: request.enhancementLevel !== 'none',
      geminiEnhancementLevel: request.enhancementLevel === 'none' ? 'basic' : request.enhancementLevel,
      enableSoundGeneration: true
    });

    if (result.success && result.videos.length > 0) {
      let video = result.videos[0];

      // STEP 3: Add logo overlay if requested (FFmpeg post-processing)
      if (request.addLogo) {
        console.log('PROGRESS:' + JSON.stringify({
          stage: 'branding',
          progress: 95,
          message: 'Adding QuoteMoto logo overlay...'
        }));

        try {
          const brandedVideoPath = await addLogoOverlay(
            video.videoPath,
            request.logoPath || path.join(process.cwd(), '..', 'omega-platform', 'public', 'quotemoto-black-logo.png'),
            request.logoPosition || 'bottom-right',
            request.logoSize || 150,
            request.logoOpacity || 0.9,
            request.logoStartTime,
            request.logoEndTime,
            request.logoFadeIn || 0.3,
            request.logoFadeOut || 0.3
          );

          // Update video path and URL
          video = {
            ...video,
            videoPath: brandedVideoPath,
            videoUrl: brandedVideoPath.includes('\\public\\')
              ? '/' + brandedVideoPath.split('\\public\\')[1].replace(/\\/g, '/')
              : video.videoUrl
          };

          console.log('✅ Logo overlay added successfully');
        } catch (logoError) {
          console.error('⚠️ Logo overlay failed, using original video:', logoError);
          // Continue with unbranded video
        }
      }

      console.log('RESULT:' + JSON.stringify({
        success: true,
        videoPath: video.videoPath,
        videoUrl: video.videoUrl,
        cost: result.metadata?.cost || 0,
        duration: video.duration,
        model: request.videoModel,
        enhancementLevel: request.enhancementLevel,
        generationTime: result.metadata?.generationTime || 0,
        branded: !!request.addLogo
      }));

      process.exit(0);
    } else {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: result.error || 'Video generation failed'
      }));
      process.exit(1);
    }

  } catch (error) {
    console.error('RESULT:' + JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    process.exit(1);
  }
}

/**
 * Add logo overlay to video using FFmpeg
 * Professional broadcast-quality branding with transparency support
 * Supports dynamic timing for synchronized logo appearance
 */
async function addLogoOverlay(
  videoPath: string,
  logoPath: string,
  position: string,
  size: number,
  opacity: number,
  startTime?: number,  // When logo appears (seconds)
  endTime?: number,     // When logo disappears (seconds)
  fadeIn: number = 0.3, // Fade-in duration (seconds)
  fadeOut: number = 0.3 // Fade-out duration (seconds)
): Promise<string> {
  // Verify logo exists
  try {
    await fs.access(logoPath);
  } catch {
    throw new Error(`Logo file not found: ${logoPath}`);
  }

  // Calculate output path (same directory, add "_branded" suffix)
  const parsedPath = path.parse(videoPath);
  const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_branded${parsedPath.ext}`);

  // Calculate logo position coordinates
  const positionMap: Record<string, string> = {
    'top-left': '25:25',
    'top-right': 'W-w-25:25',
    'bottom-left': '25:H-h-25',
    'bottom-right': 'W-w-25:H-h-25',
    'center': '(W-w)/2:(H-h)/2',
    'left-center': 'W/4:(H-h)/2'  // Left third of screen, vertically centered
  };

  const overlayPosition = positionMap[position] || positionMap['bottom-right'];

  return new Promise((resolve, reject) => {
    // Build logo filter chain with optional timing and fade effects
    let logoFilter = `[1:v]scale=${size}:-1,format=rgba`;

    // Add fade-in effect if timing is specified
    if (startTime !== undefined) {
      logoFilter += `,fade=in:st=${startTime}:d=${fadeIn}:alpha=1`;
    }

    // Add fade-out effect if end time is specified
    if (endTime !== undefined) {
      const fadeOutStart = endTime - fadeOut;
      logoFilter += `,fade=out:st=${fadeOutStart}:d=${fadeOut}:alpha=1`;
    }

    // Add opacity adjustment
    logoFilter += `,colorchannelmixer=aa=${opacity}[logo]`;

    // Build overlay filter with optional time-based enable
    let overlayFilter = `[0:v][logo]overlay=${overlayPosition}:format=auto`;

    // Add time-based display if specified
    if (startTime !== undefined || endTime !== undefined) {
      const start = startTime !== undefined ? startTime : 0;
      const end = endTime !== undefined ? endTime : 999; // Large number if no end specified
      overlayFilter += `:enable='between(t,${start},${end})'`;
    }

    overlayFilter += `,format=yuv420p[outv]`;

    // Combine filters
    const filterComplex = `${logoFilter};${overlayFilter}`;

    // FFmpeg command for professional logo overlay with dynamic timing
    const ffmpegArgs = [
      '-i', videoPath,
      '-i', logoPath,
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-map', '0:a?', // Map audio if exists
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23', // High quality
      '-c:a', 'copy', // Copy audio without re-encoding
      '-y', // Overwrite output
      outputPath
    ];

    console.log(`🎨 FFmpeg Logo Overlay Command:`);
    console.log(`   Logo: ${path.basename(logoPath)}`);
    console.log(`   Position: ${position} (${overlayPosition})`);
    console.log(`   Size: ${size}px wide`);
    console.log(`   Opacity: ${opacity}`);
    if (startTime !== undefined || endTime !== undefined) {
      console.log(`   ⏱️  Dynamic Timing:`);
      if (startTime !== undefined) console.log(`      Appears at: ${startTime}s (fade-in: ${fadeIn}s)`);
      if (endTime !== undefined) console.log(`      Disappears at: ${endTime}s (fade-out: ${fadeOut}s)`);
    }

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      // Show progress dots
      if (data.toString().includes('frame=')) {
        process.stdout.write('.');
      }
    });

    ffmpeg.on('close', async (code) => {
      console.log(''); // New line after progress dots

      if (code === 0) {
        // Verify output file was created
        try {
          await fs.access(outputPath);
          console.log(`✅ Branded video created: ${path.basename(outputPath)}`);
          resolve(outputPath);
        } catch {
          reject(new Error('Branded video file was not created'));
        }
      } else {
        reject(new Error(`FFmpeg failed with code ${code}: ${stderr.substring(0, 500)}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

main();
