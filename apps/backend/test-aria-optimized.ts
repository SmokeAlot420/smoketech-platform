import dotenv from 'dotenv';
dotenv.config();

import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';
import { VertexAINanoBananaService } from './src/services/vertexAINanoBanana';

async function testOptimizedAria() {
  console.log('🧪 Testing optimized Aria prompt with Nano Banana...\n');

  const nanoBanana = new VertexAINanoBananaService();

  const optimizedPrompt = quoteMotoInfluencer.generateBasePrompt('professional office setting');

  console.log('📝 Optimized Prompt:');
  console.log(optimizedPrompt);
  console.log('\n' + '='.repeat(80) + '\n');

  try {
    console.log('🎨 Generating 3 optimized images...\n');

    for (let i = 1; i <= 3; i++) {
      console.log(`Generating optimized image ${i}/3...`);

      const images = await nanoBanana.generateImage(optimizedPrompt, {
        temperature: 0.3,
        numImages: 1
      });

      if (images && images.length > 0) {
        console.log(`✅ Optimized image ${i} generated: ${images[0].imagePath}`);
      } else {
        console.log(`❌ Failed to generate optimized image ${i}: No images returned`);
      }

      // Small delay between generations
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎯 Test completed! Check the generated images to compare with before-1 and before-2.');
    console.log('Look for: Natural skin texture, visible pores, authentic imperfections without over-specification.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOptimizedAria();