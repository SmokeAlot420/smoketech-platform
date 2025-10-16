'use client';

/**
 * Character Settings Panel
 *
 * Professional right-side panel for selecting characters and generation presets.
 * Replaces the awkward floating dropdowns with a clean, organized interface.
 */

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { OmegaCharacter, CHARACTER_CONFIGS } from './character-selector';
import { OmegaPreset } from './preset-dropdown';
import Link from 'next/link';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: OmegaCharacter;
  onCharacterChange: (character: OmegaCharacter) => void;
  selectedPreset: OmegaPreset;
  onPresetChange: (preset: OmegaPreset) => void;
}

const PRESET_CONFIGS = {
  'quick': {
    id: 'quick' as OmegaPreset,
    name: 'Quick Generation',
    description: 'Fast content for immediate needs',
    icon: '⚡',
    cost: 0.15,
    time: '2 min',
    quality: 'Standard'
  },
  'standard': {
    id: 'standard' as OmegaPreset,
    name: 'Standard Quality',
    description: 'Balanced quality and speed',
    icon: '🎬',
    cost: 0.35,
    time: '4 min',
    quality: 'High'
  },
  'premium': {
    id: 'premium' as OmegaPreset,
    name: 'Premium Production',
    description: 'Professional quality with advanced processing',
    icon: '💎',
    cost: 0.65,
    time: '6 min',
    quality: 'Ultra High'
  },
  'viral': {
    id: 'viral' as OmegaPreset,
    name: 'Viral Optimization',
    description: 'Maximum viral potential with ZHO techniques',
    icon: '🚀',
    cost: 0.95,
    time: '8 min',
    quality: 'Broadcast'
  }
};

export function CharacterPanel({
  isOpen,
  onClose,
  selectedCharacter,
  onCharacterChange,
  selectedPreset,
  onPresetChange
}: CharacterPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-background border-l border-border z-50 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Character Settings</h2>
            <p className="text-sm text-muted-foreground">Choose character and preset</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Characters Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Select Character</h3>
            <div className="space-y-3">
              {(Object.keys(CHARACTER_CONFIGS) as OmegaCharacter[]).map((characterId) => {
                const config = CHARACTER_CONFIGS[characterId];
                const isSelected = selectedCharacter === characterId;

                return (
                  <button
                    key={characterId}
                    onClick={() => onCharacterChange(characterId)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{config.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {config.name}
                          </span>
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {config.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{config.speciality}</span>
                          <span className={`font-medium ${isSelected ? 'text-primary' : 'text-green-600'}`}>
                            {config.personality.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Generation Preset</h3>
            <div className="space-y-3">
              {(Object.keys(PRESET_CONFIGS) as OmegaPreset[]).map((presetId) => {
                const config = PRESET_CONFIGS[presetId];
                const isSelected = selectedPreset === presetId;

                return (
                  <button
                    key={presetId}
                    onClick={() => onPresetChange(presetId)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {config.name}
                          </span>
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {config.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            ${config.cost.toFixed(2)} • {config.time}
                          </span>
                          <span className={`font-medium ${isSelected ? 'text-primary' : 'text-blue-600'}`}>
                            {config.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>

            <Link
              href="/character-library"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Character Library Generator
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Create custom 4-shot libraries
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>

          {/* Info Footer */}
          <div className="bg-accent/50 rounded-lg p-4 text-xs text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">💡 Tip:</strong> Characters determine personality and style. Presets control generation quality and techniques.
            </p>
            <p>
              Your selections are saved automatically.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}