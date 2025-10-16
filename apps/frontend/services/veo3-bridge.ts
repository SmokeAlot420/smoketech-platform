/**
 * VEO3 Bridge - Connects SmokeTech Studio to Viral Engine VEO3 Service
 *
 * This bridge integrates the production-ready viral engine's VEO3 service
 * with SmokeTech Studio's omega-service.js, enabling ultra-realistic video generation.
 */

import { VEO3Service, VideoGenerationRequest, VideoGenerationResult } from '../../viral/src/services/veo3Service';

// Re-export for template usage
export { VEO3Service };

// Define VEO3JSONPrompt type locally (matches viral repo definition)
export interface VEO3JSONPrompt {
  prompt: string;
  negative_prompt?: string;
  camera_movement?: string;
  lighting?: string;
  mood?: string;
  style?: string;
}

export interface VEO3BridgeRequest {
  prompt: string | any; // Can be text or VEO3JSONPrompt structure
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  firstFrame?: string; // Path to reference image
  quality?: 'standard' | 'high';
  enableSoundGeneration?: boolean;
  videoCount?: 1 | 2;
}

export interface VEO3BridgeResponse {
  success: boolean;
  videos: Array<{
    id: string;
    path: string;
    url?: string;
    duration: number;
    quality: string;
  }>;
  metadata: {
    model: string;
    cost: number;
    generationTime: number;
    enhancedPrompt?: string;
    videoCount: number;
  };
  error?: string;
}

/**
 * Generate ultra-realistic videos using the viral engine's VEO3 service
 */
export async function generateVEO3Video(
  request: VEO3BridgeRequest
): Promise<VEO3BridgeResponse> {
  const startTime = Date.now();

  try {
    console.log('🎬 VEO3 Bridge: Initiating video generation via viral engine');
    console.log(`📝 Prompt type: ${typeof request.prompt === 'string' ? 'text' : 'JSON'}`);
    console.log(`⏱️  Duration: ${request.duration || 8} seconds`);
    console.log(`📐 Aspect ratio: ${request.aspectRatio || '9:16'}`);

    // Initialize the viral engine's VEO3 service
    const veo3Service = new VEO3Service();

    // Build request for viral engine
    const videoRequest: VideoGenerationRequest = {
      prompt: request.prompt,
      duration: request.duration || 8,
      aspectRatio: request.aspectRatio || '9:16',
      quality: request.quality || 'high',
      enableSoundGeneration: request.enableSoundGeneration !== false, // Default true
      videoCount: request.videoCount || 1
    };

    // Add firstFrame if provided
    if (request.firstFrame) {
      videoRequest.firstFrame = request.firstFrame;
      console.log(`🖼️  Using firstFrame: ${request.firstFrame}`);
    }

    // Generate video using the production-ready viral engine
    const result = await veo3Service.generateVideoSegment(videoRequest);

    if (!result.success) {
      throw new Error(result.error || 'Video generation failed');
    }

    console.log(`✅ Generated ${result.videos.length} video(s) successfully`);

    const totalTime = (Date.now() - startTime) / 1000; // seconds

    // Transform viral engine response to omega-service format
    const videos = result.videos.map((video, index) => ({
      id: `veo3-${Date.now()}-${index + 1}`,
      path: video.videoPath,
      url: video.videoUrl, // Use URL from viral engine if available
      duration: video.duration,
      quality: video.quality
    }));

    return {
      success: true,
      videos,
      metadata: {
        model: 'veo-3-gemini-2.0-flash',
        cost: result.metadata?.cost || 6.00,
        generationTime: totalTime,
        enhancedPrompt: result.enhancedPrompt,
        videoCount: result.videos.length
      }
    };

  } catch (error) {
    console.error('❌ VEO3 Bridge Error:', error);

    return {
      success: false,
      videos: [],
      metadata: {
        model: 'veo-3-gemini-2.0-flash',
        cost: 0,
        generationTime: (Date.now() - startTime) / 1000,
        videoCount: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validate VEO3 request parameters
 */
export function validateVEO3Request(request: VEO3BridgeRequest): { valid: boolean; error?: string } {
  if (!request.prompt) {
    return { valid: false, error: 'Prompt is required' };
  }

  if (request.duration && ![4, 6, 8].includes(request.duration)) {
    return { valid: false, error: 'Duration must be 4, 6, or 8 seconds' };
  }

  if (request.aspectRatio && !['16:9', '9:16', '1:1'].includes(request.aspectRatio)) {
    return { valid: false, error: 'Aspect ratio must be 16:9, 9:16, or 1:1' };
  }

  if (request.videoCount && ![1, 2].includes(request.videoCount)) {
    return { valid: false, error: 'Video count must be 1 or 2' };
  }

  return { valid: true };
}
