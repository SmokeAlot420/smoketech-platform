"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/image-grid";
import { VideoGrid } from "@/components/video-grid";
import { VideoChainView } from "@/components/video-chain-view";
import { LoadingGrid } from "@/components/loading-grid";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { FocusedMediaView } from "@/components/focused-media-view";
import { motion } from "framer-motion";
import { ImageModel, getModelConfig } from "@/lib/model-types";
import { ProgressTracker, OmegaOperation, useProgressTracking } from "@/components/omega/progress-tracker";
import { OmegaCharacter } from "@/components/omega/character-selector";
import { OmegaPreset } from "@/components/omega/preset-dropdown";
import {
  withRetry,
  handleApiError,
  handleError,
  withTimeout,
  ERROR_MESSAGES,
  AppError,
  ErrorSeverity,
  checkServiceHealth
} from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";

interface ImageGeneration {
  id: string;
  prompt: string;
  images: Array<{
    url: string;
    imageBytes?: string;
    isSample?: boolean;
  }>;
  timestamp: Date;
  isLoading: boolean;
  model?: ImageModel;
  metadata?: {
    modelName: string;
    numberOfImages: number;
    cost: number;
    estimatedTime?: number;
  };
}

interface VideoGeneration {
  id: string;
  prompt: string;
  videos: string[];
  timestamp: Date;
  isLoading: boolean;
  sourceImage?: string;
  type?: "video" | "veo3";
  metadata?: {
    model?: string;
    duration?: number;
    platform?: string;
    cost?: number;
    generationTime?: number;
  };
  parentVideoId?: string; // ID of the video this extends from
  extractedFramePath?: string; // Frame path for extension
  canExtend?: boolean; // Whether extension is available
}

interface OmegaGeneration {
  id: string;
  prompt: string;
  operation: OmegaOperation;
  timestamp: Date;
  isLoading: boolean;
  character: OmegaCharacter;
  preset: OmegaPreset;
}

interface LoadingGeneration {
  id: string;
  prompt: string;
  type: "image" | "video" | "omega";
  timestamp: Date;
  isLoading: true;
  sourceImage?: string;
  omegaOptions?: {
    character: OmegaCharacter;
    preset: OmegaPreset;
  };
}

type Generation = ImageGeneration | VideoGeneration | OmegaGeneration | LoadingGeneration;

// Helper function to extract filename from path
const getFilename = (filepath: string) => {
  return filepath.split(/[\\\/]/).pop() || filepath;
};

