# Next.js 15 API Route Best Practices and Patterns

## Table of Contents
- [Long-running Operations](#long-running-operations)
- [Streaming Responses](#streaming-responses)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Integration Patterns](#integration-patterns)
- [WebSocket Integration](#websocket-integration)
- [Background Job Processing](#background-job-processing)
- [Real-world Examples](#real-world-examples)
- [Resources and References](#resources-and-references)

## Long-running Operations

### 1. Handling Operations that Take 15-30 Minutes

#### Server-Sent Events (SSE) Pattern
```typescript
// app/api/video-generation/route.ts
export async function POST(req: Request) {
  const { prompt, userId } = await req.json();

  // Start the long-running operation
  startVideoGeneration(prompt, userId);

  // Return immediate response with job ID
  return new Response(JSON.stringify({
    jobId: generateJobId(),
    status: 'started',
    estimatedTime: '15-30 minutes'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// app/api/video-generation/[jobId]/stream/route.ts
export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Function to send updates
      const sendUpdate = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Monitor job progress
      const interval = setInterval(async () => {
        const jobStatus = await getJobStatus(params.jobId);

        sendUpdate({
          status: jobStatus.status,
          progress: jobStatus.progress,
          message: jobStatus.message
        });

        if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

#### Database-backed Job Queue Pattern
```typescript
// lib/job-queue.ts
interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createJob(type: string, payload: any): Promise<string> {
  const jobId = generateUUID();

  await db.job.create({
    data: {
      id: jobId,
      type,
      payload,
      status: 'pending'
    }
  });

  // Trigger background processor
  await triggerJobProcessor(jobId);

  return jobId;
}

export async function updateJobProgress(jobId: string, progress: number, message?: string) {
  await db.job.update({
    where: { id: jobId },
    data: {
      progress,
      message,
      updatedAt: new Date()
    }
  });

  // Emit real-time update
  await emitJobUpdate(jobId, { progress, message });
}
```

### 2. Timeout Handling and Connection Management

#### Configuring API Route Timeouts
```typescript
// app/api/long-operation/route.ts
export const maxDuration = 300; // 5 minutes (Vercel Pro limit)

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 290000); // 4min 50sec safety margin

  try {
    const result = await performLongOperation({
      signal: controller.signal,
      onProgress: (progress) => {
        // Update job status in database
        updateJobProgress(jobId, progress);
      }
    });

    clearTimeout(timeoutId);
    return Response.json({ success: true, result });

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      // Handle timeout gracefully
      return Response.json({
        error: 'Operation timed out',
        message: 'Please check job status endpoint for completion'
      }, { status: 408 });
    }

    throw error;
  }
}
```

#### Connection Management with Keep-Alive
```typescript
// app/api/status-stream/route.ts
export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send keep-alive every 30 seconds
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    }
  });
}
```

## Streaming Responses

### 1. Native Web API Streaming
```typescript
// app/api/ai-generation/stream/route.ts
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of generateAIContent(prompt)) {
          const data = encoder.encode(JSON.stringify({
            type: 'content',
            data: chunk,
            timestamp: Date.now()
          }) + '\n');

          controller.enqueue(data);
        }

        // Send completion signal
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'complete',
          timestamp: Date.now()
        }) + '\n'));

      } catch (error) {
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'error',
          error: error.message,
          timestamp: Date.now()
        }) + '\n'));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    }
  });
}
```

### 2. Progress Updates with Streaming
```typescript
// app/api/file-processing/stream/route.ts
async function* processFileWithProgress(file: File) {
  const totalSteps = 5;

  yield { step: 1, message: 'Uploading file...', progress: 20 };
  await uploadFile(file);

  yield { step: 2, message: 'Analyzing content...', progress: 40 };
  const analysis = await analyzeFile(file);

  yield { step: 3, message: 'Processing data...', progress: 60 };
  const processed = await processData(analysis);

  yield { step: 4, message: 'Generating output...', progress: 80 };
  const output = await generateOutput(processed);

  yield { step: 5, message: 'Complete!', progress: 100, result: output };
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      for await (const update of processFileWithProgress(file)) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify(update)}\n\n`
        ));
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
```

