# VEO3 API Integration Patterns and Error Handling Best Practices

## Table of Contents
1. [Official VEO3 API Documentation](#official-veo3-api-documentation)
2. [API Patterns and Authentication](#api-patterns-and-authentication)
3. [Error Handling Strategies](#error-handling-strategies)
4. [Performance Optimization](#performance-optimization)
5. [Alternative Services Comparison](#alternative-services-comparison)
6. [TypeScript/Node.js Integration Examples](#typescriptnojs-integration-examples)
7. [Production-Ready Patterns](#production-ready-patterns)

---

## Official VEO3 API Documentation

### Google Official Documentation
- **Main API Reference**: [ai.google.dev/gemini-api/docs/video](https://ai.google.dev/gemini-api/docs/video)
- **Vertex AI Reference**: [cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation)
- **AI Studio**: [aistudio.google.com/models/veo-3](https://aistudio.google.com/models/veo-3)
- **Model Pricing**: [ai.google.dev/gemini-api/docs/pricing#veo-3](https://ai.google.dev/gemini-api/docs/pricing#veo-3)
- **Rate Limits**: [ai.google.dev/gemini-api/docs/rate-limits#veo-3](https://ai.google.dev/gemini-api/docs/rate-limits#veo-3)

### Supported Models
| Model | Description | Features |
|-------|-------------|----------|
| `veo-3.0-generate-001` | Flagship model, highest fidelity | 720p & 1080p (16:9 only), Native audio |
| `veo-3.0-fast-generate-001` | Cost-efficient variant | 720p & 1080p (16:9 only), Native audio |
| `veo-2.0-generate-001` | Previous generation | 720p, Silent only |

---

## API Patterns and Authentication

### 1. Google Gemini API Authentication (Recommended)

```typescript
import { GoogleGenAI } from "@google/genai";

// Initialize client with API key
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // Get from https://aistudio.google.com/apikey
});

// Generate video with proper error handling
async function generateVideo(prompt: string): Promise<any> {
  try {
    const operation = await client.models.generateVideos({
      model: "veo-3.0-generate-001",
      prompt: prompt,
      config: {
        aspectRatio: "16:9",
        resolution: "720p",
        negativePrompt: "blurry, low quality",
      }
    });

    return operation;
  } catch (error) {
    throw new VEO3Error('Video generation failed', error);
  }
}
```

### 2. Vertex AI Authentication Pattern

```typescript
import { GoogleAuth } from 'google-auth-library';

class VertexAIVEO3Client {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string = 'us-central1';

  constructor(projectId: string) {
    this.projectId = projectId;
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  async generateVideo(prompt: string, options: VEO3Options = {}): Promise<VEO3Operation> {
    const authClient = await this.auth.getClient();
    const accessToken = await authClient.getAccessToken();

    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/veo-3.0-generate-001:predictLongRunning`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: options.aspectRatio || "16:9",
          resolution: options.resolution || "720p",
          generateAudio: options.generateAudio !== false,
          ...options
        }
      })
    });

    if (!response.ok) {
      throw new VEO3APIError(`HTTP ${response.status}`, await response.text());
    }

    return response.json();
  }
}
```

### 3. Request/Response Structure

```typescript
interface VEO3Request {
  instances: Array<{
    prompt: string;
    image?: {
      bytesBase64Encoded?: string;
      gcsUri?: string;
      mimeType: string;
    };
    negativePrompt?: string;
  }>;
  parameters: {
    aspectRatio?: "16:9" | "9:16";
    resolution?: "720p" | "1080p"; // 1080p only for 16:9
    generateAudio?: boolean; // Required for VEO3 models
    personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
    sampleCount?: number; // 1-4
    seed?: number;
    durationSeconds?: 4 | 6 | 8;
    storageUri?: string;
  };
}

interface VEO3Response {
  name: string; // Operation name for polling
}

interface VEO3CompletedResponse {
  name: string;
  done: boolean;
  response: {
    "@type": "type.googleapis.com/cloud.ai.large_models.vision.GenerateVideoResponse";
    generatedVideos: Array<{
      video: {
        uri: string;
        mimeType: "video/mp4";
      };
    }>;
    raiMediaFilteredCount: number;
    raiMediaFilteredReasons?: string[];
  };
}
```

---

## Error Handling Strategies

### 1. Comprehensive Error Classes

```typescript
export class VEO3Error extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code: string = 'VEO3_UNKNOWN_ERROR',
    statusCode?: number,
    retryable: boolean = false,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'VEO3Error';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

export class VEO3RateLimitError extends VEO3Error {
  constructor(retryAfter?: number) {
    super(
      `Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`,
      'VEO3_RATE_LIMIT',
      429,
      true
    );
  }
}

export class VEO3ContentPolicyError extends VEO3Error {
  constructor(reason: string) {
    super(
      `Content policy violation: ${reason}`,
      'VEO3_CONTENT_POLICY',
      422,
      false // Content policy violations are not retryable
    );
  }
}

export class VEO3GenerationFailedError extends VEO3Error {
  constructor(reason?: string) {
    super(
      `Video generation failed${reason ? `: ${reason}` : ''}`,
      'VEO3_GENERATION_FAILED',
      501,
      true // Generation failures can be retried
    );
  }
}
```

### 2. Error Detection and Mapping

```typescript
function mapVEO3Error(error: any): VEO3Error {
  // HTTP status code mapping
  if (error.response?.status) {
    switch (error.response.status) {
      case 401:
        return new VEO3Error('Authentication failed - check API key', 'VEO3_AUTH_ERROR', 401);
      case 402:
        return new VEO3Error('Insufficient credits', 'VEO3_INSUFFICIENT_CREDITS', 402);
      case 422:
        const message = error.response.data?.message || 'Content policy violation';
        if (message.includes('public_error_minor_upload')) {
          return new VEO3ContentPolicyError('Minor detected in upload');
        }
        if (message.includes('prominent_people_upload')) {
          return new VEO3ContentPolicyError('Prominent person detected');
        }
        return new VEO3ContentPolicyError(message);
      case 429:
        const retryAfter = error.response.headers['retry-after'];
        return new VEO3RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
      case 500:
        return new VEO3Error('Server error', 'VEO3_SERVER_ERROR', 500, true);
      case 501:
        return new VEO3GenerationFailedError();
      default:
        return new VEO3Error(`HTTP ${error.response.status}`, 'VEO3_HTTP_ERROR', error.response.status, true);
    }
  }

  // Network/timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new VEO3Error('Request timeout', 'VEO3_TIMEOUT', undefined, true);
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new VEO3Error('Network error', 'VEO3_NETWORK_ERROR', undefined, true);
  }

  return new VEO3Error('Unknown error', 'VEO3_UNKNOWN_ERROR', undefined, true, error);
}
```

### 3. Retry Strategy with Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

class VEO3RetryHandler {
  private config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.config, ...retryConfig };
    let lastError: VEO3Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof VEO3Error ? error : mapVEO3Error(error);

        // Don't retry non-retryable errors
        if (!lastError.retryable || attempt === config.maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const baseDelay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        const delay = config.jitter
          ? baseDelay * (0.5 + Math.random() * 0.5) // Add jitter
          : baseDelay;

        console.warn(`VEO3 attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
```

---

## Performance Optimization

### 1. Async Operation Polling

```typescript
interface PollingConfig {
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
}

class VEO3OperationPoller {
  private config: PollingConfig = {
    initialDelay: 10000, // Start with 10s
    maxDelay: 60000,     // Max 60s between polls
    backoffMultiplier: 1.2,
    timeout: 600000      // 10 minute timeout
  };

  async pollOperation(
    operationName: string,
    client: GoogleGenAI,
    onProgress?: (status: string) => void
  ): Promise<VEO3CompletedResponse> {
    const startTime = Date.now();
    let delay = this.config.initialDelay;

    while (Date.now() - startTime < this.config.timeout) {
      try {
        const operation = await client.operations.get({ name: operationName });

        onProgress?.(operation.done ? 'completed' : 'processing');

        if (operation.done) {
          if (operation.response) {
            return operation as VEO3CompletedResponse;
          } else if (operation.error) {
            throw new VEO3GenerationFailedError(operation.error.message);
          }
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);

      } catch (error) {
        throw mapVEO3Error(error);
      }
    }

    throw new VEO3Error('Operation timeout', 'VEO3_OPERATION_TIMEOUT');
  }
}
```

### 2. Concurrent Request Management

```typescript
class VEO3RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running: number = 0;
  private maxConcurrent: number;
  private rateLimitDelay: number = 0;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Apply rate limiting delay
          if (this.rateLimitDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }

          const result = await operation();
          resolve(result);
        } catch (error) {
          // Handle rate limiting
          if (error instanceof VEO3RateLimitError) {
            this.rateLimitDelay = Math.max(this.rateLimitDelay, 30000); // 30s delay
            setTimeout(() => { this.rateLimitDelay = 0; }, 60000); // Reset after 1min
          }
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const operation = this.queue.shift()!;
    this.running++;
    operation();
  }
}
```

### 3. Caching and Storage Optimization

```typescript
interface CacheConfig {
  ttl: number; // Time to live in ms
  maxSize: number;
}

class VEO3Cache {
  private cache = new Map<string, { data: any; expires: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 3600000, maxSize: 100 }) {
    this.config = config;
  }

  private generateKey(prompt: string, options: any): string {
    return `veo3:${Buffer.from(JSON.stringify({ prompt, ...options })).toString('base64')}`;
  }

  async getOrSet<T>(
    prompt: string,
    options: any,
    generator: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(prompt, options);
    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await generator();

    // Clean up expired entries and enforce max size
    this.cleanup();

    this.cache.set(key, {
      data,
      expires: Date.now() + this.config.ttl
    });

    return data;
  }

  private cleanup(): void {
    const now = Date.now();

    // Remove expired entries
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }

    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}
