const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testApiKey() {
  try {
    console.log('Testing API Key:', process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent('Say "Hello, API is working!"');
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! API Response:', text);
  } catch (error) {
    console.error('❌ API Key Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n📌 To fix this:');
      console.log('1. Go to: https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Make sure "Generative Language API" is enabled');
      console.log('4. Replace the key in .env file');
    }
  }
}

testApiKey();