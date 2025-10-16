"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, ExpandIcon, ClockIcon, PlaySquareIcon, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { LightboxModal } from "@/components/lightbox-modal";
import { InteractiveExtendDialog } from "@/components/interactive-extend-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface VideoGeneration {
  id: string;
  prompt: string;
  videos: string[];
  timestamp: Date;
  isLoading: boolean;
  sourceImage?: string; // For image-to-video conversions
  type?: "video" | "veo3";
  metadata?: {
    model?: string;
    duration?: number;
    platform?: string;
    cost?: number;
    generationTime?: number;
    enhancementLevel?: string;
    qualityScore?: number;
  };
  extractedFramePath?: string; // Path to extracted final frame for extension
  canExtend?: boolean; // Whether extension is available (frame extraction succeeded)
}

interface VideoGridProps {
  generation: VideoGeneration;
  onViewFullscreen?: (generationId: string, videoIndex: number) => void;
  onVideoExtended?: (extendedVideoUrl: string) => void;
}

export function VideoGrid({ generation, onViewFullscreen, onVideoExtended }: VideoGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extendVideoIndex, setExtendVideoIndex] = useState(0);
  const [mutedVideos, setMutedVideos] = useState<Map<number, boolean>>(new Map());
  const { toast } = useToast();

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const playPromises = useRef<Map<number, Promise<void>>>(new Map());

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleDownload = async (videoUrl: string, index: number) => {
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `generated-video-${index + 1}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleViewFullscreen = (index: number) => {
    if (onViewFullscreen) {
      onViewFullscreen(generation.id, index);
    } else {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleExtendVideo = (index: number) => {
    setExtendVideoIndex(index);
    setExtendDialogOpen(true);
  };

  const handleExtensionStart = async (params: {
    framePath: string;
    model: 'sora-2' | 'sora-2-pro' | 'veo3';
    prompt: string;
    duration: 4 | 6 | 8;
    aspectRatio: '16:9' | '9:16' | '1:1';
  }) => {
    try {
      toast({
        title: "Starting Extension",
        description: `Generating ${params.duration}s video with ${params.model}...`
      });

      // Call /api/extend-video
      const response = await fetch('/api/extend-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start extension');
      }

      const { operationId } = data;

      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/generate-videos/status/${operationId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === 'complete') {
            clearInterval(pollInterval);

            // Notify parent component with new video
            if (onVideoExtended && statusData.result?.videoUrl) {
              onVideoExtended(statusData.result.videoUrl);
            }

            toast({
              title: "Extension Complete!",
              description: `New ${params.duration}s segment generated successfully`,
              variant: "default"
            });
          } else if (statusData.status === 'error') {
            clearInterval(pollInterval);

            toast({
              title: "Extension Failed",
              description: statusData.error || "Unknown error occurred",
              variant: "destructive"
            });
          }
        } catch (pollError) {
          console.error('Status polling error:', pollError);
        }
      }, 3000); // Poll every 3 seconds

      // Set timeout to stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 600000);

    } catch (error) {
      console.error('Extension error:', error);
      toast({
        title: "Extension Error",
        description: error instanceof Error ? error.message : "Failed to start extension",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleRowMouseEnter = () => {
    // Play all videos with Promise-based error handling
    videoRefs.current.forEach((video, index) => {
      if (video && video.readyState >= 3) { // HAVE_FUTURE_DATA or better
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromises.current.set(index, playPromise);
          playPromise.catch((error) => {
            // Ignore AbortError - it's expected when user leaves quickly
            if (error.name !== 'AbortError') {
              console.error('Video playback error:', error);
            }
          });
        }
      }
    });
  };

  const handleRowMouseLeave = async () => {
    // Wait for all pending play() promises before pausing
    const promises = Array.from(playPromises.current.values());
    await Promise.allSettled(promises);

    // Now safe to pause all videos
    videoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });

    // Clear tracked promises
    playPromises.current.clear();
  };

  const handleToggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      const newMutedState = !video.muted;
      video.muted = newMutedState;
      setMutedVideos(prev => new Map(prev).set(index, newMutedState));
    }
  };

  // Convert videos to lightbox format
  const lightboxItems = generation.videos.map((url, index) => ({
    type: "video" as const,
    url,
    alt: `Generated video ${index + 1} from: ${generation.prompt}`
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Videos grid - left side */}
      <div 
        className="flex-1"
        onMouseEnter={handleRowMouseEnter}
        onMouseLeave={handleRowMouseLeave}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {generation.videos.map((videoUrl, index) => (
            <motion.div
              key={index}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => handleViewFullscreen(index)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden aspect-video border-border/50 relative">
                {generation.isLoading ? (
                  <div className="absolute inset-0">
                    <Skeleton className="w-full h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    </Skeleton>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-0"
                  >
                    {/* Video player */}
                    <video
                      ref={(el) => { videoRefs.current[index] = el; }}
                      className="absolute inset-0 w-full h-full object-cover"
                      poster={generation.sourceImage}
                      preload="auto"
                      muted
                      loop
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Controls at bottom - only visible on hover */}
                    <motion.div
                      className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute(index);
                        }}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title={mutedVideos.get(index) === false ? "Mute" : "Unmute"}
                      >
                        {mutedVideos.get(index) === false ? (
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                      {/* Only show Extend button if frame extraction succeeded */}
                      {generation.canExtend && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExtendVideo(index);
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          title="Extend from this frame"
                        >
                          <PlaySquareIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(videoUrl, index);
                        }}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="Download"
                      >
                        <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFullscreen(index);
                        }}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="View fullscreen"
                      >
                        <ExpandIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prompt information - right side */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="lg:sticky lg:top-24">
          <div className="space-y-3">
            {/* Prompt */}
            <div>
              <h3 className="font-medium text-foreground text-lg leading-relaxed">
                {generation.prompt}
              </h3>
            </div>
            
            {/* Format badge */}
            <div>
              <Badge variant="outline" className="text-xs">
                {generation.type === "veo3" ? "VEO3 Video" : "Video"}
              </Badge>
            </div>

            {/* VEO3 Metadata */}
            {generation.type === "veo3" && generation.metadata && (
              <div className="space-y-2 p-3 rounded-lg border border-border bg-card/50">
                <div className="text-xs font-medium text-foreground/80 mb-2">Generation Details</div>

                {/* Model and Duration */}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium text-foreground">{generation.metadata.model || 'Unknown'}</span>
                </div>

                {generation.metadata.duration && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium text-foreground">{generation.metadata.duration}s</span>
                  </div>
                )}

                {/* Enhancement Level and Cost */}
                {generation.metadata.enhancementLevel && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Enhancement:</span>
                    <span className="font-medium text-foreground capitalize">{generation.metadata.enhancementLevel}</span>
                  </div>
                )}

                {generation.metadata.cost !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium text-primary">${generation.metadata.cost.toFixed(2)}</span>
                  </div>
                )}

                {/* Quality Score */}
                {generation.metadata.qualityScore && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className="font-medium text-foreground">{generation.metadata.qualityScore}/10</span>
                  </div>
                )}

                {/* Generation Time */}
                {generation.metadata.generationTime && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Generated in:</span>
                    <span className="font-medium text-foreground">{Math.round(generation.metadata.generationTime)}s</span>
                  </div>
                )}
              </div>
            )}

            {/* Show source image thumbnail if it's an image-to-video conversion */}
            {generation.sourceImage && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Source Image:</div>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={generation.sourceImage}
                    alt="Source image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Time generated */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="w-3 h-3" />
              <span className="whitespace-nowrap">{formatTimeAgo(generation.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        initialIndex={lightboxIndex}
      />

      {/* Interactive Extend Video Dialog */}
      <InteractiveExtendDialog
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        framePath={generation.extractedFramePath}
        videoUrl={generation.videos[extendVideoIndex]}
        originalPrompt={generation.prompt}
        onExtensionStart={handleExtensionStart}
      />
    </div>
  );
} 