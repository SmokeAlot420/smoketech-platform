# Google API Integration Patterns for VEO3 Video Generation

**Research Date:** October 2, 2025
**Focus:** Node.js/TypeScript integration patterns for Vertex AI and VEO3

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Authentication Patterns](#authentication-patterns)
3. [VEO3 API Reference](#veo3-api-reference)
4. [Node.js Integration Examples](#nodejs-integration-examples)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Rate Limiting & Best Practices](#rate-limiting--best-practices)
7. [UI Integration Patterns](#ui-integration-patterns)

---

## Repository Overview

### googleapis/google-api-nodejs-client
**URL:** https://github.com/googleapis/google-api-nodejs-client
**Stars:** 11.9k
**Purpose:** Official Google APIs Node.js client library

**Key Features:**
- OAuth 2.0, API Keys, and JWT token support
- TypeScript support with auto-generated types
- HTTP/2 support for better performance
- Automatic retry and exponential backoff
- Media upload support with streaming

**Important Note:** For Google Cloud Platform APIs (including Vertex AI), Google recommends using `@google-cloud/*` packages instead. This client is in maintenance mode.

### googleapis/genai-toolbox
**URL:** https://github.com/googleapis/genai-toolbox
**Stars:** 10.8k
**Purpose:** MCP Toolbox for Databases (primarily Go-based)

**Note:** This is NOT a video generation toolbox. It's focused on database MCP servers. Not directly relevant for VEO3 integration.

---

## Authentication Patterns

### 1. OAuth2 Client Pattern (google-api-nodejs-client)

**Setup OAuth2:**
```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

// Generate authorization URL
const scopes = [
  'https://www.googleapis.com/auth/cloud-platform'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Gets refresh_token
  scope: scopes
});
```

**Handle Token Refresh:**
```typescript
// Automatic token refresh on expiry
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // Store refresh_token in database
    console.log('New refresh token:', tokens.refresh_token);
  }
  console.log('Access token:', tokens.access_token);
});

// Set credentials
oauth2Client.setCredentials({
  refresh_token: 'STORED_REFRESH_TOKEN'
});
```

**Reference:** https://github.com/googleapis/google-api-nodejs-client#oauth2-client

---

### 2. Service Account Authentication (Recommended for Server-Side)

**Using Environment Variable:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./path/to/service-account-key.json"
```

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const authClient = await auth.getClient();
const projectId = await auth.getProjectId();
```

**Using keyFile Property:**
```typescript
const auth = new google.auth.GoogleAuth({
  keyFile: '/path/to/your-secret-key.json',
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});
```

**Reference:** https://github.com/googleapis/google-api-nodejs-client#service-account-credentials

---

### 3. Application Default Credentials (ADC)

**Local Development:**
```bash
gcloud auth application-default login
```

**Production (automatic on GCP):**
```typescript
const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const authClient = await auth.getClient();
  const project = await auth.getProjectId();

  // Use authClient for API calls
}
```

**Reference:** https://github.com/googleapis/google-api-nodejs-client#application-default-credentials

---

## VEO3 API Reference

### Supported Models

**Official Documentation:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation

**Available Models:**
- `veo-2.0-generate-001` (GA)
- `veo-2.0-generate-exp` (Experimental with reference images)
- `veo-3.0-generate-001` (GA)
- `veo-3.0-fast-generate-001` (GA)
- `veo-3.0-generate-preview` (Preview)
- `veo-3.0-fast-generate-preview` (Preview)

### API Endpoint

```
POST https://LOCATION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/LOCATION/publishers/google/models/MODEL_ID:predictLongRunning
```

**Default Location:** `us-central1`

---

### Request Structure

#### Text-to-Video Request

```typescript
interface VeoTextToVideoRequest {
  instances: [{
    prompt: string;
  }];
  parameters: {
    aspectRatio?: "16:9" | "9:16";
    compressionQuality?: "optimized" | "lossless";
    durationSeconds: 4 | 6 | 8; // VEO3: 4, 6, or 8
    enhancePrompt?: boolean;
    generateAudio?: boolean; // VEO3 only
    negativePrompt?: string;
    personGeneration?: "allow_adult" | "dont_allow";
    resolution?: "720p" | "1080p"; // VEO3 only
    sampleCount?: 1 | 2 | 3 | 4;
    seed?: number; // 0-4294967295
    storageUri?: string; // GCS bucket
  };
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning \
  -d '{
    "instances": [{
      "prompt": "A fast-tracking shot through a bustling dystopian city with neon signs"
    }],
    "parameters": {
      "durationSeconds": 8,
      "resolution": "1080p",
      "generateAudio": true,
      "sampleCount": 1,
      "storageUri": "gs://my-bucket/videos/"
    }
  }'
```

**Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation#rest-ttv

---

#### Image-to-Video Request

```typescript
interface VeoImageToVideoRequest {
  instances: [{
    prompt?: string; // Optional if image provided
    image: {
      bytesBase64Encoded?: string;
      gcsUri?: string;
      mimeType: "image/jpeg" | "image/png";
    };
  }];
  parameters: {
    // Same as text-to-video
  };
}
```

**Example Request:**
```typescript
const request = {
  instances: [{
    prompt: "Make this image come to life with subtle movement",
    image: {
      bytesBase64Encoded: "base64_encoded_image_string",
      mimeType: "image/jpeg"
    }
  }],
  parameters: {
    durationSeconds: 8,
    resolution: "1080p",
    generateAudio: true,
    storageUri: "gs://my-bucket/videos/"
  }
};
```

**Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation#rest-itv

---

#### Reference Images (VEO 2.0 Experimental)

```typescript
interface VeoReferenceImagesRequest {
  instances: [{
    prompt: string;
    referenceImages: [{
      image: {
        bytesBase64Encoded?: string;
        gcsUri?: string;
        mimeType: "image/jpeg" | "image/png";
      };
      referenceType: "asset" | "style";
    }];
  }];
  parameters: {
    durationSeconds: 8; // Fixed at 8 for reference images
    // Other parameters...
  };
}
```

**Asset vs Style:**
- **Asset:** Provides scene, objects, or characters for video
- **Style:** Provides colors, lighting, texture for video

**Limits:**
- Up to 3 asset images OR 1 style image
- Only supported by `veo-2.0-generate-exp`

**Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation#rest-asset-video-request

---

### Response Handling

#### Initial Response (Long-Running Operation)

```typescript
interface VeoInitialResponse {
  name: string; // Operation ID
}

// Example:
{
  "name": "projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/OPERATION_ID"
}
```

#### Polling Operation Status

**Endpoint:**
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/MODEL_ID:fetchPredictOperation
```

**Request:**
```json
{
  "operationName": "projects/PROJECT_ID/locations/us-central1/publishers/google/models/MODEL_ID/operations/OPERATION_ID"
}
```

**Response (Complete):**
```typescript
interface VeoCompleteResponse {
  name: string;
  done: boolean;
  response: {
    "@type": "type.googleapis.com/cloud.ai.large_models.vision.GenerateVideoResponse";
    raiMediaFilteredCount: number;
    raiMediaFilteredReasons?: string[];
    videos: [{
      gcsUri?: string;
      bytesBase64Encoded?: string;
      mimeType: "video/mp4";
    }];
  };
}
```

**Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation#poll-operation

---

## Node.js Integration Examples

### 1. Using google-api-nodejs-client

**Installation:**
```bash
npm install googleapis
```

**Basic Integration:**
```typescript
import { google } from 'googleapis';

async function generateVideo(prompt: string) {
  // Setup authentication
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const authClient = await auth.getClient();
  const projectId = await auth.getProjectId();

  // Make API request
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning`;

  const response = await authClient.request({
    url,
    method: 'POST',
    data: {
      instances: [{ prompt }],
      parameters: {
        durationSeconds: 8,
        resolution: "1080p",
        generateAudio: true,
        storageUri: "gs://my-bucket/videos/"
      }
    }
  });

  return response.data;
}
```

---

### 2. Polling Pattern with Exponential Backoff

```typescript
async function pollVideoGeneration(operationName: string, authClient: any) {
  const maxAttempts = 30;
  const baseDelay = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await authClient.request({
      url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:fetchPredictOperation`,
      method: 'POST',
      data: { operationName }
    });

    if (response.data.done) {
      return response.data;
    }

    // Exponential backoff
    const delay = baseDelay * Math.pow(2, attempt);
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, 60000)));
  }

  throw new Error('Video generation timeout');
}
```

---

### 3. Media Upload Pattern (Streaming)

```typescript
import fs from 'fs';
import { google } from 'googleapis';

