"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { VideoDuration, videoDurations, videoModels, VideoModel } from "@/lib/video-model-types";

interface VideoDurationSelectorProps {
  selectedDuration: VideoDuration;
  onDurationChange: (duration: VideoDuration) => void;
  disabled?: boolean;
  showCost?: boolean;
  className?: string;
}

export function VideoDurationSelector({
  selectedDuration,
  onDurationChange,
  disabled = false,
  showCost = true,
  className = ""
}: VideoDurationSelectorProps) {
  const [currentModel, setCurrentModel] = useState<VideoModel>('veo-3.0-json');

  // Read current video model from localStorage for cost calculation
  useEffect(() => {
    const savedModel = localStorage.getItem("videoModel") as VideoModel;
    if (savedModel && videoModels.find(m => m.id === savedModel)) {
      setCurrentModel(savedModel);
    }

    // Listen for video model changes
    const handleModelChange = (event: CustomEvent) => {
      setCurrentModel(event.detail.model);
    };

    window.addEventListener('videoModelChange', handleModelChange as EventListener);
    return () => {
      window.removeEventListener('videoModelChange', handleModelChange as EventListener);
    };
  }, []);

  const formatDurationWithCost = (duration: VideoDuration) => {
    const durationConfig = videoDurations.find(d => d.value === duration);
    if (!durationConfig) return `${duration} seconds`;

    const cost = durationConfig.cost(currentModel);
    return showCost
      ? `${duration} seconds (~$${cost.toFixed(2)})`
      : `${duration} seconds`;
  };

  return (
    <Select
      value={selectedDuration.toString()}
      onValueChange={(value) => onDurationChange(parseInt(value) as VideoDuration)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[180px] h-10 sm:h-8 ${className}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <SelectValue>
            <span className="text-xs">{formatDurationWithCost(selectedDuration)}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent align="center" className="w-[calc(100vw-2rem)] max-w-[320px]">
        {videoDurations.map((config) => (
          <SelectItem
            key={config.value}
            value={config.value.toString()}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-sm">
                {config.value} seconds
              </span>
              {showCost && (
                <span className="text-xs text-muted-foreground ml-4">
                  ~${config.cost(currentModel).toFixed(2)}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Hook for managing video duration selection with localStorage persistence
export function useVideoDurationSelection() {
  const DEFAULT_DURATION: VideoDuration = 8;
  const [selectedDuration, setSelectedDuration] = useState<VideoDuration>(DEFAULT_DURATION);

  useEffect(() => {
    // Load saved duration from localStorage
    const savedDuration = localStorage.getItem("videoDuration");
    if (savedDuration) {
      const parsedDuration = parseInt(savedDuration) as VideoDuration;
      if (videoDurations.find(d => d.value === parsedDuration)) {
        setSelectedDuration(parsedDuration);
      }
    }
  }, []);

  const handleDurationChange = (duration: VideoDuration) => {
    setSelectedDuration(duration);
    localStorage.setItem("videoDuration", duration.toString());

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('videoDurationChange', {
      detail: { duration }
    }));
  };

  return {
    selectedDuration,
    setSelectedDuration: handleDurationChange,
  };
}
