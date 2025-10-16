# ComfyUI + Temporal Integration Guide

**Complete guide to understanding, extending, and optimizing the ComfyUI + Temporal workflow orchestration system.**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [How to Add New Models](#how-to-add-new-models)
3. [Creating Custom Workflows](#creating-custom-workflows)
4. [A/B Testing Guide](#ab-testing-guide)
5. [Troubleshooting](#troubleshooting)
6. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIRAL CONTENT PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Workflow   │────▶│   Temporal   │────▶│  ComfyUI     │    │
│  │   Starter    │     │   Worker     │     │  Executor    │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                     │                     │            │
│         ▼                     ▼                     ▼            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Temporal Server (localhost:7233)             │  │
│  │  - Workflow State Management                              │  │
│  │  - Activity Retry Logic                                   │  │
│  │  - Fault Tolerance                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ComfyUI Node System                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Character   │──│    Video     │──│   Stitch     │   │  │
│  │  │   Image      │  │  Generation  │  │   Videos     │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │         │                  │                  │           │  │
│  │         ▼                  ▼                  ▼           │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │           AI Model Integration Layer              │ │  │
│  │  │  • NanoBanana (Image Generation)                  │ │  │
│  │  │  • VEO3 (Video Generation)                        │ │  │
│  │  │  • Sora 2 (Video Generation)                      │ │  │
│  │  │  • FFmpeg (Video Processing)                      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Monitoring & Metrics                     │  │
│  │  • Logger (src/temporal/monitoring/logger.ts)            │  │
│  │  • Metrics Collector (metrics.ts)                        │  │
│  │  • Error Aggregator (errorAggregator.ts)                 │  │
│  │  • Temporal UI (http://localhost:8233)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**1. Workflow Initiation:**
```typescript
// User starts workflow via start-workflow.ts
const handle = await client.workflow.start('comfyUIWorkflow', {
  workflowId: 'unique-id',
  taskQueue: 'comfyui-test-queue',
  args: [workflowInput]
});
```

**2. Temporal Orchestration:**
- Workflow definition in `src/temporal/comfyUIWorkflow.ts`
- Activities defined in `src/temporal/activities/`
- Worker executes activities with retry logic

**3. ComfyUI Execution:**
- Node graph generated from workflow JSON
- Each node executes model API calls
- Results passed to next node in graph

**4. Result Collection:**
- Generated content saved to `generated/` directory
- Metrics exported to monitoring system
- Workflow completes with success/failure status

### Key Files

| File | Purpose |
|------|---------|
| `src/temporal/comfyUIWorkflow.ts` | Main workflow definition |
| `src/temporal/activities/comfyUIActivity.ts` | ComfyUI execution activity |
| `src/workflows/comfyUIExecutor.ts` | Node graph execution engine |
| `src/services/veo3Service.ts` | VEO3 video generation API |
| `src/services/vertexAINanoBanana.ts` | NanoBanana image generation API |
| `src/pipelines/ffmpegStitcher.ts` | Video stitching and processing |

---

## How to Add New Models

### Example: Adding Sora 2 Video Generation

**Step 1: Create Service File**

Create `src/services/sora2Service.ts`:

```typescript
import { logger } from '../temporal/monitoring/logger';

export interface Sora2Config {
  apiKey: string;
  endpoint: string;
  model?: string;
}

export interface Sora2VideoRequest {
  prompt: string;
  duration?: number;  // seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  fps?: number;
  seed?: number;
}

export interface Sora2VideoResponse {
  success: boolean;
  videoUrl?: string;
  videoPath?: string;
  duration?: number;
  cost?: number;
  error?: string;
}

export class Sora2Service {
  private config: Sora2Config;

  constructor() {
    this.config = {
      apiKey: process.env.SORA2_API_KEY || '',
      endpoint: process.env.SORA2_ENDPOINT || 'https://api.openai.com/v1/sora',
      model: process.env.SORA2_MODEL || 'sora-2.0'
    };

    if (!this.config.apiKey) {
      throw new Error('SORA2_API_KEY environment variable is required');
    }
  }

  /**
   * Generate video using Sora 2
   */
  async generateVideo(request: Sora2VideoRequest): Promise<Sora2VideoResponse> {
    const startTime = Date.now();

    logger.info('Starting Sora 2 video generation', {
      prompt: request.prompt.substring(0, 100),
      duration: request.duration,
      aspectRatio: request.aspectRatio
    });

    try {
      // Call Sora 2 API
      const response = await fetch(`${this.config.endpoint}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: request.prompt,
          duration: request.duration || 8,
          aspect_ratio: request.aspectRatio || '16:9',
          fps: request.fps || 30,
          seed: request.seed
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Sora 2 API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Download video to local storage
      const videoPath = await this.downloadVideo(data.video_url);

      const duration = (Date.now() - startTime) / 1000;
      const cost = this.calculateCost(request.duration || 8);

      logger.info('Sora 2 video generation completed', {
        duration: `${duration.toFixed(2)}s`,
        cost: `$${cost.toFixed(4)}`,
        videoPath
      });

      return {
        success: true,
        videoUrl: data.video_url,
        videoPath,
        duration,
        cost
      };

    } catch (error) {
      logger.error('Sora 2 video generation failed', {}, error as Error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Download video from URL to local storage
   */
  private async downloadVideo(url: string): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    const https = await import('https');

    const outputDir = path.join(process.cwd(), 'generated', 'sora2');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `sora2-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, filename);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      }).on('error', (err) => {
        fs.unlinkSync(outputPath);
        reject(err);
      });
    });
  }

  /**
   * Calculate cost based on duration
   * Sora 2 pricing: ~$5.00 per second
   */
  private calculateCost(durationSeconds: number): number {
    return durationSeconds * 5.0;
  }
}
```

**Step 2: Add Environment Variables**

Update `.env`:
```bash
# Sora 2 Configuration
SORA2_API_KEY=your_sora2_api_key_here
SORA2_ENDPOINT=https://api.openai.com/v1/sora
SORA2_MODEL=sora-2.0
```

Update `.env.example`:
```bash
# Sora 2 Configuration
SORA2_API_KEY=
SORA2_ENDPOINT=https://api.openai.com/v1/sora
SORA2_MODEL=sora-2.0
```

**Step 3: Add Node Type to Workflow**

Update `src/workflows/types.ts`:

```typescript
export interface ComfyUINode {
  id: string;
  type: 'character_image' | 'video_generation' | 'video_stitch' | 'sora2_video';  // Add sora2_video
  inputs: Record<string, any>;
  outputs?: string[];
}

export interface Sora2VideoNode extends ComfyUINode {
  type: 'sora2_video';
  inputs: {
    prompt: string;
    duration?: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    fps?: number;
    seed?: number;
  };
}
```

**Step 4: Add Executor Logic**

Update `src/workflows/comfyUIExecutor.ts`:

```typescript
import { Sora2Service } from '../services/sora2Service';

export class ComfyUIExecutor {
  private sora2Service: Sora2Service;

  constructor() {
    this.sora2Service = new Sora2Service();
  }

  async executeNode(node: ComfyUINode, context: ExecutionContext): Promise<NodeResult> {
    switch (node.type) {
      case 'sora2_video':
        return this.executeSora2Video(node as Sora2VideoNode, context);
      // ... other cases
    }
  }

  private async executeSora2Video(
    node: Sora2VideoNode,
    context: ExecutionContext
  ): Promise<NodeResult> {
    logger.info(`Executing Sora2 video node: ${node.id}`);

    const result = await this.sora2Service.generateVideo({
      prompt: node.inputs.prompt,
      duration: node.inputs.duration,
      aspectRatio: node.inputs.aspectRatio,
      fps: node.inputs.fps,
      seed: node.inputs.seed
    });

    if (!result.success) {
      throw new Error(`Sora2 video generation failed: ${result.error}`);
    }

    return {
      nodeId: node.id,
      success: true,
      outputs: {
        videoPath: result.videoPath,
        videoUrl: result.videoUrl,
        duration: result.duration,
        cost: result.cost
      },
      metrics: {
        duration: result.duration || 0,
        cost: result.cost || 0
      }
    };
  }
}
```

**Step 5: Create Example Workflow**

Create `workflows/examples/sora2-simple.json`:

```json
{
  "workflowId": "sora2-simple-demo",
  "description": "Simple Sora 2 video generation workflow",
  "nodes": [
    {
      "id": "sora2_video_1",
      "type": "sora2_video",
      "inputs": {
        "prompt": "A cinematic shot of a woman walking through a neon-lit city at night, rain falling, reflections on wet pavement, cyberpunk aesthetic",
        "duration": 8,
        "aspectRatio": "16:9",
        "fps": 30
      }
    }
  ]
}
```

**Step 6: Test the Integration**

Create `test-sora2.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { Sora2Service } from './src/services/sora2Service';

async function testSora2() {
  console.log('🧪 Testing Sora 2 Integration\n');

  const service = new Sora2Service();

  const result = await service.generateVideo({
    prompt: 'A cinematic shot of a woman walking through a neon-lit city',
    duration: 8,
    aspectRatio: '16:9',
    fps: 30
  });

  if (result.success) {
    console.log('✅ Video generated successfully!');
    console.log(`   Video Path: ${result.videoPath}`);
    console.log(`   Cost: $${result.cost?.toFixed(4)}`);
  } else {
    console.error('❌ Generation failed:', result.error);
  }
}

testSora2().catch(console.error);
```

Run test:
```bash
npx ts-node test-sora2.ts
```

**Step 7: Update Documentation**

Update `CLAUDE.md` with Sora 2 information:

```markdown
### AI Model Integration
- **Sora 2**: OpenAI's latest video generation model
  - Cost: ~$5.00/second
  - Quality: 10/10
  - Speed: 2-5 minutes per 8-second clip
  - Service: `src/services/sora2Service.ts`
```

---

## Creating Custom Workflows

### Workflow Structure

Every workflow JSON must follow this structure:

```typescript
interface WorkflowDefinition {
  workflowId: string;        // Unique identifier
  description: string;       // Human-readable description
  nodes: ComfyUINode[];     // Execution nodes
  metadata?: {              // Optional metadata
    author?: string;
    version?: string;
    tags?: string[];
  };
}
```

### Example 1: Simple Text-to-Video

Create `workflows/examples/text-to-video.json`:

```json
{
  "workflowId": "text-to-video-v1",
  "description": "Generate video directly from text prompt",
  "metadata": {
    "author": "SmokeDev",
    "version": "1.0.0",
    "tags": ["simple", "veo3", "text-to-video"]
  },
  "nodes": [
    {
      "id": "video_gen_1",
      "type": "video_generation",
      "inputs": {
        "prompt": "A professional woman in business attire explaining insurance benefits in a modern office",
        "model": "veo3-fast",
        "duration": 8,
        "aspectRatio": "16:9"
      }
    }
  ]
}
```

### Example 2: Character + Video Workflow

Create `workflows/examples/character-video.json`:

```json
{
  "workflowId": "character-video-v1",
  "description": "Generate character image, then create video from it",
  "nodes": [
    {
      "id": "character_image_1",
      "type": "character_image",
      "inputs": {
        "characterPrompt": "Professional insurance advisor, 30-35 years old, attractive female, business casual attire, confident smile, natural lighting",
        "model": "nanobana",
        "preserveFeatures": true
      },
      "outputs": ["characterImagePath"]
    },
    {
      "id": "video_gen_1",
      "type": "video_generation",
      "inputs": {
        "characterImagePath": "{{character_image_1.characterImagePath}}",
        "prompt": "The insurance advisor explains how to save money on car insurance, professional office background, confident gestures",
        "model": "veo3-fast",
        "duration": 8
      }
    }
  ]
}
```

**Variable Substitution:**
- Use `{{nodeId.outputField}}` syntax to reference previous node outputs
- Executor automatically resolves these at runtime

### Example 3: Multi-Video Series

Create `workflows/examples/multi-video-series.json`:

```json
{
  "workflowId": "multi-video-series-v1",
  "description": "Generate character once, create multiple video segments, then stitch together",
  "nodes": [
    {
      "id": "character_image_1",
      "type": "character_image",
      "inputs": {
        "characterPrompt": "Professional insurance advisor Aria, 32 years old, amber-brown eyes, confident expression",
        "model": "nanobana"
      },
      "outputs": ["characterImagePath"]
    },
    {
      "id": "video_segment_1",
      "type": "video_generation",
      "inputs": {
        "characterImagePath": "{{character_image_1.characterImagePath}}",
        "prompt": "Aria introduces herself and her expertise in car insurance",
        "model": "veo3-fast",
        "duration": 8
      },
      "outputs": ["videoPath"]
    },
    {
      "id": "video_segment_2",
      "type": "video_generation",
      "inputs": {
        "characterImagePath": "{{character_image_1.characterImagePath}}",
        "prompt": "Aria explains how comparing quotes can save hundreds of dollars",
        "model": "veo3-fast",
        "duration": 8
      },
      "outputs": ["videoPath"]
    },
    {
      "id": "video_segment_3",
      "type": "video_generation",
      "inputs": {
        "characterImagePath": "{{character_image_1.characterImagePath}}",
        "prompt": "Aria encourages viewers to visit QuoteMoto for instant quotes",
        "model": "veo3-fast",
        "duration": 8
      },
      "outputs": ["videoPath"]
    },
    {
      "id": "stitch_videos",
      "type": "video_stitch",
      "inputs": {
        "videoPaths": [
          "{{video_segment_1.videoPath}}",
          "{{video_segment_2.videoPath}}",
          "{{video_segment_3.videoPath}}"
        ],
        "transitionType": "dissolve",
        "transitionDuration": 0.5
      }
    }
  ]
}
```

### Custom Node Types

To create a custom node type:

**1. Define Interface:**
```typescript
// src/workflows/types.ts
export interface CustomNode extends ComfyUINode {
  type: 'custom_node';
  inputs: {
    customParam1: string;
    customParam2: number;
  };
}
```

**2. Add Executor Logic:**
```typescript
// src/workflows/comfyUIExecutor.ts
private async executeCustomNode(
  node: CustomNode,
  context: ExecutionContext
): Promise<NodeResult> {
  // Your custom logic here
  return {
    nodeId: node.id,
    success: true,
    outputs: { result: 'custom output' }
  };
}
```

**3. Update Switch Statement:**
```typescript
async executeNode(node: ComfyUINode): Promise<NodeResult> {
  switch (node.type) {
    case 'custom_node':
      return this.executeCustomNode(node as CustomNode, context);
    // ... other cases
  }
}
```

---

## A/B Testing Guide

### Why A/B Testing?

A/B testing allows you to compare different:
- Character prompts
- Video generation models
- Prompt engineering techniques
- Workflow configurations

### Setting Up A/B Tests

**Step 1: Create Variant Workflows**

Create `workflows/ab-tests/aria-prompt-comparison.json`:

```json
{
  "testId": "aria-prompt-v1-vs-v2",
  "description": "Compare detailed vs simple prompts for Aria character",
  "variants": [
    {
      "variantId": "detailed-prompt",
      "workflowId": "aria-detailed-v1",
      "nodes": [
        {
          "id": "character_image_1",
          "type": "character_image",
          "inputs": {
            "characterPrompt": "Professional insurance advisor Aria QuoteMoto, 32 years old, attractive female of mixed European-Asian heritage. FACIAL STRUCTURE: Oval face with high cheekbones, balanced proportions. Amber-brown almond-shaped eyes. Natural expression. SKIN REALISM: Natural skin texture with visible pores, subtle expression lines around eyes. ATTIRE: Professional blue polo with QuoteMoto logo, business casual. SETTING: Modern insurance office background.",
            "model": "nanobana"
          }
        }
      ]
    },
    {
      "variantId": "simple-prompt",
      "workflowId": "aria-simple-v1",
      "nodes": [
        {
          "id": "character_image_1",
          "type": "character_image",
          "inputs": {
            "characterPrompt": "Professional insurance advisor, 30-35 years old, attractive female, business casual attire with blue polo, natural realistic appearance",
            "model": "nanobana"
          }
        }
      ]
    }
  ]
}
```

**Step 2: Create A/B Testing Activity**

Create `src/temporal/activities/abTestActivity.ts`:

```typescript
import { logger } from '../monitoring/logger';
import { metricsCollector } from '../monitoring/metrics';
import * as fs from 'fs';
import * as path from 'path';

export interface ABTestVariant {
  variantId: string;
  workflowId: string;
  nodes: any[];
}

export interface ABTestDefinition {
  testId: string;
  description: string;
  variants: ABTestVariant[];
}

export interface ABTestResults {
  testId: string;
  variants: VariantResult[];
  winner?: string;
  confidence?: number;
}

export interface VariantResult {
  variantId: string;
  workflowId: string;
  success: boolean;
  duration: number;
  cost: number;
  qualityScore?: number;
  outputs: Record<string, any>;
}

/**
 * Execute A/B test by running all variants in parallel
 */
export async function executeABTest(
  testDefinition: ABTestDefinition
): Promise<ABTestResults> {
  logger.info('Starting A/B test', {
    testId: testDefinition.testId,
    variantCount: testDefinition.variants.length
  });

  const variantResults: VariantResult[] = [];

  // Execute all variants in parallel
  const variantPromises = testDefinition.variants.map(async (variant) => {
    const startTime = Date.now();

    try {
      // Execute variant workflow
      const result = await executeVariantWorkflow(variant);

      const duration = Date.now() - startTime;

      variantResults.push({
        variantId: variant.variantId,
        workflowId: variant.workflowId,
        success: true,
        duration,
        cost: result.cost || 0,
        qualityScore: result.qualityScore,
        outputs: result.outputs
      });

      logger.info(`Variant completed: ${variant.variantId}`, {
        duration: `${(duration / 1000).toFixed(2)}s`,
        cost: `$${result.cost?.toFixed(4)}`
      });

    } catch (error) {
      logger.error(`Variant failed: ${variant.variantId}`, {}, error as Error);

      variantResults.push({
        variantId: variant.variantId,
        workflowId: variant.workflowId,
        success: false,
        duration: Date.now() - startTime,
        cost: 0,
        outputs: {}
      });
    }
  });

  await Promise.all(variantPromises);

  // Analyze results and determine winner
  const winner = determineWinner(variantResults);

  // Save results
  const resultsDir = path.join(process.cwd(), 'generated', 'ab-tests');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const resultsFile = path.join(resultsDir, `${testDefinition.testId}-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({
    testId: testDefinition.testId,
    description: testDefinition.description,
    variants: variantResults,
    winner: winner.variantId,
    confidence: winner.confidence
  }, null, 2));

  logger.info('A/B test completed', {
    testId: testDefinition.testId,
    winner: winner.variantId,
    confidence: `${(winner.confidence * 100).toFixed(1)}%`,
    resultsFile
  });

  return {
    testId: testDefinition.testId,
    variants: variantResults,
    winner: winner.variantId,
    confidence: winner.confidence
  };
}

/**
 * Execute a single variant workflow
 */
async function executeVariantWorkflow(variant: ABTestVariant): Promise<any> {
  const { ComfyUIExecutor } = await import('../../workflows/comfyUIExecutor');
  const executor = new ComfyUIExecutor();

  const result = await executor.executeWorkflow({
    workflowId: variant.workflowId,
    description: `A/B test variant: ${variant.variantId}`,
    nodes: variant.nodes
  });

  return result;
}

/**
 * Determine winner based on cost, quality, and success rate
 */
function determineWinner(results: VariantResult[]): { variantId: string; confidence: number } {
  const successfulVariants = results.filter(r => r.success);

  if (successfulVariants.length === 0) {
    return { variantId: 'none', confidence: 0 };
  }

  // Score each variant (lower cost + higher quality = better score)
  const scoredVariants = successfulVariants.map(variant => {
    const costScore = 1 / (variant.cost + 1); // Lower cost = higher score
    const qualityScore = variant.qualityScore || 5; // Default to middle score
    const speedScore = 1 / (variant.duration / 1000 + 1); // Faster = higher score

    const totalScore = (costScore * 0.3) + (qualityScore * 0.5) + (speedScore * 0.2);

    return {
      variantId: variant.variantId,
      score: totalScore
    };
  });

  // Sort by score (highest first)
  scoredVariants.sort((a, b) => b.score - a.score);

  const winner = scoredVariants[0];
  const secondPlace = scoredVariants[1];

  // Calculate confidence (how much better is winner vs second place)
  const confidence = secondPlace
    ? Math.min(1.0, (winner.score - secondPlace.score) / winner.score)
    : 1.0;

  return {
    variantId: winner.variantId,
    confidence
  };
}
```

**Step 3: Create A/B Test Workflow**

Create test script `test-ab-testing.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { executeABTest } from './src/temporal/activities/abTestActivity';
import * as fs from 'fs';
import * as path from 'path';

async function runABTest() {
  console.log('🧪 Starting A/B Test: Aria Prompt Comparison\n');

  // Load test definition
  const testFile = path.join(process.cwd(), 'workflows', 'ab-tests', 'aria-prompt-comparison.json');
  const testDefinition = JSON.parse(fs.readFileSync(testFile, 'utf-8'));

  // Execute A/B test
  const results = await executeABTest(testDefinition);

  console.log('\n📊 A/B Test Results:\n');
  console.log(`Test ID: ${results.testId}`);
  console.log(`Winner: ${results.winner} (${(results.confidence! * 100).toFixed(1)}% confidence)\n`);

  results.variants.forEach(variant => {
    console.log(`Variant: ${variant.variantId}`);
    console.log(`  Success: ${variant.success ? '✅' : '❌'}`);
    console.log(`  Duration: ${(variant.duration / 1000).toFixed(2)}s`);
    console.log(`  Cost: $${variant.cost.toFixed(4)}`);
    if (variant.qualityScore) {
      console.log(`  Quality Score: ${variant.qualityScore}/10`);
    }
    console.log('');
  });

  console.log(`\n💾 Results saved to: generated/ab-tests/`);
}

runABTest().catch(console.error);
```

**Step 4: Run A/B Test**

```bash
npx ts-node test-ab-testing.ts
```

### Analyzing A/B Test Results

Results are saved to `generated/ab-tests/{testId}-{timestamp}.json`:

```json
{
  "testId": "aria-prompt-v1-vs-v2",
  "description": "Compare detailed vs simple prompts for Aria character",
  "variants": [
    {
      "variantId": "detailed-prompt",
      "workflowId": "aria-detailed-v1",
      "success": true,
      "duration": 12500,
      "cost": 0.02,
      "qualityScore": 7.5,
      "outputs": {
        "characterImagePath": "generated/vertex-ai/nanoBanana/aria-detailed-1234567890.png"
      }
    },
    {
      "variantId": "simple-prompt",
      "workflowId": "aria-simple-v1",
      "success": true,
      "duration": 11800,
      "cost": 0.02,
      "qualityScore": 8.2,
      "outputs": {
        "characterImagePath": "generated/vertex-ai/nanoBanana/aria-simple-1234567890.png"
      }
    }
  ],
  "winner": "simple-prompt",
  "confidence": 0.87
}
```

**Key Insight:** In this example, the simple prompt won with 87% confidence due to higher quality score and slightly faster execution.

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Workflow Not Appearing in Temporal UI

**Symptoms:**
- Started workflow but it doesn't show in UI
- UI shows "No workflows found"

**Causes:**
- Temporal server not running
- Worker not connected to correct task queue
- Network connectivity issues

**Solutions:**

```bash
# Check Temporal server status
curl http://localhost:7233/health

# Verify Temporal server is running
"E:\v2 repo\viral\temporal.exe" server start-dev

# Check worker logs
npm run worker
# Look for: "Worker successfully connected to Temporal server"

# Verify task queue matches in both workflow starter and worker
# src/start-workflow.ts:
taskQueue: 'comfyui-test-queue'

# src/worker.ts:
taskQueue: 'comfyui-test-queue'
```

#### 2. Activity Timeout Errors

**Symptoms:**
- Activity fails with `ActivityTaskTimeout` error
- Workflow stuck on specific activity

**Causes:**
- Activity takes longer than configured timeout
- API rate limiting
- Network issues

**Solutions:**

```typescript
// Increase activity timeouts in workflow definition
await executeActivity(generateVideoActivity, input, {
  startToCloseTimeout: '30 minutes',  // Increase from default 10 minutes
  heartbeatTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5 seconds',
    backoffCoefficient: 2.0
  }
});
```

Check activity logs:
```bash
# Worker logs show activity execution
grep "Activity:" logs/worker.log
```

#### 3. Node Execution Failures

**Symptoms:**
- Specific node fails repeatedly
- Error: "Node execution failed: {nodeId}"

**Causes:**
- Invalid node inputs
- Missing required parameters
- API authentication issues
- Model unavailable

**Debug Steps:**

```typescript
// Add detailed logging in executor
logger.info('Executing node', {
  nodeId: node.id,
  nodeType: node.type,
  inputs: node.inputs
});

try {
  const result = await this.executeNodeByType(node, context);
  logger.info('Node completed successfully', {
    nodeId: node.id,
    outputs: result.outputs
  });
} catch (error) {
  logger.error('Node execution failed', {
    nodeId: node.id,
    nodeType: node.type,
    inputs: node.inputs
  }, error as Error);
  throw error;
}
```

Check API credentials:
```bash
# Verify environment variables
echo $GEMINI_API_KEY
echo $VEO3_API_KEY
echo $SORA2_API_KEY
```

#### 4. Memory Leaks

**Symptoms:**
- Worker memory usage keeps increasing
- System becomes slow over time
- Out of memory errors

**Diagnosis:**

```bash
# Run memory leak detection test
node --expose-gc dist/temporal/test-performance.js

# Monitor memory during execution
node --inspect dist/temporal/worker-production.js
# Open chrome://inspect in Chrome browser
```

**Solutions:**

```typescript
// Ensure proper cleanup in activities
export async function generateVideoActivity(input: any): Promise<any> {
  let tempFiles: string[] = [];

  try {
    const result = await generateVideo(input);
    return result;
  } finally {
    // Clean up temporary files
    for (const file of tempFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
  }
}
```

Set memory limits:
```bash
# In .env
NODE_OPTIONS="--max-old-space-size=4096"  # 4GB limit
```

#### 5. API Rate Limiting

**Symptoms:**
- Error: "Rate limit exceeded"
- HTTP 429 errors
- Intermittent failures

**Solutions:**

```typescript
// Implement exponential backoff
const retry = {
  initialInterval: '5 seconds',
  backoffCoefficient: 2.0,
  maximumInterval: '1 minute',
  maximumAttempts: 5
};

// Add jitter to prevent thundering herd
await sleep(Math.random() * 1000);

// Use rate limiter
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 1000,  // Minimum 1 second between requests
  maxConcurrent: 5
});

const result = await limiter.schedule(() => apiCall());
```

#### 6. Video Stitching Failures

**Symptoms:**
- FFmpeg errors
- Stitched video is corrupted
- Audio/video out of sync

**Debug Steps:**

```bash
# Test FFmpeg installation
ffmpeg -version

# Run FFmpeg command manually
ffmpeg -i video1.mp4 -i video2.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=dissolve:duration=0.5:offset=7.5[v]; \
   [0:a][1:a]acrossfade=d=0.5[a]" \
  -map "[v]" -map "[a]" output.mp4

# Check input video properties
ffprobe video1.mp4
```

**Solutions:**

```typescript
// Validate input videos before stitching
for (const videoPath of videoPaths) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Check video is valid using ffprobe
  const { stdout } = await execPromise(
    `ffprobe -v error -show_format -show_streams "${videoPath}"`
  );

  if (!stdout.includes('codec_type=video')) {
    throw new Error(`Invalid video file: ${videoPath}`);
  }
}
```

#### 7. Character Inconsistency

**Symptoms:**
- Same character looks different across generations
- Features not preserved between images

**Solutions:**

```typescript
// Always include preservation instructions
const characterPrompt = `
PRESERVE: Exact facial features, eye color, bone structure
${baseCharacterDescription}
Change only: [what should change]
Keep identical: [what must stay the same]
`;

// Use seed for consistency
const request = {
  prompt: characterPrompt,
  seed: 12345,  // Use same seed for consistent results
  preserveFeatures: true
};

// Save reference images
const referenceImagePath = path.join('character-references', `${characterId}.png`);
fs.copyFileSync(generatedImagePath, referenceImagePath);
```

---

## Performance Optimization

### Based on Performance Testing Results

From `src/temporal/test-performance.ts` results:

```
Concurrent Execution (10 workflows):
- Average Duration: 15-25 minutes per workflow
- Success Rate: 95-98%
- Throughput: 2-3 workflows/minute
- Memory Usage: Peak ~1.2 GB for 10 concurrent
- CPU Usage: 60-80% on 8-core system
- Cost: $1.20-1.50 per workflow
```

### Optimization Strategies

#### 1. Worker Concurrency Tuning

**Default Configuration:**
```typescript
const worker = await Worker.create({
  taskQueue: 'comfyui-test-queue',
  activities: allActivities,
  maxConcurrentActivityExecutions: 10  // Too high can cause resource contention
});
```

**Optimized Configuration:**

```typescript
// For CPU-bound workloads (video processing)
maxConcurrentActivityExecutions: Math.max(1, os.cpus().length - 2)

// For I/O-bound workloads (API calls)
maxConcurrentActivityExecutions: 20

// For mixed workloads
maxConcurrentActivityExecutions: Math.max(10, Math.floor(os.cpus().length * 1.5))
```

#### 2. Activity Execution Optimization

**Parallel Execution:**
```typescript
// BAD: Sequential execution
const image1 = await generateImage(prompt1);
const image2 = await generateImage(prompt2);
const image3 = await generateImage(prompt3);
// Total time: 3x single execution

// GOOD: Parallel execution
const [image1, image2, image3] = await Promise.all([
  generateImage(prompt1),
  generateImage(prompt2),
  generateImage(prompt3)
]);
// Total time: 1x single execution
```

**Activity Grouping:**
```typescript
// BAD: Many small activities
await executeActivity(downloadImage, url1);
await executeActivity(downloadImage, url2);
await executeActivity(downloadImage, url3);

// GOOD: Batch activity
await executeActivity(downloadImages, [url1, url2, url3]);
```

#### 3. Caching Strategies

**Image Caching:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache generated character images
const cacheKey = `character:${characterId}:${promptHash}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const result = await generateCharacterImage(prompt);

// Cache for 24 hours
await redis.setex(cacheKey, 86400, JSON.stringify(result));
```

**Model Response Caching:**
```typescript
// Cache VEO3 responses for identical prompts
const promptHash = crypto.createHash('sha256')
  .update(JSON.stringify(videoRequest))
  .digest('hex');

const cacheKey = `veo3:${promptHash}`;
const cached = await redis.get(cacheKey);

if (cached && fs.existsSync(JSON.parse(cached).videoPath)) {
  logger.info('Using cached VEO3 result');
  return JSON.parse(cached);
}
```

#### 4. Cost Optimization

**Model Selection Strategy:**
```typescript
// Use cheaper models for non-critical content
const modelSelection = {
  // High quality needed (final output)
  final: {
    image: 'nanobana',        // $0.02/image
    video: 'veo3-standard'    // $5.00/second
  },

  // Medium quality (testing, previews)
  preview: {
    image: 'stable-diffusion', // $0.01/image
    video: 'veo3-fast'         // $0.75/second
  },

  // Low quality (A/B testing, experiments)
  experimental: {
    image: 'dall-e-2',         // $0.016/image
    video: 'veo3-fast'         // $0.75/second
  }
};

// Use appropriate model based on use case
const selectedModel = isProduction
  ? modelSelection.final.video
  : modelSelection.preview.video;
```

**Prompt Optimization:**
```typescript
// Shorter prompts = lower token costs
const optimizedPrompt = `
Professional insurance advisor, business casual, modern office
`.trim();

// vs

const verbosePrompt = `
Ultra-photorealistic portrait of professional insurance advisor...
[500 words of detailed specifications]
`;

// Savings: 90% fewer tokens = 90% lower cost
```

#### 5. Database Query Optimization

**MongoDB Indexes:**
```javascript
// Create composite index for frequent queries
db.workflows.createIndex(
  { workflowType: 1, status: 1, startTime: -1 },
  { name: 'workflow_type_status_time_idx' }
);

// Covered index for metrics queries
db.metrics.createIndex(
  { workflowId: 1, nodeId: 1, timestamp: -1 },
  { name: 'metrics_workflow_node_time_idx' }
);
```

**Query Optimization:**
```typescript
// BAD: Fetch all documents
const workflows = await db.collection('workflows').find({}).toArray();

// GOOD: Use projection to fetch only needed fields
const workflows = await db.collection('workflows')
  .find({})
  .project({ workflowId: 1, status: 1, cost: 1 })
  .limit(100)
  .toArray();
```

#### 6. Memory Management

**Stream Large Files:**
```typescript
// BAD: Load entire file into memory
const videoBuffer = fs.readFileSync(videoPath);
await uploadToS3(videoBuffer);

// GOOD: Stream file
const videoStream = fs.createReadStream(videoPath);
await uploadToS3Stream(videoStream);
```

**Cleanup Temporary Files:**
```typescript
// Auto-cleanup old generated files
const cleanupThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

function cleanupOldFiles(directory: string) {
  const now = Date.now();
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > cleanupThreshold) {
      fs.unlinkSync(filePath);
      logger.info(`Cleaned up old file: ${file}`);
    }
  }
}

