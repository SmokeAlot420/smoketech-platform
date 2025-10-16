import {
  buildVEO3JSONPrompt,
  validateConfig,
  applyPreset,
  mergeWithPreset,
  getAvailablePresets,
  VEO3JSONPrompt,
  ValidationResult
} from '../segmentPromptBuilder';
import { SegmentBuilderConfig, SEGMENT_PRESETS } from '@/types/segmentBuilder';

describe('Segment Prompt Builder Utilities', () => {
  describe('applyPreset', () => {
    it('should load talking_head preset correctly', () => {
      const config = applyPreset('talking_head');

      expect(config).toMatchObject({
        dialogue: '',
        props: [],
        camera: {
          motion: 'static',
          angle: 'eye_level',
          lens: 'portrait_85mm',
          position: 'medium_close_up'
        },
        lighting: {
          mood: 'natural',
          timeOfDay: 'afternoon',
          style: 'window_light'
        },
        character: {
          action: 'speaking',
          expression: 'friendly',
          bodyLanguage: 'confident'
        },
        environment: {
          location: 'modern_office',
          atmosphere: 'professional'
        }
      });
    });

    it('should load product_demo preset correctly', () => {
      const config = applyPreset('product_demo');

      expect(config.camera.motion).toBe('slow_pan');
      expect(config.character.action).toBe('demonstrating');
      expect(config.lighting.style).toBe('three_point');
    });

    it('should load storytelling preset correctly', () => {
      const config = applyPreset('storytelling');

      expect(config.camera.motion).toBe('dolly_in');
      expect(config.camera.angle).toBe('low_angle');
      expect(config.lighting.timeOfDay).toBe('golden_hour');
    });

    it('should load educational preset correctly', () => {
      const config = applyPreset('educational');

      expect(config.lighting.mood).toBe('high_key');
      expect(config.character.bodyLanguage).toBe('authoritative');
      expect(config.environment.location).toBe('conference_room');
    });

    it('should throw error for unknown preset', () => {
      expect(() => applyPreset('unknown_preset' as any)).toThrow('Unknown preset: unknown_preset');
    });

    it('should return deep copy to prevent mutations', () => {
      const config1 = applyPreset('talking_head');
      const config2 = applyPreset('talking_head');

      config1.dialogue = 'Test dialogue';
      config1.props = ['laptop'];

      expect(config2.dialogue).toBe('');
      expect(config2.props).toEqual([]);
    });
  });

  describe('getAvailablePresets', () => {
    it('should return all preset definitions', () => {
      const presets = getAvailablePresets();

      expect(presets).toHaveLength(4);
      expect(presets).toEqual([
        { key: 'talking_head', name: 'Talking Head', description: 'Professional presenter style (ideal for QuoteMoto)' },
        { key: 'product_demo', name: 'Product Demo', description: 'Showcasing product features with props' },
        { key: 'storytelling', name: 'Storytelling', description: 'Narrative-driven with emotional engagement' },
        { key: 'educational', name: 'Educational', description: 'Clear, informative presentation' }
      ]);
    });
  });

  describe('mergeWithPreset', () => {
    it('should merge dialogue override with preset', () => {
      const config = mergeWithPreset('talking_head', {
        dialogue: 'Custom dialogue for QuoteMoto'
      });

      expect(config.dialogue).toBe('Custom dialogue for QuoteMoto');
      expect(config.camera.motion).toBe('static'); // Preset defaults maintained
    });

    it('should merge partial camera settings', () => {
      const config = mergeWithPreset('talking_head', {
        camera: { motion: 'slow_pan' }
      });

      expect(config.camera.motion).toBe('slow_pan');
      expect(config.camera.angle).toBe('eye_level'); // Other camera settings from preset
      expect(config.camera.lens).toBe('portrait_85mm');
    });

    it('should merge multiple setting overrides', () => {
      const config = mergeWithPreset('educational', {
        dialogue: 'Explaining insurance benefits',
        props: ['insurance document', 'calculator'],
        lighting: { mood: 'cinematic' }
      });

      expect(config.dialogue).toBe('Explaining insurance benefits');
      expect(config.props).toEqual(['insurance document', 'calculator']);
      expect(config.lighting.mood).toBe('cinematic');
      expect(config.lighting.timeOfDay).toBe('midday'); // From preset
    });
  });

  describe('buildVEO3JSONPrompt', () => {
    const baseConfig: SegmentBuilderConfig = {
      dialogue: 'Compare 30+ insurers and save up to $500 per year on car insurance.',
      props: [],
      camera: {
        motion: 'static',
        angle: 'eye_level',
        lens: 'portrait_85mm',
        position: 'medium_close_up'
      },
      lighting: {
        mood: 'natural',
        timeOfDay: 'afternoon',
        style: 'window_light'
      },
      character: {
        action: 'speaking',
        expression: 'friendly',
        bodyLanguage: 'confident'
      },
      environment: {
        location: 'modern_office',
        atmosphere: 'professional'
      }
    };

    it('should generate valid VEO3JSONPrompt structure for 8s duration', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt).toHaveProperty('prompt');
      expect(prompt).toHaveProperty('negative_prompt');
      expect(prompt).toHaveProperty('timing');
      expect(prompt).toHaveProperty('config');

      expect(prompt.config.duration_seconds).toBe(8);
      expect(prompt.config.aspect_ratio).toBe('16:9');
      expect(prompt.config.resolution).toBe('1080p');
    });

    it('should include BEGIN instruction for first segment', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.prompt).toContain('BEGIN: Character starts in setting');
    });

    it('should include CONTINUE instruction for non-first segments', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 3, 7, 8);

      expect(prompt.prompt).toContain('CONTINUE from previous segment');
      expect(prompt.prompt).toContain('Maintain exact character positioning');
    });

    it('should split dialogue into timing phases for 8s duration', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.timing).toHaveProperty('0-2s');
      expect(prompt.timing).toHaveProperty('2-6s');
      expect(prompt.timing).toHaveProperty('6-8s');

      expect(typeof prompt.timing['0-2s']).toBe('string');
      expect(typeof prompt.timing['2-6s']).toBe('string');
      expect(typeof prompt.timing['6-8s']).toBe('string');
    });

    it('should convert camera settings to human-readable format', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.config.camera.motion).toBe('Static');
      expect(prompt.config.camera.angle).toBe('Eye Level');
      expect(prompt.config.camera.lens_type).toBe('Portrait 85mm');
      expect(prompt.config.camera.position).toBe('Medium Close-up');
    });

    it('should convert lighting settings correctly', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.config.lighting.mood).toBe('Natural');
      expect(prompt.config.lighting.time_of_day).toBe('Afternoon');
      expect(prompt.config.lighting.enhancement).toBe('Window Light');
    });

    it('should include preservation instructions for non-first segments', () => {
      const promptFirst = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);
      const promptMiddle = buildVEO3JSONPrompt(baseConfig, 3, 7, 8);

      expect(promptFirst.config.character.preservation).toBeUndefined();
      expect(promptMiddle.config.character.preservation).toContain('CRITICAL: Preserve exact facial features');
    });

    it('should handle props in environment interaction elements', () => {
      const configWithProps = {
        ...baseConfig,
        props: ['insurance document', 'pen', 'calculator']
      };

      const prompt = buildVEO3JSONPrompt(configWithProps, 0, 7, 8);

      expect(prompt.config.environment.interaction_elements).toEqual([
        'insurance document',
        'pen',
        'calculator'
      ]);
      expect(prompt.config.audio.sound_effects).toEqual(['Realistic prop interaction sounds']);
    });

    it('should handle 4s duration with adjusted timing phases', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 4);

      expect(prompt.config.duration_seconds).toBe(4);
      expect(prompt.timing).toHaveProperty('0-2s');
      expect(prompt.timing).toHaveProperty('2-6s');
      expect(prompt.timing).toHaveProperty('6-8s');
    });

    it('should handle 6s duration with adjusted timing phases', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 6);

      expect(prompt.config.duration_seconds).toBe(6);
    });

    it('should handle empty dialogue gracefully', () => {
      const configNoDialogue = { ...baseConfig, dialogue: '' };
      const prompt = buildVEO3JSONPrompt(configNoDialogue, 0, 7, 8);

      expect(prompt.prompt).toContain('Character continues naturally');
      expect(prompt.timing['0-2s']).toBe('Character begins speaking naturally');
      expect(prompt.timing['2-6s']).toBe('Character continues with main content');
      expect(prompt.timing['6-8s']).toBe('Character concludes and holds neutral expression');
    });

    it('should not include movements for static camera', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.config.camera.movements).toBeUndefined();
    });

    it('should include movements for non-static camera', () => {
      const configWithMotion = {
        ...baseConfig,
        camera: { ...baseConfig.camera, motion: 'slow_pan' as const }
      };

      const prompt = buildVEO3JSONPrompt(configWithMotion, 0, 7, 8);

      expect(prompt.config.camera.movements).toEqual(['Slow Pan']);
    });

    it('should set lighting consistency for first vs non-first segments', () => {
      const promptFirst = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);
      const promptMiddle = buildVEO3JSONPrompt(baseConfig, 3, 7, 8);

      expect(promptFirst.config.lighting.consistency).toBe('Establish lighting');
      expect(promptMiddle.config.lighting.consistency).toBe('Match previous segment lighting exactly');
    });

    it('should set spatial awareness for first vs non-first segments', () => {
      const promptFirst = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);
      const promptLast = buildVEO3JSONPrompt(baseConfig, 6, 7, 8);

      expect(promptFirst.config.environment.spatial_awareness).toBe('Establish scene geography');
      expect(promptLast.config.environment.spatial_awareness).toBe('Maintain exact spatial positioning from previous segment');
    });

    it('should include negative prompt to avoid quality issues', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.negative_prompt).toBe('blurry, distorted, artificial, plastic skin, unnatural movement, jerky motion, poor lighting');
    });

    it('should include technical quality requirements', () => {
      const prompt = buildVEO3JSONPrompt(baseConfig, 0, 7, 8);

      expect(prompt.config.technical.skin_realism).toBe('Natural skin texture with visible pores, subtle imperfections');
      expect(prompt.config.technical.movement_physics).toBe('Realistic, natural body movement and gestures');
      expect(prompt.config.technical.environmental_integration).toBe('Character naturally integrated into environment lighting and space');
      expect(prompt.config.technical.quality_target).toBe('Professional broadcast quality, photorealistic');
    });
  });

  describe('validateConfig', () => {
    const validConfig: SegmentBuilderConfig = {
      dialogue: 'Save up to $500 per year by comparing 30+ insurers.',
      props: [],
      camera: {
        motion: 'static',
        angle: 'eye_level',
        lens: 'portrait_85mm',
        position: 'medium_close_up'
      },
      lighting: {
        mood: 'natural',
        timeOfDay: 'afternoon',
        style: 'window_light'
      },
      character: {
        action: 'speaking',
        expression: 'friendly',
        bodyLanguage: 'confident'
      },
      environment: {
        location: 'modern_office',
        atmosphere: 'professional'
      }
    };

    it('should validate correct configuration', () => {
      const result = validateConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should error on dialogue exceeding 300 characters', () => {
      const longDialogue = 'A'.repeat(301);
      const config = { ...validConfig, dialogue: longDialogue };

      const result = validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dialogue too long. Keep to 2-3 sentences (~150-250 characters) for 8-second segment.');
    });

    it('should warn on very short dialogue', () => {
      const config = { ...validConfig, dialogue: 'Hello' };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Dialogue seems very short. Consider adding more detail.');
    });

    it('should not warn on empty dialogue', () => {
      const config = { ...validConfig, dialogue: '' };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('should warn on night + high_key lighting combination', () => {
      const config = {
        ...validConfig,
        lighting: { ...validConfig.lighting, timeOfDay: 'night' as const, mood: 'high_key' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('High-key lighting is unusual for night scenes. Consider Natural or Low-key lighting.');
    });

    it('should warn on midday + moody lighting combination', () => {
      const config = {
        ...validConfig,
        lighting: { ...validConfig.lighting, timeOfDay: 'midday' as const, mood: 'moody' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Moody lighting is unusual for midday. Consider Cinematic or Dramatic instead.');
    });

    it('should warn on static extreme_wide combination', () => {
      const config = {
        ...validConfig,
        camera: { ...validConfig.camera, motion: 'static' as const, position: 'extreme_wide' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Static extreme wide shots can feel distant. Consider adding slow pan or using a closer position.');
    });

    it('should warn on excited + formal combination', () => {
      const config = {
        ...validConfig,
        character: { ...validConfig.character, expression: 'excited' as const, bodyLanguage: 'formal' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Excited expression with formal body language may look inconsistent. Consider matching energy levels.');
    });

    it('should accumulate multiple warnings', () => {
      const config = {
        ...validConfig,
        dialogue: 'Hi',
        lighting: { ...validConfig.lighting, timeOfDay: 'night' as const, mood: 'high_key' as const },
        camera: { ...validConfig.camera, motion: 'static' as const, position: 'extreme_wide' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(3);
    });

    it('should handle multiple errors and warnings together', () => {
      const config = {
        ...validConfig,
        dialogue: 'A'.repeat(301),
        lighting: { ...validConfig.lighting, timeOfDay: 'midday' as const, mood: 'moody' as const }
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dialogue with multiple sentences correctly', () => {
      const config = applyPreset('talking_head');
      config.dialogue = 'First sentence. Second sentence! Third sentence?';

      const prompt = buildVEO3JSONPrompt(config, 0, 7, 8);

      expect(prompt.timing['0-2s']).toBeTruthy();
      expect(prompt.timing['2-6s']).toBeTruthy();
      expect(prompt.timing['6-8s']).toBeTruthy();
    });

    it('should handle single sentence dialogue', () => {
      const config = applyPreset('talking_head');
      config.dialogue = 'QuoteMoto saves you money on car insurance.';

      const prompt = buildVEO3JSONPrompt(config, 0, 7, 8);

      expect(prompt.timing['0-2s']).toContain('QuoteMoto');
    });

    it('should handle all camera motion types', () => {
      const motions = ['static', 'slow_pan', 'follow', 'orbit', 'dolly_in', 'dolly_out', 'crane_up', 'crane_down'] as const;

      motions.forEach(motion => {
        const config = applyPreset('talking_head');
        config.camera.motion = motion;

        const prompt = buildVEO3JSONPrompt(config, 0, 7, 8);
        expect(prompt.config.camera.motion).toBeTruthy();
      });
    });

    it('should handle all lighting moods', () => {
      const moods = ['natural', 'cinematic', 'dramatic', 'soft', 'high_key', 'low_key', 'vibrant', 'moody'] as const;

      moods.forEach(mood => {
        const config = applyPreset('talking_head');
        config.lighting.mood = mood;

        const prompt = buildVEO3JSONPrompt(config, 0, 7, 8);
        expect(prompt.config.lighting.mood).toBeTruthy();
      });
    });

    it('should preserve LABELS format by stripping descriptions', () => {
      const config = applyPreset('talking_head');
      const prompt = buildVEO3JSONPrompt(config, 0, 7, 8);

      // Should not contain parenthetical descriptions
      expect(prompt.config.camera.motion).not.toContain('(');
      expect(prompt.config.lighting.mood).not.toContain('(');
      expect(prompt.config.character.action).not.toContain('(');
    });

    it('should handle maximum segment index correctly', () => {
      const config = applyPreset('talking_head');
      config.dialogue = 'Final segment conclusion.';

      const prompt = buildVEO3JSONPrompt(config, 6, 7, 8);

      expect(prompt.prompt).toContain('CONTINUE from previous segment');
      expect(prompt.config.character.preservation).toBeTruthy();
    });

    it('should generate consistent output for same input', () => {
      const config = applyPreset('talking_head');
      config.dialogue = 'Test consistency';

      const prompt1 = buildVEO3JSONPrompt(config, 2, 7, 8);
      const prompt2 = buildVEO3JSONPrompt(config, 2, 7, 8);

      expect(prompt1).toEqual(prompt2);
    });
  });
});
