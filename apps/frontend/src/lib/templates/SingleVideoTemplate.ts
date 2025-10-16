/**
 * Single Video Template
 *
 * Pattern: Character → Single Video
 * Use Cases: Painting SOP, Estimating Tutorial, Product Demo
 *
 * Examples from viral repo:
 * - generate-painting-sop.ts
 * - generate-estimating-tutorial.ts
 */

import { BaseVideoTemplate, VideoConfig, VideoResult } from './BaseVideoTemplate';

export class SingleVideoTemplate extends BaseVideoTemplate {
  protected templateType = 'single-video';

  /**
   * Generate single video with optional character
   */
  async generateVideo(config: VideoConfig): Promise<VideoResult> {
    try {
      console.log('🎬 Single Video Template - Starting Generation');
      console.log('================================================================================');

      if (config.scenarios.length !== 1) {
        throw new Error('Single Video Template requires exactly 1 scenario');
      }

      const scenario = config.scenarios[0];
      const hasCharacter = !!config.character;

      // ═══════════════════════════════════════════════════════════════════════
      // STAGE 1: Character Generation (if needed)
      // ═══════════════════════════════════════════════════════════════════════

      let characterPath: string | undefined;
      if (hasCharacter) {
        this.logProgress(config, 'character', 5, 'Generating character...');
        characterPath = await this.generateCharacter(config);
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STAGE 2: Video Generation with OMEGA WORKFLOW (12 engines)
      // ═══════════════════════════════════════════════════════════════════════

      this.logProgress(config, 'omega', 30, `🔥 Generating with Omega Workflow (12/12 engines)...`);

      const omegaCharacter = config.character ? {
        name: 'Aria' as const, // Default character, can be made configurable
        prompt: config.character.prompt
      } : undefined;

      const { videoPath, omegaMetrics } = await this.generateVideoWithOmega(
        config,
        scenario,
        omegaCharacter,
        30,
        60
      );

      this.logProgress(config, 'complete', 100, `✅ Complete! Viral Score: ${omegaMetrics?.viralScore || 0}/100`);

      // ═══════════════════════════════════════════════════════════════════════
      // RESULT
      // ═══════════════════════════════════════════════════════════════════════

      const duration = config.veo3Options.duration || 8;
      const cost = this.calculateCost(!!characterPath, 1, duration);

      const result: VideoResult = {
        success: true,
        videos: [
          {
            name: scenario.name,
            path: videoPath,
            scenario: scenario.mainPrompt
          }
        ],
        characterImage: characterPath,
        metadata: {
          templateType: this.templateType,
          totalCost: omegaMetrics?.cost || cost,
          duration: duration,
          format: config.veo3Options.aspectRatio || '9:16',
          videosGenerated: 1,

          // 🔥 OMEGA WORKFLOW METRICS
          viralScore: omegaMetrics?.viralScore,
          qualityScore: omegaMetrics?.qualityScore,
          enginesUsed: omegaMetrics?.enginesUsed,
          utilizationRate: omegaMetrics?.utilizationRate,
          techniquesApplied: omegaMetrics?.techniquesApplied
        },
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 Single Video Complete - OMEGA WORKFLOW!');
      console.log('================================================================================');
      console.log(`📁 Video: ${videoPath}`);
      if (characterPath) {
        console.log(`📸 Character: ${characterPath}`);
      }
      console.log(`📱 Format: ${result.metadata.format}`);
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log(`💰 Cost: $${(omegaMetrics?.cost || cost).toFixed(2)}`);

      if (omegaMetrics) {
        console.log('\n🔥 OMEGA WORKFLOW METRICS (12-Engine Orchestrator):');
        console.log(`   📊 Viral Score: ${omegaMetrics.viralScore}/100 (Target: 80-95)`);
        console.log(`   📊 Quality Score: ${omegaMetrics.qualityScore}/100`);
        console.log(`   🔧 Engines Used: ${omegaMetrics.enginesUsed}/12 (${omegaMetrics.utilizationRate?.toFixed(1)}%)`);
        if (omegaMetrics.techniquesApplied) {
          const totalTechniques = Object.values(omegaMetrics.techniquesApplied).reduce((sum, arr) => sum + arr.length, 0);
          console.log(`   ✨ Techniques Applied: ${totalTechniques}`);
        }
      }
      console.log('');

      return result;

    } catch (error) {
      return this.handleError(error);
    }
  }
}