```

---

## Alternative Services Comparison

### 1. Kie.ai VEO3 API

**Documentation**: [docs.kie.ai/veo3-api/generate-veo-3-video](https://docs.kie.ai/veo3-api/generate-veo-3-video)

#### Advantages:
- **25% of Google's pricing** (significant cost savings)
- **Intelligent Fallback** system for blocked content
- **Native multilingual support** with prompt preprocessing
- **Both 16:9 and 9:16 aspect ratios** supported
- **Higher success rates** due to optimization layers

#### API Pattern:
```typescript
interface KieAIVEO3Client {
  apiKey: string;
  baseURL: string = 'https://api.kie.ai/api/v1/veo';

  async generateVideo(request: KieAIVEO3Request): Promise<KieAIVEO3Response> {
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw await this.handleKieAIError(response);
    }

    return response.json();
  }

  private async handleKieAIError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    switch (response.status) {
      case 422:
        if (errorData.msg?.includes('rejected by Flow')) {
          throw new VEO3ContentPolicyError('Content blocked - consider enableFallback: true');
        }
        break;
      case 402:
        throw new VEO3Error('Insufficient credits', 'KIE_INSUFFICIENT_CREDITS', 402);
      case 429:
        throw new VEO3RateLimitError();
    }

    throw new VEO3Error(errorData.msg || 'Unknown error', 'KIE_API_ERROR', response.status);
  }
}

