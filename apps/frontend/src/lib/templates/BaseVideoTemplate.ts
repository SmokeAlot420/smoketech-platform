/**
 * Base Video Template - Abstract Foundation for All Video Generation Templates
 *
 * This abstract class provides:
 * - Common interfaces and types
 * - Progress tracking callbacks
 * - Error handling patterns
 * - Shared utility methods
 */

// Use bridge services (omega-platform wrappers around viral engine)
import { VertexAINanoBananaService } from '../../../services/nanobana-bridge';
import { VEO3Service } from '../../../services/veo3-bridge';
import type { VEO3JSONPrompt } from '../../../services/veo3-bridge';
import { AdvancedVEO3PromptBuilder } from './AdvancedVEO3PromptBuilder';

// 🔥 OMEGA WORKFLOW INTEGRATION - Use full 12-engine orchestrator for maximum viral potential
import {
  generateWithOmegaWorkflow,
  TemplateToOmegaRequest,
  OmegaBridgeResponse
} from '../../../services/omega-workflow-bridge';

// ═══════════════════════════════════════════════════════════════════════
// SHARED INTERFACES
// ═══════════════════════════════════════════════════════════════════════

export interface ProgressUpdate {
  stage: string;
  progress: number; // 0-100
  message: string;
}

export interface CharacterConfig {
  prompt: string;
  temperature?: number;
  preservationInstructions?: string;
  imagePath?: string; // If reusing existing character
}

export interface ScenarioConfig {
  name: string;
  mainPrompt: string;
  dialogue?: string;
  timing: {
    "0-2s": string;
    "2-6s": string;
    "6-8s": string;
  };
  environment: {
    location: string;
    atmosphere: string;
    interactionElements?: string[];
  };
}

export interface VEO3Options {
  duration?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high';
  enableSoundGeneration?: boolean;
  cameraPreset?: keyof typeof AdvancedVEO3PromptBuilder.CAMERA_PRESETS;
  lightingPreset?: keyof typeof AdvancedVEO3PromptBuilder.LIGHTING_PRESETS;
}

export interface VideoConfig {
  character?: CharacterConfig;
  scenarios: ScenarioConfig[];
  veo3Options: VEO3Options;
  onProgress?: (update: ProgressUpdate) => void;
}

export interface VideoResult {
  success: boolean;
  videos: Array<{
    name: string;
    path: string;
    scenario: string;
  }>;
  characterImage?: string;
  metadata: {
    templateType: string;
    totalCost: number;
    duration: number;
    format: string;
    videosGenerated: number;

    // 🔥 OMEGA WORKFLOW METRICS (when using orchestrator)
    viralScore?: number;         // 0-100 (Target: 80-95)
    qualityScore?: number;       // 0-100
    enginesUsed?: number;        // Out of 12
    utilizationRate?: number;    // Percentage
    techniquesApplied?: Record<string, string[]>;
  };
  error?: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════
// ABSTRACT BASE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════

export abstract class BaseVideoTemplate {
  protected nanoBanana: VertexAINanoBananaService;
  protected veo3: VEO3Service;
  protected abstract templateType: string;

  constructor() {
    this.nanoBanana = new VertexAINanoBananaService();
    this.veo3 = new VEO3Service();
  }

  /**
   * Main entry point - must be implemented by concrete templates
   */
  abstract generateVideo(config: VideoConfig): Promise<VideoResult>;

  /**
   * Progress callback wrapper
   */
  protected logProgress(
    config: VideoConfig,
    stage: string,
    progress: number,
    message: string
  ): void {
    const update: ProgressUpdate = { stage, progress, message };

    // Console logging
    console.log(`PROGRESS:${JSON.stringify(update)}`);

    // Callback if provided
    if (config.onProgress) {
      config.onProgress(update);
    }
  }

  /**
   * Generate character image using NanoBanana (if needed)
   */
  protected async generateCharacter(
    config: VideoConfig
  ): Promise<string | undefined> {
    if (!config.character) {
      return undefined;
    }

    // If reusing existing character
    if (config.character.imagePath) {
      this.logProgress(config, 'character', 5, `Using existing character: ${config.character.imagePath}`);
      return config.character.imagePath;
    }

    // Generate new character
    this.logProgress(config, 'character', 5, 'Generating character with NanoBanana...');

    const characterResults = await this.nanoBanana.generateImage(
      config.character.prompt,
      {
        temperature: config.character.temperature || 0.3,
        numImages: 1
      }
    );

    if (!characterResults || characterResults.length === 0) {
      throw new Error('Failed to generate character');
    }

    const characterPath = characterResults[0].imagePath;
    this.logProgress(config, 'character', 15, `Character generated: ${characterPath}`);

    return characterPath;
  }

