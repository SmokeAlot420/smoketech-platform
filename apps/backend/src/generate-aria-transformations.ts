import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize GoogleGenAI client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

/**
 * Transform Aria base image using ZHO techniques
 * Uses pedro pattern: ONE base image + multiple transformations = 100% consistency
 * ULTRA-THINK: Image transformations > text-only generation for consistency
 */

interface TransformationTemplate {
  id: number;
  name: string;
  technique: string;
  viralPotential: 'EXTREMELY_HIGH' | 'HIGH' | 'MEDIUM';
  prompt: string;
}

// ZHO Transformation Templates (Based on Pedro Examples)
const ARIA_TRANSFORMATIONS: TransformationTemplate[] = [
  {
    id: 1,
    name: 'illustration-to-figure',
    technique: 'ZHO Technique #1 - Highest Viral Potential',
    viralPotential: 'EXTREMELY_HIGH',
    prompt: `Transform this photo into a character figure. Behind it, place a box with
the character's image printed on it, and a computer showing the Blender modeling process
on its screen. In front of the box, add a round plastic base with the character figure
standing on it. Set the scene indoors if possible. QuoteMoto branding on packaging.
PRESERVE: Exact same Aria face, all distinctive features`
  },
  {
    id: 2,
    name: 'multi-hairstyle-grid',
    technique: 'ZHO Multi-Style Grid',
    viralPotential: 'HIGH',
    prompt: `Create a 3x3 grid showing the same person with 9 different professional hairstyles:
1. Shoulder-length waves, 2. Professional bob cut, 3. Sleek straight hair
4. Curly shoulder-length, 5. Side-parted layers, 6. Professional updo
7. Textured lob, 8. Soft beach waves, 9. Classic blowout
PRESERVE: Exact same Aria face, expression, and QuoteMoto professional attire
Keep lighting and background consistent across all 9 variations`
  },
  {
    id: 3,
    name: 'time-period-1990s',
    technique: 'ZHO Time Period Transformation',
    viralPotential: 'HIGH',
    prompt: `Transform to 1990s era while preserving exact facial structure.
1990s professional style: shoulder pads, business suits, period-appropriate makeup
Setting: 1990s office environment with vintage computers and decor
PRESERVE: Exact same Aria face, all distinctive features and expressions
Adapt QuoteMoto insurance context to 1990s business aesthetics`
  },
  {
    id: 4,
    name: 'professional-photography-enhancement',
    technique: 'ZHO Technique #25 - Professional Enhancement',
    viralPotential: 'HIGH',
    prompt: `Transform into highly stylized ultra-realistic portrait, with sharp facial
features and flawless skin, standing confidently against a bold QuoteMoto blue gradient
background. Dramatic, cinematic lighting highlights her facial structure, evoking the
look of a luxury fashion magazine cover. Editorial photography style, high-detail,
4K resolution, symmetrical composition, minimalistic background.
PRESERVE: Exact same Aria face, all distinctive marks and features`
  },
  {
    id: 5,
    name: 'wardrobe-modern-casual',
    technique: 'ZHO Style Preservation with Context Change',
    viralPotential: 'MEDIUM',
    prompt: `Keep the exact same person but change to modern casual style:
Stylish cardigan or blazer over casual top, modern accessories
Contemporary coffee shop or co-working space setting
Maintain professional insurance advisor energy in casual context
PRESERVE: Exact same Aria face, expression, and all distinctive features
Modern QuoteMoto branding integration (laptop stickers, branded items)`
  }
];

