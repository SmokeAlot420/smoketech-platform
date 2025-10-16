import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { extensionOperations } from '../extend-video/operations-store';

interface SequentialExtendRequest {
  videoUrl: string;
  numberOfExtensions: number;

  // Simple Mode: Single master prompt (auto-generates segment prompts)
  continuationPrompt?: string;

  // Advanced Mode: Array of segment-specific prompts
  segmentPrompts?: string[];

  duration: 4 | 6 | 8;
  platform?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SequentialExtendRequest = await request.json();
    const {
      videoUrl,
      numberOfExtensions,
      continuationPrompt,
      segmentPrompts,
      duration = 8,
      platform = 'youtube'
    } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    // Validate mode-specific prompts
    const isSimpleMode = !!continuationPrompt;
    const isAdvancedMode = !!segmentPrompts && segmentPrompts.length > 0;

    if (!isSimpleMode && !isAdvancedMode) {
      return NextResponse.json(
        { success: false, error: 'Either continuationPrompt (Simple Mode) or segmentPrompts (Advanced Mode) is required' },
        { status: 400 }
      );
    }

    if (isSimpleMode && !continuationPrompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'continuationPrompt cannot be empty' },
        { status: 400 }
      );
    }

    if (isAdvancedMode && segmentPrompts.length !== numberOfExtensions) {
      return NextResponse.json(
        { success: false, error: `segmentPrompts array length (${segmentPrompts.length}) must match numberOfExtensions (${numberOfExtensions})` },
        { status: 400 }
      );
    }

    if (isAdvancedMode && segmentPrompts.some(p => !p || !p.trim())) {
      return NextResponse.json(
        { success: false, error: 'All segment prompts must be non-empty' },
        { status: 400 }
      );
    }

    if (numberOfExtensions < 1 || numberOfExtensions > 10) {
      return NextResponse.json(
        { success: false, error: 'numberOfExtensions must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Generate operation ID
    const operationId = `sequential_extend_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Calculate costs
    const costPerExtension = duration / 8 * 1.20;
    const totalCost = numberOfExtensions * costPerExtension;
    const estimatedTime = numberOfExtensions * 90 + 30; // ~90s per VEO3 generation + 30s stitching

    // Initialize operation status
    const mode = isSimpleMode ? 'simple' : 'advanced';
    extensionOperations.set(operationId, {
      status: 'processing',
      progress: 5,
      message: `Starting sequential extension (${mode} mode)...`,
      videoUrl,
      numberOfExtensions,
      method: 'sequential',
      mode
    });

    // Start async sequential extension process (don't await)
    performSequentialExtension(
      operationId,
      videoUrl,
      numberOfExtensions,
      continuationPrompt,
      segmentPrompts,
      duration,
      platform
    ).catch((error) => {
      console.error('Sequential extension error:', error);
      extensionOperations.set(operationId, {
        status: 'error',
        error: error.message,
        progress: 0
      });
    });

    return NextResponse.json({
      success: true,
      operationId,
      message: `Sequential extension started (${mode} mode)`,
      mode,
      estimatedCost: parseFloat(totalCost.toFixed(2)),
      costPerExtension: parseFloat(costPerExtension.toFixed(2)),
      estimatedTime: `${Math.floor(estimatedTime / 60)} minutes ${estimatedTime % 60} seconds`,
      numberOfExtensions,
      duration
    });

  } catch (error) {
    console.error('Error in sequential-extend API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function performSequentialExtension(
  operationId: string,
  videoUrl: string,
  numberOfExtensions: number,
  continuationPrompt: string | undefined,
  segmentPrompts: string[] | undefined,
  duration: number,
  platform: string
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

    // Call viral engine's sequential extension utility
    const { spawn } = await import('child_process');

    // Construct paths
    const tsxPath = path.join(process.cwd(), '..', 'viral', 'node_modules', '.bin', 'tsx');
    const scriptPath = path.join(process.cwd(), '..', 'viral', 'scripts', 'sequential-extend-cli.ts');

    // Build command based on mode
    let command: string;
    if (continuationPrompt) {
      // Simple Mode: Single master prompt
      command = `"${tsxPath}" "${scriptPath}" "${videoPath}" ${numberOfExtensions} "${continuationPrompt}" ${duration} ${platform}`;
    } else if (segmentPrompts) {
      // Advanced Mode: Array of segment prompts
      // Save segment prompts to temporary JSON file for child process
      const tempPromptsPath = path.join(process.cwd(), '..', 'viral', 'temp', `segment-prompts-${Date.now()}.json`);
      await fs.mkdir(path.dirname(tempPromptsPath), { recursive: true });
      await fs.writeFile(tempPromptsPath, JSON.stringify(segmentPrompts));

      // Pass path to prompts file instead of inline prompts
      command = `"${tsxPath}" "${scriptPath}" "${videoPath}" ${numberOfExtensions} --prompts-file "${tempPromptsPath}" ${duration} ${platform}`;
    } else {
      throw new Error('Either continuationPrompt or segmentPrompts must be provided');
    }

    const sequentialProcess = spawn(command, [], {
      cwd: path.join(process.cwd(), '..', 'viral'),
      shell: true,
      env: process.env
    });

    let outputBuffer = '';
    let errorBuffer = '';

    sequentialProcess.stdout.on('data', (data) => {
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

    sequentialProcess.stderr.on('data', (data) => {
      errorBuffer += data.toString();
      console.error('Sequential extension stderr:', data.toString());
    });

    await new Promise((resolve, reject) => {
      sequentialProcess.on('close', (code) => {
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
                  message: 'Sequential extension complete!',
                  extendedVideoUrl: result.extendedVideoUrl,
                  originalVideoUrl: videoUrl,
                  cost: result.totalCost,
                  numberOfExtensions: result.numberOfExtensions,
                  duration: result.duration,
                  method: 'sequential'
                });
                resolve(result);
              } else {
                reject(new Error(result.error || 'Sequential extension failed'));
              }
              return;
            }
          }
          reject(new Error('No result found in output'));
        } else {
          reject(new Error(`Sequential extension process exited with code ${code}: ${errorBuffer}`));
        }
      });
    });

  } catch (error) {
    console.error('Error in performSequentialExtension:', error);
    extensionOperations.set(operationId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      progress: 0
    });
  }
}
