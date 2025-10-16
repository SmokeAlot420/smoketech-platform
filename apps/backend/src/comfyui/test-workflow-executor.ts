/**
 * Test script for WorkflowExecutor
 *
 * Tests workflow execution with sample character-to-video workflow
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { WorkflowExecutor } from './WorkflowExecutor.js';
import { WorkflowConfig } from './types/WorkflowConfig.js';
import { NodeExecutionContext } from './types/NodeConfig.js';

async function main() {
  console.log('🧪 Testing WorkflowExecutor\n');

  // Create execution context
  const context: NodeExecutionContext = {
    workflowId: 'test-workflow',
    nodeId: 'executor',
    logger: {
      info: (msg, data?) => console.log(`ℹ️  ${msg}`, data || ''),
      warn: (msg, data?) => console.warn(`⚠️  ${msg}`, data || ''),
      error: (msg, err?) => console.error(`❌ ${msg}`, err || '')
    },
    costTracker: {
      addCost: (amount, desc) => console.log(`💰 Cost: $${amount.toFixed(4)} - ${desc}`),
      getTotalCost: () => 0
    },
    progress: {
      update: (percent, msg?) => console.log(`📊 Progress: ${percent}% ${msg || ''}`)
    }
  };

  // Test 1: Registry Validation
  console.log('='.repeat(80));
  console.log('Test 1: Node Registry');
  console.log('='.repeat(80));

  const registeredNodes = WorkflowExecutor.getRegisteredNodes();
  console.log(`\nRegistered nodes: ${registeredNodes.length}`);
  for (const node of registeredNodes) {
    console.log(`  - ${node.type}: ${node.displayName} (${node.category})`);
  }

  // Test 2: Sample Workflow (Character Image -> Video)
  console.log('\n' + '='.repeat(80));
  console.log('Test 2: Character-to-Video Workflow');
  console.log('='.repeat(80));

  const sampleWorkflow: WorkflowConfig = {
    id: 'character-video-v1',
    name: 'Character to Video Pipeline',
    version: '1.0.0',
    executionMode: 'sequential',
    nodes: [
      {
        id: 'character_image',
        type: 'image_generator',
        label: 'Generate Character',
        params: {
          model: 'nanobana',
          temperature: 0.3,
          count: 1,
          quality: 'hd',
          aspectRatio: '1:1'
        },
        inputs: [
          {
            name: 'prompt',
            type: 'string',
            description: 'Character description',
            required: true
          }
        ],
        outputs: [
          {
            name: 'image',
            type: 'image',
            description: 'Generated character image',
            required: false
          },
          {
            name: 'imagePath',
            type: 'string',
            description: 'Path to image',
            required: false
          }
        ]
      },
      {
        id: 'video_gen',
        type: 'video_generator',
        label: 'Generate Video',
        params: {
          model: 'veo3-fast',
          duration: 8,
          aspectRatio: '16:9',
          quality: 'high',
          count: 1,
          enableSound: true
        },
        inputs: [
          {
            name: 'prompt',
            type: 'string',
            description: 'Video action prompt',
            required: true
          },
          {
            name: 'characterImage',
            type: 'string',
            description: 'Character image path',
            required: false
          }
        ],
        outputs: [
          {
            name: 'video',
            type: 'video',
            description: 'Generated video',
            required: false
          },
          {
            name: 'videoPath',
            type: 'string',
            description: 'Path to video',
            required: false
          }
        ]
      }
    ],
    connections: [
      {
        sourceNodeId: 'character_image',
        sourceSlot: 'imagePath',
        targetNodeId: 'video_gen',
        targetSlot: 'characterImage'
      }
    ],
    inputs: [
      {
        name: 'characterPrompt',
        type: 'string',
        description: 'Character description',
        required: true,
        targetNodeId: 'character_image',
        targetSlot: 'prompt'
      },
      {
        name: 'videoPrompt',
        type: 'string',
        description: 'Video action',
        required: true,
        targetNodeId: 'video_gen',
        targetSlot: 'prompt'
      }
    ],
    outputs: [
      {
        name: 'finalVideo',
        type: 'video',
        description: 'Generated video with character',
        sourceNodeId: 'video_gen',
        sourceSlot: 'videoPath'
      }
    ]
  };

  // Test 3: Workflow Validation
  console.log('\n' + '='.repeat(80));
  console.log('Test 3: Workflow Validation');
  console.log('='.repeat(80));

  const validation = WorkflowExecutor.validateWorkflow(sampleWorkflow);
  console.log(`\nValid: ${validation.valid ? '✅' : '❌'}`);
  console.log(`Estimated cost: $${validation.estimatedCost.toFixed(4)}`);

  if (validation.errors.length > 0) {
    console.log('\nErrors:');
    validation.errors.forEach((err) => console.log(`  ❌ ${err}`));
  }

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
  }

  if (!validation.valid) {
    console.error('\n❌ Workflow validation failed, aborting execution');
    return;
  }

  // Test 4: Workflow Execution (dry run - validation only)
  console.log('\n' + '='.repeat(80));
  console.log('Test 4: Workflow Execution (Dry Run)');
  console.log('='.repeat(80));

  console.log('\n⚠️  Skipping actual execution (requires API credentials and takes ~3 minutes)');
  console.log('To test actual execution, uncomment the code below and ensure:');
  console.log('  1. GEMINI_API_KEY is set in .env (for NanoBanana)');
  console.log('  2. GCP_PROJECT_ID and GCP_LOCATION are set (for VEO3)');
  console.log('  3. Google Cloud credentials are configured\n');

  // Uncomment to test actual execution:
  /*
  const workflowInputs = {
    characterPrompt: 'Professional business person, 30 years old, confident expression, business casual attire',
    videoPrompt: 'Walking confidently in modern office, natural movements, professional demeanor'
  };

  const result = await WorkflowExecutor.executeWorkflow(
    sampleWorkflow,
    workflowInputs,
    context
  );

  console.log('\n' + '='.repeat(80));
  console.log('📊 WORKFLOW RESULT');
  console.log('='.repeat(80));
  console.log(`Success: ${result.success}`);
  console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
  console.log(`Total cost: $${result.totalCost.toFixed(4)}`);

  if (result.success) {
    console.log('\nWorkflow Outputs:');
    for (const [key, value] of Object.entries(result.outputs)) {
      console.log(`  ${key}: ${value}`);
    }

    console.log('\nNode Results:');
    Array.from(result.nodeResults.entries()).forEach(([nodeId, nodeResult]) => {
      console.log(`  ${nodeId}:`);
      console.log(`    Success: ${nodeResult.success}`);
      console.log(`    Time: ${(nodeResult.executionTime / 1000).toFixed(2)}s`);
      console.log(`    Cost: $${nodeResult.cost.toFixed(4)}`);
    });
  } else {
    console.log(`\nError: ${result.error}`);
  }
  */

  // Test 5: Invalid Workflow Detection
  console.log('='.repeat(80));
  console.log('Test 5: Invalid Workflow Detection');
  console.log('='.repeat(80));

  const invalidWorkflow: WorkflowConfig = {
    ...sampleWorkflow,
    id: 'invalid-workflow',
    connections: [
      {
        sourceNodeId: 'character_image',
        sourceSlot: 'imagePath',
        targetNodeId: 'video_gen',
        targetSlot: 'characterImage'
      },
      // Circular dependency
      {
        sourceNodeId: 'video_gen',
        sourceSlot: 'videoPath',
        targetNodeId: 'character_image',
        targetSlot: 'prompt'
      }
    ]
  };

  const invalidValidation = WorkflowExecutor.validateWorkflow(invalidWorkflow);
  console.log(`\nCircular dependency detected: ${!invalidValidation.valid ? '✅' : '❌'}`);
  if (invalidValidation.errors.length > 0) {
    console.log('Errors:');
    invalidValidation.errors.forEach((err) => console.log(`  ❌ ${err}`));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed!');
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
