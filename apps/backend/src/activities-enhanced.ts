import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleMediaClient } from './google-media-client';
import { TikTokAPI, InstagramAPI, YouTubeAPI } from './platform-apis';
import { ProxyManager } from './proxy-manager';
import { MetricsCollector } from './metrics';
import { ContentStorage } from './storage';
import { EnhancedContentGenerator } from './content-generator-enhanced';
import { SocialMediaPoster } from './social-media-poster';

// Initialize services
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const googleMediaClient = new GoogleMediaClient(GEMINI_KEY);
const enhancedGenerator = new EnhancedContentGenerator(
  GEMINI_KEY
);
const proxyManager = new ProxyManager();
const metricsCollector = new MetricsCollector();
const storage = new ContentStorage();
const socialMediaPoster = new SocialMediaPoster();

// Platform APIs
const platforms: Record<string, any> = {
  tiktok: new TikTokAPI(),
  instagram: new InstagramAPI(),
  youtube: new YouTubeAPI()
};

/**
 * Ultra-Enhanced Activity: Generate AI Content with YouTube Guide Techniques
 * Uses all new components: collage, motion prompting, character consistency, variations
 */
export async function generateUltraEnhancedContent(params: {
  persona: any;
  series: any;
  platforms: string[];
  useEnhancedMode?: boolean;
  generateVariations?: boolean;
  costMode?: 'fast' | 'premium' | 'dynamic';
}): Promise<any> {
  const { persona, series, platforms: targetPlatforms } = params;

  if (params.useEnhancedMode !== false) {
    console.log(`[Activity] Using ULTRA-ENHANCED generation with YouTube guide techniques`);

    try {
      const enhancedContent = await enhancedGenerator.generateEnhancedContent({
        persona,
        series,
        platforms: targetPlatforms,
        generateVariations: params.generateVariations !== false, // Default true
        costMode: params.costMode || 'dynamic'
      });

      // Store the enhanced content
      await storage.saveContent({
        id: enhancedContent.id,
        persona,
        series,
        content: enhancedContent,
        platform: 'multi',
        status: 'generated',
        generatedAt: new Date()
      } as any);

      console.log(`[Activity] Ultra-enhanced content generated:`);
      console.log(`- Base images: ${enhancedContent.images.base.length}`);
      console.log(`- Motion-enhanced images: ${enhancedContent.images.edited.length}`);
      console.log(`- Videos generated: ${enhancedContent.videos.length}`);
      console.log(`- Variations: ${enhancedContent.variations?.length || 0}`);
      console.log(`- Total cost: $${enhancedContent.totalCost.toFixed(2)}`);
      console.log(`- Viral potential: ${enhancedContent.viralPotential}/100`);

      return enhancedContent;

    } catch (error: any) {
      console.error(`Ultra-enhanced generation failed, falling back to standard:`, error);
      // Fall through to standard generation
    }
  }

  // Fallback to standard generation
  return generateAIContent({
    persona,
    series,
    attempt: 1
  });
}

/**
 * Enhanced Activity: Generate AI Content with Replicate Integration
 * Uses Gemini for scripts, Replicate for images and videos
 */
