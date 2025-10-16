/**
 * @smoketech/shared-config
 *
 * Shared configuration and presets for SmokeTech video generation system
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CharacterPreset,
  CharacterPresetsData,
  ShotType,
  ShotTypesData,
} from './types';

// Export types
export * from './types';

// Lazy-loaded configuration data
let characterPresetsCache: CharacterPresetsData | null = null;
let shotTypesCache: ShotTypesData | null = null;

/**
 * Load character presets from JSON file
 */
function loadCharacterPresets(): CharacterPresetsData {
  if (!characterPresetsCache) {
    const configPath = path.join(__dirname, 'config', 'character-presets.json');
    const rawData = fs.readFileSync(configPath, 'utf-8');
    characterPresetsCache = JSON.parse(rawData) as CharacterPresetsData;
  }
  return characterPresetsCache as CharacterPresetsData;
}

/**
 * Load shot types from JSON file
 */
function loadShotTypes(): ShotTypesData {
  if (!shotTypesCache) {
    const configPath = path.join(__dirname, 'config', 'shot-types-config.json');
    const rawData = fs.readFileSync(configPath, 'utf-8');
    shotTypesCache = JSON.parse(rawData) as ShotTypesData;
  }
  return shotTypesCache as ShotTypesData;
}

/**
 * Get all character presets
 */
export function getCharacterPresets(): CharacterPreset[] {
  const data = loadCharacterPresets();
  return data.presets;
}

/**
 * Get a specific character preset by ID
 */
export function getCharacterPreset(id: string): CharacterPreset | undefined {
  const presets = getCharacterPresets();
  return presets.find(preset => preset.id === id);
}

/**
 * Get character presets by category
 */
export function getCharacterPresetsByCategory(category: string): CharacterPreset[] {
  const presets = getCharacterPresets();
  return presets.filter(preset => preset.category === category);
}

/**
 * Get the default character preset
 */
export function getDefaultCharacterPreset(): CharacterPreset | undefined {
  const data = loadCharacterPresets();
  return getCharacterPreset(data.metadata.defaultPreset);
}

/**
 * Get all available categories
 */
export function getCharacterCategories(): string[] {
  const data = loadCharacterPresets();
  return data.metadata.categories;
}

/**
 * Get all shot types
 */
export function getShotTypes(): ShotType[] {
  const data = loadShotTypes();
  return data.shotTypes;
}

/**
 * Get a specific shot type by ID
 */
export function getShotType(id: string): ShotType | undefined {
  const shotTypes = getShotTypes();
  return shotTypes.find(shot => shot.id === id);
}

/**
 * Get shot types by aspect ratio
 */
export function getShotTypesByAspectRatio(aspectRatio: string): ShotType[] {
  const shotTypes = getShotTypes();
  return shotTypes.filter(shot => shot.aspectRatio === aspectRatio);
}

/**
 * Get shot types by platform
 */
export function getShotTypesByPlatform(platform: string): ShotType[] {
  const shotTypes = getShotTypes();
  return shotTypes.filter(shot =>
    shot.platform.toLowerCase().includes(platform.toLowerCase())
  );
}

/**
 * Get common requirements for shot types
 */
export function getCommonRequirements() {
  const data = loadShotTypes();
  return data.commonRequirements;
}

/**
 * Validate character preset structure
 */
export function validateCharacterPreset(preset: any): preset is CharacterPreset {
  return (
    preset !== null &&
    preset !== undefined &&
    typeof preset === 'object' &&
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    typeof preset.category === 'string' &&
    typeof preset.description === 'string' &&
    preset.physicalTemplate !== undefined &&
    preset.styleTemplate !== undefined &&
    preset.professionalContext !== undefined &&
    preset.realismConfig !== undefined
  );
}

/**
 * Validate shot type structure
 */
export function validateShotType(shotType: any): shotType is ShotType {
  return (
    shotType !== null &&
    shotType !== undefined &&
    typeof shotType === 'object' &&
    typeof shotType.id === 'string' &&
    typeof shotType.name === 'string' &&
    typeof shotType.description === 'string' &&
    typeof shotType.aspectRatio === 'string' &&
    typeof shotType.platform === 'string' &&
    typeof shotType.useGreenScreen === 'boolean' &&
    typeof shotType.promptModifications === 'string' &&
    shotType.technicalRequirements !== undefined
  );
}

/**
 * Get configuration metadata
 */
export function getCharacterPresetsMetadata() {
  const data = loadCharacterPresets();
  return data.metadata;
}

/**
 * Get shot types metadata
 */
export function getShotTypesMetadata() {
  const data = loadShotTypes();
  return data.metadata;
}
