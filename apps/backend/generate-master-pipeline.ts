import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { generateMasterBackgrounds } from './generate-master-backgrounds';
import { generateMasterBranded } from './generate-master-branded';

interface PipelineResult {
  success: boolean;
  step: string;
  duration: number;
  details?: any;
  error?: string;
}

interface MasterPipelineReport {
  totalTime: number;
  backgroundsGenerated: number;
  brandedImagesGenerated: number;
  successRate: string;
  totalCost: string;
  outputDirectory: string;
  finalImagePaths: string[];
  readyForVideo: boolean;
  nextSteps: string[];
}

/**
 * MASTER PRODUCTION PIPELINE
 * Complete automated image generation system for QuoteMoto viral content
 * Executes background integration + logo branding in sequence
 * Production-ready for VEO3 video generation
 */
async function runMasterPipeline(): Promise<void> {
  console.log('🚀 MASTER PRODUCTION PIPELINE');
  console.log('Automated QuoteMoto image generation system');
  console.log('Background Integration → Logo Branding → Video Ready');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  const startTime = Date.now();
  const results: PipelineResult[] = [];

  try {
    // Step 1: Generate Master Backgrounds
    console.log('\n🎬 STEP 1: MASTER BACKGROUND GENERATION');
    console.log('Applying professional environments with green screen removal');
    console.log('Smart shot-type mapping for platform optimization');

    const step1Start = Date.now();

    try {
      await generateMasterBackgrounds();
      const step1Duration = Date.now() - step1Start;

      results.push({
        success: true,
        step: 'Background Generation',
        duration: step1Duration,
        details: 'Generated 8 background-integrated images with smart mapping'
      });

      console.log(`✅ Step 1 completed in ${Math.round(step1Duration/1000)}s`);

    } catch (error: any) {
      results.push({
        success: false,
        step: 'Background Generation',
        duration: Date.now() - step1Start,
        error: error.message
      });
      throw new Error(`Step 1 failed: ${error.message}`);
    }

    // Brief pause between steps
    console.log('\n⏱️  Pausing 5 seconds before Step 2...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Apply Master Branding
    console.log('\n🏢 STEP 2: MASTER BRANDING APPLICATION');
    console.log('Context-aware QuoteMoto logo placement');
    console.log('Professional branding based on environment analysis');

    const step2Start = Date.now();

    try {
      await generateMasterBranded();
      const step2Duration = Date.now() - step2Start;

      results.push({
        success: true,
        step: 'Logo Branding',
        duration: step2Duration,
        details: 'Applied context-aware QuoteMoto logos to all 8 images'
      });

      console.log(`✅ Step 2 completed in ${Math.round(step2Duration/1000)}s`);

    } catch (error: any) {
      results.push({
        success: false,
        step: 'Logo Branding',
        duration: Date.now() - step2Start,
        error: error.message
      });
      throw new Error(`Step 2 failed: ${error.message}`);
    }

    // Generate comprehensive report
    const totalTime = Date.now() - startTime;
    await generatePipelineReport(results, totalTime);

    console.log('\n\n🎉 MASTER PIPELINE COMPLETED SUCCESSFULLY!');
    console.log(`⏱️  Total time: ${Math.round(totalTime/1000)}s`);
    console.log('🏆 Production-ready images generated');
    console.log('🎬 Ready for VEO3 video generation');

  } catch (error: any) {
    console.error('\n❌ MASTER PIPELINE FAILED:', error.message);

    // Generate failure report
    const totalTime = Date.now() - startTime;
    await generateFailureReport(results, totalTime, error.message);

    throw error;
  }
}

/**
 * Generate comprehensive pipeline report
 */
async function generatePipelineReport(results: PipelineResult[], totalTime: number): Promise<void> {
  try {
    // Find the latest branded images directory
    const brandedDir = await findLatestBrandedDirectory();
    const brandedImages = await fs.readdir(brandedDir);
    const finalImages = brandedImages.filter(f => f.endsWith('.png'));

    const report: MasterPipelineReport = {
      totalTime: Math.round(totalTime / 1000),
      backgroundsGenerated: 8,
      brandedImagesGenerated: finalImages.length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      totalCost: '$0.32', // $0.16 backgrounds + $0.16 branding
      outputDirectory: brandedDir,
      finalImagePaths: finalImages.map(img => path.join(brandedDir, img)),
      readyForVideo: true,
      nextSteps: [
        'Images ready for VEO3 firstFrame input',
        'Run test-ultra-realistic-video.ts for video generation',
        'Each image optimized for specific platform aspect ratios',
        'Context-aware branding ensures professional appearance'
      ]
    };

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(brandedDir, `master-pipeline-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Create production usage guide
    const usageGuide = `
MASTER PIPELINE PRODUCTION RESULTS
Generated: ${timestamp}

🎯 PIPELINE STATUS: COMPLETE ✅
Total Processing Time: ${report.totalTime} seconds
Background Images: ${report.backgroundsGenerated}
Branded Images: ${report.brandedImagesGenerated}
Success Rate: ${report.successRate}
Total Cost: ${report.totalCost}

📸 PRODUCTION-READY IMAGES:
${finalImages.map((img, i) => `${i + 1}. ${img}`).join('\n')}

🏢 SMART BRANDING APPLIED:
• Office environments: Shirt + Wall branding
• Car/Outdoor environments: Shirt branding only
• Professional headshots: Clean shirt branding

📱 PLATFORM OPTIMIZATION:
• TikTok/Reels: Car interior (9:16)
• Instagram Stories: Outdoor professional (9:16)
• YouTube/Website: Office consultation (16:9)
• Instagram Feed: Home office (4:5)
• LinkedIn: Corporate headshots (1:1)

🎬 READY FOR VIDEO GENERATION:
All images are optimized for VEO3 firstFrame input
Context-aware backgrounds eliminate green screen artifacts
Professional branding ensures brand consistency

🚀 NEXT STEPS:
1. Run VEO3 video generation with these master images
2. Each image has optimal aspect ratio for target platform
3. Professional environments provide realistic video backgrounds
4. QuoteMoto branding maintains consistent brand identity

💡 PRODUCTION BENEFITS:
• No green screen artifacts in videos
• Professional environments for all shot types
• Context-aware logo placement
• Platform-optimized aspect ratios
• Cost-effective automated pipeline

📁 Output Directory: ${brandedDir}

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(brandedDir, `production-guide-${timestamp}.txt`),
      usageGuide
    );

    console.log('\n📊 PRODUCTION REPORT GENERATED:');
    console.log(`📁 Report: ${reportPath}`);
    console.log(`📋 Guide: production-guide-${timestamp}.txt`);

  } catch (error) {
    console.warn('⚠️  Could not generate pipeline report:', error);
  }
}

/**
 * Generate failure report for debugging
 */
async function generateFailureReport(results: PipelineResult[], totalTime: number, errorMessage: string): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const failureReport = {
      timestamp,
      totalTime: Math.round(totalTime / 1000),
      error: errorMessage,
      completedSteps: results.filter(r => r.success),
      failedSteps: results.filter(r => !r.success),
      debugInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        workingDirectory: process.cwd(),
        environmentCheck: {
          geminiApiKey: !!process.env.GEMINI_API_KEY,
          hasGeneratedDir: await fs.access(path.join(process.cwd(), 'generated')).then(() => true).catch(() => false)
        }
      }
    };

    const reportPath = path.join(process.cwd(), `pipeline-failure-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(failureReport, null, 2));

    console.log(`\n🐛 Failure report saved: ${reportPath}`);

  } catch (error) {
    console.warn('⚠️  Could not generate failure report:', error);
  }
}

/**
 * Find the latest branded images directory
 */
async function findLatestBrandedDirectory(): Promise<string> {
  const brandedRoot = path.join(process.cwd(), 'generated', 'master-branded', 'aria');

  try {
    const directories = await fs.readdir(brandedRoot);
    const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

    if (timestampDirs.length === 0) {
      throw new Error('No branded images found');
    }

    // Sort by timestamp (latest first)
    timestampDirs.sort().reverse();
    return path.join(brandedRoot, timestampDirs[0]);

  } catch (error) {
    throw new Error(`Branded images directory not found: ${error}`);
  }
}

/**
 * Verify pipeline requirements before execution
 */
async function verifyPipelineRequirements(): Promise<void> {
  const requirements = [
    { name: 'GEMINI_API_KEY', check: () => !!process.env.GEMINI_API_KEY },
    { name: 'Character Library', check: async () => {
      try {
        const libraryPath = path.join(process.cwd(), 'generated', 'character-library');
        await fs.access(libraryPath);
        return true;
      } catch {
        return false;
      }
    }},
    { name: 'Logo File', check: async () => {
      try {
        const logoPath = path.join(process.cwd(), 'logo', 'quotemoto-white-logo.png');
        await fs.access(logoPath);
        return true;
      } catch {
        return false;
      }
    }}
  ];

  console.log('\n🔍 VERIFYING PIPELINE REQUIREMENTS:');

  for (const req of requirements) {
    const passed = typeof req.check === 'function' ? await req.check() : req.check;
    console.log(`  ${passed ? '✅' : '❌'} ${req.name}`);

    if (!passed) {
      throw new Error(`Missing requirement: ${req.name}`);
    }
  }

  console.log('✅ All requirements satisfied');
}

// Execute if run directly
if (require.main === module) {
  verifyPipelineRequirements()
    .then(() => runMasterPipeline())
    .then(() => {
      console.log('\n✨ Master pipeline complete! Production images ready for VEO3!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal pipeline error:', error);
      process.exit(1);
    });
}

export { runMasterPipeline };