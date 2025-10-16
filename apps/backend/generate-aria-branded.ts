import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client for NanoBanana
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

interface BrandedImageConfig {
  name: string;
  sourceImagePath: string;
  logoPlacement: 'shirt' | 'wall' | 'both';
  aspectRatio: '16:9' | '9:16';
  platform: string;
  description: string;
  navyBlueBackground: boolean;
  backgroundType: string;
}

interface BrandedImageResult {
  config: BrandedImageConfig;
  success: boolean;
  imagePath?: string;
  error?: string;
  prompt: string;
}

/**
 * Generate Aria Images with QuoteMoto Logo Branding
 * Uses ZHO Technique #37 for professional logo integration
 * Adds logos to shirts and office backgrounds
 */
async function generateAriaBranded(): Promise<void> {
  console.log('🎬 ARIA BRANDED IMAGE GENERATION');
  console.log('Adding QuoteMoto logo to character images using ZHO Technique #37');
  console.log('Professional branding on shirts and office backgrounds');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Verify logo file exists
    const logoPath = path.join(process.cwd(), 'logo', 'quotemoto-white-logo.png');
    await fs.access(logoPath);
    console.log(`📋 Using logo: ${logoPath}`);

    // Find existing background images
    const backgroundDir = await findLatestBackgroundImages();
    console.log(`📁 Using background images from: ${backgroundDir}`);

    const imageFiles = await fs.readdir(backgroundDir);
    const availableImages = imageFiles.filter(f => f.endsWith('.png'));
    console.log(`📸 Available background images: ${availableImages.length}`);

    // Define branded configurations
    const brandedConfigs: BrandedImageConfig[] = [];

    // Add branded versions of existing images
    for (const imageFile of availableImages) {
      const imagePath = path.join(backgroundDir, imageFile);

      if (imageFile.includes('car-interior')) {
        brandedConfigs.push({
          name: 'car-interior-branded-shirt',
          sourceImagePath: imagePath,
          logoPlacement: 'shirt',
          aspectRatio: '9:16',
          platform: 'TikTok/Instagram Reels',
          description: 'Car interior with QuoteMoto logo on polo shirt',
          navyBlueBackground: false,
          backgroundType: 'Car interior'
        });
      }

      if (imageFile.includes('home-office')) {
        brandedConfigs.push({
          name: 'home-office-branded-both',
          sourceImagePath: imagePath,
          logoPlacement: 'both',
          aspectRatio: '9:16',
          platform: 'Instagram Feed',
          description: 'Home office with logo on shirt and wall',
          navyBlueBackground: true,
          backgroundType: 'Home office'
        });
      }

      if (imageFile.includes('outdoor-professional')) {
        brandedConfigs.push({
          name: 'outdoor-professional-branded-shirt',
          sourceImagePath: imagePath,
          logoPlacement: 'shirt',
          aspectRatio: '16:9',
          platform: 'LinkedIn/Corporate',
          description: 'Outdoor professional with logo on blazer',
          navyBlueBackground: false,
          backgroundType: 'Urban outdoor'
        });
      }
    }

    if (brandedConfigs.length === 0) {
      throw new Error('No background images found to brand. Run generate-aria-backgrounds.ts first.');
    }

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'character-branded', 'aria', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: BrandedImageResult[] = [];

    // Generate each branded image
    for (let i = 0; i < brandedConfigs.length; i++) {
      const config = brandedConfigs[i];
      console.log(`\n🎨 Branded Image ${i + 1}/${brandedConfigs.length}: ${config.name}`);
      console.log(`📱 Platform: ${config.platform}`);
      console.log(`📐 Aspect ratio: ${config.aspectRatio}`);
      console.log(`🏢 Background: ${config.backgroundType}`);
      console.log(`📋 Logo placement: ${config.logoPlacement}`);

      try {
        // Read source image as base64
        const sourceImageData = await fs.readFile(config.sourceImagePath);
        const sourceImageBase64 = sourceImageData.toString('base64');

        // Read logo as base64
        const logoImageData = await fs.readFile(logoPath);
        const logoImageBase64 = logoImageData.toString('base64');

        // Create enhanced prompt using ZHO technique #37
        const brandingPrompt = createBrandingPrompt(config);
        console.log(`📝 Applying ZHO technique #37 for logo integration...`);

        const startTime = Date.now();

        // Generate image using NanoBanana with two images
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: [{
            role: "user",
            parts: [
              {
                text: brandingPrompt
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: sourceImageBase64
                }
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: logoImageBase64
                }
              }
            ]
          }]
        });

        const generationTime = Date.now() - startTime;

        let generatedImageData = null;
        let textResponse = '';

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

        // Save branded image
        if (generatedImageData?.data) {
          const imagePath = path.join(
            outputDir,
            `aria-${config.name}-${timestamp}.png`
          );

          const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
          await fs.writeFile(imagePath, imageBuffer);

          console.log(`✅ ${config.name} saved: ${imagePath}`);

          // Get file size
          const stats = await fs.stat(imagePath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`📊 Size: ${fileSizeMB} MB`);
          console.log(`⏱️  Generation time: ${Math.round(generationTime/1000)}s`);
          console.log(`💰 Cost: $0.02`);

          results.push({
            config,
            success: true,
            imagePath,
            prompt: brandingPrompt
          });

        } else {
          console.log(`❌ ${config.name} failed: No image data`);
          results.push({
            config,
            success: false,
            error: 'No image data returned',
            prompt: brandingPrompt
          });
        }

        // Brief pause between generations
        if (i < brandedConfigs.length - 1) {
          console.log('⏱️  Waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error: any) {
        console.log(`❌ ${config.name} failed:`, error.message);
        results.push({
          config,
          success: false,
          error: error.message,
          prompt: ''
        });
      }
    }

    // Save comprehensive metadata
    const metadata = {
      generated: timestamp,
      totalImages: results.length,
      successfulImages: results.filter(r => r.success).length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      purpose: 'Add QuoteMoto logo branding to Aria character images',
      technique: 'ZHO Technique #37: Professional logo integration using two-image method',
      logoFile: logoPath,
      brandingPlacements: {
        shirt: results.filter(r => r.config.logoPlacement.includes('shirt')).length,
        wall: results.filter(r => r.config.logoPlacement.includes('wall')).length,
        both: results.filter(r => r.config.logoPlacement === 'both').length
      },
      results,
      totalCost: `$${(results.filter(r => r.success).length * 0.02).toFixed(2)}`,
      nextSteps: [
        'Test VEO3 video generation with branded images',
        'Verify logo visibility and quality',
        'Generate complete branded video set',
        'Compare with non-branded versions'
      ]
    };

    await fs.writeFile(
      path.join(outputDir, `aria-branded-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    // Create usage guide
    const usageGuide = `
ARIA BRANDED IMAGES WITH QUOTEMOTO LOGO
Generated: ${timestamp}

🎯 PURPOSE:
Add QuoteMoto branding to character images for professional marketing videos

🧪 TECHNIQUE USED:
ZHO Technique #37: Two-image logo integration
- Image 1: Base character image
- Image 2: QuoteMoto logo (PNG)
- Prompt: Professional logo placement on clothing and backgrounds

📋 LOGO INTEGRATIONS:
${results.map((r, i) => `${i + 1}. ${r.config.name} - ${r.config.logoPlacement} placement - ${r.success ? '✅ SUCCESS' : '❌ FAILED'}`).join('\\n')}

🎨 BRANDING DETAILS:
• Logo File: quotemoto-white-logo.png
• Colors: White outlines + Orange "Moto" text
• Placements: Polo shirts, office walls, branded materials
• Navy blue backgrounds for logo visibility

📱 PLATFORM OPTIMIZATION:
• TikTok/Reels: Logo on shirt in car interior
• Instagram: Logo on shirt and wall in home office
• LinkedIn: Logo on blazer in outdoor professional setting

🚀 IMPROVEMENTS:
✅ Professional QuoteMoto branding
✅ Logo visibility on navy backgrounds
✅ Corporate identity consistency
✅ Platform-appropriate placements
✅ VEO3-ready branded images

🎬 VEO3 INTEGRATION:
Use these branded images as firstFrame for videos:
- No additional branding prompts needed
- Natural logo integration in videos
- Professional corporate appearance

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(outputDir, `branded-usage-guide-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n\n🎉 ARIA BRANDED IMAGE GENERATION COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`📸 Branded images generated: ${results.filter(r => r.success).length}/${results.length}`);
    console.log(`💰 Total cost: $${(results.filter(r => r.success).length * 0.02).toFixed(2)}`);

    console.log('\n📋 BRANDING SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.config.name} (${result.config.logoPlacement} placement)`);
    });

    console.log('\n🚀 READY FOR:');
    console.log('  ✅ Professional QuoteMoto video content');
    console.log('  ✅ Corporate brand consistency');
    console.log('  ✅ VEO3 video generation with branding');
    console.log('  ✅ Multi-platform branded marketing');

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Aria branded image generation failed:', error.message);
    throw error;
  }
}