  /**
   * Build VEO3JSONPrompt using AdvancedVEO3PromptBuilder
   */
  protected buildVEO3Prompt(
    scenario: ScenarioConfig,
    veo3Options: VEO3Options,
    hasCharacter: boolean
  ): VEO3JSONPrompt {

    // Determine camera preset (default based on character presence)
    const cameraPreset = veo3Options.cameraPreset ||
      (hasCharacter ? 'eye-level-conversational' : 'screen-recording');

    // Determine lighting preset (default based on character presence)
    const lightingPreset = veo3Options.lightingPreset ||
      (hasCharacter ? 'outdoor-natural' : 'screen-illumination');

    // Build character section
    const character = hasCharacter ? {
      description: "Professional subject in authentic setting",
      action: scenario.dialogue || scenario.timing["2-6s"],
      microExpressions: undefined,
      movementQuality: undefined
    } : undefined;

    // Build audio layers
    const audio = {
      primary: scenario.dialogue || scenario.mainPrompt,
      action: undefined,
      ambient: hasCharacter
        ? ["natural environmental sounds", "subtle background ambience"]
        : ["quiet workspace ambience", "subtle interface sounds"],
      emotional: hasCharacter ? "authentic conversational tone" : "professional technical tone",
      music: undefined,
      sound_effects: undefined
    };

    // Build complete prompt
    return AdvancedVEO3PromptBuilder.buildCompletePrompt({
      mainPrompt: scenario.mainPrompt,
      negativePrompt: hasCharacter
        ? AdvancedVEO3PromptBuilder.STANDARD_NEGATIVE_PROMPT
        : AdvancedVEO3PromptBuilder.SCREEN_RECORDING_NEGATIVE_PROMPT,
      timing: scenario.timing,
      cameraPreset: cameraPreset,
      lightingPreset: lightingPreset,
      character: character,
      environment: scenario.environment,
      audio: audio,
      technical: hasCharacter ? 'ultra-realistic' : 'screen-interface',
      duration: veo3Options.duration || 8
    });
  }

  /**
   * 🔥 Generate video using OMEGA WORKFLOW ORCHESTRATOR (12 engines for maximum viral potential)
   */
  protected async generateVideoWithOmega(
    config: VideoConfig,
    scenario: ScenarioConfig,
    character?: { name: 'Aria' | 'Bianca' | 'Sofia'; prompt: string },
    progressOffset: number = 0,
    progressRange: number = 100
  ): Promise<{ videoPath: string; omegaMetrics?: OmegaBridgeResponse }> {

    this.logProgress(
      config,
      'omega',
      progressOffset + progressRange * 0.1,
      `🔥 Using Omega Workflow (12/12 engines)...`
    );

    // Build omega request
    const omegaRequest: TemplateToOmegaRequest = {
      character: character,
      scenario: {
        name: scenario.name,
        mainPrompt: scenario.mainPrompt,
        dialogue: scenario.mainPrompt, // Use mainPrompt as dialogue fallback
        environment: scenario.environment.location
      },
      veo3Options: {
        duration: config.veo3Options.duration || 8,
        aspectRatio: config.veo3Options.aspectRatio || '9:16',
        quality: config.veo3Options.quality || 'high',
        platform: 'cross-platform'
      },
      preset: config.veo3Options.quality === 'viral-guaranteed' ? 'viral-guaranteed' :
              config.veo3Options.quality === 'professional' ? 'professional' :
              'cost-efficient',
      enableAllEngines: true // Always use all 12 engines
    };

    this.logProgress(
      config,
      'omega',
      progressOffset + progressRange * 0.3,
      `Generating with ${omegaRequest.preset} preset...`
    );

    const omegaResult = await generateWithOmegaWorkflow(omegaRequest);

    if (!omegaResult.success || !omegaResult.videoPath) {
      throw new Error(omegaResult.error || 'Omega generation failed');
    }

    this.logProgress(
      config,
      'omega',
      progressOffset + progressRange * 0.9,
      `🎉 Omega complete! Viral Score: ${omegaResult.viralScore || 0}/100`
    );

    return {
      videoPath: omegaResult.videoPath,
      omegaMetrics: omegaResult
    };
  }

  /**
   * Generate single video segment with VEO3 (LEGACY - use generateVideoWithOmega for better results)
   */
  protected async generateVideoSegment(
    config: VideoConfig,
    scenario: ScenarioConfig,
    characterPath?: string,
    progressOffset: number = 0,
    progressRange: number = 100
  ): Promise<string> {

    const prompt = this.buildVEO3Prompt(
      scenario,
      config.veo3Options,
      !!characterPath
    );

    this.logProgress(
      config,
      'video',
      progressOffset + progressRange * 0.2,
      `Generating video: ${scenario.name}...`
    );

    const videoResult = await this.veo3.generateVideoSegment({
      prompt: prompt,
      duration: config.veo3Options.duration || 8,
      aspectRatio: config.veo3Options.aspectRatio || '9:16',
      firstFrame: characterPath,
      quality: config.veo3Options.quality || 'high',
      enableSoundGeneration: config.veo3Options.enableSoundGeneration !== false
    });

    if (!videoResult.success || !videoResult.videos.length) {
      throw new Error(`Failed to generate video: ${videoResult.error}`);
    }

    const videoPath = videoResult.videos[0];

    this.logProgress(
      config,
      'video',
      progressOffset + progressRange * 0.9,
      `Video complete: ${videoPath}`
    );

    return videoPath;
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: unknown): VideoResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ ${this.templateType} Template Error:`, error);

    return {
      success: false,
      videos: [],
      metadata: {
        templateType: this.templateType,
        totalCost: 0,
        duration: 0,
        format: '9:16 vertical',
        videosGenerated: 0
      },
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate total cost
   */
  protected calculateCost(
    characterGenerated: boolean,
    videoCount: number,
    videoDuration: number
  ): number {
    let cost = 0;

    // Character generation cost
    if (characterGenerated) {
      cost += 0.02;
    }

    // Video generation cost ($0.75 per second)
    cost += (videoCount * videoDuration * 0.75);

    return cost;
  }
}
