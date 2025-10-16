"use client";

import { useState, useEffect } from "react";
import { VideoGrid } from "@/components/video-grid";
import { motion } from "framer-motion";
import { Video, Loader2 } from "lucide-react";

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
}

export default function GeneratedVideosPage() {
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load videos from filesystem API on mount
  useEffect(() => {
    const loadVideosFromDisk = async () => {
      try {
        const response = await fetch('/api/list-videos');
        const data = await response.json();

        if (data.success && data.videos.length > 0) {
          const formattedVideos = data.videos.map((video: any) => ({
            id: video.id,
            prompt: video.title,
            videos: [video.videoUrl],
            timestamp: new Date(video.timestamp),
            isLoading: false,
            type: video.type,
            metadata: {
              model: video.model || 'veo-3.0-fast',
              duration: video.duration,
              cost: video.cost,
              generationTime: video.generationTime || 0
            }
          } as VideoGeneration));

          setVideos(formattedVideos);
          console.log(`✅ Loaded ${formattedVideos.length} videos from disk`);
        }
      } catch (error) {
        console.error('Failed to load videos from disk:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideosFromDisk();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Generated Videos</h1>
          </div>
          <p className="text-gray-600">
            All VEO3 videos from public/generated/veo3/ directory
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading videos from disk...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Video className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Videos Found
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              Generate some VEO3 videos from the homepage to see them here!
            </p>
          </motion.div>
        )}

        {/* Video Grid */}
        {!isLoading && videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 text-sm text-gray-600">
              Showing {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </div>
            <div className="space-y-6">
              {videos.map((video) => (
                <VideoGrid
                  key={video.id}
                  generation={video}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
