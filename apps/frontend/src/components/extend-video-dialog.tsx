"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FilmIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { AdvancedSegmentBuilder } from './advanced-segment-builder';
import { SegmentBuilderConfig, SEGMENT_PRESETS } from '@/types/segmentBuilder';
import { buildVEO3JSONPrompt, applyPreset } from '@/utils/segmentPromptBuilder';

interface ExtendVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  originalPrompt: string;
  onExtensionComplete: (extendedVideoUrl: string) => void;
}

export function ExtendVideoDialog({
  open,
  onOpenChange,
  videoUrl,
  originalPrompt,
  onExtensionComplete
}: ExtendVideoDialogProps) {
  const [mode, setMode] = useState<'smart' | 'loop' | 'sequential'>('smart');
  const [prompt, setPrompt] = useState(originalPrompt);
  const [duration, setDuration] = useState<4 | 6 | 8>(8);
  const [loopCount, setLoopCount] = useState(7); // 7 loops = ~56 seconds
  const [numberOfExtensions, setNumberOfExtensions] = useState(7); // 7 extensions = ~64 seconds
  const [transitionStyle, setTransitionStyle] = useState<'cut' | 'fade' | 'crossfade'>('fade');
  const [sequentialMode, setSequentialMode] = useState<'simple' | 'advanced'>('simple');
  const [segmentPrompts, setSegmentPrompts] = useState<string[]>(Array(7).fill(''));
  const [segmentConfigs, setSegmentConfigs] = useState<SegmentBuilderConfig[]>(
    Array(7).fill(null).map(() => applyPreset('talking_head'))
  );
  const [segmentValidations, setSegmentValidations] = useState<boolean[]>(Array(7).fill(false));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Sync segment arrays with numberOfExtensions
  useEffect(() => {
    // Sync old string-based prompts (for Simple mode)
    setSegmentPrompts(prev => {
      const newPrompts = Array(numberOfExtensions).fill('');
      for (let i = 0; i < Math.min(prev.length, numberOfExtensions); i++) {
        newPrompts[i] = prev[i] || '';
      }
      return newPrompts;
    });

    // Sync new config-based segments (for Advanced mode)
    setSegmentConfigs(prev => {
      const newConfigs = Array(numberOfExtensions).fill(null).map((_, i) =>
        i < prev.length ? prev[i] : applyPreset('talking_head')
      );
      return newConfigs;
    });

    // Sync validation array
    setSegmentValidations(Array(numberOfExtensions).fill(false));
  }, [numberOfExtensions]);

  const handleExtend = async () => {
    // Validation based on mode
    if (mode === 'smart' && !prompt.trim()) return;
    if (mode === 'loop' && loopCount < 2) return;
    if (mode === 'sequential') {
      if (sequentialMode === 'simple' && !prompt.trim()) return;
      if (sequentialMode === 'advanced' && !segmentValidations.every(v => v)) return; // All segments must be valid
      if (numberOfExtensions < 1) return;
    }

    setIsGenerating(true);
    setProgress(0);
    const initialMessage =
      mode === 'smart' ? 'Extracting last frame...' :
      mode === 'loop' ? 'Preparing loop extension...' :
      'Starting sequential extension...';
    setProgressMessage(initialMessage);

    try {
      // Call the appropriate API based on mode
      const apiEndpoint =
        mode === 'smart' ? '/api/extend-video' :
        mode === 'loop' ? '/api/loop-extend' :
        '/api/sequential-extend';

      // Convert segmentConfigs to JSON prompts for Advanced Mode
      const advancedModePrompts = sequentialMode === 'advanced'
        ? segmentConfigs.map((config, i) =>
            JSON.stringify(buildVEO3JSONPrompt(config, i, numberOfExtensions, duration as 4 | 6 | 8))
          )
        : [];

      const requestBody =
        mode === 'smart' ? { videoUrl, prompt: prompt.trim(), duration, platform: 'youtube' } :
        mode === 'loop' ? { videoUrl, loopCount, platform: 'youtube', transitionStyle } :
        sequentialMode === 'simple'
          ? { videoUrl, numberOfExtensions, continuationPrompt: prompt.trim(), duration, platform: 'youtube' }
          : { videoUrl, numberOfExtensions, segmentPrompts: advancedModePrompts, duration, platform: 'youtube' };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to start video extension');
      }

      const data = await response.json();
      const { operationId } = data;

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/extend-video/status/${operationId}`);
        const statusData = await statusResponse.json();

        if (statusData.progress) {
          setProgress(statusData.progress);
          setProgressMessage(statusData.message || 'Generating...');
        }

        if (statusData.status === 'complete') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          onOpenChange(false);
          onExtensionComplete(statusData.extendedVideoUrl);
          setPrompt(originalPrompt); // Reset
        } else if (statusData.status === 'error') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          console.error('Extension error:', statusData.error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error extending video:', error);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilmIcon className="w-5 h-5" />
            Extend Video
          </DialogTitle>
          <DialogDescription>
            Choose your extension method: Smart Extend generates one new segment, Loop Extend repeats the same video, Sequential Extend generates multiple NEW segments that flow seamlessly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label htmlFor="mode">Extension Mode</Label>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as 'smart' | 'loop' | 'sequential')}
              disabled={isGenerating}
            >
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">
                  <div className="flex flex-col">
                    <span className="font-semibold">Smart Extend</span>
                    <span className="text-xs text-muted-foreground">Generate ONE new segment ($1.20/8s)</span>
                  </div>
                </SelectItem>
                <SelectItem value="sequential">
                  <div className="flex flex-col">
                    <span className="font-semibold">Sequential Extend</span>
                    <span className="text-xs text-muted-foreground">Generate MULTIPLE new segments, seamless flow ($1.20/8s × N)</span>
                  </div>
                </SelectItem>
                <SelectItem value="loop">
                  <div className="flex flex-col">
                    <span className="font-semibold">Loop Extend</span>
                    <span className="text-xs text-muted-foreground">Repeat same video multiple times ($0.05 total)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Smart Mode: Duration Selector */}
          {mode === 'smart' && (
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
          )}

          {/* Sequential Mode: Number of Extensions & Duration */}
          {mode === 'sequential' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="numberOfExtensions">Number of Extensions</Label>
                <Select
                  value={numberOfExtensions.toString()}
                  onValueChange={(v) => setNumberOfExtensions(parseInt(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="numberOfExtensions">
                    <SelectValue placeholder="Select extensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 extensions (~24s total, $2.40)</SelectItem>
                    <SelectItem value="3">3 extensions (~32s total, $3.60)</SelectItem>
                    <SelectItem value="4">4 extensions (~40s total, $4.80)</SelectItem>
                    <SelectItem value="5">5 extensions (~48s total, $6.00)</SelectItem>
                    <SelectItem value="6">6 extensions (~56s total, $7.20)</SelectItem>
                    <SelectItem value="7">7 extensions (~64s total, $8.40)</SelectItem>
                    <SelectItem value="8">8 extensions (~72s total, $9.60)</SelectItem>
                    <SelectItem value="9">9 extensions (~80s total, $10.80)</SelectItem>
                    <SelectItem value="10">10 extensions (~88s total, $12.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequentialDuration">Segment Duration</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(v) => setDuration(parseInt(v) as 4 | 6 | 8)}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="sequentialDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 seconds per segment</SelectItem>
                    <SelectItem value="6">6 seconds per segment</SelectItem>
                    <SelectItem value="8">8 seconds per segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Loop Mode: Loop Count & Transition Style */}
          {mode === 'loop' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="loopCount">Number of Loops</Label>
                <Select
                  value={loopCount.toString()}
                  onValueChange={(v) => setLoopCount(parseInt(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="loopCount">
                    <SelectValue placeholder="Select loops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 loops (~16s)</SelectItem>
                    <SelectItem value="3">3 loops (~24s)</SelectItem>
                    <SelectItem value="4">4 loops (~32s)</SelectItem>
                    <SelectItem value="5">5 loops (~40s)</SelectItem>
                    <SelectItem value="6">6 loops (~48s)</SelectItem>
                    <SelectItem value="7">7 loops (~56s)</SelectItem>
                    <SelectItem value="8">8 loops (~64s)</SelectItem>
                    <SelectItem value="9">9 loops (~72s)</SelectItem>
                    <SelectItem value="10">10 loops (~80s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transition">Transition Style</Label>
                <Select
                  value={transitionStyle}
                  onValueChange={(v) => setTransitionStyle(v as 'cut' | 'fade' | 'crossfade')}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="transition">
                    <SelectValue placeholder="Select transition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cut">Cut (no transition)</SelectItem>
                    <SelectItem value="fade">Fade (smooth blend)</SelectItem>
                    <SelectItem value="crossfade">Crossfade (audio + video)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Smart Mode: Prompt Input */}
          {mode === 'smart' && (
            <div className="space-y-2">
              <Label htmlFor="extend-prompt">Prompt for Extended Segment</Label>
              <Textarea
                id="extend-prompt"
                placeholder="Continue the story... What happens next?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {/* Sequential Mode: Prompt Input with Simple/Advanced Toggle */}
          {mode === 'sequential' && (
            <div className="space-y-4">
              {/* Simple/Advanced Mode Toggle */}
              <div className="space-y-2">
                <Label>Prompt Mode</Label>
                <Tabs value={sequentialMode} onValueChange={(v) => setSequentialMode(v as 'simple' | 'advanced')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple" disabled={isGenerating}>
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Simple (Auto-Generate)
                    </TabsTrigger>
                    <TabsTrigger value="advanced" disabled={isGenerating}>
                      Advanced (Customize)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Simple Mode: Single Master Prompt */}
              {sequentialMode === 'simple' && (
                <div className="space-y-2">
                  <Label htmlFor="sequential-prompt">Master Prompt</Label>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3" />
                    Smart prompts will be generated automatically for each of the {numberOfExtensions} segments
                  </p>
                  <Textarea
                    id="sequential-prompt"
                    placeholder="Example: 'Explain QuoteMoto insurance benefits: instant quotes, no personal info needed, compare 50+ insurers, savings calculator, easy signup'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-green-600">
                    ✨ AI will automatically split this into {numberOfExtensions} segment-specific prompts with proper CONTINUE, PACING, and TRANSITION instructions
                  </p>
                </div>
              )}

              {/* Advanced Mode: Dropdown-Based Segment Builder */}
              {sequentialMode === 'advanced' && (
                <div className="space-y-4">
                  {/* Bulk Preset Application */}
                  <div className="space-y-2">
                    <Label>Quick Setup</Label>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(preset) => {
                        const newConfigs = segmentConfigs.map(() => applyPreset(preset as keyof typeof SEGMENT_PRESETS));
                        setSegmentConfigs(newConfigs);
                      }}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Apply preset to all segments..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SEGMENT_PRESETS).map(([key, preset]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col">
                                <span className="font-medium">{preset.name}</span>
                                <span className="text-xs text-muted-foreground">{preset.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Applies camera, lighting, and character settings to all {numberOfExtensions} segments
                      </p>
                    </div>
                  </div>

                  {/* Individual Segment Builders */}
                  <div className="space-y-2">
                    <Label>Segment Configuration</Label>
                    <p className="text-xs text-muted-foreground">
                      Configure each {duration}s segment with dropdown menus. Green checkmarks indicate valid configuration.
                    </p>
                    <Accordion type="multiple" className="w-full">
                      {Array.from({ length: numberOfExtensions }, (_, i) => (
                        <AccordionItem key={i} value={`segment-${i}`}>
                          <AccordionTrigger className="text-sm">
                            Segment {i + 1} ({duration}s)
                            {segmentValidations[i] && <span className="ml-2 text-green-600">✓</span>}
                          </AccordionTrigger>
                          <AccordionContent>
                            <AdvancedSegmentBuilder
                              segmentNumber={i + 1}
                              config={segmentConfigs[i]}
                              onChange={(config) => {
                                const newConfigs = [...segmentConfigs];
                                newConfigs[i] = config;
                                setSegmentConfigs(newConfigs);
                              }}
                              onValidationChange={(isValid) => {
                                const newValidations = [...segmentValidations];
                                newValidations[i] = isValid;
                                setSegmentValidations(newValidations);
                              }}
                              showPresets={false}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <p className="text-xs text-amber-600">
                      ⚠️ Each prompt should end at a natural pause for seamless transitions
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Display */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progressMessage}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

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
              onClick={handleExtend}
              disabled={
                isGenerating ||
                (mode === 'smart' && !prompt.trim()) ||
                (mode === 'sequential' && sequentialMode === 'simple' && !prompt.trim()) ||
                (mode === 'sequential' && sequentialMode === 'advanced' && !segmentValidations.every(v => v))
              }
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'smart' ? 'Generating...' : mode === 'sequential' ? 'Generating Segments...' : 'Stitching...'}
                </>
              ) : (
                <>
                  {mode === 'smart' ? 'Generate Extension' : mode === 'sequential' ? `Generate ${numberOfExtensions} Segments` : 'Create Loop'}
                  <span className="ml-2 text-xs opacity-75">
                    ({
                      mode === 'smart' ? `$${(duration / 8 * 1.20).toFixed(2)}` :
                      mode === 'sequential' ? `$${(duration / 8 * 1.20 * numberOfExtensions).toFixed(2)}` :
                      '$0.05'
                    })
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
