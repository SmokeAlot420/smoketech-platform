"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilmIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import Image from 'next/image';

interface InteractiveExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framePath?: string; // Path to extracted frame
  videoUrl: string; // Previous video URL
  originalPrompt: string; // Previous video's prompt for context
  onExtensionStart: (params: {
    framePath: string;
    model: 'sora-2' | 'sora-2-pro' | 'veo3';
    prompt: string;
    duration: 4 | 6 | 8;
    aspectRatio: '16:9' | '9:16' | '1:1';
  }) => void;
}

export function InteractiveExtendDialog({
  open,
  onOpenChange,
  framePath,
  videoUrl,
  originalPrompt,
  onExtensionStart
}: InteractiveExtendDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'sora-2' | 'sora-2-pro' | 'veo3'>('sora-2');
  const [duration, setDuration] = useState<4 | 6 | 8>(8);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !framePath) return;

    setIsGenerating(true);

    try {
      await onExtensionStart({
        framePath,
        model,
        prompt: prompt.trim(),
        duration,
        aspectRatio
      });

      // Reset and close on success
      setPrompt('');
      setIsGenerating(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Extension failed:', error);
      setIsGenerating(false);
    }
  };

  // Calculate cost based on model and duration
  const getCost = () => {
    if (model === 'sora-2') {
      return (duration * 0.10).toFixed(2); // $0.10/second
    } else if (model === 'sora-2-pro') {
      return (duration * 0.20).toFixed(2); // $0.20/second
    } else {
      return '1.20'; // VEO3 flat rate ~$1.20 per 8s
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilmIcon className="w-5 h-5" />
            Extend Video - Interactive Mode
          </DialogTitle>
          <DialogDescription>
            Generate ONE new segment that continues from the last frame. Choose your model and describe what happens next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Frame Preview */}
          {framePath && (
            <div className="space-y-2">
              <Label>Starting Frame</Label>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={`/api/videos/${encodeURIComponent(framePath)}`}
                  alt="Final frame from previous video"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This frame will be used as the starting point for the new segment
              </p>
            </div>
          )}

          {/* Previous Prompt for Context */}
          <div className="space-y-2">
            <Label>Previous Segment</Label>
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              "{originalPrompt}"
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <Label htmlFor="model">Video Model</Label>
            <Select
              value={model}
              onValueChange={(v) => setModel(v as 'sora-2' | 'sora-2-pro' | 'veo3')}
              disabled={isGenerating}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sora-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">Sora 2</span>
                    <span className="text-xs text-muted-foreground">$0.10/second - Fast generation</span>
                  </div>
                </SelectItem>
                <SelectItem value="sora-2-pro">
                  <div className="flex flex-col">
                    <span className="font-semibold">Sora 2 Pro</span>
                    <span className="text-xs text-muted-foreground">$0.20/second - Higher quality</span>
                  </div>
                </SelectItem>
                <SelectItem value="veo3">
                  <div className="flex flex-col">
                    <span className="font-semibold">VEO3</span>
                    <span className="text-xs text-muted-foreground">~$1.20/8s - Google's latest model</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(v) => setDuration(parseInt(v) as 4 | 6 | 8)}
              disabled={isGenerating}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="6">6 seconds</SelectItem>
                <SelectItem value="8">8 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(v) => setAspectRatio(v as '16:9' | '9:16' | '1:1')}
              disabled={isGenerating}
            >
              <SelectTrigger id="aspectRatio">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (YouTube, Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (TikTok, Portrait)</SelectItem>
                <SelectItem value="1:1">1:1 (Instagram, Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="extend-prompt">
              What happens next?
              <span className="text-xs text-muted-foreground ml-2">
                <SparklesIcon className="w-3 h-3 inline mr-1" />
                Describe the continuation
              </span>
            </Label>
            <Textarea
              id="extend-prompt"
              placeholder="The camera zooms in as the person smiles and waves at the viewer..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-amber-600">
              Tip: Describe smooth transitions for seamless continuity
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !framePath}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Next Segment
                  <span className="ml-2 text-xs opacity-75">
                    (${getCost()})
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
