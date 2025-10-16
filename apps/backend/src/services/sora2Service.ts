import * as path from 'path';
import * as fs from 'fs/promises';
import { RateLimiter, RateLimiters, withRateLimit } from '../utils/rateLimiter';
import OpenAI from 'openai';
import FormData from 'form-data';

export interface Sora2Config {
  apiKey?: string;
  outputPath?: string;
  maxRetries?: number;
  retryDelay?: number;
  tier?: 1 | 2 | 3 | 4 | 5; // OpenAI usage tier for rate limiting
}

export interface Sora2VideoRequest {
  prompt: string;
  model?: 'sora-2' | 'sora-2-pro'; // sora-2: fast $0.10/s, sora-2-pro: quality $0.30/s
  seconds?: 4 | 8 | 12 | 16 | 20; // Duration in seconds (max depends on tier)
  size?: '720x1280' | '1280x720' | '1920x1080'; // Aspect ratios
  input_reference?: string; // Path to reference image (for sequential extend)
}

export interface Sora2VideoResult {
  videos: Array<{
    videoPath: string;
    videoUrl?: string;
    duration: number;
    quality: string;
    id: string; // Sora 2 video ID
  }>;
  prompt: string;
  success: boolean;
  error?: string;
  metadata?: {
    model: string;
    generationTime: number;
    cost: number;
    videoId: string;
  };
}

/**
 * Sora 2 Video Generation Service via OpenAI API
 *
 * Features:
 * - Text-to-video and image-to-video generation
 * - Sequential extend using input_reference for final frame continuity
 * - Simple async polling (vs VEO3's predictLongRunning)
 * - Tier-aware rate limiting (2-40 RPM)
 * - Per-second pricing ($0.10-$0.30/sec vs VEO3's per-video pricing)
 * - Up to 20 seconds per segment (Pro tier)
 */
export class Sora2Service {
  private config: Required<Sora2Config>;
  private client: OpenAI;
  private rateLimiter: RateLimiter;

  constructor(config: Sora2Config = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable or apiKey config is required for Sora 2');
    }

    this.config = {
      apiKey,
      outputPath: config.outputPath || process.env.SORA2_OUTPUT_PATH || './generated/sora2',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000,
      tier: config.tier || 2 // Default to Tier 2 (5 RPM)
    };

    // Initialize OpenAI client
    this.client = new OpenAI({ apiKey: this.config.apiKey });

    // Create tier-aware rate limiter
    this.rateLimiter = this.createTierRateLimiter(this.config.tier);

