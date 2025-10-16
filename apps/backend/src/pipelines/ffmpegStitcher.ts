import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VideoSegment } from './nanoBananaVeo3Pipeline';

export interface StitchedVideo {
  path: string;
  duration: number;
  segmentCount: number;
  transitions: string[];
}

export interface FFmpegConfig {
  outputQuality?: 'high' | 'medium' | 'low';
  outputFormat?: 'mp4' | 'mov' | 'avi';
  transitionDuration?: number; // in seconds
}

/**
 * FFmpeg Video Stitching Engine for VEO3 Segments
 *
 * Uses 35+ xfade transitions for seamless segment combination
 * Optimized for VEO3's 8-second segment structure
 */
export class FFmpegVideoStitcher {
  // Professional transition types for variety
  private transitions = [
    'fade', 'fadeblack', 'fadewhite', 'distance', 'wipeleft', 'wiperight',
    'wipeup', 'wipedown', 'slideleft', 'slideright', 'slideup', 'slidedown',
    'circleopen', 'circleclose', 'vertopen', 'vertclose', 'horzopen', 'horzclose',
    'diagtl', 'diagtr', 'diagbl', 'diagbr', 'hlslice', 'hrslice', 'vuslice', 'vdslice',
    'dissolve', 'pixelize', 'radial', 'smoothleft', 'smoothright', 'smoothup', 'smoothdown'
  ];

  /**
   * Stitch VEO3 8-second segments into a cohesive video
   */
  async stitchVEO3Segments(
    segments: VideoSegment[],
    outputPath?: string,
    config: FFmpegConfig = {}
  ): Promise<StitchedVideo> {
    const validSegments = segments.filter(s => s.success && s.videoPath);

    if (validSegments.length === 0) {
      throw new Error('No valid segments to stitch');
    }

    if (validSegments.length === 1) {
      // Single segment, just copy
      return {
        path: validSegments[0].videoPath,
        duration: validSegments[0].duration,
        segmentCount: 1,
        transitions: []
      };
    }

    const outputFile = outputPath || `./generated/stitched/video_${Date.now()}.mp4`;
    await this.ensureOutputDirectory(outputFile);

    const transitionDuration = config.transitionDuration || 0.5;
    const selectedTransitions = this.selectTransitions(validSegments.length - 1);

    console.log(`🔗 Stitching ${validSegments.length} segments with transitions: ${selectedTransitions.join(', ')}`);

    try {
      const filterComplex = this.buildFilterComplex(validSegments, selectedTransitions, transitionDuration);

      await this.executeFFmpeg(validSegments, filterComplex, outputFile, config);

      const totalDuration = validSegments.reduce((sum, seg) => sum + seg.duration, 0) -
                           (selectedTransitions.length * transitionDuration);

      return {
        path: outputFile,
        duration: totalDuration,
        segmentCount: validSegments.length,
        transitions: selectedTransitions
      };

    } catch (error) {
      console.error('FFmpeg stitching failed:', error);
      throw new Error(`Video stitching failed: ${error}`);
    }
  }

  /**
   * Build complex filter for seamless transitions
   */
  private buildFilterComplex(
    segments: VideoSegment[],
    transitions: string[],
    transitionDuration: number
  ): string {
    const filters: string[] = [];
    const audioFilters: string[] = [];

    // Video transitions
    for (let i = 0; i < segments.length - 1; i++) {
      const transition = transitions[i];
      const offset = (i + 1) * (8 - transitionDuration); // Account for overlap

      if (i === 0) {
        // First transition
        filters.push(
          `[${i}:v][${i+1}:v]xfade=transition=${transition}:duration=${transitionDuration}:offset=${offset}[v${i}${i+1}]`
        );
      } else {
        // Subsequent transitions
        filters.push(
          `[v${i-1}${i}][${i+1}:v]xfade=transition=${transition}:duration=${transitionDuration}:offset=${offset}[v${i}${i+1}]`
        );
      }
    }

    // Audio crossfades
    for (let i = 0; i < segments.length - 1; i++) {
      const offset = (i + 1) * (8 - transitionDuration);

      if (i === 0) {
        audioFilters.push(
          `[${i}:a][${i+1}:a]acrossfade=duration=${transitionDuration}:o1=${offset}[a${i}${i+1}]`
        );
      } else {
        audioFilters.push(
          `[a${i-1}${i}][${i+1}:a]acrossfade=duration=${transitionDuration}:o1=${offset}[a${i}${i+1}]`
        );
      }
    }

    return [...filters, ...audioFilters].join(';');
  }

