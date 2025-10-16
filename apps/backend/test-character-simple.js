/**
 * Simple demonstration of character consistency
 * Shows how to maintain the same influencer across multiple images
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function testCharacterConsistency() {
  console.log('🎭 CHARACTER CONSISTENCY DEMO (SIMPLIFIED)');
  console.log('=========================================\n');

  const apiKey = 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';
  const outputDir = path.join(process.cwd(), 'generated', 'characters');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // The key to consistency: Use a detailed character description
  // that will be included in all prompts
  const characterDescription = `Emma, 25 year old female tech influencer,
    brown hair, professional appearance, friendly smile, consistent facial features`;

  console.log('📸 Generating consistent influencer images...');
  console.log(`Character: ${characterDescription}\n`);

  // Generate 3 consistent images with the same character
  const scenarios = [
    'holding iPhone 16, product review pose, studio background',
    'sitting at desk with laptop, coding tutorial, home office',
    'recording TikTok video, ring light visible, bedroom studio'
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const fullPrompt = `${characterDescription}, ${scenarios[i]}`;

    console.log(`[${i + 1}/3] Generating: ${scenarios[i]}`);

    await generateImage(fullPrompt, `emma-scene-${i + 1}.png`, apiKey, outputDir);

    console.log(`  ✅ Saved to generated/characters/emma-scene-${i + 1}.png`);
  }

  console.log('\n✨ CHARACTER CONSISTENCY DEMO COMPLETE!');
  console.log('All images feature the same "Emma" character.');
  console.log('Check generated/characters/ folder to see the results.');
  console.log('\n💡 This is how you maintain consistent influencers:');
  console.log('   1. Define detailed character traits');
  console.log('   2. Include those traits in every prompt');
  console.log('   3. Use the same name and features consistently');
}

async function generateImage(prompt, filename, apiKey, outputDir) {
  const requestBody = JSON.stringify({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    number: 1,
    aspectRatio: '16:9'
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/imagen-4.0-generate-001:generateImages?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': requestBody.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.generatedImages && result.generatedImages[0]) {
            const imageBytes = result.generatedImages[0].image.imageBytes;
            const imageBuffer = Buffer.from(imageBytes, 'base64');
            const filePath = path.join(outputDir, filename);

            fs.writeFileSync(filePath, imageBuffer);
            resolve(filePath);
          } else {
            reject(new Error('No image generated'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Run the test
console.log('Starting character consistency demo...\n');
testCharacterConsistency().catch(console.error);