## Error Handling

### 1. Comprehensive Error Handling Patterns
```typescript
// lib/api-error-handler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ApiError) {
        return Response.json({
          error: error.message,
          code: error.code,
          details: error.details
        }, {
          status: error.statusCode
        });
      }

      // Handle specific error types
      if (error.code === 'ECONNREFUSED') {
        return Response.json({
          error: 'Service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE'
        }, { status: 503 });
      }

      if (error.name === 'AbortError') {
        return Response.json({
          error: 'Request timeout',
          code: 'TIMEOUT'
        }, { status: 408 });
      }

      // Generic error response
      return Response.json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }, { status: 500 });
    }
  };
}
```

### 2. User-friendly Error Messages
```typescript
// app/api/video-generation/route.ts
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'You have exceeded your monthly generation quota. Please upgrade your plan.',
  INVALID_PROMPT: 'The provided prompt contains inappropriate content or is too long.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 100MB.',
  PROCESSING_FAILED: 'Video generation failed. Please try again with different settings.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.'
};

export const POST = withErrorHandling(async (req: Request) => {
  const { prompt, userId } = await req.json();

  // Validate input
  if (!prompt || prompt.length > 1000) {
    throw new ApiError(
      ERROR_MESSAGES.INVALID_PROMPT,
      400,
      'INVALID_PROMPT'
    );
  }

  // Check user quota
  const quota = await getUserQuota(userId);
  if (quota.used >= quota.limit) {
    throw new ApiError(
      ERROR_MESSAGES.QUOTA_EXCEEDED,
      402,
      'QUOTA_EXCEEDED',
      { current: quota.used, limit: quota.limit }
    );
  }

  const result = await generateVideo(prompt);
  return Response.json(result);
});
```

### 3. Rate Limiting and Retry Strategies
```typescript
// lib/rate-limiter.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const redisKey = `rate_limit:${key}:${window}`;

  const current = await redis.incr(redisKey);

  if (current === 1) {
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
  }

  const remaining = Math.max(0, limit - current);
  const resetTime = (window + 1) * windowMs;

  return {
    allowed: current <= limit,
    remaining,
    resetTime
  };
}

// app/api/generate/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = await rateLimiter(ip, 10, 60000); // 10 requests per minute

  if (!rateLimit.allowed) {
    return Response.json({
      error: ERROR_MESSAGES.RATE_LIMITED,
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });
  }

  // Process request...
});
```

## Performance Optimization

### 1. Async/Await Best Practices
```typescript
// app/api/batch-processing/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const { items } = await req.json();

  // Process items in parallel with concurrency limit
  const results = await processWithConcurrencyLimit(items, async (item) => {
    return await processItem(item);
  }, 5); // Max 5 concurrent operations

  return Response.json({ results });
});

async function processWithConcurrencyLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(processor)
    );
    results.push(...batchResults);
  }

  return results;
}
```

### 2. Memory Management for Long Operations
```typescript
// lib/memory-manager.ts
export class MemoryManager {
  private static instance: MemoryManager;
  private activeOperations = new Map<string, AbortController>();

  static getInstance() {
    if (!this.instance) {
      this.instance = new MemoryManager();
    }
    return this.instance;
  }

  registerOperation(id: string): AbortController {
    const controller = new AbortController();
    this.activeOperations.set(id, controller);

    // Auto-cleanup after 30 minutes
    setTimeout(() => {
      this.cleanup(id);
    }, 30 * 60 * 1000);

    return controller;
  }

  cleanup(id: string) {
    const controller = this.activeOperations.get(id);
    if (controller) {
      controller.abort();
      this.activeOperations.delete(id);
    }
  }

  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
    }
  }
}
```

### 3. Resource Management and Cleanup
```typescript
// app/api/large-file-processing/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const memoryManager = MemoryManager.getInstance();
  const operationId = generateUUID();
  const controller = memoryManager.registerOperation(operationId);

  let tempFiles: string[] = [];

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // Process file in chunks to manage memory
    const tempFile = await saveTemporaryFile(file);
    tempFiles.push(tempFile);

    const result = await processLargeFile(tempFile, {
      signal: controller.signal,
      onProgress: (progress) => {
        // Update progress in database
        updateProgress(operationId, progress);
      }
    });

    return Response.json({ result });

  } finally {
    // Cleanup temporary files
    await Promise.all(tempFiles.map(file =>
      fs.unlink(file).catch(console.error)
    ));

    memoryManager.cleanup(operationId);
    memoryManager.forceGarbageCollection();
  }
});
```

