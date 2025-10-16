const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try to list available models
    console.log('Checking available models...\n');

    // Try different model names
    const modelsToTry = [
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
      'gemini-2.5-flash-image',
      'gemini-2.5-flash-image-preview',
      'imagen-3.0-generate-002',
      'gemini-pro-vision'
    ];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ ${modelName} - Available`);

        // Try to check if it supports image generation
        try {
          const result = await model.generateContent('Test');
          console.log(`   Supports text generation`);
        } catch (e) {
          // Ignore
        }
      } catch (error) {
        console.log(`❌ ${modelName} - Not available or not supported`);
      }
    }

    // Try the working model with image generation
    console.log('\n🖼️ Testing image generation with gemini-2.0-flash-exp...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent({
      contents: [{
        parts: [{
          text: 'Generate an image of a banana'
        }]
      }]
    });

    const response = await result.response;
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if ('inlineData' in part && part.inlineData) {
          console.log('✅ Image generation successful!');
          break;
        } else if ('text' in part) {
          console.log('⚠️ Received text response instead of image');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();