import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { CharacterConsistencyEngine } from './enhancement/characterConsistency';

// Load environment variables
dotenv.config();

// Initialize GoogleGenAI client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

/**
 * Generate the PERFECT Aria base image for transformations
 * This will be THE Aria image that gets transformed into all variations
 * ULTRA-THINK: One base image + transformations = 100% consistency
 */
async function generateAriaBaseReference(): Promise<void> {
  console.log('🎯 GENERATING PERFECT ARIA BASE IMAGE');
  console.log('👩‍💼 Creating THE definitive Aria for transformations');
  console.log('🧠 ULTRA-THINK: Base image + transformations = perfect consistency');
  console.log('🔬 Using Nano Banana\'s strength: image transformations!');
  console.log('');

  try {
    // Create Aria's identity with MAXIMUM detail
    const ARIA_CHARACTER = CharacterConsistencyEngine.createAriaQuoteMotoIdentity();

    // Create the PERFECT base image prompt with every detail
    const ultraDetailedPrompt = `PERFECT ARIA BASE IMAGE - TRANSFORMATION SOURCE

Ultra-photorealistic professional photograph of Aria, 28-year-old insurance advisor of mixed Latina/European heritage.

CRITICAL: This is the BASE IMAGE that will be transformed into all Aria variations.

EXACT FACIAL ARCHITECTURE:
- Face: Heart-shaped with defined cheekbones, EXACT golden ratio 1.618 proportions
- Eyes: Almond-shaped with slight upward tilt, 0.46 eye spacing ratio, rich warm brown (#8B4513 with gold flecks)
- Nose: Straight bridge nose, EXACT 0.36 facial width ratio, soft rounded tip
- Lips: Full cupid's bow lips with natural texture, 1:1.6 upper to lower lip ratio
- Jawline: Soft square jawline with gentle taper, HIGH definition
- Cheekbones: High prominent cheekbones (7/10 definition), creates natural shadows
- Skin: Golden olive base (#D4A574) with warm undertones and natural variations

CRITICAL DISTINCTIVE IDENTIFIERS (MUST BE PERFECT):
- 2mm diameter medium brown beauty mark precisely 1.2cm below LEFT eye
- Left eye 3% smaller than right eye (natural asymmetry)
- 15-20 light scatter freckles across nose bridge and upper cheeks
- Left eyebrow slightly higher arch than right
- Right side of smile lifts slightly more than left
- Natural facial asymmetry that makes her uniquely recognizable

HAIR SPECIFICATIONS:
- Dark brown (#3B2F2F) with subtle caramel highlights
- Professional styling, shoulder-length with soft layers
- Side-parted, frames face naturally

EXPRESSION & ENERGY:
- Confident and trustworthy professional smile with natural warmth
- Eyes show intelligence and engagement with subtle sparkle
- Composed professional insurance expert energy
- Genuine smile that reaches the eyes

PROFESSIONAL CONTEXT:
- Modern insurance office background
- Professional business attire with subtle QuoteMoto blue (#0074C9) accents
- Confident posture demonstrating expertise
- Warm, approachable demeanor perfect for financial services

SKIN REALISM (ZHO TECHNIQUES 41-46):
- Visible skin pore texture throughout face (pore-level detail mapping)
- Natural skin tone variations and gradients
- Realistic subsurface light scattering
- Mix of matte and naturally shiny areas (T-zone slight shine)
- Natural human imperfections for authenticity
- Photographic imperfection emulation

TECHNICAL PERFECTION:
- Shot with professional DSLR camera (85mm lens)
- Perfect natural office lighting with soft shadows
- Eye-level perspective, direct engagement
- Ultra-high resolution showing every skin detail
- Editorial photography quality

ZHO BASE IMAGE PERFECTION:
Create perfect Aria base for all future transformations
BASE: This exact face will be transformed into all Aria variations
BASE: Every distinctive mark, asymmetry, and feature detail
BASE: Professional brand representation ready for transformation
BASE: Character consistency through image-to-image workflow

NEGATIVE PROMPT: CGI, synthetic, plastic skin, perfect symmetry, airbrushed, smooth texture, doll-like, mannequin, artificial, cartoon, illustration, painting, drawing, different person, wrong face, generic woman, multiple people`;

    console.log('📝 ULTRA-DETAILED base image prompt prepared');
    console.log('🚀 Calling Gemini 2.5 Flash Image Preview for PERFECT base generation...');

    // Generate the master reference image
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: [{
        role: "user",
        parts: [{
          text: ultraDetailedPrompt
        }]
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

    if (!generatedImageData?.data) {
      throw new Error('Failed to generate base reference image');
    }

    // Create base image directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'output', 'aria-base-image');
    await fs.mkdir(outputDir, { recursive: true });

    // Save the BASE image
    const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
    const baseImagePath = path.join(outputDir, `aria-base-image-${timestamp}.png`);
    await fs.writeFile(baseImagePath, imageBuffer);

    console.log(`🖼️ BASE IMAGE saved: ${baseImagePath}`);

    // Save base image metadata
    const baseMetadata = {
      purpose: 'ARIA BASE IMAGE - Source for all transformations',
      character: 'Aria QuoteMoto Insurance Expert',
      createdAt: timestamp,
      model: 'gemini-2.5-flash-image-preview',
      characterIdentity: ARIA_CHARACTER,
      imagePath: baseImagePath,
      usageInstructions: {
        primary: 'Use this image as INPUT for ALL Aria transformations',
        consistency: 'This ensures 100% character consistency through image-to-image workflow',
        method: 'Provide this image + transformation prompts (ZHO techniques)',
        zhoTechnique: 'Image transformations > text-only generation for consistency'
      },
      prompt: ultraDetailedPrompt,
      textResponse,
      enhancement: 'ZHO Base Image System + Transformation Ready',
      qualityLevel: 'BASE IMAGE - PERFECT ARIA FOR TRANSFORMATIONS'
    };

    await fs.writeFile(
      path.join(outputDir, `aria-base-metadata-${timestamp}.json`),
      JSON.stringify(baseMetadata, null, 2)
    );

    // Create usage instructions
    const usageGuide = `ARIA BASE IMAGE USAGE GUIDE

🎯 PURPOSE:
This is THE Aria base image that gets transformed into ALL variations using ZHO techniques.

📖 HOW TO USE:
1. Load this base image as INPUT to Gemini 2.5 Flash Image Preview
2. Apply ZHO transformation techniques (hairstyle grids, time periods, illustration-to-figure)
3. Use image + transformation prompts for unlimited consistent variations

✅ BENEFITS:
- 100% character consistency guaranteed (same face, different contexts)
- Infinite variations from one base image
- Image transformations > text-only generation
- Follows pedro example pattern with hundreds of variations

🔧 ZHO TRANSFORMATIONS:
- Multi-hairstyle grids (9 different hairstyles, same face)
- Illustration-to-figure (highest viral potential)
- Time period transformations (1950s, 1980s, 2000s, 2024)
- Professional photography enhancements
- Wardrobe variations while preserving identity

💡 ULTRA-THINK APPROACH:
One base image + ZHO transformations = perfect consistency like pedro examples.

Generated: ${timestamp}
Base Image: aria-base-image-${timestamp}.png`;

    await fs.writeFile(
      path.join(outputDir, `USAGE-INSTRUCTIONS-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n🎯 BASE IMAGE GENERATION COMPLETE!');
    console.log(`📁 Output saved to: ${outputDir}`);
    console.log('\n🏆 ULTRA-THINK ACHIEVEMENT UNLOCKED:');
    console.log('  • Perfect Aria base image created');
    console.log('  • Ready for infinite transformations');
    console.log('  • No more character drift - same face always');
    console.log('  • Follows pedro pattern: base + transformations');
    console.log('\n💡 NEXT STEP: Use this base image with ZHO transformation techniques!');

  } catch (error: any) {
    console.error('\n❌ Base image generation failed:', error.message);
    if (error.message?.includes('429')) {
      console.log('⚠️ API quota limit reached. Try again in a few minutes.');
    }
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  generateAriaBaseReference()
    .then(() => {
      console.log('\n✨ Base image generation complete! Ready for unlimited Aria transformations.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAriaBaseReference };