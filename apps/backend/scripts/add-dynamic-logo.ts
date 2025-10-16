/**
 * Standalone script to add dynamic logo overlay to existing videos
 * Supports time-based appearance for synchronized branding moments
 *
 * Usage:
 * npx tsx add-dynamic-logo.ts <videoPath> <logoPath> <position> <startTime> <endTime>
 *
 * Example:
 * npx tsx add-dynamic-logo.ts video.mp4 logo.png left-center 3.0 8.0
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

interface LogoConfig {
  videoPath: string;
  logoPath: string;
  position: string;
  size: number;
  opacity: number;
  startTime?: number;
  endTime?: number;
  fadeIn: number;
  fadeOut: number;
}

async function addDynamicLogo(config: LogoConfig): Promise<string> {
  // Verify files exist
  try {
    await fs.access(config.videoPath);
    await fs.access(config.logoPath);
  } catch (err) {
    throw new Error(`File not found: ${err instanceof Error ? err.message : 'unknown error'}`);
  }

  // Calculate output path
  const parsedPath = path.parse(config.videoPath);
  const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_branded${parsedPath.ext}`);

  // Position map
  const positionMap: Record<string, string> = {
    'top-left': '25:25',
    'top-right': 'W-w-25:25',
    'bottom-left': '25:H-h-25',
    'bottom-right': 'W-w-25:H-h-25',
    'center': '(W-w)/2:(H-h)/2',
    'left-center': 'W/4:(H-h)/2'
  };

  const overlayPosition = positionMap[config.position] || positionMap['bottom-right'];

  // Build FFmpeg filter chain
  let logoFilter = `[1:v]scale=${config.size}:-1,format=rgba`;

  // Add fade-in effect
  if (config.startTime !== undefined) {
    logoFilter += `,fade=in:st=${config.startTime}:d=${config.fadeIn}:alpha=1`;
  }

  // Add fade-out effect
  if (config.endTime !== undefined) {
    const fadeOutStart = config.endTime - config.fadeOut;
    logoFilter += `,fade=out:st=${fadeOutStart}:d=${config.fadeOut}:alpha=1`;
  }

  // Add opacity
  logoFilter += `,colorchannelmixer=aa=${config.opacity}[logo]`;

  // Build overlay filter
  let overlayFilter = `[0:v][logo]overlay=${overlayPosition}:format=auto`;

  // Add time-based enable
  if (config.startTime !== undefined || config.endTime !== undefined) {
    const start = config.startTime !== undefined ? config.startTime : 0;
    const end = config.endTime !== undefined ? config.endTime : 999;
    overlayFilter += `:enable='between(t,${start},${end})'`;
  }

  overlayFilter += `,format=yuv420p[outv]`;

  const filterComplex = `${logoFilter};${overlayFilter}`;

  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-i', config.videoPath,
      '-i', config.logoPath,
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'copy',
      '-y',
      outputPath
    ];

    console.log('\n🎨 Dynamic Logo Overlay Configuration:');
    console.log(`   Video: ${path.basename(config.videoPath)}`);
    console.log(`   Logo: ${path.basename(config.logoPath)}`);
    console.log(`   Position: ${config.position} (${overlayPosition})`);
    console.log(`   Size: ${config.size}px`);
    console.log(`   Opacity: ${config.opacity}`);
    if (config.startTime !== undefined || config.endTime !== undefined) {
      console.log(`   ⏱️  Dynamic Timing:`);
      if (config.startTime !== undefined) {
        console.log(`      ▶️  Appears at: ${config.startTime}s (fade-in: ${config.fadeIn}s)`);
      }
      if (config.endTime !== undefined) {
        console.log(`      ⏹️  Disappears at: ${config.endTime}s (fade-out: ${config.fadeOut}s)`);
      }
    }
    console.log('\n🎬 Starting FFmpeg processing...\n');

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stderr = '';
    let lastProgress = 0;

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();

      // Extract progress
      const timeMatch = data.toString().match(/time=(\d+):(\d+):(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds > lastProgress) {
          process.stdout.write(`\r⏳ Processing: ${totalSeconds}s`);
          lastProgress = totalSeconds;
        }
      }
    });

    ffmpeg.on('close', async (code) => {
      console.log('\n');

      if (code === 0) {
        try {
          await fs.access(outputPath);
          console.log(`✅ Branded video created: ${outputPath}`);
          console.log(`📁 File size: ${(await fs.stat(outputPath)).size / 1024 / 1024} MB`);
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

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 5) {
    console.error(`
Usage: npx tsx add-dynamic-logo.ts <videoPath> <logoPath> <position> <startTime> <endTime> [options]

Arguments:
  videoPath    Path to the video file
  logoPath     Path to the PNG logo file
  position     Logo position (left-center, top-left, top-right, bottom-left, bottom-right, center)
  startTime    When logo appears (seconds, e.g., 3.0)
  endTime      When logo disappears (seconds, e.g., 8.0)

Optional:
  --size <number>       Logo width in pixels (default: 150)
  --opacity <number>    Opacity 0.0-1.0 (default: 1.0)
  --fade-in <number>    Fade-in duration in seconds (default: 0.5)
  --fade-out <number>   Fade-out duration in seconds (default: 0.3)

Example:
  npx tsx add-dynamic-logo.ts video.mp4 logo.png left-center 3.0 8.0 --size 200 --fade-in 0.7
`);
    process.exit(1);
  }

  const config: LogoConfig = {
    videoPath: path.resolve(args[0]),
    logoPath: path.resolve(args[1]),
    position: args[2],
    startTime: parseFloat(args[3]),
    endTime: parseFloat(args[4]),
    size: 150,
    opacity: 1.0,
    fadeIn: 0.5,
    fadeOut: 0.3
  };

  // Parse optional arguments
  for (let i = 5; i < args.length; i++) {
    if (args[i] === '--size' && i + 1 < args.length) {
      config.size = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--opacity' && i + 1 < args.length) {
      config.opacity = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--fade-in' && i + 1 < args.length) {
      config.fadeIn = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--fade-out' && i + 1 < args.length) {
      config.fadeOut = parseFloat(args[i + 1]);
      i++;
    }
  }

  try {
    const outputPath = await addDynamicLogo(config);
    console.log('\n🎉 Success! Branded video ready.');
    console.log(`📹 Output: ${outputPath}`);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
