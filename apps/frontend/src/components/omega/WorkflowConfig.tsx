'use client';

/**
 * Workflow Configuration Component
 *
 * Configures parameters for video generation templates:
 * - Character settings
 * - Scenario descriptions
 * - Advanced VEO3 options
 */

import React, { useState } from 'react';
import { TemplateType } from './TemplateSelector';

export interface WorkflowConfiguration {
  templateType: TemplateType;
  character?: {
    prompt: string;
    temperature: number;
    imagePath?: string;
  };
  scenarios: Array<{
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
  }>;
  assetConfig?: {
    assetPrompt: string;
    assetType: string;
    temperature: number;
  };
  veo3Options: {
    duration: 4 | 6 | 8;
    aspectRatio: '16:9' | '9:16' | '1:1';
    quality: 'standard' | 'high';
    enableSoundGeneration: boolean;
    cameraPreset?: string;
    lightingPreset?: string;
  };
}

interface WorkflowConfigProps {
  templateType: TemplateType;
  value: WorkflowConfiguration;
  onChange: (config: WorkflowConfiguration) => void;
}

export default function WorkflowConfig({ templateType, value, onChange }: WorkflowConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const needsCharacter = templateType === 'single' || templateType === 'series';
  const needsAsset = templateType === 'asset-animation';
  const scenarioCount = templateType === 'series' ? 3 : 1;

  const updateScenario = (index: number, field: string, fieldValue: any) => {
    const updatedScenarios = [...value.scenarios];
    updatedScenarios[index] = {
      ...updatedScenarios[index],
      [field]: fieldValue
    };
    onChange({ ...value, scenarios: updatedScenarios });
  };

  return (
    <div className="space-y-6">
      {/* Character Configuration */}
      {needsCharacter && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👤 Character Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Prompt
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Professional contractor, 35 years old, natural lighting..."
                value={value.character?.prompt || ''}
                onChange={(e) => onChange({
                  ...value,
                  character: { ...value.character!, prompt: e.target.value }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={value.character?.temperature || 0.3}
                onChange={(e) => onChange({
                  ...value,
                  character: { ...value.character!, temperature: parseFloat(e.target.value) }
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower = more consistent, Higher = more creative
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Asset Configuration */}
      {needsAsset && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📐 Asset Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="blueprint, diagram, product..."
                value={value.assetConfig?.assetType || ''}
                onChange={(e) => onChange({
                  ...value,
                  assetConfig: { ...value.assetConfig!, assetType: e.target.value }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Prompt
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Professional construction blueprint with clean layout..."
                value={value.assetConfig?.assetPrompt || ''}
                onChange={(e) => onChange({
                  ...value,
                  assetConfig: { ...value.assetConfig!, assetPrompt: e.target.value }
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scenario Configuration */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎬 Scenario{scenarioCount > 1 ? 's' : ''} ({scenarioCount})
        </h3>

        {value.scenarios.slice(0, scenarioCount).map((scenario, index) => (
          <div key={index} className="mb-6 last:mb-0 p-4 bg-white rounded border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">
              Scenario {index + 1}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Video title..."
                  value={scenario.name}
                  onChange={(e) => updateScenario(index, 'name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Prompt
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the video content..."
                  value={scenario.mainPrompt}
                  onChange={(e) => updateScenario(index, 'mainPrompt', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VEO3 Options */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ⚙️ VEO3 Options
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={value.veo3Options.duration}
              onChange={(e) => onChange({
                ...value,
                veo3Options: { ...value.veo3Options, duration: parseInt(e.target.value) as 4 | 6 | 8 }
              })}
            >
              <option value={4}>4 seconds</option>
              <option value={6}>6 seconds</option>
              <option value={8}>8 seconds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={value.veo3Options.aspectRatio}
              onChange={(e) => onChange({
                ...value,
                veo3Options: { ...value.veo3Options, aspectRatio: e.target.value as '16:9' | '9:16' | '1:1' }
              })}
            >
              <option value="9:16">9:16 (Vertical)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sound"
                checked={value.veo3Options.enableSoundGeneration}
                onChange={(e) => onChange({
                  ...value,
                  veo3Options: { ...value.veo3Options, enableSoundGeneration: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sound" className="ml-2 text-sm text-gray-700">
                Enable Sound Generation
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