    this.ensureOutputDirectory();
  }

  /**
   * Create rate limiter based on OpenAI usage tier
   * Tier 1: 2 RPM, Tier 2: 5 RPM, Tier 3: 10 RPM, Tier 4: 25 RPM, Tier 5: 40 RPM
   */
  private createTierRateLimiter(tier: number): RateLimiter {
    const rpmByTier: Record<number, number> = {
      1: 2,
      2: 5,
      3: 10,
      4: 25,
      5: 40
    };

    const rpm = rpmByTier[tier] || 5;
    console.log(`🔧 Sora 2 rate limiter: Tier ${tier} = ${rpm} RPM`);

    return RateLimiters.createCustomRateLimiter(rpm);
  }

  /**
   * Generate single video segment with Sora 2
   */
  async generateVideoSegment(request: Sora2VideoRequest): Promise<Sora2VideoResult> {
    const startTime = Date.now();

    try {
      console.log('🎬 Starting Sora 2 video generation...');
      console.log(`📊 Model: ${request.model || 'sora-2'}, Duration: ${request.seconds || 12}s, Size: ${request.size || '720x1280'}`);

      // Step 1: Create video generation job
      const videoJob = await this.createVideoGeneration(request);
      console.log(`📝 Video job created: ${videoJob.id} | Status: ${videoJob.status}`);

      // Step 2: Poll until completion
      const completedJob = await this.pollVideoStatus(videoJob.id);
      console.log('✅ Video generation completed!');

      // Step 3: Download video content
      const videoPath = await this.downloadVideoContent(completedJob.id);
      console.log(`💾 Video saved: ${videoPath}`);

      const generationTime = Date.now() - startTime;
      const cost = this.calculateCost(request.seconds || 12, request.model || 'sora-2');

      console.log(`✅ Sora 2 generation completed in ${generationTime}ms`);
      console.log(`💰 Cost: $${cost.toFixed(2)} (${request.seconds || 12}s × $${this.getPricePerSecond(request.model || 'sora-2')}/s)`);

      // Generate HTTP URL for serving
      const httpUrl = videoPath.includes('\\public\\')
        ? '/' + videoPath.split('\\public\\')[1].replace(/\\/g, '/')
        : undefined;

      return {
        videos: [{
          videoPath,
          videoUrl: httpUrl,
          duration: request.seconds || 12,
          quality: request.size || '720x1280',
          id: completedJob.id
        }],
        prompt: request.prompt,
        success: true,
        metadata: {
          model: request.model || 'sora-2',
          generationTime,
          cost,
          videoId: completedJob.id
        }
      };

    } catch (error) {
      console.error('❌ Sora 2 generation failed:', error);

      return {
        videos: [],
        prompt: request.prompt,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate sequential extended video using final frame continuity
   * This is the core sora-extend technique from mshumer/sora-extend
   */
  async generateSequentialExtend(
    masterPrompt: string,
    segmentPrompts: string[],
    options: {
      model?: 'sora-2' | 'sora-2-pro';
      secondsPerSegment?: 4 | 8 | 12;
      size?: '720x1280' | '1280x720' | '1920x1080';
    } = {}
  ): Promise<{
    segments: Sora2VideoResult[];
    totalDuration: number;
    totalCost: number;
    success: boolean;
  }> {
    console.log(`🎬 Starting sequential extend: ${segmentPrompts.length} segments`);

    const segments: Sora2VideoResult[] = [];
    let previousFramePath: string | undefined = undefined;
    let totalCost = 0;

    for (let i = 0; i < segmentPrompts.length; i++) {
      console.log(`\n=== Generating Segment ${i + 1}/${segmentPrompts.length} ===`);

      const segmentRequest: Sora2VideoRequest = {
        prompt: segmentPrompts[i],
        model: options.model || 'sora-2',
        seconds: options.secondsPerSegment || 12,
        size: options.size || '720x1280',
        input_reference: previousFramePath // Use previous segment's final frame
      };

      const result = await this.generateVideoSegment(segmentRequest);

      if (!result.success) {
        console.error(`❌ Segment ${i + 1} generation failed:`, result.error);
        break;
      }

      segments.push(result);
      totalCost += result.metadata?.cost || 0;

      // Extract final frame for next segment (continuity)
      if (i < segmentPrompts.length - 1 && result.videos.length > 0) {
        previousFramePath = await this.extractFinalFrame(result.videos[0].videoPath, i);
        console.log(`🖼️ Extracted final frame: ${previousFramePath}`);
      }
    }

    const totalDuration = segments.reduce((sum, seg) => sum + (seg.videos[0]?.duration || 0), 0);

    console.log(`\n✅ Sequential extend completed!`);
    console.log(`📊 Total segments: ${segments.length}`);
    console.log(`⏱️ Total duration: ${totalDuration}s`);
    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);

    return {
      segments,
      totalDuration,
      totalCost,
      success: segments.length === segmentPrompts.length
    };
  }

  /**
   * Create video generation request with OpenAI API
   * Uses multipart/form-data for image-to-video support
   */
  private async createVideoGeneration(request: Sora2VideoRequest): Promise<any> {
    return await withRateLimit(
      this.rateLimiter,
      async () => {
        const url = 'https://api.openai.com/v1/videos';

        // Build form data for multipart/form-data
        const formData = new FormData();
        formData.append('prompt', request.prompt);
        formData.append('model', request.model || 'sora-2');
        formData.append('seconds', String(request.seconds || 12));

        if (request.size) {
          formData.append('size', request.size);
        }

        // Add reference image if provided (for sequential extend)
        if (request.input_reference) {
          try {
            const imageBuffer = await fs.readFile(request.input_reference);
            formData.append('input_reference', imageBuffer, {
              filename: path.basename(request.input_reference),
              contentType: 'image/jpeg'
            });
            console.log('📸 Added input_reference for continuity');
          } catch (error) {
            console.warn('⚠️ Could not load input_reference:', error);
          }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            ...formData.getHeaders()
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Sora 2 API request failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        return await response.json();
      },
      this.config.maxRetries
    );
  }

  /**
   * Poll video generation status until completion
   * Simpler than VEO3's predictLongRunning - just GET /videos/{id}
   */
  private async pollVideoStatus(videoId: string): Promise<any> {
    const maxPollingTime = 10 * 60 * 1000; // 10 minutes (Sora 2 takes 2-3 minutes typically)
    const pollingInterval = 15000; // 15 seconds (recommended by n8n workflow)
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollingTime) {
      console.log('⏳ Polling video status...');

      const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to poll video status: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const video = await response.json();

      console.log(`📊 Status: ${video.status}${video.progress ? ` | Progress: ${video.progress}%` : ''}`);

      if (video.status === 'completed') {
        return video;
      }

      if (video.status === 'failed' || video.status === 'error') {
        throw new Error(`Video generation failed: ${video.error?.message || 'Unknown error'}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    throw new Error('Video generation timed out after 10 minutes');
  }

  /**
   * Download video content from Sora 2 API
   */
  private async downloadVideoContent(videoId: string): Promise<string> {
    console.log(`📥 Downloading video: ${videoId}`);

    const response = await fetch(`https://api.openai.com/v1/videos/${videoId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());
    const outputPath = await this.generateOutputPath(videoId);

    await fs.writeFile(outputPath, videoBuffer);
    console.log(`💾 Video saved to: ${outputPath}`);

    return outputPath;
  }

  /**
   * Extract final frame from video for sequential extend continuity
   * Uses VideoFrameExtractor utility for robust frame extraction
   */
  private async extractFinalFrame(videoPath: string, segmentIndex: number): Promise<string> {
    const { extractFinalFrameForSequentialExtend } = await import('../utils/videoFrameExtractor');

    try {
      const framePath = await extractFinalFrameForSequentialExtend(videoPath, segmentIndex);
      console.log(`✅ Extracted final frame: ${framePath}`);
      return framePath;
    } catch (error) {
      console.error('❌ Failed to extract final frame:', error);
      throw new Error(`Frame extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cost based on duration and model
   * Sora 2: $0.10/second | Sora 2 Pro: $0.30/second
   */
  private calculateCost(seconds: number, model: 'sora-2' | 'sora-2-pro'): number {
    const pricePerSecond = this.getPricePerSecond(model);
    return seconds * pricePerSecond;
  }

  /**
   * Get price per second for model
   */
  private getPricePerSecond(model: 'sora-2' | 'sora-2-pro'): number {
    return model === 'sora-2' ? 0.10 : 0.30;
  }

  /**
   * Generate output path for video
   */
  private async generateOutputPath(videoId: string): Promise<string> {
    const timestamp = Date.now();
    const filename = `sora2_${videoId}_${timestamp}.mp4`;
    return path.join(this.config.outputPath, filename);
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Get platform-optimized settings for Sora 2
   */
  static getPlatformSettings(platform: 'tiktok' | 'youtube' | 'instagram'): Partial<Sora2VideoRequest> {
    const settings = {
      tiktok: {
        size: '720x1280' as const, // 9:16 vertical
        seconds: 12 as const, // Optimal for TikTok
        model: 'sora-2' as const // Fast for iteration
      },
      youtube: {
        size: '1920x1080' as const, // 16:9 landscape
        seconds: 12 as const,
        model: 'sora-2-pro' as const // Quality for YouTube
      },
      instagram: {
        size: '720x1280' as const, // 9:16 vertical (Reels)
        seconds: 12 as const,
        model: 'sora-2' as const
      }
    };

    return settings[platform];
  }

  /**
   * Compare Sora 2 vs VEO3 costs for decision-making
   */
  static compareCosts(durationSeconds: number): {
    sora2: number;
    sora2Pro: number;
    veo3Fast: number;
    veo3Standard: number;
    savings: string;
  } {
    const sora2 = durationSeconds * 0.10;
    const sora2Pro = durationSeconds * 0.30;

    // VEO3 charges per video, not per second (8s max per video)
    const veo3VideosNeeded = Math.ceil(durationSeconds / 8);
    const veo3Fast = veo3VideosNeeded * 1.20;
    const veo3Standard = veo3VideosNeeded * 3.20;

    const savings = ((veo3Fast - sora2) / veo3Fast * 100).toFixed(0);

    return {
      sora2,
      sora2Pro,
      veo3Fast,
      veo3Standard,
      savings: `${savings}% cheaper with Sora 2 vs VEO3 Fast`
    };
  }

  /**
   * Test Sora 2 connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Sora 2 API connection...');

      // Test by attempting to list videos (lightweight operation)
      const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (response.ok || response.status === 404) {
        console.log('✅ Sora 2 API accessible and authenticated');
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ API test failed: ${response.status} ${response.statusText}\n${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Sora 2 connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current rate limiter status
   */
  getRateLimiterStatus(): {
    requestsInLastMinute: number;
    consecutiveErrors: number;
    nextRequestAvailable: number;
  } {
    return this.rateLimiter.getStatus();
  }
}