/**
 * Find the latest background images directory
 */
async function findLatestBackgroundImages(): Promise<string> {
  const backgroundRoot = path.join(process.cwd(), 'generated', 'character-backgrounds', 'aria');

  try {
    const directories = await fs.readdir(backgroundRoot);
    const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

    if (timestampDirs.length === 0) {
      throw new Error('No background images found. Run generate-aria-backgrounds.ts first.');
    }

    // Sort by timestamp (latest first)
    timestampDirs.sort().reverse();
    const latestDir = path.join(backgroundRoot, timestampDirs[0]);

    return latestDir;
  } catch (error) {
    throw new Error(`Background images not found: ${error}`);
  }
}

/**
 * Create branding prompt using ZHO technique #37
 */
function createBrandingPrompt(config: BrandedImageConfig): string {
  let logoPlacementInstructions = '';

  switch (config.logoPlacement) {
    case 'shirt':
      logoPlacementInstructions = `
LOGO PLACEMENT ON CLOTHING:
Put the QuoteMoto logo from image 2 professionally embroidered on the left chest of Aria's navy blue blazer/polo shirt.
- Logo should be clearly visible and properly sized
- White outlines and orange "Moto" text must be visible
- Professional embroidered appearance
- Corporate branding quality`;
      break;

    case 'wall':
      logoPlacementInstructions = `
LOGO PLACEMENT ON OFFICE WALL:
Put the QuoteMoto logo from image 2 on the office wall behind Aria as professional corporate signage.
- Logo mounted on ${config.navyBlueBackground ? 'navy blue background panel' : 'professional wall mount'}
- Clear visibility and appropriate size
- Corporate office branding quality
- Professional business environment`;
      break;

    case 'both':
      logoPlacementInstructions = `
DUAL LOGO PLACEMENT:
Put the QuoteMoto logo from image 2 in both locations:
1. Embroidered on Aria's left chest (navy blazer/polo)
2. Corporate signage on office wall behind her
- Both placements should be professional and clearly visible
- Maintain brand consistency across both locations
- Corporate quality branding`;
      break;
  }

  return `Professional QuoteMoto insurance expert Aria with corporate branding integration.

ZHO TECHNIQUE #37 APPLICATION:
Put the QuoteMoto logo from image 2 professionally integrated into image 1.

${logoPlacementInstructions}

CHARACTER CONSISTENCY (PRESERVE EXACTLY):
- Maintain Aria's exact facial features and professional identity
- Keep amber-brown eyes and confident expression
- Preserve warm professional demeanor
- Professional insurance expert appearance

BACKGROUND INTEGRATION:
${config.backgroundType} environment already established in image 1
- Maintain existing professional lighting
- Preserve natural shadows and atmosphere
- No background changes needed

LOGO VISIBILITY REQUIREMENTS:
- QuoteMoto logo clearly visible and readable
- Orange "Moto" text stands out against navy blue
- White outline text visible and crisp
- Professional embroidered/mounted appearance
- Corporate branding quality

PLATFORM OPTIMIZATION:
- Aspect ratio: ${config.aspectRatio}
- Optimized for: ${config.platform}
- Professional marketing quality

TECHNICAL REQUIREMENTS:
- Ultra-photorealistic integration
- Natural lighting on logo placement
- Professional embroidery/signage appearance
- Sharp, clear logo details
- Corporate branding standards

AVOID: Blurry logos, poor integration, unrealistic placement, artificial lighting on logos, low-quality branding, amateur appearance

PURPOSE: Create professional branded character images for VEO3 video generation with QuoteMoto corporate identity.`;
}

// Execute if run directly
if (require.main === module) {
  generateAriaBranded()
    .then(() => {
      console.log('\n✨ Aria branded image generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAriaBranded };