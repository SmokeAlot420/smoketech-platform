/**
 * A/B Testing Framework Test
 *
 * Compares NanoBanana vs Midjourney for image generation
 * in the same workflow executed in parallel.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ABTestingFramework, ModelVariant } from './ABTestingFramework.js';
import type { WorkflowConfig } from './types/WorkflowConfig.js';

async function loadWorkflowTemplate(filename: string): Promise<WorkflowConfig> {
  const filePath = path.join(process.cwd(), 'workflows', filename);
  const jsonContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonContent) as WorkflowConfig;
}

async function main() {
  console.log('🧪 A/B Testing Framework - Model Comparison Test\n');
  console.log('='.repeat(80));
  console.log('Testing: NanoBanana vs Midjourney');
  console.log('Workflow: Single Video Generation');
  console.log('='.repeat(80));
  console.log();

  // Load base workflow
  console.log('📄 Loading workflow template...');
  const baseWorkflow = await loadWorkflowTemplate('single-video-template.json');
  console.log(`✅ Loaded: ${baseWorkflow.name}\n`);

  // Define model variants to compare
  const variants: ModelVariant[] = [
    {
      id: 'nanobana',
      name: 'NanoBanana (Gemini 2.5 Flash Image)',
      nodeType: 'image_generator',
      model: 'nanobana',
      paramOverrides: {
        temperature: 0.3,
        count: 1
      }
    },
    {
      id: 'midjourney',
      name: 'Midjourney V6',
      nodeType: 'image_generator',
      model: 'midjourney',
      paramOverrides: {
        temperature: 0.4,
        count: 1,
        quality: 'hd'
      }
    }
  ];

  console.log('🔧 Configured Variants:');
  variants.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.name}`);
    console.log(`      Node Type: ${v.nodeType}`);
    console.log(`      Model: ${v.model}`);
    if (v.paramOverrides) {
      console.log(`      Overrides: ${JSON.stringify(v.paramOverrides)}`);
    }
  });
  console.log();

  // Workflow inputs (same for both variants)
  const inputs = {
    characterPrompt: 'Professional marketing executive, 30-35 years old, confident smile, business attire, modern office background, natural lighting, ultra-photorealistic, sharp focus, 4K quality',
    videoPrompt: 'Marketing executive presenting quarterly results with enthusiastic gestures, professional demeanor, engaging smile, office setting, 8 seconds'
  };

  console.log('📋 Workflow Inputs:');
  console.log(`   Character: ${inputs.characterPrompt.substring(0, 80)}...`);
  console.log(`   Video: ${inputs.videoPrompt.substring(0, 80)}...\n`);

  // Initialize A/B testing framework
  console.log('🔌 Connecting to Temporal...');
  const framework = new ABTestingFramework();
  await framework.connect('localhost:7233');
  console.log('✅ Connected\n');

  // Run A/B test
  const results = await framework.runABTest(
    baseWorkflow,
    variants,
    inputs,
    {
      testName: 'NanoBanana vs Midjourney Image Generation',
      taskQueue: 'comfyui-test-queue',
      weightCost: 0.3,    // 30% weight on cost
      weightSpeed: 0.5,   // 50% weight on speed
      weightQuality: 0.2  // 20% weight on quality
    }
  );

  // Print formatted results
  framework.printResults(results);

  // Export results to JSON
  const outputDir = path.join(process.cwd(), 'generated', 'ab-tests');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${results.testId}.json`);
  framework.exportResults(results, outputPath);

  // Detailed analysis
  console.log('\n📊 DETAILED ANALYSIS:\n');

  console.log('Cost Comparison:');
  results.variants.forEach(v => {
    const costDiff = v.metrics.totalCost - results.comparison.cheapestCost;
    const costPercent = (costDiff / results.comparison.cheapestCost) * 100;
    console.log(`   ${v.variant.name}:`);
    console.log(`      Total: $${v.metrics.totalCost.toFixed(4)}`);
    console.log(`      Per Node: $${v.metrics.costPerNode.toFixed(4)}`);
    if (costDiff > 0) {
      console.log(`      ${costPercent.toFixed(1)}% more expensive than cheapest`);
    } else {
      console.log(`      ✅ Cheapest option`);
    }
  });

  console.log('\nSpeed Comparison:');
  results.variants.forEach(v => {
    const timeDiff = v.metrics.totalTime - results.comparison.fastestTime;
    const timePercent = (timeDiff / results.comparison.fastestTime) * 100;
    console.log(`   ${v.variant.name}:`);
    console.log(`      Total: ${(v.metrics.totalTime / 1000).toFixed(1)}s`);
    console.log(`      Per Node: ${(v.metrics.timePerNode / 1000).toFixed(1)}s`);
    if (timeDiff > 0) {
      console.log(`      ${timePercent.toFixed(1)}% slower than fastest`);
    } else {
      console.log(`      ✅ Fastest option`);
    }
  });

  console.log('\nValue Analysis (Cost × Time):');
  results.comparisonTable.forEach(row => {
    console.log(`   ${row.variant}:`);
    console.log(`      Value Score: ${row.valueScore.toFixed(4)} (lower is better)`);
    if (row.variant === results.comparison.bestValue.name) {
      console.log(`      ✅ Best value`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 RECOMMENDATION:\n');
  console.log(`Based on weighted scoring (Cost: 30%, Speed: 50%, Quality: 20%):`);
  console.log(`Use ${results.comparison.winner.name} for this workflow.\n`);

  console.log('Rationale:');
  if (results.comparison.winner.id === results.comparison.fastest.id) {
    console.log('   ✅ Fastest execution time');
  }
  if (results.comparison.winner.id === results.comparison.cheapest.id) {
    console.log('   ✅ Lowest cost');
  }
  if (results.comparison.winner.id === results.comparison.bestValue.id) {
    console.log('   ✅ Best cost/time ratio');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ A/B Test Complete!');
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