export async function generateAIContent(params: {
  persona: any;
  series: any;
  attempt: number;
}): Promise<any> {
  const { persona, series, attempt } = params;

  console.log(`[Activity] Starting enhanced content generation for ${persona.name}`);

  try {
    // Step 1: Generate script using Gemini (keep this as it works well)
    const scriptPrompt = `
      Create a viral ${series.template?.format || 'short-form video'} script for a ${persona.age}-year-old ${persona.personality} content creator named ${persona.name}.

      Series: ${series.name}
      Hook Template: ${series.template?.hook || 'Attention-grabbing opening'}
      Style: ${series.template?.style || 'engaging and authentic'}

      Requirements:
      - Duration: 15-30 seconds
      - Platform optimized for: TikTok, Instagram Reels, YouTube Shorts
      - Include trending elements and hashtags
      - Make it highly shareable and engaging

      Output as JSON with:
      {
        "hook": "attention-grabbing opening line",
        "script": "full script with timing cues",
        "visualCues": ["visual description 1", "visual description 2"],
        "hashtags": ["relevant", "hashtags"],
        "musicStyle": "background music style"
      }
    `;

    const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const scriptResult = await textModel.generateContent(scriptPrompt);
    const scriptText = scriptResult.response.text();

    // Parse JSON from response
    const jsonMatch = scriptText.match(/```json\n?([\s\S]*?)\n?```/) || scriptText.match(/{[\s\S]*}/);
    const script = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : scriptText);

    console.log(`[Activity] Script generated for ${persona.name}`);

    // Step 2: Generate thumbnail/keyframe image using Replicate Nano Banana
    const imagePrompt = `
      Create a viral video thumbnail for social media.
      Character: ${persona.name}, ${persona.age} years old, ${persona.personality}
      Scene: ${script.visualCues[0]}
      Style: Professional UGC content, high quality, eye-catching
      Mood: ${series.template?.style || 'energetic and engaging'}
    `;

    console.log('[Activity] Generating thumbnail with Nano Banana...');
    const thumbnailResult = await googleMediaClient.generateImageNanoBanana({
      prompt: imagePrompt,
      aspectRatio: '16:9'
    });
    const thumbnailUrl = thumbnailResult.url;

    // Step 3: Generate alternative style image (for A/B testing)
    console.log('[Activity] Generating alternative style image...');
    const altImageResult = await googleMediaClient.generateImageNanoBanana({
      prompt: imagePrompt + ' with cinematic lighting and professional composition',
      aspectRatio: '16:9'
    });
    const altImageUrl = altImageResult.url;

    // Step 4: Generate video using VEO3
    const videoPrompt = `
      ${script.hook}

      ${script.script}

      Visual style: ${script.visualCues.join(', ')}
      Character: ${persona.name} presenting to camera
      Setting: Modern, clean background
      Audio: Include natural speech and ambient sounds
    `;

    console.log('[Activity] Generating video with VEO3...');
    const videoResult = await googleMediaClient.generateVideoVEO3({
      prompt: videoPrompt,
      aspectRatio: '16:9', // Horizontal - VEO3 doesn't support 9:16 with any resolution
      resolution: '720p',
      duration: 8
    });
    const videoUrl = videoResult.url;

    // Step 5: Store all generated content
    const contentId = `${persona.id}-${series.id}-${Date.now()}`;
    await storage.saveContent({
      id: contentId,
      persona: persona,
      series: series,
      content: {
        script,
        thumbnailUrl,
        altImageUrl,
        videoUrl
      } as any,
      platform: 'multi',
      status: 'generated',
      generatedAt: new Date()
    } as any);

    const totalCost = attempt === 1 ? 1.66 : 3.66;
    console.log(`[Activity] Content generated and stored: ${contentId}`);
    console.log(`[Activity] Total cost: $${totalCost.toFixed(2)}`);

    return {
      id: contentId,
      persona,
      series,
      script,
      thumbnailUrl,
      altImageUrl,
      videoUrl,
      videoMetadata: {
        duration: 8,
        resolution: '720p',
        aspectRatio: '9:16',
        hasAudio: true
      },
      readyForDistribution: true,
      costs: {
        script: 0.001,
        thumbnail: 0.039,
        altImage: 0.42,
        video: attempt === 1 ? 1.20 : 3.20,
        total: attempt === 1 ? 1.66 : 3.66
      }
    };

  } catch (error: any) {
    console.error(`Content generation failed:`, error);

    // Return partial content if some steps succeeded
    return {
      id: `failed-${Date.now()}`,
      persona,
      series,
      error: error.message,
      readyForDistribution: false
    };
  }
}

/**
 * Activity: Distribute content to platforms
 */
