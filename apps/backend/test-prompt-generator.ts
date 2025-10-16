/**
 * Test Sequential Prompt Generator
 *
 * Tests the smart prompt generation service with various master prompts
 * to verify it correctly splits content and follows SEQUENTIAL_EXTEND_PROMPTING_GUIDE.md patterns.
 */

import dotenv from 'dotenv';
dotenv.config();

import { sequentialPromptGenerator } from './src/services/sequentialPromptGenerator';

async function testPromptGenerator() {
  console.log('🧪 Testing Sequential Prompt Generator\n');

  // Test Case 1: Explanatory Content (Insurance Benefits)
  console.log('📝 Test 1: Explanatory Content - Insurance Benefits');
  console.log('─'.repeat(80));

  const test1 = await sequentialPromptGenerator.generateSegmentPrompts({
    masterPrompt: 'Explain QuoteMoto insurance benefits: instant quotes, no personal info needed, compare 50+ insurers, savings calculator, easy signup, fast claims, 24/7 support',
    numberOfSegments: 7,
    segmentDuration: 8,
    contentType: 'explanatory',
    characterDescription: 'Professional insurance agent in modern office setting'
  });

  if (test1.success) {
    console.log(`✅ Generated ${test1.segmentPrompts.length} segment prompts`);
    console.log(`📊 Total duration: ${test1.totalDuration}s\n`);

    test1.segmentPrompts.forEach((segment, index) => {
      console.log(`\n🎬 Segment ${segment.segmentNumber} (${segment.duration}s):`);
      console.log(`📌 Content: ${segment.content}`);
      console.log(`📝 Prompt:\n${segment.prompt}`);
      console.log('─'.repeat(80));
    });
  } else {
    console.error(`❌ Test 1 failed: ${test1.error}`);
  }

  // Test Case 2: Storytelling Content
  console.log('\n\n📖 Test 2: Storytelling Content - Customer Success Story');
  console.log('─'.repeat(80));

  const test2 = await sequentialPromptGenerator.generateSegmentPrompts({
    masterPrompt: 'Tell the story of Jane who was overpaying for insurance, discovered QuoteMoto, compared quotes, found better coverage for less money, and is now saving $600 per year',
    numberOfSegments: 5,
    segmentDuration: 8,
    contentType: 'storytelling',
    characterDescription: 'Friendly narrator with warm, engaging presence'
  });

  if (test2.success) {
    console.log(`✅ Generated ${test2.segmentPrompts.length} segment prompts`);
    console.log(`📊 Total duration: ${test2.totalDuration}s\n`);

    test2.segmentPrompts.forEach((segment) => {
      console.log(`\n🎬 Segment ${segment.segmentNumber}:`);
      console.log(`📌 ${segment.content}`);
      console.log(`📝 ${segment.prompt.substring(0, 150)}...`);
    });
  } else {
    console.error(`❌ Test 2 failed: ${test2.error}`);
  }

  // Test Case 3: Sales/Marketing Content
  console.log('\n\n💼 Test 3: Sales Content - Product Pitch');
  console.log('─'.repeat(80));

  const test3 = await sequentialPromptGenerator.generateSegmentPrompts({
    masterPrompt: 'Pitch QuoteMoto as the best way to save on car insurance - fast, easy, free, trusted by millions, backed by major insurers',
    numberOfSegments: 4,
    segmentDuration: 8,
    contentType: 'sales',
    characterDescription: 'Enthusiastic brand ambassador with confident energy'
  });

  if (test3.success) {
    console.log(`✅ Generated ${test3.segmentPrompts.length} segment prompts`);
    test3.segmentPrompts.forEach((segment) => {
      console.log(`\n🎬 Segment ${segment.segmentNumber}: ${segment.content}`);
    });
  } else {
    console.error(`❌ Test 3 failed: ${test3.error}`);
  }

  console.log('\n\n✅ All tests complete!\n');
}

// Run tests
testPromptGenerator().catch(console.error);
