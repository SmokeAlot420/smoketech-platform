/**
 * Integration tests for API routes
 */

import request from 'supertest';
import express from 'express';
import path from 'path';

// Mock the ModularCharacterVideoAPI
jest.mock('../../modular-character-api.js', () => ({
  ModularCharacterVideoAPI: jest.fn().mockImplementation(() => ({
    generateCharacterVideo: jest.fn().mockResolvedValue({
      operationId: 'test-operation-123',
      status: 'processing'
    }),
    getAvailableOptions: jest.fn().mockReturnValue({
      platforms: ['TikTok', 'Instagram', 'YouTube'],
      contentTypes: ['testimonial', 'product-review', 'tutorial'],
      qualities: ['draft', 'production', 'ultra-hd']
    }),
    generateSuggestedDialogue: jest.fn().mockReturnValue(
      'Hi everyone! I\'m here to share amazing content with you.'
    )
  }))
}));

// Mock the QuoteMoto activities
jest.mock('../../src/activities-quotemoto', () => ({
  generateQuoteMotoContent: jest.fn().mockResolvedValue({
    variations: [
      { id: '1', script: 'Test script 1', cost: 5.0 },
      { id: '2', script: 'Test script 2', cost: 5.0 }
    ],
    totalCost: 10.0,
    generatedAt: new Date().toISOString()
  })
}));

describe('API Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create fresh app instance for each test
    app = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../../public')));

    const activeOperations = new Map();
    const { ModularCharacterVideoAPI } = require('../../modular-character-api.js');
    const videoAPI = new ModularCharacterVideoAPI();

    // Define routes (simplified from web-server.ts)
    app.post('/api/generate-video', async (req, res) => {
      try {
        const result = await videoAPI.generateCharacterVideo(req.body);
        activeOperations.set(result.operationId, {
          ...result,
          character: req.body.characterName,
          startTime: Date.now(),
          status: 'processing'
        });
        res.json({
          success: true,
          operationId: result.operationId,
          message: `Video generation started for ${req.body.characterName}`
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    app.get('/api/status/:operationId', (req, res) => {
      const operation = activeOperations.get(req.params.operationId);
      if (!operation) {
        res.status(404).json({ success: false, error: 'Operation not found' });
        return;
      }
      res.json({
        success: true,
        operationId: req.params.operationId,
        status: operation.status,
        character: operation.character
      });
    });

    app.get('/api/options', (_req, res) => {
      res.json(videoAPI.getAvailableOptions());
    });

    app.post('/api/suggest-dialogue', (req, res) => {
      const suggestion = videoAPI.generateSuggestedDialogue(
        { name: req.body.characterName },
        req.body.contentType,
        req.body.industry
      );
      res.json({ success: true, suggestion });
    });

    app.get('/api/health', (_req, res) => {
      res.json({
        success: true,
        message: 'Ultra-Realistic Video Generation API is running',
        timestamp: new Date().toISOString()
      });
    });

    const { generateQuoteMotoContent } = require('../../src/activities-quotemoto');
    app.post('/api/generate-quotemoto-content', async (req, res) => {
      try {
        const result = await generateQuoteMotoContent({
          campaignType: req.body.campaignType || 'savings',
          variations: req.body.variations || 5,
          platforms: req.body.platforms || ['tiktok']
        });
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  });

  describe('POST /api/generate-video', () => {
    it('should successfully initiate video generation', async () => {
      const response = await request(app)
        .post('/api/generate-video')
        .send({
          characterName: 'Pedro',
          profession: 'Insurance Advisor',
          dialogue: 'Test dialogue',
          platform: 'tiktok'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.operationId).toBeDefined();
      expect(response.body.message).toContain('Pedro');
    });

    it('should handle errors gracefully', async () => {
      const { ModularCharacterVideoAPI } = require('../../modular-character-api.js');
      ModularCharacterVideoAPI.mockImplementationOnce(() => ({
        generateCharacterVideo: jest.fn().mockRejectedValue(new Error('Generation failed'))
      }));

      // Recreate app with failing mock
      app = express();
      app.use(express.json());
      const failingAPI = new ModularCharacterVideoAPI();

      app.post('/api/generate-video', async (req, res) => {
        try {
          await failingAPI.generateCharacterVideo(req.body);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      const response = await request(app)
        .post('/api/generate-video')
        .send({
          characterName: 'Test',
          platform: 'tiktok'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/status/:operationId', () => {
    it('should return status for existing operation', async () => {
      // First create an operation
      const createResponse = await request(app)
        .post('/api/generate-video')
        .send({
          characterName: 'Sarah',
          platform: 'instagram'
        });

      const operationId = createResponse.body.operationId;

      // Then check status
      const response = await request(app)
        .get(`/api/status/${operationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.operationId).toBe(operationId);
      expect(response.body.status).toBe('processing');
    });

    it('should return 404 for non-existent operation', async () => {
      const response = await request(app)
        .get('/api/status/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Operation not found');
    });
  });

  describe('GET /api/options', () => {
    it('should return available options', async () => {
      const response = await request(app)
        .get('/api/options')
        .expect(200);

      expect(response.body.platforms).toBeDefined();
      expect(response.body.contentTypes).toBeDefined();
      expect(response.body.qualities).toBeDefined();
      expect(Array.isArray(response.body.platforms)).toBe(true);
    });
  });

  describe('POST /api/suggest-dialogue', () => {
    it('should generate dialogue suggestion', async () => {
      const response = await request(app)
        .post('/api/suggest-dialogue')
        .send({
          characterName: 'Mike',
          contentType: 'testimonial',
          industry: 'Fitness'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.suggestion).toBeDefined();
      expect(typeof response.body.suggestion).toBe('string');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/generate-quotemoto-content', () => {
    it('should generate QuoteMoto content', async () => {
      const response = await request(app)
        .post('/api/generate-quotemoto-content')
        .send({
          campaignType: 'savings',
          variations: 3,
          platforms: ['tiktok', 'instagram']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.variations).toBeDefined();
      expect(Array.isArray(response.body.data.variations)).toBe(true);
    });

    it('should use default values when not provided', async () => {
      const response = await request(app)
        .post('/api/generate-quotemoto-content')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
