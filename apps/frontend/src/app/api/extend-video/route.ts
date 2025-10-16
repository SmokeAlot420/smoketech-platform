import { NextRequest, NextResponse } from "next/server";
import { Sora2Service } from "../../../../services/sora2-bridge";
import { VEO3Service } from "../../../../services/veo3-bridge";
import { operationStore } from "@/lib/operationStore";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';

/**
 * POST /api/extend-video
 * Interactive video extension - generates one new video segment using frame continuity
 * User-guided workflow: generates single video → waits for user prompt → extends with new segment
 * Returns operationId for status polling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      framePath,        // Path to extracted frame from previous video
      model = 'sora-2', // 'sora-2' | 'sora-2-pro' | 'veo3'
      prompt,           // User's prompt for this segment
      duration = 8,     // 4 | 6 | 8 seconds
      aspectRatio = '16:9', // '16:9' | '9:16' | '1:1'
    } = body;

    // Validation
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!framePath) {
      return NextResponse.json({ error: "Frame path is required for video extension" }, { status: 400 });
    }

    // Model-specific configuration validation
    if (model === 'veo3') {
      const projectId = process.env.GCP_PROJECT_ID;
      const location = process.env.GCP_LOCATION;

      if (!projectId || !location) {
        return NextResponse.json({
          error: "VEO3 requires Google Cloud Platform configuration. Please set GCP_PROJECT_ID and GCP_LOCATION environment variables."
        }, { status: 500 });
      }
    } else if (model === 'sora-2' || model === 'sora-2-pro') {
      const openaiApiKey = process.env.OPENAI_API_KEY;

      if (!openaiApiKey) {
        return NextResponse.json({
          error: "Sora 2 requires OpenAI API key. Please set OPENAI_API_KEY environment variable."
        }, { status: 500 });
      }
    }

    // Generate unique operation ID
    const operationId = uuidv4();

    // Create operation in store
    operationStore.create(operationId);

    console.log(`🔗 Starting video extension operation: ${operationId}`);
    console.log(`📊 Model: ${model}, Duration: ${duration}s, Aspect Ratio: ${aspectRatio}`);
    console.log(`📸 Using frame: ${framePath}`);
    console.log(`📝 Prompt: ${prompt}`);

    // Start background video extension
    extendVideoAsync(operationId, {
      framePath,
      model,
      prompt,
      duration,
      aspectRatio
    });

    // Return operationId immediately for status polling
    return NextResponse.json({
      success: true,
      operationId,
      message: `Video extension started. Poll /api/generate-videos/status/${operationId} for progress.`
    });

  } catch (error) {
    console.error("Error initiating video extension:", error);
    return NextResponse.json(
      { error: "Failed to initiate video extension. Check server logs for details." },
      { status: 500 }
    );
  }
}

/**
 * Background video extension function
 * Generates single video segment using frame continuity
 */
