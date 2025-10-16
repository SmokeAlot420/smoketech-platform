/**
 * No Human Interface Template
 *
 * Pattern: Screen Recording / Software Demo (No Character)
 * Use Cases: Digital Takeoff, Software Tutorials, UI Demos
 *
 * Examples from viral repo:
 * - generate-digital-takeoff-tutorial.ts
 *
 * Key Features:
 * - No character generation
 * - Screen recording style
 * - Slow deliberate animations
 * - Perfect text clarity
 * - Professional UI aesthetics
 */

import { BaseVideoTemplate, VideoConfig, VideoResult } from './BaseVideoTemplate';

export class NoHumanInterfaceTemplate extends BaseVideoTemplate {
  protected templateType = 'no-human-interface';

  /**
   * Generate screen recording style video without human
   */
  async generateVideo(config: VideoConfig): Promise<VideoResult> {
    try {
      console.log('📐 No Human Interface Template - Starting Generation');
      console.log('================================================================================');
      console.log('🎯 Screen Recording Style: Software interface demonstration\n');

      if (config.scenarios.length !== 1) {
        throw new Error('No Human Interface Template works best with 1 scenario');
      }

      if (config.character) {
        console.warn('⚠️  Warning: Character config provided but will be ignored for no-human template');
      }

      const scenario = config.scenarios[0];

      // ═══════════════════════════════════════════════════════════════════════
      // STAGE 1: Video Generation (No character needed)
      // ═══════════════════════════════════════════════════════════════════════

      this.logProgress(config, 'video', 20, 'Generating screen recording...');

      // Override to screen-recording presets
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
        undefined, // No character
        20,
        70
      );

      this.logProgress(config, 'complete', 100, 'Screen recording complete');

      // ═══════════════════════════════════════════════════════════════════════
      // RESULT
      // ═══════════════════════════════════════════════════════════════════════

      const duration = config.veo3Options.duration || 8;
      const cost = this.calculateCost(false, 1, duration);

      const result: VideoResult = {
        success: true,
        videos: [
          {
            name: scenario.name,
            path: videoPath,
            scenario: scenario.mainPrompt
          }
        ],
        metadata: {
          templateType: this.templateType,
          totalCost: cost,
          duration: duration,
          format: config.veo3Options.aspectRatio || '9:16',
          videosGenerated: 1
        },
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 Screen Recording Complete!');
      console.log('================================================================================');
      console.log(`📁 Video: ${videoPath}`);
      console.log(`📱 Format: ${result.metadata.format}`);
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log(`💰 Cost: $${cost.toFixed(2)}`);
      console.log('\n✨ Advanced Techniques Applied:');
      console.log('   ✅ NO human present (pure interface)');
      console.log('   ✅ Screen recording perspective');
      console.log('   ✅ Slow deliberate animations');
      console.log('   ✅ Perfect text clarity');
      console.log('   ✅ Professional UI simulation\n');

      return result;

    } catch (error) {
      return this.handleError(error);
    }
  }
}
