require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.models.forEach(model => {
      if (model.name.includes('image') || model.name.includes('flash') || model.name.includes('gemini')) {
        console.log(`- ${model.name}`);
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkModels();