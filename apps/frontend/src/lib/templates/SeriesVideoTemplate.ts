/**
 * Series Video Template
 *
 * Pattern: Same Character → Multiple Videos
 * Use Cases: Trilogy, Content Series, Multi-Part Tutorials
 *
 * Examples from viral repo:
 * - generate-painting-trilogy.ts (3 videos, same character)
 */

import { BaseVideoTemplate, VideoConfig, VideoResult } from './BaseVideoTemplate';

export class SeriesVideoTemplate extends BaseVideoTemplate {
  protected templateType = 'series-video';

  /**
   * Generate multiple videos with same character
   */
  async generateVideo(config: VideoConfig): Promise<VideoResult> {
    try {
      console.log('🎬 Series Video Template - Starting Generation');
      console.log('================================================================================');
      console.log(`🎯 Generating ${config.scenarios.length} videos with consistent character\n`);

      if (!config.character) {
        throw new Error('Series Video Template requires a character');
      }

      if (config.scenarios.length < 2) {
        throw new Error('Series Video Template requires at least 2 scenarios');
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STAGE 1: Character Generation (same for all videos)
      // ═══════════════════════════════════════════════════════════════════════

      this.logProgress(config, 'character', 5, 'Generating character for series...');
      const characterPath = await this.generateCharacter(config);

      if (!characterPath) {
        throw new Error('Failed to generate character');
      }

      console.log(`✅ Character generated: ${characterPath}\n`);

      // ═══════════════════════════════════════════════════════════════════════
      // STAGE 2: Video Generation (batch with same character)
      // ═══════════════════════════════════════════════════════════════════════

      const videos: Array<{ name: string; path: string; scenario: string }> = [];
      const videoCount = config.scenarios.length;
      const progressPerVideo = 80 / videoCount; // 80% total for all videos

      for (let i = 0; i < config.scenarios.length; i++) {
        const scenario = config.scenarios[i];
        const videoNum = i + 1;

        console.log(`🎬 Starting Video ${videoNum}/${videoCount}: ${scenario.name}\n`);

        const progressOffset = 20 + (i * progressPerVideo);

        const videoPath = await this.generateVideoSegment(
          config,
          scenario,
          characterPath,
          progressOffset,
          progressPerVideo
        );

        videos.push({
          name: scenario.name,
          path: videoPath,
          scenario: scenario.mainPrompt
        });

        console.log(`✅ Video ${videoNum} saved: ${videoPath}\n`);
      }

      this.logProgress(config, 'complete', 100, 'Series generation complete');

      // ═══════════════════════════════════════════════════════════════════════
      // RESULT
      // ═══════════════════════════════════════════════════════════════════════

      const duration = config.veo3Options.duration || 8;
      const cost = this.calculateCost(true, videoCount, duration);

      const result: VideoResult = {
        success: true,
        videos: videos,
        characterImage: characterPath,
        metadata: {
          templateType: this.templateType,
          totalCost: cost,
          duration: duration,
          format: config.veo3Options.aspectRatio || '9:16',
          videosGenerated: videoCount
        },
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 SERIES COMPLETE!');
      console.log('================================================================================');
      videos.forEach((video, index) => {
        console.log(`📽️  Video ${index + 1}: ${video.name}`);
        console.log(`   ${video.path}`);
      });
      console.log(`\n📸 Character: ${characterPath}`);
      console.log(`📱 Format: ${result.metadata.format}`);
      console.log(`⏱️  Duration: ${duration} seconds each`);
      console.log(`💰 Total Cost: $${cost.toFixed(2)}`);
      console.log(`✨ Same character across all ${videoCount} videos\n`);

      return result;

    } catch (error) {
      return this.handleError(error);
    }
  }
}
