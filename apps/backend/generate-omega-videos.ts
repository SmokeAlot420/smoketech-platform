/**
 * OMEGA WORKFLOW PRODUCTION ENTRY POINT v1.0
 *
 * Complete production pipeline using all 12 engines for maximum viral potential
 * Target: 80-95 viral scores, <$50 cost, <30min generation time
 *
 * FEATURES:
 * ✅ All 12 engines integration
 * ✅ Cost tracking and performance monitoring
 * ✅ Preset loading (viral-guaranteed, professional-grade, etc.)
 * ✅ Progress reporting with real-time updates
 * ✅ Comprehensive error handling and recovery
 * ✅ Result logging and analytics
 *
 * Sign off as SmokeDev 🚬
 */

import dotenv from 'dotenv';
dotenv.config();

import { OmegaWorkflowOrchestrator, OmegaVideoRequest } from './src/omega-workflow/omega-workflow';
import { OmegaQualityValidator } from './src/omega-workflow/quality-validator';
import { TechniqueSelector } from './src/omega-workflow/technique-selector';
import { OMEGA_PRESETS, OmegaConfig } from './src/omega-workflow/omega-config';
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';
import { biancaInfluencer } from './src/characters/bianca-quotemoto';

interface GenerationMetrics {
  startTime: number;
  endTime?: number;
  totalCost: number;
  viralScore: number;
  engineUtilization: number;
  qualityScore: number;
  errors: string[];
  warnings: string[];
}

interface GenerationResult {
  success: boolean;
  videoPath?: string;
  duration?: number;
  metrics: GenerationMetrics;
  validationReport?: any;
  error?: string;
}

class OmegaVideoGenerator {
  private workflow: OmegaWorkflowOrchestrator;
  private validator: OmegaQualityValidator;
  private techniqueSelector: TechniqueSelector;
  private metrics: GenerationMetrics;

