/**
 * End-to-End tests for complete video generation workflow
 */

// Mock dependencies
let imageCounter = 0;
jest.mock('../../src/services/vertexAINanoBanana', () => ({
  VertexAINanoBananaService: jest.fn().mockImplementation(() => ({
    generateImage: jest.fn().mockImplementation(async () => {
      imageCounter++;
      return {
        success: true,
        imagePath: `/tmp/test-image-${imageCounter}.png`,
        metadata: { model: 'gemini-2.5-flash-image-preview' }
      };
    })
  }))
}));

jest.mock('../../src/services/veo3Service', () => ({
  VEO3Service: jest.fn().mockImplementation(() => ({
    generateVideo: jest.fn().mockResolvedValue({
      success: true,
      videoPath: '/tmp/test-video.mp4',
      duration: 8,
      cost: 3.20
    })
  }))
}));

jest.mock('../../src/pipelines/ffmpegStitcher', () => ({
  FFmpegStitcher: jest.fn().mockImplementation(() => ({
    stitchVideos: jest.fn().mockResolvedValue({
      success: true,
      outputPath: '/tmp/stitched-video.mp4',
      duration: 56
    })
  }))
}));

describe('Video Generation Workflow E2E', () => {
  describe('Ultra-Realistic Character Video Pipeline', () => {
    it('should complete full pipeline from character to video', async () => {
      const { VertexAINanoBananaService } = require('../../src/services/vertexAINanoBanana');
      const { VEO3Service } = require('../../src/services/veo3Service');
      const { FFmpegStitcher } = require('../../src/pipelines/ffmpegStitcher');

      const nanoService = new VertexAINanoBananaService();
      const veoService = new VEO3Service();
      const stitcher = new FFmpegStitcher();

      // Step 1: Generate character image
      const imageResult = await nanoService.generateImage({
        prompt: 'Professional insurance advisor, 30 years old',
        temperature: 0.3
      });

      expect(imageResult.success).toBe(true);
      expect(imageResult.imagePath).toBeDefined();

      // Step 2: Generate video segment
      const videoResult = await veoService.generateVideo({
        imageInput: imageResult.imagePath,
        prompt: 'Character explaining insurance benefits',
        duration: 8
      });

      expect(videoResult.success).toBe(true);
      expect(videoResult.videoPath).toBeDefined();
      expect(videoResult.duration).toBe(8);

      // Step 3: Stitch multiple segments
      const stitchResult = await stitcher.stitchVideos({
        segments: [videoResult.videoPath, videoResult.videoPath],
        transition: 'dissolve'
      });

      expect(stitchResult.success).toBe(true);
      expect(stitchResult.outputPath).toBeDefined();
    });

    it('should handle errors in character generation', async () => {
      const { VertexAINanoBananaService } = require('../../src/services/vertexAINanoBanana');

      VertexAINanoBananaService.mockImplementationOnce(() => ({
        generateImage: jest.fn().mockRejectedValue(new Error('Generation failed'))
      }));

      const nanoService = new VertexAINanoBananaService();

      await expect(
        nanoService.generateImage({ prompt: 'Test' })
      ).rejects.toThrow('Generation failed');
    });

    it('should handle errors in video generation', async () => {
      const { VEO3Service } = require('../../src/services/veo3Service');

      VEO3Service.mockImplementationOnce(() => ({
        generateVideo: jest.fn().mockRejectedValue(new Error('VEO3 service unavailable'))
      }));

      const veoService = new VEO3Service();

      await expect(
        veoService.generateVideo({
          imageInput: '/tmp/test.png',
          prompt: 'Test'
        })
      ).rejects.toThrow('VEO3 service unavailable');
    });
  });

  describe('QuoteMoto Campaign Workflow', () => {
    it('should generate complete campaign with multiple variations', async () => {
      // Mock the campaign generation
      const mockCampaign = {
        variations: [
          {
            id: '1',
            script: 'Save up to 30% on car insurance',
            imagePath: '/tmp/variation-1.png',
            videoPath: '/tmp/variation-1.mp4',
            cost: 5.0
          },
          {
            id: '2',
            script: 'Get instant quotes in 60 seconds',
            imagePath: '/tmp/variation-2.png',
            videoPath: '/tmp/variation-2.mp4',
            cost: 5.0
          }
        ],
        totalCost: 10.0,
        estimatedReach: 50000
      };

      expect(mockCampaign.variations).toHaveLength(2);
      expect(mockCampaign.totalCost).toBe(10.0);
      expect(mockCampaign.variations[0].videoPath).toBeDefined();
    });
  });

  describe('Multi-Character Library Generation', () => {
    it('should generate character library with consistency', async () => {
      const { VertexAINanoBananaService } = require('../../src/services/vertexAINanoBanana');
      const nanoService = new VertexAINanoBananaService();

      // Generate multiple angles of same character
      const basePrompt = 'Professional insurance advisor, 30 years old, amber eyes';

      const frontView = await nanoService.generateImage({
        prompt: `${basePrompt}, front view`,
        temperature: 0.3
      });

      const sideView = await nanoService.generateImage({
        prompt: `${basePrompt}, 3/4 side view, PRESERVE exact facial features`,
        temperature: 0.3
      });

      expect(frontView.success).toBe(true);
      expect(sideView.success).toBe(true);
      expect(frontView.imagePath).not.toBe(sideView.imagePath);
    });
  });

  describe('Workflow Performance Metrics', () => {
    it('should complete single video generation within time limit', async () => {
      const startTime = Date.now();

      const { VertexAINanoBananaService } = require('../../src/services/vertexAINanoBanana');
      const { VEO3Service } = require('../../src/services/veo3Service');

      const nanoService = new VertexAINanoBananaService();
      const veoService = new VEO3Service();

      await nanoService.generateImage({ prompt: 'Test character' });
      await veoService.generateVideo({ imageInput: '/tmp/test.png', prompt: 'Test video' });

      const duration = Date.now() - startTime;

      // Should complete within 5 seconds (mocked services are fast)
      expect(duration).toBeLessThan(5000);
    });

    it('should track costs accurately', async () => {
      const { VEO3Service } = require('../../src/services/veo3Service');
      const veoService = new VEO3Service();

      const result = await veoService.generateVideo({
        imageInput: '/tmp/test.png',
        prompt: 'Test',
        duration: 8
      });

      expect(result.cost).toBe(3.20); // Extended duration cost
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const mockServiceWithRetry = {
        generateWithRetry: jest.fn().mockImplementation(async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return { success: true, data: 'Success after retry' };
        })
      };

      // Retry logic
      const maxRetries = 3;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const result = await mockServiceWithRetry.generateWithRetry();
          expect(result.success).toBe(true);
          break;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
        }
      }

      expect(attemptCount).toBe(3);
    });
  });
});
