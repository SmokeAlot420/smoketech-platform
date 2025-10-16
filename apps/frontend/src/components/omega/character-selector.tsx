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
import { ChevronDown, User, Users, Sparkles } from "lucide-react";

export type OmegaCharacter = 'aria' | 'bianca' | 'custom';

interface CharacterConfig {
  id: OmegaCharacter;
  name: string;
  displayName: string;
  description: string;
  speciality: string;
  avatar: string;
  personality: string;
  useCase: string;
}

const CHARACTER_CONFIGS: Record<OmegaCharacter, CharacterConfig> = {
  'aria': {
    id: 'aria',
    name: 'Aria QuoteMoto',
    displayName: 'Aria',
    description: 'Professional insurance advisor specializing in automotive coverage and savings',
    speciality: 'Insurance & Finance',
    avatar: '🚗',
    personality: 'Professional, Trustworthy, Helpful',
    useCase: 'Car insurance, financial advice, professional content'
  },
  'bianca': {
    id: 'bianca',
    name: 'Bianca Wellness',
    displayName: 'Bianca',
    description: 'Fitness instructor and wellness coach focused on healthy lifestyle content',
    speciality: 'Health & Fitness',
    avatar: '💪',
    personality: 'Energetic, Motivational, Caring',
    useCase: 'Fitness content, wellness tips, lifestyle advice'
  },
  'custom': {
    id: 'custom',
    name: 'Custom Character',
    displayName: 'Custom',
    description: 'Create your own character with custom personality and appearance',
    speciality: 'Fully Customizable',
    avatar: '⚡',
    personality: 'Adaptable to your needs',
    useCase: 'Any content type, flexible personality'
  }
};

const CHARACTER_ICONS = {
  'aria': User,
  'bianca': Users,
  'custom': Sparkles,
} as const;

interface CharacterSelectorProps {
  selectedCharacter: OmegaCharacter;
  onCharacterChange: (character: OmegaCharacter) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export function CharacterSelector({
  selectedCharacter,
  onCharacterChange,
  disabled = false,
  showDetails = true
}: CharacterSelectorProps) {
  const currentConfig = CHARACTER_CONFIGS[selectedCharacter];
  const CurrentIcon = CHARACTER_ICONS[selectedCharacter];

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Character</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-10 px-3 font-medium min-w-[140px] justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentConfig.avatar}</span>
              <CurrentIcon className="w-4 h-4" />
              <span className="text-sm">{currentConfig.displayName}</span>
            </div>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-96">
          <DropdownMenuLabel className="text-sm font-medium">
            Choose Character
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {(Object.keys(CHARACTER_CONFIGS) as OmegaCharacter[]).map((characterId) => {
            const config = CHARACTER_CONFIGS[characterId];
            const Icon = CHARACTER_ICONS[characterId];
            const isSelected = selectedCharacter === characterId;

            return (
              <DropdownMenuItem
                key={characterId}
                onClick={() => onCharacterChange(characterId)}
                className={`p-4 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl">{config.avatar}</span>
                    <Icon className={`w-4 h-4 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`} />
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
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {config.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {config.speciality}
                      </span>
                      <span className="font-medium text-green-600">
                        {config.personality}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Best for: {config.useCase}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <div className="p-3 text-xs text-muted-foreground">
            💡 Aria excels at professional content, Bianca for lifestyle, Custom for flexibility
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {currentConfig.speciality} • {currentConfig.personality}
        </div>
      )}
    </div>
  );
}

// Hook for managing character selection with localStorage persistence
export function useCharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState<OmegaCharacter>('aria');

  useEffect(() => {
    // Load saved character from localStorage
    const savedCharacter = localStorage.getItem("smoketech-selected-character") as OmegaCharacter;
    if (savedCharacter && CHARACTER_CONFIGS[savedCharacter]) {
      setSelectedCharacter(savedCharacter);
    }
  }, []);

  const handleCharacterChange = (character: OmegaCharacter) => {
    setSelectedCharacter(character);
    localStorage.setItem("smoketech-selected-character", character);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('characterChanged', {
      detail: { character }
    }));
  };

  return {
    selectedCharacter,
    setSelectedCharacter: handleCharacterChange,
    characterConfig: CHARACTER_CONFIGS[selectedCharacter],
  };
}

export { CHARACTER_CONFIGS };
export type { CharacterConfig };