async function extendVideoAsync(
  operationId: string,
  config: {
    framePath: string;
    model: string;
    prompt: string;
    duration: number;
    aspectRatio: string;
  }
) {
  try {
    const { framePath, model, prompt, duration, aspectRatio } = config;

    // Resolve full frame path
    const fullFramePath = path.isAbsolute(framePath)
      ? framePath
      : path.join(process.cwd(), framePath);

    console.log(`📸 Full frame path: ${fullFramePath}`);

    // Branch based on model selection
    if (model === 'sora-2' || model === 'sora-2-pro') {
      // ========== SORA 2 EXTENSION ==========
      operationStore.update(operationId, {
        status: 'processing',
        progress: 10,
        message: 'Initializing Sora 2 extension...'
      });

      // Map aspect ratio to Sora 2 size format
      const sizeMap: Record<string, '720x1280' | '1280x720' | '1920x1080'> = {
        '9:16': '720x1280',
        '16:9': '1280x720',
        '1:1': '1280x720' // Sora 2 doesn't have 1:1, use 16:9
      };

      const size = sizeMap[aspectRatio] || '1280x720';

      // Initialize Sora 2 service
      const sora2Service = new Sora2Service({
        outputPath: './public/generated/sora2'
      });

      operationStore.update(operationId, {
        progress: 20,
        message: 'Generating extended video with frame continuity...'
      });

      console.log(`🎬 Generating Sora 2 video with input_reference...`);
      console.log(`📊 Duration: ${duration}s, Size: ${size}`);

      // Generate video with frame continuity
      const result = await sora2Service.generateVideoSegment({
        prompt,
        model: model as 'sora-2' | 'sora-2-pro',
        seconds: duration as 4 | 8 | 12,
        size,
        input_reference: fullFramePath // CRITICAL: Use extracted frame for continuity
      });

      if (!result.success || result.videos.length === 0) {
        throw new Error(result.error || 'Sora 2 generation failed');
      }

      const video = result.videos[0];

      console.log(`✅ Sora 2 video extended: ${video.videoPath}`);
      console.log(`⏱️  Duration: ${video.duration}s, Cost: $${result.metadata?.cost.toFixed(2)}`);

      // Extract final frame for future extensions
      console.log('🖼️ Extracting final frame for future extensions...');
      const { extractFinalFrameForSequentialExtend } = await import('@/utils/videoFrameExtractor');

      let extractedFramePath: string | undefined;
      try {
        extractedFramePath = await extractFinalFrameForSequentialExtend(video.videoPath, Date.now());
        console.log(`✅ Final frame extracted: ${extractedFramePath}`);
      } catch (error) {
        console.warn('⚠️ Failed to extract final frame:', error);
        // Non-critical error - video was generated successfully
      }

      // Update operation with final result
      operationStore.update(operationId, {
        status: 'complete',
        progress: 100,
        message: `Successfully extended video with Sora 2`,
        result: {
          videoPath: video.videoPath,
          videoUrl: video.videoUrl || `/api/videos/${encodeURIComponent(video.videoPath)}`,
          duration: video.duration,
          cost: result.metadata?.cost,
          model: result.metadata?.model,
          extractedFramePath, // Include for next extension
          canExtend: !!extractedFramePath // Flag if another extension is possible
        }
      });

      console.log(`✅ Sora 2 extension operation ${operationId} completed successfully`);

    } else if (model === 'veo3') {
      // ========== VEO3 EXTENSION ==========
      operationStore.update(operationId, {
        status: 'processing',
        progress: 10,
        message: 'Initializing VEO3 extension...'
      });

      const projectId = process.env.GCP_PROJECT_ID;
      const location = process.env.GCP_LOCATION;

      // Initialize VEO3 service
      const veo3Service = new VEO3Service({
        projectId: projectId || '',
        location: location || '',
        outputPath: './public/generated/veo3'
      });

      // Map aspect ratio to VEO3 resolution
      const resolutionMap: Record<string, { width: number; height: number }> = {
        '16:9': { width: 1280, height: 720 },
        '9:16': { width: 720, height: 1280 },
        '1:1': { width: 720, height: 720 }
      };

      const resolution = resolutionMap[aspectRatio] || { width: 1280, height: 720 };

      operationStore.update(operationId, {
        progress: 20,
        message: 'Generating extended video...'
      });

      console.log(`🎬 Generating VEO3 video...`);
      console.log(`⚠️ Note: VEO3 image-to-video not yet implemented, generating without frame reference`);

      // TODO: Implement VEO3 image-to-video when VEO3Service supports it
      // For now, generate video without frame reference
      const result = await veo3Service.generateVideoSegment({
        prompt,
        duration: duration as 4 | 6 | 8,
        aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1',
        enablePromptRewriting: true,
        enableSoundGeneration: true,
        quality: 'high'
      });

      if (!result.success || result.videos.length === 0) {
        throw new Error(result.error || 'VEO3 generation failed');
      }

      const video = result.videos[0];

      console.log(`✅ VEO3 video extended: ${video.videoPath}`);

      // Extract final frame for future extensions
      console.log('🖼️ Extracting final frame for future extensions...');
      const { extractFinalFrameForSequentialExtend } = await import('@/utils/videoFrameExtractor');

      let extractedFramePath: string | undefined;
      try {
        extractedFramePath = await extractFinalFrameForSequentialExtend(video.videoPath, Date.now());
        console.log(`✅ Final frame extracted: ${extractedFramePath}`);
      } catch (error) {
        console.warn('⚠️ Failed to extract final frame:', error);
      }

      // Update operation with final result
      operationStore.update(operationId, {
        status: 'complete',
        progress: 100,
        message: `Successfully extended video with VEO3`,
        result: {
          videoPath: video.videoPath,
          videoUrl: `/api/videos/${encodeURIComponent(video.videoPath)}`,
          duration: video.duration,
          model: 'veo3',
          extractedFramePath,
          canExtend: !!extractedFramePath
        }
      });

      console.log(`✅ VEO3 extension operation ${operationId} completed successfully`);
    }

  } catch (error) {
    console.error(`❌ Extension operation ${operationId} failed:`, error);

    operationStore.update(operationId, {
      status: 'error',
      progress: 0,
      message: 'Video extension failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
