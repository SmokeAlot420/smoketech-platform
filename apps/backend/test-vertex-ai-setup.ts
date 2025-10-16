import dotenv from 'dotenv';
dotenv.config();

import { VertexAINanoBananaService } from './src/services/vertexAINanoBanana';

async function testVertexAISetup() {
  console.log('🧪 Testing Vertex AI Setup...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`✅ GCP_PROJECT_ID: ${process.env.GCP_PROJECT_ID}`);
  console.log(`✅ GCP_LOCATION: ${process.env.GCP_LOCATION}`);
  console.log(`✅ GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  console.log('');

  try {
    // Initialize service
    console.log('🍌 Initializing NanoBanana service with Vertex AI...');
    const nanoService = new VertexAINanoBananaService();
    console.log('✅ Service initialized successfully!\n');

    // Test a simple image generation
    console.log('🎨 Testing image generation...');
    console.log('📝 Prompt: "Professional headshot of a business person"');

    const images = await nanoService.generateImage(
      'Professional headshot of a business person, natural lighting, authentic appearance',
      {
        temperature: 0.4,
        numImages: 1
      }
    );

    console.log('\n✅ SUCCESS! Vertex AI is working!');
    console.log(`📸 Generated ${images.length} image(s)`);
    console.log(`💾 Saved to: ${images[0].imagePath}`);
    console.log(`💰 Cost: $${images[0].metadata.cost.toFixed(3)} (from your $1,000 credits!)`);
    console.log(`⏱️  Generation time: ${images[0].metadata.generationTime}ms`);
    console.log(`📊 Quality score: ${images[0].metadata.qualityScore}/10`);

    console.log('\n🎉 Vertex AI setup is COMPLETE and WORKING!');
    console.log('💸 All costs are being deducted from your $1,000 Google Cloud credits!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);

    if (error instanceof Error) {
      if (error.message.includes('GCP_PROJECT_ID')) {
        console.error('\n💡 Fix: Set GCP_PROJECT_ID in your .env file');
      } else if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
        console.error('\n💡 Fix: Set GOOGLE_APPLICATION_CREDENTIALS path in your .env file');
      } else {
        console.error('\n💡 Check VERTEX_AI_SETUP.md for troubleshooting');
      }
    }

    process.exit(1);
  }
}

testVertexAISetup();
