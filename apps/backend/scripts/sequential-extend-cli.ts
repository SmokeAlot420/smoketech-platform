/**
 * Sequential Smart Extend CLI - Multi-Segment Video Extension
 *
 * Generates MULTIPLE NEW extensions sequentially, each continuing from the previous segment,
 * then stitches them seamlessly into one smooth long-form video.
 *
 * Cost Comparison vs Single Extend:
 * - Single Extend (8s): $1.20 for 16-second total video
 * - Sequential Extend (7x): $8.40 for 64-second total video (8s original + 7×8s extensions)
 *
 * Use Cases:
 * - Create full 60-second videos from 8-second clips
 * - Extend scenes naturally without visible cuts
 * - Generate continuous narratives
 * - Create long-form content that looks like one take
 *
 * Process:
 * 1. Extract last frame from original video
 * 2. Generate Extension 1 using VEO3 from last frame (NEW content)
 * 3. Extract last frame from Extension 1
 * 4. Generate Extension 2 using VEO3 from Extension 1's last frame (NEW content)
 * 5. Repeat for N extensions
 * 6. Stitch all segments seamlessly (no visible transitions)
 * 7. Output one smooth continuous video
 *
 * Outputs structured results in format expected by omega-service:
 * PROGRESS:{"stage":"...","progress":...,"message":"..."}
 * RESULT:{"success":true,"extendedVideoUrl":"...","cost":...}
 */

import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from '../src/services/veo3Service';
import { FFmpegStitchingEngine } from '../src/veo3/ffmpeg-stitching-engine';
import { sequentialPromptGenerator } from '../src/services/sequentialPromptGenerator';
import * as path from 'path';
import * as fs from 'fs/promises';

interface SequentialExtendRequest {
  videoPath: string;
  numberOfExtensions: number; // How many 8s extensions to generate (e.g., 7 for 60s total)

  // TWO MODES SUPPORTED:
  // 1. Simple Mode: Single master prompt (auto-generates segment prompts)
  continuationPrompt?: string; // Master prompt for auto-generation

  // 2. Advanced Mode: Array of segment-specific prompts (uses directly)
  segmentPrompts?: string[]; // Pre-generated prompts for each segment

  duration: 4 | 6 | 8; // Duration of each extension segment
  platform: 'tiktok' | 'youtube' | 'instagram';
  contentType?: 'explanatory' | 'storytelling' | 'demonstration' | 'sales'; // For smart prompt generation
  characterDescription?: string; // For character consistency in auto-generated prompts
}

