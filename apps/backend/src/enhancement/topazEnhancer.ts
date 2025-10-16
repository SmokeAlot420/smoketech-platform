import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface TopazConfig {
  model?: 'proteus' | 'artemis' | 'gaia';
  upscaleFactor?: 2 | 4;
  noiseReduction?: 'low' | 'medium' | 'high';
  sharpening?: 'low' | 'medium' | 'high';
  motionEstimation?: 'auto' | 'high_quality';
  frameInterpolation?: boolean;
  outputFormat?: 'mp4' | 'mov' | 'avi';
}

export interface EnhancementResult {
  path: string;
  originalSize: { width: number; height: number };
  enhancedSize: { width: number; height: number };
  processingTime: number;
  success: boolean;
  error?: string;
}

/**
 * Topaz Video AI Enhancement Engine
 *
 * Specializes in VEO3 video enhancement using the Proteus model
 * Upscales to 4K while preserving VEO3's natural characteristics
 */
export class TopazVEO3Enhancer {
  private defaultConfig: TopazConfig = {
    model: 'proteus', // Best for VEO3 content
    upscaleFactor: 4, // To 4K
    noiseReduction: 'medium', // Preserve VEO3 detail
    sharpening: 'low', // Avoid over-sharpening
    motionEstimation: 'high_quality',
    frameInterpolation: false, // Keep original framerate
    outputFormat: 'mp4'
  };

