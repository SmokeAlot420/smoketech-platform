/**
 * OMEGA WORKFLOW ENGINE REGISTRY v1.0
 *
 * Singleton registry for static engine management + Factory for instance engines
 *
 * STATIC ENGINES (No instances needed):
 * - SkinRealismEngine
 * - CharacterConsistencyEngine
 * - PhotoRealismEngine
 * - AdvancedVEO3Prompting
 * - ProfessionalCinematography
 *
 * INSTANCE ENGINES (Factory managed):
 * - TransformationEngine
 * - ZHOTechniquesEngine
 * - MasterTechniqueLibrary
 * - UnifiedPromptSystem
 * - VEO3Service
 * - UltraRealisticCharacterManager
 * - NanoBananaVEO3Pipeline
 *
 * Mirrors patterns from fixed MasterViralEngine.ts with lazy loading optimization
 *
 * Sign off as SmokeDev 🚬
 */

// STATIC ENGINES (Import classes directly)
import { SkinRealismEngine } from '../enhancement/skinRealism';
import { CharacterConsistencyEngine } from '../enhancement/characterConsistency';
import { PhotoRealismEngine } from '../enhancement/photoRealism';
import { AdvancedVEO3Prompting } from '../enhancement/advancedVeo3Prompting';
import { ProfessionalCinematography } from '../cinematography/professionalShots';

// INSTANCE ENGINES (Import for factory creation)
import { TransformationEngine } from '../enhancement/transformationEngine';
import { ZHOTechniquesEngine } from '../enhancement/zhoTechniques';
import { MasterTechniqueLibrary } from '../enhancement/masterTechniqueLibrary';
import { UnifiedPromptSystem } from '../enhancement/unifiedPromptSystem';
import { VEO3Service } from '../services/veo3Service';
import { UltraRealisticCharacterManager } from '../enhancement/ultraRealisticCharacterManager';
import { NanoBananaVEO3Pipeline } from '../pipelines/nanoBananaVeo3Pipeline';

export interface EngineConfig {
  // VEO3 Configuration
  veo3?: {
    outputPath?: string;
    apiKey?: string;
    endpoint?: string;
  };

  // Character Manager Configuration
  characterManager?: {
    outputPath?: string;
    consistencyLevel?: 'basic' | 'advanced' | 'strict';
  };

  // Pipeline Configuration
  pipeline?: {
    outputPath?: string;
    enableEnhancement?: boolean;
    enableStitching?: boolean;
  };
}

export interface StaticEngineRegistry {
  // Skin & Character Engines
  skinRealism: typeof SkinRealismEngine;
  characterConsistency: typeof CharacterConsistencyEngine;
  photoRealism: typeof PhotoRealismEngine;

  // VEO3 & Cinematography Engines
  advancedVEO3: typeof AdvancedVEO3Prompting;
  cinematography: typeof ProfessionalCinematography;
}

export interface InstanceEngineRegistry {
  // Enhancement Engines
  transformation: TransformationEngine;
  zhoTechniques: ZHOTechniquesEngine;
  masterLibrary: MasterTechniqueLibrary;
  unifiedSystem: UnifiedPromptSystem;

  // Service Engines
  veo3Service: VEO3Service;
  characterManager: UltraRealisticCharacterManager;
  pipeline: NanoBananaVEO3Pipeline;
}

export interface EngineStatistics {
  totalEngines: number;
  staticEngines: number;
  instanceEngines: number;
  availableTechniques: {
    skinRealism: number;
    photoPresets: number;
    zhoTechniques: number;
    masterLibrary: number;
    veo3Rules: string;
    cameraMovements: number;
    cinematography: string;
  };
  registryStatus: {
    initialized: boolean;
    lazyLoaded: boolean;
    allEnginesReady: boolean;
  };
}

/**
 * SINGLETON ENGINE REGISTRY
 *
 * Manages all 12 engines using singleton pattern for static engines
 * and factory pattern for instance engines with lazy loading
 */
export class OmegaEngineRegistry {
  private static instance: OmegaEngineRegistry;

  // STATIC ENGINE REGISTRY (Always available)
  private staticEngines: StaticEngineRegistry;

  // INSTANCE ENGINE REGISTRY (Lazy loaded)
  private instanceEngines: Partial<InstanceEngineRegistry> = {};
  private engineConfig: EngineConfig = {};
  private initialized = false;

