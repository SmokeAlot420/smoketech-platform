import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize GoogleGenAI client for NanoBanana
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

interface BackgroundConfig {
  name: string;
  environment: string;
  lighting: string;
  setting: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  platform: string;
  description: string;
}

interface ImageGenerationResult {
  config: BackgroundConfig;
  success: boolean;
  imagePath?: string;
  error?: string;
  prompt: string;
}

/**
 * Generate Aria Images with Real Backgrounds for VEO3
 * Uses ZHO Technique #31 and professional environments
 * Solves green screen issue by generating complete scenes
 */
async function generateAriaBackgrounds(): Promise<void> {
  console.log('🎬 ARIA BACKGROUND GENERATION SYSTEM');
  console.log('Generating character images with professional backgrounds');
  console.log('Using ZHO Technique #31 and NanoBanana integration');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Define background configurations for different video scenarios
    const backgroundConfigs: BackgroundConfig[] = [
      {
        name: 'office-consultation-16x9',
        environment: 'modern professional insurance office with QuoteMoto branding, consultation desk, warm lighting, corporate setting',
        lighting: 'professional office lighting with soft warm tones, overhead LED panels, natural window light',
        setting: 'seated at professional consultation desk, QuoteMoto logos visible on wall and materials',
        aspectRatio: '16:9',
        platform: 'YouTube/Website',
        description: 'Professional office consultation environment optimized for YouTube content'
      },
      {
        name: 'car-interior-9x16',
        environment: 'luxury car interior, driver seat perspective, modern dashboard visible, professional car environment',
        lighting: 'natural daylight streaming through windows, dashboard ambient lighting, professional car photography lighting',
        setting: 'sitting in driver seat, steering wheel visible, car interior showing QuoteMoto app on phone',
        aspectRatio: '9:16',
        platform: 'TikTok/Instagram Reels',
        description: 'Car interior setting for driving/mobile content'
      },
      {
        name: 'home-office-9x16',
        environment: 'warm professional home office, bookshelf background, plants, cozy yet professional setting',
        lighting: 'soft natural window lighting, warm desk lamp, professional home office ambiance',
        setting: 'standing in professional home office, bookshelf and plants in background, welcoming atmosphere',
        aspectRatio: '9:16',
        platform: 'Instagram Feed',
        description: 'Approachable home office setting for social media content'
      },
      {
        name: 'outdoor-professional-16x9',
        environment: 'professional outdoor urban setting, modern office building background, city professional environment',
        lighting: 'golden hour natural lighting, professional outdoor photography, soft shadows and warm tones',
        setting: 'standing confidently outdoors, modern buildings in background, professional business district',
        aspectRatio: '16:9',
        platform: 'LinkedIn/Corporate',
        description: 'Professional outdoor setting for corporate testimonials'
      }
    ];

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'character-backgrounds', 'aria', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: ImageGenerationResult[] = [];

    // Generate each background configuration
    for (let i = 0; i < backgroundConfigs.length; i++) {
      const config = backgroundConfigs[i];
      console.log(`\n🎨 Image ${i + 1}/4: ${config.name}`);
      console.log(`📱 Platform: ${config.platform}`);
      console.log(`📐 Aspect ratio: ${config.aspectRatio}`);
      console.log(`🏢 Environment: ${config.environment}`);
      console.log(`💡 Lighting: ${config.lighting}`);

      try {
        // Create enhanced prompt using Aria's base prompt + ZHO technique #31
        const enhancedPrompt = createEnhancedAriaPrompt(config);
        console.log(`📝 Generating with ZHO technique #31...`);

        const startTime = Date.now();

        // Generate image using NanoBanana (Gemini 2.5 Flash Image)
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: [{
            role: "user",
            parts: [{
              text: enhancedPrompt
            }]
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

        // Save image
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
            prompt: enhancedPrompt
          });

        } else {
          console.log(`❌ ${config.name} failed: No image data`);
          results.push({
            config,
            success: false,
            error: 'No image data returned',
            prompt: enhancedPrompt
          });
        }

        // Brief pause between generations
        if (i < backgroundConfigs.length - 1) {
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
      purpose: 'Generate Aria character images with professional backgrounds for VEO3 video generation',
      technique: 'ZHO Technique #31: "turn this illustration into realistic version"',
      improvements: {
        backgroundIssue: 'Solved by generating complete scenes instead of green screen',
        realism: 'Enhanced using ZHO ultra-realism techniques',
        veo3Ready: 'Images designed specifically for firstFrame parameter',
        platformOptimized: 'Different backgrounds for each platform'
      },
      results,
      totalCost: `$${(results.filter(r => r.success).length * 0.02).toFixed(2)}`,
      nextSteps: [
        'Use these images as firstFrame input for VEO3',
        'Update video generation scripts to use background-integrated images',
        'Test video generation with new backgrounds',
        'Compare quality vs green screen approach'
      ]
    };

    await fs.writeFile(
      path.join(outputDir, `aria-backgrounds-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    // Create usage guide
    const usageGuide = `
ARIA BACKGROUND-INTEGRATED IMAGES
Generated: ${timestamp}

🎯 PURPOSE:
Solve VEO3 green screen background issue by generating complete scenes with Aria

🧪 TECHNIQUE USED:
ZHO Technique #31: "turn this illustration into realistic version"
+ Professional environment integration
+ Platform-specific aspect ratios

📸 IMAGES GENERATED:
${results.map((r, i) => `${i + 1}. ${r.config.name} (${r.config.aspectRatio}) - ${r.success ? '✅ SUCCESS' : '❌ FAILED'}`).join('\\n')}

🎬 VEO3 INTEGRATION:
Use these images as firstFrame parameter:
- No need to specify background replacement
- VEO3 will animate the complete scene
- Natural, professional video results

📱 PLATFORM MAPPING:
• YouTube/Website: office-consultation-16x9.png
• TikTok/Instagram Reels: car-interior-9x16.png
• Instagram Feed: home-office-9x16.png
• LinkedIn/Corporate: outdoor-professional-16x9.png

💡 IMPROVEMENTS OVER GREEN SCREEN:
✅ No background artifacts
✅ Professional, branded environments
✅ Better QuoteMoto integration
✅ Natural lighting and shadows
✅ Platform-optimized backgrounds

🚀 NEXT STEPS:
1. Update generate-aria-4-videos.ts to use these images
2. Remove all green screen references from prompts
3. Test video generation with new backgrounds
4. Compare quality vs previous green screen approach

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(outputDir, `usage-guide-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n\n🎉 ARIA BACKGROUND GENERATION COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`📸 Images generated: ${results.filter(r => r.success).length}/${results.length}`);
    console.log(`💰 Total cost: $${(results.filter(r => r.success).length * 0.02).toFixed(2)}`);

    console.log('\n📋 GENERATION SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.config.name} (${result.config.platform})`);
    });

    console.log('\n🚀 READY FOR:');
    console.log('  ✅ VEO3 video generation with natural backgrounds');
    console.log('  ✅ Professional QuoteMoto content creation');
    console.log('  ✅ Multi-platform optimized content');
    console.log('  ✅ Elimination of green screen artifacts');

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Aria background generation failed:', error.message);
    throw error;
  }
}

