# Workflow JSON Validator

Comprehensive validation system for ComfyUI workflow JSON structures with user-friendly error messages and suggestions.

## Features

- ✅ **JSON Schema Validation** - Validates workflow structure (workflowId, nodes, etc.)
- ✅ **Node Type Validation** - Ensures all node types are supported and properly configured
- ✅ **Connection Validation** - Validates input/output connections between nodes
- ✅ **Circular Dependency Detection** - Prevents infinite loops in workflow execution
- ✅ **User-Friendly Error Messages** - Clear errors with suggestions for fixes
- ⚠️ **Performance Warnings** - Cost and performance optimization suggestions

## Quick Start

```typescript
import { workflowValidator } from './src/comfyui/validation/WorkflowValidator';

// Validate a workflow
const workflow = {
  workflowId: 'my-workflow-v1',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Professional insurance advisor',
        model: 'nanobana'
      }
    },
    {
      id: 'video_gen_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Explaining insurance benefits',
        model: 'veo3-fast'
      }
    }
  ]
};

const result = workflowValidator.validateWorkflow(workflow);

if (result.valid) {
  console.log('✅ Workflow is valid!');
} else {
  console.log(workflowValidator.formatValidationResult(result));
}
```

## Supported Node Types

### character_image
Generates character images using AI models.

**Required Inputs:**
- `characterPrompt` (string) - Description of the character
- `model` (string) - Model to use: `nanobana`, `midjourney`, `dalle`, `imagen`, `stable-diffusion`

**Optional Inputs:**
- `preserveFeatures` (boolean) - Maintain character consistency
- `temperature` (number) - Creativity level (0-1)
- `negativePrompt` (string) - What to avoid
- `seed` (number) - Reproducibility seed

**Outputs:**
- `characterImagePath` - Path to generated image

### video_generation
Generates videos from prompts and optional character images.

**Required Inputs:**
- `prompt` (string) - Video description
- `model` (string) - Model to use: `veo3-fast`, `veo3-standard`, `sora-2`, `runway-gen3`

**Optional Inputs:**
- `characterImagePath` (string) - Reference image for character
- `duration` (number) - Video length in seconds
- `aspectRatio` (string) - e.g., "16:9", "9:16"
- `seed` (number) - Reproducibility seed
- `guidanceScale` (number) - How closely to follow prompt

**Outputs:**
- `videoPath` - Path to generated video

### video_stitch
Stitches multiple videos together with transitions.

**Required Inputs:**
- `videoPaths` (array) - Array of video paths or connections

**Optional Inputs:**
- `transitionType` (string) - Transition effect
- `transitionDuration` (number) - Transition length in seconds
- `outputPath` (string) - Custom output path

**Outputs:**
- `stitchedVideoPath` - Path to final video

### audio_generation
Generates audio from text using TTS.

**Required Inputs:**
- `text` (string) - Text to convert to speech
- `voice` (string) - Voice model to use

**Optional Inputs:**
- `speed` (number) - Playback speed
- `pitch` (number) - Voice pitch
- `emotion` (string) - Emotional tone

**Outputs:**
- `audioPath` - Path to generated audio

### video_enhance
Enhances video quality using Topaz Video AI.

**Required Inputs:**
- `videoPath` (string) - Video to enhance

**Optional Inputs:**
- `targetResolution` (string) - e.g., "1080p", "4k"
- `model` (string) - Enhancement model: `proteus`, `artemis`
- `denoise` (boolean) - Apply noise reduction

**Outputs:**
- `enhancedVideoPath` - Path to enhanced video

## Connection Syntax

To connect nodes, use the template syntax: `{{node_id.output_name}}`

**Example:**
```json
{
  "id": "video_gen_1",
  "type": "video_generation",
  "inputs": {
    "characterImagePath": "{{character_image_1.characterImagePath}}",
    "prompt": "Video description"
  }
}
```

## A/B Testing

Validate A/B test definitions with multiple workflow variants:

```typescript
const abTest = {
  testId: 'veo3-fast-vs-standard',
  description: 'Compare VEO3 models',
  variants: [
    {
      variantId: 'veo3-fast',
      workflowId: 'workflow-fast-v1',
      nodes: [/* ... */]
    },
    {
      variantId: 'veo3-standard',
      workflowId: 'workflow-standard-v1',
      nodes: [/* ... */]
    }
  ]
};

const result = workflowValidator.validateABTest(abTest);
```

## Error Types

### Schema Errors
Issues with workflow structure (missing workflowId, empty nodes, etc.)

**Example:**
```
❌ [SCHEMA] Workflow must have a workflowId
   Path: workflowId
   💡 Add a unique workflowId like "workflow-v1"
```

