import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

/**
 * Finish branding the remaining images
 */
async function finishBranding(): Promise<void> {
  console.log('🏷️ FINISHING BRANDING PROCESS');
  console.log('Completing remaining logo applications');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(60));

  const outputDir = path.join(process.cwd(), 'generated', 'improved-master', '2025-09-28T01-37-57-620Z');
  const logoPath = path.join(process.cwd(), 'logo', 'quotemoto-white-logo.png');

  // Images that need branding
  const unbrandedImages = [
    'aria-corporate-lobby.png',
    'aria-parking-lot-consultation.png',
    'aria-video-call-office.png'
  ];

  const logoData = await fs.readFile(logoPath);
  const logoBase64 = logoData.toString('base64');

  for (const imageName of unbrandedImages) {
    console.log(`\n🔖 Branding: ${imageName}`);

    try {
      const imagePath = path.join(outputDir, imageName);
      const imageData = await fs.readFile(imagePath);
      const imageBase64 = imageData.toString('base64');

      const prompt = `Apply the QuoteMoto logo from image 2 to Aria's professional attire in image 1.

LOGO PLACEMENT:
- Place logo SUBTLY on Aria's clothing (polo shirt or jacket)
- Keep logo SMALL and professional (chest pocket size)
- Ensure logo is CRISP and undistorted
- Natural integration like embroidered or printed logo

CRITICAL:
- DO NOT distort or stretch the logo
- DO NOT make the logo too large
- PRESERVE all other aspects of image 1 exactly

OUTPUT:
Professionally branded Aria with subtle QuoteMoto logo`;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageBase64
              }
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: logoBase64
              }
            }
          ]
        }]
      });

      // Extract generated image
      let generatedImageData = null;
      for (const candidate of result.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            generatedImageData = part.inlineData;
          }
        }
      }

      if (generatedImageData?.data) {
        const outputName = imageName.replace('.png', '-branded.png');
        const outputPath = path.join(outputDir, outputName);
        const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`✅ Branded: ${outputName}`);
      } else {
        console.log(`❌ Failed: No image data returned`);
      }

      // Brief pause between brandings
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  console.log('\n\n🎉 BRANDING COMPLETED!');
  console.log(`📁 All images in: ${outputDir}`);
  console.log('\nSign off as SmokeDev 🚬');
}

// Execute
if (require.main === module) {
  finishBranding()
    .then(() => {
      console.log('\n✨ Branding finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { finishBranding };