"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles, Video, Film, PlayCircle, Clock, Link, Zap } from "lucide-react";
import { VideoModel, videoModels, VideoModelConfig } from "@/lib/video-model-types";

const VIDEO_MODEL_ICONS = {
  'veo-3.0-fast': Zap,
  'veo-3.0-json': Sparkles,
  'veo-3.0': Video,
  'veo-2.0-json': Film,
  'veo-2.0': PlayCircle,
  'veo-3.0-long': Clock,
  'veo-3.0-chained': Link,
} as const;

interface VideoModelSelectorProps {
  selectedModel: VideoModel;
  onModelChange: (model: VideoModel) => void;
  disabled?: boolean;
  showCost?: boolean;
}

export function VideoModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  showCost = true
}: VideoModelSelectorProps) {
  const currentConfig = videoModels.find(m => m.id === selectedModel);
  const CurrentIcon = VIDEO_MODEL_ICONS[selectedModel];

  const getModelDisplayName = (model: VideoModel) => {
    const config = videoModels.find(m => m.id === model);
    return config?.name || model;
  };

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
          Choose Video Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {videoModels.map((config) => {
          const Icon = VIDEO_MODEL_ICONS[config.id];
          const isSelected = selectedModel === config.id;

          return (
            <DropdownMenuItem
              key={config.id}
              onClick={() => onModelChange(config.id)}
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
                      {config.features.slice(0, 2).join(' • ')}
                    </span>
                    {showCost && (
                      <span className="font-medium text-primary">
                        ~${config.costPer4s.toFixed(2)} per 4s
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Max {config.maxDuration}s duration
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          💡 VEO 3.0 Fast is 62.5% cheaper - perfect for testing and development
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for managing video model selection with localStorage persistence
export function useVideoModelSelection() {
  const DEFAULT_VIDEO_MODEL: VideoModel = 'veo-3.0-fast';
  const [selectedModel, setSelectedModel] = useState<VideoModel>(DEFAULT_VIDEO_MODEL);

  useEffect(() => {
    // Load saved model from localStorage
    const savedModel = localStorage.getItem("videoModel") as VideoModel;
    if (savedModel && videoModels.find(m => m.id === savedModel)) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (model: VideoModel) => {
    setSelectedModel(model);
    localStorage.setItem("videoModel", model);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('videoModelChange', {
      detail: { model }
    }));
  };

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
  };
}
