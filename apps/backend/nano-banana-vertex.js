"use strict";
/**
 * NANO BANANA VERTEX AI - Production Implementation
 * Uses the REAL imagegeneration@006 and imagen-3.0-capability-001 endpoints
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NanoBananaVertex = void 0;
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class NanoBananaVertex {
    auth;
    projectId;
    location;
    modelVersion;
    accessToken = null;
    constructor(projectId, location = 'us-central1') {
        this.projectId = projectId;
        this.location = location;
        this.modelVersion = 'imagen-3.0-capability-001'; // Use latest for character consistency
        // Initialize Google Auth
        this.auth = new google_auth_library_1.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
    }
    /**
     * Get access token for API calls
     */
    async getAccessToken() {
        const client = await this.auth.getClient();
        const tokenResponse = await client.getAccessToken();
        if (!tokenResponse.token) {
            throw new Error('Failed to get access token');
        }
        return tokenResponse.token;
    }
    /**
     * Create a character reference from an image
     */
    async createCharacterReference(imagePath, name, description) {
        console.log(`📸 Creating character reference for ${name}...`);
        // Read and encode image
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const characterRef = {
            id: `char_${Date.now()}`,
            name,
            description,
            referenceImage: base64Image,
            createdAt: new Date(),
        };
        // Save reference for later use
        const refsDir = path.join(process.cwd(), 'character-refs');
        await fs.mkdir(refsDir, { recursive: true });
        const refPath = path.join(refsDir, `${characterRef.id}.json`);
        await fs.writeFile(refPath, JSON.stringify(characterRef, null, 2));
        console.log(`✅ Character reference created: ${characterRef.id}`);
        return characterRef;
    }
    /**
     * Generate image with character consistency
     */
    async generateWithCharacter(options) {
        const token = await this.getAccessToken();
        // Build the API endpoint
        const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelVersion}:predict`;
        // Build the request payload
        const requestBody = {
            instances: [{
                    prompt: options.characterRef
                        ? options.prompt.replace(/\[character\]/g, '[1]')
                        : options.prompt,
                }],
            parameters: {
                sampleCount: options.sampleCount || 1,
                aspectRatio: options.aspectRatio || '1:1',
                safetyFilterLevel: options.safetyFilterLevel || 'block_some',
                personGeneration: options.personGeneration || 'allow_adult',
                addWatermark: options.addWatermark !== false,
            }
        };
        // Add reference images for character consistency
        if (options.characterRef) {
            requestBody.instances[0].referenceImages = [{
                    referenceType: 'REFERENCE_TYPE_SUBJECT',
                    referenceId: 1,
                    referenceImage: {
                        bytesBase64Encoded: options.characterRef.referenceImage
                    },
                    subjectImageConfig: {
                        subjectType: 'SUBJECT_TYPE_PERSON',
                        subjectDescription: options.characterRef.description
                    }
                }];
        }
        console.log(`🎨 Generating image with prompt: ${options.prompt.substring(0, 100)}...`);
        try {
            const response = await axios_1.default.post(endpoint, requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.predictions || response.data.predictions.length === 0) {
                throw new Error('No predictions returned');
            }
            // Extract base64 images from response
            const images = [];
            for (const prediction of response.data.predictions) {
                if (prediction.bytesBase64Encoded) {
                    const imageBuffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
                    images.push(imageBuffer);
                }
            }
            console.log(`✅ Generated ${images.length} images successfully`);
            return images;
        }
        catch (error) {
            if (error.response?.status === 404) {
                // Fallback to imagegeneration@006 if newer model not available
                console.log('⚠️ Falling back to imagegeneration@006...');
                this.modelVersion = 'imagegeneration@006';
                return this.generateWithCharacter(options); // Retry with older model
            }
            console.error('❌ Generation failed:', error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Generate multiple consistent images for a character
     */
    async generateCharacterSeries(characterRef, prompts) {
        console.log(`🎬 Generating series for ${characterRef.name}...`);
        const allImages = [];
        for (const prompt of prompts) {
            const images = await this.generateWithCharacter({
                prompt,
                characterRef,
                sampleCount: 1, // Generate one at a time for consistency
            });
            allImages.push(images);
            // Save generated images
            const outputDir = path.join(process.cwd(), 'generated', characterRef.id);
            await fs.mkdir(outputDir, { recursive: true });
            for (let i = 0; i < images.length; i++) {
                const filename = `${Date.now()}_${i}.png`;
                const filepath = path.join(outputDir, filename);
                await fs.writeFile(filepath, images[i]);
                console.log(`  💾 Saved: ${filename}`);
            }
            // Rate limiting - NanoBanana has 2 requests/minute quota
            await this.delay(30000); // Wait 30 seconds between requests
        }
        return allImages;
    }
    /**
     * Load existing character reference
     */
    async loadCharacterReference(characterId) {
        const refPath = path.join(process.cwd(), 'character-refs', `${characterId}.json`);
        const data = await fs.readFile(refPath, 'utf-8');
        return JSON.parse(data);
    }
    /**
     * Helper method for delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.NanoBananaVertex = NanoBananaVertex;
// Export for use in Temporal activities
exports.default = NanoBananaVertex;
//# sourceMappingURL=nano-banana-vertex.js.map