async function uploadImageForVideo(imagePath: string) {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const authClient = await auth.getClient();

  // Convert image to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Or upload to GCS first for better performance
  const storage = google.storage('v1');
  const uploadResponse = await storage.objects.insert({
    auth: authClient,
    bucket: 'my-bucket',
    name: `uploads/${Date.now()}.jpg`,
    media: {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(imagePath)
    }
  });

  return `gs://my-bucket/${uploadResponse.data.name}`;
}
```

**Reference:** https://github.com/googleapis/google-api-nodejs-client#media-uploads

---

## Error Handling Patterns

### 1. Retry with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable = error.code === 429 ||
                         error.code === 500 ||
                         error.code === 503;

      if (!isRetryable || i === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

### 2. Safety Filter Handling

```typescript
interface SafetyFilterResult {
  raiMediaFilteredCount: number;
  raiMediaFilteredReasons?: string[];
}

function handleSafetyFilters(response: VeoCompleteResponse) {
  const { raiMediaFilteredCount, raiMediaFilteredReasons } = response.response;

  if (raiMediaFilteredCount > 0) {
    console.warn(`${raiMediaFilteredCount} videos filtered`);

    if (raiMediaFilteredReasons) {
      console.warn('Reasons:', raiMediaFilteredReasons);
      // Possible reasons: VIOLENCE, ADULT, MEDICAL, etc.
    }

    // Adjust prompt or parameters
    throw new Error('Content filtered by safety policies');
  }
}
```

**Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/video/responsible-ai-and-usage-guidelines#safety-filters

---

### 3. Common Error Codes

```typescript
const ERROR_HANDLERS = {
  400: 'Bad Request - Check request parameters',
  401: 'Unauthorized - Check authentication',
  403: 'Forbidden - Check API enablement and permissions',
  404: 'Not Found - Check model ID and project',
  429: 'Rate Limited - Implement backoff',
  500: 'Server Error - Retry with backoff',
  503: 'Service Unavailable - Retry with backoff'
};

