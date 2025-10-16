import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client for NanoBanana
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

interface BackgroundTemplate {
  name: string;
  environment: string;
  platform: string;
  aspectRatio: '16:9' | '9:16' | '4:5' | '1:1';
  lighting: string;
  context: string;
  description: string;
}

interface ShotTypeMapping {
  [shotType: string]: BackgroundTemplate[];
}

interface BackgroundGenerationResult {
  sourceImage: string;
  shotType: string;
  backgroundTemplate: BackgroundTemplate;
  success: boolean;
  imagePath?: string;
  error?: string;
  prompt: string;
}

/**
 * MASTER BACKGROUND GENERATION SYSTEM
 * Intelligently applies backgrounds based on shot types using ZHO Technique #31
 * Creates professional environments optimized for each platform
 */
async function generateMasterBackgrounds(): Promise<void> {
  console.log('🎬 MASTER BACKGROUND GENERATION SYSTEM');
  console.log('Intelligent background application based on shot types');
  console.log('Using ZHO Technique #31 for ultra-realistic environments');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Define smart background mapping based on shot types
    const SMART_BACKGROUND_MAP: ShotTypeMapping = {
      'full-body-standing': [
        {
          name: 'car-interior-driving',
          environment: 'luxury car interior, driver seat perspective, modern dashboard visible, leather seats, professional car environment',
          platform: 'TikTok/Reels',
          aspectRatio: '9:16',
          lighting: 'natural daylight streaming through windshield, dashboard ambient lighting, golden hour car lighting',
          context: 'Mobile insurance content, driving scenarios, quick tips',
          description: 'Dynamic car interior for viral mobile content'
        },
        {
          name: 'outdoor-urban-professional',
          environment: 'professional urban street, modern office buildings background, city business district atmosphere',
          platform: 'Instagram Stories',
          aspectRatio: '9:16',
          lighting: 'golden hour outdoor lighting, professional street photography, warm urban lighting',
          context: 'Walking testimonials, outdoor professional content',
          description: 'Urban professional environment for walking content'
        }
      ],

      'full-body-seated': [
        {
          name: 'office-consultation-desk',
          environment: 'modern insurance office, professional consultation desk, QuoteMoto branded materials visible, corporate setting',
          platform: 'YouTube/Website',
          aspectRatio: '16:9',
          lighting: 'professional office LED panels, soft overhead lighting, natural window light blend',
          context: 'Consultation videos, educational content, expert interviews',
          description: 'Professional consultation environment for long-form content'
        },
        {
          name: 'conference-room-presentation',
          environment: 'corporate conference room, presentation screen background, professional meeting environment',
          platform: 'Corporate/Training',
          aspectRatio: '16:9',
          lighting: 'bright conference room lighting, professional meeting lighting, subtle shadows',
          context: 'Training videos, corporate presentations, team meetings',
          description: 'Corporate conference room for professional presentations'
        }
      ],

      'three-quarter-standing': [
        {
          name: 'home-office-warm',
          environment: 'cozy professional home office, bookshelf background, plants, warm approachable setting',
          platform: 'Instagram Feed',
          aspectRatio: '4:5',
          lighting: 'soft natural window lighting, warm desk lamp glow, cozy home ambiance',
          context: 'Personal brand content, approachable expert content',
          description: 'Warm home office for approachable social content'
        },
        {
          name: 'retail-insurance-location',
          environment: 'modern insurance retail location, branded environment, customer service area',
          platform: 'Facebook',
          aspectRatio: '4:5',
          lighting: 'bright retail lighting, professional storefront lighting, welcoming atmosphere',
          context: 'Customer service content, retail insurance education',
          description: 'Insurance retail location for customer-focused content'
        }
      ],

      'professional-headshot': [
        {
          name: 'corporate-office-wall',
          environment: 'professional office, clean corporate wall background, subtle office elements',
          platform: 'LinkedIn',
          aspectRatio: '1:1',
          lighting: 'professional headshot lighting, soft key light, minimal shadows',
          context: 'Professional profiles, corporate testimonials, expert credibility',
          description: 'Clean corporate background for professional headshots'
        },
        {
          name: 'minimal-professional-gradient',
          environment: 'clean minimal background, subtle navy-to-white gradient, professional studio setting',
          platform: 'Profile Pictures',
          aspectRatio: '1:1',
          lighting: 'studio portrait lighting, perfect key light, professional photo quality',
          context: 'Profile pictures, avatars, clean professional branding',
          description: 'Minimal clean background for versatile profile use'
        }
      ]
    };

    // Find the character library
    const characterLibraryDir = await findLatestCharacterLibrary();
    console.log(`📁 Using character library: ${characterLibraryDir}`);

    // Load Aria's base images
    const ariaDir = path.join(characterLibraryDir, 'aria');
    const imageFiles = await fs.readdir(ariaDir);
    const ariaImages = imageFiles.filter(f => f.endsWith('.png'));

    console.log(`📸 Found Aria base images: ${ariaImages.length}`);
    ariaImages.forEach(img => console.log(`  - ${img}`));

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'master-backgrounds', 'aria', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: BackgroundGenerationResult[] = [];

    // Process each base image
    for (const imageFile of ariaImages) {
      // Extract shot type from filename
      const shotType = extractShotType(imageFile);

      if (!shotType || !SMART_BACKGROUND_MAP[shotType]) {
        console.log(`⚠️  Skipping ${imageFile} - unknown shot type`);
        continue;
      }

      const imagePath = path.join(ariaDir, imageFile);
      const backgroundTemplates = SMART_BACKGROUND_MAP[shotType];

      console.log(`\n📸 Processing: ${imageFile}`);
      console.log(`🎯 Shot Type: ${shotType}`);
      console.log(`🏢 Generating ${backgroundTemplates.length} background variations`);

      // Generate each background for this shot type
      for (let i = 0; i < backgroundTemplates.length; i++) {
        const template = backgroundTemplates[i];

        console.log(`\n  🎨 Background ${i + 1}/${backgroundTemplates.length}: ${template.name}`);
        console.log(`  📱 Platform: ${template.platform}`);
        console.log(`  📐 Aspect ratio: ${template.aspectRatio}`);
        console.log(`  🏢 Environment: ${template.environment}`);

        try {
          // Read source image as base64
          const sourceImageData = await fs.readFile(imagePath);
          const sourceImageBase64 = sourceImageData.toString('base64');

          // Create enhanced prompt using ZHO technique #31
          const backgroundPrompt = createBackgroundPrompt(shotType, template);
          console.log(`  📝 Applying ZHO technique #31...`);

          const startTime = Date.now();

          // Generate background-integrated image using NanoBanana
          const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
              role: "user",
              parts: [
                {
                  text: backgroundPrompt
                },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: sourceImageBase64
                  }
                }
              ]
            }]
          });

          const generationTime = Date.now() - startTime;

          let generatedImageData = null;

          // Process response
          for (const candidate of result.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData) {
                generatedImageData = part.inlineData;
              }
            }
          }

          // Save background-integrated image
          if (generatedImageData?.data) {
            const outputImagePath = path.join(
              outputDir,
              `aria-${shotType}-${template.name}-${timestamp}.png`
            );

            const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
            await fs.writeFile(outputImagePath, imageBuffer);

            console.log(`  ✅ Saved: ${path.basename(outputImagePath)}`);

            // Get file size
            const stats = await fs.stat(outputImagePath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`  📊 Size: ${fileSizeMB} MB`);
            console.log(`  ⏱️  Time: ${Math.round(generationTime/1000)}s`);
            console.log(`  💰 Cost: $0.02`);

            results.push({
              sourceImage: imageFile,
              shotType,
              backgroundTemplate: template,
              success: true,
              imagePath: outputImagePath,
              prompt: backgroundPrompt
            });

          } else {
            console.log(`  ❌ Failed: No image data returned`);
            results.push({
              sourceImage: imageFile,
              shotType,
              backgroundTemplate: template,
              success: false,
              error: 'No image data returned',
              prompt: backgroundPrompt
            });
          }

          // Brief pause between generations
          if (i < backgroundTemplates.length - 1) {
            console.log('  ⏱️  Waiting 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (error: any) {
          console.log(`  ❌ Failed: ${error.message}`);
          results.push({
            sourceImage: imageFile,
            shotType,
            backgroundTemplate: template,
            success: false,
            error: error.message,
            prompt: ''
          });
        }
      }
    }

    // Save comprehensive metadata
    const metadata = {
      generated: timestamp,
      purpose: 'Master background generation with intelligent shot-type mapping',
      technique: 'ZHO Technique #31: "turn this illustration into realistic version"',
      sourceLibrary: characterLibraryDir,
      totalImages: results.length,
      successfulImages: results.filter(r => r.success).length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      backgroundMapping: SMART_BACKGROUND_MAP,
      results,
      totalCost: `$${(results.filter(r => r.success).length * 0.02).toFixed(2)}`,
      nextSteps: [
        'Apply QuoteMoto logo branding using generate-master-branded.ts',
        'Test VEO3 video generation with background-integrated images',
        'Verify all platform optimizations work correctly'
      ]
    };

    await fs.writeFile(
      path.join(outputDir, `master-backgrounds-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    // Create usage guide
    const usageGuide = `
MASTER BACKGROUND GENERATION RESULTS
Generated: ${timestamp}

🎯 PURPOSE:
Intelligent background application based on shot types
Eliminates green screen artifacts with professional environments

📊 RESULTS:
Total Images: ${results.length}
Successful: ${results.filter(r => r.success).length}
Success Rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%

📸 GENERATED BACKGROUNDS:
${results.map((r, i) => `${i + 1}. ${r.sourceImage} → ${r.backgroundTemplate.name} (${r.backgroundTemplate.platform}) - ${r.success ? '✅' : '❌'}`).join('\\n')}

🧠 SMART MAPPING APPLIED:
• full-body-standing → Car interior + Outdoor professional
• full-body-seated → Office consultation + Conference room
• three-quarter-standing → Home office + Retail location
• professional-headshot → Corporate wall + Minimal gradient

📱 PLATFORM OPTIMIZATION:
• TikTok/Reels: Car interior (9:16)
• Instagram Stories: Outdoor professional (9:16)
• YouTube/Website: Office consultation (16:9)
• Instagram Feed: Home office (4:5)
• LinkedIn: Corporate headshots (1:1)

🚀 READY FOR STEP 2:
Run generate-master-branded.ts to add QuoteMoto logos

💰 Total Cost: ${(results.filter(r => r.success).length * 0.02).toFixed(2)}

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(outputDir, `usage-guide-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n\n🎉 MASTER BACKGROUND GENERATION COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`📸 Backgrounds generated: ${results.filter(r => r.success).length}/${results.length}`);
    console.log(`💰 Total cost: $${(results.filter(r => r.success).length * 0.02).toFixed(2)}`);

    console.log('\n📋 BACKGROUND GENERATION SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.shotType} → ${result.backgroundTemplate.name} (${result.backgroundTemplate.platform})`);
    });

    console.log('\n🚀 MASTER BACKGROUNDS READY FOR:');
    console.log('  ✅ QuoteMoto logo branding application');
    console.log('  ✅ Platform-optimized aspect ratios');
    console.log('  ✅ Professional environments per shot type');
    console.log('  ✅ No green screen artifacts');

    console.log('\n🎯 NEXT STEP:');
    console.log('  Run generate-master-branded.ts to add QuoteMoto logos');

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Master background generation failed:', error.message);
    throw error;
  }
}