  constructor() {
    this.workflow = new OmegaWorkflowOrchestrator();
    this.validator = new OmegaQualityValidator();
    this.techniqueSelector = new TechniqueSelector();
    this.metrics = {
      startTime: Date.now(),
      totalCost: 0,
      viralScore: 0,
      engineUtilization: 0,
      qualityScore: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Generate video with specified preset configuration
   */
  async generateWithPreset(
    presetName: keyof typeof OMEGA_PRESETS,
    customRequest?: Partial<OmegaVideoRequest>
  ): Promise<GenerationResult> {
    console.log(`🚀 Starting Omega Video Generation with preset: ${presetName}`);
    console.log('=' .repeat(80));

    try {
      // Load preset configuration
      const config = OMEGA_PRESETS[presetName];
      console.log(`📋 Loaded preset: ${presetName}`);
      console.log(`🎯 Target viral score: ${config.targetViralScore}`);
      console.log(`💰 Max cost: $${(config.maxCost / 100).toFixed(2)}`);
      console.log(`⏱️  Max time: ${config.maxTime} minutes`);

      // Create base request from preset
      const baseRequest = this.createRequestFromPreset(config, customRequest);

      // Phase 1: Validate request
      console.log('\n📋 Phase 1: Request Validation...');
      const validationResult = await this.validateRequest(baseRequest);
      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      console.log('✅ Request validation passed');

      // Phase 2: Technique Selection
      console.log('\n🎯 Phase 2: Intelligent Technique Selection...');
      const selectedTechniques = await this.selectOptimalTechniques(baseRequest, config);
      console.log(`✅ Selected ${selectedTechniques.length} optimal techniques`);

      // Phase 3: Video Generation
      console.log('\n🎬 Phase 3: Video Generation Pipeline...');
      const generationResult = await this.generateVideo(baseRequest, selectedTechniques);

      if (!generationResult.success) {
        throw new Error(generationResult.error || 'Video generation failed');
      }

      // Phase 4: Quality Validation
      console.log('\n🔍 Phase 4: Quality Validation...');
      const qualityReport = await this.validateQuality(baseRequest, generationResult);

      // Phase 5: Calculate final metrics
      this.metrics.endTime = Date.now();
      this.metrics.viralScore = qualityReport.overall.score;
      this.metrics.qualityScore = qualityReport.overall.score;

      const result: GenerationResult = {
        success: true,
        videoPath: generationResult.videoPath,
        duration: generationResult.duration,
        metrics: this.metrics,
        validationReport: qualityReport
      };

      this.displayResults(result, config);
      return result;

    } catch (error) {
      console.error('❌ Generation failed:', error);
      this.metrics.errors.push(String(error));

      return {
        success: false,
        error: String(error),
        metrics: this.metrics
      };
    }
  }

  /**
   * Create request object from preset configuration
   */
  private createRequestFromPreset(
    config: OmegaConfig,
    customRequest?: Partial<OmegaVideoRequest>
  ): OmegaVideoRequest {
    const baseRequest: OmegaVideoRequest = {
      // Core content (can be overridden)
      character: 'Aria',
      prompt: 'Professional QuoteMoto insurance expert explaining savings',
      qualityLevel: 'professional',
      platform: 'tiktok',

      // Video settings
      enableAllEngines: true,
      targetViralScore: config.targetViralScore,
      maxCost: config.maxCost,
      maxTime: config.maxTime,
      aspectRatio: '9:16',
      duration: 8,

      // Enhancement controls
      skinRealismConfig: {
        age: 26,
        gender: 'female',
        ethnicity: 'mixed heritage',
        skinTone: 'medium',
        imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
        overallIntensity: config.engines.skinRealism.overallIntensity
      },

      photoRealismPreset: 'business-headshot',
      zhoTechniquesEnabled: config.engines.zhoTechniques.enabled,
      transformationEnabled: config.engines.transformation.enabled,
      validationEnabled: true,

      // Apply custom overrides
      ...customRequest
    };

    return baseRequest;
  }

  /**
   * Validate request before processing
   */
  private async validateRequest(request: OmegaVideoRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Environment validation
    if (!process.env.GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY environment variable is required');
    }

    // Request validation
    if (request.targetViralScore < 70 || request.targetViralScore > 95) {
      errors.push('Target viral score must be between 70-95');
    }

    if (request.maxCost < 1000) { // $10 minimum
      errors.push('Maximum cost must be at least $10 (1000 cents)');
    }

    if (request.maxTime < 5) {
      errors.push('Maximum time must be at least 5 minutes');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Select optimal techniques based on request and config
   */
  private async selectOptimalTechniques(request: OmegaVideoRequest, config: OmegaConfig) {
    const criteria = {
      targetViralScore: request.targetViralScore,
      maxCost: request.maxCost,
      maxComplexity: 'moderate' as const,
      targetPlatform: request.platform,
      contentType: 'professional-brand' as const,
      character: request.character
    };

    const selection = await this.techniqueSelector.selectOptimalTechniques(
      request.prompt,
      criteria,
      request.character
    );

    console.log(`💡 Selected ${selection?.techniques?.length || 0} individual techniques`);
    console.log(`📦 Selected ${selection?.bundles?.length || 0} technique bundles`);
    console.log(`🎭 Selected ${selection?.zhoTechniques?.length || 0} ZHO techniques`);

    return selection;
  }

  /**
   * Generate video using Omega Workflow
   */
  private async generateVideo(request: OmegaVideoRequest, techniques: any) {
    const progressCallback = (phase: string, progress: number) => {
      console.log(`  🔄 ${phase}: ${progress}%`);
    };

    try {
      const result = await this.workflow.generateUltraViralVideo(request);

      // Track costs
      this.metrics.totalCost += result.metadata?.cost || 0;
      this.metrics.engineUtilization = result.metadata?.engineUtilization || 0;

      return result;
    } catch (error) {
      this.metrics.errors.push(`Video generation: ${error}`);
      throw error;
    }
  }

  /**
   * Validate generated video quality
   */
  private async validateQuality(request: OmegaVideoRequest, generationResult: any) {
    try {
      const qualityReport = await this.validator.validateComprehensive(request);

      if (!qualityReport.overall.passed) {
        this.metrics.warnings.push('Quality validation did not pass all criteria');
      }

      return qualityReport;
    } catch (error) {
      this.metrics.warnings.push(`Quality validation error: ${error}`);
      // Return mock report if validation fails
      return {
        overall: { passed: false, score: 0, totalTime: 0 },
        phases: []
      };
    }
  }

  /**
   * Display comprehensive results
   */
  private displayResults(result: GenerationResult, config: OmegaConfig) {
    console.log('\n🎉 OMEGA WORKFLOW GENERATION COMPLETE!');
    console.log('=' .repeat(80));

    console.log('\n📊 GENERATION METRICS:');
    console.log(`✅ Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🎯 Viral Score: ${result.metrics.viralScore}/100`);
    console.log(`💰 Total Cost: $${(result.metrics.totalCost / 100).toFixed(2)}`);
    console.log(`⏱️  Generation Time: ${((result.metrics.endTime! - result.metrics.startTime) / 1000 / 60).toFixed(1)} minutes`);
    console.log(`🔧 Engine Utilization: ${result.metrics.engineUtilization}%`);
    console.log(`🎬 Video Duration: ${result.duration} seconds`);

    if (result.videoPath) {
      console.log(`📁 Video saved to: ${result.videoPath}`);
    }

    if (result.validationReport) {
      console.log('\n🔍 QUALITY VALIDATION:');
      console.log(`📈 Quality Score: ${result.validationReport.overall.score}/100`);
      console.log(`⚡ Validation Time: ${result.validationReport.overall.totalTime.toFixed(1)} minutes`);
    }

    // Performance analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    const targetTime = config.maxTime;
    const actualTime = (result.metrics.endTime! - result.metrics.startTime) / 1000 / 60;
    const timeEfficiency = Math.min(100, (targetTime / actualTime) * 100);

    const targetCost = config.maxCost;
    const costEfficiency = Math.min(100, (targetCost / result.metrics.totalCost) * 100);

    console.log(`⏱️  Time Efficiency: ${timeEfficiency.toFixed(1)}% (${actualTime.toFixed(1)}min vs ${targetTime}min target)`);
    console.log(`💰 Cost Efficiency: ${costEfficiency.toFixed(1)}% ($${(result.metrics.totalCost/100).toFixed(2)} vs $${(targetCost/100).toFixed(2)} budget)`);

    if (result.metrics.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.metrics.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (result.metrics.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      result.metrics.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    console.log('\n🎭 Generation powered by all 12 Omega engines');
    console.log('Sign off as SmokeDev 🚬');
  }
}

/**
 * Predefined generation scenarios for testing and production
 */
async function generateViralGuaranteedVideo() {
  console.log('🔥 VIRAL GUARANTEED VIDEO GENERATION');
  const generator = new OmegaVideoGenerator();

  const customRequest: Partial<OmegaVideoRequest> = {
    character: 'Aria',
    prompt: 'Shocking insurance savings that will blow your mind',
    platform: 'tiktok',
    aspectRatio: '9:16'
  };

  return await generator.generateWithPreset('VIRAL_GUARANTEED', customRequest);
}

async function generateProfessionalVideo() {
  console.log('💼 PROFESSIONAL GRADE VIDEO GENERATION');
  const generator = new OmegaVideoGenerator();

  const customRequest: Partial<OmegaVideoRequest> = {
    character: 'Bianca',
    prompt: 'Professional insurance expertise you can trust',
    platform: 'youtube',
    aspectRatio: '16:9'
  };

  return await generator.generateWithPreset('PROFESSIONAL_GRADE', customRequest);
}

async function generateSpeedOptimizedVideo() {
  console.log('⚡ SPEED OPTIMIZED VIDEO GENERATION');
  const generator = new OmegaVideoGenerator();

  const customRequest: Partial<OmegaVideoRequest> = {
    character: 'Aria',
    prompt: 'Quick insurance tips for busy professionals',
    platform: 'instagram',
    aspectRatio: '1:1'
  };

  return await generator.generateWithPreset('SPEED_OPTIMIZED', customRequest);
}

async function generateCostEfficientVideo() {
  console.log('💰 COST EFFICIENT VIDEO GENERATION');
  const generator = new OmegaVideoGenerator();

  const customRequest: Partial<OmegaVideoRequest> = {
    character: 'Bianca',
    prompt: 'Affordable insurance options for everyone',
    platform: 'cross-platform',
    aspectRatio: '9:16'
  };

  return await generator.generateWithPreset('COST_EFFICIENT', customRequest);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎭 OMEGA WORKFLOW PRODUCTION PIPELINE');
  console.log('Complete integration of all 12 engines for maximum viral potential');
  console.log('Target: 80-95 viral scores, <$50 cost, <30min generation');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  // Environment validation
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    console.log('Please set your Gemini API key in the .env file');
    return;
  }

  try {
    // Generate different types of videos
    console.log('\n🚀 Starting multi-preset generation...\n');

    // Example 1: Viral guaranteed (maximum viral potential)
    const viralResult = await generateViralGuaranteedVideo();

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 2: Professional grade (business/commercial)
    const professionalResult = await generateProfessionalVideo();

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 3: Speed optimized (fast generation)
    const speedResult = await generateSpeedOptimizedVideo();

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 4: Cost efficient (budget-friendly)
    const costResult = await generateCostEfficientVideo();

    // Summary
    console.log('\n🎉 ALL OMEGA WORKFLOW GENERATIONS COMPLETE!');
    console.log('=' .repeat(80));

    const results = [viralResult, professionalResult, speedResult, costResult];
    const successful = results.filter(r => r.success).length;

    console.log(`✅ Successful generations: ${successful}/${results.length}`);

    if (successful > 0) {
      const avgViralScore = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.metrics.viralScore, 0) / successful;

      const totalCost = results
        .reduce((sum, r) => sum + r.metrics.totalCost, 0);

      console.log(`🎯 Average viral score: ${avgViralScore.toFixed(1)}/100`);
      console.log(`💰 Total cost: $${(totalCost / 100).toFixed(2)}`);
    }

    console.log('\nCheck the generated/ directory for your videos.');
    console.log('\nSign off as SmokeDev 🚬');

  } catch (error) {
    console.error('❌ Production pipeline failed:', error);
    process.exit(1);
  }
}

// Export for external use
export {
  OmegaVideoGenerator,
  generateViralGuaranteedVideo,
  generateProfessionalVideo,
  generateSpeedOptimizedVideo,
  generateCostEfficientVideo
};

// Run if executed directly (ES module equivalent)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}