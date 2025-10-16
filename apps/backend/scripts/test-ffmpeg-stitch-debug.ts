/**
 * Debug FFmpeg Stitching - Direct Test
 */

import dotenv from 'dotenv';
dotenv.config();

import { FFmpegStitchingEngine } from '../src/veo3/ffmpeg-stitching-engine';
import * as path from 'path';

async function main() {
  try {
    console.log('🎬 Testing FFmpeg Stitching Engine');
    console.log('');

    const stitchingEngine = new FFmpegStitchingEngine();
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3');
    const stitchedPath = path.join(outputDir, `test_debug_stitched_${timestamp}.mp4`);

    // Test with two real videos
    const segments = [
      {
        id: 'segment-1',
        prompt: { message: 'Professional insurance agent video' } as any,
        videoPath: 'E:\\v2 repo\\omega-platform\\public\\generated\\veo3\\veo3_video_1759608756143_0_branded.mp4',
        duration: 8,
        cost: 0,
        characterConsistent: true,
        hasNativeAudio: true
      },
      {
        id: 'segment-2',
        prompt: { message: 'Extension segment' } as any,
        videoPath: 'E:\\v2 repo\\omega-platform\\public\\generated\\veo3\\veo3_video_1759819840864_0.mp4',
        duration: 8,
        cost: 1.2,
        characterConsistent: true,
        hasNativeAudio: true
      }
    ];

    console.log('📹 Input Videos:');
    console.log(`   1: ${segments[0].videoPath}`);
    console.log(`   2: ${segments[1].videoPath}`);
    console.log(`📁 Output: ${stitchedPath}`);
    console.log('');

    const result = await stitchingEngine.stitchSegments(
      segments,
      stitchedPath,
      {
        platform: 'youtube',
        outputQuality: 'production',
        transitionStyle: 'platform-optimized',
        transitionDuration: 0.5,
        audioSync: true
      }
    );

    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${result.duration}s`);
    console.log(`   Transitions: ${result.transitionsUsed.join(', ')}`);
    console.log(`   Output: ${stitchedPath}`);

  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

main();