## Integration Patterns

### 1. Calling External APIs from API Routes
```typescript
// lib/external-api-client.ts
export class ExternalApiClient {
  private baseUrl: string;
  private apiKey: string;
  private retryConfig = { attempts: 3, delay: 1000 };

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal
        });

        if (!response.ok) {
          throw new ApiError(
            `External API error: ${response.statusText}`,
            response.status,
            'EXTERNAL_API_ERROR'
          );
        }

        return await response.json();

      } catch (error) {
        if (attempt === this.retryConfig.attempts || signal?.aborted) {
          throw error;
        }

        await new Promise(resolve =>
          setTimeout(resolve, this.retryConfig.delay * attempt)
        );
      }
    }

    throw new Error('Max retry attempts exceeded');
  }
}
```

### 2. Subprocess Management from Next.js
```typescript
// lib/subprocess-manager.ts
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export class SubprocessManager extends EventEmitter {
  private activeProcesses = new Map<string, any>();

  async runProcess(
    command: string,
    args: string[],
    options: {
      timeout?: number;
      onProgress?: (data: string) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<string> {
    const processId = generateUUID();

    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe'
      });

      this.activeProcesses.set(processId, process);

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        options.onProgress?.(chunk);
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        this.activeProcesses.delete(processId);

        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Process failed with code ${code}: ${errorOutput}`));
        }
      });

      // Handle timeout
      if (options.timeout) {
        setTimeout(() => {
          if (this.activeProcesses.has(processId)) {
            process.kill('SIGTERM');
            reject(new Error('Process timeout'));
          }
        }, options.timeout);
      }

      // Handle abort signal
      options.signal?.addEventListener('abort', () => {
        if (this.activeProcesses.has(processId)) {
          process.kill('SIGTERM');
          reject(new Error('Process aborted'));
        }
      });
    });
  }
}

// app/api/video-processing/route.ts
const subprocessManager = new SubprocessManager();

export const POST = withErrorHandling(async (req: Request) => {
  const { inputFile, outputFormat } = await req.json();

  try {
    const result = await subprocessManager.runProcess('ffmpeg', [
      '-i', inputFile,
      '-f', outputFormat,
      'output.mp4'
    ], {
      timeout: 300000, // 5 minutes
      onProgress: (data) => {
        // Parse FFmpeg progress and update job status
        parseProgressAndUpdate(data);
      }
    });

    return Response.json({ success: true, output: result });

  } catch (error) {
    throw new ApiError(
      'Video processing failed',
      500,
      'PROCESSING_ERROR',
      { error: error.message }
    );
  }
});
```

### 3. File Handling and Storage
```typescript
// lib/file-manager.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class FileManager {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  async uploadFile(file: File, key: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type
    });

    await this.s3Client.send(command);
    return `s3://${this.bucketName}/${key}`;
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async streamFile(key: string): Promise<ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    const response = await this.s3Client.send(command);
    return response.Body as ReadableStream;
  }
}
```

## WebSocket Integration

### 1. WebSocket Server with Next.js
```typescript
// lib/websocket-server.ts
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, any>();

  initialize(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      const clientId = generateUUID();
      this.clients.set(clientId, ws);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId
      }));
    });
  }

  broadcastToRoom(room: string, message: any) {
    this.clients.forEach((ws) => {
      if (ws.room === room && ws.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }

  private handleMessage(clientId: string, message: any) {
    switch (message.type) {
      case 'join_room':
        const client = this.clients.get(clientId);
        if (client) {
          client.room = message.room;
        }
        break;

      case 'progress_update':
        this.broadcastToRoom(message.room, {
          type: 'progress',
          data: message.data
        });
        break;
    }
  }
}
```

### 2. Real-time Updates Integration
```typescript
// app/api/websocket/route.ts
import { NextRequest } from 'next/server';
import { WebSocketManager } from '@/lib/websocket-server';

const wsManager = new WebSocketManager();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');

  if (!room) {
    return Response.json({ error: 'Room parameter required' }, { status: 400 });
  }

  // This would typically be handled by a separate WebSocket server
  // or using a service like Pusher, Socket.io, or Ably
  return Response.json({
    message: 'WebSocket connection endpoint',
    room,
    instructions: 'Connect via WebSocket client'
  });
}

// app/api/job-update/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const { jobId, progress, status, message } = await req.json();

  // Update job in database
  await updateJobStatus(jobId, { progress, status, message });

  // Send real-time update via WebSocket
  wsManager.broadcastToRoom(`job_${jobId}`, {
    type: 'job_update',
    jobId,
    progress,
    status,
    message,
    timestamp: Date.now()
  });

  return Response.json({ success: true });
});
```

## Background Job Processing

### 1. Queue-based Background Jobs
```typescript
// lib/job-processor.ts
import Bull from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const videoQueue = new Bull('video processing', process.env.REDIS_URL);

