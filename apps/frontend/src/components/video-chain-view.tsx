"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, PlaySquareIcon, ChevronRightIcon, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { InteractiveExtendDialog } from "@/components/interactive-extend-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface VideoInChain {
  id: string;
  videoUrl: string;
  prompt: string;
  duration: number;
  model?: string;
  cost?: number;
  extractedFramePath?: string;
  canExtend: boolean;
  timestamp: Date;
}

interface VideoChainViewProps {
  chain: VideoInChain[];
  onExtensionStart: (params: {
    framePath: string;
    model: 'sora-2' | 'sora-2-pro' | 'veo3';
    prompt: string;
    duration: 4 | 6 | 8;
    aspectRatio: '16:9' | '9:16' | '1:1';
  }) => void;
}

export function VideoChainView({ chain, onExtensionStart }: VideoChainViewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [mutedVideos, setMutedVideos] = useState<Map<number, boolean>>(new Map());
  const { toast } = useToast();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleDownload = async (videoUrl: string, index: number) => {
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `chain-video-${index + 1}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleToggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      const newMutedState = !video.muted;
      video.muted = newMutedState;
      setMutedVideos(prev => new Map(prev).set(index, newMutedState));
    }
  };

  const lastVideo = chain[chain.length - 1];
  const totalDuration = chain.reduce((sum, v) => sum + v.duration, 0);
  const totalCost = chain.reduce((sum, v) => sum + (v.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Chain Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video Chain</h3>
          <p className="text-sm text-muted-foreground">
            {chain.length} segment{chain.length > 1 ? 's' : ''} " {totalDuration}s total
            {totalCost > 0 && ` " $${totalCost.toFixed(2)}`}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Interactive Extension
        </Badge>
      </div>

      {/* Video Timeline */}
      <div className="relative">
        {/* Connection Line (behind cards) */}
        {chain.length > 1 && (
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -z-10" />
        )}

        <div className="space-y-8">
          {chain.map((video, index) => (
            <div key={video.id} className="relative">
              {/* Segment Number Badge */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="ml-8"
              >
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-[300px_1fr] gap-4 p-4">
                    {/* Video Player */}
                    <div
                      className="relative group"
                      onMouseEnter={() => {
                        setHoveredIndex(index);
                        const vid = videoRefs.current[index];
                        if (vid && vid.readyState >= 3) {
                          vid.play().catch(() => {});
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        const vid = videoRefs.current[index];
                        if (vid && !vid.paused) {
                          vid.pause();
                        }
                      }}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                        <video
                          ref={(el) => { videoRefs.current[index] = el; }}
                          className="w-full h-full object-cover"
                          preload="auto"
                          muted
                          loop
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                        </video>

                        {/* Video Controls */}
                        <motion.div
                          className="absolute bottom-2 right-2 flex gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleToggleMute(index)}
                            className="h-7 w-7 p-0"
                          >
                            {mutedVideos.get(index) === false ? (
                              <Volume2 className="w-3 h-3" />
                            ) : (
                              <VolumeX className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(video.videoUrl, index)}
                            className="h-7 w-7 p-0"
                          >
                            <DownloadIcon className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {video.prompt}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {video.model && (
                          <Badge variant="outline" className="text-xs">
                            {video.model}
                          </Badge>
                        )}
                        <span>{video.duration}s</span>
                        {video.cost !== undefined && (
                          <span className="text-primary">${video.cost.toFixed(2)}</span>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(video.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Extracted Frame Preview (if available and not last) */}
                      {video.extractedFramePath && index < chain.length - 1 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">
                            Continuity frame used for next segment:
                          </p>
                          <div className="relative w-24 h-14 rounded border border-border overflow-hidden">
                            <Image
                              src={`/api/videos/${encodeURIComponent(video.extractedFramePath)}`}
                              alt="Continuity frame"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}

                      {/* Extend Button (only on last video if canExtend) */}
                      {index === chain.length - 1 && video.canExtend && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => setExtendDialogOpen(true)}
                            className="gap-2"
                          >
                            <PlaySquareIcon className="w-4 h-4" />
                            Extend from here
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Arrow Connector (between segments) */}
              {index < chain.length - 1 && (
                <div className="flex items-center justify-center my-4 ml-8">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-px w-8 bg-border"></div>
                    <ChevronRightIcon className="w-4 h-4 rotate-90 text-primary" />
                    <div className="h-px w-8 bg-border"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Extend Dialog */}
      {lastVideo && (
        <InteractiveExtendDialog
          open={extendDialogOpen}
          onOpenChange={setExtendDialogOpen}
          framePath={lastVideo.extractedFramePath}
          videoUrl={lastVideo.videoUrl}
          originalPrompt={lastVideo.prompt}
          onExtensionStart={onExtensionStart}
        />
      )}
    </div>
  );
}