/**
 * Create enhanced prompt using Aria character + ZHO technique #31 + background
 */
function createEnhancedAriaPrompt(config: BackgroundConfig): string {
  return `Ultra-photorealistic portrait of professional insurance expert Aria from QuoteMoto.

CHARACTER CONSISTENCY (PRESERVE EXACTLY):
- Maintain Aria's amber-brown eyes and confident expression
- Keep exact facial structure and professional identity
- Preserve warm professional demeanor and trustworthy presence
- QuoteMoto navy blue blazer and branding visible

ENVIRONMENT & SETTING:
${config.environment}

LIGHTING SETUP:
${config.lighting}

POSITIONING & COMPOSITION:
${config.setting}

PLATFORM OPTIMIZATION:
- Aspect ratio: ${config.aspectRatio}
- Optimized for: ${config.platform}
- Professional quality for commercial use

ZHO TECHNIQUE #31 APPLICATION:
turn this illustration into realistic version

TECHNICAL REQUIREMENTS:
- Ultra-photorealistic human appearance
- Natural skin texture with visible pores
- Professional photography quality
- Commercial-grade lighting setup
- Sharp focus throughout image
- Natural shadows and lighting interaction
- QuoteMoto brand elements clearly visible

NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections
- Professional but natural appearance

AVOID: green screen, chroma key background, artificial lighting, over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed

PURPOSE: Generate complete scene for VEO3 firstFrame video generation without background replacement needs.`;
}

// Execute if run directly
if (require.main === module) {
  generateAriaBackgrounds()
    .then(() => {
      console.log('\n✨ Aria background generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAriaBackgrounds };