/**
 * Fix the image generation - properly decode base64
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

async function generateAndSaveImages() {
  console.log('🎨 Generating REAL images with proper decoding...\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  try {
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A cute robot working on a laptop, digital art style, vibrant colors',
      aspectRatio: '1:1'
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log(`✅ Generated ${response.generatedImages.length} images\n`);

      const outputDir = path.join(process.cwd(), 'generated');
      await fs.mkdir(outputDir, { recursive: true });

      for (let i = 0; i < response.generatedImages.length; i++) {
        const img = response.generatedImages[i];

        if (img.image && img.image.imageBytes) {
          // The imageBytes is a base64 string, decode it properly
          const imageBuffer = Buffer.from(img.image.imageBytes, 'base64');

          const fileName = `real-image-${Date.now()}-${i + 1}.png`;
          const filePath = path.join(outputDir, fileName);

          await fs.writeFile(filePath, imageBuffer);

          console.log(`✅ Saved image ${i + 1}:`);
          console.log(`   File: ${fileName}`);
          console.log(`   Size: ${Math.round(imageBuffer.length / 1024)}KB`);
          console.log(`   Path: ${path.resolve(filePath)}\n`);
        }
      }

      console.log('🎉 All images saved successfully!');
      console.log('Open the files in the generated/ folder to view them');

    } else {
      console.log('❌ No images generated');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
  }
}

generateAndSaveImages();