function handleApiError(error: any) {
  const code = error.code || error.response?.status;
  const message = ERROR_HANDLERS[code] || 'Unknown error';

  console.error(`API Error ${code}: ${message}`, error);

  if (code === 429) {
    // Extract retry-after header
    const retryAfter = error.response?.headers['retry-after'];
    return { shouldRetry: true, delay: retryAfter * 1000 || 5000 };
  }

  return { shouldRetry: [500, 503].includes(code) };
}
```

---

## Rate Limiting & Best Practices

### 1. Rate Limits (Vertex AI)

**Default Limits:**
- **Requests per minute:** 60 (varies by region)
- **Concurrent requests:** 10
- **Video generation time:** 15-25 minutes average

**Best Practices:**
```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = 0;
  private maxConcurrent = 5;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    if (this.processing >= this.maxConcurrent) {
      await new Promise(resolve => {
        this.queue.push(resolve as any);
      });
    }

    this.processing++;

    try {
      return await operation();
    } finally {
      this.processing--;

      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve?.();
      }
    }
  }
}

// Usage
const limiter = new RateLimiter();
const result = await limiter.add(() => generateVideo(prompt));
```

---

### 2. Request Optimization

**Use Cloud Storage for Media:**
```typescript
// ❌ Bad: Inline base64 (slow, large payloads)
const request = {
  instances: [{
    image: {
      bytesBase64Encoded: largeBase64String
    }
  }]
};

// ✅ Good: GCS URIs (fast, efficient)
const request = {
  instances: [{
    image: {
      gcsUri: "gs://bucket/image.jpg"
    }
  }]
};
```

**Batch Multiple Videos:**
```typescript
// Generate multiple variations in one request
const request = {
  instances: [{ prompt: "..." }],
  parameters: {
    sampleCount: 4, // Generate 4 videos at once
    storageUri: "gs://bucket/batch/"
  }
};
```

---

### 3. Monitoring and Logging

```typescript
import { google } from 'googleapis';

const monitoring = google.monitoring('v3');

async function logVideoGeneration(
  projectId: string,
  duration: number,
  success: boolean
) {
  const timeSeries = {
    metric: {
      type: 'custom.googleapis.com/video_generation/duration',
      labels: { success: String(success) }
    },
    points: [{
      interval: {
        endTime: { seconds: Date.now() / 1000 }
      },
      value: { doubleValue: duration }
    }]
  };

  await monitoring.projects.timeSeries.create({
    name: `projects/${projectId}`,
    requestBody: { timeSeries: [timeSeries] }
  });
}
```

---

## UI Integration Patterns

### 1. Next.js 15 API Route Pattern

**File:** `app/api/generate-video/route.ts`

```typescript
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio, duration } = await req.json();

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const authClient = await auth.getClient();
    const projectId = await auth.getProjectId();

    // Start video generation
    const response = await authClient.request({
      url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning`,
      method: 'POST',
      data: {
        instances: [{ prompt }],
        parameters: {
          aspectRatio: aspectRatio || "16:9",
          durationSeconds: duration || 8,
          resolution: "1080p",
          generateAudio: true,
          storageUri: `gs://${process.env.GCS_BUCKET}/videos/`
        }
      }
    });

    const operationId = response.data.name.split('/').pop();

    return NextResponse.json({
      success: true,
      operationId,
      message: 'Video generation started'
    });

  } catch (error: any) {
    console.error('Video generation error:', error);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

---

### 2. Real-time Status Updates (Server-Sent Events)

**File:** `app/api/video-status/route.ts`

```typescript
import { google } from 'googleapis';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const operationId = req.nextUrl.searchParams.get('operationId');

  if (!operationId) {
    return new Response('Missing operationId', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const authClient = await auth.getClient();
      const projectId = await auth.getProjectId();

      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          const response = await authClient.request({
            url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:fetchPredictOperation`,
            method: 'POST',
            data: {
              operationName: `projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/${operationId}`
            }
          });

          const data = response.data;

          // Send update to client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );

          if (data.done) {
            controller.close();
            return;
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
          return;
        }
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