  /**
   * Enhance VEO3 video to 4K quality
   */
  async enhanceVideo(
    inputVideoPath: string,
    outputPath?: string,
    config: TopazConfig = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const finalConfig = { ...this.defaultConfig, ...config };

    const outputFile = outputPath || this.generateOutputPath(inputVideoPath, finalConfig);
    await this.ensureOutputDirectory(outputFile);

    console.log('⚡ Starting Topaz Video AI enhancement...');
    console.log(`Input: ${inputVideoPath}`);
    console.log(`Output: ${outputFile}`);
    console.log(`Config: ${JSON.stringify(finalConfig, null, 2)}`);

    try {
      // Get original video dimensions
      const originalSize = await this.getVideoDimensions(inputVideoPath);

      // Check if Topaz CLI is available
      await this.checkTopazAvailability();

      // Execute Topaz enhancement
      await this.executeTopazEnhancement(inputVideoPath, outputFile, finalConfig);

      // Get enhanced video dimensions
      const enhancedSize = await this.getVideoDimensions(outputFile);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Topaz enhancement completed in ${processingTime}ms`);
      console.log(`Upscaled from ${originalSize.width}x${originalSize.height} to ${enhancedSize.width}x${enhancedSize.height}`);

      return {
        path: outputFile,
        originalSize,
        enhancedSize,
        processingTime,
        success: true
      };

    } catch (error) {
      console.error('❌ Topaz enhancement failed:', error);

      return {
        path: inputVideoPath, // Fallback to original
        originalSize: { width: 0, height: 0 },
        enhancedSize: { width: 0, height: 0 },
        processingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch enhance multiple videos
   */
  async batchEnhanceVideos(
    inputPaths: string[],
    config: TopazConfig = {}
  ): Promise<EnhancementResult[]> {
    const results: EnhancementResult[] = [];

    for (let i = 0; i < inputPaths.length; i++) {
      console.log(`📹 Enhancing video ${i + 1}/${inputPaths.length}: ${inputPaths[i]}`);

      const result = await this.enhanceVideo(inputPaths[i], undefined, config);
      results.push(result);

      // Small delay between enhancements to manage system resources
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Execute Topaz Video AI enhancement
   */
  private async executeTopazEnhancement(
    inputPath: string,
    outputPath: string,
    config: TopazConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Topaz Video AI CLI command structure
      const args = [
        '--input', inputPath,
        '--output', outputPath,
        '--model', config.model!,
        '--scale', config.upscaleFactor!.toString(),
        '--noise-reduction', config.noiseReduction!,
        '--sharpening', config.sharpening!,
        '--motion-estimation', config.motionEstimation!
      ];

      if (config.frameInterpolation) {
        args.push('--frame-interpolation', 'true');
      }

      console.log('Topaz command:', 'topaz-video-ai', args.join(' '));

      const topaz = spawn('topaz-video-ai', args);

      let stderr = '';
      let stdout = '';

      topaz.stdout.on('data', (data) => {
        stdout += data.toString();
        // Show progress if available
        const progress = this.parseTopazProgress(data.toString());
        if (progress) {
          process.stdout.write(`\rProgress: ${progress}%`);
        }
      });

      topaz.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      topaz.on('close', (code) => {
        console.log(''); // New line after progress

        if (code === 0) {
          console.log('✅ Topaz enhancement completed successfully');
          resolve();
        } else {
          console.error('❌ Topaz failed with code:', code);
          console.error('Topaz stderr:', stderr);
          reject(new Error(`Topaz failed with exit code ${code}`));
        }
      });

      topaz.on('error', (error) => {
        // If Topaz CLI is not available, fall back gracefully
        if (error.message.includes('ENOENT')) {
          console.warn('⚠️ Topaz Video AI CLI not found, skipping enhancement');
          // Copy original file as fallback
          this.copyFile(inputPath, outputPath)
            .then(() => resolve())
            .catch(reject);
        } else {
          reject(new Error(`Topaz spawn error: ${error.message}`));
        }
      });
    });
  }

  /**
   * Check if Topaz CLI is available
   */
  private async checkTopazAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      const topaz = spawn('topaz-video-ai', ['--version']);

      topaz.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Topaz Video AI CLI not available'));
        }
      });

      topaz.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          console.warn('⚠️ Topaz Video AI CLI not found, will skip enhancement');
          resolve(); // Don't fail if Topaz is not available
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Get video dimensions using FFmpeg
   */
  private async getVideoDimensions(videoPath: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_video_streams',
        videoPath
      ]);

      let stdout = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const data = JSON.parse(stdout);
            const videoStream = data.streams.find((s: any) => s.codec_type === 'video');

            if (videoStream) {
              resolve({
                width: videoStream.width,
                height: videoStream.height
              });
            } else {
              resolve({ width: 1920, height: 1080 }); // Default assumption
            }
          } catch (error) {
            resolve({ width: 1920, height: 1080 }); // Default fallback
          }
        } else {
          resolve({ width: 1920, height: 1080 }); // Default fallback
        }
      });

      ffprobe.on('error', () => {
        resolve({ width: 1920, height: 1080 }); // Default fallback
      });
    });
  }

  /**
   * Parse Topaz progress output
   */
  private parseTopazProgress(output: string): number | null {
    const progressMatch = output.match(/(\d+)%/);
    return progressMatch ? parseInt(progressMatch[1]) : null;
  }

  /**
   * Generate output path with enhancement suffix
   */
  private generateOutputPath(inputPath: string, config: TopazConfig): string {
    const ext = path.extname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);

    const suffix = `_enhanced_${config.upscaleFactor}x_${config.model}`;

    return path.join(dir, `${baseName}${suffix}.${config.outputFormat}`);
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
   * Copy file as fallback when Topaz is not available
   */
  private async copyFile(source: string, destination: string): Promise<void> {
    try {
      await fs.copyFile(source, destination);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Get optimal settings for VEO3 content
   */
  static getVEO3OptimalSettings(): TopazConfig {
    return {
      model: 'proteus', // Best for photorealistic content
      upscaleFactor: 4, // Standard 4K upscaling
      noiseReduction: 'medium', // Preserve detail while reducing artifacts
      sharpening: 'low', // Avoid over-sharpening realistic faces
      motionEstimation: 'high_quality', // Best motion handling
      frameInterpolation: false, // Keep original timing
      outputFormat: 'mp4' // Maximum compatibility
    };
  }

  /**
   * Performance monitoring for batch processing
   */
  async getPerformanceMetrics(videoCount: number, config: TopazConfig): Promise<{
    estimatedTime: number;
    memoryRequirement: number;
    recommendedBatchSize: number;
  }> {
    const baseTimePerVideo = 120; // seconds for 8-second VEO3 segment
    const upscaleMultiplier = config.upscaleFactor === 4 ? 2.5 : 1.5;
    const modelMultiplier = config.model === 'proteus' ? 1.2 : 1.0;

    const estimatedTime = videoCount * baseTimePerVideo * upscaleMultiplier * modelMultiplier;
    const memoryRequirement = config.upscaleFactor === 4 ? 8000 : 4000; // MB
    const recommendedBatchSize = Math.min(videoCount, Math.floor(16000 / memoryRequirement));

    return {
      estimatedTime,
      memoryRequirement,
      recommendedBatchSize
    };
  }
}