  /**
   * Execute FFmpeg command with optimal settings
   */
  private async executeFFmpeg(
    segments: VideoSegment[],
    filterComplex: string,
    outputFile: string,
    config: FFmpegConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        // Input files
        ...segments.flatMap(seg => ['-i', seg.videoPath]),

        // Filter complex
        '-filter_complex', filterComplex,

        // Map outputs
        '-map', `[v${segments.length-2}${segments.length-1}]`,
        '-map', `[a${segments.length-2}${segments.length-1}]`,

        // Output settings
        ...this.getOutputSettings(config),

        // Overwrite output
        '-y',
        outputFile
      ];

      console.log('FFmpeg command:', 'ffmpeg', args.join(' '));

      const ffmpeg = spawn('ffmpeg', args);

      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
        // Show progress
        if (data.toString().includes('frame=')) {
          process.stdout.write('.');
        }
      });

      ffmpeg.on('close', (code) => {
        console.log(''); // New line after progress dots

        if (code === 0) {
          console.log('✅ FFmpeg stitching completed successfully');
          resolve();
        } else {
          console.error('❌ FFmpeg failed with code:', code);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`FFmpeg failed with exit code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg spawn error: ${error.message}`));
      });
    });
  }

  /**
   * Get optimal output settings based on quality
   */
  private getOutputSettings(config: FFmpegConfig): string[] {
    const quality = config.outputQuality || 'high';

    const baseSettings = [
      '-c:v', 'libx264',
      '-preset', 'slow', // Better compression efficiency
      '-profile:v', 'high', // Maximum compatibility
      '-level', '4.1', // 4K support
      '-movflags', '+faststart' // Web optimization
    ];

    switch (quality) {
      case 'high':
        return [...baseSettings, '-crf', '18']; // Visually lossless
      case 'medium':
        return [...baseSettings, '-crf', '23']; // Good quality
      case 'low':
        return [...baseSettings, '-crf', '28']; // Smaller files
      default:
        return [...baseSettings, '-crf', '18'];
    }
  }

  /**
   * Select varied transitions for visual interest
   */
  private selectTransitions(count: number): string[] {
    const selected: string[] = [];
    const availableTransitions = [...this.transitions];

    for (let i = 0; i < count; i++) {
      // Prefer different transitions for variety
      const randomIndex = Math.floor(Math.random() * availableTransitions.length);
      selected.push(availableTransitions[randomIndex]);

      // Remove used transition to avoid repetition (unless we run out)
      if (availableTransitions.length > 1) {
        availableTransitions.splice(randomIndex, 1);
      }
    }

    return selected;
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Batch process multiple video sets
   */
  async batchStitchVideos(
    videoBatches: VideoSegment[][],
    config: FFmpegConfig = {}
  ): Promise<StitchedVideo[]> {
    const results: StitchedVideo[] = [];

    for (let i = 0; i < videoBatches.length; i++) {
      console.log(`🎬 Processing batch ${i + 1}/${videoBatches.length}`);

      try {
        const result = await this.stitchVEO3Segments(
          videoBatches[i],
          `./generated/stitched/batch_${i + 1}_${Date.now()}.mp4`,
          config
        );

        results.push(result);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error);
        // Continue with other batches
      }
    }

    return results;
  }
}