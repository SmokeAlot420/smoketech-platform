const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test Gemini API key
async function testGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  console.log('Testing Gemini API key...');
  console.log('Key starts with:', apiKey.substring(0, 10) + '...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = 'Say "Hello, the API key works!"';
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('✅ SUCCESS! Gemini API key is valid');
    console.log('Response:', response);

  } catch (error) {
    console.error('❌ ERROR: Gemini API key test failed');
    console.error('Error message:', error.message);

    // Check if it's an environment loading issue
    console.log('\nEnvironment check:');
    console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY);
    console.log('Direct key being used:', apiKey);
  }
}

// Load environment variables
require('dotenv').config();

testGeminiKey();