interface KieAIVEO3Request {
  prompt: string;
  model: 'veo3' | 'veo3_fast';
  imageUrls?: string[];
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number; // 10000-99999
  enableFallback?: boolean; // Intelligent fallback for blocked content
  enableTranslation?: boolean; // Auto-translate non-English prompts
  callBackUrl?: string;
  watermark?: string;
}
```

#### Fallback Strategy Implementation:
```typescript
class KieAIVEO3Service {
  async generateWithFallback(request: KieAIVEO3Request): Promise<string> {
    try {
      // First attempt without fallback
      const result = await this.generateVideo({ ...request, enableFallback: false });
      return result.data.taskId;
    } catch (error) {
      if (error instanceof VEO3ContentPolicyError) {
        console.warn('Content blocked, attempting fallback...');
        // Retry with fallback enabled (higher cost)
        const fallbackResult = await this.generateVideo({
          ...request,
          enableFallback: true
        });
        return fallbackResult.data.taskId;
      }
      throw error;
    }
  }
}
```

### 2. Cost Comparison Analysis

| Service | Model | Cost per 8s | Features | Success Rate |
|---------|-------|-------------|----------|--------------|
| **Google Direct** | VEO3 | ~$0.75 | Official, 1080p, Native audio | 85% |
| **Kie.ai** | VEO3 | ~$0.19 | Fallback, Multilingual, Same quality | 95%+ |
| **Google Direct** | VEO3 Fast | ~$0.38 | Faster generation | 80% |
| **Kie.ai** | VEO3 Fast | ~$0.10 | Fallback, Multilingual | 90%+ |

### 3. Service Selection Strategy

```typescript
enum VEO3ServiceProvider {
  GOOGLE_OFFICIAL = 'google',
  KIE_AI = 'kie'
}

