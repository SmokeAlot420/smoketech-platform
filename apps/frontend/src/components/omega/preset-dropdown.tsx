"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, DollarSign, Zap, Video, Sparkles } from "lucide-react";

export type OmegaPreset = 'quick' | 'standard' | 'premium' | 'viral';

interface PresetConfig {
  id: OmegaPreset;
  name: string;
  description: string;
  cost: number;
  estimatedTime: number; // in seconds
  quality: string;
  features: string[];
  icon: string;
  videoLength: number; // in seconds
  segments: number;
  transitions: boolean;
  audioEnhancement: boolean;
  viralOptimization: boolean;
}

const PRESET_CONFIGS: Record<OmegaPreset, PresetConfig> = {
  'quick': {
    id: 'quick',
    name: 'Quick Generation',
    description: 'Fast content for immediate needs - basic quality with minimal processing',
    cost: 0.15,
    estimatedTime: 120, // 2 minutes
    quality: 'Standard',
    features: ['Single segment', 'Basic quality', 'Fast delivery'],
    icon: '⚡',
    videoLength: 15,
    segments: 1,
    transitions: false,
    audioEnhancement: false,
    viralOptimization: false
  },
  'standard': {
    id: 'standard',
    name: 'Standard Quality',
    description: 'Balanced quality and speed - good for most content creation needs',
    cost: 0.35,
    estimatedTime: 240, // 4 minutes
    quality: 'High',
    features: ['Multi-segment', 'Enhanced quality', 'Basic transitions'],
    icon: '🎬',
    videoLength: 30,
    segments: 3,
    transitions: true,
    audioEnhancement: true,
    viralOptimization: false
  },
  'premium': {
    id: 'premium',
    name: 'Premium Production',
    description: 'Professional quality with advanced processing and optimization',
    cost: 0.65,
    estimatedTime: 360, // 6 minutes
    quality: 'Ultra High',
    features: ['Advanced segments', 'Professional quality', 'Enhanced audio'],
    icon: '💎',
    videoLength: 45,
    segments: 5,
    transitions: true,
    audioEnhancement: true,
    viralOptimization: true
  },
  'viral': {
    id: 'viral',
    name: 'Viral Optimization',
    description: 'Maximum viral potential with advanced AI techniques and platform optimization',
    cost: 0.95,
    estimatedTime: 480, // 8 minutes
    quality: 'Broadcast',
    features: ['ZHO techniques', 'Platform optimization', 'Viral analysis'],
    icon: '🚀',
    videoLength: 60,
    segments: 7,
    transitions: true,
    audioEnhancement: true,
    viralOptimization: true
  }
};

const PRESET_ICONS = {
  'quick': Zap,
  'standard': Video,
  'premium': Sparkles,
  'viral': () => <span className="text-lg">🚀</span>,
} as const;

interface PresetDropdownProps {
  selectedPreset: OmegaPreset;
  onPresetChange: (preset: OmegaPreset) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export function PresetDropdown({
  selectedPreset,
  onPresetChange,
  disabled = false,
  showDetails = true
}: PresetDropdownProps) {
  const currentConfig = PRESET_CONFIGS[selectedPreset];
  const CurrentIcon = PRESET_ICONS[selectedPreset];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Generation Preset</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-10 px-3 font-medium min-w-[160px] justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentConfig.icon}</span>
              {typeof CurrentIcon === 'function' ? (
                <CurrentIcon />
              ) : (
                <CurrentIcon className="w-4 h-4" />
              )}
              <span className="text-sm">{currentConfig.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[420px]">
          <DropdownMenuLabel className="text-sm font-medium">
            Choose Generation Preset
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {(Object.keys(PRESET_CONFIGS) as OmegaPreset[]).map((presetId) => {
            const config = PRESET_CONFIGS[presetId];
            const Icon = PRESET_ICONS[presetId];
            const isSelected = selectedPreset === presetId;

            return (
              <DropdownMenuItem
                key={presetId}
                onClick={() => onPresetChange(presetId)}
                className={`p-4 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl">{config.icon}</span>
                    {typeof Icon === 'function' ? (
                      <Icon />
                    ) : (
                      <Icon className={`w-4 h-4 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {config.name}
                      </span>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {config.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {config.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="font-medium text-green-600">
                          ${config.cost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-600">
                          {formatTime(config.estimatedTime)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Quality: {config.quality}
                      </div>
                      <div className="text-muted-foreground">
                        Length: {config.videoLength}s
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <div className="p-3 text-xs text-muted-foreground">
            💡 Quick for speed, Standard for balance, Premium for quality, Viral for maximum reach
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDetails && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span>${currentConfig.cost.toFixed(2)} • {currentConfig.quality}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>{formatTime(currentConfig.estimatedTime)} • {currentConfig.videoLength}s</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing preset selection with localStorage persistence
export function usePresetSelection() {
  const [selectedPreset, setSelectedPreset] = useState<OmegaPreset>('standard');

  useEffect(() => {
    // Load saved preset from localStorage
    const savedPreset = localStorage.getItem("smoketech-selected-preset") as OmegaPreset;
    if (savedPreset && PRESET_CONFIGS[savedPreset]) {
      setSelectedPreset(savedPreset);
    }
  }, []);

  const handlePresetChange = (preset: OmegaPreset) => {
    setSelectedPreset(preset);
    localStorage.setItem("smoketech-selected-preset", preset);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('presetChanged', {
      detail: { preset }
    }));
  };

  return {
    selectedPreset,
    setSelectedPreset: handlePresetChange,
    presetConfig: PRESET_CONFIGS[selectedPreset],
  };
}

export { PRESET_CONFIGS };
export type { PresetConfig };