/**
 * Simple Video Extension Test - No Complex Transitions
 * Tests basic FFmpeg concatenation to debug the stitching issue
 */

import dotenv from 'dotenv';
dotenv.config();

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

interface SimpleStitchRequest {
  video1Path: string;
  video2Path: string;
  outputPath: string;
}

async function simpleStitch(request: SimpleStitchRequest): Promise<void> {
  console.log('🎬 Simple FFmpeg Stitching Test');
  console.log(`📹 Video 1: ${request.video1Path}`);
  console.log(`📹 Video 2: ${request.video2Path}`);
  console.log(`📁 Output: ${request.outputPath}`);
  console.log('');

  // Create a concat filter list file
  const listFile = path.join(path.dirname(request.outputPath), 'concat_list.txt');
  const listContent = `file '${request.video1Path.replace(/\\/g, '/')}'\nfile '${request.video2Path.replace(/\\/g, '/')}'`;

  await fs.writeFile(listFile, listContent);
  console.log('📄 Created concat list file');

  return new Promise((resolve, reject) => {
    // Simple concat command - no transitions
    const ffmpegArgs = [
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      '-y',
      request.outputPath
    ];

    console.log('🚀 Executing FFmpeg command:');
    console.log(`   ffmpeg ${ffmpegArgs.join(' ')}`);
    console.log('');

    const process = spawn('ffmpeg', ffmpegArgs);

    let stderr = '';

    process.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
      // Show progress
      const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        console.log(`⏳ Processing: ${timeMatch[0]}`);
      }
    });

    process.on('close', async (code) => {
      // Clean up list file
      try {
        await fs.unlink(listFile);
      } catch {}

      if (code === 0) {
        console.log('✅ FFmpeg processing completed successfully');
        resolve();
      } else {
        console.error('❌ FFmpeg processing failed with code:', code);
        console.error('stderr:', stderr);
        reject(new Error(`FFmpeg failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      console.error('❌ FFmpeg process error:', error);
      reject(error);
    });
  });
}

async function main() {
  try {
    const video1 = 'E:\\v2 repo\\omega-platform\\public\\generated\\veo3\\veo3_video_1759608756143_0_branded.mp4';
    const video2 = 'E:\\v2 repo\\omega-platform\\public\\generated\\veo3\\veo3_video_1759819840864_0.mp4';
    const output = 'E:\\v2 repo\\omega-platform\\public\\generated\\veo3\\test_stitched_simple.mp4';

    await simpleStitch({
      video1Path: video1,
      video2Path: video2,
      outputPath: output
    });

    console.log('');
    console.log('✅ SUCCESS! Stitched video created:');
    console.log(`   ${output}`);

    // Get file info
    const stats = await fs.stat(output);
    console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

main();
