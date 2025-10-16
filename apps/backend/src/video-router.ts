/**
 * Video Router - Intelligent platform selection for video generation
 * Currently optimized for VEO3, but architecture supports future platforms
 */

export interface VideoPlatform {
  type: 'veo3' | 'midjourney' | 'hilu' | 'runway'; // Extensible for future
  duration: number;
  cost: number;
  features: {
    hasAudio: boolean;
    motionLevel: 'low' | 'medium' | 'high';
    frameControl: 'start-only' | 'frame-to-frame';
    quality: 'standard' | 'high' | 'premium';
  };
}

export interface VideoRequirements {
  needsAudio: boolean;
  motionIntensity: 'low' | 'medium' | 'high';
  targetDuration: number;
  maxBudget?: number;
  platform: string; // social platform (tiktok, instagram, youtube)
}

export class VideoRouter {
  // Platform capabilities (ready for future expansion)
  private platforms = {
    veo3: {
      cost: { base: 1.20, extended: 3.20 },
      maxDuration: 10,
      features: {
        hasAudio: true,
        motionLevel: 'high' as const,
        frameControl: 'start-only' as const,
        quality: 'premium' as const
      },
      strengths: ['audio generation', 'high quality', 'natural motion'],
      weaknesses: ['cost', 'limited control']
    },
    // Ready for future platforms - uncommented when needed
    // midjourney: {
    //   cost: { base: 0.04 },
    //   maxDuration: 5,
    //   features: {
    //     hasAudio: false,
    //     motionLevel: 'low',
    //     frameControl: 'start-only',
    //     quality: 'standard'
    //   },
    //   strengths: ['cheap', 'fast', 'simple animations'],
    //   weaknesses: ['no audio', 'limited motion']
    // },
    // hilu: {
    //   cost: { base: 0.80 },
    //   maxDuration: 7,
    //   features: {
    //     hasAudio: false,
    //     motionLevel: 'high',
    //     frameControl: 'frame-to-frame',
    //     quality: 'high'
    //   },
    //   strengths: ['dynamic motion', 'frame control', 'action sequences'],
    //   weaknesses: ['no audio', 'medium cost']
    // }
  };

  /**
   * Selects optimal video generation platform(s) based on content requirements
   * Currently returns VEO3 by default, but logic is ready for expansion
   */
  async selectPlatforms(
    script: string,
    params: any
  ): Promise<VideoPlatform[]> {
    const requirements = this.analyzeRequirements(script, params);

    // For now, always use VEO3 (as per user request)
    const veo3Platform: VideoPlatform = {
      type: 'veo3',
      duration: this.calculateOptimalDuration(requirements),
      cost: requirements.targetDuration > 5 ? 3.20 : 1.20,
      features: this.platforms.veo3.features
    };

    const selectedPlatforms = [veo3Platform];

    // Future expansion point - when ready to add more platforms:
    // if (params.experimentalMode) {
    //   const alternativePlatforms = this.selectAlternatives(requirements);
    //   selectedPlatforms.push(...alternativePlatforms);
    // }

    return selectedPlatforms;
  }

  /**
   * Analyzes script to determine video requirements
   */
  private analyzeRequirements(script: string, params: any): VideoRequirements {
    const scriptLower = script.toLowerCase();

    // Detect audio needs
    const needsAudio =
      scriptLower.includes('voiceover') ||
      scriptLower.includes('narration') ||
      scriptLower.includes('speaking') ||
      scriptLower.includes('dialogue') ||
      params.series?.requiresAudio;

    // Detect motion intensity
    let motionIntensity: VideoRequirements['motionIntensity'] = 'medium';
    if (scriptLower.includes('action') || scriptLower.includes('fast') || scriptLower.includes('dynamic')) {
      motionIntensity = 'high';
    } else if (scriptLower.includes('calm') || scriptLower.includes('slow') || scriptLower.includes('gentle')) {
      motionIntensity = 'low';
    }

    // Calculate target duration
    const wordCount = script.split(' ').length;
    const targetDuration = this.estimateDuration(wordCount, needsAudio);

    return {
      needsAudio,
      motionIntensity,
      targetDuration,
      maxBudget: params.costMode === 'fast' ? 1.50 : 5.00,
      platform: params.platforms?.[0] || 'tiktok'
    };
  }