// Define job processors
videoQueue.process('generate', 5, async (job) => {
  const { prompt, userId, jobId } = job.data;

  try {
    // Update progress
    await job.progress(10);
    await updateJobStatus(jobId, { status: 'processing', progress: 10 });

    // Generate video
    const result = await generateVideo(prompt, {
      onProgress: async (progress) => {
        await job.progress(progress);
        await updateJobStatus(jobId, { progress });

        // Send real-time update
        wsManager.sendToClient(userId, {
          type: 'progress',
          jobId,
          progress
        });
      }
    });

    await job.progress(100);
    await updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      result
    });

    // Notify completion
    wsManager.sendToClient(userId, {
      type: 'completed',
      jobId,
      result
    });

    return result;

  } catch (error) {
    await updateJobStatus(jobId, {
      status: 'failed',
      error: error.message
    });

    wsManager.sendToClient(userId, {
      type: 'error',
      jobId,
      error: error.message
    });

    throw error;
  }
});

export async function addVideoGenerationJob(prompt: string, userId: string) {
  const jobId = generateUUID();

  await videoQueue.add('generate', {
    prompt,
    userId,
    jobId
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 10,
    removeOnFail: 5
  });

  return jobId;
}
```

### 2. Cleanup and Resource Management
```typescript
// lib/cleanup-manager.ts
export class CleanupManager {
  private cleanupTasks: Array<() => Promise<void>> = [];
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    // Cleanup on process exit
    process.on('SIGTERM', this.cleanup.bind(this));
    process.on('SIGINT', this.cleanup.bind(this));
    process.on('exit', this.cleanup.bind(this));
  }

  addCleanupTask(task: () => Promise<void>) {
    this.cleanupTasks.push(task);
  }

  startPeriodicCleanup(intervalMs: number = 300000) { // 5 minutes
    const interval = setInterval(async () => {
      await this.cleanupExpiredJobs();
      await this.cleanupTempFiles();
      await this.cleanupStaleConnections();
    }, intervalMs);

    this.intervals.push(interval);
  }

  private async cleanup() {
    console.log('Starting cleanup...');

    // Clear intervals
    this.intervals.forEach(clearInterval);

    // Run cleanup tasks
    await Promise.all(
      this.cleanupTasks.map(task =>
        task().catch(console.error)
      )
    );

    console.log('Cleanup completed');
  }

  private async cleanupExpiredJobs() {
    const expiredJobs = await db.job.findMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
        },
        status: {
          in: ['completed', 'failed']
        }
      }
    });

    await db.job.deleteMany({
      where: {
        id: {
          in: expiredJobs.map(job => job.id)
        }
      }
    });
  }

  private async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > 3600000) {
        await fs.unlink(filePath);
      }
    }
  }

  private async cleanupStaleConnections() {
    // Implementation depends on your WebSocket/connection management
    wsManager.cleanupStaleConnections();
  }
}
```

## Real-world Examples

### 1. AI Video Generation Pipeline
```typescript
// app/api/ai-video/generate/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const { prompt, style, duration, userId } = await req.json();

  // Create job record
  const jobId = await createJob('ai_video_generation', {
    prompt,
    style,
    duration,
    userId
  });

  // Add to background queue
  await addVideoGenerationJob(prompt, userId, {
    style,
    duration,
    jobId,
    onProgress: async (progress) => {
      await updateJobProgress(jobId, progress);

      // Send real-time update
      wsManager.sendToClient(userId, {
        type: 'generation_progress',
        jobId,
        progress,
        stage: getStageFromProgress(progress)
      });
    }
  });

  return Response.json({
    jobId,
    status: 'queued',
    estimatedTime: calculateEstimatedTime(duration),
    statusUrl: `/api/ai-video/status/${jobId}`,
    streamUrl: `/api/ai-video/stream/${jobId}`
  });
});

