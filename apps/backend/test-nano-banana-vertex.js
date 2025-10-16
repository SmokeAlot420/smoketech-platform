/**
 * TEST VERTEX AI NANO BANANA (GEMINI 2.5 FLASH IMAGE)
 * This will verify your setup actually works
 */

const { VertexAI } = require('@google-cloud/vertexai');

async function testNanoBanana() {
  console.log('\n🚀 TESTING VERTEX AI NANO BANANA...\n');
  console.log('================================\n');

  try {
    // Your project details
    const PROJECT_ID = 'viral-ai-content-12345';
    const LOCATION = 'us-central1';

    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Location: ${LOCATION}`);
    console.log(`Key File: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n`);

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });

    // Get the Nano Banana model
    console.log('🔧 Initializing Nano Banana (Gemini 2.5 Flash Image)...\n');

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',  // Start with this model to test
    });

    // Test prompt
    const prompt = 'Generate a detailed description of a tech influencer';

    console.log('📝 Sending test prompt...\n');

    // Generate content
    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const result = await model.generateContent(request);
    const response = result.response;

    if (response && response.candidates && response.candidates[0]) {
      console.log('✅ SUCCESS! Vertex AI is working!\n');
      console.log('Response:', response.candidates[0].content.parts[0].text.substring(0, 200) + '...\n');

      console.log('🎯 Now let\'s try image generation...\n');

      // Try image generation prompt
      const imagePrompt = 'Create a photorealistic portrait of a female tech influencer, professional headshot, studio lighting';

      console.log('🖼️ Attempting image generation...\n');

      const imageRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: imagePrompt }]
        }]
      };

      const imageResult = await model.generateContent(imageRequest);
      const imageResponse = imageResult.response;

      if (imageResponse && imageResponse.candidates && imageResponse.candidates[0]) {
        const parts = imageResponse.candidates[0].content.parts;

        let hasImage = false;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            hasImage = true;
            console.log('🎨 IMAGE GENERATED SUCCESSFULLY!');
            console.log('   Image data received (base64)');
            break;
          }
        }

        if (!hasImage) {
          console.log('⚠️ Model responded but no image data found');
          console.log('   This model might not support native image generation');
          console.log('   We need to use the correct Nano Banana model endpoint');
        }
      }

      console.log('\n✅ VERTEX AI CONNECTION SUCCESSFUL!');
      console.log('   Your authentication is working perfectly.');
      console.log('   Now we need to access the real Nano Banana model.\n');

    } else {
      console.log('❌ No response from Vertex AI');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);

    if (error.message.includes('401')) {
      console.error('\n🔑 Authentication issue - check your key file');
    } else if (error.message.includes('403')) {
      console.error('\n🚫 Permission denied - check IAM roles');
    } else if (error.message.includes('404')) {
      console.error('\n🔍 Model not found - this is expected for now');
      console.error('   The Nano Banana model requires special access');
    }

    console.error('\nFull error:', error);
  }
}

// Run the test
console.log('Key file location:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
testNanoBanana();