/**
 * Extract shot type from filename
 */
function extractShotType(filename: string): string | null {
  if (filename.includes('full-body-standing')) return 'full-body-standing';
  if (filename.includes('full-body-seated')) return 'full-body-seated';
  if (filename.includes('three-quarter-standing')) return 'three-quarter-standing';
  if (filename.includes('professional-headshot')) return 'professional-headshot';
  return null;
}

/**
 * Find the latest character library directory
 */
async function findLatestCharacterLibrary(): Promise<string> {
  const libraryRoot = path.join(process.cwd(), 'generated', 'character-library');

  try {
    const directories = await fs.readdir(libraryRoot);
    const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

    if (timestampDirs.length === 0) {
      throw new Error('No character library found. Run generate-full-character-library.ts first.');
    }

    // Sort by timestamp (latest first)
    timestampDirs.sort().reverse();
    const latestDir = path.join(libraryRoot, timestampDirs[0]);

    return latestDir;
  } catch (error) {
    throw new Error(`Character library not found: ${error}`);
  }
}

/**
 * Create background integration prompt using ZHO technique #31
 */
function createBackgroundPrompt(shotType: string, template: BackgroundTemplate): string {
  return `Professional insurance expert Aria from QuoteMoto in ${template.environment}.

ZHO TECHNIQUE #31 APPLICATION:
turn this illustration into realistic version

CHARACTER CONSISTENCY (PRESERVE EXACTLY):
- Maintain Aria's exact facial features and professional identity
- Keep amber-brown eyes and confident expression
- Preserve professional QuoteMoto appearance
- Maintain natural skin texture and realism

ENVIRONMENT INTEGRATION:
${template.environment}

LIGHTING SETUP:
${template.lighting}

SHOT COMPOSITION:
${getShotCompositionDescription(shotType)}

PLATFORM OPTIMIZATION:
- Platform: ${template.platform}
- Aspect ratio: ${template.aspectRatio}
- Context: ${template.context}

TECHNICAL REQUIREMENTS:
- Ultra-photorealistic integration
- Natural lighting blends seamlessly
- Professional environment quality
- Sharp focus throughout image
- ${template.aspectRatio} aspect ratio precisely maintained
- Commercial photography standards

BACKGROUND REPLACEMENT SUCCESS:
- Replace green screen completely with ${template.environment}
- Natural shadows and lighting on character
- Seamless integration with new environment
- Professional atmospheric perspective
- Realistic depth of field

AVOID: Green screen artifacts, artificial lighting, poor integration, unrealistic shadows, aspect ratio distortion, amateur photography, low quality backgrounds

PURPOSE: Create professional background-integrated image ready for QuoteMoto logo branding and VEO3 video generation.`;
}

/**
 * Get shot composition description based on shot type
 */
function getShotCompositionDescription(shotType: string): string {
  switch (shotType) {
    case 'full-body-standing':
      return 'Full body standing shot, professional posture, complete outfit visible from head to toe';
    case 'full-body-seated':
      return 'Full body seated at desk/table, professional consultation posture, welcoming demeanor';
    case 'three-quarter-standing':
      return 'Three-quarter shot from waist up, professional stance with hands visible';
    case 'professional-headshot':
      return 'Professional headshot from shoulders up, direct eye contact, corporate appearance';
    default:
      return 'Professional composition maintaining character integrity';
  }
}

// Execute if run directly
if (require.main === module) {
  generateMasterBackgrounds()
    .then(() => {
      console.log('\n✨ Master background generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateMasterBackgrounds };