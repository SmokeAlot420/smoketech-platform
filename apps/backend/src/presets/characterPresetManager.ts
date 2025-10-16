/**
 * Character Preset Manager
 *
 * Handles loading, validation, and management of character generation presets.
 * Provides type-safe access to preset configurations.
 *
 * Now uses @smoketech/shared-config package for configuration data.
 */

import {
  getCharacterPresets,
  getCharacterPresetsMetadata,
  getShotTypes,
  getShotTypesMetadata,
  getCommonRequirements,
  CharacterPreset as SharedCharacterPreset,
  ShotType as SharedShotType
} from '@smoketech/shared-config';
import {
  CharacterPreset,
  CharacterPresetsConfig,
  ShotTypesConfig,
  ShotTypeConfig,
  PresetManager
} from './characterPresetTypes';

export class CharacterPresetManager implements PresetManager {
  private presetsCache: CharacterPresetsConfig | null = null;
  private shotTypesCache: ShotTypesConfig | null = null;

  constructor(configBasePath?: string) {
    // configBasePath is now ignored - using shared-config package
    // Kept for backward compatibility
  }

  /**
   * Load all character presets from shared configuration
   */
  async loadPresets(): Promise<CharacterPresetsConfig> {
    if (this.presetsCache) {
      return this.presetsCache;
    }

    try {
      const presets = getCharacterPresets() as any[];
      const metadata = getCharacterPresetsMetadata();

      // Validate configuration structure
      if (!presets || !Array.isArray(presets)) {
        throw new Error('Invalid presets configuration: missing or invalid presets array');
      }

      this.presetsCache = {
        presets,
        metadata
      };
      return this.presetsCache;
    } catch (error) {
      throw new Error(`Failed to load character presets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load shot types configuration from shared configuration
   */
  async loadShotTypes(): Promise<ShotTypesConfig> {
    if (this.shotTypesCache) {
      return this.shotTypesCache;
    }

    try {
      const shotTypes = getShotTypes() as any[];
      const metadata = getShotTypesMetadata();
      const commonRequirements = getCommonRequirements();

      if (!shotTypes || !Array.isArray(shotTypes)) {
        throw new Error('Invalid shot types configuration: missing or invalid shotTypes array');
      }

      this.shotTypesCache = {
        shotTypes,
        commonRequirements,
        metadata
      };
      return this.shotTypesCache;
    } catch (error) {
      throw new Error(`Failed to load shot types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific preset by ID
   */
  async getPreset(presetId: string): Promise<CharacterPreset | null> {
    const config = await this.loadPresets();
    const preset = config.presets.find(p => p.id === presetId);
    return preset || null;
  }

  /**
   * List all presets, optionally filtered by category
   */
  async listPresets(category?: string): Promise<CharacterPreset[]> {
    const config = await this.loadPresets();

    if (category) {
      return config.presets.filter(p => p.category === category);
    }

    return config.presets;
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    const config = await this.loadPresets();
    return config.metadata.categories;
  }

  /**
   * Validate preset structure
   */
  validatePreset(preset: CharacterPreset): boolean {
    try {
      // Check required fields
      if (!preset.id || !preset.name || !preset.category) {
        return false;
      }

      // Check physical template
      if (!preset.physicalTemplate ||
          !preset.physicalTemplate.ageRange ||
          preset.physicalTemplate.ageRange.length !== 2) {
        return false;
      }

      // Check style template
      if (!preset.styleTemplate || !preset.styleTemplate.attire) {
        return false;
      }

      // Check professional context
      if (!preset.professionalContext || !preset.professionalContext.defaultProfession) {
        return false;
      }

      // Check realism config
      if (preset.realismConfig === undefined) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Export a preset as JSON
   */
  async exportPreset(presetId: string): Promise<CharacterPreset> {
    const preset = await this.getPreset(presetId);

    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }

    return preset;
  }

  /**
   * Get shot type by ID
   */
  async getShotType(shotTypeId: string): Promise<ShotTypeConfig | null> {
    const config = await this.loadShotTypes();
    const shotType = config.shotTypes.find(st => st.id === shotTypeId);
    return shotType || null;
  }

  /**
   * Get all shot types
   */
  async getAllShotTypes(): Promise<ShotTypeConfig[]> {
    const config = await this.loadShotTypes();
    return config.shotTypes;
  }

  /**
   * Get shot types for specific platform
   */
  async getShotTypesForPlatform(platform: string): Promise<ShotTypeConfig[]> {
    const config = await this.loadShotTypes();
    return config.shotTypes.filter(st =>
      st.platform.toLowerCase().includes(platform.toLowerCase())
    );
  }

  /**
   * Get cost estimate for generation
   */
  async getGenerationCosts(shotCount: number): Promise<{ perShot: number; total: number }> {
    const config = await this.loadShotTypes();
    const perShot = config.metadata.estimatedCostPerShot;
    return {
      perShot,
      total: perShot * shotCount
    };
  }

  /**
   * Get time estimate for generation
   */
  async getGenerationTime(shotCount: number): Promise<number> {
    const config = await this.loadShotTypes();
    const perShot = config.metadata.estimatedTimePerShot;
    const pauseTime = 3; // 3 seconds between shots
    return (perShot * shotCount) + (pauseTime * (shotCount - 1));
  }

  /**
   * Get avoidance list for realistic rendering
   */
  async getAvoidanceList(): Promise<string[]> {
    const config = await this.loadShotTypes();
    return config.commonRequirements.avoidanceList;
  }

  /**
   * Clear cache (useful for testing or config reloading)
   */
  clearCache(): void {
    this.presetsCache = null;
    this.shotTypesCache = null;
  }

  /**
   * Get preset statistics
   */
  async getStatistics(): Promise<{
    totalPresets: number;
    presetsByCategory: Record<string, number>;
    categories: string[];
    totalShotTypes: number;
    averageGenerationCost: number;
    averageGenerationTime: number;
  }> {
    const presetsConfig = await this.loadPresets();
    const shotTypesConfig = await this.loadShotTypes();

    const presetsByCategory: Record<string, number> = {};
    presetsConfig.presets.forEach(preset => {
      presetsByCategory[preset.category] = (presetsByCategory[preset.category] || 0) + 1;
    });

    const shotCount = shotTypesConfig.shotTypes.length;
    const costs = await this.getGenerationCosts(shotCount);
    const time = await this.getGenerationTime(shotCount);

    return {
      totalPresets: presetsConfig.metadata.totalPresets,
      presetsByCategory,
      categories: presetsConfig.metadata.categories,
      totalShotTypes: shotCount,
      averageGenerationCost: costs.total,
      averageGenerationTime: time
    };
  }
}

// Export singleton instance
export const presetManager = new CharacterPresetManager();