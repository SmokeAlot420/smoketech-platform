import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client for NanoBanana
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

interface BackgroundVariation {
  name: string;
  environment: string;
  context: string;
  lighting: string;
  cameraAngle: string;
}

interface ProcessingResult {
  step: string;
  imageName: string;
  success: boolean;
  outputPath?: string;
  error?: string;
}

/**
 * IMPROVED MASTER PIPELINE
 * Using single base character for all variations
 * Three-step process to prevent logo distortion
 */
async function generateImprovedMaster(): Promise<void> {
  console.log('🚀 IMPROVED MASTER PIPELINE');
  console.log('Single base character, careful transformations');
  console.log('Preventing logo distortion with separated steps');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  const results: ProcessingResult[] = [];

  try {
    // Setup paths
    const baseImagePath = path.join(
      process.cwd(),
      'generated',
      'character-library',
      '2025-09-27T21-04-51-102Z',
      'aria',
      'aria-full-body-standing-2025-09-27T21-04-51-102Z.png'
    );

    const logoPath = path.join(
      process.cwd(),
      'logo',
      'quotemoto-white-logo.png'
    );

    // Verify files exist
    await fs.access(baseImagePath);
    console.log('✅ Base image found:', baseImagePath);

    await fs.access(logoPath);
    console.log('✅ Logo found:', logoPath);

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'improved-master', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    // STEP 1: Clean Base Preparation
    console.log('\n🧹 STEP 1: CLEAN BASE PREPARATION');
    console.log('Removing green screen and any existing logos');

    const cleanBase = await prepareCleanBase(baseImagePath, outputDir);

    if (cleanBase.success) {
      results.push(cleanBase);
      console.log(`✅ Clean base created: ${cleanBase.outputPath}`);
    } else {
      throw new Error(`Clean base preparation failed: ${cleanBase.error}`);
    }

    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));

    // STEP 2: Generate Background Variations
    console.log('\n🎨 STEP 2: BACKGROUND VARIATIONS');
    console.log('Creating 8 diverse insurance-related environments');

    const backgroundVariations: BackgroundVariation[] = [
      {
        name: 'modern-insurance-office',
        environment: 'Modern QuoteMoto insurance office with clean desk, computer monitors showing insurance dashboards, professional office furniture',
        context: 'Professional consultation setting',
        lighting: 'Bright office LED lighting with natural window light',
        cameraAngle: 'Eye-level perspective showing full body'
      },
      {
        name: 'urban-street-walking',
        environment: 'Professional city street with modern buildings, sidewalk, urban business district atmosphere',
        context: 'Walking testimonial or outdoor explanation',
        lighting: 'Natural daylight, golden hour urban lighting',
        cameraAngle: 'Three-quarter view showing movement'
      },
      {
        name: 'car-dealership',
        environment: 'Modern car dealership showroom with vehicles in background, bright clean floors, professional setting',
        context: 'Auto insurance consultation at dealership',
        lighting: 'Bright showroom lighting, reflective surfaces',
        cameraAngle: 'Wide shot showing dealership context'
      },
      {
        name: 'coffee-shop-meeting',
        environment: 'Cozy coffee shop with warm atmosphere, casual seating area, professional but relaxed setting',
        context: 'Casual client consultation over coffee',
        lighting: 'Warm interior lighting, natural window light',
        cameraAngle: 'Seated perspective at table'
      },
      {
        name: 'home-consultation',
        environment: 'Professional home living room setting, comfortable furniture, residential insurance context',
        context: 'In-home insurance consultation',
        lighting: 'Soft residential lighting, warm and inviting',
        cameraAngle: 'Standing in living room space'
      },
      {
        name: 'corporate-lobby',
        environment: 'Modern corporate building lobby, professional entrance area, sleek architecture',
        context: 'Meeting clients at corporate location',
        lighting: 'Bright architectural lighting, professional atmosphere',
        cameraAngle: 'Full body shot in spacious lobby'
      },
      {
        name: 'parking-lot-consultation',
        environment: 'Clean parking lot next to client vehicle, outdoor professional consultation setting',
        context: 'Auto insurance inspection or consultation',
        lighting: 'Natural outdoor lighting, clear day',
        cameraAngle: 'Standing next to vehicle'
      },
      {
        name: 'video-call-office',
        environment: 'Professional home office setup with bookshelf background, clean desk, video call ready environment',
        context: 'Virtual insurance consultations',
        lighting: 'Professional video lighting setup, ring light effect',
        cameraAngle: 'Webcam perspective for video calls'
      }
    ];

    // Generate each background variation using the clean base
    for (let i = 0; i < backgroundVariations.length; i++) {
      const variation = backgroundVariations[i];
      console.log(`\n  🏢 Variation ${i + 1}/8: ${variation.name}`);
      console.log(`  📍 Environment: ${variation.context}`);

      const result = await generateBackgroundVariation(
        cleanBase.outputPath!,
        variation,
        outputDir
      );

      results.push(result);

      if (result.success) {
        console.log(`  ✅ Created: ${result.imageName}`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }

      // Pause between generations
      if (i < backgroundVariations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Brief pause before branding
    console.log('\n⏱️  Pausing before logo application...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // STEP 3: Subtle Logo Application
    console.log('\n🏷️ STEP 3: SUBTLE LOGO BRANDING');
    console.log('Applying QuoteMoto logo carefully to prevent distortion');

    const successfulBackgrounds = results.filter(r => r.step === 'background' && r.success);

    for (const bg of successfulBackgrounds) {
      console.log(`\n  🔖 Branding: ${bg.imageName}`);

      const brandResult = await applySubtleBranding(
        bg.outputPath!,
        logoPath,
        outputDir
      );

      results.push(brandResult);

      if (brandResult.success) {
        console.log(`  ✅ Branded: ${brandResult.imageName}`);
      } else {
        console.log(`  ❌ Failed: ${brandResult.error}`);
      }

      // Pause between brandings
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Generate summary report
    await generateReport(results, outputDir);

    console.log('\n\n🎉 IMPROVED MASTER PIPELINE COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    console.log(`📊 Success rate: ${((successCount/totalCount)*100).toFixed(1)}%`);
    console.log(`✅ Successfully generated: ${successCount}/${totalCount} images`);

    console.log('\n📋 RESULTS SUMMARY:');
    console.log('  Clean Base:', results.filter(r => r.step === 'clean' && r.success).length, '✅');
    console.log('  Backgrounds:', results.filter(r => r.step === 'background' && r.success).length, '/8');
    console.log('  Branded:', results.filter(r => r.step === 'branding' && r.success).length, 'images');

    console.log('\n🚀 READY FOR VEO3 VIDEO GENERATION!');
    console.log('Sign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Pipeline failed:', error.message);
    throw error;
  }
}

/**
 * STEP 1: Prepare clean base without green screen or logos
 */
async function prepareCleanBase(
  baseImagePath: string,
  outputDir: string
): Promise<ProcessingResult> {
  try {
    const imageData = await fs.readFile(baseImagePath);
    const imageBase64 = imageData.toString('base64');

    const prompt = `Professional insurance expert Aria from QuoteMoto standing in neutral setting.

CRITICAL REQUIREMENTS:
1. REMOVE the green screen background completely
2. REMOVE any logos or emblems from clothing
3. Replace with clean, neutral white/gray gradient background
4. Keep Aria's exact appearance, face, and professional attire
5. Ensure clothing is clean professional attire without any branding

PRESERVE EXACTLY:
- Aria's facial features and expression
- Professional stance and posture
- Hair style and color
- Body proportions and positioning

OUTPUT:
Clean professional Aria ready for background variations
No logos or branding visible
Neutral background for easy compositing`;

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
      const outputPath = path.join(outputDir, 'aria-clean-base.png');
      const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
      await fs.writeFile(outputPath, imageBuffer);

      return {
        step: 'clean',
        imageName: 'aria-clean-base.png',
        success: true,
        outputPath
      };
    } else {
      throw new Error('No image data returned');
    }

  } catch (error: any) {
    return {
      step: 'clean',
      imageName: 'aria-clean-base.png',
      success: false,
      error: error.message
    };
  }
}

/**
 * STEP 2: Generate background variation
 */
async function generateBackgroundVariation(
  cleanBasePath: string,
  variation: BackgroundVariation,
  outputDir: string
): Promise<ProcessingResult> {
  try {
    const imageData = await fs.readFile(cleanBasePath);
    const imageBase64 = imageData.toString('base64');

    const prompt = `Professional insurance expert Aria in ${variation.environment}.

SCENE REQUIREMENTS:
- Environment: ${variation.environment}
- Context: ${variation.context}
- Lighting: ${variation.lighting}
- Camera: ${variation.cameraAngle}

CRITICAL PRESERVATION:
- Keep Aria's EXACT appearance from the input image
- Maintain her professional attire (no logos yet)
- Preserve facial features, expression, and posture
- Only change the background environment

QUALITY:
- Ultra-photorealistic environment
- Natural lighting integration
- Professional photography quality
- Seamless composition

OUTPUT:
Aria naturally integrated into ${variation.name} setting
Ready for logo application in next step`;

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
      const outputPath = path.join(outputDir, `aria-${variation.name}.png`);
      const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
      await fs.writeFile(outputPath, imageBuffer);

      return {
        step: 'background',
        imageName: `aria-${variation.name}.png`,
        success: true,
        outputPath
      };
    } else {
      throw new Error('No image data returned');
    }

  } catch (error: any) {
    return {
      step: 'background',
      imageName: `aria-${variation.name}.png`,
      success: false,
      error: error.message
    };
  }
}

/**
 * STEP 3: Apply subtle branding with logo
 */
async function applySubtleBranding(
  backgroundImagePath: string,
  logoPath: string,
  outputDir: string
): Promise<ProcessingResult> {
  try {
    const imageData = await fs.readFile(backgroundImagePath);
    const imageBase64 = imageData.toString('base64');

    const logoData = await fs.readFile(logoPath);
    const logoBase64 = logoData.toString('base64');

    // Extract image name for output
    const imageName = path.basename(backgroundImagePath, '.png');

    const prompt = `Apply the QuoteMoto logo from image 2 to Aria's professional attire in image 1.

LOGO PLACEMENT REQUIREMENTS:
- Place logo SUBTLY on Aria's clothing (polo shirt or jacket)
- Keep logo SMALL and professional (chest pocket size)
- Ensure logo is CRISP and undistorted
- Natural integration like embroidered or printed logo
- Professional corporate appearance

CRITICAL:
- DO NOT distort or stretch the logo
- DO NOT make the logo too large
- DO NOT place multiple logos
- PRESERVE all other aspects of image 1 exactly

OUTPUT:
Professionally branded Aria with subtle QuoteMoto logo
Natural looking corporate attire branding`;

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
      const outputPath = path.join(outputDir, `${imageName}-branded.png`);
      const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
      await fs.writeFile(outputPath, imageBuffer);

      return {
        step: 'branding',
        imageName: `${imageName}-branded.png`,
        success: true,
        outputPath
      };
    } else {
      throw new Error('No image data returned');
    }

  } catch (error: any) {
    const imageName = path.basename(backgroundImagePath, '.png');
    return {
      step: 'branding',
      imageName: `${imageName}-branded.png`,
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate final report
 */
async function generateReport(results: ProcessingResult[], outputDir: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const report = {
    generated: timestamp,
    pipeline: 'Improved Master Pipeline',
    totalProcessed: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
    steps: {
      cleanBase: results.filter(r => r.step === 'clean').map(r => ({
        name: r.imageName,
        success: r.success,
        error: r.error
      })),
      backgrounds: results.filter(r => r.step === 'background').map(r => ({
        name: r.imageName,
        success: r.success,
        error: r.error
      })),
      branding: results.filter(r => r.step === 'branding').map(r => ({
        name: r.imageName,
        success: r.success,
        error: r.error
      }))
    },
    outputDirectory: outputDir,
    estimatedCost: `$${(results.filter(r => r.success).length * 0.02).toFixed(2)}`
  };

  await fs.writeFile(
    path.join(outputDir, `pipeline-report-${timestamp}.json`),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📊 Report saved: pipeline-report-${timestamp}.json`);
}

// Execute if run directly
if (require.main === module) {
  generateImprovedMaster()
    .then(() => {
      console.log('\n✨ Improved master pipeline complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateImprovedMaster };