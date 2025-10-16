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
import { ChevronDown, Sparkles, Zap, User } from "lucide-react";
import { ImageModel, MODEL_CONFIGS, DEFAULT_MODEL, getModelConfig, getModelDisplayName } from "@/lib/model-types";

const MODEL_ICONS = {
  'imagen-3': Zap,
  'imagen-4': Sparkles,
  'nanobana': User,
} as const;

interface ModelSelectorProps {
  selectedModel: ImageModel;
  onModelChange: (model: ImageModel) => void;
  disabled?: boolean;
  showCost?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  showCost = true
}: ModelSelectorProps) {
  const currentConfig = getModelConfig(selectedModel);
  const CurrentIcon = MODEL_ICONS[selectedModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-10 sm:h-8 px-3 font-medium min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-3 h-3" />
            <span className="text-xs">{getModelDisplayName(selectedModel)}</span>
          </div>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px]">
        <DropdownMenuLabel className="text-sm font-medium">
          Choose Image Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(MODEL_CONFIGS) as ImageModel[]).map((modelId) => {
          const config = getModelConfig(modelId);
          const Icon = MODEL_ICONS[modelId];
          const isSelected = selectedModel === modelId;

          return (
            <DropdownMenuItem
              key={modelId}
              onClick={() => onModelChange(modelId)}
              className={`p-3 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`} />
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
                      {config.quality} • {config.speciality}
                    </span>
                    {showCost && (
                      <span className="font-medium text-primary">
                        ${config.cost.toFixed(3)}/img
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ~{config.estimatedTime}s • up to {config.maxImages} images
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          💡 NanoBanana excels at realistic humans, Imagen 4 for general use
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for managing model selection with localStorage persistence
export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ImageModel>(DEFAULT_MODEL);

  useEffect(() => {
    // Load saved model from localStorage
    const savedModel = localStorage.getItem("openjourney-selected-model") as ImageModel;
    if (savedModel && MODEL_CONFIGS[savedModel]) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (model: ImageModel) => {
    setSelectedModel(model);
    localStorage.setItem("openjourney-selected-model", model);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('modelChanged', {
      detail: { model }
    }));
  };

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
  };
}