async function extractLastFrame(videoPath: string, outputPath: string): Promise<string> {
  const { spawn } = await import('child_process');

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-sseof', '-0.1', // Extract from 0.1s before end
      '-i', videoPath,
      '-update', '1',
      '-q:v', '1',
      '-frames:v', '1',
      '-y',
      outputPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`ffmpeg extraction failed with exit code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg spawn error: ${err.message}`));
    });
  });
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
    if (args.length < 4) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Usage: sequential-extend-cli.ts <videoPath> <numberOfExtensions> <continuationPrompt|--prompts-file> <duration> [platform]'
      }));
      process.exit(1);
    }

    // Check if Advanced Mode (--prompts-file)
    const isAdvancedMode = args[2].startsWith('--prompts-file');
    let segmentPrompts: string[] | undefined;
    let continuationPrompt: string | undefined;

    if (isAdvancedMode) {
      // Advanced Mode: Load prompts from file
      const promptsFilePath = args[2].split('=')[1] || args[3]; // Support both --prompts-file=path and --prompts-file path
      const promptsJson = await fs.readFile(promptsFilePath, 'utf-8');
      segmentPrompts = JSON.parse(promptsJson);
      continuationPrompt = undefined;
    } else {
      // Simple Mode: Single master prompt
      continuationPrompt = args[2];
      segmentPrompts = undefined;
    }

    const request: SequentialExtendRequest = {
      videoPath: args[0],
      numberOfExtensions: parseInt(args[1]),
      continuationPrompt,
      segmentPrompts,
      duration: parseInt(args[isAdvancedMode ? 4 : 3]) as 4 | 6 | 8,
      platform: (args[isAdvancedMode ? 5 : 4] as 'tiktok' | 'youtube' | 'instagram') || 'youtube'
    };

    // Validate number of extensions
    if (request.numberOfExtensions < 1 || request.numberOfExtensions > 10) {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Number of extensions must be between 1 and 10'
      }));
      process.exit(1);
    }

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'initialization',
      progress: 5,
      message: `Starting sequential extension: ${request.numberOfExtensions} segments...`
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

    // Get original video duration
    const originalDuration = await getVideoDuration(request.videoPath);

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'validation',
      progress: 10,
      message: `Original video: ${originalDuration.toFixed(1)}s, generating ${request.numberOfExtensions} extensions...`
    }));

    // Initialize services
    const veo3Service = new VEO3Service();
    const stitchingEngine = new FFmpegStitchingEngine();
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3', 'temp');
    const outputDir = path.join(process.cwd(), '..', 'omega-platform', 'public', 'generated', 'veo3');

    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });

    // Track all segments (starting with original)
    const segments: Array<{
      id: string;
      prompt: any;
      videoPath: string;
      duration: number;
      cost: number;
      characterConsistent: boolean;
      hasNativeAudio: boolean;
    }> = [];

    // Add original video as first segment
    segments.push({
      id: 'original',
      prompt: { message: 'Original video' } as any,
      videoPath: request.videoPath,
      duration: originalDuration,
      cost: 0,
      characterConsistent: true,
      hasNativeAudio: true
    });

    let totalCost = 0;
    let previousVideoPath = request.videoPath;

    // Determine mode and prepare prompts
    let finalPrompts: string[];
    if (request.segmentPrompts && request.segmentPrompts.length > 0) {
      // ADVANCED MODE: Use provided segment prompts directly
      console.log('PROGRESS:' + JSON.stringify({
        stage: 'validation',
        progress: 12,
        message: `Using ${request.segmentPrompts.length} custom segment prompts (Advanced Mode)`
      }));

      if (request.segmentPrompts.length !== request.numberOfExtensions) {
        console.error('RESULT:' + JSON.stringify({
          success: false,
          error: `Number of segment prompts (${request.segmentPrompts.length}) must match numberOfExtensions (${request.numberOfExtensions})`
        }));
        process.exit(1);
      }

      finalPrompts = request.segmentPrompts;
    } else if (request.continuationPrompt) {
      // SIMPLE MODE: Auto-generate segment-specific prompts from master prompt
      console.log('PROGRESS:' + JSON.stringify({
        stage: 'smart_generation',
        progress: 12,
        message: `Auto-generating ${request.numberOfExtensions} smart segment prompts (Simple Mode)...`
      }));

      const promptResult = await sequentialPromptGenerator.generateSegmentPrompts({
        masterPrompt: request.continuationPrompt,
        numberOfSegments: request.numberOfExtensions,
        segmentDuration: request.duration,
        contentType: request.contentType || 'explanatory',
        characterDescription: request.characterDescription
      });

      if (!promptResult.success) {
        console.error('RESULT:' + JSON.stringify({
          success: false,
          error: `Smart prompt generation failed: ${promptResult.error}`
        }));
        process.exit(1);
      }

      finalPrompts = promptResult.segmentPrompts.map(sp => sp.prompt);

      console.log('PROGRESS:' + JSON.stringify({
        stage: 'smart_generation_complete',
        progress: 15,
        message: `✅ Generated ${finalPrompts.length} optimized segment prompts with natural pacing and transitions`
      }));
    } else {
      console.error('RESULT:' + JSON.stringify({
        success: false,
        error: 'Must provide either continuationPrompt (Simple Mode) or segmentPrompts (Advanced Mode)'
      }));
      process.exit(1);
    }

    // Generate each extension sequentially using the prepared prompts
    for (let i = 0; i < request.numberOfExtensions; i++) {
      const extensionNum = i + 1;
      const progressPercent = 15 + (extensionNum / request.numberOfExtensions) * 70;
      const currentPrompt = finalPrompts[i];

      console.log('PROGRESS:' + JSON.stringify({
        stage: 'generating',
        progress: progressPercent,
        message: `Generating segment ${extensionNum}/${request.numberOfExtensions} using VEO3...`
      }));

      // Extract last frame from previous segment
      const lastFramePath = path.join(tempDir, `last_frame_${extensionNum}_${timestamp}.jpg`);
      await extractLastFrame(previousVideoPath, lastFramePath);

      console.log('PROGRESS:' + JSON.stringify({
        stage: 'generating',
        progress: progressPercent + 2,
        message: `Segment ${extensionNum}: Extracted last frame, generating video with optimized prompt...`
      }));

      // Generate new extension from last frame using VEO3 with segment-specific prompt
      const extensionResult = await veo3Service.generateVideoSegment({
        prompt: currentPrompt, // Use segment-specific prompt (auto-generated or custom)
        firstFrame: lastFramePath, // Image-to-video generation
        duration: request.duration,
        aspectRatio: '16:9',
        model: 'fast', // Use fast model for sequential generation ($1.20 per video)
        enableSoundGeneration: true,
        videoCount: 1
      });

      if (!extensionResult.success) {
        throw new Error(`Extension ${extensionNum} failed: ${extensionResult.error}`);
      }

      console.log('PROGRESS:' + JSON.stringify({
        stage: 'generating',
        progress: progressPercent + 5,
        message: `Extension ${extensionNum}: Video generated, preparing for stitching...`
      }));

      // Get the first video from the result (videoCount is 1)
      if (extensionResult.videos.length === 0) {
        throw new Error(`Extension ${extensionNum}: No video generated`);
      }

      const generatedVideo = extensionResult.videos[0];
      const extensionPath = generatedVideo.videoPath;

      segments.push({
        id: `extension-${extensionNum}`,
        prompt: { message: currentPrompt } as any, // Store the specific prompt used for this segment
        videoPath: extensionPath,
        duration: generatedVideo.duration,
        cost: extensionResult.metadata?.cost || (request.duration / 8 * 1.20),
        characterConsistent: true,
        hasNativeAudio: true
      });

      totalCost += extensionResult.metadata?.cost || (request.duration / 8 * 1.20);
      previousVideoPath = extensionPath;

      // Clean up last frame
      await fs.unlink(lastFramePath).catch(() => {});
    }

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'stitching',
      progress: 85,
      message: `All ${request.numberOfExtensions} extensions generated, stitching seamlessly...`
    }));

    // Stitch all segments together seamlessly (no visible transitions)
    const finalPath = path.join(outputDir, `sequential_extended_${timestamp}.mp4`);
    const stitchResult = await stitchingEngine.stitchSegments(
      segments,
      finalPath,
      {
        platform: request.platform,
        outputQuality: 'production',
        transitionStyle: 'fade', // Use minimal fade for seamless look
        transitionDuration: 0.3, // Very short transition
        audioSync: true
      }
    );

    console.log('PROGRESS:' + JSON.stringify({
      stage: 'complete',
      progress: 100,
      message: `Sequential extension complete! ${stitchResult.duration.toFixed(1)}s video ready!`
    }));

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    // Return the extended video URL
    const extendedUrl = `/generated/veo3/${path.basename(finalPath)}`;

    const mode = request.segmentPrompts ? 'advanced' : 'simple';

    console.log('RESULT:' + JSON.stringify({
      success: true,
      extendedVideoUrl: extendedUrl,
      extendedVideoPath: finalPath,
      originalVideoPath: request.videoPath,
      numberOfExtensions: request.numberOfExtensions,
      totalCost: parseFloat(totalCost.toFixed(2)),
      costPerExtension: parseFloat((totalCost / request.numberOfExtensions).toFixed(2)),
      duration: stitchResult.duration,
      originalDuration: originalDuration,
      addedDuration: stitchResult.duration - originalDuration,
      transitionsUsed: stitchResult.transitionsUsed,
      segmentsGenerated: segments.length,
      method: 'sequential_extend',
      mode, // 'simple' (auto-generated prompts) or 'advanced' (custom prompts)
      estimatedTime: `${(request.numberOfExtensions * 90 + 30).toFixed(0)} seconds` // ~90s per VEO3 generation + 30s stitching
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
