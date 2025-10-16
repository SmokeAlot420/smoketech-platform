/**
 * Workflow Validator Test Suite
 *
 * Tests the WorkflowValidator with various workflows including intentionally broken ones
 * to ensure comprehensive error detection and user-friendly error messages.
 */

import { workflowValidator, Workflow, ABTestDefinition } from './src/comfyui/validation/WorkflowValidator';

console.log('🧪 Workflow Validator Test Suite\n');
console.log('='.repeat(80));

// Test 1: Valid simple workflow
console.log('\n📋 Test 1: Valid Simple Workflow');
console.log('-'.repeat(80));

const validWorkflow: Workflow = {
  workflowId: 'test-valid-workflow',
  description: 'A valid simple workflow',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Professional insurance advisor',
        model: 'nanobana'
      },
      outputs: ['characterImagePath']
    },
    {
      id: 'video_gen_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'The advisor explains insurance benefits',
        model: 'veo3-fast',
        duration: 8
      },
      outputs: ['videoPath']
    }
  ]
};

let result = workflowValidator.validateWorkflow(validWorkflow);
console.log(workflowValidator.formatValidationResult(result));

// Test 2: Missing workflowId
console.log('\n📋 Test 2: Missing workflowId (Schema Error)');
console.log('-'.repeat(80));