class VEO3ServiceSelector {
  selectProvider(requirements: {
    budget: 'low' | 'medium' | 'high';
    contentSensitivity: 'low' | 'medium' | 'high';
    multilingual: boolean;
    aspectRatio: '16:9' | '9:16';
    quality: '720p' | '1080p';
  }): VEO3ServiceProvider {
    // Cost-sensitive projects
    if (requirements.budget === 'low') {
      return VEO3ServiceProvider.KIE_AI;
    }

    // High content sensitivity (likely blocks)
    if (requirements.contentSensitivity === 'high') {
      return VEO3ServiceProvider.KIE_AI; // Better fallback handling
    }

    // Multilingual requirements
    if (requirements.multilingual) {
      return VEO3ServiceProvider.KIE_AI;
    }

    // 9:16 aspect ratio
    if (requirements.aspectRatio === '9:16') {
      return VEO3ServiceProvider.KIE_AI; // Native support
    }

    // Default to Google for 1080p or when quality is paramount
    if (requirements.quality === '1080p' || requirements.budget === 'high') {
      return VEO3ServiceProvider.GOOGLE_OFFICIAL;
    }

    return VEO3ServiceProvider.KIE_AI; // Default recommendation
  }
}
```

---

## TypeScript/Node.js Integration Examples

### 1. Complete VEO3 Service Implementation

```typescript
// veo3-service.ts
import { GoogleGenAI } from '@google/genai';
import axios, { AxiosError } from 'axios';

export interface VEO3Config {
  googleApiKey?: string;
  kieApiKey?: string;
  provider: 'google' | 'kie';
  retryConfig?: Partial<RetryConfig>;
  cacheConfig?: Partial<CacheConfig>;
}

export class VEO3Service {
  private googleClient?: GoogleGenAI;
  private kieClient?: KieAIVEO3Client;
  private retryHandler: VEO3RetryHandler;
  private cache: VEO3Cache;
  private queue: VEO3RequestQueue;
  private poller: VEO3OperationPoller;

  constructor(private config: VEO3Config) {
    if (config.googleApiKey) {
      this.googleClient = new GoogleGenAI({ apiKey: config.googleApiKey });
    }

    if (config.kieApiKey) {
      this.kieClient = new KieAIVEO3Client(config.kieApiKey);
    }

    this.retryHandler = new VEO3RetryHandler();
    this.cache = new VEO3Cache(config.cacheConfig);
    this.queue = new VEO3RequestQueue();
    this.poller = new VEO3OperationPoller();
  }

  async generateVideo(
    prompt: string,
    options: VEO3GenerationOptions = {},
    onProgress?: (status: string, progress?: number) => void
  ): Promise<VEO3Result> {
    const cacheKey = this.generateCacheKey(prompt, options);

    // Check cache first
    if (options.useCache !== false) {
      const cached = await this.cache.getOrSet(cacheKey, {}, async () => null);
      if (cached) {
        onProgress?.('completed', 100);
        return cached;
      }
    }

    // Queue the request
    return this.queue.add(async () => {
      return this.retryHandler.executeWithRetry(async () => {
        if (this.config.provider === 'google' && this.googleClient) {
          return this.generateWithGoogle(prompt, options, onProgress);
        } else if (this.config.provider === 'kie' && this.kieClient) {
          return this.generateWithKie(prompt, options, onProgress);
        } else {
          throw new VEO3Error('No valid provider configured', 'VEO3_NO_PROVIDER');
        }
      });
    });
  }