### Node Errors
Problems with node configuration (invalid types, duplicate IDs, etc.)

**Example:**
```
❌ [NODE] Unknown node type: magic_generator
   Path: nodes[0].type
   Node: unknown_node
   💡 Use one of: character_image, video_generation, video_stitch
```

### Input Errors
Missing or invalid node inputs

**Example:**
```
❌ [INPUT] Node character_image_1 missing required input: model
   Path: nodes[0].inputs.model
   Node: character_image_1
   💡 Add model to the inputs object
```

### Connection Errors
Invalid node connections or references

**Example:**
```
❌ [CONNECTION] Node video_gen_1 references non-existent node: nonexistent_node
   Path: nodes[1].inputs.characterImagePath
   Node: video_gen_1
   💡 Available nodes: character_image_1, video_gen_1
```

### Circular Errors
Circular dependencies detected

**Example:**
```
❌ [CIRCULAR] Circular dependency detected: node_a → node_b → node_a
   Node: node_a
   💡 Remove circular references between nodes
```

## Warnings

The validator also provides warnings for potential issues that don't prevent execution:

### Cost Warnings
```
⚠️  [COST] VEO3 Standard costs $5/second. Consider veo3-fast ($0.75/second) for cost savings
   Node: video_gen_1
```

### Performance Warnings
```
⚠️  [PERFORMANCE] Long video duration (45s) may take significant time to generate
   Node: video_gen_1
```

### Compatibility Warnings
```
⚠️  [COMPATIBILITY] Sora 2 model is not yet fully available. Fallback to veo3-fast recommended
   Node: video_gen_2
```

## Testing

Run the comprehensive test suite:

```bash
npx tsx test-workflow-validator.ts
```

The test suite includes 15 scenarios:
1. Valid simple workflow
2. Missing workflowId
3. Missing required inputs
4. Invalid node type
5. Invalid connection reference
6. Circular dependency
7. Duplicate node IDs
8. Invalid model name
9. Valid A/B test
10. A/B test with only one variant
11. Complex workflow with warnings
12. Invalid connection syntax
13. Unknown input field
14. Valid video stitch workflow
15. Empty nodes array

## Integration

### With SmokeTech Studio UI

```typescript
// In workflow-generator/page.tsx
import { workflowValidator } from '@/src/comfyui/validation/WorkflowValidator';

const handleValidate = () => {
  const workflow = JSON.parse(workflowJSON);
  const result = workflowValidator.validateWorkflow(workflow);

  if (!result.valid) {
    alert(workflowValidator.formatValidationResult(result));
    return;
  }

  // Proceed with workflow execution
  startGeneration();
};
```

### With Temporal Workflows

```typescript
// In comfyui activity
import { workflowValidator } from './validation/WorkflowValidator';

export async function executeComfyUIWorkflow(workflow: Workflow) {
  // Validate before execution
  const validation = workflowValidator.validateWorkflow(workflow);

  if (!validation.valid) {
    throw new Error(`Invalid workflow: ${JSON.stringify(validation.errors)}`);
  }

  // Execute workflow...
}
```

## Model Pricing Reference

### Character Image Models
- **NanoBanana**: $0.02/image (Recommended)
- **Midjourney**: $0.08/image
- **DALL-E 3 HD**: $0.08/image
- **Imagen 3**: $0.08/image
- **Stable Diffusion**: $0.01/image

### Video Generation Models
- **VEO3 Fast**: $0.75/second (Recommended)
- **VEO3 Standard**: $5.00/second (High quality)
- **Sora 2**: $5.00/second (Coming soon)
- **Runway Gen3**: $3.00/second

## Best Practices

1. **Always validate before execution** - Catch errors early
2. **Use meaningful node IDs** - Makes debugging easier
3. **Keep workflows modular** - Reuse validated components
4. **Test with cost-effective models first** - Use veo3-fast before veo3-standard
5. **Monitor warnings** - Optimize based on suggestions
6. **Version your workflows** - Include version in workflowId

## Extending the Validator

To add a new node type:

```typescript
// In WorkflowValidator.ts
const NODE_TYPE_SCHEMAS = {
  // ... existing types
  my_new_node: {
    requiredInputs: ['input1', 'input2'],
    optionalInputs: ['option1'],
    outputs: ['output1'],
    description: 'Description of what this node does'
  }
};
```

To add valid models for a node type:

```typescript
const VALID_MODELS = {
  // ... existing models
  my_new_node: ['model-a', 'model-b']
};
```

## License

Part of the Viral Content Generation System
SmokeDev 🚬
