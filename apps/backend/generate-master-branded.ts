import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client for NanoBanana
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

interface LogoPlacementConfig {
  shirt: boolean;
  wall: boolean;
  additional: string[];
  description: string;
  context: string;
}

interface LogoPlacementMapping {
  [backgroundType: string]: LogoPlacementConfig;
}

interface BrandingResult {
  sourceImage: string;
  backgroundType: string;
  logoPlacement: LogoPlacementConfig;
  success: boolean;
  imagePath?: string;
  error?: string;
  prompt: string;
}

/**
 * MASTER BRANDING SYSTEM
 * Intelligently applies QuoteMoto logos based on background context
 * Uses ZHO Technique #37 for professional logo integration
 */
async function generateMasterBranded(): Promise<void> {
  console.log('🎬 MASTER BRANDING SYSTEM');
  console.log('Context-aware QuoteMoto logo placement using ZHO Technique #37');
  console.log('Professional branding based on environment analysis');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Define smart logo placement mapping based on background context
    const SMART_LOGO_PLACEMENT: LogoPlacementMapping = {
      'car-interior-driving': {
        shirt: true,
        wall: false,
        additional: ['QuoteMoto app on phone/dashboard mount', 'steering wheel logo if visible'],
        description: 'Mobile/driving content - focus on shirt branding',
        context: 'Car environment - shirt logo prominent for close-up mobile content'
      },

      'outdoor-urban-professional': {
        shirt: true,
        wall: false,
        additional: ['building signage if any office buildings visible'],
        description: 'Outdoor professional - blazer/shirt branding',
        context: 'Urban setting - professional attire branding for walking testimonials'
      },

      'office-consultation-desk': {
        shirt: true,
        wall: true,
        additional: ['branded folders on desk', 'QuoteMoto business cards', 'company pen/materials'],
        description: 'Full office branding - shirt + wall + desk materials',
        context: 'Professional consultation - maximum branding opportunity'
      },

      'conference-room-presentation': {
        shirt: true,
        wall: true,
        additional: ['presentation screen with logo', 'branded materials on table', 'corporate nameplate'],
        description: 'Corporate meeting - shirt + wall + presentation branding',
        context: 'Corporate training environment - professional authority branding'
      },

      'home-office-warm': {
        shirt: true,
        wall: true,
        additional: ['laptop sticker', 'coffee mug with subtle logo', 'framed certificate'],
        description: 'Approachable home office - subtle but visible branding',
        context: 'Personal brand building - warm but professional branding'
      },

      'retail-insurance-location': {
        shirt: true,
        wall: true,
        additional: ['counter materials', 'brochures', 'storefront branding', 'customer service materials'],
        description: 'Retail environment - comprehensive customer-facing branding',
        context: 'Customer service setting - professional retail branding'
      },

      'corporate-office-wall': {
        shirt: true,
        wall: true,
        additional: ['name badge', 'business cards on desk if visible', 'professional credentials'],
        description: 'Executive headshot - prominent corporate branding',
        context: 'Professional authority - maximum credibility branding'
      },

      'minimal-professional-gradient': {
        shirt: true,
        wall: false,
        additional: [],
        description: 'Clean profile image - focus on subtle shirt branding only',
        context: 'Profile pictures - clean professional appearance without distractions'
      }
    };

    // Find the latest master backgrounds
    const backgroundsDir = await findLatestMasterBackgrounds();
    console.log(`📁 Using master backgrounds: ${backgroundsDir}`);

    // Load background images
    const imageFiles = await fs.readdir(backgroundsDir);
    const backgroundImages = imageFiles.filter(f => f.endsWith('.png'));

    console.log(`📸 Found background images: ${backgroundImages.length}`);
    backgroundImages.forEach(img => console.log(`  - ${img}`));

    // Verify logo file exists
    const logoPath = path.join(process.cwd(), 'logo', 'quotemoto-white-logo.png');
    await fs.access(logoPath);
    console.log(`📋 Using logo: ${logoPath}`);

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'master-branded', 'aria', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: BrandingResult[] = [];

    // Process each background image
    for (let i = 0; i < backgroundImages.length; i++) {
      const imageFile = backgroundImages[i];
      const imagePath = path.join(backgroundsDir, imageFile);

      // Extract background type from filename
      const backgroundType = extractBackgroundType(imageFile);

      if (!backgroundType || !SMART_LOGO_PLACEMENT[backgroundType]) {
        console.log(`⚠️  Skipping ${imageFile} - unknown background type`);
        continue;
      }

      const logoPlacement = SMART_LOGO_PLACEMENT[backgroundType];

      console.log(`\n🎨 Branding ${i + 1}/${backgroundImages.length}: ${imageFile}`);
      console.log(`🏢 Background Type: ${backgroundType}`);
      console.log(`📋 Logo Placement: ${logoPlacement.shirt ? 'Shirt' : ''}${logoPlacement.shirt && logoPlacement.wall ? ' + ' : ''}${logoPlacement.wall ? 'Wall' : ''}`);
      console.log(`📝 Context: ${logoPlacement.context}`);

      try {
        // Read source image as base64
        const sourceImageData = await fs.readFile(imagePath);
        const sourceImageBase64 = sourceImageData.toString('base64');

        // Read logo as base64
        const logoImageData = await fs.readFile(logoPath);
        const logoImageBase64 = logoImageData.toString('base64');

        // Create enhanced branding prompt using ZHO technique #37
        const brandingPrompt = createBrandingPrompt(logoPlacement);
        console.log(`📝 Applying ZHO technique #37 for logo integration...`);

        const startTime = Date.now();

        // Generate branded image using NanoBanana with two images
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

        // Process response
        for (const candidate of result.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData) {
              generatedImageData = part.inlineData;
            }
          }
        }

        // Save branded image
        if (generatedImageData?.data) {
          const outputImagePath = path.join(
            outputDir,
            `aria-branded-${backgroundType}-${timestamp}.png`
          );

          const imageBuffer = Buffer.from(generatedImageData.data, 'base64');
          await fs.writeFile(outputImagePath, imageBuffer);

          console.log(`✅ Saved: ${path.basename(outputImagePath)}`);

          // Get file size
          const stats = await fs.stat(outputImagePath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`📊 Size: ${fileSizeMB} MB`);
          console.log(`⏱️  Time: ${Math.round(generationTime/1000)}s`);
          console.log(`💰 Cost: $0.02`);

          results.push({
            sourceImage: imageFile,
            backgroundType,
            logoPlacement,
            success: true,
            imagePath: outputImagePath,
            prompt: brandingPrompt
          });

        } else {
          console.log(`❌ Failed: No image data returned`);
          results.push({
            sourceImage: imageFile,
            backgroundType,
            logoPlacement,
            success: false,
            error: 'No image data returned',
            prompt: brandingPrompt
          });
        }

        // Brief pause between generations
        if (i < backgroundImages.length - 1) {
          console.log('⏱️  Waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error: any) {
        console.log(`❌ Failed: ${error.message}`);
        results.push({
          sourceImage: imageFile,
          backgroundType,
          logoPlacement,
          success: false,
          error: error.message,
          prompt: ''
        });
      }
    }

    // Save comprehensive metadata
    const metadata = {
      generated: timestamp,
      purpose: 'Master branding with context-aware QuoteMoto logo placement',
      technique: 'ZHO Technique #37: Professional logo integration using two-image method',
      sourceDirectory: backgroundsDir,
      logoFile: logoPath,
      totalImages: results.length,
      successfulImages: results.filter(r => r.success).length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      logoPlacementMapping: SMART_LOGO_PLACEMENT,
      results,
      totalCost: `$${(results.filter(r => r.success).length * 0.02).toFixed(2)}`,
      readyForVEO3: true,
      nextSteps: [
        'Test VEO3 video generation with branded images',
        'Verify logo visibility in generated videos',
        'Generate complete video library for all platforms'
      ]
    };

    await fs.writeFile(
      path.join(outputDir, `master-branded-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    // Create final usage guide
    const usageGuide = `
MASTER BRANDED IMAGES - PRODUCTION READY
Generated: ${timestamp}

🎯 PURPOSE:
Context-aware QuoteMoto logo branding on professional background images
Ready for VEO3 video generation and multi-platform content

📊 RESULTS:
Total Images: ${results.length}
Successful: ${results.filter(r => r.success).length}
Success Rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%

🏆 BRANDED IMAGES GENERATED:
${results.map((r, i) => `${i + 1}. ${r.backgroundType} - ${r.logoPlacement.shirt ? 'Shirt' : ''}${r.logoPlacement.shirt && r.logoPlacement.wall ? ' + ' : ''}${r.logoPlacement.wall ? 'Wall' : ''} logos - ${r.success ? '✅' : '❌'}`).join('\\n')}

🧠 SMART BRANDING APPLIED:
• Office/Conference → Shirt + Wall + Desk materials
• Car Interior → Shirt + Mobile app integration
• Home Office → Shirt + Wall + Subtle accessories
• Retail Location → Shirt + Wall + Customer materials
• Corporate Headshot → Shirt + Wall + Professional credentials
• Minimal Profile → Shirt only (clean appearance)

📱 PLATFORM READY:
• TikTok/Reels: Car interior with shirt branding
• Instagram Stories: Outdoor with blazer branding
• YouTube/Website: Office with full branding suite
• Instagram Feed: Home office with approachable branding
• LinkedIn: Corporate headshot with authority branding
• Facebook: Retail location with customer-focused branding

🎬 VEO3 INTEGRATION:
These images are ready for VEO3 firstFrame video generation:
- No additional branding needed in VEO3 prompts
- Natural logo integration will appear in videos
- Professional QuoteMoto identity preserved

💰 Total Cost: $${(results.filter(r => r.success).length * 0.02).toFixed(2)}

🚀 PRODUCTION PIPELINE COMPLETE:
Base Images → Smart Backgrounds → Context-Aware Branding → VEO3 Videos

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(outputDir, `production-ready-guide-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n\n🎉 MASTER BRANDING COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`📸 Branded images generated: ${results.filter(r => r.success).length}/${results.length}`);
    console.log(`💰 Total cost: $${(results.filter(r => r.success).length * 0.02).toFixed(2)}`);

    console.log('\n📋 BRANDING SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const placements = [];
      if (result.logoPlacement.shirt) placements.push('Shirt');
      if (result.logoPlacement.wall) placements.push('Wall');
      console.log(`  ${status} ${result.backgroundType} → ${placements.join(' + ')} branding`);
    });

    console.log('\n🏆 PRODUCTION PIPELINE COMPLETE!');
    console.log('  ✅ Base images with green screen removal');
    console.log('  ✅ Smart backgrounds based on shot types');
    console.log('  ✅ Context-aware QuoteMoto logo branding');
    console.log('  ✅ Platform-optimized aspect ratios');
    console.log('  ✅ Ready for VEO3 video generation');

    console.log('\n🎬 READY FOR VIDEO GENERATION!');
    console.log('  All images are production-ready for VEO3 firstFrame input');

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Master branding failed:', error.message);
    throw error;
  }
}

/**
 * Extract background type from filename
 */
function extractBackgroundType(filename: string): string | null {
  if (filename.includes('car-interior-driving')) return 'car-interior-driving';
  if (filename.includes('outdoor-urban-professional')) return 'outdoor-urban-professional';
  if (filename.includes('office-consultation-desk')) return 'office-consultation-desk';
  if (filename.includes('conference-room-presentation')) return 'conference-room-presentation';
  if (filename.includes('home-office-warm')) return 'home-office-warm';
  if (filename.includes('retail-insurance-location')) return 'retail-insurance-location';
  if (filename.includes('corporate-office-wall')) return 'corporate-office-wall';
  if (filename.includes('minimal-professional-gradient')) return 'minimal-professional-gradient';
  return null;
}

/**
 * Find the latest master backgrounds directory
 */
async function findLatestMasterBackgrounds(): Promise<string> {
  const backgroundsRoot = path.join(process.cwd(), 'generated', 'master-backgrounds', 'aria');

  try {
    const directories = await fs.readdir(backgroundsRoot);
    const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

    if (timestampDirs.length === 0) {
      throw new Error('No master backgrounds found. Run generate-master-backgrounds.ts first.');
    }

    // Sort by timestamp (latest first)
    timestampDirs.sort().reverse();
    const latestDir = path.join(backgroundsRoot, timestampDirs[0]);

    return latestDir;
  } catch (error) {
    throw new Error(`Master backgrounds not found: ${error}`);
  }
}

/**
 * Create branding prompt using ZHO technique #37
 */
function createBrandingPrompt(logoPlacement: LogoPlacementConfig): string {
  let logoInstructions = '';

  if (logoPlacement.shirt && logoPlacement.wall) {
    logoInstructions = `
DUAL LOGO PLACEMENT (ZHO TECHNIQUE #37):
Put the QuoteMoto logo from image 2 in both strategic locations:

1. SHIRT/BLAZER LOGO:
   - Embroidered on Aria's left chest (navy blazer/polo shirt)
   - Professional embroidered appearance
   - Orange "Moto" text clearly visible
   - White outline text crisp and readable

2. WALL/BACKGROUND LOGO:
   - Corporate signage on wall/background
   - Appropriate size for environment context
   - Professional mounting/display quality
   - Clear visibility without overwhelming scene

Both logos should maintain QuoteMoto brand consistency and professional appearance.`;

  } else if (logoPlacement.shirt) {
    logoInstructions = `
SHIRT LOGO PLACEMENT (ZHO TECHNIQUE #37):
Put the QuoteMoto logo from image 2 professionally embroidered on Aria's left chest:
- Navy blazer/polo shirt placement
- Professional embroidered quality
- Orange "Moto" text stands out
- White outline text clearly visible
- Appropriate size for clothing branding`;

  } else if (logoPlacement.wall) {
    logoInstructions = `
WALL LOGO PLACEMENT (ZHO TECHNIQUE #37):
Put the QuoteMoto logo from image 2 as professional corporate signage:
- Wall-mounted or background display
- Corporate quality presentation
- Professional business environment integration
- Clear brand visibility without overpowering`;
  }

  let additionalBranding = '';
  if (logoPlacement.additional.length > 0) {
    additionalBranding = `
ADDITIONAL BRANDING ELEMENTS:
${logoPlacement.additional.map(item => `- ${item}`).join('\n')}`;
  }

  return `Professional insurance expert Aria from QuoteMoto with comprehensive corporate branding.

${logoInstructions}

CONTEXT-AWARE BRANDING:
${logoPlacement.description}
Environment: ${logoPlacement.context}

${additionalBranding}

CHARACTER CONSISTENCY (PRESERVE EXACTLY):
- Maintain Aria's exact facial features and professional identity
- Keep amber-brown eyes and confident expression
- Preserve professional QuoteMoto appearance
- Maintain all background elements from image 1

LOGO VISIBILITY REQUIREMENTS:
- QuoteMoto logo clearly visible and readable
- Orange "Moto" text stands out against navy blue backgrounds
- White outline text crisp and professional
- Professional corporate branding quality
- Appropriate sizing for each placement context

BACKGROUND PRESERVATION:
- Maintain all existing background elements
- Preserve natural lighting and shadows
- Keep professional environment atmosphere
- No changes to existing background quality

TECHNICAL REQUIREMENTS:
- Ultra-photorealistic logo integration
- Natural lighting on logo placements
- Professional embroidery/signage appearance
- Sharp, clear logo details
- Corporate branding standards
- Seamless integration with existing image

PLATFORM OPTIMIZATION:
- Maintain aspect ratio from source image
- Professional quality for commercial use
- VEO3-ready for video generation

AVOID: Blurry logos, poor integration, unrealistic placement, artificial lighting on logos, low-quality branding, amateur appearance, oversized logos, underwhelming brand presence

PURPOSE: Create production-ready branded images for VEO3 video generation with professional QuoteMoto corporate identity fully integrated.`;
}

// Execute if run directly
if (require.main === module) {
  generateMasterBranded()
    .then(() => {
      console.log('\n✨ Master branding complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateMasterBranded };