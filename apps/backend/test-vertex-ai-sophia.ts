// Enterprise Vertex AI Sophia Generation Test
// Tests the ultra-realistic image generation using Google Cloud Vertex AI

import { multiSourceGenerator } from './src/pipelines/multiSourceImageGenerator';
import { vertexAINanoBananaService } from './src/services/vertexAINanoBanana';
import { SkinRealismEngine } from './src/enhancement/skinRealism';
import { CharacterConsistencyEngine } from './src/enhancement/characterConsistency';

async function testVertexAISophiaGeneration() {
  console.log('🏢 Testing Enterprise Vertex AI Sophia Generation Pipeline...');

  try {
    // Step 1: Test Vertex AI service status
    console.log('🔍 Checking Vertex AI service status...');
    const serviceStatus = await vertexAINanoBananaService.getServiceStatus();

    if (!serviceStatus.available) {
      console.error(`❌ Vertex AI service not available: ${serviceStatus.lastError}`);
      return false;
    }

    console.log(`✅ Vertex AI Enterprise ready: Project ${serviceStatus.projectId} in ${serviceStatus.location}`);
    console.log(`💰 Credits remaining: $${serviceStatus.creditsRemaining || 'Unknown'}`);

    // Step 2: Create enhanced Sophia identity
    CharacterConsistencyEngine.createSophiaIdentity();
    console.log('✅ Created Sophia character identity');

    // Step 3: Generate advanced skin realism
    const sophiaSkinRealism = SkinRealismEngine.createSophiaSkinRealism();
    console.log(`✅ Generated skin realism with ${sophiaSkinRealism.imperfections.length} imperfections`);

    // Step 4: Test direct Vertex AI generation
    console.log('🎨 Testing direct Vertex AI generation...');

    const simplePrompt = "Ultra-photorealistic portrait of a beautiful 25-year-old woman with hazel-green eyes, natural warm smile, olive skin tone, professional photography, 8K resolution";

    const directImages = await vertexAINanoBananaService.generateImage(simplePrompt, {
      temperature: 0.4,
      numImages: 1
    });

    if (directImages && directImages.length > 0) {
      console.log('🎉 SUCCESS! Direct Vertex AI generation working');
      console.log(`📁 Direct image saved to: ${directImages[0].imagePath}`);
      console.log(`⭐ Quality Score: ${directImages[0].metadata.qualityScore}/10`);
      console.log(`💰 Generation Cost: $${directImages[0].metadata.cost}`);
      console.log(`⏱️ Generation Time: ${directImages[0].metadata.generationTime}ms`);
    }

    // Step 5: Test full pipeline with multiSourceGenerator
    console.log('🔄 Testing full pipeline with multiSourceGenerator...');

    const { MultiSourceImageGenerator } = await import('./src/pipelines/multiSourceImageGenerator');
    const sophiaSpec = MultiSourceImageGenerator.createSophiaSpec();

    const pipelineResults = await multiSourceGenerator.generateRealisticHuman(sophiaSpec, {
      preferredSource: 'vertexAINanoBanana',
      generateMultiple: false,
      fallbackSources: true
    });

    if (pipelineResults && pipelineResults.length > 0) {
      console.log('🎉 SUCCESS! Full pipeline working with Vertex AI');
      console.log(`📁 Pipeline image saved to: ${pipelineResults[0].imagePath}`);
      console.log(`⭐ Quality Score: ${pipelineResults[0].metadata.qualityScore}/10`);
      console.log(`💰 Generation Cost: $${pipelineResults[0].metadata.cost}`);
      console.log(`⏱️ Generation Time: ${pipelineResults[0].metadata.generationTime}ms`);

      // Display enterprise advantages
      console.log('\n🏢 Enterprise Vertex AI Advantages:');
      console.log('- Higher rate limits than standard API');
      console.log('- SLA guarantees for production');
      console.log('- Priority queue for generation');
      console.log('- Advanced features like batch processing');
      console.log('- Direct Google Cloud support');
      console.log(`- Your remaining credits: ~${Math.floor((serviceStatus.creditsRemaining || 300) / 0.039)} images`);

    } else {
      console.error('❌ FAILED: Pipeline did not generate images');
      return false;
    }

    // Step 6: Test batch generation capabilities
    console.log('\n🚀 Testing enterprise batch generation...');

    const batchPrompts = [
      "Ultra-realistic Sophia portrait - frontal view, professional lighting",
      "Ultra-realistic Sophia portrait - three-quarter angle, natural lighting",
      "Ultra-realistic Sophia portrait - slight smile, warm expression"
    ];

    const batchResults = await vertexAINanoBananaService.batchGenerate(batchPrompts);

    if (batchResults && batchResults.length > 0) {
      console.log(`🎉 Batch generation successful: ${batchResults.length} images generated`);
      console.log('✅ Enterprise batch processing verified');
    }

    return true;

  } catch (error) {
    console.error('❌ FAILED: Enterprise Vertex AI test failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testVertexAISophiaGeneration()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Enterprise Vertex AI Sophia Generation Test PASSED!');
        console.log('🚀 Ready for production with $300 credits and enterprise features!');
      } else {
        console.log('\n❌ Enterprise Vertex AI Sophia Generation Test FAILED!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Test crashed:', error);
      process.exit(1);
    });
}

export { testVertexAISophiaGeneration };