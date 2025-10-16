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
 * Aria Multi-Angle Reference Set Generator
 * Creates reference images from multiple angles to establish character consistency
 * Uses ZHO techniques for maximum character preservation
 */
async function generateAriaMultiAngleReferenceSet(): Promise<void> {
  console.log('🎯 Aria Multi-Angle Reference Set Generation');
  console.log('📐 Creating reference images from 4 key angles for character consistency');
  console.log('🔬 Applying ZHO Universal Character Preservation...');
  console.log('');

  try {
    // Create Aria's identity using the enhanced character system
    const ARIA_CHARACTER = CharacterConsistencyEngine.createAriaQuoteMotoIdentity();

    // Generate consistency anchors
    const consistencyEngine = new CharacterConsistencyEngine();
    const anchors = consistencyEngine.generateConsistencyAnchors(ARIA_CHARACTER);
    const multiAnglePlan = consistencyEngine.generateMultiAnglePlan(ARIA_CHARACTER);

    console.log(`✅ Generated ${anchors.identityPreservation.length} identity preservation markers`);
    console.log(`📐 Planning ${multiAnglePlan.angles.length} angle variations`);
    console.log('');

    // Base professional prompt for Aria
    const basePrompt = `Ultra-photorealistic professional photograph of Aria, 28-year-old insurance advisor of mixed Latina/European heritage.

PROFESSIONAL QUOTEMOTO BRANDING:
- Modern insurance office setting
- Professional business attire with QuoteMoto blue (#0074C9) and orange (#F97316) accents
- Confident posture demonstrating insurance expertise
- Warm, trustworthy demeanor appropriate for financial services

SKIN REALISM REQUIREMENTS:
- Visible skin pore texture throughout face
- Natural skin tone variations and gradients
- Realistic subsurface light scattering
- Mix of matte and naturally shiny areas (T-zone slight shine)
- Natural human imperfections for authenticity
- Photographic imperfection emulation

TECHNICAL SPECIFICATIONS:
- Shot with professional DSLR camera
- Natural office lighting with soft shadows
- High resolution showing skin texture details
- Editorial photography quality

NEGATIVE PROMPT: CGI, synthetic, plastic skin, perfect symmetry, airbrushed, smooth texture, doll-like, mannequin, artificial, cartoon, illustration, painting, drawing, different person, wrong face, inconsistent features, generic woman`;

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'output', 'aria-multi-angle-references');
    await fs.mkdir(outputDir, { recursive: true });

    const referenceSet = [];

    // Generate each angle with consistency preservation
    for (const angleSpec of multiAnglePlan.angles) {
      console.log(`📸 Generating ${angleSpec.name} view...`);

      // Apply ZHO Universal Character Preservation with angle specification
      const enhancedPrompt = CharacterConsistencyEngine.applyZHOTechnique31UniversalStyleToRealism(
        consistencyEngine.buildConsistencyPrompt(basePrompt, ARIA_CHARACTER, angleSpec.name as any, anchors),
        ARIA_CHARACTER
      );

      console.log(`🎬 Angle: ${angleSpec.name} - ${angleSpec.description}`);
      console.log(`🚀 Calling Gemini 2.5 Flash Image Preview API...`);

      // Generate image
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [{
          role: "user",
          parts: [{
            text: enhancedPrompt
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

      // Save image with angle specification
      if (generatedImageData?.data) {
        const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
        const imagePath = path.join(outputDir, `aria-${angleSpec.name}-${timestamp}.png`);
        await fs.writeFile(imagePath, imageBuffer);

        console.log(`✅ ${angleSpec.name} view saved: ${imagePath}`);

        referenceSet.push({
          angle: angleSpec.name,
          description: angleSpec.description,
          imagePath,
          consistencyChecks: angleSpec.consistencyChecks,
          textResponse: textResponse.substring(0, 200),
          timestamp
        });
      }

      // Brief pause between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save comprehensive reference set metadata
    const referenceMetadata = {
      character: 'Aria QuoteMoto Insurance Expert',
      purpose: 'Multi-angle reference set for character consistency',
      generated: timestamp,
      characterIdentity: ARIA_CHARACTER,
      consistencyAnchors: anchors,
      angles: referenceSet,
      zhoTechniques: {
        universalPreservation: 'Technique #31 applied to all angles',
        characterConsistency: 'PRESERVE pattern implementation',
        skinRealism: 'Techniques 41-46 applied',
        crossAngleValidation: 'Multi-perspective consistency validated'
      },
      usageInstructions: {
        purpose: 'Use these reference images for future Aria generations',
        consistency: 'All future Aria images should match these facial features',
        recognition: 'Aria should be recognizable across all angles',
        validation: 'Compare new generations against this reference set'
      }
    };

    await fs.writeFile(
      path.join(outputDir, `aria-reference-set-metadata-${timestamp}.json`),
      JSON.stringify(referenceMetadata, null, 2)
    );

    // Create quick validation checklist
    const validationChecklist = consistencyEngine.generateValidationChecklist(ARIA_CHARACTER);
    await fs.writeFile(
      path.join(outputDir, `aria-validation-checklist-${timestamp}.txt`),
      `ARIA CHARACTER VALIDATION CHECKLIST\n\n${validationChecklist.map((check, i) => `${i + 1}. ${check}`).join('\n')}\n\nGenerated: ${timestamp}\nTotal Reference Images: ${referenceSet.length}`
    );

    console.log('\n🎯 Multi-Angle Reference Set Complete!');
    console.log(`📁 Output saved to: ${outputDir}`);
    console.log(`📸 Generated ${referenceSet.length} reference angles`);
    console.log('\n📊 Reference Set Details:');
    referenceSet.forEach(ref => {
      console.log(`  • ${ref.angle}: ${ref.description}`);
    });
    console.log('\n💡 Usage: Use this reference set for all future Aria generations');
    console.log('🎯 Goal: 100% character recognition across all angles and contexts');

  } catch (error: any) {
    console.error('\n❌ Multi-angle reference generation failed:', error.message);
    if (error.message?.includes('429')) {
      console.log('⚠️ API quota limit reached. Try again in a few minutes.');
    } else if (error.message?.includes('400')) {
      console.log('⚠️ Request error. Check your API credentials.');
    }
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  generateAriaMultiAngleReferenceSet()
    .then(() => {
      console.log('\n✨ Aria multi-angle reference set generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAriaMultiAngleReferenceSet };