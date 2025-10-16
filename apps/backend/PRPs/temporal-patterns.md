# Temporal Workflow Patterns & Best Practices

**Research Date:** October 5, 2025
**Purpose:** Document Temporal patterns for SmokeTech Studio ultra-realistic video generation system
**Target Use Case:** Long-running video generation workflows with NanoBanana + VEO3 integration

---

## Table of Contents

1. [Workflow Design Patterns for Long-Running Processes](#1-workflow-design-patterns)
2. [Activity Retry Strategies & Timeout Configurations](#2-activity-retry-strategies)
3. [State Persistence & Checkpoint Mechanisms](#3-state-persistence)
4. [Signal/Query Patterns for Progress Tracking](#4-signalquery-patterns)
5. [Worker Scaling & Deployment Strategies](#5-worker-scaling)
6. [Code Examples for Video Generation](#6-code-examples)

---

## 1. Workflow Design Patterns for Long-Running Processes

### Key Principles

**Temporal Workflows are designed to run for extended periods** (days, months, even years) with automatic fault tolerance. For our video generation use case:

- **NanoBanana character generation:** 30 seconds - 2 minutes
- **VEO3 video generation:** 2-8 minutes per 8-second segment
- **Complete ultra-realistic video:** 15-25 minutes end-to-end
- **Batch operations:** Multiple hours for character libraries

### Pattern 1: Saga Pattern for Multi-Step Generation

```typescript
// viral/src/temporal/workflows/ultraRealisticVideoWorkflow.ts
export async function ultraRealisticVideoWorkflow(
  config: UltraRealisticVideoConfig
): Promise<VideoGenerationResult> {

  // Step 1: Character generation with checkpoint
  const characterImages = await proxyActivities<typeof activities>({
    startToCloseTimeout: '10 minutes',
    retry: {
      initialInterval: '5s',
      maximumAttempts: 3,
      backoffCoefficient: 2.0
    }
  }).generateCharacterImages(config.character);

  // ✅ Checkpoint saved automatically here!

  // Step 2: Video segments generation (parallel execution)
  const videoPromises = config.scenarios.map((scenario, index) =>
    proxyActivities<typeof activities>({
      startToCloseTimeout: '15 minutes',
      retry: {
        initialInterval: '10s',
        maximumAttempts: 5,
        backoffCoefficient: 2.0
      }
    }).generateVideoSegment({
      characterImage: characterImages[0],
      scenario,
      index
    })
  );

  const videoSegments = await Promise.all(videoPromises);

  // ✅ Another checkpoint saved here!

  // Step 3: Stitching with FFmpeg
  const stitchedVideo = await proxyActivities<typeof activities>({
    startToCloseTimeout: '5 minutes'
  }).stitchVideos(videoSegments);

  return { videoUrl: stitchedVideo, characterImages };
}
```

**Key Benefits:**
- If NanoBanana succeeds but VEO3 fails → retry only VEO3 (character already saved)
- If process crashes → resume from last checkpoint
- Each `await` creates an implicit checkpoint in Temporal

### Pattern 2: Continue-As-New for Batch Operations

When generating large character libraries (50+ images), use Continue-As-New to avoid event history bloat:

```typescript
export async function batchCharacterGenerationWorkflow(
  batch: CharacterBatch,
  processedCount: number = 0
): Promise<BatchResult> {

  const BATCH_SIZE = 10; // Process 10 at a time

  // Process current batch
  const currentBatch = batch.characters.slice(processedCount, processedCount + BATCH_SIZE);
  const results = await processBatch(currentBatch);

  const newCount = processedCount + currentBatch.length;

  // If more to process, Continue-As-New
  if (newCount < batch.characters.length) {
    await continueAsNew<typeof batchCharacterGenerationWorkflow>(batch, newCount);
  }

  return { totalProcessed: newCount };
}
```

---

## 2. Activity Retry Strategies & Timeout Configurations

### The 4 Types of Activity Timeouts

Temporal provides 4 timeout types. For video generation, we primarily use **2 of them**:

#### 1. **Start-To-Close Timeout** (ALWAYS SET THIS!)

Maximum time a **single Activity execution** can take.

**Recommended Values for Our Use Case:**
```typescript
{
  startToCloseTimeout: '10 minutes',  // NanoBanana image generation
  startToCloseTimeout: '15 minutes',  // VEO3 video generation
  startToCloseTimeout: '5 minutes',   // FFmpeg stitching
  startToCloseTimeout: '20 minutes',  // Topaz Video AI enhancement
}
```

**Why?** If VEO3 API hangs, Temporal will timeout and retry after 15 minutes rather than waiting indefinitely.

#### 2. **Schedule-To-Close Timeout** (Controls Total Retry Duration)

Maximum time allowed for an Activity **including all retries**.

```typescript
{
  startToCloseTimeout: '15 minutes',    // Single attempt
  scheduleToCloseTimeout: '2 hours',    // Maximum total time (all retries)
  retry: {
    maximumAttempts: 5  // Max 5 attempts within 2 hours
  }
}
```

**Use Case:** If VEO3 is experiencing extended outage, fail after 2 hours total rather than retrying for 10 years (Temporal default!).

#### 3. **Heartbeat Timeout** (For Long-Running Activities)

For activities that take 5+ minutes and can report progress:

```typescript
// In your activity
export async function generateLongVideo(params: VideoParams) {
  for (let i = 0; i < segments.length; i++) {
    await generateSegment(segments[i]);

    // Send heartbeat to Temporal
    Context.current().heartbeat(i + 1);  // Progress: segment number
  }
}

// In workflow
{
  startToCloseTimeout: '30 minutes',
  heartbeatTimeout: '2 minutes'  // Fail if no heartbeat for 2 minutes
}
```

**Benefit:** Detect failures faster (2 min heartbeat vs 30 min timeout).

#### 4. **Schedule-To-Start Timeout** (Rarely Needed)

How long an Activity can sit in queue before a Worker picks it up.

**For our use case:** Monitor via metrics instead. Scale workers if queue is backing up.

### Retry Policy Best Practices

```typescript
// GOOD: Exponential backoff with sensible limits
{
  retry: {
    initialInterval: '5s',        // Wait 5s before first retry
    backoffCoefficient: 2.0,      // Double wait time each retry (5s, 10s, 20s, 40s...)
    maximumInterval: '5 minutes', // Cap wait time at 5 minutes
    maximumAttempts: 5,           // Stop after 5 attempts
    nonRetryableErrorTypes: [
      'InvalidApiKeyError',       // Don't retry if API key is wrong
      'UnsupportedModelError'     // Don't retry if model doesn't exist
    ]
  }
}
```

**Default Retry Policy** (if not specified):
```typescript
{
  initialInterval: '1s',
  backoffCoefficient: 2.0,
  maximumInterval: '100s',
  maximumAttempts: Infinity  // ⚠️ Retries forever!
}
```

### Recruiting Interview Analogy (from Temporal docs)

Think of video generation like scheduling interviews:

- **Start-To-Close:** Interview should not exceed 45 minutes
- **Heartbeat:** Send a ping every 10 minutes (if no response, person didn't show up)
- **Schedule-To-Close:** Entire process should not drag beyond 4 weeks
- **Schedule-To-Start:** Don't set this; scale interviewers instead

---

## 3. State Persistence & Checkpoint Mechanisms

### How Temporal Achieves Automatic Checkpointing

**Every `await` in a Temporal Workflow creates an implicit checkpoint!**

```typescript
export async function videoWorkflow() {
  // Checkpoint 1: Workflow started
  const character = await generateCharacter();

  // ✅ State saved! If crash happens here, workflow resumes with character already generated

  const video = await generateVideo(character);

  // ✅ Another checkpoint! If crash now, both character and video are saved

  await uploadToS3(video);

  // ✅ Final checkpoint

  return { success: true };
}
```

### Event History = Complete Audit Trail

Every action is recorded as an Event in the Workflow's Event History:

```
1. WorkflowExecutionStarted
2. ActivityTaskScheduled (generateCharacter)
3. ActivityTaskStarted
4. ActivityTaskCompleted (result: character-image-url.png)
5. ActivityTaskScheduled (generateVideo)
6. ActivityTaskStarted
7. ActivityTaskTimedOut (VEO3 API timeout!)
8. ActivityTaskScheduled (generateVideo - RETRY)
9. ActivityTaskStarted
10. ActivityTaskCompleted (result: video-url.mp4)
11. WorkflowExecutionCompleted
```

**Key Insight:** Temporal never re-executes Activities that already completed. It replays from Event History.

### Determinism Requirements

**Critical Rule:** Workflow code must be deterministic (same inputs = same outputs).

```typescript
// ❌ BAD: Non-deterministic (breaks replay)
export async function badWorkflow() {
  const random = Math.random();  // Different value on replay!
  const now = Date.now();        // Different value on replay!
  await fetch('https://api.example.com');  // Network call in workflow!
}

// ✅ GOOD: Deterministic
export async function goodWorkflow() {
  // Use Activities for non-deterministic operations
  const randomValue = await proxyActivities<typeof activities>({
    startToCloseTimeout: '10s'
  }).getRandomNumber();

  const apiData = await proxyActivities<typeof activities>({
    startToCloseTimeout: '30s'
  }).callExternalAPI('https://api.example.com');
}
```

### State Management Pattern

```typescript
export async function statefulWorkflow() {
  // Workflow state persists automatically
  let progress = 0;
  let videoSegments: string[] = [];

  setHandler(getProgressQuery, () => progress);  // Query returns current state

  setHandler(addSegmentSignal, (segment: string) => {
    videoSegments.push(segment);  // Signal modifies state
    progress = (videoSegments.length / totalSegments) * 100;
  });

  // State persists across checkpoints automatically!
  await condition(() => videoSegments.length === totalSegments);

  return videoSegments;
}
```

---

## 4. Signal/Query Patterns for Progress Tracking

### Three Types of Messages

| Type | Purpose | Response | Adds to History? |
|------|---------|----------|------------------|
| **Query** | Read state | Synchronous | ❌ No |
| **Signal** | Write state (async) | None | ✅ Yes |
| **Update** | Write state (sync) | Synchronous | ✅ Yes |

### Pattern 1: Progress Tracking with Queries

```typescript
// Define query
export const getProgressQuery = defineQuery<VideoProgress>('getProgress');

export async function videoGenerationWorkflow() {
  let progress: VideoProgress = {
    stage: 'initializing',
    percentage: 0,
    currentStep: 'Setting up...'
  };

  // Set query handler
  setHandler(getProgressQuery, () => progress);

  // Update progress throughout workflow
  progress = { stage: 'character', percentage: 10, currentStep: 'Generating character...' };
  const character = await generateCharacter();

  progress = { stage: 'video', percentage: 40, currentStep: 'Generating video segment 1/7...' };
  const video1 = await generateVideoSegment(character, 0);

  // ... etc
}
```

**Client Code:**
```typescript
const handle = client.workflow.getHandle(workflowId);

// Poll for progress
const interval = setInterval(async () => {
  const progress = await handle.query(getProgressQuery);
  console.log(`Progress: ${progress.percentage}% - ${progress.currentStep}`);

  if (progress.percentage === 100) clearInterval(interval);
}, 2000);  // Poll every 2 seconds
```

### Pattern 2: Pause/Resume with Signals

```typescript
// Define signals
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');

export async function videoWorkflow() {
  let isPaused = false;

  setHandler(pauseSignal, () => { isPaused = true; });
  setHandler(resumeSignal, () => { isPaused = false; });

  for (const segment of segments) {
    // Wait if paused
    await condition(() => !isPaused);

    await generateSegment(segment);
  }
}
```

**Client Code:**
```typescript
// User clicks "Pause" button
await handle.signal(pauseSignal);

// User clicks "Resume" button
await handle.signal(resumeSignal);
```

### Pattern 3: Dynamic Configuration with Updates

```typescript
// Define update
export const changeQualityUpdate = defineUpdate<string, [QualityLevel]>('changeQuality');

export async function videoWorkflow() {
  let quality: QualityLevel = 'standard';

  setHandler(
    changeQualityUpdate,
    (newQuality: QualityLevel) => {
      const previousQuality = quality;
      quality = newQuality;
      return previousQuality;  // Return old value to client
    },
    {
      validator: (newQuality: QualityLevel) => {
        if (!['standard', 'high', '4k'].includes(newQuality)) {
          throw new Error(`Invalid quality: ${newQuality}`);
        }
      }
    }
  );

  for (const segment of segments) {
    await generateSegment(segment, quality);  // Uses current quality setting
  }
}
```

**Client Code:**
```typescript
// User changes quality mid-generation
const previousQuality = await handle.executeUpdate(changeQualityUpdate, {
  args: ['4k']
});

console.log(`Changed from ${previousQuality} to 4k`);
```

### Signal-With-Start Pattern

Start a workflow OR signal it if already running:

```typescript
// Start new workflow or signal existing one
await client.workflow.signalWithStart(videoWorkflow, {
  workflowId: 'user-123-video-gen',
  taskQueue: 'video-generation',
  args: [config],
  signal: addSegmentSignal,
  signalArgs: [newSegment]
});
```

---

## 5. Worker Scaling & Deployment Strategies

### Horizontal Scaling Pattern

**Temporal Workers are stateless and can scale horizontally:**

```typescript
// viral/src/worker.ts
import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'video-generation',

    // Concurrency settings
    maxConcurrentActivityTaskExecutions: 5,   // Run 5 activities in parallel
    maxConcurrentWorkflowTaskExecutions: 100, // Handle 100 workflows

    // Resource limits
    maxCachedWorkflows: 200,
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Deployment Best Practices

#### 1. **Multiple Workers Per Task Queue**

```bash
# Terminal 1
npm run worker

# Terminal 2
npm run worker

# Terminal 3
npm run worker
```

All workers poll the same `video-generation` task queue. Temporal automatically load balances!

#### 2. **Separate Task Queues for Different Operations**

```typescript
// Fast operations (< 1 min)
const fastWorker = await Worker.create({
  taskQueue: 'fast-operations',
  activities: { generateThumbnail, validateInput }
});

// Slow operations (5-15 min)
const slowWorker = await Worker.create({
  taskQueue: 'slow-operations',
  activities: { generateVideo, enhanceWith4K }
});
```

**Benefit:** Scale fast and slow workers independently.

#### 3. **Autoscaling Based on Queue Metrics**

```typescript
// Monitor queue backlog
const queueStats = await client.workflow.describeTaskQueue({
  namespace: 'default',
  taskQueue: 'video-generation'
});

if (queueStats.backlog > 100) {
  // Scale up workers (Kubernetes HPA, AWS Auto Scaling, etc.)
  await scaleWorkers(desiredCount + 5);
}
```

#### 4. **Graceful Shutdown Pattern**

```typescript
async function run() {
  const worker = await Worker.create({ /* ... */ });

  // Handle shutdown signals
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await worker.shutdown();  // Finishes current tasks before exiting
    process.exit(0);
  });

  await worker.run();
}
```

### Production Deployment Checklist

- [ ] Use Temporal Cloud or self-hosted cluster (not local `temporal.exe`)
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure proper timeouts and retry policies
- [ ] Implement graceful shutdown
- [ ] Use separate task queues for different workload types
- [ ] Set up autoscaling based on queue depth
- [ ] Enable activity heartbeats for long-running tasks
- [ ] Implement proper error handling and logging
- [ ] Use Temporal UI for debugging and monitoring
- [ ] Set up alerts for failed workflows

---

## 6. Code Examples for Video Generation

### Complete Ultra-Realistic Video Workflow

```typescript
// viral/src/temporal/workflows/ultraRealisticVideoWorkflow.ts
import { proxyActivities, defineQuery, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from '../activities';

// Define message types
export const getProgressQuery = defineQuery<VideoProgress>('getProgress');
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');

export interface UltraRealisticVideoConfig {
  character: CharacterPrompt;
  scenarios: ScenarioConfig[];
  quality: QualityLevel;
}

export async function ultraRealisticVideoWorkflow(
  config: UltraRealisticVideoConfig
): Promise<VideoResult> {

  // State management
  let progress: VideoProgress = { stage: 'starting', percentage: 0 };
  let isPaused = false;

  // Message handlers
  setHandler(getProgressQuery, () => progress);
  setHandler(pauseSignal, () => { isPaused = true; });
  setHandler(resumeSignal, () => { isPaused = false; });

  // Activity proxies with retry policies
  const {
    generateCharacterImages,
    generateVideoSegment,
    stitchVideos,
    enhance4K
  } = proxyActivities<typeof activities>({
    startToCloseTimeout: '15 minutes',
    retry: {
      initialInterval: '10s',
      backoffCoefficient: 2.0,
      maximumInterval: '5 minutes',
      maximumAttempts: 5
    }
  });

  // STEP 1: Character Generation
  progress = { stage: 'character', percentage: 10 };
  await condition(() => !isPaused);

  const characterImages = await generateCharacterImages(config.character);

  // STEP 2: Video Segments (parallel)
  progress = { stage: 'videos', percentage: 30 };
  const videoSegments: string[] = [];

  for (let i = 0; i < config.scenarios.length; i++) {
    await condition(() => !isPaused);

    const segment = await generateVideoSegment({
      characterImage: characterImages[0],
      scenario: config.scenarios[i],
      quality: config.quality
    });

    videoSegments.push(segment);
    progress = {
      stage: 'videos',
      percentage: 30 + (i + 1) / config.scenarios.length * 50
    };
  }

  // STEP 3: Stitching
  progress = { stage: 'stitching', percentage: 80 };
  await condition(() => !isPaused);

  const stitchedVideo = await stitchVideos(videoSegments);

  // STEP 4: Enhancement (optional)
  if (config.quality === '4k') {
    progress = { stage: 'enhancing', percentage: 90 };
    const enhancedVideo = await enhance4K(stitchedVideo);
    progress = { stage: 'complete', percentage: 100 };
    return { videoUrl: enhancedVideo, characterImages };
  }

  progress = { stage: 'complete', percentage: 100 };
  return { videoUrl: stitchedVideo, characterImages };
}
```

### Activity Implementations with Heartbeats

```typescript
// viral/src/temporal/activities/nanoBananaActivity.ts
import { Context } from '@temporalio/activity';
import { nanoBanaService } from '../../services/vertexAINanoBanana';

export async function generateCharacterImages(
  prompt: CharacterPrompt
): Promise<string[]> {
  const images: string[] = [];
  const angles = ['front', '3/4', 'profile'];

  for (let i = 0; i < angles.length; i++) {
    // Send heartbeat (for long-running operations)
    Context.current().heartbeat(i + 1);

    const imageUrl = await nanoBanaService.generate({
      prompt: `${prompt.basePrompt}, ${angles[i]} view`,
      temperature: 0.3
    });

    images.push(imageUrl);
  }

  return images;
}
```

```typescript
// viral/src/temporal/activities/veo3Activity.ts
import { Context } from '@temporalio/activity';
import { veo3Service } from '../../services/veo3Service';

export async function generateVideoSegment(
  params: VideoSegmentParams
): Promise<string> {

  // Set up cancellation handler
  const abortController = new AbortController();
  Context.current().cancellation.then(() => abortController.abort());

  try {
    const videoUrl = await veo3Service.generateVideo({
      characterImage: params.characterImage,
      prompt: params.scenario.prompt,
      duration: 8,
      signal: abortController.signal
    });

    return videoUrl;
  } catch (error) {
    // Wrap errors for better debugging
    throw new Error(`VEO3 generation failed: ${error.message}`);
  }
}
```

### Client Code for omega-platform

```typescript
// omega-platform/src/lib/temporal-client.ts
import { Client, Connection } from '@temporalio/client';
import type { ultraRealisticVideoWorkflow } from '../../../viral/src/temporal/workflows';

export class TemporalVideoClient {
  private client: Client;

  async init() {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
    });

    this.client = new Client({ connection });
  }

  async startVideoGeneration(config: UltraRealisticVideoConfig) {
    const handle = await this.client.workflow.start(
      'ultraRealisticVideoWorkflow',  // Use string for cross-repo
      {
        taskQueue: 'video-generation',
        workflowId: `video-${Date.now()}`,
        args: [config]
      }
    );

    return handle.workflowId;
  }

  async getProgress(workflowId: string) {
    const handle = this.client.workflow.getHandle(workflowId);
    return await handle.query('getProgress');
  }

  async pauseGeneration(workflowId: string) {
    const handle = this.client.workflow.getHandle(workflowId);
    await handle.signal('pause');
  }

  async resumeGeneration(workflowId: string) {
    const handle = this.client.workflow.getHandle(workflowId);
    await handle.signal('resume');
  }

  async getResult(workflowId: string) {
    const handle = this.client.workflow.getHandle(workflowId);
    return await handle.result();
  }
}
```

---

## Summary: Key Takeaways for SmokeTech Studio

1. **Always set Start-To-Close timeout** on activities (10-15 min for video generation)
2. **Use exponential backoff** with sensible maximumAttempts (3-5 retries)
3. **Leverage automatic checkpointing** - every `await` saves state
4. **Use Queries for progress tracking** - no event history pollution
5. **Use Signals for pause/resume** - async state changes
6. **Use Updates for critical changes** - synchronous with validation
7. **Scale workers horizontally** - stateless and auto-load-balanced
8. **Separate task queues** for fast vs slow operations
9. **Monitor queue depth** for autoscaling decisions
10. **Test crash recovery** - kill workers mid-execution to verify resilience

---

**Next Steps:**
1. Set up Temporal server (Task 2)
2. Create activity wrappers for NanoBanana/VEO3 (Tasks 3-4)
3. Implement workflow patterns (Tasks 5-6)
4. Integrate with omega-platform (Tasks 7-8)
5. Test fault tolerance (Task 9)
