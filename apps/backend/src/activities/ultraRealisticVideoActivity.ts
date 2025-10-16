import { UltraRealisticCharacterManager } from '../enhancement/ultraRealisticCharacterManager';
import { quoteMotoInfluencer } from '../characters/quotemoto-baddie';
import { UltraRealisticConfig } from '../pipelines/nanoBananaVeo3Pipeline';
import { langfuseMonitor } from '../langfuse-monitor';

export interface UltraRealisticVideoParams {
  persona: {
    name: string;
    personality: string;
    contentStyle: string;
  };
  series: {
    name: string;
    format: string;
    hooks: string[];
    structure: {
      duration: number;
      platform: 'tiktok' | 'youtube' | 'instagram';
    };
  };
  scenes: string[];
  config?: {
    enhanceWithTopaz?: boolean;
    useZhoTechniques?: boolean;
    characterConsistency?: boolean;
  };
  attempt: number;
}

export interface UltraRealisticVideoResult {
  videoPath: string;
  duration: number;
  segmentCount: number;
  enhanced: boolean;
  cost: number;
  success: boolean;
  error?: string;
  metadata: {
    generationTime: number;
    platform: string;
    aspectRatio: string;
    usedZhoTechniques: boolean;
    characterConsistency: boolean;
  };
}

/**
 * Temporal Activity: Generate Ultra-Realistic Video
 *
 * Integrates the complete NanoBanana + VEO3 pipeline into our Temporal workflow
 * for automated viral content generation with ultra-realistic quality
 */
export async function generateUltraRealisticVideo(
  params: UltraRealisticVideoParams
): Promise<UltraRealisticVideoResult> {
  const startTime = Date.now();

  // Start Langfuse activity span
  const activitySpan = langfuseMonitor.startActivitySpan('generateUltraRealisticVideo', {
    persona: params.persona.name,
    series: params.series.name,
    platform: params.series.structure.platform,
    attempt: params.attempt
  });

  try {
    console.log(`[UltraRealistic] Starting ultra-realistic video generation for ${params.persona.name}`);
    console.log(`[UltraRealistic] Platform: ${params.series.structure.platform}`);
    console.log(`[UltraRealistic] Duration: ${params.series.structure.duration} seconds`);

    const manager = new UltraRealisticCharacterManager();

    // Validate character for ultra-realistic generation
    const validation = manager.validateCharacterForRealism(quoteMotoInfluencer);
    if (!validation.valid) {
      throw new Error(`Character validation failed: ${validation.issues.join(', ')}`);
    }

    // Configure based on platform
    const config: UltraRealisticConfig = {
      platform: params.series.structure.platform,
      aspectRatio: getPlatformAspectRatio(params.series.structure.platform),
      targetDuration: params.series.structure.duration,
      enhanceWithTopaz: params.config?.enhanceWithTopaz || false,
      useZhoTechniques: params.config?.useZhoTechniques || false
    };

    // Track the generation process
    const generationSpan = await langfuseMonitor.trackGeneration(
      'ultra-realistic-pipeline',
      'nanobabana-veo3-pipeline',
      { scenes: params.scenes, config },
      { success: false }, // Will update on completion
      { step: 'video-generation', platform: config.platform }
    );

    // Generate the ultra-realistic video
    const result = await manager.generateUltraRealisticVideo({
      character: quoteMotoInfluencer,
      scenes: params.scenes,
      config,
      characterConsistency: {
        preserveFacialFeatures: params.config?.characterConsistency ?? true,
        maintainLighting: true,
        useFirstFrameReference: true,
        multiAngleGeneration: false // Optimize for speed
      },
      zhoTechniques: params.config?.useZhoTechniques
        ? manager.getRecommendedZhoTechniques(getContentType(params.series.format))
        : [],
      storyStructure: getStoryStructure(params.series.format)
    });

    // Calculate costs
    const cost = calculateVideoGenerationCost(result.duration, config);

    const generationTime = Date.now() - startTime;

    // Update generation tracking
    if (generationSpan) {
      generationSpan.update({
        output: JSON.stringify({
          success: result.success,
          duration: result.duration,
          segmentCount: result.segments.length
        }),
        metadata: {
          cost,
          generationTime,
          enhanced: result.enhanced
        }
      });
    }

    console.log(`[UltraRealistic] ✅ Video generated successfully in ${generationTime}ms`);
    console.log(`[UltraRealistic] 💰 Cost: $${cost.toFixed(2)}`);
    console.log(`[UltraRealistic] 📁 Video: ${result.videoPath}`);

    // End activity span
    if (activitySpan) {
      activitySpan.update({
        output: JSON.stringify({
          success: result.success,
          videoPath: result.videoPath,
          cost
        }),
        metadata: {
          generationTime,
          segmentCount: result.segments.length
        }
      });
    }

    return {
      videoPath: result.videoPath,
      duration: result.duration,
      segmentCount: result.segments.length,
      enhanced: result.enhanced,
      cost,
      success: result.success,
      error: result.error,
      metadata: {
        generationTime,
        platform: config.platform || 'youtube',
        aspectRatio: config.aspectRatio || '16:9',
        usedZhoTechniques: config.useZhoTechniques || false,
        characterConsistency: params.config?.characterConsistency ?? true
      }
    };

  } catch (error) {
    const generationTime = Date.now() - startTime;

    console.error(`[UltraRealistic] ❌ Generation failed:`, error);

    // End activity span with error
    if (activitySpan) {
      activitySpan.update({
        output: null,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          generationTime
        }
      });
    }

    return {
      videoPath: '',
      duration: 0,
      segmentCount: 0,
      enhanced: false,
      cost: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        generationTime,
        platform: params.series.structure.platform,
        aspectRatio: getPlatformAspectRatio(params.series.structure.platform),
        usedZhoTechniques: false,
        characterConsistency: false
      }
    };
  }
}

/**
 * Activity: Generate Ultra-Realistic Batch Content
 *
 * Generate multiple ultra-realistic videos for different platforms simultaneously
 */
export async function generateUltraRealisticBatch(params: {
  persona: any;
  series: any;
  platforms: ('tiktok' | 'youtube' | 'instagram')[];
  scenes: string[];
  attempt: number;
}): Promise<UltraRealisticVideoResult[]> {
  const results: UltraRealisticVideoResult[] = [];

  console.log(`[UltraRealistic] Starting batch generation for ${params.platforms.length} platforms`);

  for (const platform of params.platforms) {
    try {
      const platformParams: UltraRealisticVideoParams = {
        persona: params.persona,
        series: {
          ...params.series,
          structure: {
            ...params.series.structure,
            platform
          }
        },
        scenes: params.scenes,
        config: {
          enhanceWithTopaz: platform === 'youtube', // Only enhance YouTube for quality
          useZhoTechniques: platform === 'tiktok', // ZHO techniques for viral TikTok content
          characterConsistency: true
        },
        attempt: params.attempt
      };

      const result = await generateUltraRealisticVideo(platformParams);
      results.push(result);

      // Small delay between platform generations
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`[UltraRealistic] Failed to generate for ${platform}:`, error);

      results.push({
        videoPath: '',
        duration: 0,
        segmentCount: 0,
        enhanced: false,
        cost: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          generationTime: 0,
          platform,
          aspectRatio: getPlatformAspectRatio(platform),
          usedZhoTechniques: false,
          characterConsistency: false
        }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  console.log(`[UltraRealistic] Batch complete: ${successCount}/${results.length} successful, $${totalCost.toFixed(2)} total cost`);

  return results;
}

/**
 * Activity: Generate Enhanced Viral Content
 *
 * Generate viral content using ZHO techniques and ultra-realistic pipeline
 */
export async function generateEnhancedViralContent(params: {
  persona: any;
  viralType: 'figure' | 'funko' | 'transformation' | 'professional';
  platform: 'tiktok' | 'instagram';
  attempt: number;
}): Promise<UltraRealisticVideoResult> {
  console.log(`[UltraRealistic] Generating enhanced viral content: ${params.viralType}`);

  const viralScenes = getViralScenes(params.viralType, params.persona.name);

  const viralParams: UltraRealisticVideoParams = {
    persona: params.persona,
    series: {
      name: `Viral ${params.viralType} series`,
      format: 'viral',
      hooks: ['This will blow your mind', 'You won\'t believe this', 'Wait for it...'],
      structure: {
        duration: 40, // Optimal for viral content
        platform: params.platform
      }
    },
    scenes: viralScenes,
    config: {
      enhanceWithTopaz: false, // Keep processing fast for viral content
      useZhoTechniques: true,
      characterConsistency: true
    },
    attempt: params.attempt
  };

  return generateUltraRealisticVideo(viralParams);
}

/**
 * Helper Functions
 */

function getPlatformAspectRatio(platform: string): '16:9' | '9:16' | '1:1' {
  const ratios = {
    tiktok: '9:16' as const,
    youtube: '16:9' as const,
    instagram: '1:1' as const
  };

  return ratios[platform as keyof typeof ratios] || '16:9';
}

function getContentType(format: string): 'viral' | 'commercial' | 'educational' {
  if (format.includes('viral') || format.includes('trending')) return 'viral';
  if (format.includes('educational') || format.includes('tutorial')) return 'educational';
  return 'commercial';
}

function getStoryStructure(format: string): 'viral' | 'commercial' | 'educational' | 'custom' {
  return getContentType(format);
}

function calculateVideoGenerationCost(duration: number, config: UltraRealisticConfig): number {
  // Base costs
  const nanoBananaCost = 0.02 * 3; // 3 images for character consistency
  const veo3Cost = duration * 0.75; // $0.75 per second
  const processingCost = 0.50; // FFmpeg processing

  let total = nanoBananaCost + veo3Cost + processingCost;

  // Additional costs
  if (config.enhanceWithTopaz) {
    total += 2.00; // Topaz processing cost
  }

  if (config.useZhoTechniques) {
    total += 0.06; // Additional NanoBanana generations for ZHO
  }

  return total;
}

function getViralScenes(viralType: string, personaName: string): string[] {
  const scenes = {
    figure: [
      `${personaName} presenting insurance savings with confident smile`,
      `Shocked expression revealing how much money you can save`,
      `Demonstrating the QuoteMoto app with animated gestures`,
      `Celebrating customer success with authentic excitement`,
      `Call to action: Get your free quote now!`
    ],
    funko: [
      `${personaName} introducing herself as your insurance expert`,
      `Transforming into collectible Funko Pop style`,
      `Showing QuoteMoto features in Funko form`,
      `Back to real form with special offer`,
      `Subscribe for more insurance tips and tricks`
    ],
    transformation: [
      `Before: Stressed about high insurance costs`,
      `Discovery: Finding QuoteMoto comparison tool`,
      `Process: Easy quote comparison interface`,
      `After: Happy with massive savings`,
      `Result: Recommending to friends and family`
    ],
    professional: [
      `Professional introduction to insurance challenges`,
      `Expert analysis of market solutions`,
      `QuoteMoto platform demonstration`,
      `Customer testimonial showcase`,
      `Professional recommendation and next steps`
    ]
  };

  return scenes[viralType as keyof typeof scenes] || scenes.professional;
}

// ZHO techniques mapping for viral content types
// Note: Currently unused but available for future viral content enhancement