// app/api/ai-video/status/[jobId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const job = await getJobStatus(params.jobId);

  if (!job) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  return Response.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  });
}
```

### 2. Batch Processing API
```typescript
// app/api/batch-process/route.ts
export const POST = withErrorHandling(async (req: Request) => {
  const { items, operation, batchSize = 10 } = await req.json();

  const jobId = generateUUID();
  const batches = chunkArray(items, batchSize);

  // Create job record
  await createJob('batch_processing', {
    jobId,
    totalItems: items.length,
    totalBatches: batches.length,
    operation
  });

  // Process batches
  processBatchesInBackground(batches, operation, jobId);

  return Response.json({
    jobId,
    totalItems: items.length,
    batchSize,
    estimatedTime: batches.length * 30, // 30s per batch
    statusUrl: `/api/batch-process/status/${jobId}`
  });
});

async function processBatchesInBackground(
  batches: any[][],
  operation: string,
  jobId: string
) {
  let completedBatches = 0;

  for (const batch of batches) {
    try {
      await processBatch(batch, operation);
      completedBatches++;

      const progress = Math.round((completedBatches / batches.length) * 100);

      await updateJobProgress(jobId, progress,
        `Completed ${completedBatches}/${batches.length} batches`
      );

    } catch (error) {
      await updateJobStatus(jobId, {
        status: 'failed',
        error: error.message
      });
      return;
    }
  }

  await updateJobStatus(jobId, {
    status: 'completed',
    progress: 100,
    message: 'All batches processed successfully'
  });
}
```

## Resources and References

### Official Documentation
- [Next.js 15 API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### GitHub Examples and Resources
- [Next.js Examples Repository](https://github.com/vercel/next.js/tree/canary/examples)
- [API Routes REST Example](https://github.com/vercel/next.js/tree/canary/examples/api-routes-rest)
- [Route Handlers Example](https://github.com/vercel/next.js/tree/canary/examples/route-handlers)
- [WebSocket Integration Discussion](https://github.com/vercel/next.js/discussions/14950)

### Background Jobs and Real-time Updates
- [Inngest: Background Jobs with Next.js](https://www.inngest.com/blog/background-jobs-realtime-nextjs)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [WebSocket with Next.js Tutorial](https://dev.to/danmusembi/building-real-time-apps-with-nextjs-and-websockets-2p39)

### Performance and Optimization
- [Next.js Performance Best Practices](https://nextjs.org/docs/pages/building-your-application/optimizing/bundle-analyzer)
- [Vercel Function Limits](https://vercel.com/docs/functions/serverless-functions/limitations)
- [Streaming Responses Best Practices](https://hackernoon.com/streaming-in-nextjs-15-websockets-vs-server-sent-events)

### Error Handling and Monitoring
- [Next.js Error Handling Patterns](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Server-side Error Monitoring](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation)

### Deployment Considerations
- [Self-hosting Next.js with Streaming](https://nextjs.org/docs/app/building-your-application/deploying/index)
- [Nginx Configuration for Streaming](https://nextjs.org/docs/app/building-your-application/deploying/index#streaming)

---

*This documentation provides comprehensive patterns for building robust Next.js 15 API routes that can handle long-running operations, streaming responses, and real-time updates. All examples include proper error handling, performance optimization, and production-ready patterns.*