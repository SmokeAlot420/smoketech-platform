import { NextRequest, NextResponse } from "next/server";
import { VEO3Service } from "../../../../services/veo3-bridge";
import { operationStore } from "@/lib/operationStore";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/generate-videos
 * Initiates asynchronous video generation with Simple or Power Mode
 * Supports both VEO3 and Sora 2 models
 * Returns operationId for status polling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      segmentPrompts,
      numberOfSegments = 1,
      duration = 8,
      platform = 'youtube',
      mode = 'simple',
      videoStyle = 'sequential', // 'single' or 'sequential'
      powerModeVideoLength = 56, // Total video length for Power Mode
      character, // Simple Mode character selection
      tone, // Simple Mode tone
      environment, // Simple Mode environment
      model = 'veo3', // 'veo3' | 'sora-2' | 'sora-2-pro'
      aspectRatio = '16:9', // '16:9' | '9:16' | '1:1'
      contentType = 'explainer', // 'product-demo' | 'explainer' | 'story' | 'testimonial' | 'tutorial'
      apiKey: userApiKey
    } = body;

    // Validation
    if (mode === 'simple' && !character) {
      return NextResponse.json({ error: "Character selection is required for Simple Mode" }, { status: 400 });
    }

    if (mode === 'advanced' && videoStyle === 'sequential' && (!segmentPrompts || segmentPrompts.length === 0)) {
      return NextResponse.json({ error: "Segment prompts are required for Sequential video style" }, { status: 400 });
    }

    // Model-specific configuration validation
    if (model === 'veo3') {
      // Check for GCP configuration
      const projectId = process.env.GCP_PROJECT_ID;
      const location = process.env.GCP_LOCATION;

      if (!projectId || !location) {
        return NextResponse.json({
          error: "VEO3 requires Google Cloud Platform configuration. Please set GCP_PROJECT_ID and GCP_LOCATION environment variables."
        }, { status: 500 });
      }
    } else if (model === 'sora-2' || model === 'sora-2-pro') {
      // Check for OpenAI API key
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
    const operation = await operationStore.create(operationId);

    console.log(`🎬 Starting video generation operation: ${operationId}`);
    console.log(`📊 Model: ${model}, Mode: ${mode}, Style: ${videoStyle}`);
    console.log(`📐 Video Length: ${powerModeVideoLength}s, Segment Duration: ${duration}s, Aspect Ratio: ${aspectRatio}`);
    console.log(`🎯 Platform: ${platform}, Content Type: ${contentType}`);
    if (mode === 'simple') {
      console.log(`👤 Character: ${character}, Tone: ${tone}, Environment: ${environment}`);
    }

    // Get configuration based on model
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;

    // Start background video generation
    generateVideosAsync(operationId, {
      prompt,
      segmentPrompts,
      numberOfSegments,
      duration,
      platform,
      mode,
      videoStyle,
      powerModeVideoLength,
      character,
      tone,
      environment,
      model,
      aspectRatio,
      contentType,
      projectId: projectId || '',
      location: location || ''
    });

    // Return operationId immediately for status polling
    return NextResponse.json({
      success: true,
      operationId,
      message: `Video generation started. Poll /api/generate-videos/status/${operationId} for progress.`
    });

  } catch (error) {
    console.error("Error initiating video generation:", error);
    return NextResponse.json(
      { error: "Failed to initiate video generation. Check server logs for details." },
      { status: 500 }
    );
  }
}

/**
 * Background video generation function
 * Updates operation status as generation progresses
 * Supports both VEO3 and Sora 2 models
 */
