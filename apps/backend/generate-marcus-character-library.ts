/**
 * Marcus Professional Character Library Generator
 *
 * Generates complete 4-shot production library for Marcus to match
 * Aria, Bianca, and Sofia character libraries.
 *
 * Shot Types:
 * - full-body-standing (9:16) - with green screen
 * - full-body-seated (16:9) - with green screen
 * - three-quarter-standing (4:5) - with green screen
 * - professional-headshot (1:1) - no green screen
 *
 * Output:
 * - 4 ultra-realistic images with character consistency
 * - Complete metadata file with prompts and specifications
 * - Usage guide for VEO3 and social media integration
 *
 * Cost: ~$0.156 (4 images × $0.039)
 * Time: ~37 seconds total generation
 */

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { MarcusProfessional } from './src/characters/marcus-professional';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ShotType {
  name: string;
  description: string;
  promptModifications: string;
  aspectRatio: string;
  useGreenScreen: boolean;
}

interface GenerationResult {
  success: boolean;
  shotType: string;
  aspectRatio: string;
  imagePath?: string;
  error?: string;
  prompt?: string;
}

const shotTypes: ShotType[] = [
  {
    name: 'full-body-standing',
    description: 'Full body professional standing shot',
    promptModifications: 'Full body professional shot standing confidently, complete business outfit visible from head to toe, professional executive stance with good posture, commanding presence',
    aspectRatio: '9:16',
    useGreenScreen: true
  },
  {
    name: 'full-body-seated',
    description: 'Full body seated at desk or boardroom table',
    promptModifications: 'Full body shot seated professionally at executive desk or boardroom table, professional business attire visible, confident executive posture, hands positioned naturally on desk',
    aspectRatio: '16:9',
    useGreenScreen: true
  },
  {
    name: 'three-quarter-standing',
    description: 'Three-quarter body shot from waist up',
    promptModifications: 'Three-quarter shot from waist up, professional executive posture with hands visible, sharp business attire clearly shown, confident authoritative stance',
    aspectRatio: '4:5',
    useGreenScreen: true
  },
  {
    name: 'professional-headshot',
    description: 'Professional executive headshot for corporate use',
    promptModifications: 'Professional executive headshot from shoulders up, direct confident eye contact with camera, sharp corporate business attire visible, commanding executive presence',
    aspectRatio: '1:1',
    useGreenScreen: false
  }
];

/**
 * Enhance Marcus base prompt with shot-specific modifications and green screen
 */
function enhancePromptForShotType(basePrompt: string, shotType: ShotType): string {
  let enhancedPrompt = `${basePrompt}

SHOT COMPOSITION: ${shotType.promptModifications}
ASPECT RATIO: ${shotType.aspectRatio}
CHARACTER: Marcus Professional Executive`;

  if (shotType.useGreenScreen) {
    enhancedPrompt += `

BACKGROUND: Solid bright green background (chroma key green #00FF00) for easy character extraction and background replacement. Clean green screen setup with even lighting to avoid shadows or color spill. Perfect for VEO3 video firstFrame input.`;
  } else {
    enhancedPrompt += `

BACKGROUND: Professional neutral gradient background suitable for corporate headshots. Subtle, non-distracting background that emphasizes the executive presence.`;
  }

  enhancedPrompt += `

TECHNICAL REQUIREMENTS:
- Ultra-high resolution for professional use
- Professional lighting setup enhancing natural masculine features
- Sharp focus throughout the image
- Commercial photography quality
- Perfect for VEO3 video generation as firstFrame input
- Maintain character consistency across all shots

AVOID: over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed, feminine features, soft appearance`;

  return enhancedPrompt;
}

/**
 * Generate Marcus character library
 */
