"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Smartphone, Square, Globe } from "lucide-react";

export type VideoPlatform = "youtube" | "tiktok" | "instagram" | "general";

interface PlatformOption {
  value: VideoPlatform;
  label: string;
  icon: React.ReactNode;
  aspectRatio: string;
  duration: number;
  description: string;
}

const platforms: PlatformOption[] = [
  {
    value: "youtube",
    label: "YouTube",
    icon: <Monitor className="h-4 w-4" />,
    aspectRatio: "16:9",
    duration: 8,
    description: "Horizontal • 1080p • 8 seconds"
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    duration: 8,
    description: "Vertical • 1080p • 8 seconds • A/B testing"
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: <Square className="h-4 w-4" />,
    aspectRatio: "1:1",
    duration: 6,
    description: "Square • 1080p • 6 seconds"
  },
  {
    value: "general",
    label: "General",
    icon: <Globe className="h-4 w-4" />,
    aspectRatio: "16:9",
    duration: 8,
    description: "Standard • 1080p • 8 seconds"
  }
];

interface PlatformSelectorProps {
  selectedPlatform: VideoPlatform;
  onPlatformChange: (platform: VideoPlatform) => void;
  disabled?: boolean;
  className?: string;
}

export function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
  className = ""
}: PlatformSelectorProps) {
  const selectedOption = platforms.find(p => p.value === selectedPlatform) || platforms[0];

  return (
    <Select
      value={selectedPlatform}
      onValueChange={(value) => onPlatformChange(value as VideoPlatform)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[140px] h-8 ${className}`}>
        <div className="flex items-center gap-2">
          {selectedOption.icon}
          <span className="text-sm">{selectedOption.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[calc(100vw-2rem)] max-w-[320px]">
        {platforms.map((platform) => (
          <SelectItem key={platform.value} value={platform.value} className="cursor-pointer">
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-2">
                {platform.icon}
                <span className="font-medium">{platform.label}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                {platform.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function usePlatformSelection() {
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform>("youtube");

  return {
    selectedPlatform,
    setSelectedPlatform,
    platformConfig: platforms.find(p => p.value === selectedPlatform) || platforms[0]
  };
}

// Hook for persisting platform selection
import { useState, useEffect } from "react";

export function usePersistentPlatformSelection() {
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform>("youtube");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("preferred_video_platform");
    if (saved && platforms.some(p => p.value === saved)) {
      setSelectedPlatform(saved as VideoPlatform);
    }
    setIsLoaded(true);
  }, []);

  const updatePlatform = (platform: VideoPlatform) => {
    setSelectedPlatform(platform);
    localStorage.setItem("preferred_video_platform", platform);
  };

  return {
    selectedPlatform: isLoaded ? selectedPlatform : "youtube",
    setSelectedPlatform: updatePlatform,
    platformConfig: platforms.find(p => p.value === selectedPlatform) || platforms[0],
    isLoaded
  };
}