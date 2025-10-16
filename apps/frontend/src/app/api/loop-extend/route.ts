import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { extensionOperations } from '../extend-video/operations-store';

interface LoopExtendRequest {
  videoUrl: string;
  loopCount: number;
  platform?: string;
  transitionStyle?: 'cut' | 'fade' | 'crossfade';
}

export async function POST(request: NextRequest) {
  try {
    const body: LoopExtendRequest = await request.json();
    const { videoUrl, loopCount, platform = 'youtube', transitionStyle = 'fade' } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    if (loopCount < 2 || loopCount > 10) {
      return NextResponse.json(
        { success: false, error: 'loopCount must be between 2 and 10' },
        { status: 400 }
      );
    }

    // Generate operation ID
    const operationId = `loop_extend_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize operation status
    extensionOperations.set(operationId, {
      status: 'processing',
      progress: 5,
      message: 'Starting loop extension...',
      videoUrl,
      loopCount,
      method: 'loop'
    });

    // Start async loop extension process (don't await)
    performLoopExtension(operationId, videoUrl, loopCount, platform, transitionStyle).catch((error) => {
      console.error('Loop extension error:', error);
      extensionOperations.set(operationId, {
        status: 'error',
        error: error.message,
        progress: 0
      });
    });

    return NextResponse.json({
      success: true,
      operationId,
      message: 'Loop extension started',
      estimatedCost: 0.05,
      estimatedTime: '30 seconds',
      savings: (loopCount - 1) * 1.20 - 0.05
    });

  } catch (error) {
    console.error('Error in loop-extend API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function performLoopExtension(
  operationId: string,
  videoUrl: string,
  loopCount: number,
  platform: string,
  transitionStyle: string
) {
  try {
    // Update progress
    extensionOperations.set(operationId, {
      ...extensionOperations.get(operationId),
      progress: 10,
      message: 'Validating video file...'
    });

    // Convert videoUrl to local file path
    let videoPath: string;
    if (videoUrl.startsWith('/')) {
      videoPath = path.join(process.cwd(), 'public', videoUrl.replace(/^\//, ''));
    } else if (videoUrl.includes(':\\') || videoUrl.includes(':/')) {
      videoPath = videoUrl;
    } else {
      videoPath = path.join(process.cwd(), 'public', videoUrl);
    }

    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Call viral engine's loop extension utility
    const { spawn } = await import('child_process');

    // Construct paths
    const tsxPath = path.join(process.cwd(), '..', 'viral', 'node_modules', '.bin', 'tsx');
    const scriptPath = path.join(process.cwd(), '..', 'viral', 'scripts', 'loop-extend-cli.ts');

    // Construct command with proper quoting for Windows
    const command = `"${tsxPath}" "${scriptPath}" "${videoPath}" ${loopCount} ${platform} ${transitionStyle}`;

    const loopProcess = spawn(command, [], {
      cwd: path.join(process.cwd(), '..', 'viral'),
      shell: true,
      env: process.env
    });

    let outputBuffer = '';
    let errorBuffer = '';

    loopProcess.stdout.on('data', (data) => {
      outputBuffer += data.toString();

      // Parse progress updates
      const lines = outputBuffer.split('\n');
      for (const line of lines) {
        if (line.startsWith('PROGRESS:')) {
          const progressData = JSON.parse(line.substring(9));
          extensionOperations.set(operationId, {
            ...extensionOperations.get(operationId),
            progress: progressData.progress || 0,
            message: progressData.message || 'Processing...'
          });
        }
      }
    });

    loopProcess.stderr.on('data', (data) => {
      errorBuffer += data.toString();
      console.error('Loop extension stderr:', data.toString());
    });

    await new Promise((resolve, reject) => {
      loopProcess.on('close', (code) => {
        if (code === 0) {
          // Parse final result
          const lines = outputBuffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('RESULT:')) {
              const result = JSON.parse(line.substring(7));
              if (result.success) {
                extensionOperations.set(operationId, {
                  status: 'complete',
                  progress: 100,
                  message: 'Loop extension complete!',
                  extendedVideoUrl: result.extendedVideoUrl,
                  originalVideoUrl: videoUrl,
                  cost: result.cost || 0.05,
                  savings: result.savings,
                  loopCount: result.loopCount,
                  method: 'loop'
                });
                resolve(result);
              } else {
                reject(new Error(result.error || 'Loop extension failed'));
              }
              return;
            }
          }
          reject(new Error('No result found in output'));
        } else {
          reject(new Error(`Loop extension process exited with code ${code}: ${errorBuffer}`));
        }
      });
    });

  } catch (error) {
    console.error('Error in performLoopExtension:', error);
    extensionOperations.set(operationId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      progress: 0
    });
  }
}
