/**
 * @jest-environment node
 */
import { POST } from '../generate-omega/route';
import { NextRequest } from 'next/server';

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('API Route: /api/generate-omega', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OMEGA_SERVICE_URL = 'http://localhost:3007';
  });

  describe('POST /api/generate-omega', () => {
    it('should successfully initiate omega workflow', async () => {
      const mockResponse = {
        success: true,
        operationId: 'op-123-456',
        message: 'Omega workflow started successfully',
        estimatedTime: 300
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Aria QuoteMoto',
          prompt: 'Create a video about insurance savings',
          duration: 60,
          style: 'professional',
          platform: 'tiktok'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.operationId).toBe('op-123-456');
      expect(data.estimatedTime).toBe(300);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3007/api/generate-omega',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Aria QuoteMoto')
        })
      );
    });

    it('should handle missing character parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Create a video',
          duration: 60
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Character is required');
    });

    it('should handle invalid duration', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Aria',
          prompt: 'Test',
          duration: 500 // Too long
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Duration must be between');
    });

    it('should handle omega service unavailable', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('ECONNREFUSED')
      );

      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Aria',
          prompt: 'Test video',
          duration: 30
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Omega service unavailable');
    });

    it('should handle omega service rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: 'Rate limit exceeded',
          retryAfter: 60
        })
      });

      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Aria',
          prompt: 'Test video',
          duration: 30
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit');
      expect(data.retryAfter).toBe(60);
    });

    it('should validate platform parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Aria',
          prompt: 'Test',
          duration: 30,
          platform: 'invalid-platform'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid platform');
    });

    it('should include optional parameters when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operationId: 'op-789'
        })
      });

      const request = new NextRequest('http://localhost:3000/api/generate-omega', {
        method: 'POST',
        body: JSON.stringify({
          character: 'Sophia',
          prompt: 'Fashion tips',
          duration: 45,
          platform: 'instagram',
          style: 'trendy',
          music: true,
          voiceover: true,
          language: 'en',
          aspectRatio: '9:16'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        character: 'Sophia',
        prompt: 'Fashion tips',
        duration: 45,
        platform: 'instagram',
        style: 'trendy',
        music: true,
        voiceover: true,
        language: 'en',
        aspectRatio: '9:16'
      });
    });
  });
});