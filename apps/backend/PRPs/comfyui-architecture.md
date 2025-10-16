# ComfyUI-Style Node Architecture

## Overview

This document describes the flexible node-based workflow system for viral video generation, inspired by ComfyUI. The architecture enables model swapping, A/B testing, and seamless Temporal fault tolerance integration.

## Architecture Goals

1. **Flexibility**: Easy model swapping (VEO3 ↔ Sora 2, NanoBanana ↔ Midjourney)
2. **Fault Tolerance**: Seamless integration with Temporal workflows
3. **Extensibility**: Simple addition of new nodes and models
4. **A/B Testing**: Built-in support for comparing models/parameters
5. **Backward Compatibility**: Works with existing template-based system

## Core Components

### 1. Node System

**Location**: `src/comfyui/types/NodeConfig.ts`

#### Node Types
```typescript
type NodeType =
  | 'image_generator'      // NanoBanana, Midjourney, DALL-E, Imagen
  | 'video_generator'      // VEO3, Sora 2, Sora 2.2
  | 'prompt_enhancer'      // Gemini, ChatGPT
  | 'video_stitcher'       // FFmpeg
  | 'video_enhancer'       // Topaz Video AI
  | 'logo_overlay'         // Watermarking
  | 'audio_processor'      // Audio processing
  | 'platform_optimizer';  // Platform-specific optimization
```

#### Node Structure
Each node has:
- **Inputs**: Typed slots for receiving data (string, number, image, video, etc.)
- **Outputs**: Typed slots for producing data
- **Parameters**: Node-specific configuration
- **Metadata**: Execution priority, timeout, retry config

```typescript
interface NodeConfig {
  id: string;
  type: NodeType;
  params: Record<string, any>;
  inputs: NodeSlot[];
  outputs: NodeSlot[];
  metadata?: {
    priority?: number;
    timeout?: number;
    retry?: { maxAttempts: number; backoffMs: number };
  };
}
```

### 2. Workflow System

**Location**: `src/comfyui/types/WorkflowConfig.ts`

#### Workflow Structure
```typescript
interface WorkflowConfig {
  id: string;
  name: string;
  executionMode: 'sequential' | 'parallel' | 'conditional';
  nodes: NodeConfig[];
  connections: NodeConnection[];
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  settings?: {
    timeout?: number;
    costLimit?: number;
    checkpointEnabled?: boolean;
  };
}
```

#### Example: Single Video Workflow JSON
```json
{
  "id": "single-video-v1",
  "name": "Single Video Generation",
  "version": "1.0.0",
  "executionMode": "sequential",
  "nodes": [
    {
      "id": "character_gen",
      "type": "image_generator",
      "params": {
        "model": "nanobana",
        "temperature": 0.3
      },
      "inputs": [
        {
          "name": "prompt",
          "type": "string",
          "description": "Character description",
          "required": true
        }
      ],
      "outputs": [
        {
          "name": "image",
          "type": "image",
          "description": "Generated character image"
        }
      ]
    },
    {
      "id": "video_gen",
      "type": "video_generator",
      "params": {
        "model": "veo3-fast",
        "duration": 4,
        "aspectRatio": "16:9"
      },
      "inputs": [
        {
          "name": "characterImage",
          "type": "image",
          "required": true
        },
        {
          "name": "prompt",
          "type": "string",
          "required": true
        }
      ],
      "outputs": [
        {
          "name": "video",
          "type": "video",
          "description": "Generated video"
        }
      ]
    }
  ],
  "connections": [
    {
      "sourceNodeId": "character_gen",
      "sourceSlot": "image",
      "targetNodeId": "video_gen",
      "targetSlot": "characterImage"
    }
  ]
}
```

### 3. Base Node Implementation

**Location**: `src/comfyui/BaseNode.ts`

All nodes extend `BaseNode` which provides:
- Input validation
- Default value handling
- Logging helpers
- Progress tracking
- Cost tracking
- Heartbeat (for Temporal)

```typescript
abstract class BaseNode implements INode {
  abstract execute(
    inputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult>;

  validate(): string[];
  estimateCost(inputs: Record<string, any>): number;

  // Helper methods
  protected validateInputs(inputs: Record<string, any>): string[];
  protected applyDefaults(inputs: Record<string, any>): Record<string, any>;
  protected log(context, level, message, data?): void;
  protected trackCost(context, amount, description): void;
}
```

### 4. Workflow Validator

**Location**: `src/comfyui/WorkflowValidator.ts`

