import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleMediaClient } from './google-media-client';
import { CollageComposer } from './collage-composer';
import { MotionPrompter } from './motion-prompter';
import { CharacterManager } from './character-manager';
import { VariationGenerator } from './variation-generator';

export interface EnhancedContentParams {
  persona: any;
  series: any;
  platforms: string[];
  characterId?: string;
  generateVariations?: boolean;
  costMode?: 'fast' | 'premium' | 'dynamic';
}

export interface EnhancedContent {
  id: string;
  script: string;
  images: {
    base: string[];
    edited: string[];
    collage?: string;
  };
  videos: {
    platform: string;
    url: string;
    cost: number;
  }[];
  variations?: EnhancedContent[];
  character?: {
    id: string;
    consistency: number;
  };
  totalCost: number;
  viralPotential: number;
}

export class EnhancedContentGenerator {
  private gemini: GoogleGenerativeAI;
  private googleMedia: GoogleMediaClient;
  private collageComposer: CollageComposer;
  private motionPrompter: MotionPrompter;
  private characterManager: CharacterManager;
  private variationGenerator: VariationGenerator;

  constructor(geminiApiKey: string) {
    this.gemini = new GoogleGenerativeAI(geminiApiKey);
    this.googleMedia = new GoogleMediaClient(geminiApiKey);
    this.collageComposer = new CollageComposer();
    this.motionPrompter = new MotionPrompter();
    this.characterManager = new CharacterManager();
    this.variationGenerator = new VariationGenerator();
    this.variationGenerator.setGoogleMediaClient(this.googleMedia);
  }

  async generateEnhancedContent(params: EnhancedContentParams): Promise<EnhancedContent> {
    const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let totalCost = 0;

    // Step 1: Generate script with Gemini
    console.log('📝 Generating script with Gemini...');
    const script = await this.generateScript(params);
    totalCost += 0.27; // Gemini cost

    // Step 2: Get or create character profile
    let character;
    if (params.characterId) {
      character = await this.characterManager.getCharacter(params.characterId);
    } else {
      character = await this.characterManager.createCharacter(params.persona);
    }

    // Step 3: Generate base images with collage technique
    console.log('🎨 Creating base images with collage composition...');
    const baseImages = await this.generateBaseImages(script, character, params);
    totalCost += baseImages.cost;

    // Step 4: Apply motion-based editing
    console.log('🎬 Applying motion enhancements...');
    const editedImages = await this.applyMotionEditing(baseImages.images, script);
    totalCost += editedImages.cost;

    // Step 5: Create collage if multiple images
    let collageImage;
    if (baseImages.images.length > 1) {
      collageImage = await this.collageComposer.createCollage(baseImages.images, this.googleMedia);
      totalCost += 0.039; // Additional Nano Banana call
    }

    // Step 6: Intelligent video generation
    console.log('🎥 Generating videos with platform-specific routing...');
    const videos = await this.generateVideos(editedImages.images, script, params);
    totalCost += videos.totalCost;

    // Step 7: Generate variations if requested
    let variations;
    if (params.generateVariations) {
      console.log('🔄 Creating A/B test variations...');
      variations = await this.variationGenerator.generateVariations(
        script,
        baseImages.images,
        params
      );
      totalCost += variations.totalCost;
    }

    // Step 8: Calculate viral potential
    const viralPotential = this.calculateViralPotential(script, videos.videos);

    // Step 9: Update character consistency
    if (character) {
      await this.characterManager.updateUsageHistory(character.id, contentId, viralPotential);
    }

    return {
      id: contentId,
      script,
      images: {
        base: baseImages.images,
        edited: editedImages.images,
        collage: collageImage
      },
      videos: videos.videos,
      variations: variations?.variations as any,
      character: character ? {
        id: character.id,
        consistency: await this.characterManager.calculateConsistency(character.id)
      } : undefined,
      totalCost,
      viralPotential
    };
  }

