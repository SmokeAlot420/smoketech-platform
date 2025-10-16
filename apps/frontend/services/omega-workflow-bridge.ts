/**
 * Omega Workflow Bridge - Connects Templates to Full 12-Engine Orchestrator
 *
 * This bridge integrates omega-platform templates with the viral engine's
 * OmegaWorkflowOrchestrator for maximum viral potential (12/12 engines, 80-95 viral scores)
 */

import {
  OmegaWorkflowOrchestrator,
  OmegaVideoRequest,
  OmegaVideoResult,
  OmegaPreset
} from '../../viral/src/omega-workflow/omega-workflow';

export interface TemplateToOmegaRequest {
  // Template-friendly interface
  character?: {
    name: 'Aria' | 'Bianca' | 'Sofia';
    prompt: string;
  };
  scenario: {
    name: string;
    mainPrompt: string;
    dialogue?: string;
    environment: string;
  };
  veo3Options: {
    duration: 4 | 6 | 8;
    aspectRatio: '9:16' | '16:9' | '1:1';
    quality: 'standard' | 'professional' | 'viral-guaranteed';
    platform?: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
  };
  preset?: 'viral-guaranteed' | 'professional' | 'speed' | 'cost-efficient';
  enableAllEngines?: boolean;
}

export interface OmegaBridgeResponse {
  success: boolean;
  videoPath?: string;
  error?: string;

  // Pass-through omega metrics
  viralScore?: number;
  qualityScore?: number;
  enginesUsed?: number;
  utilizationRate?: number;
  techniquesApplied?: Record<string, string[]>;
  cost?: number;
  generationTime?: number;

  // Full omega result (if needed)
  fullOmegaResult?: OmegaVideoResult;
}

/**
 * Initialize Omega Workflow System (call once at startup)
 */
export async function initializeOmegaWorkflow(): Promise<void> {
  console.log('🚀 Initializing Omega Workflow Bridge...');

  const orchestrator = OmegaWorkflowOrchestrator.getInstance();
  await orchestrator.initialize();

  console.log('✅ Omega Workflow Bridge ready (12/12 engines)');
}

/**
 * Generate video using full Omega Workflow orchestrator
 */
export async function generateWithOmegaWorkflow(
  request: TemplateToOmegaRequest
): Promise<OmegaBridgeResponse> {
  const startTime = Date.now();

  try {
    console.log('🎬 Omega Bridge: Initiating video generation with 12-engine orchestrator');
    console.log(`📋 Scenario: ${request.scenario.name}`);
    console.log(`🎯 Quality Level: ${request.veo3Options.quality}`);
    console.log(`🔥 Preset: ${request.preset || 'custom'}`);

    // Get orchestrator instance
    const orchestrator = OmegaWorkflowOrchestrator.getInstance();

    // Transform template request to omega format
    const omegaRequest: OmegaVideoRequest = {
      // Character
      character: request.character?.name || 'Aria',

      // Content
      basePrompt: request.scenario.mainPrompt,
      dialogue: request.scenario.dialogue || '',
      environment: request.scenario.environment,

      // Video settings
      duration: request.veo3Options.duration,
      aspectRatio: request.veo3Options.aspectRatio,
      platform: request.veo3Options.platform || 'cross-platform',

      // Enhancement controls
      enableAllEngines: request.enableAllEngines !== false, // Default true
      viralOptimization: true,
      qualityLevel: request.veo3Options.quality,

      // Technique selection (based on preset or quality level)
      useZHOTechniques: request.preset === 'viral-guaranteed' || request.veo3Options.quality === 'viral-guaranteed',
      useMasterLibrary: request.veo3Options.quality !== 'standard',
      useTransformations: request.preset === 'viral-guaranteed',

      // Cost & performance
      maxCost: request.preset === 'cost-efficient' ? 25 : 50,
      maxGenerationTime: request.preset === 'speed' ? 900 : 1800 // 15min or 30min
    };

    console.log('📊 Omega Configuration:');
    console.log(`   - All Engines: ${omegaRequest.enableAllEngines ? 'YES' : 'NO'}`);
    console.log(`   - ZHO Techniques: ${omegaRequest.useZHOTechniques ? 'YES' : 'NO'}`);
    console.log(`   - Master Library: ${omegaRequest.useMasterLibrary ? 'YES' : 'NO'}`);
    console.log(`   - Transformations: ${omegaRequest.useTransformations ? 'YES' : 'NO'}`);

    // Generate using full orchestrator
    const omegaResult = await orchestrator.generateUltraViralVideo(omegaRequest);

    if (!omegaResult.success) {
      throw new Error(omegaResult.error || 'Omega generation failed');
    }

    const totalTime = (Date.now() - startTime) / 1000;

    console.log(`✅ Omega generation complete!`);
    console.log(`📊 Viral Score: ${omegaResult.metrics.viralScore}/100`);
    console.log(`📊 Quality Score: ${omegaResult.metrics.qualityScore}/100`);
    console.log(`🔧 Engines Used: ${omegaResult.enginesUsed.total}/12 (${omegaResult.enginesUsed.utilizationRate.toFixed(1)}%)`);
    console.log(`💰 Cost: $${omegaResult.performance.cost.toFixed(2)}`);
    console.log(`⏱️  Time: ${totalTime.toFixed(1)}s`);

    return {
      success: true,
      videoPath: omegaResult.videoPath,

      // Key metrics for UI display
      viralScore: omegaResult.metrics.viralScore,
      qualityScore: omegaResult.metrics.qualityScore,
      enginesUsed: omegaResult.enginesUsed.total,
      utilizationRate: omegaResult.enginesUsed.utilizationRate,
      techniquesApplied: omegaResult.techniquesApplied,
      cost: omegaResult.performance.cost,
      generationTime: totalTime,

      // Full result for advanced analysis
      fullOmegaResult: omegaResult
    };

  } catch (error) {
    console.error('❌ Omega Bridge Error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get available Omega presets
 */
export async function getOmegaPresets(): Promise<OmegaPreset[]> {
  const orchestrator = OmegaWorkflowOrchestrator.getInstance();
  return orchestrator.getPresets();
}

/**
 * Validate Omega Workflow readiness
 */
export async function validateOmegaWorkflow(): Promise<{
  valid: boolean;
  enginesReady: number;
  totalEngines: number;
  message: string;
}> {
  try {
    const orchestrator = OmegaWorkflowOrchestrator.getInstance();
    await orchestrator.initialize();

    // Get engine statistics from registry
    const { getEngineRegistry } = await import('../../viral/src/omega-workflow/engine-registry');
    const registry = getEngineRegistry();
    const stats = registry.getEngineStatistics();

    return {
      valid: stats.totalEngines === 12,
      enginesReady: stats.totalEngines,
      totalEngines: 12,
      message: stats.totalEngines === 12
        ? '✅ All 12 engines ready for maximum viral potential'
        : `⚠️  Only ${stats.totalEngines}/12 engines available`
    };
  } catch (error) {
    return {
      valid: false,
      enginesReady: 0,
      totalEngines: 12,
      message: `❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