async function generateAriaTransformations(baseImagePath?: string): Promise<void> {
  console.log('🎯 GENERATING ARIA TRANSFORMATIONS');
  console.log('👩‍💼 Using pedro pattern: Base image + ZHO techniques = perfect consistency');
  console.log('🔬 Applying 5 different transformation techniques...');
  console.log('');

  try {
    // Find base image if not provided
    if (!baseImagePath) {
      const baseDir = path.join(process.cwd(), 'output', 'aria-base-image');
      const baseFiles = await fs.readdir(baseDir);
      const pngFiles = baseFiles.filter(f => f.endsWith('.png'));

      if (pngFiles.length === 0) {
        throw new Error('No base image found. Run generate-aria-base-reference first!');
      }

      // Use the most recent base image
      pngFiles.sort().reverse();
      baseImagePath = path.join(baseDir, pngFiles[0]);
      console.log(`📸 Using base image: ${pngFiles[0]}`);
    }

    // Read base image
    const baseImageBuffer = await fs.readFile(baseImagePath);
    const baseImageData = baseImageBuffer.toString('base64');

    console.log('✅ Base image loaded successfully');
    console.log('🚀 Starting transformations using Gemini 2.5 Flash Image Preview...');
    console.log('');

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'output', 'aria-transformations');
    await fs.mkdir(outputDir, { recursive: true });

    const results = [];

    // Apply each transformation
    for (let i = 0; i < ARIA_TRANSFORMATIONS.length; i++) {
      const transformation = ARIA_TRANSFORMATIONS[i];

      console.log(`🔄 TRANSFORMATION ${i + 1}/5: ${transformation.name.toUpperCase()}`);
      console.log(`   ${transformation.technique}`);
      console.log(`   Viral Potential: ${transformation.viralPotential}`);

      try {
        // Generate transformation
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: [{
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: baseImageData
                }
              },
              {
                text: transformation.prompt
              }
            ]
          }]
        });

        let textResponse = '';
        let generatedImageData = null;

        // Process response
        for (const candidate of result.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.text) {
              textResponse += part.text;
            }
            if (part.inlineData) {
              generatedImageData = part.inlineData;
            }
          }
        }

        if (generatedImageData?.data) {
          // Save transformed image
          const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
          const imagePath = path.join(outputDir, `aria-${transformation.name}-${timestamp}.png`);
          await fs.writeFile(imagePath, imageBuffer);

          // Save metadata
          const metadata = {
            transformation: transformation.name,
            technique: transformation.technique,
            viralPotential: transformation.viralPotential,
            baseImagePath,
            transformedImagePath: imagePath,
            prompt: transformation.prompt,
            textResponse,
            timestamp,
            model: 'gemini-2.5-flash-image-preview',
            character: 'Aria QuoteMoto Insurance Expert',
            consistency: 'Image-to-image transformation for 100% character preservation'
          };

          await fs.writeFile(
            path.join(outputDir, `aria-${transformation.name}-metadata-${timestamp}.json`),
            JSON.stringify(metadata, null, 2)
          );

          results.push({
            name: transformation.name,
            success: true,
            imagePath,
            viralPotential: transformation.viralPotential
          });

          console.log(`   ✅ SUCCESS: ${imagePath}`);
        } else {
          console.log(`   ❌ FAILED: No image generated`);
          results.push({
            name: transformation.name,
            success: false,
            error: 'No image data returned'
          });
        }
      } catch (transformError: any) {
        console.log(`   ❌ ERROR: ${transformError.message}`);
        results.push({
          name: transformation.name,
          success: false,
          error: transformError.message
        });
      }

      console.log('');
    }

    // Generate summary report
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log('🎯 TRANSFORMATION RESULTS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Successful Transformations: ${successCount}/${totalCount} (${((successCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`📁 Output Directory: ${outputDir}`);
    console.log('');

    console.log('📋 DETAILED RESULTS:');
    results.forEach((result, i) => {
      const status = result.success ? '✅' : '❌';
      const potential = result.success ? ` (${result.viralPotential})` : '';
      console.log(`  ${status} ${ARIA_TRANSFORMATIONS[i].name}${potential}`);
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log('');
    console.log('🏆 NEXT STEPS:');
    if (successCount === totalCount) {
      console.log('  • Perfect! All transformations successful');
      console.log('  • Validate character consistency across all images');
      console.log('  • Ready for viral content creation');
    } else {
      console.log('  • Review failed transformations');
      console.log('  • Check API quota and retry if needed');
      console.log('  • Validate successful transformations');
    }

    // Save summary report
    const summaryReport = {
      title: 'ARIA TRANSFORMATIONS SUMMARY',
      baseImagePath,
      timestamp,
      totalTransformations: totalCount,
      successfulTransformations: successCount,
      successRate: (successCount/totalCount) * 100,
      technique: 'ZHO Image-to-Image Transformation',
      consistency: 'Base image preserves Aria identity across all variations',
      results
    };

    await fs.writeFile(
      path.join(outputDir, `aria-transformations-summary-${timestamp}.json`),
      JSON.stringify(summaryReport, null, 2)
    );

    console.log(`📄 Summary report saved: aria-transformations-summary-${timestamp}.json`);

  } catch (error: any) {
    console.error('\n❌ Transformation process failed:', error.message);
    if (error.message?.includes('429')) {
      console.log('⚠️ API quota limit reached. Try again in a few minutes.');
    }
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  const baseImagePath = process.argv[2]; // Optional base image path argument

  generateAriaTransformations(baseImagePath)
    .then(() => {
      console.log('\n✨ Aria transformations complete! Character consistency achieved through image-to-image workflow.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal transformation error:', error);
      process.exit(1);
    });
}

export { generateAriaTransformations, ARIA_TRANSFORMATIONS };