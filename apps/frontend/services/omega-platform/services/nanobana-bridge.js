"use strict";
/**
 * NanoBanana Bridge - Connects SmokeTech Studio to Viral Engine
 *
 * This bridge integrates the production-ready viral engine's NanoBanana service
 * with SmokeTech Studio's omega-service.js, enabling ultra-realistic image generation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNanoBananaImages = generateNanoBananaImages;
exports.validateRequest = validateRequest;
const vertexAINanoBanana_1 = require("../../viral/src/services/vertexAINanoBanana");
/**
 * Generate ultra-realistic images using the viral engine's NanoBanana service
 */
async function generateNanoBananaImages(request) {
    const startTime = Date.now();
    try {
        console.log('🍌 NanoBanana Bridge: Initiating generation via viral engine');
        console.log(`📝 Prompt: ${request.prompt.substring(0, 100)}...`);
        console.log(`🔢 Requested images: ${request.numberOfImages || 1}`);
        // Set GEMINI_API_KEY for the viral engine service
        process.env.GEMINI_API_KEY = request.apiKey;
        // Initialize the viral engine's NanoBanana service
        const nanobanaService = new vertexAINanoBanana_1.VertexAINanoBananaService();
        // Generate images using the production-ready viral engine
        const generatedImages = await nanobanaService.generateImage(request.prompt, {
            temperature: 0.4, // Optimal for character consistency
            numImages: request.numberOfImages || 1
        });
        console.log(`✅ Generated ${generatedImages.length} images successfully`);
        // Calculate total cost and generation time
        const totalCost = generatedImages.reduce((sum, img) => sum + img.metadata.cost, 0);
        const totalTime = (Date.now() - startTime) / 1000; // seconds
        // Transform viral engine response to omega-service format
        const images = generatedImages.map((img, index) => ({
            id: `nanobana-${Date.now()}-${index + 1}`,
            url: `data:image/png;base64,${img.base64Data}`,
            imageBytes: img.base64Data
        }));
        return {
            success: true,
            images,
            metadata: {
                model: 'gemini-2.5-flash-image-preview',
                cost: totalCost,
                generationTime: totalTime,
                quality: 'ultra-realistic'
            }
        };
    }
    catch (error) {
        console.error('❌ NanoBanana Bridge Error:', error);
        return {
            success: false,
            images: [],
            metadata: {
                model: 'gemini-2.5-flash-image-preview',
                cost: 0,
                generationTime: (Date.now() - startTime) / 1000,
                quality: 'error'
            },
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
/**
 * Validate NanoBanana request parameters
 */
function validateRequest(request) {
    if (!request.prompt || request.prompt.trim().length === 0) {
        return { valid: false, error: 'Prompt is required and cannot be empty' };
    }
    if (!request.apiKey || request.apiKey.trim().length === 0) {
        return { valid: false, error: 'API key is required' };
    }
    if (request.numberOfImages) {
        if (request.numberOfImages < 1 || request.numberOfImages > 8) {
            return { valid: false, error: 'Number of images must be between 1 and 8' };
        }
    }
    return { valid: true };
}
