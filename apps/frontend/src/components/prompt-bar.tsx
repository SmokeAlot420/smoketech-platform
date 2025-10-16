"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, VideoIcon, Sparkles, Users, Video } from "lucide-react";
import Image from "next/image";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { ModelSelector, useModelSelection } from "@/components/model-selector";
import { useCharacterSelection, OmegaCharacter } from "@/components/omega/character-selector";
import { usePresetSelection, OmegaPreset } from "@/components/omega/preset-dropdown";
import { PlatformSelector, usePersistentPlatformSelection, VideoPlatform } from "@/components/platform-selector";
import { ImageCountSelector, useImageCountSelection } from "@/components/image-count-selector";
import { VideoModelSelector, useVideoModelSelection } from "@/components/video-model-selector";
import { VideoDurationSelector, useVideoDurationSelection } from "@/components/video-duration-selector";
import { ImageModel } from "@/lib/model-types";
import { VideoModel, VideoDuration } from "@/lib/video-model-types";

interface PromptBarProps {
  onGenerate?: (type: "image" | "video" | "omega" | "veo3", prompt: string, options?: {
    model?: ImageModel;
    imageCount?: number;
    platform?: VideoPlatform;
    omegaOptions?: {
      character: OmegaCharacter;
      preset: OmegaPreset;
    };
    veo3Options?: {
      videoModel: VideoModel;
      duration: VideoDuration;
      platform?: VideoPlatform;
    }
  }) => void;
  onPanelToggle?: () => void;
  selectedCharacter: OmegaCharacter;
  onCharacterChange: (character: OmegaCharacter) => void;
  selectedPreset: OmegaPreset;
  onPresetChange: (preset: OmegaPreset) => void;
}

export function PromptBar({
  onGenerate,
  onPanelToggle,
  selectedCharacter,
  onCharacterChange,
  selectedPreset,
  onPresetChange
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedModel, setSelectedModel } = useModelSelection();
  const { selectedCount, setSelectedCount } = useImageCountSelection(selectedModel);
  const { selectedPlatform, setSelectedPlatform } = usePersistentPlatformSelection();
  const { selectedModel: selectedVideoModel, setSelectedModel: setSelectedVideoModel } = useVideoModelSelection();
  const { selectedDuration, setSelectedDuration } = useVideoDurationSelection();
  const [showVEO3Button, setShowVEO3Button] = useState(false);

  // Listen for video model changes to show/hide VEO3 button
  useEffect(() => {
    const checkVideoModel = () => {
      const videoModel = localStorage.getItem('videoModel');
      setShowVEO3Button(!!videoModel);
    };

    // Check on mount
    checkVideoModel();

    // Listen for changes
    const handleVideoModelChange = () => {
      checkVideoModel();
    };

    window.addEventListener('videoModelChange', handleVideoModelChange);
    return () => {
      window.removeEventListener('videoModelChange', handleVideoModelChange);
    };
  }, []);

  const handleGenerate = (type: "image" | "video" | "omega" | "veo3") => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Call the parent handler to add new generation
    if (onGenerate) {
      if (type === "omega") {
        onGenerate(type, prompt.trim(), {
          omegaOptions: {
            character: selectedCharacter,
            preset: selectedPreset
          }
        });
      } else if (type === "veo3") {
        onGenerate(type, prompt.trim(), {
          veo3Options: {
            videoModel: selectedVideoModel,
            duration: selectedDuration,
            platform: selectedPlatform
          }
        });
      } else if (type === "video") {
        onGenerate(type, prompt.trim(), {
          platform: selectedPlatform
        });
      } else {
        onGenerate(type, prompt.trim(), {
          model: selectedModel,
          imageCount: selectedCount
        });
      }
    }

    // Clear the prompt
    setPrompt("");

    // Reset generating state
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate("image"); // Default to image on Enter
    }
  };

  return (
    <div className="w-full pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            {/* Main prompt input */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-2 sm:pr-44 h-12 text-base bg-card border-input"
                disabled={isGenerating}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={isGenerating}
                />
                <ImageCountSelector
                  selectedCount={selectedCount}
                  onCountChange={setSelectedCount}
                  selectedModel={selectedModel}
                  disabled={isGenerating}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate("image")}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-10 sm:h-8"
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Image
                </Button>
                <PlatformSelector
                  selectedPlatform={selectedPlatform}
                  onPlatformChange={setSelectedPlatform}
                  disabled={isGenerating}
                  className="h-10 sm:h-8"
                />
                <VideoModelSelector
                  selectedModel={selectedVideoModel}
                  onModelChange={setSelectedVideoModel}
                  disabled={isGenerating}
                />
                <VideoDurationSelector
                  selectedDuration={selectedDuration}
                  onDurationChange={setSelectedDuration}
                  disabled={isGenerating}
                />
                <Button
                  size="sm"
                  onClick={() => handleGenerate("video")}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-10 sm:h-8"
                >
                  <VideoIcon className="w-4 h-4 mr-1" />
                  Video
                </Button>
                {showVEO3Button && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleGenerate("veo3")}
                    disabled={!prompt.trim() || isGenerating}
                    className="h-10 sm:h-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    VEO3
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleGenerate("omega")}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-10 sm:h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Omega
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPanelToggle}
                  disabled={isGenerating}
                  className="h-10 sm:h-8"
                  title="Character Settings"
                >
                  <Users className="w-4 h-4" />
                </Button>
                <SettingsDropdown />
              </div>
            </div>
          </div>

          {/* Mobile buttons row */}
          <div className="sm:hidden space-y-3">
            <div className="flex gap-2 justify-center">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                disabled={isGenerating}
              />
              <ImageCountSelector
                selectedCount={selectedCount}
                onCountChange={setSelectedCount}
                selectedModel={selectedModel}
                disabled={isGenerating}
              />
              <PlatformSelector
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
                disabled={isGenerating}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onPanelToggle}
                disabled={isGenerating}
                className="h-10"
              >
                <Users className="w-4 h-4" />
              </Button>
              <SettingsDropdown />
            </div>
            <div className="flex gap-2 justify-center">
              <VideoModelSelector
                selectedModel={selectedVideoModel}
                onModelChange={setSelectedVideoModel}
                disabled={isGenerating}
              />
              <VideoDurationSelector
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                disabled={isGenerating}
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => handleGenerate("image")}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 h-10"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Image
              </Button>
              <Button
                onClick={() => handleGenerate("video")}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 h-10"
              >
                <VideoIcon className="w-4 h-4 mr-1" />
                Video
              </Button>
              {showVEO3Button && (
                <Button
                  onClick={() => handleGenerate("veo3")}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  <Video className="w-4 h-4 mr-1" />
                  VEO3
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => handleGenerate("omega")}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Omega
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 