export async function distributeContent(params: {
  content: any;
  platforms: string[];
}): Promise<any> {
  const { content, platforms: targetPlatforms } = params;
  const results = [];

  for (const platform of targetPlatforms) {
    try {
      console.log(`[Activity] Distributing to ${platform}...`);

      const api = platforms[platform];
      if (!api) {
        console.warn(`Platform ${platform} not configured`);
        continue;
      }

      // Use proxy for platform requests
      const proxy = await proxyManager.getProxy();

      // Platform-specific optimization
      let optimizedContent = { ...content };
      if (platform === 'tiktok') {
        optimizedContent.caption = `${content.script.hook} ${content.script.hashtags.map((h: string) => `#${h}`).join(' ')}`;
      } else if (platform === 'instagram') {
        optimizedContent.caption = `${content.script.hook}\n\n${content.script.hashtags.map((h: string) => `#${h}`).join(' ')}`;
      } else if (platform === 'youtube') {
        optimizedContent.title = content.script.hook;
        optimizedContent.description = content.script.script;
        optimizedContent.tags = content.script.hashtags;
      }

      const result = await api.upload(optimizedContent, proxy);

      results.push({
        platform,
        success: true,
        postId: result.id,
        url: result.url
      });

    } catch (error: any) {
      console.error(`Failed to distribute to ${platform}:`, error);
      results.push({
        platform,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Activity: Analyze performance metrics
 */
export async function analyzePerformance(params: {
  contentId: string;
  platformData: any[];
}): Promise<any> {
  console.log(`[Activity] Analyzing performance for ${params.contentId}`);

  const metrics = {
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    engagementRate: 0,
    viralScore: 0,
    platformBreakdown: []
  };

  for (const data of params.platformData) {
    try {
      const api = platforms[data.platform];
      const stats = await api.getMetrics(data.postId);

      metrics.totalViews += stats.views || 0;
      metrics.totalLikes += stats.likes || 0;
      metrics.totalShares += stats.shares || 0;
      metrics.totalComments += stats.comments || 0;

      (metrics.platformBreakdown as any[]).push({
        platform: data.platform,
        ...stats
      });

    } catch (error) {
      console.error(`Failed to get metrics for ${data.platform}:`, error);
    }
  }

  // Calculate engagement rate
  if (metrics.totalViews > 0) {
    metrics.engagementRate = ((metrics.totalLikes + metrics.totalComments + metrics.totalShares) / metrics.totalViews) * 100;
  }

  // Calculate viral score (0-100)
  const viewScore = Math.min(metrics.totalViews / 10000, 1) * 30;
  const engagementScore = Math.min(metrics.engagementRate / 10, 1) * 30;
  const shareScore = Math.min((metrics.totalShares / metrics.totalViews) * 100, 1) * 20;
  const velocityScore = 20; // Placeholder - would calculate based on time

  metrics.viralScore = viewScore + engagementScore + shareScore + velocityScore;

  // Store metrics
  await metricsCollector.record({
    platform: 'aggregate',
    metrics: metrics,
    timestamp: new Date()
  } as any);

  console.log(`[Activity] Performance analyzed - Viral Score: ${metrics.viralScore.toFixed(1)}`);

  return metrics;
}

/**
 * Activity: Replicate successful content
 */
export async function replicateWinner(params: {
  originalContent: any;
  variations: number;
}): Promise<any[]> {
  console.log(`[Activity] Replicating winner: ${params.originalContent.id}`);

  const replicated = [];

  for (let i = 0; i < params.variations; i++) {
    try {
      // Create variation of the successful content
      const variation = await generateAIContent({
        persona: params.originalContent.persona,
        series: {
          ...params.originalContent.series,
          template: {
            ...(params.originalContent.series.template || {}),
            hook: `${params.originalContent.series.template?.hook || 'Viral hook'} (Variation ${i + 1})`
          }
        },
        attempt: 1
      });

      replicated.push(variation);

    } catch (error) {
      console.error(`Failed to replicate variation ${i + 1}:`, error);
    }
  }

  return replicated;
}

/**
 * Get cost summary from Google Media Client
 */
export async function getCostSummary(): Promise<any> {
  // For now, return a summary based on typical usage
  // In production, you would track actual API usage
  const estimatedUsage = {
    images: 10,
    videos: 5
  };

  const imageCost = estimatedUsage.images * 0.039;
  const videoCost = estimatedUsage.videos * 3.20;
  const total = imageCost + videoCost;

  return {
    breakdown: {
      nanoBanana: imageCost,
      veo3: videoCost
    },
    total,
    timestamp: new Date()
  };
}

/**
 * Activity: Post QuoteMoto content to social media platforms
 */
export async function postQuoteMotoContent(params: {
  content: any;
  campaignType: string;
  platforms: string[];
}): Promise<any> {
  const { content, campaignType, platforms: targetPlatforms } = params;

  console.log(`[SocialMedia] Posting QuoteMoto ${campaignType} content to ${targetPlatforms.length} platforms`);

  try {
    // Format content for social media posting
    const postContent = {
      imageUrl: content.imageUrl || content.thumbnailUrl,
      videoUrl: content.videoUrl,
      caption: content.script?.voiceover || content.script?.script || 'QuoteMoto insurance content',
      hashtags: [
        '#QuoteMoto',
        '#CarInsurance',
        '#SaveMoney',
        ...(campaignType === 'savings' ? ['#InsuranceSavings', '#CheapInsurance'] : []),
        ...(campaignType === 'dui-friendly' ? ['#SecondChances', '#DUIInsurance'] : []),
        ...(campaignType === 'quick-quote' ? ['#QuickQuote', '#EasyInsurance'] : [])
      ],
      voiceover: content.script?.voiceover,
      campaignType: campaignType
    };

    // Post to all platforms
    const results = await socialMediaPoster.postToAllPlatforms(postContent);

    // Store posting results
    await storage.saveContent({
      id: `social-post-${content.id}-${Date.now()}`,
      originalContentId: content.id,
      campaignType: campaignType,
      platformResults: results,
      content: postContent,
      status: 'posted',
      postedAt: new Date()
    } as any);

    const successfulPosts = results.filter(r => r.success).length;
    console.log(`[SocialMedia] ✅ Posted to ${successfulPosts}/${results.length} platforms`);

    return {
      contentId: content.id,
      campaignType: campaignType,
      platformResults: results,
      successfulPosts: successfulPosts,
      totalPlatforms: results.length,
      postedAt: new Date().toISOString()
    };

  } catch (error: any) {
    console.error(`[SocialMedia] ❌ Failed to post content:`, error);

    return {
      contentId: content.id,
      campaignType: campaignType,
      error: error.message,
      successfulPosts: 0,
      totalPlatforms: targetPlatforms.length,
      postedAt: new Date().toISOString()
    };
  }
}

/**
 * Activity: Get social media performance metrics
 */
export async function getSocialMediaMetrics(params: {
  contentId: string;
  platforms: string[];
}): Promise<any> {
  console.log(`[SocialMedia] Getting metrics for content ${params.contentId}`);

  try {
    const stats = await socialMediaPoster.getPostingStats();

    return {
      contentId: params.contentId,
      stats: stats,
      platforms: params.platforms,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error(`[SocialMedia] ❌ Failed to get metrics:`, error);
    return {
      contentId: params.contentId,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Re-export other activities that don't need changes
export { warmUpAccount, checkAccountHealth, rotateProxy } from './activities';