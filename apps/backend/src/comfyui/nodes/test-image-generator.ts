/**
 * Test script for ImageGeneratorNode
 *
 * Tests model swapping and generation functionality
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { ImageGeneratorNode } from './ImageGeneratorNode.js';
import { NodeExecutionContext } from '../types/NodeConfig.js';

async function main() {
  console.log('🧪 Testing ImageGeneratorNode\n');

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

  // Test 1: NanoBanana Generation
  console.log('='.repeat(80));
  console.log('Test 1: NanoBanana Image Generation');
  console.log('='.repeat(80));

  const nanoBananaNode = ImageGeneratorNode.nanoBanana({
    temperature: 0.3
  });

  // Validate node
  const errors = nanoBananaNode.validate();
  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    return;
  }
  console.log('✅ Node validation passed\n');

  // Estimate cost
  const estimatedCost = nanoBananaNode.estimateCost({});
  console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);

  // Execute
  try {
    const result = await nanoBananaNode.execute(
      {
        prompt: 'Professional business person, 30 years old, office background, natural lighting, realistic skin texture'
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
      console.log(`Image path: ${result.outputs.imagePath}`);
      console.log(`Metadata:`, result.outputs.metadata);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  // Test 2: Model Swapping (validation only, not executed)
  console.log('\n' + '='.repeat(80));
  console.log('Test 2: Model Swapping Validation');
  console.log('='.repeat(80));

  const models = ['nanobana', 'midjourney', 'dalle3', 'imagen3', 'imagen4'] as const;

  for (const model of models) {
    const node = ImageGeneratorNode.create(model);
    const errors = node.validate();
    const cost = node.estimateCost({});

    console.log(`\n${model}:`);
    console.log(`  Valid: ${errors.length === 0 ? '✅' : '❌'}`);
    console.log(`  Estimated cost: $${cost.toFixed(4)}`);

    if (errors.length > 0) {
      console.log(`  Errors:`, errors);
    }
  }

  // Test 3: Helper methods
  console.log('\n' + '='.repeat(80));
  console.log('Test 3: Helper Methods');
  console.log('='.repeat(80));

  const helpers = [
    { name: 'nanoBanana()', node: ImageGeneratorNode.nanoBanana() },
    { name: 'midjourney()', node: ImageGeneratorNode.midjourney() },
    { name: 'dalle3()', node: ImageGeneratorNode.dalle3() },
    { name: 'imagen3()', node: ImageGeneratorNode.imagen3() },
    { name: 'imagen4()', node: ImageGeneratorNode.imagen4() }
  ];

  for (const helper of helpers) {
    const params = helper.node.config.params as any;
    console.log(`\n${helper.name}: model="${params.model}" ✅`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed!');
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
