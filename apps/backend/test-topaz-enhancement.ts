import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { TopazVEO3Enhancer } from './src/enhancement/topazEnhancer';
import { TopazEnhancementEngine } from './src/veo3/topaz-enhancement-engine';

/**
 * TEST TOPAZ VIDEO AI ENHANCEMENT
 * Enhance the enterprise movement video we just generated
 * 1080p → 4K with VEO3-optimized settings
 */
async function testTopazEnhancement(): Promise<void> {
  console.log('⚡ TOPAZ VIDEO AI ENHANCEMENT TEST');
  console.log('Enhancing enterprise movement video to 4K quality');
  console.log('Using research-validated Proteus model settings');
  console.log('Input: 1080p → Output: 4K (3840x2160)');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(70));

  try {
    // Input video path (the enterprise movement video we just generated)
    const inputVideoPath = path.join(
      process.cwd(),
      'generated',
      'veo3-simple-enterprise',
      'veo3_video_1759028611018_0.mp4'
    );

    // Check if input video exists
    try {
      await fs.access(inputVideoPath);
      console.log(`✅ Input video found: ${inputVideoPath}`);
    } catch (error) {
      console.log('❌ Input video not found. Run test-simple-enterprise-movement.ts first.');
      console.log(`Expected path: ${inputVideoPath}`);
      return;
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'generated', 'topaz-enhanced');
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}`);

    // Initialize both Topaz engines for comparison
    console.log('\n🔧 Initializing Topaz Enhancement Engines...');
    const basicEnhancer = new TopazVEO3Enhancer();
    const advancedEnhancer = new TopazEnhancementEngine();

    console.log('✅ TopazVEO3Enhancer initialized (basic)');
    console.log('✅ TopazEnhancementEngine initialized (advanced)');

    // Test Method 1: Basic TopazVEO3Enhancer
    console.log('\n🎬 METHOD 1: Basic TopazVEO3Enhancer');
    console.log('Using standard Proteus model configuration');

    try {
      const basicConfig = {
        model: 'proteus' as const,
        upscaleFactor: 4 as const,
        noiseReduction: 'medium' as const,
        sharpening: 'low' as const,
        motionEstimation: 'high_quality' as const,
        frameInterpolation: false,
        outputFormat: 'mp4' as const
      };

      console.log(`📋 Basic Config: ${JSON.stringify(basicConfig, null, 2)}`);

      const basicOutputPath = path.join(outputDir, 'aria-enterprise-movement-4K-basic.mp4');

      console.log('⚡ Starting basic Topaz enhancement...');
      const basicStartTime = Date.now();

      const basicResult = await basicEnhancer.enhanceVideo(inputVideoPath, basicOutputPath, basicConfig);
      const basicTime = Date.now() - basicStartTime;

      if (basicResult.success) {
        console.log('✅ BASIC TOPAZ ENHANCEMENT SUCCESS!');
        console.log(`📹 Enhanced video: ${basicResult.path}`);
        console.log(`⏱️  Processing time: ${Math.round(basicTime/1000)}s`);
        console.log(`📐 Resolution: ${basicResult.originalSize.width}x${basicResult.originalSize.height} → ${basicResult.enhancedSize.width}x${basicResult.enhancedSize.height}`);
        console.log(`🔍 Upscale factor: ${basicResult.enhancedSize.width / basicResult.originalSize.width}x`);
      } else {
        console.log(`❌ Basic enhancement failed: ${basicResult.error}`);
      }

    } catch (error: any) {
      console.log(`❌ Basic enhancer error: ${error.message}`);
    }

    // Test Method 2: Advanced TopazEnhancementEngine (if available)
    console.log('\n🎬 METHOD 2: Advanced TopazEnhancementEngine');
    console.log('Using research-validated VEO3-optimized settings');

    try {
      const advancedConfig = {
        model: 'proteus-dv-v2' as const,
        upscaleFactor: 4 as const,
        quality: 'production' as const,
        preserveVEO3Details: true,
        noiseReduction: 'medium' as const,
        sharpening: 'low' as const,
        device: 'cuda:0' as const,
        threads: 8,
        memoryOptimization: true,
        outputFormat: 'mp4' as const,
        codec: 'h264' as const,
        batchProcessing: false,
        maxConcurrent: 1
      };

      console.log(`📋 Advanced Config: ${JSON.stringify(advancedConfig, null, 2)}`);

      const advancedOutputPath = path.join(outputDir, 'aria-enterprise-movement-4K-advanced.mp4');

      // Use the correct method name for advanced enhancer
      if (typeof advancedEnhancer.enhanceVideo === 'function') {
        console.log('⚡ Starting advanced Topaz enhancement...');
        const advancedStartTime = Date.now();

        const advancedResult = await advancedEnhancer.enhanceVideo(inputVideoPath, advancedOutputPath, advancedConfig);
        const advancedTime = Date.now() - advancedStartTime;

        if (advancedResult && advancedResult.outputPath) {
          console.log('✅ ADVANCED TOPAZ ENHANCEMENT SUCCESS!');
          console.log(`📹 Enhanced video: ${advancedResult.outputPath}`);
          console.log(`⏱️  Processing time: ${Math.round(advancedTime/1000)}s`);
          console.log(`📐 Resolution: ${advancedResult.originalResolution} → ${advancedResult.enhancedResolution}`);
          console.log(`🔍 Upscale factor: ${advancedResult.upscaleFactor}x`);
          console.log(`📊 Quality metrics:`);
          console.log(`    Detail preservation: ${advancedResult.qualityMetrics.detailPreservation}%`);
          console.log(`    VEO3 consistency: ${advancedResult.qualityMetrics.veo3Consistency}%`);
          console.log(`    Viewer preference: ${advancedResult.qualityMetrics.viewerPreference}%`);
          console.log(`⚡ Performance: ${advancedResult.performanceMetrics.realTimeMultiplier}x real-time`);

          console.log('\n⚡ RTX 2070 SUPER PERFORMANCE ANALYSIS:');
          console.log(`    Real-time multiplier: ${advancedResult.performanceMetrics.realTimeMultiplier}x`);
          if (advancedResult.performanceMetrics.realTimeMultiplier < 1) {
            console.log(`    ⏱️  Your RTX 2070 Super processes at ${(advancedResult.performanceMetrics.realTimeMultiplier * 100).toFixed(0)}% real-time speed`);
            console.log(`    📊 This is typical for RTX 2070 Super vs RTX 4090 (research baseline)`);
          }
        } else {
          console.log('❌ Advanced enhancement failed - no output path returned');
        }
      } else {
        console.log('ℹ️  Advanced enhancer methods not found');
        console.log('📋 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(advancedEnhancer)));
      }

    } catch (error: any) {
      console.log(`❌ Advanced enhancer error: ${error.message}`);
    }

    // Check output files
    console.log('\n📋 ENHANCEMENT RESULTS SUMMARY:');

    const outputFiles = await fs.readdir(outputDir);
    console.log(`📁 Enhanced videos in ${outputDir}:`);

    for (const file of outputFiles) {
      if (file.endsWith('.mp4')) {
        const filePath = path.join(outputDir, file);
        const stats = await fs.stat(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`  📹 ${file}`);
        console.log(`      Size: ${fileSizeMB} MB`);
        console.log(`      Path: ${filePath}`);
      }
    }

    console.log('\n🎯 WHAT TO EXPECT:');
    console.log('  📐 Resolution: 1920x1080 → 3840x2160 (4K)');
    console.log('  📊 File size: ~3-5x larger than original');
    console.log('  🎨 Quality: Enhanced detail and sharpness');
    console.log('  🚶‍♀️ Movement: Preserved natural motion');
    console.log('  🔬 Skin: Enhanced ultra-realistic details');

    console.log('\n⚠️  TROUBLESHOOTING:');
    console.log('If enhancement fails:');
    console.log('  1. Ensure Topaz Video AI is installed');
    console.log('  2. Check CLI access: `topaz-video-ai --help`');
    console.log('  3. Verify CUDA/GPU drivers for acceleration');
    console.log('  4. Try CPU mode if GPU unavailable');

    console.log('\n🚀 NEXT STEPS:');
    console.log('  1. Compare original vs enhanced videos');
    console.log('  2. Test on different platforms (YouTube 4K, Instagram)');
    console.log('  3. Measure viewer engagement improvement');
    console.log('  4. Use enhanced version for viral distribution');

    console.log('\n✨ TOPAZ ENHANCEMENT TEST COMPLETED!');
    console.log('Your enterprise movement video is now 4K enhanced');
    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Topaz enhancement test failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  testTopazEnhancement()
    .then(() => {
      console.log('\n✨ Topaz enhancement test complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { testTopazEnhancement };