/**
 * Tests for @smoketech/shared-config
 */

import {
  getCharacterPresets,
  getCharacterPreset,
  getCharacterPresetsByCategory,
  getDefaultCharacterPreset,
  getCharacterCategories,
  getShotTypes,
  getShotType,
  getShotTypesByAspectRatio,
  getShotTypesByPlatform,
  getCommonRequirements,
  validateCharacterPreset,
  validateShotType,
  getCharacterPresetsMetadata,
  getShotTypesMetadata,
  CharacterPreset,
  ShotType
} from './index';

describe('Character Presets', () => {
  describe('getCharacterPresets', () => {
    it('should return an array of character presets', () => {
      const presets = getCharacterPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should return presets with required fields', () => {
      const presets = getCharacterPresets();
      presets.forEach(preset => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('category');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('physicalTemplate');
        expect(preset).toHaveProperty('styleTemplate');
        expect(preset).toHaveProperty('professionalContext');
        expect(preset).toHaveProperty('realismConfig');
      });
    });
  });

  describe('getCharacterPreset', () => {
    it('should return a specific preset by ID', () => {
      const preset = getCharacterPreset('business-executive');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('business-executive');
      expect(preset?.name).toBe('Business Executive');
    });

    it('should return undefined for non-existent preset', () => {
      const preset = getCharacterPreset('non-existent-preset');
      expect(preset).toBeUndefined();
    });
  });

  describe('getCharacterPresetsByCategory', () => {
    it('should return presets filtered by category', () => {
      const businessPresets = getCharacterPresetsByCategory('business');
      expect(Array.isArray(businessPresets)).toBe(true);
      businessPresets.forEach(preset => {
        expect(preset.category).toBe('business');
      });
    });

    it('should return empty array for non-existent category', () => {
      const presets = getCharacterPresetsByCategory('non-existent');
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBe(0);
    });
  });

  describe('getDefaultCharacterPreset', () => {
    it('should return the default preset', () => {
      const preset = getDefaultCharacterPreset();
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('business-executive');
    });
  });

  describe('getCharacterCategories', () => {
    it('should return an array of categories', () => {
      const categories = getCharacterCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('business');
    });
  });

  describe('validateCharacterPreset', () => {
    it('should validate a valid preset', () => {
      const preset = getCharacterPreset('business-executive');
      expect(preset).toBeDefined();
      expect(validateCharacterPreset(preset!)).toBe(true);
    });

    it('should reject invalid preset', () => {
      const invalidPreset = {
        id: 'test',
        name: 'Test'
        // Missing required fields
      };
      expect(validateCharacterPreset(invalidPreset)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validateCharacterPreset(null)).toBe(false);
      expect(validateCharacterPreset(undefined)).toBe(false);
      expect(validateCharacterPreset('string')).toBe(false);
      expect(validateCharacterPreset(123)).toBe(false);
    });
  });
});

describe('Shot Types', () => {
  describe('getShotTypes', () => {
    it('should return an array of shot types', () => {
      const shotTypes = getShotTypes();
      expect(Array.isArray(shotTypes)).toBe(true);
      expect(shotTypes.length).toBeGreaterThan(0);
    });

    it('should return shot types with required fields', () => {
      const shotTypes = getShotTypes();
      shotTypes.forEach(shot => {
        expect(shot).toHaveProperty('id');
        expect(shot).toHaveProperty('name');
        expect(shot).toHaveProperty('description');
        expect(shot).toHaveProperty('aspectRatio');
        expect(shot).toHaveProperty('platform');
        expect(shot).toHaveProperty('useGreenScreen');
        expect(shot).toHaveProperty('promptModifications');
        expect(shot).toHaveProperty('technicalRequirements');
      });
    });
  });

  describe('getShotType', () => {
    it('should return a specific shot type by ID', () => {
      const shotType = getShotType('full-body-standing');
      expect(shotType).toBeDefined();
      expect(shotType?.id).toBe('full-body-standing');
      expect(shotType?.name).toBe('Full Body Standing');
    });

    it('should return undefined for non-existent shot type', () => {
      const shotType = getShotType('non-existent-shot');
      expect(shotType).toBeUndefined();
    });
  });

  describe('getShotTypesByAspectRatio', () => {
    it('should return shot types filtered by aspect ratio', () => {
      const verticalShots = getShotTypesByAspectRatio('9:16');
      expect(Array.isArray(verticalShots)).toBe(true);
      verticalShots.forEach(shot => {
        expect(shot.aspectRatio).toBe('9:16');
      });
    });

    it('should return empty array for non-existent aspect ratio', () => {
      const shots = getShotTypesByAspectRatio('99:99');
      expect(Array.isArray(shots)).toBe(true);
      expect(shots.length).toBe(0);
    });
  });

  describe('getShotTypesByPlatform', () => {
    it('should return shot types filtered by platform', () => {
      const instagramShots = getShotTypesByPlatform('Instagram');
      expect(Array.isArray(instagramShots)).toBe(true);
      expect(instagramShots.length).toBeGreaterThan(0);
      instagramShots.forEach(shot => {
        expect(shot.platform.toLowerCase()).toContain('instagram');
      });
    });

    it('should be case insensitive', () => {
      const shots1 = getShotTypesByPlatform('INSTAGRAM');
      const shots2 = getShotTypesByPlatform('instagram');
      expect(shots1.length).toBe(shots2.length);
    });
  });

  describe('getCommonRequirements', () => {
    it('should return common requirements object', () => {
      const requirements = getCommonRequirements();
      expect(requirements).toBeDefined();
      expect(requirements).toHaveProperty('resolution');
      expect(requirements).toHaveProperty('lighting');
      expect(requirements).toHaveProperty('quality');
      expect(requirements).toHaveProperty('avoidanceList');
      expect(Array.isArray(requirements.avoidanceList)).toBe(true);
    });
  });

  describe('validateShotType', () => {
    it('should validate a valid shot type', () => {
      const shotType = getShotType('full-body-standing');
      expect(shotType).toBeDefined();
      expect(validateShotType(shotType!)).toBe(true);
    });

    it('should reject invalid shot type', () => {
      const invalidShot = {
        id: 'test',
        name: 'Test'
        // Missing required fields
      };
      expect(validateShotType(invalidShot)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validateShotType(null)).toBe(false);
      expect(validateShotType(undefined)).toBe(false);
      expect(validateShotType('string')).toBe(false);
      expect(validateShotType(123)).toBe(false);
    });
  });
});

describe('Metadata', () => {
  describe('getCharacterPresetsMetadata', () => {
    it('should return metadata object', () => {
      const metadata = getCharacterPresetsMetadata();
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('totalPresets');
      expect(metadata).toHaveProperty('categories');
      expect(metadata).toHaveProperty('defaultPreset');
    });

    it('should have correct total presets count', () => {
      const metadata = getCharacterPresetsMetadata();
      const presets = getCharacterPresets();
      expect(metadata.totalPresets).toBe(presets.length);
    });
  });

  describe('getShotTypesMetadata', () => {
    it('should return metadata object', () => {
      const metadata = getShotTypesMetadata();
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('totalShots');
      expect(metadata).toHaveProperty('estimatedCostPerShot');
      expect(metadata).toHaveProperty('estimatedTimePerShot');
    });

    it('should have correct total shots count', () => {
      const metadata = getShotTypesMetadata();
      const shotTypes = getShotTypes();
      expect(metadata.totalShots).toBe(shotTypes.length);
    });
  });
});

describe('Data Integrity', () => {
  it('should have unique preset IDs', () => {
    const presets = getCharacterPresets();
    const ids = presets.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique shot type IDs', () => {
    const shotTypes = getShotTypes();
    const ids = shotTypes.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid age ranges in presets', () => {
    const presets = getCharacterPresets();
    presets.forEach(preset => {
      const [min, max] = preset.physicalTemplate.ageRange;
      expect(min).toBeGreaterThan(0);
      expect(max).toBeGreaterThan(min);
      expect(max).toBeLessThan(100);
    });
  });

  it('should have non-empty arrays where expected', () => {
    const presets = getCharacterPresets();
    presets.forEach(preset => {
      expect(preset.physicalTemplate.genderOptions.length).toBeGreaterThan(0);
      expect(preset.physicalTemplate.styleDescriptors.length).toBeGreaterThan(0);
      expect(preset.styleTemplate.attire.length).toBeGreaterThan(0);
      expect(preset.professionalContext.settings.length).toBeGreaterThan(0);
      expect(preset.professionalContext.messagingThemes.length).toBeGreaterThan(0);
    });
  });
});

describe('Caching', () => {
  it('should return same reference when called multiple times', () => {
    const presets1 = getCharacterPresets();
    const presets2 = getCharacterPresets();
    // Should be using cache
    expect(presets1).toBe(presets2);
  });

  it('should return same reference for shot types when called multiple times', () => {
    const shots1 = getShotTypes();
    const shots2 = getShotTypes();
    // Should be using cache
    expect(shots1).toBe(shots2);
  });
});