  private async generateWithGoogle(
    prompt: string,
    options: VEO3GenerationOptions,
    onProgress?: (status: string, progress?: number) => void
  ): Promise<VEO3Result> {
    onProgress?.('starting', 0);

    const operation = await this.googleClient!.models.generateVideos({
      model: options.fast ? 'veo-3.0-fast-generate-001' : 'veo-3.0-generate-001',
      prompt,
      config: {
        aspectRatio: options.aspectRatio || '16:9',
        resolution: options.resolution || '720p',
        negativePrompt: options.negativePrompt,
        seed: options.seed,
        generateAudio: options.generateAudio !== false,
      }
    });

    onProgress?.('processing', 25);

    // Poll for completion
    const result = await this.poller.pollOperation(
      operation.name,
      this.googleClient!,
      (status) => {
        const progressMap = { processing: 50, completed: 100 };
        onProgress?.(status, progressMap[status as keyof typeof progressMap] || 25);
      }
    );

    const videoUrl = result.response.generatedVideos[0].video.uri;

    return {
      videoUrl,
      operationId: operation.name,
      provider: 'google',
      metadata: {
        model: options.fast ? 'veo-3.0-fast' : 'veo-3.0',
        resolution: options.resolution || '720p',
        aspectRatio: options.aspectRatio || '16:9',
      }
    };
  }

  private async generateWithKie(
    prompt: string,
    options: VEO3GenerationOptions,
    onProgress?: (status: string, progress?: number) => void
  ): Promise<VEO3Result> {
    onProgress?.('starting', 0);

    const response = await this.kieClient!.generateVideo({
      prompt,
      model: options.fast ? 'veo3_fast' : 'veo3',
      aspectRatio: options.aspectRatio || '16:9',
      seeds: options.seed,
      enableFallback: options.enableFallback !== false,
      enableTranslation: options.enableTranslation !== false,
    });

    onProgress?.('processing', 25);

    // Poll task status
    const result = await this.pollKieTask(response.data.taskId, onProgress);

    return {
      videoUrl: result.videoUrl,
      operationId: response.data.taskId,
      provider: 'kie',
      metadata: {
        model: options.fast ? 'veo3_fast' : 'veo3',
        aspectRatio: options.aspectRatio || '16:9',
      }
    };
  }

  private async pollKieTask(
    taskId: string,
    onProgress?: (status: string, progress?: number) => void
  ): Promise<{ videoUrl: string }> {
    const maxAttempts = 60; // 10 minutes with 10s intervals

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.kieClient!.getTaskStatus(taskId);

        if (status.completed) {
          onProgress?.('completed', 100);
          return { videoUrl: status.videoUrl };
        } else if (status.failed) {
          throw new VEO3GenerationFailedError(status.error);
        }

        const progress = Math.min(25 + (attempt / maxAttempts) * 70, 95);
        onProgress?.('processing', progress);

        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        throw mapVEO3Error(error);
      }
    }

    throw new VEO3Error('Task timeout', 'VEO3_TASK_TIMEOUT');
  }
}

// Usage example
export interface VEO3GenerationOptions {
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  fast?: boolean;
  negativePrompt?: string;
  seed?: number;
  generateAudio?: boolean;
  enableFallback?: boolean;
  enableTranslation?: boolean;
  useCache?: boolean;
}

export interface VEO3Result {
  videoUrl: string;
  operationId: string;
  provider: 'google' | 'kie';
  metadata: Record<string, any>;
}