// Sample data showcasing SmokeTech Studio capabilities
const createSampleGenerations = (): Generation[] => [
  // Character showcase - ultra-realistic NanoBanana generated characters
  {
    id: "sample-characters-1",
    prompt: "Ultra-realistic character generation with NanoBanana - Aria, Bianca, Sofia, Marcus",
    images: [
      { url: "/characters/aria.png", isSample: true },
      { url: "/characters/bianca.png", isSample: true },
      { url: "/characters/sofia.png", isSample: true },
      { url: "/characters/marcus.png", isSample: true }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    isLoading: false
  } as ImageGeneration,
  // Video generation
  {
    id: "sample-video-1",
    prompt: "Professional video with VEO3 and advanced viral techniques",
    videos: [
      "/sample-videos/video-1.mp4",
      "/sample-videos/video-2.mp4"
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isLoading: false
  } as VideoGeneration
];

export function ContentGrid({
  onNewGeneration,
  onImageToVideo
}: {
  onNewGeneration?: (handler: (type: "image" | "video" | "omega" | "veo3", prompt: string, options?: {
    model?: ImageModel;
    imageCount?: number;
    platform?: string;
    omegaOptions?: {
      character: OmegaCharacter;
      preset: OmegaPreset;
    };
    veo3Options?: {
      videoModel: string;
      duration: number;
      platform?: string;
    }
  }) => void) => void;
  onImageToVideo?: (handler: (imageUrl: string, imageBytes: string, prompt: string) => void) => void;
}) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "veo3">("all");
  const { toast } = useToast();
  const [focusedView, setFocusedView] = useState<{
    isOpen: boolean;
    mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }>;
    initialIndex: number;
  }>({ isOpen: false, mediaItems: [], initialIndex: 0 });

  // Initialize with sample data after mount to avoid hydration issues
  useEffect(() => {
    setGenerations(createSampleGenerations());
  }, []);

  // Load saved videos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smoketech-generated-videos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const withDates = parsed.map((gen: any) => ({
          ...gen,
          timestamp: new Date(gen.timestamp)
        }));
        setGenerations(prev => [...withDates, ...prev]);
      } catch (error) {
        console.error('Failed to load saved videos:', error);
      }
    }
  }, []);

  // Save non-sample videos to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nonSample = generations.filter(g => !g.id.startsWith('sample-'));
      if (nonSample.length > 0) {
        try {
          // Keep only last 50 videos to prevent storage bloat
          localStorage.setItem('smoketech-generated-videos', JSON.stringify(nonSample.slice(0, 50)));
        } catch (error) {
          console.error('Failed to save videos:', error);
        }
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeout);
  }, [generations]);

  // Helper function to gather all media items from generations
  const getAllMediaItems = () => {
    const mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }> = [];

    generations.forEach((generation) => {
      if (!generation.isLoading) {
        if ('images' in generation) {
          // Image generation
          generation.images.forEach((image, index) => {
            mediaItems.push({
              id: `${generation.id}-img-${index}`,
              type: 'image',
              url: image.url,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
            });
          });
        } else if ('videos' in generation) {
          // Video generation
          generation.videos.forEach((video, index) => {
            mediaItems.push({
              id: `${generation.id}-vid-${index}`,
              type: 'video',
              url: video,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
              sourceImage: generation.sourceImage,
            });
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    return mediaItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Helper function to build video chains
  const buildVideoChains = () => {
    const videoGenerations = generations.filter(
      (gen): gen is VideoGeneration => 'videos' in gen && !gen.isLoading
    );

    // Map of chain root IDs to their full chains
    const chains = new Map<string, VideoGeneration[]>();

    // First pass: identify root videos (no parentVideoId)
    videoGenerations.forEach(gen => {
      if (!gen.parentVideoId) {
        chains.set(gen.id, [gen]);
      }
    });

    // Second pass: build chains by following parentVideoId references
    videoGenerations.forEach(gen => {
      if (gen.parentVideoId) {
        // Find the root of this chain
        let current = gen;
        let rootId = gen.parentVideoId;

        // Traverse up to find root
        while (true) {
          const parent = videoGenerations.find(v => v.id === rootId);
          if (!parent || !parent.parentVideoId) break;
          rootId = parent.parentVideoId;
        }

        // Add to appropriate chain
        const chain = chains.get(rootId);
        if (chain) {
          chain.push(gen);
        }
      }
    });

    // Sort each chain by timestamp
    chains.forEach(chain => {
      chain.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    return chains;
  };

  // Handle video extension completion
  const handleVideoExtended = (parentId: string, extendedVideoUrl: string) => {
    // Find the parent video to get context
    const parentGen = generations.find(g => g.id === parentId) as VideoGeneration | undefined;
    if (!parentGen) return;

    // Create new generation for extended video
    const newGeneration: VideoGeneration = {
      id: `extended-${Date.now()}`,
      prompt: `[Extended] ${parentGen.prompt}`,
      videos: [extendedVideoUrl],
      timestamp: new Date(),
      isLoading: false,
      parentVideoId: parentId,
      type: parentGen.type,
      canExtend: false // Will be updated when backend completes frame extraction
    };

    // Add to generations
    setGenerations(prev => [newGeneration, ...prev]);

    toast({
      title: "Extension Complete!",
      description: "New video segment added to chain",
      variant: "success"
    });
  };

  // Function to open focused view
  const openFocusedView = (generationId: string, itemIndex: number) => {
    const allMediaItems = getAllMediaItems();
    
    // Find the specific item index in the global list
    let globalIndex = 0;
    for (let i = 0; i < generations.length; i++) {
      const gen = generations[i];
      if (gen.isLoading) continue;
      
      if (gen.id === generationId) {
        globalIndex += itemIndex;
        break;
      }
      
      if ('images' in gen) {
        globalIndex += gen.images.length;
      } else if ('videos' in gen) {
        globalIndex += gen.videos.length;
      }
    }

    setFocusedView({
      isOpen: true,
      mediaItems: allMediaItems,
      initialIndex: globalIndex,
    });
  };

  const handleNewGeneration = async (
    type: "image" | "video" | "omega",
    prompt: string,
    model?: ImageModel,
    imageCount?: number,
    omegaOptions?: {
      character: OmegaCharacter;
      preset: OmegaPreset;
    }
  ) => {
    // Get user's API key from localStorage
    const userApiKey = localStorage.getItem("gemini_api_key");

    // Check API key first
    if (!userApiKey) {
      toast({
        title: "API Key Required",
        description: ERROR_MESSAGES.API_KEY_MISSING,
        variant: "destructive"
      });
      setShowApiKeyDialog(true);
      return;
    }

    const loadingGeneration: LoadingGeneration = {
      id: `loading-${Date.now()}`,
      prompt,
      type,
      timestamp: new Date(),
      isLoading: true,
      omegaOptions
    };

    // Add new loading generation at the top
    setGenerations(prev => [loadingGeneration, ...prev]);

    try {
      if (type === "image") {
        const modelConfig = model ? getModelConfig(model) : null;
        const apiEndpoint = modelConfig ? modelConfig.apiEndpoint : '/api/generate-images';

        // Call the appropriate API based on model selection with retry logic
        const response = await withRetry(
          async () => {
            const res = await withTimeout(
              fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt,
                  apiKey: userApiKey,
                  model: model || 'imagen-4', // Default fallback
                  numberOfImages: imageCount // User-specified image count
                }),
              }),
              30000 // 30 second timeout
            );

            if (!res.ok) {
              await handleApiError(res);
            }

            return res;
          },
          { maxAttempts: 2, initialDelay: 2000 },
          (attempt, error) => {
            toast({
              title: "Retrying...",
              description: `Attempt ${attempt + 1} - ${error.message}`,
              variant: "default"
            });
          }
        );

        const data = await response.json();

        if (data.success) {
          const completedGeneration: ImageGeneration = {
            id: loadingGeneration.id,
            prompt: loadingGeneration.prompt,
            images: data.images.map((img: { url: string; imageBytes: string }) => ({
              url: img.url,
              imageBytes: img.imageBytes
            })),
            timestamp: loadingGeneration.timestamp,
            isLoading: false,
            model: model || 'imagen-4',
            metadata: data.metadata // Store generation metadata
          };

          setGenerations(prev => prev.map(gen =>
            gen.id === loadingGeneration.id ? completedGeneration : gen
          ));

          toast({
            title: "Success!",
            description: "Image generation completed",
            variant: "success"
          });
        } else {
          throw new AppError(
            data.error || 'Image generation failed',
            'GENERATION_FAILED',
            ErrorSeverity.ERROR,
            false
          );
        }
      } else if (type === "video") {
        // Call Veo 3 API for text-to-video with retry logic
        const platform = localStorage.getItem("platform") || "youtube";
        const response = await withRetry(
          async () => {
            const res = await withTimeout(
              fetch('/api/generate-videos', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, apiKey: userApiKey, platform }),
              }),
              60000 // 60 second timeout for video
            );

            if (!res.ok) {
              await handleApiError(res);
            }

            return res;
          },
          { maxAttempts: 2, initialDelay: 3000 },
          (attempt, error) => {
            toast({
              title: "Retrying video generation...",
              description: `Attempt ${attempt + 1} - ${error.message}`,
              variant: "default"
            });
          }
        );

        const data = await response.json();

        if (data.success) {
          // Poll for final status to get extractedFramePath and canExtend
          const pollForCompletion = async (operationId: string) => {
            const statusResponse = await fetch(`/api/generate-videos/status/${operationId}`);
            const statusData = await statusResponse.json();

            if (statusData.status === 'complete') {
              const completedGeneration: VideoGeneration = {
                id: loadingGeneration.id,
                prompt: loadingGeneration.prompt,
                videos: statusData.result.videos?.map((vid: any) => vid.url || vid) || data.videos.map((vid: { url: string }) => vid.url),
                timestamp: loadingGeneration.timestamp,
                isLoading: false,
                extractedFramePath: statusData.result.extractedFramePath,
                canExtend: statusData.result.canExtend,
                metadata: {
                  model: statusData.result.model,
                  duration: statusData.result.totalDuration,
                  cost: statusData.result.totalCost || statusData.result.actualCost
                }
              };

              setGenerations(prev => prev.map(gen =>
                gen.id === loadingGeneration.id ? completedGeneration : gen
              ));

              toast({
                title: "Success!",
                description: "Video generation completed",
                variant: "success"
              });
            } else {
              // Still processing, poll again
              setTimeout(() => pollForCompletion(operationId), 2000);
            }
          };

          // Start polling if operationId is available
          if (data.operationId) {
            pollForCompletion(data.operationId);
          } else {
            // Fallback for immediate responses
            const completedGeneration: VideoGeneration = {
              id: loadingGeneration.id,
              prompt: loadingGeneration.prompt,
              videos: data.videos.map((vid: { url: string }) => vid.url),
              timestamp: loadingGeneration.timestamp,
              isLoading: false
            };

            setGenerations(prev => prev.map(gen =>
              gen.id === loadingGeneration.id ? completedGeneration : gen
            ));

            toast({
              title: "Success!",
              description: "Video generation completed",
              variant: "success"
            });
          }
        } else {
          throw new AppError(
            data.error || 'Video generation failed',
            'GENERATION_FAILED',
            ErrorSeverity.ERROR,
            false
          );
        }
      } else if (type === "omega") {
        // Call Omega API for ultra-realistic video generation
        if (!omegaOptions) {
          throw new AppError(
            'Omega options (character and preset) are required',
            'INVALID_INPUT',
            ErrorSeverity.ERROR,
            false
          );
        }

        // Check Omega service health first
        const omegaHealthy = await checkServiceHealth('http://localhost:3007/api/health');
        if (!omegaHealthy) {
          throw new AppError(
            ERROR_MESSAGES.OMEGA_SERVICE_DOWN,
            'SERVICE_UNAVAILABLE',
            ErrorSeverity.WARNING,
            true
          );
        }

        const response = await withRetry(
          async () => {
            const res = await withTimeout(
              fetch('/api/generate-omega', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  characterName: omegaOptions.character,
                  userRequest: prompt,
                  preset: omegaOptions.preset,
                  platform: 'general',
                  simpleMode: false,
                  apiKey: userApiKey
                }),
              }),
              30000 // 30 second timeout
            );

            if (!res.ok) {
              await handleApiError(res);
            }

            return res;
          },
          { maxAttempts: 3, initialDelay: 2000 },
          (attempt, error) => {
            toast({
              title: "Retrying Omega workflow...",
              description: `Attempt ${attempt + 1} - ${error.message}`,
              variant: "default"
            });
          }
        );

        const data = await response.json();

        if (data.success) {
          const initialOperation: OmegaOperation = {
            operationId: data.operationId,
            character: omegaOptions.character,
            status: 'pending',
            progress: 0,
            elapsedTime: 0,
            estimatedTime: data.estimatedTime || 240, // Default 4 minutes
            lastChecked: new Date().toISOString(),
            refreshInterval: 5000,
            canCancel: true
          };

          const omegaGeneration: OmegaGeneration = {
            id: loadingGeneration.id,
            prompt: loadingGeneration.prompt,
            operation: initialOperation,
            timestamp: loadingGeneration.timestamp,
            isLoading: false,
            character: omegaOptions.character,
            preset: omegaOptions.preset
          };

          setGenerations(prev => prev.map(gen =>
            gen.id === loadingGeneration.id ? omegaGeneration : gen
          ));

          toast({
            title: "Omega Workflow Started",
            description: `Processing ${omegaOptions.character} with ${omegaOptions.preset} preset`,
            variant: "default"
          });
        } else {
          throw new AppError(
            data.error || 'Omega generation failed',
            'GENERATION_FAILED',
            ErrorSeverity.ERROR,
            false
          );
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // Remove the loading generation on error
      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));

      // Handle the error with proper user feedback
      handleError(error, true);

      // Special handling for API key errors
      if (error instanceof AppError && error.code === 'UNAUTHORIZED') {
        setShowApiKeyDialog(true);
      }
    }
  };

  const handleImageToVideo = async (imageUrl: string, imageBytes: string, prompt: string) => {
    // Get user's API key from localStorage
    const userApiKey = localStorage.getItem("gemini_api_key");

    // Check API key first
    if (!userApiKey) {
      toast({
        title: "API Key Required",
        description: ERROR_MESSAGES.API_KEY_MISSING,
        variant: "destructive"
      });
      setShowApiKeyDialog(true);
      return;
    }

    const loadingGeneration: LoadingGeneration = {
      id: `video-loading-${Date.now()}`,
      prompt: `${prompt} - animated video`,
      type: "video",
      timestamp: new Date(),
      isLoading: true,
      sourceImage: imageUrl
    };

    // Add new loading generation at the top
    setGenerations(prev => [loadingGeneration, ...prev]);

    try {
      const response = await withRetry(
        async () => {
          const res = await withTimeout(
            fetch('/api/image-to-video', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: `${prompt} - animated video`,
                imageBytes,
                apiKey: userApiKey
              }),
            }),
            60000 // 60 second timeout for video conversion
          );

          if (!res.ok) {
            await handleApiError(res);
          }

          return res;
        },
        { maxAttempts: 2, initialDelay: 3000 },
        (attempt, error) => {
          toast({
            title: "Retrying video conversion...",
            description: `Attempt ${attempt + 1} - ${error.message}`,
            variant: "default"
          });
        }
      );

      const data = await response.json();

      if (data.success) {
        const completedGeneration: VideoGeneration = {
          id: loadingGeneration.id,
          prompt: loadingGeneration.prompt,
          videos: data.videos.map((vid: { url: string }) => vid.url),
          timestamp: loadingGeneration.timestamp,
          isLoading: false,
          sourceImage: imageUrl
        };

        setGenerations(prev => prev.map(gen =>
          gen.id === loadingGeneration.id ? completedGeneration : gen
        ));

        toast({
          title: "Success!",
          description: "Video conversion completed",
          variant: "success"
        });
      } else {
        throw new AppError(
          data.error || 'Video conversion failed',
          'GENERATION_FAILED',
          ErrorSeverity.ERROR,
          false
        );
      }
    } catch (error) {
      console.error('Video conversion failed:', error);
      // Remove the loading generation on error
      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));

      // Handle the error with proper user feedback
      handleError(error, true);

      // Special handling for API key errors
      if (error instanceof AppError && error.code === 'UNAUTHORIZED') {
        setShowApiKeyDialog(true);
      }
    }
  };

  // VEO3 video generation handler
  const handleVEO3Generation = async (prompt: string, veo3Options?: {
    videoModel: string;
    duration: number;
    platform?: string;
  }) => {
    if (!veo3Options) {
      toast({
        title: "Error",
        description: "VEO3 options are required",
        variant: "destructive"
      });
      return;
    }

    const { videoModel, duration, platform } = veo3Options;

    // Create loading generation
    const generationId = `veo3-${Date.now()}`;
    const loadingGeneration: VideoGeneration = {
      id: generationId,
      prompt,
      videos: [],
      timestamp: new Date(),
      isLoading: true,
      type: "veo3",
      metadata: {
        model: videoModel,
        duration: duration,
        platform: platform
      }
    };

    setGenerations(prev => [loadingGeneration, ...prev]);

    toast({
      title: "VEO3 Generation Started",
      description: `Generating ${duration}s video with ${videoModel}...`
    });

    try {
      // Call VEO3 API endpoint
      const response = await fetch('/api/generate-veo3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          videoModel,
          duration,
          platform
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start VEO3 generation');
      }

      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:3007/api/status/${data.operationId}`);
          const statusData = await statusResponse.json();

          if (statusData.success) {
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);

              // Update generation with video
              setGenerations(prev => prev.map(gen => {
                if (gen.id === generationId && 'videos' in gen) {
                  const videoGen = gen as VideoGeneration;
                  return {
                    ...videoGen,
                    isLoading: false,
                    videos: [statusData.videoUrl || statusData.videoPath],
                    metadata: {
                      ...videoGen.metadata,
                      cost: statusData.metrics?.totalCost,
                      generationTime: statusData.metrics?.generationTime
                    }
                  } as VideoGeneration;
                }
                return gen;
              }));

              toast({
                title: "VEO3 Generation Complete!",
                description: `Video generated successfully (Cost: $${statusData.metrics?.totalCost?.toFixed(2) || '0.00'})`
              });
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);

              // Remove loading generation
              setGenerations(prev => prev.filter(gen => gen.id !== generationId));

              toast({
                title: "VEO3 Generation Failed",
                description: statusData.error || "Unknown error occurred",
                variant: "destructive"
              });
            }
            // Still processing - continue polling
          }
        } catch (pollError) {
          console.error('Status polling error:', pollError);
        }
      }, 5000); // Poll every 5 seconds

      // Set timeout to stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 600000);

    } catch (error) {
      // Remove loading generation
      setGenerations(prev => prev.filter(gen => gen.id !== generationId));

      toast({
        title: "VEO3 Generation Error",
        description: error instanceof Error ? error.message : "Failed to start generation",
        variant: "destructive"
      });
    }
  };

  // Wrapper function to match the interface expected by PromptBar
  const handleGenerationWrapper = (type: "image" | "video" | "omega" | "veo3", prompt: string, options?: {
    model?: ImageModel;
    imageCount?: number;
    platform?: string;
    omegaOptions?: {
      character: OmegaCharacter;
      preset: OmegaPreset;
    };
    veo3Options?: {
      videoModel: string;
      duration: number;
      platform?: string;
    }
  }) => {
    if (type === "veo3") {
      return handleVEO3Generation(prompt, options?.veo3Options);
    }
    const { model, imageCount, omegaOptions } = options || {};
    return handleNewGeneration(type, prompt, model, imageCount, omegaOptions);
  };

  // Use useEffect to avoid setState during render
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(handleGenerationWrapper);
    }
    if (onImageToVideo) {
      onImageToVideo(handleImageToVideo);
    }
  }, [onNewGeneration, onImageToVideo]);

  // Filter generations based on selected type
  const filteredGenerations = generations.filter((generation) => {
    if (filterType === "all") return true;
    if (filterType === "image") return "images" in generation;
    if (filterType === "video") return "videos" in generation && (!("type" in generation) || generation.type === "video");
    if (filterType === "veo3") return "videos" in generation && "type" in generation && generation.type === "veo3";
    return true;
  });

  // Build video chains
  const videoChains = buildVideoChains();
  const renderedVideoIds = new Set<string>();

  return (
    <>
      {/* Filter Controls */}
      {generations.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className="h-8"
          >
            All ({generations.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "image" ? "default" : "outline"}
            onClick={() => setFilterType("image")}
            className="h-8"
          >
            Images ({generations.filter(g => "images" in g).length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "video" ? "default" : "outline"}
            onClick={() => setFilterType("video")}
            className="h-8"
          >
            Videos ({generations.filter(g => "videos" in g && (!("type" in g) || g.type === "video")).length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "veo3" ? "default" : "outline"}
            onClick={() => setFilterType("veo3")}
            className="h-8"
          >
            VEO3 ({generations.filter(g => "videos" in g && "type" in g && g.type === "veo3").length})
          </Button>
        </div>
      )}

      <div className="space-y-8">
      {filteredGenerations.map((generation) => {
        // Skip if already rendered as part of a chain
        if ('videos' in generation && renderedVideoIds.has(generation.id)) {
          return null;
        }

        // Check if this video is part of a chain
        const chainForThisVideo = Array.from(videoChains.entries()).find(
          ([rootId, chain]) => chain.some(v => v.id === generation.id)
        );

        // If part of a chain with 2+ videos, render VideoChainView
        if (chainForThisVideo && chainForThisVideo[1].length > 1) {
          const [rootId, chain] = chainForThisVideo;

          // Mark all videos in this chain as rendered
          chain.forEach(v => renderedVideoIds.add(v.id));

          // Convert to VideoInChain format
          const chainData = chain.map(v => ({
            id: v.id,
            videoUrl: v.videos[0],
            prompt: v.prompt,
            duration: v.metadata?.duration || 8,
            model: v.metadata?.model,
            cost: v.metadata?.cost,
            extractedFramePath: v.extractedFramePath,
            canExtend: v.canExtend || false,
            timestamp: v.timestamp
          }));

          return (
            <motion.div
              key={`chain-${rootId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VideoChainView
                chain={chainData}
                onExtensionStart={async (params) => {
                  // Call the same extension API that VideoGrid uses
                  try {
                    const response = await fetch('/api/extend-video', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(params)
                    });

                    const data = await response.json();

                    if (!data.success) {
                      throw new Error(data.error || 'Failed to start extension');
                    }

                    toast({
                      title: "Extension Started",
                      description: `Generating ${params.duration}s video with ${params.model}...`
                    });

                    // Poll for completion and add to chain
                    const pollInterval = setInterval(async () => {
                      const statusResponse = await fetch(`/api/generate-videos/status/${data.operationId}`);
                      const statusData = await statusResponse.json();

                      if (statusData.status === 'complete') {
                        clearInterval(pollInterval);

                        // Get the last video in the chain to use as parent
                        const lastVideo = chain[chain.length - 1];
                        handleVideoExtended(lastVideo.id, statusData.result.videoUrl || statusData.result.videos[0].url);
                      } else if (statusData.status === 'error') {
                        clearInterval(pollInterval);
                        toast({
                          title: "Extension Failed",
                          description: statusData.error || "Unknown error",
                          variant: "destructive"
                        });
                      }
                    }, 3000);

                    setTimeout(() => clearInterval(pollInterval), 600000);
                  } catch (error) {
                    console.error('Extension error:', error);
                    toast({
                      title: "Extension Error",
                      description: error instanceof Error ? error.message : "Failed to start extension",
                      variant: "destructive"
                    });
                  }
                }}
              />
            </motion.div>
          );
        }

        // Otherwise render normally
        return (
          <motion.div
            key={generation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {generation.isLoading ? (
              <LoadingGrid
                prompt={generation.prompt}
                type={(() => {
                  if ("type" in generation) {
                    const genType = generation.type;
                    if (genType === "veo3" || genType === "video") return "video";
                  }
                  return "images" in generation ? "image" : "video";
                })()}
                sourceImage={"sourceImage" in generation ? generation.sourceImage : undefined}
              />
            ) : "images" in generation ? (
              <ImageGrid
                generation={generation}
                onImageToVideo={handleImageToVideo}
                onViewFullscreen={openFocusedView}
              />
            ) : "operation" in generation ? (
            generation.operation.status === 'completed' && (generation.operation.videoUrl || generation.operation.videoPath) ? (
              // Show video for completed Omega generation
              <div className="space-y-4">
                <VideoGrid
                  generation={{
                    ...generation,
                    videos: [generation.operation.videoUrl || `/api/serve-video?operationId=${generation.operation.operationId}&file=${getFilename(generation.operation.videoPath)}`]
                  }}
                  onViewFullscreen={openFocusedView}
                />
                {/* Display metrics for completed Omega generation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg">
                  {generation.operation.metrics?.viralScore !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {generation.operation.metrics.viralScore}/100
                      </div>
                      <div className="text-xs text-muted-foreground">Viral Score</div>
                    </div>
                  )}
                  {generation.operation.metrics?.totalCost !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${generation.operation.metrics.totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Cost</div>
                    </div>
                  )}
                  {generation.operation.metrics?.generationTime !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(generation.operation.metrics.generationTime / 60)}m
                      </div>
                      <div className="text-xs text-muted-foreground">Generation Time</div>
                    </div>
                  )}
                  {(generation.operation.videoUrl || generation.operation.videoPath) && (
                    <div className="text-center">
                      <a
                        href={generation.operation.videoUrl || `/api/serve-video?operationId=${generation.operation.operationId}&file=${getFilename(generation.operation.videoPath)}`}
                        download={`omega-${generation.character}-${generation.operation.operationId}.mp4`}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Show progress tracker for pending/processing Omega generation
              <ProgressTracker
                operation={generation.operation}
                onStatusUpdate={(updatedOperation) => {
                  // Update the operation status in the generation
                  setGenerations(prev => prev.map(gen =>
                    gen.id === generation.id && "operation" in gen
                      ? { ...gen, operation: updatedOperation }
                      : gen
                  ));
                }}
                onCancel={(operationId) => {
                  console.log(`Cancelling operation: ${operationId}`);
                  // TODO: Implement cancel API call
                }}
                onPause={(operationId) => {
                  console.log(`Pausing operation: ${operationId}`);
                  // TODO: Implement pause API call
                }}
                onResume={(operationId) => {
                  console.log(`Resuming operation: ${operationId}`);
                  // TODO: Implement resume API call
                }}
                showControls={true}
                compact={false}
              />
            )
          ) : (
            <VideoGrid
              generation={generation}
              onViewFullscreen={openFocusedView}
              onVideoExtended={(extendedVideoUrl) => {
                // Add extended video to chain
                handleVideoExtended(generation.id, extendedVideoUrl);
              }}
            />
          )}
          </motion.div>
        );
      })}
      
      {generations.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Ready to create something amazing?</h3>
          <p className="text-muted-foreground">
            Use the prompt bar above to generate your first image or video.
          </p>
        </div>
      )}
    </div>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onApiKeySaved={() => {
          console.log('Google Gemini API key saved successfully');
          // Trigger a custom event to notify settings dropdown to refresh
          window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
        }}
      />

      <FocusedMediaView
        isOpen={focusedView.isOpen}
        onClose={() => setFocusedView(prev => ({ ...prev, isOpen: false }))}
        mediaItems={focusedView.mediaItems}
        initialIndex={focusedView.initialIndex}
        onImageToVideo={handleImageToVideo}
      />
    </>
  );
} 