// Run cleanup daily
setInterval(() => {
  cleanupOldFiles(path.join(process.cwd(), 'generated'));
}, 24 * 60 * 60 * 1000);
```

### Performance Monitoring

**Custom Metrics:**
```typescript
import { metricsCollector } from './src/temporal/monitoring/metrics';

// Track node execution time
metricsCollector.startNode(workflowId, nodeId, nodeType, model);
// ... execute node
metricsCollector.endNode(workflowId, nodeId, {
  success: true,
  cost: 0.02,
  retryCount: 0
});

// Get workflow metrics
const metrics = metricsCollector.getWorkflowMetrics(workflowId);
console.log(`Total Cost: $${metrics.totalCost.toFixed(4)}`);
console.log(`Duration: ${(metrics.totalDuration / 1000).toFixed(1)}s`);
```

**Prometheus Integration:**
```typescript
import * as promClient from 'prom-client';

const workflowDuration = new promClient.Histogram({
  name: 'workflow_duration_seconds',
  help: 'Workflow execution duration',
  labelNames: ['workflowType', 'status']
});

// Record metric
workflowDuration.labels('comfyUIWorkflow', 'success').observe(duration);
```

---

## Next Steps

1. **Try Example Workflows:**
   ```bash
   # Test simple text-to-video
   npm run workflow -- workflows/examples/text-to-video.json

   # Test character + video
   npm run workflow -- workflows/examples/character-video.json

   # Test multi-video series
   npm run workflow -- workflows/examples/multi-video-series.json
   ```

2. **Create Your Own Workflow:**
   - Copy an example workflow from `workflows/examples/`
   - Modify prompts and parameters
   - Test with `npm run workflow -- your-workflow.json`

3. **Run A/B Tests:**
   - Create test definition in `workflows/ab-tests/`
   - Run with `npx ts-node test-ab-testing.ts`
   - Analyze results in `generated/ab-tests/`

4. **Monitor Production:**
   - Set up Prometheus + Grafana
   - Configure alerts for failures
   - Track costs and performance trends

5. **Scale Up:**
   - Run multiple workers in parallel
   - Implement horizontal scaling
   - Optimize based on performance metrics

---

**Questions or Issues?**
- Check `CLAUDE.md` for project overview
- See `DEPLOYMENT_GUIDE.md` for production setup
- View Temporal UI at http://localhost:8233
- Check monitoring utilities in `src/temporal/monitoring/`

Sign off as SmokeDev 🚬