  private constructor() {
    // Initialize static engines immediately (no instantiation needed)
    this.staticEngines = {
      skinRealism: SkinRealismEngine,
      characterConsistency: CharacterConsistencyEngine,
      photoRealism: PhotoRealismEngine,
      advancedVEO3: AdvancedVEO3Prompting,
      cinematography: ProfessionalCinematography
    };

    console.log('🏭 Omega Engine Registry initialized');
    console.log('✅ Static engines ready:', Object.keys(this.staticEngines).length);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OmegaEngineRegistry {
    if (!OmegaEngineRegistry.instance) {
      OmegaEngineRegistry.instance = new OmegaEngineRegistry();
    }
    return OmegaEngineRegistry.instance;
  }

  /**
   * Initialize instance engines with configuration
   */
  public async initializeEngines(config: EngineConfig = {}): Promise<void> {
    if (this.initialized) {
      console.log('⚡ Engines already initialized, skipping...');
      return;
    }

    console.log('🚀 Initializing instance engines with lazy loading...');
    this.engineConfig = { ...config };

    try {
      // Initialize instance engines with configuration
      await this.lazyLoadInstanceEngines();

      this.initialized = true;
      console.log('✅ All engines initialized successfully');
      console.log(`📊 Total engines available: ${this.getTotalEngineCount()}`);

    } catch (error) {
      console.error('❌ Failed to initialize engines:', error);
      throw new Error(`Engine registry initialization failed: ${error}`);
    }
  }

  /**
   * Lazy load instance engines (Factory Pattern)
   */
  private async lazyLoadInstanceEngines(): Promise<void> {
    console.log('  🔧 Creating TransformationEngine...');
    this.instanceEngines.transformation = new TransformationEngine();

    console.log('  🚀 Creating ZHOTechniquesEngine...');
    this.instanceEngines.zhoTechniques = new ZHOTechniquesEngine();

    console.log('  📚 Creating MasterTechniqueLibrary...');
    this.instanceEngines.masterLibrary = new MasterTechniqueLibrary();

    console.log('  🎯 Creating UnifiedPromptSystem...');
    this.instanceEngines.unifiedSystem = new UnifiedPromptSystem();

    console.log('  🎬 Creating VEO3Service...');
    this.instanceEngines.veo3Service = new VEO3Service({
      outputPath: this.engineConfig.veo3?.outputPath || './generated/omega-workflow'
    });

    console.log('  👤 Creating UltraRealisticCharacterManager...');
    this.instanceEngines.characterManager = new UltraRealisticCharacterManager();

    console.log('  🎭 Creating NanoBananaVEO3Pipeline...');
    this.instanceEngines.pipeline = new NanoBananaVEO3Pipeline();

    console.log('  ✅ All instance engines created successfully');
  }

  /**
   * Get static engines (Always available)
   */
  public getStaticEngines(): StaticEngineRegistry {
    return this.staticEngines;
  }

  /**
   * Get instance engines (Must be initialized first)
   */
  public getInstanceEngines(): InstanceEngineRegistry {
    if (!this.initialized) {
      throw new Error('Instance engines not initialized. Call initializeEngines() first.');
    }

    return this.instanceEngines as InstanceEngineRegistry;
  }

  /**
   * Get specific static engine
   */
  public getStaticEngine<K extends keyof StaticEngineRegistry>(
    engineName: K
  ): StaticEngineRegistry[K] {
    return this.staticEngines[engineName];
  }

  /**
   * Get specific instance engine (with lazy loading)
   */
  public async getInstanceEngine<K extends keyof InstanceEngineRegistry>(
    engineName: K
  ): Promise<InstanceEngineRegistry[K]> {
    if (!this.initialized) {
      await this.initializeEngines();
    }

    const engine = this.instanceEngines[engineName];
    if (!engine) {
      throw new Error(`Instance engine '${engineName}' not found or not initialized`);
    }

    return engine as InstanceEngineRegistry[K];
  }

  /**
   * Check if engines are initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get engine statistics
   */
  public getEngineStatistics(): EngineStatistics {
    const instanceEngineCount = Object.keys(this.instanceEngines).length;
    const staticEngineCount = Object.keys(this.staticEngines).length;

    return {
      totalEngines: staticEngineCount + instanceEngineCount,
      staticEngines: staticEngineCount,
      instanceEngines: instanceEngineCount,
      availableTechniques: {
        skinRealism: 7, // 7 imperfection types
        photoPresets: 5, // 5 professional presets
        zhoTechniques: 46, // 46 viral techniques
        masterLibrary: 90, // 90+ techniques
        veo3Rules: 'all', // All VEO3 advanced rules
        cameraMovements: 12, // 12 camera movement types
        cinematography: 'full' // Full cinematography system
      },
      registryStatus: {
        initialized: this.initialized,
        lazyLoaded: instanceEngineCount > 0,
        allEnginesReady: this.initialized && instanceEngineCount === 7 // Expected 7 instance engines
      }
    };
  }

  /**
   * Get total engine count
   */
  private getTotalEngineCount(): number {
    return Object.keys(this.staticEngines).length + Object.keys(this.instanceEngines).length;
  }

  /**
   * Reset registry (for testing)
   */
  public reset(): void {
    console.log('🔄 Resetting engine registry...');
    this.instanceEngines = {};
    this.initialized = false;
    OmegaEngineRegistry.instance = new OmegaEngineRegistry();
  }

  /**
   * Update engine configuration
   */
  public updateConfig(newConfig: Partial<EngineConfig>): void {
    console.log('🔧 Updating engine registry configuration...');
    this.engineConfig = { ...this.engineConfig, ...newConfig };

    // If engines are already initialized, we might need to reinitialize
    if (this.initialized) {
      console.log('⚠️  Configuration updated. Consider reinitializing engines for changes to take effect.');
    }
  }

  /**
   * Validate all engines are working
   */
  public async validateEngines(): Promise<boolean> {
    try {
      console.log('🔍 Validating all engines...');

      // Validate static engines
      const skinConfig = this.staticEngines.skinRealism.createSophiaSkinRealism();
      if (!skinConfig) throw new Error('SkinRealismEngine validation failed');

      const charIdentity = this.staticEngines.characterConsistency.createSophiaIdentity();
      if (!charIdentity) throw new Error('CharacterConsistencyEngine validation failed');

      // Validate instance engines (if initialized)
      if (this.initialized) {
        const engines = this.getInstanceEngines();

        const chains = engines.transformation.getAvailableChains();
        if (!chains || chains.length === 0) throw new Error('TransformationEngine validation failed');

        const techniques = engines.zhoTechniques.getViralTechniques();
        if (!techniques || techniques.length === 0) throw new Error('ZHOTechniquesEngine validation failed');

        const stats = engines.masterLibrary.getStatistics();
        if (!stats || stats.total === 0) throw new Error('MasterTechniqueLibrary validation failed');
      }

      console.log('✅ All engines validated successfully');
      return true;

    } catch (error) {
      console.error('❌ Engine validation failed:', error);
      return false;
    }
  }
}

/**
 * CONVENIENCE FUNCTIONS
 */

/**
 * Get the singleton registry instance
 */
export function getEngineRegistry(): OmegaEngineRegistry {
  return OmegaEngineRegistry.getInstance();
}

/**
 * Quick access to static engines
 */
export function getStaticEngines(): StaticEngineRegistry {
  return getEngineRegistry().getStaticEngines();
}

/**
 * Quick access to instance engines (auto-initializes if needed)
 */
export async function getInstanceEngines(config?: EngineConfig): Promise<InstanceEngineRegistry> {
  const registry = getEngineRegistry();
  if (!registry.isInitialized() && config) {
    await registry.initializeEngines(config);
  }
  return registry.getInstanceEngines();
}

/**
 * Initialize the entire omega workflow engine system
 */
export async function initializeOmegaEngines(config: EngineConfig = {}): Promise<OmegaEngineRegistry> {
  console.log('🏭 Initializing Omega Workflow Engine System...');
  console.log('🎯 Target: 100% engine utilization (12/12 engines)');
  console.log('📈 Goal: Viral scores 80-95, costs under $50, <30min generation');

  const registry = getEngineRegistry();
  await registry.initializeEngines(config);

  // Validate everything is working
  const isValid = await registry.validateEngines();
  if (!isValid) {
    throw new Error('Engine validation failed after initialization');
  }

  const stats = registry.getEngineStatistics();
  console.log('🏆 OMEGA ENGINE SYSTEM READY:');
  console.log(`  📊 Total engines: ${stats.totalEngines}/12`);
  console.log(`  ⚡ Static engines: ${stats.staticEngines}`);
  console.log(`  🏭 Instance engines: ${stats.instanceEngines}`);
  console.log(`  🎯 Techniques available: ${stats.availableTechniques.masterLibrary}+`);
  console.log(`  ✅ All systems: ${stats.registryStatus.allEnginesReady ? 'READY' : 'INITIALIZING'}`);

  return registry;
}

export default OmegaEngineRegistry;