### 3. React Client Component

**File:** `components/VideoGenerator.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const generateVideo = async () => {
    setStatus('generating');

    // Start generation
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        aspectRatio: '16:9',
        duration: 8
      })
    });

    const { operationId } = await response.json();

    // Poll for status using SSE
    const eventSource = new EventSource(
      `/api/video-status?operationId=${operationId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.done) {
        const video = data.response.videos[0];
        setVideoUrl(video.gcsUri);
        setStatus('complete');
        eventSource.close();
      } else {
        setStatus('processing');
      }
    };

    eventSource.onerror = () => {
      setStatus('error');
      eventSource.close();
    };
  };

  return (
    <div className="p-6">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video..."
        className="w-full p-4 border rounded"
      />

      <button
        onClick={generateVideo}
        disabled={status === 'generating' || status === 'processing'}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
      >
        {status === 'idle' && 'Generate Video'}
        {status === 'generating' && 'Starting...'}
        {status === 'processing' && 'Processing...'}
        {status === 'complete' && 'Generate Another'}
        {status === 'error' && 'Try Again'}
      </button>

      {videoUrl && (
        <div className="mt-6">
          <video controls className="w-full">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
```

---

## Additional Resources

### Official Documentation
- **VEO3 API Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation
- **Vertex AI Node.js SDK:** https://cloud.google.com/nodejs/docs/reference/vertexai/latest
- **Google API Node.js Client:** https://github.com/googleapis/google-api-nodejs-client
- **VEO3 Colab Example:** https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/vision/getting-started/veo3_video_generation.ipynb

### Authentication Resources
- **OAuth2 Setup:** https://github.com/googleapis/google-api-nodejs-client#oauth2-client
- **Service Accounts:** https://github.com/googleapis/google-api-nodejs-client#service-account-credentials
- **Application Default Credentials:** https://github.com/googleapis/google-api-nodejs-client#application-default-credentials

### Best Practices
- **Media Uploads:** https://github.com/googleapis/google-api-nodejs-client#media-uploads
- **Request Options:** https://github.com/googleapis/google-api-nodejs-client#request-options
- **Using Proxies:** https://github.com/googleapis/google-api-nodejs-client#using-a-proxy
- **TypeScript Support:** https://github.com/googleapis/google-api-nodejs-client#typescript
- **HTTP/2 Performance:** https://github.com/googleapis/google-api-nodejs-client#http2

### Safety & Responsible AI
- **Safety Filters:** https://cloud.google.com/vertex-ai/generative-ai/docs/video/responsible-ai-and-usage-guidelines#safety-filters
- **Usage Guidelines:** https://cloud.google.com/vertex-ai/generative-ai/docs/video/responsible-ai-and-usage-guidelines

---

## Key Takeaways

1. **Use `@google-cloud/*` packages for Vertex AI**, not google-api-nodejs-client (which is in maintenance mode)

2. **Authentication hierarchy:**
   - Development: Application Default Credentials (`gcloud auth application-default login`)
   - Production: Service Account with `GOOGLE_APPLICATION_CREDENTIALS` env var
   - User flows: OAuth2 with refresh tokens

3. **VEO3 requires long-running operation polling:**
   - Initial request returns operation ID
   - Poll with `fetchPredictOperation` every 5-10 seconds
   - Implement exponential backoff for failures

4. **Performance optimizations:**
   - Use GCS URIs instead of base64 for images/videos
   - Enable HTTP/2 for multiplexing
   - Batch multiple videos in single request (sampleCount: 4)

5. **Error handling essentials:**
   - Retry 429, 500, 503 errors with exponential backoff
   - Handle safety filters (`raiMediaFilteredCount`)
   - Set request timeouts (15-30 minutes for video generation)

6. **UI integration pattern:**
   - Next.js API route to start generation
   - Server-Sent Events (SSE) for real-time status
   - React client with EventSource for updates

---

**Sign off as SmokeDev 🚬**
