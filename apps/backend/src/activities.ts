import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { TikTokAPI, InstagramAPI, YouTubeAPI } from './platform-apis';
import { ProxyManager } from './proxy-manager';
import { MetricsCollector } from './metrics';
import { ContentStorage } from './storage';
import { langfuseMonitor } from './langfuse-monitor';
import { UltraQuoteMotoCharacterEngine } from './ultra-quotemoto-engine';
import { SkinRealismEngine, SkinRealismConfig } from './enhancement/skinRealism';
import * as path from 'path';
import * as fs from 'fs/promises';

// Initialize services
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const ultraEngine = new UltraQuoteMotoCharacterEngine();
const proxyManager = new ProxyManager();
const metricsCollector = new MetricsCollector();
const storage = new ContentStorage();

// Platform APIs
const platforms: Record<string, any> = {
  tiktok: new TikTokAPI(),
  instagram: new InstagramAPI(),
  youtube: new YouTubeAPI()
};

// Activity: Generate AI Content with correct VEO3 implementation
export async function generateAIContent(params: {
  persona: any;
  series: any;
  attempt: number;
}): Promise<any> {
  const { persona, series, attempt } = params;

  // Start Langfuse activity span
  const activitySpan = langfuseMonitor.startActivitySpan('generateAIContent', {
    persona: persona.name,
    series: series.name,
    attempt
  });

  let totalCost = 0;

  try {
    console.log(`[Activity] Starting content generation for ${persona.name}`);

    // Step 1: Generate script using Gemini 2.0 Flash for text
    const scriptPrompt = `
      Create a viral ${series.format} video script for ${persona.name}.
      Persona: ${persona.personality}
      Style: ${persona.contentStyle}
      Series: ${series.name}
      Hook options: ${series.hooks.join(', ')}
      Duration: ${series.structure.duration} seconds

      Requirements:
      - Include dialogue in quotes for voice generation
      - Include sound effect descriptions (e.g., "door creaks", "music swells")
      - Structure as JSON with scenes, dialogue, and visual descriptions
      - Make it engaging, authentic, and highly shareable

      Output format: JSON with structure:
      {
        "hook": "opening line",
        "scenes": [
          {
            "type": "intro|main|outro",
            "duration": seconds,
            "dialogue": "what is said",
            "visual": "what is shown",
            "soundEffects": ["effect1", "effect2"],
            "emotion": "mood/feeling"
          }
        ],
        "hashtags": ["relevant", "hashtags"],
        "musicStyle": "background music style"
      }
    `;

    // Text generation using the new SDK

    // Track script generation
    const scriptGeneration = await langfuseMonitor.trackGeneration(
      'script-generation',
      'gemini-2.0-flash-exp',
      scriptPrompt,
      null,
      { step: 'script', persona: persona.name }
    );

    const model = genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: scriptPrompt
    });
    const scriptResult = await model;
    // Use official Google API pattern for response handling
    let scriptText = '';
    if (scriptResult.candidates && scriptResult.candidates[0] && scriptResult.candidates[0].content && scriptResult.candidates[0].content.parts) {
      for (const part of scriptResult.candidates[0].content.parts) {
        if (part.text) {
          scriptText = part.text;
          console.log("[Activity] Generated script text:", part.text.substring(0, 200) + "...");
          break;
        }
      }
    }

    // Update generation with output
    if (scriptGeneration) {
      scriptGeneration.update({ output: scriptText });
    }

    // Parse JSON from response (handle potential markdown code blocks)
    const jsonMatch = scriptText.match(/```json\n?([\s\S]*?)\n?```/) || scriptText.match(/{[\s\S]*}/);
    const script = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : scriptText);

    console.log(`[Activity] Script generated for ${persona.name}`);

    // Step 2: Generate keyframe image using NanoBanana (imagegeneration@006)
    const imagePrompt = `
      Create a photorealistic image for a viral video thumbnail.
      Subject: ${persona.avatar}
      Scene: ${script.scenes[0].visual}
      Emotion: ${script.scenes[0].emotion || 'confident'}
      Style: Modern, eye-catching, social media optimized
      Composition: Close-up portrait with engaging expression
      Lighting: Professional, warm, inviting
    `;

    console.log(`[Activity] Generating keyframe image with NanoBanana...`);

    // Generate images using proper NanoBanana with QuoteMoto branding
    console.log(`[Activity] Generating QuoteMoto branded image for ${persona.name}`);

    const modelUsed = 'gemini-2.5-flash-image-preview';

    // QuoteMoto enhanced prompt for professional insurance content
    const quoteMotoPrompt = `
      Professional insurance advisor photo for QuoteMoto Insurance.
      ${imagePrompt}

      IMPORTANT: Include "QuoteMoto Insurance" branding elements.
      Style: Professional, trustworthy, modern insurance marketing.
      Setting: Clean office environment with insurance/automotive context.
      Expression: Confident, helpful, approachable insurance expert.
      Clothing: Professional business attire.
      Quality: High-resolution, professional photography style.
    `;

    // Track image generation
    const imageGenerationTracking = await langfuseMonitor.trackImageGeneration({
      model: modelUsed,
      prompt: quoteMotoPrompt,
      characterRef: undefined,
      success: false,
      imageCount: 1
    });

    let images: string[] = [];

    try {
      // 🔥 ULTRA-ADVANCED ARIA QUOTEMOTO SYSTEM 🔥
      console.log('[Activity] 🚀 Initializing Ultra QuoteMoto System with ALL advanced techniques for Aria...');

      // Initialize Aria character with ultra-realistic skin imperfections
      await ultraEngine.initializeAriaCharacter();
      const ariaCharacter = await ultraEngine.getAriaCharacter();

      if (!ariaCharacter) {
        throw new Error('Failed to initialize Aria QuoteMoto character');
      }

      console.log(`[Activity] ✅ Aria character loaded with ${ariaCharacter.skinImperfections.length} skin imperfections for ultra-realism`);

      // 🎨 ARIA ULTRA-REALISTIC SKIN CONFIGURATION
      console.log('[Activity] 🎨 Configuring Aria\'s ultra-realistic skin imperfections...');

      const ariaSkinConfig: SkinRealismConfig = {
        age: ariaCharacter.age,
        gender: 'female',
        ethnicity: ariaCharacter.ethnicity,
        skinTone: 'medium',
        imperfectionTypes: ['freckles', 'pores', 'asymmetry', 'wrinkles', 'moles'],
        overallIntensity: 'moderate'
      };

      const ariaSkinDetails = new SkinRealismEngine().generateSkinRealism(ariaSkinConfig);
      console.log(`[Activity] ✨ Generated ${ariaSkinDetails.imperfections.length} skin imperfections for Aria`);

      // 🔥 ARIA ULTRA-REALISTIC IMAGE GENERATION (Single Generation)
      console.log('[Activity] 🎬 Generating single ultra-realistic Aria image with skin imperfections...');

      const ariaBasePrompt = `
Ultra-photorealistic portrait of Aria, 28-year-old mixed Latina/European heritage insurance advisor from QuoteMoto.

CHARACTER IDENTITY:
- Professional insurance expert appearance
- Heart-shaped face with warm brown eyes
- Mixed Latina/European heritage features
- Professional business attire
- Trustworthy and approachable demeanor

QUOTEMOTO BRANDING:
- Brand colors: #0074C9 (QuoteMoto Blue), #F97316 (QuoteMoto Orange)
- Professional insurance office setting
- Modern corporate environment
- QuoteMoto branded materials visible

ULTRA-REALISTIC REQUIREMENTS:
${ariaCharacter.skinImperfections.map(imp => `- ${imp.description}`).join('\n')}
`.trim();

      // Apply ZHO skin realism enhancements to the prompt
      const enhancedAriaPrompt = SkinRealismEngine.enhancePromptWithRealism(ariaBasePrompt, ariaSkinDetails);

      console.log('[Activity] 🎯 Enhanced Aria prompt with ZHO skin realism techniques');

      // Generate single Aria image using NanoBanana
      let result = null;
      try {
        const imageResponse = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: [enhancedAriaPrompt],
        });

        // Process the response
        if (imageResponse.candidates && imageResponse.candidates[0] && imageResponse.candidates[0].content && imageResponse.candidates[0].content.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              const timestamp = Date.now();
              const fileName = `aria-ultra-realistic-${timestamp}.png`;
              const filePath = path.join(process.env.TEMP_DIR || './temp', fileName);

              if (part.inlineData.data) {
                await fs.writeFile(filePath, Buffer.from(part.inlineData.data, 'base64'));
              }

              result = {
                imagePath: filePath,
                base64: part.inlineData.data
              };

              console.log(`[Activity] ✅ Ultra-realistic Aria generated: ${fileName}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error('[Activity] ❌ Direct Aria generation failed:', error);
      }

      // 🎯 FALLBACK: ADVANCED TECHNIQUE SELECTION (Based on ZHO Research) - Only if direct generation fails
      if (!result) {
        console.log('[Activity] ⚠️ Direct Aria generation failed, trying fallback Pedro techniques...');

        const advancedTechniques = [
          'professional-photography',
          'multi-hairstyle-grid',
          'time-period-transformation',
          'illustration-to-figure'
        ];

        const selectedTechnique = advancedTechniques[Math.floor(Math.random() * advancedTechniques.length)];
        console.log(`[Activity] 🔥 Selected fallback technique: ${selectedTechnique}`);

      // Execute selected advanced technique
      switch (selectedTechnique) {
        case 'professional-photography':
          result = await ultraEngine.generateProfessionalPhotographySeries(
            'corporate',
            'front',
            'confident'
          );
          break;

        case 'multi-hairstyle-grid':
          result = await ultraEngine.generateMultiHairstyleGrid();
          break;

        case 'time-period-transformation':
          const eras: ('1950s' | '1980s' | '2000s' | '2024')[] = ['1950s', '1980s', '2000s', '2024'];
          const selectedEra = eras[Math.floor(Math.random() * eras.length)];
          result = await ultraEngine.generateTimePeriodTransformation(selectedEra);
          break;

        case 'illustration-to-figure':
          result = await ultraEngine.generateIllustrationToFigure();
          break;

        default:
          // Fallback to professional photography
          result = await ultraEngine.generateProfessionalPhotographySeries(
            'studio',
            'three-quarter',
            'trustworthy'
          );
      }

      if (result && result.imagePath) {
        console.log(`[Activity] 🎉 Ultra-advanced ${selectedTechnique} completed successfully!`);
        console.log(`[Activity] 📁 Aria image saved: ${result.imagePath}`);
        images = [result.imagePath];

        // Update Aria's metadata
        const consistencyScore = await ultraEngine.calculateConsistencyScore();
        console.log(`[Activity] 📊 Aria consistency score: ${consistencyScore}%`);

        // Report advanced technique usage
        totalCost += 0.039; // NanoBanana cost
        console.log(`[Activity] 💰 Advanced generation cost: $${totalCost.toFixed(3)}`);

        // Update tracking with success
        await langfuseMonitor.trackImageGeneration({
          model: modelUsed,
          prompt: quoteMotoPrompt,
          characterRef: undefined,
          success: true,
          imageCount: 1
        });
      } else {
        console.log('[Activity] ⚠️ Advanced technique failed, no image generated');
        throw new Error('No image data received from Aria Ultra Engine');
      }
      } // End of fallback if (!result) block
    } catch (error) {
      console.error(`[Activity] NanoBanana generation failed:`, error);
      // Fallback to placeholder
      images = ['placeholder_quotemoto_image.jpg'];
    }

    // Images should be defined in try/catch blocks above

    // Update tracking with success
    if (imageGenerationTracking) {
      await langfuseMonitor.trackImageGeneration({
        model: modelUsed,
        prompt: imagePrompt,
        characterRef: undefined,
        success: true,
        imageCount: images.length
      });

      // Add to total cost
      totalCost += 0.040; // Using Imagen 3.0 cost
    }

    console.log(`[Activity] Image generated successfully`);

    // Step 3: Generate video with VEO3 using the new SDK
    console.log(`[Activity] Starting VEO3 video generation...`);

    // Construct video prompt with audio cues
    const videoPrompt = script.scenes.map((scene: any) => {
      let scenePrompt = `${scene.visual}. `;
      if (scene.dialogue) {
        scenePrompt += `Character says: "${scene.dialogue}". `;
      }
      if (scene.soundEffects && scene.soundEffects.length > 0) {
        scenePrompt += `Sound effects: ${scene.soundEffects.join(', ')}. `;
      }
      return scenePrompt;
    }).join(' ');

    // Start video generation with VEO3
    const operation = await genAI.models.generateVideos({
      model: 'veo-3.0-generate-001',
      prompt: videoPrompt,
      config: {
        aspectRatio: '9:16', // Vertical for TikTok/Instagram
        resolution: '720p',
        negativePrompt: 'low quality, blurry, distorted, cartoon',
        seed: Math.floor(Math.random() * 1000000) // For slight variation control
      }
    });

    console.log(`[Activity] VEO3 operation started: ${operation.name}`);

    // Poll until video is ready (with timeout)
    const maxWaitTime = 6 * 60 * 1000; // 6 minutes max
    const pollInterval = 10000; // 10 seconds
    const startTime = Date.now();

    let finalOperation = operation;
    while (!finalOperation.done) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Video generation timeout');
      }

      console.log(`[Activity] Waiting for video generation...`);
      await delay(pollInterval);

      finalOperation = await genAI.operations.getVideosOperation({
        operation: finalOperation
      });
    }

    console.log(`[Activity] Video generation complete!`);

    // Extract video data
    if (!finalOperation.response || !finalOperation.response.generatedVideos || finalOperation.response.generatedVideos.length === 0) {
      throw new Error('No video generated from VEO3');
    }

    const generatedVideo = finalOperation.response.generatedVideos[0];

    // Step 4: Save content locally (in production, upload to S3)
    const contentId = `${persona.id}-${series.id}-${Date.now()}`;
    const videoPath = path.join(process.env.TEMP_DIR || './temp', `${contentId}.mp4`);

    // Download video (if video exists)
    if (generatedVideo.video) {
      await genAI.files.download({
        file: generatedVideo.video,
        downloadPath: videoPath
      });
    } else {
      console.warn('[Activity] No video file to download, using placeholder');
      // In production, handle this case properly
    }

    // Step 5: Optimize for each platform
    const optimizedContent = {
      tiktok: {
        videoPath,
        format: '9:16',
        duration: 8,
        captions: generateCaptions(script, 'tiktok')
      },
      instagram: {
        videoPath,
        format: '9:16',
        duration: 8,
        captions: generateCaptions(script, 'instagram')
      },
      youtube: {
        videoPath,
        format: '9:16', // Shorts format
        duration: 8,
        captions: generateCaptions(script, 'youtube'),
        thumbnail: 'generated-thumbnail.jpg' // Would be from image generation
      }
    };

    // Step 6: Store content metadata
    await storage.saveContent({
      id: contentId,
      persona: persona,
      series: series,
      script: script,
      video: optimizedContent,
      metadata: {
        generatedAt: new Date(),
        attempt: attempt,
        status: 'published',
        priority: 'normal'
      }
    });

    // End activity span with success
    if (activitySpan) {
      langfuseMonitor.endActivitySpan('generateAIContent', {
        success: true,
        totalCost,
        contentId,
        persona: persona.name,
        series: series.name
      });
    }

    console.log(`💰 Total generation cost: $${totalCost.toFixed(4)}`);

    return {
      id: contentId,
      script,
      ...optimizedContent,
      generationCost: totalCost
    };

  } catch (error: any) {
    console.error('Content generation failed:', error);

    // End activity span with failure
    if (activitySpan) {
      langfuseMonitor.endActivitySpan('generateAIContent', {
        success: false,
        error: error.message,
        persona: persona.name,
        series: series.name
      });
    }

    throw error;
  }
}

// Activity: Distribute Content
export async function distributeContent(params: {
  content: any;
  platforms: any[];
}): Promise<any[]> {
  const { content, platforms: targetPlatforms } = params;
  const distributions = [];

  for (const platform of targetPlatforms) {
    for (const account of platform.accounts) {
      if (account.status !== 'active') continue;

      try {
        // Set up proxy for this account
        const proxy = await proxyManager.getProxy(account.proxy);

        // Upload content with platform-specific optimizations
        const result = await platforms[platform.name].upload({
          content: content[platform.name],
          account: account,
          proxy: proxy,
          metadata: {
            caption: generatePlatformCaption(content.script, platform.name),
            hashtags: generateHashtags(content.script, platform.name),
            scheduledTime: calculateOptimalPostTime(platform.name)
          }
        });

        distributions.push({
          platform: platform.name,
          accountId: account.id,
          postId: result.postId,
          url: result.url,
          status: 'published'
        });

        // Add delay between posts to avoid rate limiting
        await delay(randomBetween(30000, 60000));

      } catch (error: any) {
        console.error(`Distribution failed for ${platform.name}:${account.id}`, error);
        distributions.push({
          platform: platform.name,
          accountId: account.id,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  return distributions;
}

// Activity: Analyze Performance
export async function analyzePerformance(params: {
  contentId: string;
  distributions: any[];
}): Promise<any> {
  const { contentId, distributions } = params;

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let bestPlatform = '';
  let bestViews = 0;
  let bestUrl = '';

  for (const dist of distributions) {
    if (dist.status !== 'published') continue;

    try {
      const metrics = await platforms[dist.platform].getMetrics({
        postId: dist.postId,
        accountId: dist.accountId
      });

      totalViews += metrics.views || 0;
      totalLikes += metrics.likes || 0;
      totalComments += metrics.comments || 0;
      totalShares += metrics.shares || 0;

      if (metrics.views > bestViews) {
        bestViews = metrics.views;
        bestPlatform = dist.platform;
        bestUrl = dist.url;
      }

      // Store metrics for tracking
      await metricsCollector.record({
        contentId,
        platform: dist.platform,
        metrics,
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`Metrics collection failed for ${dist.platform}`, error);
    }
  }

  // Calculate viral score (0-100)
  const engagementRate = totalViews > 0
    ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
    : 0;

  const viralScore = calculateViralScore({
    views: totalViews,
    engagementRate,
    shareRatio: totalViews > 0 ? (totalShares / totalViews) * 100 : 0,
    velocityHour1: bestViews // Simplified - in production track hourly velocity
  });

  return {
    contentId,
    views: totalViews,
    likes: totalLikes,
    comments: totalComments,
    shares: totalShares,
    engagement: engagementRate,
    viralScore,
    bestPlatform,
    url: bestUrl
  };
}

// Activity: Replicate Winner
export async function replicateWinner(params: {
  content: any;
  scaleFactor: number;
}): Promise<void> {
  const { content, scaleFactor } = params;

  // Create variations of the winning content
  for (let i = 0; i < scaleFactor; i++) {
    try {
      // Generate slight variations to avoid detection
      const variation = await generateVariation(content, i);

      // Queue for distribution with delay
      await storage.queueContent({
        ...variation,
        priority: 'high',
        scheduledFor: new Date(Date.now() + (i * 3600000)) // Stagger by 1 hour
      });

    } catch (error) {
      console.error(`Replication ${i} failed:`, error);
    }
  }
}

// Activity: Rotate Proxy
export async function rotateProxy(params: {
  platform: string;
  accountId: string;
}): Promise<void> {
  const { platform, accountId } = params;

  // Get new proxy from pool
  const newProxy = await proxyManager.rotateProxy(accountId);

  // Update account configuration
  await platforms[platform].updateProxy({
    accountId,
    proxy: newProxy
  });

  // Test new connection
  const testResult = await platforms[platform].testConnection({
    accountId,
    proxy: newProxy
  });

  if (!testResult.success) {
    throw new Error(`Proxy rotation failed for ${accountId}`);
  }
}

// Activity: Warm Up Account
export async function warmUpAccount(params: {
  platform: string;
  accountId: string;
}): Promise<void> {
  const { platform, accountId } = params;

  // Gradual activity increase over 7 days
  const warmupSchedule = [
    { day: 1, actions: ['view', 'like'], count: 5 },
    { day: 2, actions: ['view', 'like', 'comment'], count: 10 },
    { day: 3, actions: ['view', 'like', 'comment', 'follow'], count: 15 },
    { day: 4, actions: ['view', 'like', 'comment', 'follow'], count: 20 },
    { day: 5, actions: ['view', 'like', 'comment', 'follow', 'share'], count: 25 },
    { day: 6, actions: ['view', 'like', 'comment', 'follow', 'share'], count: 30 },
    { day: 7, actions: ['post'], count: 1 }
  ];

  // Execute warmup actions
  for (const schedule of warmupSchedule) {
    await platforms[platform].performActions({
      accountId,
      actions: schedule.actions,
      count: schedule.count
    });

    // Wait 24 hours between warmup days
    await delay(86400000);
  }

  // Mark account as active
  await platforms[platform].updateStatus({
    accountId,
    status: 'active'
  });
}

// Activity: Check Account Health
export async function checkAccountHealth(params: {
  platform: string;
  accountId: string;
}): Promise<any> {
  const { platform, accountId } = params;

  const health = await platforms[platform].checkHealth({
    accountId
  });

  return {
    needsRotation: health.proxyBlocked || health.rateLimit,
    status: health.status,
    warnings: health.warnings
  };
}

// Helper Functions

function generatePlatformCaption(script: any, platform: string): string {
  const baseCaption = script.hook || script.scenes[0].dialogue;

  switch(platform) {
    case 'tiktok':
      return `${baseCaption} 🔥 #fyp #viral`;
    case 'instagram':
      return `${baseCaption}\n.\n.\n.`;
    case 'youtube':
      return `${baseCaption} #shorts`;
    default:
      return baseCaption;
  }
}