  /**
   * Calculates optimal video duration based on requirements
   */
  private calculateOptimalDuration(requirements: VideoRequirements): number {
    let duration = requirements.targetDuration;

    // Platform-specific adjustments
    if (requirements.platform === 'tiktok') {
      duration = Math.min(duration, 7); // TikTok sweet spot
    } else if (requirements.platform === 'youtube') {
      duration = Math.max(duration, 8); // YouTube prefers longer
    }

    // VEO3 cost threshold at 5 seconds
    if (duration > 4 && duration < 6) {
      // Optimize around the cost boundary
      duration = 5; // Exactly at boundary
    }

    return Math.min(duration, 10); // VEO3 max
  }

  /**
   * Estimates video duration from script length
   */
  private estimateDuration(wordCount: number, hasVoiceover: boolean): number {
    if (hasVoiceover) {
      // ~150 words per minute for speech
      return Math.ceil((wordCount / 150) * 60);
    } else {
      // Visual content, estimate based on complexity
      if (wordCount < 50) return 5;
      if (wordCount < 100) return 7;
      return 10;
    }
  }

  // Future method for selecting alternative platforms
  // Ready for when we expand beyond VEO3
  // private selectAlternatives(_requirements: VideoRequirements): VideoPlatform[] {
  //   const alternatives: VideoPlatform[] = [];
  //
  //   // Logic for future platform selection
  //   // if (!requirements.needsAudio && requirements.maxBudget < 1) {
  //   //   alternatives.push({
  //   //     type: 'midjourney',
  //   //     duration: Math.min(requirements.targetDuration, 5),
  //   //     cost: 0.04,
  //   //     features: this.platforms.midjourney.features
  //   //   });
  //   // }
  //
  //   // if (requirements.motionIntensity === 'high' && !requirements.needsAudio) {
  //   //   alternatives.push({
  //   //     type: 'hilu',
  //   //     duration: Math.min(requirements.targetDuration, 7),
  //   //     cost: 0.80,
  //   //     features: this.platforms.hilu.features
  //   //   });
  //   // }
  //
  //   return alternatives;
  // }

  /**
   * Provides recommendations for content optimization
   */
  getOptimizationTips(platform: VideoPlatform, script: string): string[] {
    const tips: string[] = [];

    if (platform.type === 'veo3') {
      tips.push('VEO3 excels with clear voiceover - consider adding narration');
      tips.push('Use high-quality starting frame for best results');

      if (platform.duration > 5) {
        tips.push('Extended duration (>5s) increases cost to $3.20');
      }

      if (script.length < 200) {
        tips.push('Short script - consider adding more detail for ' + platform.duration + 's video');
      }
    }

    // Future platform tips
    // if (platform.type === 'midjourney') {
    //   tips.push('MidJourney works best with simple, subtle movements');
    // }

    return tips;
  }

  /**
   * Calculates ROI potential for platform selection
   */
  calculateROI(platform: VideoPlatform, expectedViews: number): number {
    const costPerView = platform.cost / expectedViews;
    const benchmarks: Record<string, number> = {
      veo3: 0.001,      // $0.001 per view is good for premium
      midjourney: 0.0001, // $0.0001 per view for budget
      hilu: 0.0005,     // $0.0005 per view for mid-tier
      runway: 0.0008    // $0.0008 per view for runway
    };

    const benchmark = benchmarks[platform.type] || 0.001;
    const roiScore = (benchmark / costPerView) * 100;

    return Math.min(100, roiScore);
  }
}

export default VideoRouter;