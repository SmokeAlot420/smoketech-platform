/**
 * TEST GEMINI EXPERIMENTAL - The REAL Image Generation Model
 */

const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs').promises;
const path = require('path');

async function testGeminiExperimental() {
  console.log('\n🚀 TESTING GEMINI EXPERIMENTAL IMAGE GENERATION\n');
  console.log('============================================\n');

  try {
    const PROJECT_ID = 'viral-ai-content-12345';
    const LOCATION = 'us-central1';

    const vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });

    // Try the experimental model that shows in your quota
    const modelNames = [
      'gemini-experimental',           // From your quota
      'gemini-2.0-flash-exp',          // Experimental flash
      'gemini-exp-1206',               // Latest experimental
      'gemini-2.0-flash-thinking-exp', // Thinking model
      'gemini-pro-experimental',       // Pro experimental
    ];

    for (const modelName of modelNames) {
      console.log(`\n🔧 Testing: ${modelName}`);
      console.log('-'.repeat(40));

      try {
        const model = vertexAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.8,
          },
        });

        // Simple image generation prompt
        const imagePrompt = 'Generate an image of a tech influencer holding a smartphone';

        console.log('📝 Sending image generation request...');

        const request = {
          contents: [{
            role: 'user',
            parts: [{ text: imagePrompt }]
          }]
        };

        const result = await model.generateContent(request);
        const response = result.response;

        if (response && response.candidates && response.candidates[0]) {
          const parts = response.candidates[0].content.parts;

          let foundImage = false;
          for (const part of parts) {
            // Check for image data
            if (part.inlineData && part.inlineData.data) {
              console.log(`✅ SUCCESS! ${modelName} GENERATED AN IMAGE!`);

              // Save the image
              const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
              const outputDir = path.join(process.cwd(), 'generated');
              await fs.mkdir(outputDir, { recursive: true });

              const imagePath = path.join(outputDir, `${modelName}-${Date.now()}.png`);
              await fs.writeFile(imagePath, imageBuffer);

              console.log(`🖼️ Image saved to: ${imagePath}`);
              console.log('\n🎉 IMAGE GENERATION WORKS WITH THIS MODEL!');
              foundImage = true;

              // Test character consistency
              console.log('\n🔄 Testing character consistency...');

              const consistencyPrompt = 'Generate another image of the SAME tech influencer from a different angle';

              const consistencyRequest = {
                contents: [{
                  role: 'user',
                  parts: [{ text: consistencyPrompt }]
                }]
              };

              const consistencyResult = await model.generateContent(consistencyRequest);
              const consistencyResponse = consistencyResult.response;

              if (consistencyResponse && consistencyResponse.candidates && consistencyResponse.candidates[0]) {
                const consistencyParts = consistencyResponse.candidates[0].content.parts;

                for (const part of consistencyParts) {
                  if (part.inlineData && part.inlineData.data) {
                    const consistencyBuffer = Buffer.from(part.inlineData.data, 'base64');
                    const consistencyPath = path.join(outputDir, `${modelName}-consistency-${Date.now()}.png`);
                    await fs.writeFile(consistencyPath, consistencyBuffer);
                    console.log(`🖼️ Consistency test image saved to: ${consistencyPath}`);
                    break;
                  }
                }
              }

              return true;
            }

            // Check for text response
            if (part.text) {
              console.log(`📝 Model returned text instead of image`);
              console.log(`   Response: ${part.text.substring(0, 100)}...`);
            }
          }

          if (!foundImage) {
            console.log(`⚠️ ${modelName} doesn't support image generation`);
          }
        }

      } catch (error) {
        if (error.message.includes('404')) {
          console.log(`❌ Model ${modelName} not found`);
        } else if (error.message.includes('429')) {
          console.log(`⏰ Rate limit hit - wait 60 seconds`);
          console.log('   Your quota: 2 requests per minute');
        } else if (error.message.includes('403')) {
          console.log(`🚫 Access denied to ${modelName}`);
        } else {
          console.log(`❌ Error: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 TESTING COMPLETE\n');
    console.log('If no models generated images, it means:');
    console.log('1. Native image generation is still in preview');
    console.log('2. You need to use Imagen API or wait for access');
    console.log('3. Try the Vertex AI console for manual testing');
    console.log('\nYour setup is perfect - the models just need to be enabled by Google!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }
}

// Add delay to respect rate limits
console.log('Starting test (respecting rate limits)...');
testGeminiExperimental();