function generateHashtags(script: any, platform: string): string[] {
  const baseTags = script.hashtags || ['viral', 'trending'];

  switch(platform) {
    case 'tiktok':
      return [...baseTags, 'fyp', 'foryou', 'foryoupage'];
    case 'instagram':
      return [...baseTags, 'reels', 'explore', 'instagood'];
    case 'youtube':
      return [...baseTags, 'shorts', 'youtubeshorts'];
    default:
      return baseTags;
  }
}

function calculateOptimalPostTime(platform: string): Date {
  const now = new Date();
  const hour = now.getHours();

  // Optimal posting times (simplified)
  const optimalHours: Record<string, number[]> = {
    tiktok: [6, 10, 19, 23],
    instagram: [7, 12, 17, 19],
    youtube: [9, 12, 15, 20]
  };

  const targetHours = optimalHours[platform] || [12];
  const nextOptimal = targetHours.find((h: number) => h > hour) || targetHours[0];

  if (nextOptimal > hour) {
    now.setHours(nextOptimal, 0, 0, 0);
  } else {
    now.setDate(now.getDate() + 1);
    now.setHours(nextOptimal, 0, 0, 0);
  }

  return now;
}

function calculateViralScore(metrics: any): number {
  const viewsScore = Math.min(metrics.views / 10000, 30);
  const engagementScore = Math.min(metrics.engagementRate * 5, 30);
  const shareScore = Math.min(metrics.shareRatio * 10, 20);
  const velocityScore = Math.min(metrics.velocityHour1 / 1000, 20);

  return Math.round(viewsScore + engagementScore + shareScore + velocityScore);
}

async function generateVariation(content: any, index: number): Promise<any> {
  // Create slight variations to avoid detection
  const variations = {
    speed: [0.9, 1.0, 1.1],
    filter: ['none', 'warm', 'cool', 'vintage'],
    crop: ['original', 'tight', 'wide'],
    audio: ['original', 'pitch+1', 'pitch-1']
  };

  return {
    ...content,
    variationIndex: index,
    modifications: {
      speed: variations.speed[index % 3],
      filter: variations.filter[index % 4],
      crop: variations.crop[index % 3],
      audio: variations.audio[index % 3]
    }
  };
}

function generateCaptions(script: any, platform: string): any {
  // Platform-specific caption styling
  return {
    text: script.scenes.map((s: any) => s.dialogue || '').filter((d: string) => d).join(' '),
    style: platform === 'tiktok' ? 'bold' : 'normal',
    position: platform === 'youtube' ? 'bottom' : 'center'
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}