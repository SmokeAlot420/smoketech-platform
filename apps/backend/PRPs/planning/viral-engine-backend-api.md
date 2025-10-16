# Viral Engine Backend API Documentation
## Complete Interface Specification for Omega-Platform Integration

**Document Version:** 1.0
**Last Updated:** 2025-10-02
**Purpose:** Contract between SmokeTech Studio UI and Viral Engine backend

---

## Table of Contents
1. [API Overview](#api-overview)
2. [VEO3 Service API](#veo3-service-api)
3. [Gemini Enhancement Service](#gemini-enhancement-service)
4. [Video Extension Service](#video-extension-service)
5. [Parameter Reference](#parameter-reference)
6. [Cost & Performance](#cost--performance)
7. [Code Examples](#code-examples)
8. [Integration Requirements](#integration-requirements)

---

## API Overview

### Core Services
- **VEO3Service** - Main video generation engine with Google Creative Studio patterns
- **GeminiPromptEnhancer** - AI-powered prompt enhancement (3 quality levels)
- **VideoExtensionManager** - Seamless video chaining and frame extraction
- **VEO3CinematicPromptEngineer** - Google's 4-step cinematic enhancement

### Service Locations
```typescript
// Import paths for omega-platform integration
import { VEO3Service } from '@viral/services/veo3Service';
import { getGeminiPromptEnhancer } from '@viral/services/geminiPromptEnhancer';
import { VideoExtensionManager } from '@viral/utils/videoExtension';
```

---

## VEO3 Service API

### Class: `VEO3Service`

**Location:** `src/services/veo3Service.ts`

#### Constructor
```typescript
constructor(config?: VEO3Config)

interface VEO3Config {
  projectId?: string;      // Default: process.env.GCP_PROJECT_ID
  location?: string;        // Default: process.env.GCP_LOCATION || 'us-central1'
  outputPath?: string;      // Default: './generated/veo3'
  maxRetries?: number;      // Default: 3
  retryDelay?: number;      // Default: 5000ms
}
```

**Example:**
```typescript
const veo3 = new VEO3Service({
  outputPath: './my-output',
  maxRetries: 5
});
```

---

### Method: `generateVideoSegment()`

**Primary video generation method with all Google Creative Studio features**

#### Signature
```typescript
async generateVideoSegment(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult>
```

#### Request Parameters

```typescript
interface VideoGenerationRequest {
  // === REQUIRED ===
  prompt: string | VEO3JSONPrompt;  // Text prompt or JSON structure

  // === BASIC CONTROLS ===
  duration?: 4 | 6 | 8;             // Default: 8 seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';  // Default: '16:9'
  quality?: 'standard' | 'high';    // Default: 'high'
  videoCount?: 1 | 2;               // Default: 1 (2 for A/B testing)

  // === GOOGLE CREATIVE STUDIO FEATURES ===

  // Gemini Enhancement (300%+ quality boost)
  useGeminiEnhancement?: boolean;   // Default: false
  geminiEnhancementLevel?: 'basic' | 'standard' | 'cinematic';  // Default: 'standard'

  // Reference Images
  firstFrame?: string;              // Path to reference image (image-to-video)
  lastFrame?: string;               // Path for interpolation/video extension
  referenceImageDescription?: string;  // Description for Gemini context

  // Character Consistency
  characterDescription?: string;    // Character to preserve across segments

  // VEO3 Native Features
  enablePromptRewriting?: boolean;  // VEO3's built-in enhancement (Default: true)
  enableSoundGeneration?: boolean;  // Include native audio (Default: true)
  seed?: number;                    // For reproducibility
}
```

#### Response Format

```typescript
interface VideoGenerationResult {
  videos: Array<{
    videoPath: string;    // Local file path
    videoUrl?: string;    // GCS URL if applicable
    duration: number;     // Actual duration in seconds
    quality: string;      // '1080p'
  }>;
  prompt: string;         // Original or enhanced prompt
  enhancedPrompt?: string;  // If prompt rewriting was used
  success: boolean;
  error?: string;
  metadata?: {
    model: string;        // 'veo-3.0-generate-preview'
    generationTime: number;  // Milliseconds
    cost: number;         // Dollars
    videoCount: number;
  };
}
```

#### Example Usage
```typescript
const result = await veo3.generateVideoSegment({
  prompt: 'Professional explaining insurance benefits',
  duration: 8,
  aspectRatio: '16:9',

  // Enable Google Creative Studio features
  useGeminiEnhancement: true,
  geminiEnhancementLevel: 'cinematic',
  characterDescription: 'Professional woman, 30s, business casual',

  enablePromptRewriting: true,
  enableSoundGeneration: true,
  videoCount: 1
});

console.log(`Generated: ${result.videos[0].videoPath}`);
console.log(`Cost: $${result.metadata?.cost}`);
```

---

### Method: `generateSegmentSequence()`

**Generate multiple segments with character consistency**

#### Signature
```typescript
async generateSegmentSequence(
  basePrompt: string | VEO3JSONPrompt,
  sceneDescriptions: string[],
  options?: {
    firstFrame?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    preserveCharacter?: boolean;
    duration?: 4 | 6 | 8;
    enablePromptRewriting?: boolean;
  }
): Promise<VideoGenerationResult[]>
```

#### Example
```typescript
const segments = await veo3.generateSegmentSequence(
  'Professional insurance advisor',
  [
    'Greeting camera with smile',
    'Explaining policy benefits',
    'Showing savings chart',
    'Call to action'
  ],
  {
    aspectRatio: '16:9',
    preserveCharacter: true,
    duration: 8
  }
);

// Returns array of 4 VideoGenerationResult objects
```

---

### Method: `generateWithHookTesting()`

**A/B testing for viral optimization (snubroot methodology)**

#### Signature
```typescript
async generateWithHookTesting(
  baseRequest: VideoGenerationRequest,
  variationCount?: number  // Default: 3
): Promise<VideoGenerationResult[]>
```

#### Example
```typescript
const variations = await veo3.generateWithHookTesting({
  prompt: 'Professional talking about car insurance',
  duration: 8,
  aspectRatio: '9:16',  // TikTok/Instagram
  useGeminiEnhancement: true
}, 3);

// Returns 3 videos with different hook variations
// Test which performs best on social media
```

---

### Method: `testConnection()`

**Verify VEO3 authentication and API access**

#### Signature
```typescript
async testConnection(): Promise<boolean>
```

#### Example
```typescript
const isConnected = await veo3.testConnection();
if (!isConnected) {
  console.error('VEO3 connection failed - check credentials');
}
```

---

### Static Method: `getPlatformSettings()`

**Get platform-optimized video settings**

#### Signature
```typescript
static getPlatformSettings(
  platform: 'tiktok' | 'youtube' | 'instagram'
): Partial<VideoGenerationRequest>
```

#### Returns

```typescript
// TikTok
{
  aspectRatio: '9:16',
  duration: 8,
  enableSoundGeneration: true,
  videoCount: 2  // A/B testing
}

// YouTube
{
  aspectRatio: '16:9',
  duration: 8,
  enableSoundGeneration: true,
  videoCount: 1
}

// Instagram
{
  aspectRatio: '1:1',
  duration: 6,
  enableSoundGeneration: true,
  videoCount: 2
}
```

#### Example
```typescript
const tiktokSettings = VEO3Service.getPlatformSettings('tiktok');

const video = await veo3.generateVideoSegment({
  prompt: 'Viral hook about insurance savings',
  ...tiktokSettings  // Apply TikTok-optimized settings
});
```

---

### Static Method: `createViralStoryboard()`

**Generate viral content structure (snubroot pattern)**

#### Signature
```typescript
static createViralStoryboard(
  totalDuration?: number,      // Default: 56 seconds
  segmentDuration?: 4 | 6 | 8  // Default: 8 seconds
): string[]
```

#### Returns
```typescript
[
  "Opening hook: Attention-grabbing introduction with confident smile",
  "Problem setup: Present the challenge with concerned expression",
  "Solution preview: Excited demonstration with animated gestures",
  "Benefits showcase: Explaining advantages with clear movements",
  "Social proof: Testimonial delivery with trustworthy expression",
  "Call to action: Direct engagement request with pointing gesture",
  "Brand reinforcement: Professional closing with logo"
]
```

#### Example
```typescript
const storyboard = VEO3Service.createViralStoryboard(32, 8);
// Returns 4 scene descriptions for 32-second video

const videos = await veo3.generateSegmentSequence(
  'Insurance advisor character',
  storyboard,
  { preserveCharacter: true }
);
```

---

### Method: `getRateLimiterStatus()`

**Monitor rate limiting for UI feedback**

#### Signature
```typescript
getRateLimiterStatus(): {
  requestsInLastMinute: number;
  consecutiveErrors: number;
  nextRequestAvailable: number;
}
```

#### Example
```typescript
const status = veo3.getRateLimiterStatus();

if (status.requestsInLastMinute >= 10) {
  // Show UI warning: approaching rate limit
  console.warn(`Rate limit: ${status.requestsInLastMinute}/10 requests`);
}
```

---

## Gemini Enhancement Service

### Class: `GeminiPromptEnhancer`

**Location:** `src/services/geminiPromptEnhancer.ts`

#### Factory Functions
```typescript
// Create new instance
import { createGeminiPromptEnhancer } from '@viral/services/geminiPromptEnhancer';
const enhancer = createGeminiPromptEnhancer();

// Get singleton instance (recommended)
import { getGeminiPromptEnhancer } from '@viral/services/geminiPromptEnhancer';
const enhancer = getGeminiPromptEnhancer();
```

---

### Method: `enhancePrompt()`

**AI-powered prompt enhancement with 3 quality levels**

#### Signature
```typescript
async enhancePrompt(
  request: PromptEnhancementRequest
): Promise<PromptEnhancementResult>

interface PromptEnhancementRequest {
  basePrompt: string;                    // Required
  referenceImageDescription?: string;    // Optional image context
  characterDescription?: string;         // Optional character to preserve
  enhancementLevel?: 'basic' | 'standard' | 'cinematic';  // Default: 'standard'
  preserveIntent?: boolean;              // Default: true
}
```

#### Response Format
```typescript
interface PromptEnhancementResult {
  originalPrompt: string;
  enhancedPrompt: string;
  enhancementMethod: string;
  qualityImprovement: number;  // 0-10 scale
  generationTime: number;      // Milliseconds
}
```

#### Enhancement Levels

**1. Basic (+3.5/10 quality)**
- Quick improvements
- Adds: camera shot type, lighting, quality descriptor
- Cost: ~$0.0001 per prompt
- Use case: Fast generation, good enough quality

```typescript
const result = await enhancer.enhancePrompt({
  basePrompt: 'Person walking in city',
  enhancementLevel: 'basic'
});

// Result: "A wide shot of a person walking through a bustling city street,
// captured with natural daylight, photorealistic 8K quality"
```

**2. Standard (+6/10 quality)**
- Rewriter-style enhancement
- Professional filmmaking language
- Cost: ~$0.0003 per prompt
- Use case: Production-quality videos

```typescript
const result = await enhancer.enhancePrompt({
  basePrompt: 'Person walking in city',
  enhancementLevel: 'standard'
});

// Result: "A close-up tracking shot follows a professional woman as she
// navigates a bustling metropolitan street at dusk. Warm glow of neon
// signs reflects on wet pavement, creating streaks of vibrant color..."
```

**3. Cinematic (+8.5/10 quality)**
- Full Google Master Template
- 4-step cinematic engineering
- Cost: ~$0.0005 per prompt
- Use case: Premium content, viral videos

```typescript
const result = await enhancer.enhancePrompt({
  basePrompt: 'Professional explaining insurance',
  characterDescription: 'Woman, 30s, business casual',
  enhancementLevel: 'cinematic'
});

// Result: "A confident young professional woman in her 30s, with a warm,
// reassuring smile and dressed in smart business casual attire, stands in
// a modern, sunlit office. She gestures subtly with her hands as she
// articulately explains complex insurance benefits, making eye contact
// with the viewer. A shallow depth of field keeps her in sharp focus,
// while the background features a soft-focus contemporary office..."
```

---

### Method: `batchEnhance()`

**Enhance multiple prompts efficiently**

#### Signature
```typescript
async batchEnhance(
  prompts: string[],
  level?: 'basic' | 'standard' | 'cinematic'
): Promise<PromptEnhancementResult[]>
```

#### Example
```typescript
const prompts = [
  'Opening hook about insurance savings',
  'Explaining policy benefits',
  'Showing discount calculator',
  'Call to action'
];

const enhanced = await enhancer.batchEnhance(prompts, 'standard');

// Use enhanced prompts for video generation
for (const result of enhanced) {
  await veo3.generateVideoSegment({
    prompt: result.enhancedPrompt,
    duration: 8
  });
}
```

---

## Video Extension Service

### Class: `VideoExtensionManager`

**Location:** `src/utils/videoExtension.ts`

#### Constructor
```typescript
constructor(outputDir?: string)  // Default: './generated/frames'
```

---

### Method: `extractLastFrame()`

**Extract last frame for video chaining (Google Creative Studio pattern)**

#### Signature
```typescript
async extractLastFrame(
  videoPath: string
): Promise<FrameExtractionResult>

interface FrameExtractionResult {
  framePath: string;
  frameNumber: number;
  videoPath: string;
  extractionTime: number;
}
```

#### Example
```typescript
const manager = new VideoExtensionManager();

// Generate first video
const video1 = await veo3.generateVideoSegment({
  prompt: 'Professional introduction',
  duration: 8
});

// Extract last frame
const lastFrame = await manager.extractLastFrame(video1.videos[0].videoPath);

// Generate second video using last frame (seamless continuation)
const video2 = await veo3.generateVideoSegment({
  prompt: 'Continue speaking, gesture toward chart',
  duration: 8,
  firstFrame: lastFrame.framePath  // Seamless transition!
});
```

---

### Method: `extractFirstFrame()`

**Extract first frame for analysis or interpolation**

#### Signature
```typescript
async extractFirstFrame(
  videoPath: string
): Promise<FrameExtractionResult>
```

---

### Method: `createExtensionChain()`

**Automate chaining for multiple segments**

#### Signature
```typescript
async createExtensionChain(
  videoSegments: string[]
): Promise<VideoExtensionChain>

interface VideoExtensionChain {
  videos: string[];
  lastFrames: string[];
  totalDuration: number;
}
```

#### Example
```typescript
const videos = [
  './video1.mp4',
  './video2.mp4',
  './video3.mp4',
  './video4.mp4'
];

const chain = await manager.createExtensionChain(videos);

console.log(`Chain: ${chain.videos.length} videos`);
console.log(`Total duration: ${chain.totalDuration}s`);
console.log(`Last frames: ${chain.lastFrames.length}`);
```

---

### Method: `extractFramesAtTimestamps()`

**Extract multiple frames for thumbnails or analysis**

#### Signature
```typescript
async extractFramesAtTimestamps(
  videoPath: string,
  timestamps: number[]  // In seconds
): Promise<FrameExtractionResult[]>
```

#### Example
```typescript
const frames = await manager.extractFramesAtTimestamps(
  './video.mp4',
  [2, 4, 6, 8]  // Extract frames at 2s, 4s, 6s, 8s
);

// Use for thumbnails, preview gallery, etc.
```

---

### Helper Functions

**Quick extraction without class instantiation**

```typescript
import { extractLastFrame, createVideoChain } from '@viral/utils/videoExtension';

// Extract last frame
const framePath = await extractLastFrame('./video.mp4');

// Create video chain
const chain = await createVideoChain([
  './video1.mp4',
  './video2.mp4'
]);
```

---

## Parameter Reference

### VEO3JSONPrompt Structure

**Advanced JSON prompting for 300%+ quality improvement**

```typescript
interface VEO3JSONPrompt {
  prompt: string;
  negative_prompt?: string;

  timing: {
    "0-2s": string;  // Hook/setup phase
    "2-6s": string;  // Main action phase
    "6-8s": string;  // Conclusion phase
  };

  config: {
    duration_seconds: 4 | 6 | 8;
    aspect_ratio: string;
    resolution: '720p' | '1080p';

    camera: {
      motion: string;
      angle: string;
      lens_type: string;
      position: string;
      movements?: string[];
    };

    lighting: {
      mood: string;
      time_of_day?: string;
      consistency?: string;
      enhancement?: string;
    };

    character: {
      description: string;
      action: string;
      preservation?: string;
      micro_expressions?: string[];
      movement_quality?: string;
    };

    environment: {
      location: string;
      atmosphere: string;
      interaction_elements?: string[];
      spatial_awareness?: string;
    };

    audio: {
      primary: string;
      ambient: string[];
      quality: string;
      lip_sync?: string;
      music?: string;
      sound_effects?: string[];
      dialogue_timing?: string;
    };

    technical: {
      skin_realism: string;
      movement_physics: string;
      environmental_integration: string;
      quality_target: string;
    };
  };
}
```

#### Example JSON Prompt
```typescript
const jsonPrompt: VEO3JSONPrompt = {
  prompt: 'Professional insurance advisor explaining benefits',
  negative_prompt: 'blurry, low-resolution, artificial, fake',

  timing: {
    "0-2s": "Confident introduction with eye contact and smile",
    "2-6s": "Explaining benefits while gesturing naturally",
    "6-8s": "Professional closing with call-to-action"
  },

  config: {
    duration_seconds: 8,
    aspect_ratio: "16:9",
    resolution: "1080p",

    camera: {
      motion: "smooth professional tracking shot",
      angle: "eye-level professional angle",
      lens_type: "50mm professional lens",
      position: "professional camera operator position"
    },

    lighting: {
      mood: "professional natural lighting",
      time_of_day: "golden hour",
      consistency: "maintain throughout"
    },

    character: {
      description: "Professional woman, 30s, business casual",
      action: "explaining insurance benefits to camera",
      preservation: "maintain exact facial features"
    },

    environment: {
      location: "modern office",
      atmosphere: "professional and engaging"
    },

    audio: {
      primary: "Clear dialogue about insurance",
      ambient: ["office ambience", "subtle background"],
      quality: "professional broadcast quality"
    },

    technical: {
      skin_realism: "visible skin pores, natural asymmetry",
      movement_physics: "natural movement with realistic physics",
      environmental_integration: "complete presence with natural shadows",
      quality_target: "ultra-photorealistic cinema-grade"
    }
  }
};
```

---

## Cost & Performance

### Gemini Enhancement Costs

| Level | Cost per Prompt | Quality Gain | Generation Time | Use Case |
|-------|----------------|--------------|-----------------|----------|
| **Basic** | $0.0001 | +3.5/10 | ~200ms | Fast generation |
| **Standard** | $0.0003 | +6.0/10 | ~500ms | Production quality |
| **Cinematic** | $0.0005 | +8.5/10 | ~800ms | Premium content |

**Example:** 100 prompts with cinematic enhancement = $0.05 total

---

### VEO3 Video Generation Costs

**Base Pricing:** ~$0.75 per second per video

| Duration | Cost per Video | 2 Videos (A/B) | With Gemini |
|----------|---------------|----------------|-------------|
| **4 seconds** | $3.00 | $6.00 | +$0.0005 |
| **6 seconds** | $4.50 | $9.00 | +$0.0005 |
| **8 seconds** | $6.00 | $12.00 | +$0.0005 |

**Platform Examples:**
```typescript
// TikTok video (9:16, 8s, 2 variations for A/B testing)
Cost: $12.00 + $0.0005 = $12.0005

// YouTube video (16:9, 8s, single video)
Cost: $6.00 + $0.0005 = $6.0005

// Instagram video (1:1, 6s, 2 variations)
Cost: $9.00 + $0.0005 = $9.0005
```

---

### Video Extension Costs

**Frame Extraction:** FREE (FFmpeg)
**Chaining Videos:** Same cost as individual videos

**Example 56-second video:**
- 7 segments × 8 seconds = 56 seconds
- 7 × $6.00 = $42.00 total
- Frame extraction: $0 (automated with FFmpeg)
- Gemini enhancement (optional): +$0.0035
- **Total:** $42.00 - $42.0035

---

### Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Gemini Enhancement (basic) | ~200ms | Near-instant |
| Gemini Enhancement (cinematic) | ~800ms | Still very fast |
| VEO3 Generation (4s video) | ~2-3 min | Long-running operation |
| VEO3 Generation (8s video) | ~3-5 min | Polling-based |
| Frame Extraction | ~500ms | FFmpeg processing |
| Video Chain (4 segments) | ~12-20 min | Sequential generation |

---

### Credit Consumption Examples

**$1,000 Vertex AI Credits:**

**Scenario 1: TikTok Viral Campaign**
- 100 videos × 8 seconds × $6.00 = $600
- 100 prompts × cinematic = $0.05
- **Total:** $600.05 (166 videos remaining)

**Scenario 2: Mixed Platform**
- 50 TikTok (8s) = $300
- 50 YouTube (8s) = $300
- 50 Instagram (6s) = $225
- Gemini enhancement = $0.075
- **Total:** $825.075 (remaining $174.92)

**Scenario 3: Long-Form Content**
- 20 × 56-second videos = 20 × $42 = $840
- Gemini + chaining = $1
- **Total:** $841 (remaining $159)

---

## Code Examples

### Example 1: Simple Video Generation

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

const result = await veo3.generateVideoSegment({
  prompt: 'Professional talking about car insurance savings',
  duration: 8,
  aspectRatio: '16:9',
  enableSoundGeneration: true
});

console.log(`Video: ${result.videos[0].videoPath}`);
console.log(`Cost: $${result.metadata?.cost}`);
```

---

### Example 2: Enhanced Video with Gemini

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

const result = await veo3.generateVideoSegment({
  prompt: 'Insurance advisor explaining policy benefits',
  duration: 8,
  aspectRatio: '16:9',

  // Enable Gemini enhancement
  useGeminiEnhancement: true,
  geminiEnhancementLevel: 'cinematic',
  characterDescription: 'Professional woman, 30s, trustworthy',

  enablePromptRewriting: true,
  enableSoundGeneration: true
});
```

---

### Example 3: Video Chaining for Long Content

```typescript
import { VEO3Service } from './src/services/veo3Service';
import { VideoExtensionManager } from './src/utils/videoExtension';

const veo3 = new VEO3Service();
const extender = new VideoExtensionManager();

// Generate first segment
const video1 = await veo3.generateVideoSegment({
  prompt: 'Introducing insurance comparison',
  duration: 8
});

// Extract last frame
const frame1 = await extender.extractLastFrame(video1.videos[0].videoPath);

// Generate second segment (seamless continuation)
const video2 = await veo3.generateVideoSegment({
  prompt: 'Showing price comparison chart',
  duration: 8,
  firstFrame: frame1.framePath,
  characterDescription: 'Same advisor, maintain appearance'
});

// Extract last frame for third segment
const frame2 = await extender.extractLastFrame(video2.videos[0].videoPath);

// Generate third segment
const video3 = await veo3.generateVideoSegment({
  prompt: 'Call to action and contact info',
  duration: 8,
  firstFrame: frame2.framePath,
  characterDescription: 'Same advisor, maintain appearance'
});

// Create metadata chain
const chain = await extender.createExtensionChain([
  video1.videos[0].videoPath,
  video2.videos[0].videoPath,
  video3.videos[0].videoPath
]);

console.log(`Total duration: ${chain.totalDuration}s`);
```

---

### Example 4: Platform-Optimized Generation

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

// TikTok-optimized video
const tiktokSettings = VEO3Service.getPlatformSettings('tiktok');
const tiktokVideo = await veo3.generateVideoSegment({
  prompt: 'Viral hook about insurance savings',
  ...tiktokSettings,
  useGeminiEnhancement: true,
  geminiEnhancementLevel: 'cinematic'
});

// YouTube-optimized video
const youtubeSettings = VEO3Service.getPlatformSettings('youtube');
const youtubeVideo = await veo3.generateVideoSegment({
  prompt: 'Detailed explanation of policy benefits',
  ...youtubeSettings,
  useGeminiEnhancement: true,
  geminiEnhancementLevel: 'standard'
});
```

---

### Example 5: A/B Testing Hooks

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

const variations = await veo3.generateWithHookTesting({
  prompt: 'Why car insurance is expensive and how to save',
  duration: 8,
  aspectRatio: '9:16',
  useGeminiEnhancement: true,
  geminiEnhancementLevel: 'standard'
}, 3);

// Returns 3 videos with different opening hooks:
// 1. "Professional confident introduction with direct eye contact"
// 2. "Attention-grabbing opening with slight forward lean"
// 3. "Warm welcoming approach with friendly gesture"

// Test all 3 on TikTok, scale the winner
```

---

### Example 6: Viral 56-Second Story

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

// Get viral storyboard structure
const storyboard = VEO3Service.createViralStoryboard(56, 8);
// Returns 7 scene descriptions

// Generate all segments with character consistency
const segments = await veo3.generateSegmentSequence(
  'Professional insurance advisor, friendly and trustworthy',
  storyboard,
  {
    aspectRatio: '9:16',
    preserveCharacter: true,
    duration: 8,
    enablePromptRewriting: true
  }
);

// All 7 videos will have seamless character consistency
```

---

### Example 7: Interpolation Mode

```typescript
import { VEO3Service } from './src/services/veo3Service';

const veo3 = new VEO3Service();

// Generate smooth transition between two poses
const transition = await veo3.generateVideoSegment({
  prompt: 'Smooth transition from sitting to standing',
  duration: 4,
  firstFrame: './advisor_sitting.png',
  lastFrame: './advisor_standing.png',  // VEO3 interpolates between them
  characterDescription: 'Same advisor, maintain exact appearance'
});

// Result: Perfectly smooth 4-second transition
```

---

## Integration Requirements

### Environment Variables

**Required for viral engine backend:**

```bash
# Google Cloud Platform
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Gemini API (for enhancement)
GEMINI_API_KEY=your-gemini-api-key
```

---

### Authentication Flow

1. **VEO3 Service** uses service account JSON (Vertex AI authentication)
2. **Gemini Enhancer** uses API key (Gemini Developer API)
3. **Video Extension** uses local FFmpeg (no authentication)

**Setup:**
```typescript
// 1. Ensure environment variables are set
// 2. Initialize services
const veo3 = new VEO3Service();
const enhancer = getGeminiPromptEnhancer();

// 3. Test connection
const isConnected = await veo3.testConnection();
if (!isConnected) {
  throw new Error('VEO3 authentication failed');
}
```

---

### Dependencies

**Required npm packages:**

```json
{
  "@google/genai": "^1.x.x",
  "google-auth-library": "^9.x.x",
  "@ffmpeg-installer/ffmpeg": "^1.x.x",
  "@ffprobe-installer/ffprobe": "^1.x.x"
}
```

**System requirements:**
- FFmpeg (installed via npm package)
- Node.js 18+
- TypeScript 5+

---

### Rate Limiting

**VEO3 Rate Limits:**
- **10 requests per minute** (enforced by RateLimiter)
- Automatic retry with exponential backoff
- Monitor with `getRateLimiterStatus()`

**Handling in UI:**
```typescript
const status = veo3.getRateLimiterStatus();

if (status.requestsInLastMinute >= 9) {
  // Show warning in UI
  showWarning('Approaching rate limit, slowing down...');
}

if (status.nextRequestAvailable > Date.now()) {
  const waitTime = status.nextRequestAvailable - Date.now();
  showWarning(`Rate limited, retry in ${waitTime}ms`);
}
```

---

### Error Handling

**All methods return structured errors:**

```typescript
interface VideoGenerationResult {
  success: boolean;
  error?: string;
  // ... other fields
}

// Usage
const result = await veo3.generateVideoSegment({ ... });

if (!result.success) {
  console.error(`Generation failed: ${result.error}`);
  // Handle error in UI
  showError(result.error);
} else {
  // Process successful result
  displayVideo(result.videos[0].videoPath);
}
```

**Common errors:**
- `"GCP_PROJECT_ID environment variable is required for VEO3"`
- `"GEMINI_API_KEY environment variable is required"`
- `"VEO3 API request failed: 401 Unauthorized"`
- `"Video generation timed out after 10 minutes"`
- `"Failed to extract last frame: [FFmpeg error]"`

---

### UI Integration Pattern

**Recommended flow for omega-platform:**

```typescript
// 1. User submits generation request from UI
const uiRequest = {
  prompt: userInput.prompt,
  platform: userInput.selectedPlatform,
  enhancementLevel: userInput.qualityLevel
};

// 2. Map to backend request
const platformSettings = VEO3Service.getPlatformSettings(uiRequest.platform);

const backendRequest = {
  prompt: uiRequest.prompt,
  ...platformSettings,
  useGeminiEnhancement: true,
  geminiEnhancementLevel: uiRequest.enhancementLevel,
  characterDescription: userInput.character
};

// 3. Generate video
const result = await veo3.generateVideoSegment(backendRequest);

// 4. Update UI
if (result.success) {
  updateUI({
    status: 'complete',
    videoUrl: result.videos[0].videoPath,
    cost: result.metadata?.cost,
    duration: result.videos[0].duration
  });
} else {
  updateUI({
    status: 'error',
    message: result.error
  });
}
```

---

### Polling Long Operations

**VEO3 uses long-running operations (3-10 minutes)**

**Pattern for UI updates:**
```typescript
// Show progress indicator
showProgress('Generating video...');

const result = await veo3.generateVideoSegment({
  prompt: 'Professional talking to camera',
  duration: 8
});

// Hide progress, show result
hideProgress();
displayResult(result);
```

**For multiple segments, show granular progress:**
```typescript
const storyboard = VEO3Service.createViralStoryboard(32, 8);

for (let i = 0; i < storyboard.length; i++) {
  updateProgress(`Generating segment ${i + 1}/${storyboard.length}...`);

  const segment = await veo3.generateVideoSegment({
    prompt: storyboard[i],
    duration: 8
  });

  updateSegmentComplete(i, segment.videos[0].videoPath);
}

showComplete('All segments generated!');
```

---

## Advanced Features

### Snubroot Timing Methodology

**VEO3 uses advanced timing structure for viral optimization:**

```typescript
// Timing automatically applied to all prompts
timing: {
  "0-2s": "Hook: Attention-grabbing introduction",
  "2-6s": "Main action: Core content delivery",
  "6-8s": "Conclusion: Call-to-action"
}
```

**Critical rules (auto-enforced):**
1. **No ALL CAPS dialogue** - VEO3 spells out capital letters
2. **12-15 words max dialogue** - For 8-second segments
3. **ONE subtle motion per scene** - Prevents character drift
4. **Camera position syntax** - "(that's where the camera is)"

---

### Character Consistency Engine

**Integrated into VEO3Service:**

```typescript
// Pass character description
const video1 = await veo3.generateVideoSegment({
  prompt: 'Greeting camera',
  characterDescription: 'Professional woman, 30s, confident smile'
});

// Character automatically preserved in next segment
const video2 = await veo3.generateVideoSegment({
  prompt: 'Explaining benefits',
  characterDescription: 'Professional woman, 30s, confident smile'  // Same description
});

// Result: Perfect character consistency across all segments
```

**Preservation instructions (auto-added):**
- "Maintain exact facial features"
- "Preserve expressions and identity markers"
- "Keep character appearance perfectly consistent"

---

### JSON Prompting for Quality

**VEO3 auto-converts simple prompts to JSON for 300%+ quality boost:**

```typescript
// You provide simple prompt
const result = await veo3.generateVideoSegment({
  prompt: 'Person walking in city'
});

// VEO3 internally converts to:
{
  prompt: 'Person walking in city',
  timing: { ... },
  config: {
    camera: { motion: 'smooth tracking', ... },
    lighting: { mood: 'natural daylight', ... },
    technical: { skin_realism: 'visible pores', ... }
  }
}

// Result: Cinema-quality video from basic prompt
```

---

## Testing & Validation

### Test File: `test-google-veo3-features.ts`

**Comprehensive test suite covering all features:**

```bash
# Run all tests
npx tsx test-google-veo3-features.ts

# Tests:
# ✅ Gemini Enhancement (basic, standard, cinematic)
# ✅ VEO3 with Gemini integration
# ✅ Last frame extraction
# ✅ Video extension/chaining
# ✅ Extension chain metadata
# ✅ Interpolation mode structure
```

**Example output:**
```
🧪 Testing Google VEO3 Features Integration

📝 TEST 1: Gemini Basic Prompt Enhancement
Original: A person walking in a city
Enhanced: A wide shot of a person walking through a bustling city street...
Quality improvement: +3.5/10

🎬 TEST 3: Gemini Cinematic Enhancement (Master Template)
Original: Professional business person explaining insurance benefits
Enhanced: A confident young professional woman in her 30s, with a warm...
Quality improvement: +8.5/10

🎥 TEST 4: VEO3 Video with Gemini Enhancement
✅ Video 1 generated!
   Path: ./generated/veo3/veo3_video_1733123456789_0.mp4
   Duration: 4s
   Cost: $3.00

🖼️ TEST 5: Extract Last Frame for Extension
✅ Last frame extracted!
   Frame path: ./generated/frames/veo3_video_1733123456789_0_last_frame.png

🔗 TEST 6: Video Extension (Seamless Chaining)
✅ Video 2 generated (chained)!
   Total chain duration: 8s

✅ ALL GOOGLE FEATURES SUCCESSFULLY INTEGRATED!
```

---

## Contract Summary

### What Omega-Platform UI Sends:

```typescript
{
  prompt: string;
  platform: 'tiktok' | 'youtube' | 'instagram';
  enhancementLevel: 'basic' | 'standard' | 'cinematic';
  characterDescription?: string;
  chainCount?: number;  // For multi-segment videos
}
```

### What Viral Engine Returns:

```typescript
{
  success: boolean;
  videos: Array<{
    videoPath: string;
    duration: number;
    quality: string;
  }>;
  cost: number;
  generationTime: number;
  error?: string;
}
```

### API Endpoints (for omega-service.js):

```typescript
// Single video generation
POST /api/generate-video
Body: { prompt, platform, enhancementLevel, character }
Returns: VideoGenerationResult

// Video chain generation
POST /api/generate-chain
Body: { storyboard[], platform, character }
Returns: VideoGenerationResult[]

// Status check
GET /api/status/:operationId
Returns: { status, progress, result }
```

---

**Sign off as SmokeDev 🚬**
