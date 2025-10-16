/**
 * Test Workflow Templates
 *
 * Validates that all workflow JSON templates are correctly structured
 * and compatible with the WorkflowExecutor
 */

import * as fs from 'fs';
import * as path from 'path';
import { WorkflowExecutor } from './WorkflowExecutor.js';
import { WorkflowConfig } from './types/WorkflowConfig.js';

interface TemplateTestResult {
  name: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  estimatedCost: number;
}

async function loadWorkflowTemplate(filename: string): Promise<WorkflowConfig> {
  const filePath = path.join(process.cwd(), 'workflows', filename);
  const jsonContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonContent) as WorkflowConfig;
}

async function testTemplate(filename: string): Promise<TemplateTestResult> {
  try {
    const workflow = await loadWorkflowTemplate(filename);
    const validation = WorkflowExecutor.validateWorkflow(workflow);

    return {
      name: workflow.name,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      estimatedCost: validation.estimatedCost
    };
  } catch (error) {
    return {
      name: filename,
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      estimatedCost: 0
    };
  }
}

async function main() {
  console.log('🧪 Testing Workflow Templates\n');

  const templates = [
    'single-video-template.json',
    'series-video-template.json',
    'no-human-template.json',
    'asset-animation-template.json'
  ];

  const results: TemplateTestResult[] = [];

  console.log('='.repeat(80));
  console.log('Loading and Validating Templates');
  console.log('='.repeat(80));

  for (const template of templates) {
    console.log(`\n📄 Testing: ${template}`);
    const result = await testTemplate(template);
    results.push(result);

    console.log(`   Name: ${result.name}`);
    console.log(`   Valid: ${result.valid ? '✅' : '❌'}`);
    console.log(`   Estimated cost: $${result.estimatedCost.toFixed(4)}`);

    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach((err) => console.log(`     ❌ ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings:`);
      result.warnings.forEach((warn) => console.log(`     ⚠️  ${warn}`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('Summary');
  console.log('='.repeat(80));

  const validCount = results.filter((r) => r.valid).length;
  const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);

  console.log(`\n✅ Valid templates: ${validCount}/${results.length}`);
  console.log(`💰 Total estimated cost: $${totalCost.toFixed(4)}`);
  console.log();

  results.forEach((result) => {
    const status = result.valid ? '✅' : '❌';
    console.log(`   ${status} ${result.name.padEnd(35)} $${result.estimatedCost.toFixed(4)}`);
  });

  // Template Comparison
  console.log('\n' + '='.repeat(80));
  console.log('Template Comparison');
  console.log('='.repeat(80));

  const comparison = results.map((r) => ({
    name: r.name,
    cost: r.estimatedCost,
    errorCount: r.errors.length,
    warningCount: r.warnings.length
  }));

  console.log('\nCost Analysis:');
  comparison
    .sort((a, b) => a.cost - b.cost)
    .forEach((item) => {
      console.log(
        `   ${item.name.padEnd(35)} $${item.cost.toFixed(4).padStart(8)} ${item.errorCount > 0 ? `(${item.errorCount} errors)` : ''}`
      );
    });

  // Use Case Examples
  console.log('\n' + '='.repeat(80));
  console.log('Template Use Cases');
  console.log('='.repeat(80));

  console.log(`
📋 single-video-template.json
   Use for: Creating one video with a realistic human character
   Example: Product demo, testimonial, tutorial with presenter
   Cost: ~$1.22 per video

📋 series-video-template.json
   Use for: Multiple videos with the same character (consistency)
   Example: Video series, course content, ongoing content creator
   Cost: ~$3.62 for 3 videos (one character + three videos)

📋 no-human-template.json
   Use for: Videos without any human characters
   Example: Nature scenes, product showcases, abstract backgrounds
   Cost: ~$1.20 per video

📋 asset-animation-template.json
   Use for: Animating products, logos, or objects
   Example: Product reveals, logo animations, e-commerce videos
   Cost: ~$1.28 per video
`);

  // Validation
  if (validCount === results.length) {
    console.log('='.repeat(80));
    console.log('✅ All templates are valid and ready to use!');
    console.log('='.repeat(80));
    process.exit(0);
  } else {
    console.log('='.repeat(80));
    console.log('❌ Some templates have validation errors. Please review above.');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
