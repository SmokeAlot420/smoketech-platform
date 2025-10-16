/**
 * Frame Extraction API Route (Server-Side Only)
 * Based on sora-extend's methodology
 *
 * Extracts final frame from video for Sora 2 input_reference continuity
 * Uses FFmpeg but ONLY server-side (no Turbopack bundling issues)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FrameExtractionRequest {
  videoPath: string;
  segmentIndex: number;
}

interface FrameExtractionResponse {
  success: boolean;
  framePath?: string;
  error?: string;
}

/**
 * Extract final frame from video (sora-extend methodology)
 *
 * Python equivalent:
 * cap = cv2.VideoCapture(video_path)
 * total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
 * cap.set(cv2.CAP_PROP_POS_FRAMES, total - 1)
 * success, frame = cap.read()
 * cv2.imwrite(out_image_path, frame)
 */
async function extractFinalFrame(
  videoPath: string,
  segmentIndex: number
): Promise<{ success: boolean; framePath?: string; error?: string }> {
  try {
    console.log(`🖼️ Extracting final frame from: ${videoPath}`);

    // Generate output path
    const videoDir = path.dirname(videoPath);
    const framesDir = path.join(videoDir, 'frames');

    // Ensure frames directory exists
    await fs.mkdir(framesDir, { recursive: true });

    const framePath = path.join(framesDir, `segment_${segmentIndex}_final.jpg`);

    // Extract last frame using FFmpeg (equivalent to OpenCV method)
    // -sseof -1: seek to 1 second before end
    // -frames:v 1: extract 1 frame
    // -q:v 2: high quality JPEG (2 = ~95% quality)
    const command = `ffmpeg -sseof -1 -i "${videoPath}" -update 1 -frames:v 1 -q:v 2 "${framePath}" -y`;

    await execAsync(command);

    console.log(`✅ Final frame extracted: ${framePath}`);

    return {
      success: true,
      framePath
    };

  } catch (error) {
    console.error('❌ Failed to extract final frame:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FrameExtractionRequest = await request.json();
    const { videoPath, segmentIndex } = body;

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: 'videoPath is required' },
        { status: 400 }
      );
    }

    if (typeof segmentIndex !== 'number') {
      return NextResponse.json(
        { success: false, error: 'segmentIndex is required' },
        { status: 400 }
      );
    }

    // Check if video file exists
    try {
      await fs.access(videoPath);
    } catch {
      return NextResponse.json(
        { success: false, error: `Video file not found: ${videoPath}` },
        { status: 404 }
      );
    }

    // Extract final frame
    const result = await extractFinalFrame(videoPath, segmentIndex);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      framePath: result.framePath
    });

  } catch (error) {
    console.error('❌ Frame extraction API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