async function generateVideosAsync(
  operationId: string,
  config: {
    prompt?: string;
    segmentPrompts?: string[];
    numberOfSegments: number;
    duration: number;
    platform: string;
    mode: string;
    videoStyle: string; // 'single' or 'sequential'
    powerModeVideoLength: number; // Total video length in seconds
    character?: string; // Simple Mode character
    tone?: string; // Simple Mode tone
    environment?: string; // Simple Mode environment
    model: string; // 'veo3' | 'sora-2' | 'sora-2-pro'
    aspectRatio: string; // '16:9' | '9:16' | '1:1'
    contentType: string; // 'product-demo' | 'explainer' | 'story' | 'testimonial' | 'tutorial'
    projectId: string;
    location: string;
  }
) {
  try {
    const {
      prompt,
      segmentPrompts,
      numberOfSegments,
      duration,
      platform,
      mode,
      videoStyle,
      powerModeVideoLength,
      character,
      tone,
      environment,
      model,
      aspectRatio,
      contentType,
      projectId,
      location
    } = config;

    // Branch based on model selection
    if (model === 'sora-2' || model === 'sora-2-pro') {
      // ========== SORA 2 PIPELINE ==========
      await generateWithSora2(operationId, config);
    } else {
      // ========== VEO3 PIPELINE (EXISTING) ==========
      // Update status to processing
      await operationStore.update(operationId, {
        status: 'processing',
        progress: 5,
        message: 'Initializing VEO3 service...'
      });

    // Initialize VEO3 service
    const veo3Service = new VEO3Service({
      projectId,
      location,
      outputPath: './public/generated/veo3'
    });

    // Get platform-optimized settings
    const platformSettings = VEO3Service.getPlatformSettings(platform as 'tiktok' | 'youtube' | 'instagram');

    // Determine prompts to generate
    let prompts: string[] = [];

    if (mode === 'simple') {
      // Simple Mode: Build prompt from character, tone, environment
      // ALWAYS generates ONE video only - user extends manually via Interactive Extension Dialog
      await operationStore.update(operationId, {
        progress: 10,
        message: 'Building video prompt from your selections...'
      });

      // Construct prompt for a SINGLE video segment
      const singlePrompt = `${character} with ${tone} tone in ${environment} setting. ${prompt || ''}`.trim();
      console.log(`📝 Simple Mode single video prompt: ${singlePrompt}`);

      // Simple Mode: Generate ONE video only for interactive extension workflow
      prompts = [singlePrompt];
      console.log(`✅ Simple Mode: Generating 1 video segment for interactive extension`);

    } else if (mode === 'advanced') {
      // Power Mode: Handle Single Scene vs Sequential Scenes
      if (videoStyle === 'single') {
        // Single Scene: Generate ONE segment only (will be looped/extended client-side)
        await operationStore.update(operationId, {
          progress: 10,
          message: 'Generating single scene for loop/extend...'
        });

        if (segmentPrompts && segmentPrompts.length > 0) {
          // Use first segment prompt as the single scene
          prompts = [segmentPrompts[0]];
          console.log(`🔄 Single Scene mode: Generating one ${duration}s video to loop/extend to ${powerModeVideoLength}s`);
        } else {
          throw new Error('Single Scene mode requires at least one segment prompt');
        }

      } else if (videoStyle === 'sequential' && segmentPrompts) {
        // Sequential Scenes: Use provided segment prompts
        await operationStore.update(operationId, {
          progress: 10,
          message: 'Preparing sequential segments...'
        });

        prompts = segmentPrompts.slice(0, numberOfSegments);
        console.log(`📊 Sequential Scenes mode: Generating ${prompts.length} different segments`);
      }
    }

    console.log(`📝 Generating ${prompts.length} video segments...`);

    // Generate videos for each segment
    const videos = [];
    const totalSegments = prompts.length;

    for (let i = 0; i < totalSegments; i++) {
      const segmentPrompt = prompts[i];
      const progressBase = 20 + (i * 70 / totalSegments);

      await operationStore.update(operationId, {
        progress: Math.round(progressBase),
        message: `Generating segment ${i + 1}/${totalSegments}...`
      });

      console.log(`🎬 Segment ${i + 1}/${totalSegments}: ${segmentPrompt.substring(0, 100)}...`);

      try {
        // Generate video segment
        const result = await veo3Service.generateVideoSegment({
          prompt: segmentPrompt,
          ...platformSettings,
          duration: duration as 4 | 6 | 8,
          enablePromptRewriting: true,
          enableSoundGeneration: true,
          quality: 'high'
        });

        if (result.success && result.videos.length > 0) {
          const video = result.videos[0];
          // Convert file path to public URL path (normalize Windows backslashes first)
          // e.g., "public\generated\veo3\file.mp4" -> "/generated/veo3/file.mp4"
          const publicUrl = video.videoPath.replace(/\\/g, '/').replace(/^\.?\/?(public\/)?/, '/');
          videos.push({
            id: `veo3-${operationId}-${i}`,
            url: video.videoUrl || publicUrl,
            duration: video.duration,
            quality: video.quality,
            platform: platform,
            segmentIndex: i
          });
          console.log(`✅ Segment ${i + 1} generated successfully`);
        } else {
          console.error(`❌ Segment ${i + 1} failed:`, result.error);
          throw new Error(`Segment ${i + 1} generation failed: ${result.error}`);
        }

      } catch (error) {
        console.error(`❌ Error generating segment ${i + 1}:`, error);
        throw error;
      }
    }

    // Extract final frame from last video for extension
    let extractedFramePath: string | undefined;
    if (videos.length > 0) {
      console.log('🖼️ Extracting final frame for future extensions...');
      const lastVideo = videos[videos.length - 1];
      const lastVideoPath = lastVideo.url.startsWith('/api/videos/')
        ? decodeURIComponent(lastVideo.url.replace('/api/videos/', ''))
        : lastVideo.url;

      try {
        const { extractFinalFrameForSequentialExtend } = await import('@/utils/videoFrameExtractor');
        extractedFramePath = await extractFinalFrameForSequentialExtend(lastVideoPath, Date.now());
        console.log(`✅ Final frame extracted: ${extractedFramePath}`);
      } catch (error) {
        console.warn('⚠️ Failed to extract final frame:', error);
        // Non-critical error - video was generated successfully
      }
    }

    // All segments generated successfully
    await operationStore.update(operationId, {
      status: 'complete',
      progress: 100,
      message: videoStyle === 'single'
        ? `Successfully generated single scene (${duration}s). Loop/extend to ${powerModeVideoLength}s on client.`
        : `Successfully generated ${videos.length} sequential video segments`,
      result: {
        videos,
        totalSegments: videos.length,
        totalDuration: videos.reduce((sum, v) => sum + v.duration, 0),
        platform,
        videoStyle,
        powerModeVideoLength,
        requiresLooping: videoStyle === 'single', // Flag for client-side processing
        extractedFramePath, // Frame path for extension
        canExtend: !!extractedFramePath // Show "Extend" button if frame extracted
      }
    });

      console.log(`✅ Operation ${operationId} completed successfully with ${videos.length} videos`);
    }
    // ========== END VEO3 PIPELINE ==========

  } catch (error) {
    console.error(`❌ Operation ${operationId} failed:`, error);

    await operationStore.update(operationId, {
      status: 'error',
      progress: 0,
      message: 'Video generation failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

/**
 * Generate video using Sora 2 Sequential Extend Pipeline
 */
async function generateWithSora2(
  operationId: string,
  config: {
    prompt?: string;
    segmentPrompts?: string[];
    numberOfSegments: number;
    duration: number;
    platform: string;
    mode: string;
    videoStyle: string;
    powerModeVideoLength: number;
    character?: string;
    tone?: string;
    environment?: string;
    model: string;
    aspectRatio: string;
    contentType: string;
    projectId: string;
    location: string;
  }
) {
  try {
    const {
      prompt,
      numberOfSegments,
      duration,
      mode,
      powerModeVideoLength,
      character,
      tone,
      environment,
      model,
      aspectRatio,
      contentType
    } = config;

    // Update status
    await operationStore.update(operationId, {
      status: 'processing',
      progress: 5,
      message: 'Initializing Sora 2 pipeline...'
    });

    // Import Sora2ExtendPipeline from local lib
    const { Sora2ExtendPipeline } = await import('@/lib/sora2ExtendPipeline');

    // Build master prompt based on mode
    let masterPrompt = '';
    let actualSegments = numberOfSegments;

    if (mode === 'simple') {
      await operationStore.update(operationId, {
        progress: 10,
        message: 'Building video prompt for single segment...'
      });

      // Simple Mode: Generate ONE video only for interactive extension
      masterPrompt = `${character} with ${tone} tone in ${environment} setting. ${prompt || ''}`.trim();
      actualSegments = 1; // Force single segment for Simple Mode
      console.log(`📝 Simple Mode single segment prompt: ${masterPrompt}`);
    } else {
      // Advanced mode - use provided prompt
      masterPrompt = prompt || 'Create a professional video';
      actualSegments = numberOfSegments || Sora2ExtendPipeline.calculateOptimalSegments(powerModeVideoLength, duration);
    }

    // Calculate optimal segment configuration
    const segmentDuration = duration || Sora2ExtendPipeline.getRecommendedSegmentDuration(contentType as any);

    // Estimate cost before generation
    const costEstimate = Sora2ExtendPipeline.compareCosts(
      powerModeVideoLength,
      model as 'sora-2' | 'sora-2-pro'
    );

    console.log(`💰 Cost Estimate: $${costEstimate.sora2Cost.toFixed(4)} (${costEstimate.savingsPercent.toFixed(1)}% savings vs VEO3)`);

    await operationStore.update(operationId, {
      progress: 15,
      message: mode === 'simple'
        ? 'Generating single video segment for interactive extension...'
        : `Generating ${actualSegments} segments (${segmentDuration}s each)...`,
      metadata: {
        estimatedCost: costEstimate.sora2Cost,
        estimatedSavings: costEstimate.savings,
        savingsPercent: costEstimate.savingsPercent
      }
    });

    // Create pipeline and generate video
    const pipeline = new Sora2ExtendPipeline();

    const result = await pipeline.generateSequentialVideo(masterPrompt, {
      model: model as 'sora-2' | 'sora-2-pro',
      segmentDuration,
      numberOfSegments: actualSegments,
      aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1',
      contentType: contentType as any,
      characterDescription: character ? `${character} with ${tone} tone` : undefined,
      outputPath: './public/generated/sora2',
      enableTransitions: true,
      transitionType: 'fade',
      transitionDuration: 0.5
    });

    if (!result.success) {
      throw new Error(result.error || 'Sora 2 generation failed');
    }

    console.log(`✅ Sora 2 video generated: ${result.videoPath}`);
    console.log(`⏱️  Duration: ${result.totalDuration}s, Cost: $${result.totalCost.toFixed(4)}`);

    // Extract final frame from last segment for extension
    let extractedFramePath: string | undefined;
    if (result.segments && result.segments.length > 0) {
      console.log('🖼️ Extracting final frame for future extensions...');
      const lastSegment = result.segments[result.segments.length - 1];

      try {
        const { extractFinalFrameForSequentialExtend } = await import('@/utils/videoFrameExtractor');
        extractedFramePath = await extractFinalFrameForSequentialExtend(lastSegment.videoPath, Date.now());
        console.log(`✅ Final frame extracted: ${extractedFramePath}`);
      } catch (error) {
        console.warn('⚠️ Failed to extract final frame:', error);
        // Non-critical error - video was generated successfully
      }
    }

    // Convert file paths to public URL paths (normalize Windows backslashes first)
    const publicVideoUrl = result.videoPath.replace(/\\/g, '/').replace(/^\.?\/?(public\/)?/, '/');

    // Update operation with final result
    await operationStore.update(operationId, {
      status: 'complete',
      progress: 100,
      message: `Successfully generated ${result.totalDuration}s video with Sora 2`,
      result: {
        videos: result.segments.map((seg, i) => {
          // Normalize Windows backslashes to forward slashes before path transformation
          const publicSegmentUrl = seg.videoPath.replace(/\\/g, '/').replace(/^\.?\/?(public\/)?/, '/');
          return {
            id: `sora2-${operationId}-${i}`,
            url: publicSegmentUrl,
            duration: seg.duration,
            quality: '720p',
            platform: config.platform,
            segmentIndex: seg.segmentIndex
          };
        }),
        totalSegments: result.segments.length,
        totalDuration: result.totalDuration,
        platform: config.platform,
        videoStyle: config.videoStyle,
        powerModeVideoLength: config.powerModeVideoLength,
        requiresLooping: false,
        extractedFramePath, // Frame path for extension
        canExtend: !!extractedFramePath // Show "Extend" button if frame extracted
      }
    });

    console.log(`✅ Sora 2 operation ${operationId} completed successfully`);

  } catch (error) {
    console.error(`❌ Sora 2 operation ${operationId} failed:`, error);

    await operationStore.update(operationId, {
      status: 'error',
      progress: 0,
      message: 'Sora 2 video generation failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
