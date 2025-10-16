/**
 * @jest-environment node
 */
import { POST } from '../generate-images/route';
import { NextRequest } from 'next/server';

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('API Route: /api/generate-images', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IMAGEN_API_KEY = 'test-api-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.NANOBANA_API_KEY = 'test-nano-key';
  });

  describe('POST /api/generate-images', () => {
    it('should generate images with Imagen model', async () => {
      const mockResponse = {
        images: [
          { url: 'https://example.com/image1.jpg', mimeType: 'image/jpeg' },
          { url: 'https://example.com/image2.jpg', mimeType: 'image/jpeg' }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3',
          numberOfImages: 2,
          aspectRatio: '16:9'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should generate images with NanoBanana model', async () => {
      const mockResponse = {
        images: [
          { base64: 'base64encodedimage', mimeType: 'image/png' }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'nanobana',
          numberOfImages: 1
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toHaveLength(1);
    });

    it('should handle missing API key', async () => {
      delete process.env.IMAGEN_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('API key');
    });

    it('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required prompt
          model: 'imagen-3'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('prompt');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      });

      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Network error');
    });

    it('should validate aspect ratio', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3',
          aspectRatio: 'invalid-ratio'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid aspect ratio');
    });

    it('should validate number of images', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-images', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'imagen-3',
          numberOfImages: 10 // Exceeds limit
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Number of images');
    });
  });
});