Validates workflows before execution:
- **Structural validation**: Required fields, node existence
- **Connection validation**: Type compatibility, slot existence
- **Graph validation**: Circular dependencies, unreachable nodes
- **Performance analysis**: Cost estimates, execution time warnings

```typescript
const result = WorkflowValidator.validate(workflow);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

#### Validation Checks
1. ✅ All nodes have unique IDs
2. ✅ All connections reference existing nodes/slots
3. ✅ Type compatibility across connections
4. ✅ Required inputs have connections or defaults
5. ✅ No circular dependencies (DAG enforcement)
6. ⚠️ Warning for unused nodes
7. ⚠️ Warning for expensive nodes (cost estimation)

## Model Swapping

### Image Generator Models
```typescript
type ImageGeneratorModel =
  | 'nanobana'        // $0.02/image
  | 'midjourney'      // $0.08/image
  | 'dalle3'          // $0.08/image
  | 'imagen3'         // $0.08/image
  | 'imagen4';        // $0.08/image
```

### Video Generator Models
```typescript
type VideoGeneratorModel =
  | 'veo3'            // $1.20/4s
  | 'veo3-fast'       // Lower quality, faster
  | 'sora-2'          // Future integration
  | 'sora-2.2';       // Future integration
```

### How to Swap Models
Simply change the `params.model` field in node configuration:

```json
{
  "id": "video_gen",
  "type": "video_generator",
  "params": {
    "model": "sora-2"  // Changed from "veo3-fast"
  }
}
```

No code changes needed - the node implementation handles model selection.

## A/B Testing

### A/B Test Configuration
```typescript
interface ABTestConfig {
  name: string;
  nodeId: string;  // Which node to test
  variants: [
    { name: "nanobana", params: { model: "nanobana" } },
    { name: "midjourney", params: { model: "midjourney" } }
  ];
  runsPerVariant: 5;
  metrics: ['cost', 'time', 'quality'];
}
```

### Example: Test NanoBanana vs Midjourney
```json
{
  "name": "Character Generation Comparison",
  "nodeId": "character_gen",
  "variants": [
    {
      "name": "NanoBanana (Fast)",
      "params": { "model": "nanobana", "temperature": 0.3 }
    },
    {
      "name": "Midjourney (Quality)",
      "params": { "model": "midjourney", "quality": "high" }
    }
  ],
  "runsPerVariant": 10,
  "metrics": ["cost", "time", "quality"]
}
```

Result format:
```typescript
{
  winner: "NanoBanana (Fast)",
  confidence: 0.95,
  variants: {
    "NanoBanana (Fast)": {
      avgCost: 0.02,
      avgTime: 3500,  // ms
      qualityScore: 85
    },
    "Midjourney (Quality)": {
      avgCost: 0.08,
      avgTime: 12000,
      qualityScore: 92
    }
  }
}
```

## Temporal Integration

### Workflow Execution
Each node becomes a Temporal activity with automatic:
- **Checkpointing**: After each node completion
- **Retry**: Configurable per node
- **Heartbeat**: For long-running operations
- **Progress tracking**: Via workflow queries

### Example: ComfyUI Workflow as Temporal Workflow
```typescript
// src/temporal/workflows/comfyUIWorkflow.ts
export async function executeComfyUIWorkflow(
  workflowConfig: WorkflowConfig
): Promise<WorkflowExecutionResult> {
  const graph = WorkflowValidator.buildGraph(workflowConfig);
  const results = new Map<string, any>();

  // Execute nodes in topological order
  for (const nodeId of graph.executionOrder) {
    const node = graph.nodes.get(nodeId)!;

    // Collect inputs from previous nodes
    const inputs = collectInputs(node, results, workflowConfig);

    // Execute as Temporal activity (automatic checkpoint!)
    const result = await executeNode(node, inputs);

    results.set(nodeId, result.outputs);
  }

  return buildFinalResult(results);
}
```

## Extending the System

### Adding a New Node Type

1. **Define Node in registry** (`src/comfyui/nodes/registry.ts`):
```typescript
export const NODE_REGISTRY: NodeRegistryEntry[] = [
  {
    type: 'my_new_node',
    nodeClass: MyNewNode,
    displayName: 'My New Node',
    description: 'Does something amazing',
    category: 'processing',
    defaultConfig: {
      inputs: [/* ... */],
      outputs: [/* ... */]
    }
  }
];
```

2. **Implement Node class**:
```typescript
class MyNewNode extends BaseNode {
  async execute(
    inputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    // Validate inputs
    const errors = this.validateInputs(inputs);
    if (errors.length > 0) {
      return this.createErrorResult(errors.join(', '), 0);
    }

    // Apply defaults
    const processedInputs = this.applyDefaults(inputs);

    // Do the work
    this.log(context, 'info', 'Starting processing');
    const output = await this.doWork(processedInputs);

    // Track cost
    this.trackCost(context, 0.05, 'Processing fee');

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult(
      { result: output },
      executionTime,
      0.05
    );
  }

