/**
 * Unit tests for VideoRouter
 */

import { VideoRouter } from '../../src/video-router';

describe('VideoRouter', () => {
  let router: VideoRouter;

  beforeEach(() => {
    router = new VideoRouter();
  });

  describe('selectPlatforms', () => {
    it('should select VEO3 for audio-based content', async () => {
      const script = 'This video includes voiceover narration about insurance savings';
      const params = { platforms: ['tiktok'] };

      const platforms = await router.selectPlatforms(script, params);

      expect(platforms).toHaveLength(1);
      expect(platforms[0].type).toBe('veo3');
      expect(platforms[0].features.hasAudio).toBe(true);
    });

    it('should calculate cost correctly for short videos (<=5s)', async () => {
      const script = 'Quick tip';
      const params = { platforms: ['tiktok'] };

      const platforms = await router.selectPlatforms(script, params);

      expect(platforms[0].cost).toBe(1.20);
      expect(platforms[0].duration).toBeLessThanOrEqual(5);
    });

    it('should calculate cost correctly for extended videos (>5s)', async () => {
      const script = 'This is a longer narration that requires more time to explain the complex insurance benefits and savings opportunities available';
      const params = { platforms: ['youtube'], series: { requiresAudio: true } };

      const platforms = await router.selectPlatforms(script, params);

      expect(platforms[0].cost).toBe(3.20);
      expect(platforms[0].duration).toBeGreaterThan(5);
    });

    it('should optimize duration for TikTok platform', async () => {
      const script = 'Medium length script for social media';
      const params = { platforms: ['tiktok'] };

      const platforms = await router.selectPlatforms(script, params);

      expect(platforms[0].duration).toBeLessThanOrEqual(7);
    });

    it('should optimize duration for YouTube platform', async () => {
      const script = 'Short script';
      const params = { platforms: ['youtube'] };

      const platforms = await router.selectPlatforms(script, params);

      expect(platforms[0].duration).toBeGreaterThanOrEqual(8);
    });
  });

  describe('getOptimizationTips', () => {
    it('should provide tips for VEO3 platform', () => {
      const platform = {
        type: 'veo3' as const,
        duration: 8,
        cost: 3.20,
        features: {
          hasAudio: true,
          motionLevel: 'high' as const,
          frameControl: 'start-only' as const,
          quality: 'premium' as const
        }
      };

      const tips = router.getOptimizationTips(platform, 'Test script');

      expect(tips).toContain('VEO3 excels with clear voiceover - consider adding narration');
      expect(tips).toContain('Use high-quality starting frame for best results');
      expect(tips).toContain('Extended duration (>5s) increases cost to $3.20');
    });

    it('should suggest more detail for short scripts', () => {
      const platform = {
        type: 'veo3' as const,
        duration: 10,
        cost: 3.20,
        features: {
          hasAudio: true,
          motionLevel: 'high' as const,
          frameControl: 'start-only' as const,
          quality: 'premium' as const
        }
      };

      const tips = router.getOptimizationTips(platform, 'Short');

      expect(tips.some(tip => tip.includes('consider adding more detail'))).toBe(true);
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI for VEO3 platform', () => {
      const platform = {
        type: 'veo3' as const,
        duration: 8,
        cost: 3.20,
        features: {
          hasAudio: true,
          motionLevel: 'high' as const,
          frameControl: 'start-only' as const,
          quality: 'premium' as const
        }
      };

      const roi = router.calculateROI(platform, 10000);

      expect(roi).toBeGreaterThan(0);
      expect(roi).toBeLessThanOrEqual(100);
    });

    it('should return higher ROI for more views', () => {
      const platform = {
        type: 'veo3' as const,
        duration: 5,
        cost: 1.20,
        features: {
          hasAudio: true,
          motionLevel: 'high' as const,
          frameControl: 'start-only' as const,
          quality: 'premium' as const
        }
      };

      const roi1 = router.calculateROI(platform, 1000);
      const roi2 = router.calculateROI(platform, 10000);

      expect(roi2).toBeGreaterThan(roi1);
    });

    it('should cap ROI at 100%', () => {
      const platform = {
        type: 'veo3' as const,
        duration: 5,
        cost: 1.20,
        features: {
          hasAudio: true,
          motionLevel: 'high' as const,
          frameControl: 'start-only' as const,
          quality: 'premium' as const
        }
      };

      const roi = router.calculateROI(platform, 1000000);

      expect(roi).toBe(100);
    });
  });
});
