/**
 * Asset Animation Template
 *
 * Pattern: NanoBanana Asset → VEO3 Animation
 * Use Cases: Blueprint Demos, Product Visualization, Asset-First Workflows
 *
 * Examples from viral repo:
 * - generate-blueprint-takeoff-demo.ts
 *
 * Key Innovation:
 * - Generate clean asset with NanoBanana FIRST
 * - Animate with VEO3 using asset as firstFrame
 * - Calculations/overlays appear as SEPARATE UI elements
 * - Extremely slow deliberate animations for clarity
 */

import { BaseVideoTemplate, VideoConfig, VideoResult } from './BaseVideoTemplate';

export interface AssetConfig {
  assetPrompt: string; // Prompt for NanoBanana to generate the base asset
  assetType: string; // Description for logging (e.g., "blueprint", "product", "diagram")
  temperature?: number;
}

export interface AssetVideoConfig extends VideoConfig {
  asset: AssetConfig;
}

export class AssetAnimationTemplate extends BaseVideoTemplate {
  protected templateType = 'asset-animation';

  /**
   * Generate asset first, then animate with VEO3
   */
  async generateVideo(config: AssetVideoConfig): Promise<VideoResult> {
    try {
      console.log('📐 Asset Animation Template - Smart Two-Step Approach');
      console.log('================================================================================');
      console.log(`🎯 Step 1: Generate ${config.asset.assetType} with NanoBanana`);
      console.log(`🎯 Step 2: Animate with VEO3 (slower, clearer)\n`);

      if (config.scenarios.length !== 1) {
        throw new Error('Asset Animation Template works best with 1 scenario');
      }

      const scenario = config.scenarios[0];

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 1: Generate Clean Asset with NanoBanana
      // ═══════════════════════════════════════════════════════════════════════

      this.logProgress(config, 'asset', 10, `Generating ${config.asset.assetType} with NanoBanana...`);

      const assetResults = await this.nanoBanana.generateImage(
        config.asset.assetPrompt,
        {
          temperature: config.asset.temperature || 0.3,
          numImages: 1
        }
      );

      if (!assetResults || assetResults.length === 0) {
        throw new Error(`Failed to generate ${config.asset.assetType}`);
      }

      const assetImagePath = assetResults[0].imagePath;
      this.logProgress(config, 'asset', 30, `${config.asset.assetType} generated: ${assetImagePath}`);
      console.log(`✅ ${config.asset.assetType} image: ${assetImagePath}\n`);

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 2: Animate Asset with VEO3 - SLOWER, CLEARER
      // ═══════════════════════════════════════════════════════════════════════

      this.logProgress(config, 'animation', 40, 'Creating slow, clear animation with VEO3...');

      // Override to screen-recording presets for clean UI animation
      const enhancedConfig = {
        ...config,
        veo3Options: {
          ...config.veo3Options,
          cameraPreset: 'screen-recording' as const,
          lightingPreset: 'screen-illumination' as const
        }
      };

      const videoPath = await this.generateVideoSegment(
        enhancedConfig,
        scenario,
        assetImagePath, // Use asset as firstFrame
        40,
        50
      );

      this.logProgress(config, 'complete', 100, 'Asset animation complete');

      // ═══════════════════════════════════════════════════════════════════════
      // RESULT
      // ═══════════════════════════════════════════════════════════════════════

      const duration = config.veo3Options.duration || 8;
      const assetCost = 0.02; // NanoBanana cost
      const videoCost = duration * 0.75; // VEO3 cost
      const totalCost = assetCost + videoCost;

      const result: VideoResult = {
        success: true,
        videos: [
          {
            name: scenario.name,
            path: videoPath,
            scenario: scenario.mainPrompt
          }
        ],
        characterImage: assetImagePath, // Asset image (not character, but same concept)
        metadata: {
          templateType: this.templateType,
          totalCost: totalCost,
          duration: duration,
          format: config.veo3Options.aspectRatio || '9:16',
          videosGenerated: 1
        },
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 Asset Animation Complete - SMART TWO-STEP APPROACH!');
      console.log('================================================================================');
      console.log(`📐 Clean ${config.asset.assetType}: ${assetImagePath}`);
      console.log(`🎬 Professional Video: ${videoPath}`);
      console.log(`📱 Format: ${result.metadata.format}`);
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log(`💰 Total Cost: $${totalCost.toFixed(2)} (${config.asset.assetType} $${assetCost.toFixed(2)} + Video $${videoCost.toFixed(2)})`);
      console.log('\n🔥 Advanced Techniques Applied:');
      console.log(`   ✅ CLEAN ${config.asset.assetType} (generated separately)`);
      console.log('   ✅ UI elements as SEPARATE overlays');
      console.log('   ✅ EXTREMELY SLOW animations (perfect clarity)');
      console.log('   ✅ NanoBanana asset as VEO3 firstFrame');
      console.log('   ✅ Professional easing curves\n');

      return result;

    } catch (error) {
      return this.handleError(error);
    }
  }
}
