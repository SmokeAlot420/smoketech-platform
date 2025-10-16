'use client';

import { X, Download, RotateCcw, CheckCircle, Video, PlaySquare } from 'lucide-react';
import { useState } from 'react';
import { ExtendVideoDialog } from '@/components/extend-video-dialog';

interface VideoResultModalProps {
  isOpen: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  operationId: string;
  prompt?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    fileSize?: string;
  };
  onDownload: () => void;
  onRegenerate: () => void;
  onExtend?: (extendedVideoUrl: string) => void;
  onClose: () => void;
}

export default function VideoResultModal({
  isOpen,
  videoUrl,
  thumbnailUrl,
  operationId,
  prompt = '',
  metadata,
  onDownload,
  onRegenerate,
  onExtend,
  onClose,
}: VideoResultModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Video Generated Successfully!</h2>
              <p className="text-sm text-slate-400">Operation ID: {operationId.slice(-8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="p-6">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Video not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          {metadata && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {metadata.duration && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-white">{metadata.duration}s</p>
                </div>
              )}
              {metadata.resolution && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Resolution</p>
                  <p className="text-lg font-semibold text-white">{metadata.resolution}</p>
                </div>
              )}
              {metadata.fileSize && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">File Size</p>
                  <p className="text-lg font-semibold text-white">{metadata.fileSize}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onDownload}
            disabled={!videoUrl}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
          >
            <Download className="w-5 h-5" />
            Download Video
          </button>
          <button
            onClick={() => setExtendDialogOpen(true)}
            disabled={!videoUrl}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
          >
            <PlaySquare className="w-5 h-5" />
            Extend
          </button>
          <button
            onClick={onRegenerate}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            Regenerate
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              💡 <span className="font-semibold">Tip:</span> Right-click the video to save, or use the Download button above.
              Videos are saved to <code className="px-2 py-1 bg-slate-800 rounded">generated/videos/</code>
            </p>
          </div>
        </div>
      </div>

      {/* Extend Video Dialog */}
      {videoUrl && (
        <ExtendVideoDialog
          open={extendDialogOpen}
          onOpenChange={setExtendDialogOpen}
          videoUrl={videoUrl}
          originalPrompt={prompt}
          onExtensionComplete={(extendedVideoUrl) => {
            if (onExtend) {
              onExtend(extendedVideoUrl);
            }
          }}
        />
      )}
    </div>
  );
}