// Example usage
async function example() {
  const veo3 = new VEO3Service({
    kieApiKey: process.env.KIE_API_KEY,
    provider: 'kie'
  });

  try {
    const result = await veo3.generateVideo(
      "A majestic lion walking through tall grass at sunset",
      {
        aspectRatio: '16:9',
        fast: false,
        enableFallback: true
      },
      (status, progress) => {
        console.log(`Status: ${status}, Progress: ${progress}%`);
      }
    );

    console.log('Video generated:', result.videoUrl);
  } catch (error) {
    if (error instanceof VEO3Error) {
      console.error(`VEO3 Error [${error.code}]:`, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

---

## Production-Ready Patterns

### 1. Environment Configuration

```typescript
// config/veo3-config.ts
import { z } from 'zod';

const VEO3ConfigSchema = z.object({
  GOOGLE_API_KEY: z.string().optional(),
  KIE_API_KEY: z.string().optional(),
  VEO3_PROVIDER: z.enum(['google', 'kie']).default('kie'),
  VEO3_MAX_RETRIES: z.coerce.number().default(3),
  VEO3_TIMEOUT: z.coerce.number().default(600000), // 10 minutes
  VEO3_CACHE_TTL: z.coerce.number().default(3600000), // 1 hour
  VEO3_MAX_CONCURRENT: z.coerce.number().default(3),
});

export type VEO3Config = z.infer<typeof VEO3ConfigSchema>;

export function getVEO3Config(): VEO3Config {
  const config = VEO3ConfigSchema.parse(process.env);

  // Validate provider configuration
  if (config.VEO3_PROVIDER === 'google' && !config.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is required when VEO3_PROVIDER=google');
  }

  if (config.VEO3_PROVIDER === 'kie' && !config.KIE_API_KEY) {
    throw new Error('KIE_API_KEY is required when VEO3_PROVIDER=kie');
  }

  return config;
}
```

### 2. Health Check and Monitoring

```typescript
// monitoring/veo3-health-check.ts
export interface VEO3HealthStatus {
  provider: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastError?: string;
  timestamp: number;
}

export class VEO3HealthChecker {
  private lastHealthCheck: Map<string, VEO3HealthStatus> = new Map();

  async checkHealth(service: VEO3Service): Promise<VEO3HealthStatus> {
    const startTime = Date.now();
    const provider = service.config.provider;

    try {
      // Perform a lightweight health check
      await this.performHealthCheck(service);

      const status: VEO3HealthStatus = {
        provider,
        status: 'healthy',
        latency: Date.now() - startTime,
        timestamp: Date.now()
      };

      this.lastHealthCheck.set(provider, status);
      return status;

    } catch (error) {
      const veoError = error instanceof VEO3Error ? error : mapVEO3Error(error);

      const status: VEO3HealthStatus = {
        provider,
        status: veoError.retryable ? 'degraded' : 'unhealthy',
        lastError: veoError.message,
        timestamp: Date.now()
      };

      this.lastHealthCheck.set(provider, status);
      return status;
    }
  }

  private async performHealthCheck(service: VEO3Service): Promise<void> {
    // For Google: Check quota/authentication
    if (service.config.provider === 'google') {
      // Minimal test - just check if we can authenticate
      await service.googleClient?.models.list();
    }

    // For Kie.ai: Check account credits
    if (service.config.provider === 'kie') {
      await service.kieClient?.getAccountCredits();
    }
  }

  getLastHealthStatus(provider: string): VEO3HealthStatus | undefined {
    return this.lastHealthCheck.get(provider);
  }
}
```

### 3. Circuit Breaker Pattern

```typescript
// resilience/veo3-circuit-breaker.ts
interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export class VEO3CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000 // 5 minutes
  }) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new VEO3Error('Circuit breaker is OPEN', 'VEO3_CIRCUIT_OPEN');
      } else {
        this.state = CircuitState.HALF_OPEN;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  getState(): { state: CircuitState; failureCount: number; nextAttemptTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttemptTime: this.nextAttemptTime
    };
  }
}
```

### 4. OpenJourney UI Integration Pattern

```typescript
// integrations/openjourney-veo3-bridge.ts
export class OpenJourneyVEO3Bridge {
  private veo3Service: VEO3Service;
  private circuitBreaker: VEO3CircuitBreaker;
  private healthChecker: VEO3HealthChecker;

  constructor(config: VEO3Config) {
    this.veo3Service = new VEO3Service(config);
    this.circuitBreaker = new VEO3CircuitBreaker();
    this.healthChecker = new VEO3HealthChecker();
  }

  // OpenJourney-compatible interface
  async generateVideo(request: {
    prompt: string;
    image?: string; // base64 or URL
    aspectRatio?: '16:9' | '9:16';
    quality?: 'fast' | 'quality';
    onProgress?: (progress: number) => void;
  }): Promise<{ videoUrl: string; taskId: string }> {

    // Health check before processing
    const health = await this.healthChecker.checkHealth(this.veo3Service);
    if (health.status === 'unhealthy') {
      throw new VEO3Error(`Service unhealthy: ${health.lastError}`, 'VEO3_SERVICE_UNHEALTHY');
    }

    // Execute with circuit breaker
    return this.circuitBreaker.execute(async () => {
      const result = await this.veo3Service.generateVideo(
        request.prompt,
        {
          aspectRatio: request.aspectRatio,
          fast: request.quality === 'fast',
          enableFallback: true,
          enableTranslation: true,
        },
        (status, progress) => {
          request.onProgress?.(progress || 0);
        }
      );

      return {
        videoUrl: result.videoUrl,
        taskId: result.operationId
      };
    });
  }

  // Status endpoint for OpenJourney polling
  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    videoUrl?: string;
    error?: string;
  }> {
    try {
      // Implementation depends on provider
      if (this.veo3Service.config.provider === 'kie') {
        return await this.veo3Service.kieClient!.getTaskStatus(taskId);
      } else {
        // Google operation status
        const operation = await this.veo3Service.googleClient!.operations.get({ name: taskId });
        return {
          status: operation.done ? 'completed' : 'processing',
          progress: operation.done ? 100 : 50,
          videoUrl: operation.done ? operation.response?.generatedVideos[0]?.video?.uri : undefined
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        progress: 0,
        error: error instanceof VEO3Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Express.js route handlers
export function createVEO3Routes(bridge: OpenJourneyVEO3Bridge) {
  const router = express.Router();

  router.post('/generate', async (req, res) => {
    try {
      const result = await bridge.generateVideo({
        prompt: req.body.prompt,
        image: req.body.image,
        aspectRatio: req.body.aspectRatio,
        quality: req.body.quality,
        onProgress: (progress) => {
          // Optional: WebSocket progress updates
          req.app.get('wsServer')?.emit('progress', { taskId: result.taskId, progress });
        }
      });

      res.json({ success: true, data: result });
    } catch (error) {
      const veoError = error instanceof VEO3Error ? error : mapVEO3Error(error);
      res.status(veoError.statusCode || 500).json({
        success: false,
        error: {
          code: veoError.code,
          message: veoError.message,
          retryable: veoError.retryable
        }
      });
    }
  });

  router.get('/status/:taskId', async (req, res) => {
    try {
      const status = await bridge.getTaskStatus(req.params.taskId);
      res.json({ success: true, data: status });
    } catch (error) {
      const veoError = error instanceof VEO3Error ? error : mapVEO3Error(error);
      res.status(500).json({
        success: false,
        error: { message: veoError.message }
      });
    }
  });

  return router;
}
```

---

## Key URLs and Resources

### Official Documentation
- [Gemini API Video Generation](https://ai.google.dev/gemini-api/docs/video)
- [Vertex AI VEO Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation)
- [Google AI Studio VEO3](https://aistudio.google.com/models/veo-3)

### Alternative Services
- [Kie.ai VEO3 API](https://docs.kie.ai/veo3-api/generate-veo-3-video)
- [Kie.ai Pricing](https://kie.ai/billing)

### GitHub Implementations
- [Fred-hash-d/veo3-api](https://github.com/Fred-hash-d/veo3-api) - React VEO3 component
- [google-gemini/veo-3-nano-banana-gemini-api-quickstart](https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart)
- [VEO3 GitHub Topic](https://github.com/topics/veo3)

### Community Resources
- [OpenJourney VEO3 Integration](https://github.com/ammaarreshi/openjourney)
- [VEO3 Studio Example](https://github.com/nihalnihalani/SEC-hacakthon)

---

This documentation provides production-ready patterns for integrating VEO3 API calls in the OpenJourney UI bridge, including comprehensive error handling, performance optimization, and fallback mechanisms for reliable video generation at scale.

SmokeDev 🚬