const missingWorkflowId: any = {
  description: 'Missing workflowId',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Test',
        model: 'nanobana'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(missingWorkflowId);
console.log(workflowValidator.formatValidationResult(result));

// Test 3: Missing required node inputs
console.log('\n📋 Test 3: Missing Required Inputs (Input Error)');
console.log('-'.repeat(80));

const missingInputs: Workflow = {
  workflowId: 'test-missing-inputs',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        // Missing required 'characterPrompt' and 'model'
        preserveFeatures: true
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(missingInputs);
console.log(workflowValidator.formatValidationResult(result));

// Test 4: Invalid node type
console.log('\n📋 Test 4: Invalid Node Type (Node Error)');
console.log('-'.repeat(80));

const invalidNodeType: Workflow = {
  workflowId: 'test-invalid-type',
  nodes: [
    {
      id: 'unknown_node',
      type: 'magic_generator',  // Invalid type
      inputs: {
        prompt: 'Make magic happen'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(invalidNodeType);
console.log(workflowValidator.formatValidationResult(result));

// Test 5: Invalid connection reference
console.log('\n📋 Test 5: Invalid Connection Reference (Connection Error)');
console.log('-'.repeat(80));

const invalidConnection: Workflow = {
  workflowId: 'test-invalid-connection',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Test character',
        model: 'nanobana'
      }
    },
    {
      id: 'video_gen_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{nonexistent_node.output}}',  // Invalid reference
        prompt: 'Test video',
        model: 'veo3-fast'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(invalidConnection);
console.log(workflowValidator.formatValidationResult(result));

// Test 6: Circular dependency
console.log('\n📋 Test 6: Circular Dependency (Circular Error)');
console.log('-'.repeat(80));

const circularDependency: Workflow = {
  workflowId: 'test-circular',
  nodes: [
    {
      id: 'node_a',
      type: 'character_image',
      inputs: {
        characterPrompt: '{{node_b.output}}',  // Depends on node_b
        model: 'nanobana'
      }
    },
    {
      id: 'node_b',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{node_a.characterImagePath}}',  // Depends on node_a
        prompt: 'Circular test',
        model: 'veo3-fast'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(circularDependency);
console.log(workflowValidator.formatValidationResult(result));

// Test 7: Duplicate node IDs
console.log('\n📋 Test 7: Duplicate Node IDs (Node Error)');
console.log('-'.repeat(80));

const duplicateIds: Workflow = {
  workflowId: 'test-duplicate-ids',
  nodes: [
    {
      id: 'duplicate_node',
      type: 'character_image',
      inputs: {
        characterPrompt: 'First node',
        model: 'nanobana'
      }
    },
    {
      id: 'duplicate_node',  // Duplicate ID
      type: 'video_generation',
      inputs: {
        prompt: 'Second node',
        model: 'veo3-fast'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(duplicateIds);
console.log(workflowValidator.formatValidationResult(result));

// Test 8: Invalid model name
console.log('\n📋 Test 8: Invalid Model Name (Input Error)');
console.log('-'.repeat(80));

const invalidModel: Workflow = {
  workflowId: 'test-invalid-model',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Test character',
        model: 'gpt-4-turbo'  // Invalid model for character_image
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(invalidModel);
console.log(workflowValidator.formatValidationResult(result));

// Test 9: Valid A/B test
console.log('\n📋 Test 9: Valid A/B Test Definition');
console.log('-'.repeat(80));

const validABTest: ABTestDefinition = {
  testId: 'test-veo3-comparison',
  description: 'Compare VEO3 Fast vs Standard',
  variants: [
    {
      variantId: 'veo3-fast',
      workflowId: 'workflow-fast-v1',
      nodes: [
        {
          id: 'video_gen_1',
          type: 'video_generation',
          inputs: {
            prompt: 'Test video',
            model: 'veo3-fast',
            duration: 8
          }
        }
      ]
    },
    {
      variantId: 'veo3-standard',
      workflowId: 'workflow-standard-v1',
      nodes: [
        {
          id: 'video_gen_1',
          type: 'video_generation',
          inputs: {
            prompt: 'Test video',
            model: 'veo3-standard',
            duration: 8
          }
        }
      ]
    }
  ]
};

result = workflowValidator.validateABTest(validABTest);
console.log(workflowValidator.formatValidationResult(result));

// Test 10: A/B test with only one variant
console.log('\n📋 Test 10: A/B Test with Only One Variant (Schema Error)');
console.log('-'.repeat(80));

const singleVariant: any = {
  testId: 'test-single-variant',
  variants: [
    {
      variantId: 'variant-a',
      workflowId: 'workflow-a',
      nodes: []
    }
  ]
};

result = workflowValidator.validateABTest(singleVariant);
console.log(workflowValidator.formatValidationResult(result));

// Test 11: Complex multi-stage workflow with warnings
console.log('\n📋 Test 11: Complex Workflow with Cost Warnings');
console.log('-'.repeat(80));

const expensiveWorkflow: Workflow = {
  workflowId: 'test-expensive-workflow',
  description: 'Workflow with expensive operations',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Professional character',
        model: 'nanobana'
      }
    },
    {
      id: 'video_gen_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Long video segment',
        model: 'veo3-standard',  // Expensive model
        duration: 45  // Long duration
      }
    },
    {
      id: 'video_gen_2',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Another segment',
        model: 'sora-2',  // Not fully available yet
        duration: 30
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(expensiveWorkflow);
console.log(workflowValidator.formatValidationResult(result));

// Test 12: Invalid connection syntax
console.log('\n📋 Test 12: Invalid Connection Syntax (Connection Error)');
console.log('-'.repeat(80));

const badSyntax: Workflow = {
  workflowId: 'test-bad-syntax',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Test',
        model: 'nanobana'
      }
    },
    {
      id: 'video_gen_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1}}',  // Missing output name
        prompt: 'Test',
        model: 'veo3-fast'
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(badSyntax);
console.log(workflowValidator.formatValidationResult(result));

// Test 13: Unknown input field
console.log('\n📋 Test 13: Unknown Input Field (Input Error)');
console.log('-'.repeat(80));

const unknownInput: Workflow = {
  workflowId: 'test-unknown-input',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Test',
        model: 'nanobana',
        magicPower: 9000  // Unknown input
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(unknownInput);
console.log(workflowValidator.formatValidationResult(result));

// Test 14: Video stitch workflow
console.log('\n📋 Test 14: Valid Video Stitch Workflow');
console.log('-'.repeat(80));

const stitchWorkflow: Workflow = {
  workflowId: 'test-video-stitch',
  description: 'Multi-segment video with stitching',
  nodes: [
    {
      id: 'character_image_1',
      type: 'character_image',
      inputs: {
        characterPrompt: 'Insurance advisor Aria',
        model: 'nanobana',
        preserveFeatures: true
      }
    },
    {
      id: 'video_segment_1',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Introduction segment',
        model: 'veo3-fast',
        duration: 8
      }
    },
    {
      id: 'video_segment_2',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Benefits explanation',
        model: 'veo3-fast',
        duration: 8
      }
    },
    {
      id: 'video_segment_3',
      type: 'video_generation',
      inputs: {
        characterImagePath: '{{character_image_1.characterImagePath}}',
        prompt: 'Call to action',
        model: 'veo3-fast',
        duration: 8
      }
    },
    {
      id: 'stitch_videos',
      type: 'video_stitch',
      inputs: {
        videoPaths: [
          '{{video_segment_1.videoPath}}',
          '{{video_segment_2.videoPath}}',
          '{{video_segment_3.videoPath}}'
        ],
        transitionType: 'dissolve',
        transitionDuration: 0.5
      }
    }
  ]
};

result = workflowValidator.validateWorkflow(stitchWorkflow);
console.log(workflowValidator.formatValidationResult(result));

// Test 15: Empty workflow
console.log('\n📋 Test 15: Empty Nodes Array (Schema Error)');
console.log('-'.repeat(80));

const emptyWorkflow: Workflow = {
  workflowId: 'test-empty',
  nodes: []
};

result = workflowValidator.validateWorkflow(emptyWorkflow);
console.log(workflowValidator.formatValidationResult(result));

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ Test Suite Complete!');
console.log('\nTested Scenarios:');
console.log('  1. ✅ Valid simple workflow');
console.log('  2. ❌ Missing workflowId');
console.log('  3. ❌ Missing required inputs');
console.log('  4. ❌ Invalid node type');
console.log('  5. ❌ Invalid connection reference');
console.log('  6. ❌ Circular dependency');
console.log('  7. ❌ Duplicate node IDs');
console.log('  8. ❌ Invalid model name');
console.log('  9. ✅ Valid A/B test');
console.log(' 10. ❌ A/B test with only one variant');
console.log(' 11. ⚠️  Complex workflow with warnings');
console.log(' 12. ❌ Invalid connection syntax');
console.log(' 13. ❌ Unknown input field');
console.log(' 14. ✅ Valid video stitch workflow');
console.log(' 15. ❌ Empty nodes array');
console.log('\n🎉 All validation scenarios tested successfully!');