  private async generateScript(params: EnhancedContentParams): Promise<any> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Create a viral ${params.series.format || 'video'} script for ${params.persona.name}.

    Series: ${params.series.name}
    Theme: ${params.series.theme}
    Style: ${params.persona.style}
    Tone: ${params.persona.tone}

    Requirements:
    - Include natural movements and actions (avoid static scenes)
    - Create emotional hooks in the first 3 seconds
    - Add clear calls-to-action
    - Optimize for ${params.platforms.join(', ')}
    - Include specific motion cues for video generation

    Output as JSON with:
    {
      "hook": "attention-grabbing opening line",
      "script": "full script with timing cues",
      "visualCues": ["visual description 1", "visual description 2"],
      "hashtags": ["relevant", "hashtags"],
      "musicStyle": "background music style"
    }`;

    const result = await model.generateContent(prompt);
    const scriptText = result.response.text();

    // Parse JSON from response
    const jsonMatch = scriptText.match(/```json\n?([\s\S]*?)\n?```/) || scriptText.match(/{[\s\S]*}/);
    const scriptObj = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : scriptText);

    return scriptObj;
  }

  private async generateBaseImages(script: any, character: any, params: EnhancedContentParams) {
    const images: string[] = [];
    let cost = 0;

    // Check if this is QuoteMoto content
    const isQuoteMoto = params.persona?.name?.toLowerCase().includes('quotemoto') ||
                        script.script?.toLowerCase().includes('quotemoto');

    if (isQuoteMoto) {
      // Use specialized QuoteMoto generation method for consistent branded content
      console.log('🚗 Generating QuoteMoto branded content with character consistency...');
      const quoteMotoImages = await this.googleMedia.generateQuoteMotoContent();

      for (const img of quoteMotoImages) {
        images.push(img.url);
      }
      cost = quoteMotoImages.length * 0.039;
    } else {
      // Extract visual descriptions from script
      const visualCues = script.visualCues || this.extractVisualCues(script.script || '');

      // Generate 3-5 base images using collage technique
      const numImages = params.costMode === 'fast' ? 3 : 5;

      for (let i = 0; i < numImages; i++) {
        // Use motion prompter to enhance the prompt
        const enhancedPrompt = await this.motionPrompter.enhancePrompt(
          visualCues[i % visualCues.length],
          character
        );

        // Include reference images for consistency if available
        const referenceImage = character?.referenceImages?.[0];

        const result = await this.googleMedia.generateImageNanoBanana({
          prompt: enhancedPrompt,
          negativePrompt: 'low quality, blurry, distorted',
          aspectRatio: '16:9',
          personaId: params.persona?.id,
          characterId: character?.id,
          referenceImage
        });

        images.push(result.url);
        cost += 0.039;
      }
    }

    return { images, cost };
  }

  private async applyMotionEditing(baseImages: string[], script: any) {
    const editedImages: string[] = [];
    let cost = 0;

    for (const image of baseImages) {
      // Apply motion blur and dynamic elements
      const motionPrompt = this.motionPrompter.generateMotionEditPrompt(script.script || script);

      const result = await this.googleMedia.generateImageNanoBanana({
        prompt: `${motionPrompt}, based on: ${image}`,
        negativePrompt: 'static, frozen, still'
      });

      editedImages.push(result.url);
      cost += 0.039;
    }

    return { images: editedImages, cost };
  }

  private async generateVideos(_images: string[], script: any, params: EnhancedContentParams) {
    const videos = [];
    let totalCost = 0;

    // For now, focus on VEO3 - but architecture supports future platforms
    const videoDuration = this.determineOptimalDuration(script, params);

    // VEO3 with high quality and audio
    console.log(`🎥 Generating VEO3 video (${videoDuration}s)...`);

    // Extract the actual script text from the script object
    let videoPrompt = '';
    if (typeof script === 'object' && script !== null) {
      videoPrompt = script.script || script.hook || JSON.stringify(script);
    } else if (typeof script === 'string') {
      videoPrompt = script;
    } else {
      videoPrompt = 'QuoteMoto Insurance - Save hundreds on car insurance with instant quotes';
    }

    const video = await this.googleMedia.generateVideoVEO3({
      prompt: videoPrompt,
      duration: videoDuration,
      resolution: '720p',
      aspectRatio: '16:9' // Changed from 9:16 - VEO3 doesn't support vertical with any resolution
    });

    const cost = videoDuration > 5 ? 3.20 : 1.20;

    videos.push({
      platform: 'veo3',
      url: video.url,
      cost,
      duration: videoDuration
    });

    totalCost += cost;

    // Future expansion point - uncomment when ready:
    // if (params.additionalPlatforms) {
    //   const extraVideos = await this.generateAdditionalPlatformVideos(images, script, params);
    //   videos.push(...extraVideos.videos);
    //   totalCost += extraVideos.totalCost;
    // }

    return { videos, totalCost };
  }

  private determineOptimalDuration(script: any, params: EnhancedContentParams): number {
    // Smart duration based on content
    const scriptText = script.script || script;
    const scriptLength = typeof scriptText === 'string' ? scriptText.length : 500;
    const hasCTA = typeof scriptText === 'string' && (scriptText.toLowerCase().includes('cta') || scriptText.toLowerCase().includes('call to action'));

    if (params.costMode === 'fast') {
      return 5; // Keep costs low for testing
    }

    if (scriptLength > 1000 || hasCTA) {
      return 10; // Longer for complex content
    }

    return 7; // Default middle ground
  }

  private extractVisualCues(script: any): string[] {
    // Handle both string and object script formats
    if (typeof script === 'object' && script !== null) {
      // If script is already an object with visualCues
      if (Array.isArray(script.visualCues)) {
        return script.visualCues;
      }
      // If script object has a script property that's a string
      if (typeof script.script === 'string') {
        script = script.script;
      } else {
        // Default visual cues if object doesn't have expected structure
        return [
          'Professional insurance agent at modern office',
          'Showing insurance quotes on tablet screen',
          'Happy customers saving money'
        ];
      }
    }

    // If script is a string, try to extract visual cues
    if (typeof script === 'string') {
      const visualRegex = /\[VISUALS?\]:\s*([^\[]+)/gi;
      const matches = [];
      let match;

      while ((match = visualRegex.exec(script)) !== null) {
        matches.push(match[1].trim());
      }

      // Fallback to splitting script into scenes
      if (matches.length === 0) {
        const scenes = script.split(/\n\n/).filter(s => s.length > 20);
        return scenes.slice(0, 5);
      }

      return matches;
    }

    // Default fallback
    return ['Scene 1', 'Scene 2', 'Scene 3'];
  }

  private calculateViralPotential(script: any, videos: any[]): number {
    let score = 0;

    // Hook strength (0-30)
    if (script.hook) {
      score += 20;
    }
    const scriptText = script.script || script;
    if (typeof scriptText === 'string' && scriptText.length < 500) {
      score += 10; // Concise content
    }

    // Visual quality (0-30)
    const hasHighQualityVideo = videos.some(v => v.platform === 'veo3');
    const hasDynamicVideo = videos.some(v => v.platform === 'hilu');
    if (hasHighQualityVideo) score += 20;
    if (hasDynamicVideo) score += 10;

    // Platform optimization (0-20)
    if (videos.length > 1) score += 10;
    if (videos.some(v => v.platform === 'veo3' && v.cost > 2)) score += 10;

    // Content factors (0-20)
    const scriptContent = script.script || script;
    if (typeof scriptContent === 'string' && (scriptContent.toLowerCase().includes('cta') || scriptContent.toLowerCase().includes('call to action'))) {
      score += 10;
    }
    if (typeof scriptContent === 'string' && scriptContent.includes('?')) score += 5; // Questions increase engagement
    if (typeof scriptContent === 'string' && scriptContent.includes('!')) score += 5; // Excitement

    return Math.min(score, 100);
  }
}

export default EnhancedContentGenerator;