  private async doWork(inputs: any): Promise<any> {
    // Implementation here
  }
}
```

3. **Register node** (auto-discovered from registry)

### Adding a New Model to Existing Node

1. **Update model type** in `NodeConfig.ts`:
```typescript
export type VideoGeneratorModel =
  | 'veo3'
  | 'veo3-fast'
  | 'sora-2'
  | 'sora-2.2'
  | 'my-new-model';  // Add here
```

2. **Update node implementation** (`src/comfyui/nodes/VideoGeneratorNode.ts`):
```typescript
async execute(inputs, context) {
  const model = this.config.params.model;

  switch (model) {
    case 'veo3':
      return await this.veo3Service.generate(/* ... */);
    case 'sora-2':
      return await this.sora2Service.generate(/* ... */);
    case 'my-new-model':
      return await this.myNewModelService.generate(/* ... */);
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}
```

3. **Done!** Model is now swappable via JSON configuration

## Backward Compatibility

### Template Conversion
Existing templates automatically convert to ComfyUI workflows:

**Before (Template)**:
```typescript
{
  characterPrompt: "...",
  videoPrompt: "...",
  duration: 4
}
```

**After (ComfyUI Workflow)** - Auto-generated:
```json
{
  "nodes": [
    { "id": "char", "type": "image_generator", "params": { "model": "nanobana" } },
    { "id": "video", "type": "video_generator", "params": { "model": "veo3-fast" } }
  ],
  "connections": [
    { "sourceNodeId": "char", "sourceSlot": "image",
      "targetNodeId": "video", "targetSlot": "characterImage" }
  ]
}
```

Both execute identically, but ComfyUI version allows model swapping.

## Performance Optimization

### Parallel Execution
Nodes without dependencies can execute in parallel:

```typescript
// Sequential (slow)
executionMode: "sequential"  // char → video → logo → ... (linear)

// Parallel (fast)
executionMode: "parallel"    // char + logo + ... (simultaneous)
```

### Cost Optimization
Use validator warnings to optimize costs:

```typescript
const result = WorkflowValidator.validate(workflow);
for (const warning of result.warnings) {
  if (warning.type === 'high_cost') {
    console.warn(`⚠️ ${warning.message}`);
    console.log(`   Suggestion: ${warning.suggestion}`);
  }
}
```

## Future Enhancements

### Phase 3: React Flow Visual Editor
- Drag-and-drop workflow builder
- Live preview
- Export/import JSON workflows

### Phase 4: Advanced Features
- Conditional execution (if/else nodes)
- Loop nodes (batch processing)
- Subworkflow nodes (reusable components)
- Dynamic model selection based on runtime metrics

## File Structure

```
src/comfyui/
├── types/
│   ├── NodeConfig.ts          # Node interfaces and types
│   └── WorkflowConfig.ts      # Workflow interfaces and types
├── BaseNode.ts                 # Abstract base node class
├── WorkflowValidator.ts        # Workflow validation logic
├── WorkflowExecutor.ts         # Workflow execution engine (Phase 3)
└── nodes/
    ├── ImageGeneratorNode.ts   # Image generation node
    ├── VideoGeneratorNode.ts   # Video generation node
    ├── PromptEnhancerNode.ts   # Prompt enhancement node
    └── registry.ts             # Node registry

src/temporal/workflows/
└── comfyUIWorkflow.ts          # Temporal workflow integration

PRPs/
└── comfyui-architecture.md     # This document
```

## Benefits Summary

| Feature | Before (Templates) | After (ComfyUI Nodes) |
|---------|-------------------|------------------------|
| Model Swapping | Code change required | JSON config change |
| A/B Testing | Manual implementation | Built-in support |
| Fault Tolerance | Manual checkpointing | Automatic per node |
| Extensibility | Add new template | Add new node class |
| Visual Editor | Not possible | React Flow ready |
| Validation | Runtime errors | Pre-execution validation |

---

Sign off as SmokeDev 🚬