async function generateMarcusCharacterLibrary() {
  console.log('🎬 Marcus Professional Character Library Generator\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  // Initialize Marcus character
  const marcus = new MarcusProfessional();
  console.log(`✅ Loaded Marcus character definition\n`);

  // Initialize Gemini API
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
  console.log(`✅ Initialized Gemini 2.5 Flash Image Preview API\n`);

  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, 'generated', 'character-library', timestamp);
  const marcusDir = path.join(outputDir, 'marcus');

  await fs.mkdir(marcusDir, { recursive: true });
  console.log(`✅ Created output directory: ${outputDir}\n`);

  // Generate images for each shot type
  const results: GenerationResult[] = [];

  console.log(`🎨 Generating 4 shot types for Marcus...\n`);

  for (const shotType of shotTypes) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n📸 Generating: ${shotType.name} (${shotType.aspectRatio})`);
    console.log(`   ${shotType.description}`);
    console.log(`   Green screen: ${shotType.useGreenScreen ? 'YES' : 'NO'}\n`);

    try {
      // Generate base prompt from Marcus character
      const basePrompt = marcus.generateBasePrompt({
        setting: 'professional corporate environment',
        mood: 'confident executive',
        action: 'professional business pose'
      });

      // Enhance with shot-specific modifications
      const enhancedPrompt = enhancePromptForShotType(basePrompt, shotType);

      console.log(`   🔄 Calling Gemini 2.5 Flash Image Preview...`);

      // Generate image using Gemini 2.5 Flash Image Preview
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [{
          role: "user",
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Character consistency
          responseMimeType: 'image/png'
        }
      });

      // Extract image data (process all candidates and parts like working script)
      let generatedImageData = null;

      for (const candidate of result.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            generatedImageData = part.inlineData;
            break;
          }
        }
        if (generatedImageData) break;
      }

      if (generatedImageData?.data) {
        // Save image
        const imagePath = path.join(
          marcusDir,
          `marcus-${shotType.name}-${timestamp}.png`
        );
        const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
        await fs.writeFile(imagePath, imageBuffer);

        console.log(`   ✅ Image saved: ${path.basename(imagePath)}`);
        console.log(`   📏 Aspect ratio: ${shotType.aspectRatio}`);
        console.log(`   💾 Size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);

        results.push({
          success: true,
          shotType: shotType.name,
          aspectRatio: shotType.aspectRatio,
          imagePath: path.basename(imagePath),
          prompt: enhancedPrompt
        });
      } else {
        throw new Error('No image data in response');
      }

      // Wait 3 seconds between generations to avoid rate limits
      if (shotTypes.indexOf(shotType) < shotTypes.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next generation...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Error generating ${shotType.name}:`, error);
      results.push({
        success: false,
        shotType: shotType.name,
        aspectRatio: shotType.aspectRatio,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate metadata file
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📋 Generating metadata file...\n`);

  const successfulResults = results.filter(r => r.success);
  const metadata = {
    generated: timestamp,
    character: 'Marcus Professional',
    totalImages: results.length,
    successfulImages: successfulResults.length,
    successRate: `${((successfulResults.length / results.length) * 100).toFixed(1)}%`,
    shotTypes: shotTypes.map(st => st.name),
    aspectRatios: shotTypes.map(st => `${st.name}: ${st.aspectRatio}`),
    greenScreenShots: shotTypes.filter(st => st.useGreenScreen).map(st => st.name),
    results: results.map(r => ({
      shotType: r.shotType,
      aspectRatio: r.aspectRatio,
      success: r.success,
      imagePath: r.imagePath,
      error: r.error
    })),
    characterDefinition: {
      name: marcus.profile.name,
      profession: marcus.profile.profession,
      age: marcus.profile.age,
      ethnicity: marcus.profile.appearance.ethnicity,
      eyeColor: marcus.characterIdentity.facialFeatures.eyeColor,
      hairStyle: marcus.characterIdentity.hairStyle,
      facialHair: marcus.characterIdentity.facialHair
    },
    infrastructure: {
      model: 'gemini-2.5-flash-image-preview',
      characterConsistencyEngine: 'Used MarcusProfessional character definition',
      skinRealismEngine: 'Applied masculine skin realism configurations',
      greenScreenSupport: 'Enabled for 3 shot types (not headshot)'
    },
    usage: {
      veo3VideoGeneration: 'Use any image as firstFrame input for VEO3 video generation',
      greenScreenBenefits: 'Easy background replacement for various settings',
      platformOptimization: {
        tiktok: 'full-body-standing (9:16)',
        youtube: 'full-body-seated (16:9)',
        instagram: 'three-quarter-standing (4:5)',
        linkedin: 'professional-headshot (1:1)'
      }
    }
  };

  const metadataPath = path.join(outputDir, `character-library-metadata-${timestamp}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`   ✅ Metadata saved: ${path.basename(metadataPath)}\n`);

  // Generate usage guide
  console.log(`📖 Generating usage guide...\n`);

  const usageGuide = `MARCUS PROFESSIONAL CHARACTER LIBRARY - USAGE GUIDE
Generated: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHARACTER PROFILE:
• Name: Marcus
• Profession: Business Executive & Corporate Advisor
• Age: 35 years old
• Appearance: Mixed European/Mediterranean heritage, steel-blue eyes, strong jawline
• Style: Sharp executive professional, authoritative, polished, successful

SHOT TYPES GENERATED:
• full-body-standing: Full body professional standing shot (9:16) - WITH GREEN SCREEN
• full-body-seated: Full body seated at executive desk (16:9) - WITH GREEN SCREEN
• three-quarter-standing: Three-quarter body from waist up (4:5) - WITH GREEN SCREEN
• professional-headshot: Executive headshot (1:1) - NEUTRAL BACKGROUND

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO USE:

1. VEO3 VIDEO GENERATION:
   - Use any Marcus image as firstFrame input for video generation
   - Character consistency maintained across all shots
   - Green screen shots allow easy background replacement
   - Example: Use full-body-standing for corporate office background

2. SOCIAL MEDIA OPTIMIZATION:
   - TikTok/Reels: Use full-body-standing (9:16)
   - YouTube: Use full-body-seated (16:9)
   - Instagram: Use three-quarter-standing (4:5)
   - LinkedIn: Use professional-headshot (1:1)

3. BACKGROUND REPLACEMENT:
   - Green screen shots (#00FF00) enable easy chroma keying
   - Replace with: office backgrounds, boardrooms, financial districts
   - Maintains professional business environment

4. CHARACTER CONSISTENCY:
   - All shots preserve exact facial features
   - Steel-blue eyes, strong jawline, facial hair maintained
   - Professional business attire consistent
   - Executive presence preserved across all angles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SPECIFICATIONS:

Model: Gemini 2.5 Flash Image Preview (NanoBanana)
Temperature: 0.3 (character consistency)
Quality: Ultra-high resolution, professional photography
Character Engine: MarcusProfessional class with CharacterIdentity
Realism: Natural masculine appearance with authentic imperfections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTENT CREATION WORKFLOW:

1. Select appropriate shot type for platform
2. Use as VEO3 firstFrame input
3. Generate 8-second video segment
4. Replace green screen background if needed
5. Stitch multiple segments with FFmpeg
6. Optional: Enhance with Topaz Video AI for 4K

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BRAND INTEGRATION:

Settings: Corporate office, boardroom, professional workspace
Messaging: Business success, executive leadership, professional expertise
Expertise: Corporate strategy, business development, investment planning
Target Audience: Business executives, entrepreneurs, corporate professionals

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHARACTER CONSISTENCY ANCHORS:

MUST PRESERVE:
- Steel-blue eyes with natural intensity
- Strong, defined jawline
- Well-groomed facial hair (beard/stubble)
- Short, professionally styled dark hair
- Warm tan skin tone with neutral undertones
- Athletic professional build
- Confident executive posture
- 6'1" commanding height

ALLOWABLE VARIATIONS:
- Business attire style (suit vs. business casual)
- Facial hair length (trimmed beard to designer stubble)
- Background setting (office, boardroom, lounge)
- Expression intensity (confident to authoritative)
- Camera angle and lighting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUCCESS METRICS:

Total Images: ${results.length}
Successful: ${successfulResults.length}
Success Rate: ${((successfulResults.length / results.length) * 100).toFixed(1)}%
Green Screen Shots: 3/4
Platform Coverage: 100% (TikTok, YouTube, Instagram, LinkedIn)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by: SmokeTech Studio Viral Engine
Character System: Ultra-Realistic Character Manager
Model: Gemini 2.5 Flash Image Preview (NanoBanana)

Sign off as SmokeDev 🚬
`;

  const usageGuidePath = path.join(outputDir, `usage-guide-${timestamp}.txt`);
  await fs.writeFile(usageGuidePath, usageGuide);
  console.log(`   ✅ Usage guide saved: ${path.basename(usageGuidePath)}\n`);

  // Final summary
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n🎉 MARCUS CHARACTER LIBRARY GENERATION COMPLETE!\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📊 RESULTS:`);
  console.log(`   Total shots attempted: ${results.length}`);
  console.log(`   Successful: ${successfulResults.length}`);
  console.log(`   Success rate: ${((successfulResults.length / results.length) * 100).toFixed(1)}%\n`);
  console.log(`📁 OUTPUT LOCATION:`);
  console.log(`   ${outputDir}\n`);
  console.log(`📸 GENERATED IMAGES:`);
  successfulResults.forEach(r => {
    console.log(`   ✅ ${r.imagePath} (${r.aspectRatio})`);
  });
  console.log(`\n📋 METADATA FILE:`);
  console.log(`   ${path.basename(metadataPath)}\n`);
  console.log(`📖 USAGE GUIDE:`);
  console.log(`   ${path.basename(usageGuidePath)}\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`🎯 NEXT STEPS:`);
  console.log(`   1. Review generated images in marcus/ directory`);
  console.log(`   2. Use images as VEO3 firstFrame inputs`);
  console.log(`   3. Replace green screen backgrounds as needed`);
  console.log(`   4. Integrate with SmokeTech Studio showcase\n`);
  console.log(`💰 COST: ~$${(successfulResults.length * 0.039).toFixed(3)}`);
  console.log(`⏱️  TIME: ~${results.length * 10} seconds\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// Execute generation
generateMarcusCharacterLibrary()
  .then(() => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  });