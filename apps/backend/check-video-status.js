// Simple Video Status Checker
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function checkVideoStatus() {
  console.log('🎬 CHECKING VIDEO OPERATION STATUS...\n');

  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

  // Operations to check
  const operations = [
    'models/veo-3.0-generate-001/operations/pu6tlo0z17ao', // TikTok viral hook
    'models/veo-3.0-generate-001/operations/5n4e9iohavab', // YouTube explainer
    'models/veo-3.0-fast-generate-001/operations/l6b6x3u3m61e' // Latest
  ];

  for (const operationId of operations) {
    console.log(`🔍 Checking: ${operationId.split('/').pop()}`);

    try {
      // Try to get operation status using simple approach
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/${operationId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const operationData = await response.json();

      console.log(`Status: ${operationData.done ? '✅ COMPLETED' : '⏳ Processing'}`);

      if (operationData.done && operationData.response) {
        console.log('📹 Generated videos:', operationData.response.generatedVideos?.length || 0);
        if (operationData.response.generatedVideos?.[0]) {
          console.log('🔗 Video URL available:', !!operationData.response.generatedVideos[0].downloadUrl);
        }
      }

      console.log('');

    } catch (error) {
      console.error(`❌ Error checking ${operationId.split('/').pop()}:`, error.message);
      console.log('');
    }
  }
}

checkVideoStatus();