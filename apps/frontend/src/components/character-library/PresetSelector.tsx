'use client';

/**
 * Preset Selector Component
 *
 * Displays available character presets in a visual grid with icons and descriptions.
 * Allows users to select a preset template for character generation.
 */

import React, { useState, useEffect } from 'react';

interface CharacterPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

interface PresetSelectorProps {
  onPresetSelect: (presetId: string) => void;
  selectedPresetId?: string;
}

export default function PresetSelector({ onPresetSelect, selectedPresetId }: PresetSelectorProps) {
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch presets from API
      const response = await fetch('/api/character-library/presets');

      if (!response.ok) {
        throw new Error('Failed to load character presets');
      }

      const data = await response.json();
      setPresets(data.presets);
    } catch (err) {
      console.error('Error loading presets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading character presets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-800 font-semibold">Error loading presets</p>
        <p className="mt-2 text-red-600 text-sm">{error}</p>
        <button
          onClick={loadPresets}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose a Character Preset
        </h2>
        <p className="text-gray-600">
          Select a professional template to start generating your character library
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => {
          const isSelected = preset.id === selectedPresetId;

          return (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 text-left
                hover:shadow-lg hover:scale-105
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-400'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center mb-4">
                <div className={`
                  text-4xl mr-3 p-3 rounded-lg
                  ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  {preset.icon}
                </div>
                <div>
                  <h3 className={`
                    text-lg font-bold
                    ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {preset.name}
                  </h3>
                  <span className={`
                    text-xs uppercase font-semibold
                    ${isSelected ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {preset.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`
                text-sm leading-relaxed
                ${isSelected ? 'text-blue-800' : 'text-gray-600'}
              `}>
                {preset.description}
              </p>

              {/* Selected badge */}
              {isSelected && (
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-blue-600">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {presets.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>No character presets available</p>
        </div>
      )}
    </div>
  );
}