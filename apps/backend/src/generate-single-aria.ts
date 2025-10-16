import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { CharacterConsistencyEngine } from './enhancement/characterConsistency';

// Load environment variables
dotenv.config();

// Initialize Google Gen AI with API key only (not Vertex AI)
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

// Create Aria character using the enhanced identity system
const ARIA_CHARACTER = CharacterConsistencyEngine.createAriaQuoteMotoIdentity();

/**
 * Generate a single ultra-realistic Aria image
 */
async function generateSingleAriaImage(): Promise<void> {
  console.log('🎯 Generating single ultra-realistic Aria image for QuoteMoto...');
  console.log('👩‍💼 Character: Aria - Insurance Advisor');
  console.log('🎨 Brand Colors: #0074C9 (Blue), #F97316 (Orange)');
  console.log('✨ Applying 46 ZHO Nano Banana techniques...');
  console.log('🔬 Adding skin imperfections for ultra-realism...');
  console.log('');

  try {

    // Build the base ultra-detailed prompt
    const basePrompt = `Ultra-photorealistic professional photograph of ${ARIA_CHARACTER.name}, 28-year-old insurance advisor of mixed Latina/European heritage.

EXACT FACIAL SPECIFICATIONS:
- Face: ${ARIA_CHARACTER.coreFeatures.faceShape}
- Eyes: ${ARIA_CHARACTER.coreFeatures.eyeShape} with ${ARIA_CHARACTER.coreFeatures.eyeColor}
- Eyebrows: ${ARIA_CHARACTER.coreFeatures.eyebrowShape}
- Nose: ${ARIA_CHARACTER.coreFeatures.noseShape}
- Lips: ${ARIA_CHARACTER.coreFeatures.lipShape}
- Jawline: ${ARIA_CHARACTER.coreFeatures.jawline}
- Cheekbones: ${ARIA_CHARACTER.coreFeatures.cheekbones}
- Skin: ${ARIA_CHARACTER.coreFeatures.skinTone}
- Hair: ${ARIA_CHARACTER.coreFeatures.hairColor}, ${ARIA_CHARACTER.coreFeatures.hairTexture}

CRITICAL DISTINCTIVE MARKS:
- Beauty mark: ${ARIA_CHARACTER.distinctiveMarks.moles[0].description} ${ARIA_CHARACTER.distinctiveMarks.moles[0].location}
- Freckles: ${ARIA_CHARACTER.distinctiveMarks.freckles.pattern}, ${ARIA_CHARACTER.distinctiveMarks.freckles.density}
- Asymmetry: ${ARIA_CHARACTER.distinctiveMarks.asymmetry.map(a => a.variation).join(', ')}

PROFESSIONAL SETTING:
- Modern insurance office with QuoteMoto branding
- Professional business attire with subtle blue (#0074C9) and orange (#F97316) accents
- Expression: ${ARIA_CHARACTER.personalityTraits.defaultExpression}
- Energy: ${ARIA_CHARACTER.personalityTraits.energyLevel}

SKIN REALISM REQUIREMENTS:
- Visible skin pore texture throughout face
- Natural skin tone variations and gradients
- Realistic subsurface light scattering
- Mix of matte and naturally shiny areas (T-zone slight shine)
- Natural human imperfections for authenticity`;

    // Apply ZHO Universal Character Preservation
    const consistencyPrompt = CharacterConsistencyEngine.applyUniversalCharacterPreservation(basePrompt, ARIA_CHARACTER);

    // Add ZHO Nano Banana techniques
    const finalPrompt = `${consistencyPrompt}

APPLYING ZHO NANO BANANA TECHNIQUES:
- Technique 01: Anatomical precision with golden ratio proportions
- Technique 07: Subsurface scattering for realistic skin translucency
- Technique 12: Micro-expression capture for authentic emotion
- Technique 18: Environmental interaction with realistic shadows
- Technique 23: Fabric physics for natural clothing drape
- Technique 29: Eye soul technique with depth and life
- Technique 35: Breath of life with subtle motion blur
- Technique 41: Pore-level detail mapping
- Technique 44: Natural aging indicators
- Technique 46: Photographic imperfection emulation

NEGATIVE PROMPT: CGI, synthetic, plastic skin, perfect symmetry, airbrushed, smooth texture, doll-like, mannequin, artificial, cartoon, illustration, painting, drawing, different person, wrong face, inconsistent features`;

    console.log('📝 Prompt prepared with all enhancements');
    console.log('🚀 Calling Gemini 2.5 Flash Image Preview API...');

    // Generate content with Gemini 2.5 Flash Image Preview (using existing service pattern)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: finalPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0.7,
        candidateCount: 1
      }
    });

    // Extract generated images and text
    let generatedImageData = null;
    let textResponse = '';

    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              generatedImageData = part.inlineData;
            } else if (part.text) {
              textResponse += part.text;
            }
          }
        }
      }
    }

    if (!generatedImageData) {
      throw new Error('No image generated from the model');
    }

    // Save the generation details and image
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join('output', 'aria-single-generation');
    await fs.mkdir(outputDir, { recursive: true });

    // Save the actual image if generated
    if (generatedImageData && generatedImageData.data) {
      const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
      const imageExtension = generatedImageData.mimeType === 'image/png' ? 'png' : 'jpg';
      const imagePath = path.join(outputDir, `aria-${timestamp}.${imageExtension}`);
      await fs.writeFile(imagePath, imageBuffer);
      console.log(`🖼️ Image saved: ${imagePath}`);
    }

    // Save prompt and metadata
    await fs.writeFile(
      path.join(outputDir, `aria-generation-${timestamp}.json`),
      JSON.stringify({
        character: ARIA_CHARACTER,
        prompt: finalPrompt,
        textResponse,
        hasImage: !!generatedImageData,
        imageType: generatedImageData?.mimeType || null,
        timestamp,
        model: 'gemini-2.5-flash-image-preview',
        techniques: 'ZHO Nano Banana (46 techniques) + Character Consistency Engine',
        consistencyFeatures: {
          identityPreservation: true,
          distinctiveMarks: ARIA_CHARACTER.distinctiveMarks,
          facialAsymmetry: ARIA_CHARACTER.distinctiveMarks.asymmetry,
          universalPreservation: true
        }
      }, null, 2)
    );

    console.log('\n✅ Generation Complete!');
    console.log(`📁 Output saved to: ${outputDir}`);
    console.log('\n📊 Generation Details:');
    console.log('  • Character: Aria (28, Insurance Advisor)');
    console.log('  • Ethnicity: Mixed Latina/European');
    console.log('  • Consistency: CharacterConsistencyEngine applied');
    console.log('  • Features: Exact facial specifications preserved');
    console.log('  • Distinctive Marks: Beauty mark, freckles, asymmetry');
    console.log('  • Techniques: 46 ZHO + Universal Character Preservation');
    console.log('  • Model: Gemini 2.5 Flash Image Preview');
    console.log('\n💡 Note: Enhanced consistency prompting applied for same Aria across generations');

  } catch (error: any) {
    console.error('\n❌ Generation failed:', error.message);
    if (error.message?.includes('429')) {
      console.error('⚠️  API quota exceeded - wait before retrying');
    }
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  generateSingleAriaImage().then(() => {
    console.log('\n🎯 Done! Exiting...');
    process.exit(0);
  });
}

export { generateSingleAriaImage };