/**
 * Test script for VideoGeneratorNode
 *
 * Tests model swapping and video generation functionality
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { VideoGeneratorNode } from './VideoGeneratorNode.js';
import { NodeExecutionContext } from '../types/NodeConfig.js';

async function main() {
  console.log('🧪 Testing VideoGeneratorNode\n');

  // Create context
  const context: NodeExecutionContext = {
    workflowId: 'test-workflow',
    nodeId: 'test-node',
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

  // Test 1: VEO3 Fast Generation (validation only - no actual generation)
  console.log('='.repeat(80));
  console.log('Test 1: VEO3 Fast Video Generation (Validation)');
  console.log('='.repeat(80));

  const veo3FastNode = VideoGeneratorNode.veo3Fast({
    duration: 8,
    aspectRatio: '16:9',
    enableSound: true
  });

  // Validate node
  const errors = veo3FastNode.validate();
  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    return;
  }
  console.log('✅ Node validation passed\n');

  // Estimate cost
  const estimatedCost = veo3FastNode.estimateCost({});
  console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);

  console.log('⚠️  Skipping actual generation (requires GCP credentials and takes ~2 minutes)\n');
  console.log('To test actual generation, uncomment the execution code below and ensure:');
  console.log('  1. GCP_PROJECT_ID and GCP_LOCATION are set in .env');
  console.log('  2. Google Cloud credentials are configured');
  console.log('  3. Vertex AI API is enabled\n');

  // Uncomment to test actual generation:
  /*
  try {
    const result = await veo3FastNode.execute(
      {
        prompt: 'Professional business person in modern office, walking confidently toward camera, natural lighting, realistic movements'
      },
      context
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULT');
    console.log('='.repeat(80));
    console.log(`Success: ${result.success}`);
    console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
    console.log(`Cost: $${result.cost.toFixed(4)}`);

    if (result.success) {
      console.log(`Video path: ${result.outputs.videoPath}`);
      console.log(`Metadata:`, result.outputs.metadata);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  */

  // Test 2: Model Swapping (validation only, not executed)
  console.log('='.repeat(80));
  console.log('Test 2: Model Swapping Validation');
  console.log('='.repeat(80));

  const models = ['veo3', 'veo3-fast', 'sora-2', 'sora-2.2'] as const;

  for (const model of models) {
    const node = VideoGeneratorNode.create(model, { duration: 8 });
    const errors = node.validate();
    const cost = node.estimateCost({});

    console.log(`\n${model}:`);
    console.log(`  Valid: ${errors.length === 0 ? '✅' : '❌'}`);
    console.log(`  Estimated cost (8s): $${cost.toFixed(4)}`);

    if (errors.length > 0) {
      console.log(`  Errors:`, errors);
    }
  }

  // Test 3: Helper methods
  console.log('\n' + '='.repeat(80));
  console.log('Test 3: Helper Methods');
  console.log('='.repeat(80));

  const helpers = [
    { name: 'veo3Fast()', node: VideoGeneratorNode.veo3Fast() },
    { name: 'veo3()', node: VideoGeneratorNode.veo3() },
    { name: 'sora2()', node: VideoGeneratorNode.sora2() },
    { name: 'sora22()', node: VideoGeneratorNode.sora22() }
  ];

  for (const helper of helpers) {
    const params = helper.node.config.params as any;
    console.log(`\n${helper.name}: model="${params.model}" ✅`);
  }

  // Test 4: Duration and cost validation
  console.log('\n' + '='.repeat(80));
  console.log('Test 4: Duration and Cost Calculations');
  console.log('='.repeat(80));

  const durations = [4, 6, 8] as const;
  for (const duration of durations) {
    const node = VideoGeneratorNode.veo3Fast({ duration });
    const cost = node.estimateCost({});
    console.log(`\n${duration}s video: $${cost.toFixed(4)} (VEO3 Fast)`);
  }

  // Test 5: Character image input validation
  console.log('\n' + '='.repeat(80));
  console.log('Test 5: Character Image Input Validation');
  console.log('='.repeat(80));

  const nodeWithImage = VideoGeneratorNode.veo3Fast();
  const imageErrors = nodeWithImage.validateInputs({
    prompt: 'Walking in office',
    characterImage: '/path/to/character.png'
  });

  console.log(`\nImage-to-video validation: ${imageErrors.length === 0 ? '✅' : '❌'}`);
  if (imageErrors.length > 0) {
    console.log('Errors:', imageErrors);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed!');
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
