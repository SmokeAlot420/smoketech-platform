"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FilmIcon, Loader2Icon, SparklesIcon, ZapIcon, SettingsIcon } from 'lucide-react';
import { AdvancedSegmentBuilder } from './advanced-segment-builder';
import { SegmentBuilderConfig, SEGMENT_PRESETS } from '@/types/segmentBuilder';
import { buildVEO3JSONPrompt, applyPreset } from '@/utils/segmentPromptBuilder';
import { useRouter } from 'next/navigation';

interface GenerateVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateVideoDialog({
  open,
  onOpenChange
}: GenerateVideoDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [prompt, setPrompt] = useState('');

  // Simple Mode states
  const [character, setCharacter] = useState<'male' | 'female'>('female');
  const [tone, setTone] = useState('professional');
  const [environment, setEnvironment] = useState('office');
  const [videoLength, setVideoLength] = useState(56); // in seconds

  // Model selection (shared across modes)
  const [model, setModel] = useState<'veo3' | 'sora-2' | 'sora-2-pro'>('veo3');

  // Power Mode states
  const [duration, setDuration] = useState<4 | 6 | 8>(8);
  const [powerModeVideoLength, setPowerModeVideoLength] = useState(56); // in seconds
  const [videoStyle, setVideoStyle] = useState<'single' | 'sequential'>('sequential');
  const [numberOfSegments, setNumberOfSegments] = useState(7); // calculated from powerModeVideoLength
  const [segmentConfigs, setSegmentConfigs] = useState<SegmentBuilderConfig[]>(
    Array(7).fill(null).map(() => applyPreset('talking_head'))
  );
  const [segmentValidations, setSegmentValidations] = useState<boolean[]>(Array(7).fill(false));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedVideoPath, setGeneratedVideoPath] = useState<string>('');
  const [generatedFramePath, setGeneratedFramePath] = useState<string>('');

  // Auto-calculate segments from video length in Simple Mode
  useEffect(() => {
    if (mode === 'simple') {
      const calculatedSegments = Math.ceil(videoLength / duration);
      setNumberOfSegments(calculatedSegments);
    }
  }, [mode, videoLength, duration]);

  // Auto-calculate segments from power mode video length
  useEffect(() => {
    if (mode === 'advanced') {
      const calculatedSegments = videoStyle === 'single' ? 1 : Math.ceil(powerModeVideoLength / duration);
      setNumberOfSegments(calculatedSegments);
    }
  }, [mode, powerModeVideoLength, duration, videoStyle]);

  // Sync segment arrays with numberOfSegments
  useEffect(() => {
    setSegmentConfigs(prev => {
      const newConfigs = Array(numberOfSegments).fill(null).map((_, i) =>
        i < prev.length ? prev[i] : applyPreset('talking_head')
      );
      return newConfigs;
    });

    setSegmentValidations(Array(numberOfSegments).fill(false));
  }, [numberOfSegments]);

  const handleGenerate = async () => {
    // Validation based on mode
    if (mode === 'simple' && !prompt.trim()) return;
    if (mode === 'advanced' && videoStyle === 'sequential' && !segmentValidations.every(v => v)) return;
    if (numberOfSegments < 1) return;

    setIsGenerating(true);
    setProgress(0);
    const initialMessage = mode === 'simple'
      ? 'Starting video generation...'
      : 'Generating segments...';
    setProgressMessage(initialMessage);

    try {
      // Use sequential extend endpoint without videoUrl for new video generation
      const apiEndpoint = '/api/generate-videos';

      // Convert segmentConfigs to prompts for Advanced Mode
      // VEO3 uses JSON prompts, Sora 2 uses simple text prompts
      const advancedModePrompts = mode === 'advanced'
        ? segmentConfigs.map((config, i) => {
            if (model === 'veo3') {
              // VEO3: Use JSON-structured prompts
              return JSON.stringify(buildVEO3JSONPrompt(config, i, numberOfSegments, duration as 4 | 6 | 8));
            } else {
              // Sora 2: Use simple dialogue text
              return config.dialogue || `Segment ${i + 1}`;
            }
          })
        : [];

      const requestBody = mode === 'simple'
        ? {
            prompt: prompt.trim(),
            character,
            tone,
            environment,
            videoLength,
            numberOfSegments,
            duration,
            platform: 'youtube',
            mode: 'simple',
            model
          }
        : {
            videoStyle,
            powerModeVideoLength,
            segmentPrompts: advancedModePrompts,
            numberOfSegments,
            duration,
            platform: 'youtube',
            mode: 'advanced',
            model
          };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      const data = await response.json();
      const { operationId } = data;

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/generate-videos/status/${operationId}`);
        const statusData = await statusResponse.json();

        if (statusData.progress) {
          setProgress(statusData.progress);
          setProgressMessage(statusData.message || 'Generating...');
        }

        if (statusData.status === 'complete') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setShowSuccess(true);
          // Store the generated video paths from result object
          if (statusData.result?.videos && statusData.result.videos.length > 0) {
            setGeneratedVideoPath(statusData.result.videos[0].url);
          }
          if (statusData.result?.extractedFramePath) {
            setGeneratedFramePath(statusData.result.extractedFramePath);
          }
        } else if (statusData.status === 'error') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          console.error('Generation error:', statusData.error);
          setProgressMessage(`Error: ${statusData.error}`);
        }
      }, 2000);

    } catch (error) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      setProgressMessage('Failed to generate video. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilmIcon className="w-5 h-5" />
            {showSuccess ? 'Video Generated Successfully!' : 'Generate Video'}
          </DialogTitle>
          <DialogDescription>
            {showSuccess
              ? 'Your video is ready! You can extend it with additional segments or view it in the gallery.'
              : 'Create professional AI-generated videos using Simple Mode (quick setup) or Power Mode (advanced controls).'}
          </DialogDescription>
        </DialogHeader>

        {/* Success View: Show video with Extend button */}
        {showSuccess ? (
          <div className="space-y-4 pt-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {generatedVideoPath ? (
                <video
                  src={generatedVideoPath}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Video not available
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  // Extend: Reset and reopen generation dialog for next segment
                  console.log('Extending video:', generatedVideoPath, 'Frame:', generatedFramePath);
                  setShowSuccess(false);
                  setIsGenerating(false);
                  setProgress(0);
                  setProgressMessage('');
                  // Keep current settings for next segment generation
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Extend Video - Add More Segments
              </Button>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  onOpenChange(false);
                  router.push('/generated-videos');
                  router.refresh();
                }}
                variant="outline"
                className="w-full"
              >
                View in Gallery
              </Button>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setGeneratedVideoPath('');
                  setGeneratedFramePath('');
                  setPrompt('');
                  setProgress(0);
                  setProgressMessage('');
                }}
                variant="ghost"
                className="w-full"
              >
                Generate Another Video
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {/* Mode Toggle: Simple vs Power */}
          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'advanced')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" disabled={isGenerating}>
                  <ZapIcon className="w-4 h-4 mr-2 text-blue-500" />
                  Simple Mode
                </TabsTrigger>
                <TabsTrigger value="advanced" disabled={isGenerating}>
                  <SettingsIcon className="w-4 h-4 mr-2 text-purple-500" />
                  Power Mode
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {mode === 'simple'
                ? '✨ AI auto-generates segment-specific prompts from your master prompt'
                : '🎬 Customize every detail with 50+ professional controls per segment'}
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-select">AI Model</Label>
            <Select
              value={model}
              onValueChange={(v) => setModel(v as 'veo3' | 'sora-2' | 'sora-2-pro')}
              disabled={isGenerating}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veo3">
                  <div className="flex flex-col">
                    <span className="font-medium">VEO3 (Google)</span>
                    <span className="text-xs text-muted-foreground">$0.10/sec - Fast, high quality</span>
                  </div>
                </SelectItem>
                <SelectItem value="sora-2">
                  <div className="flex flex-col">
                    <span className="font-medium">Sora 2 (OpenAI)</span>
                    <span className="text-xs text-muted-foreground">$0.10/sec - Cinematic quality</span>
                  </div>
                </SelectItem>
                <SelectItem value="sora-2-pro">
                  <div className="flex flex-col">
                    <span className="font-medium">Sora 2 Pro (OpenAI)</span>
                    <span className="text-xs text-muted-foreground">$0.20/sec - Ultra high quality</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {model === 'veo3' && '🚀 Google VEO3 - Fast generation with excellent quality'}
              {model === 'sora-2' && '🎬 OpenAI Sora 2 - Cinematic video generation with advanced motion'}
              {model === 'sora-2-pro' && '✨ OpenAI Sora 2 Pro - Maximum quality for professional productions'}
            </p>
          </div>

          {/* Power Mode: Video Length → Video Style → Segment Customization */}
          {mode === 'advanced' && (
            <div className="space-y-4">
              {/* Step 1: Video Length */}
              <div className="space-y-2">
                <Label htmlFor="power-video-length">How long should your video be?</Label>
                <Select
                  value={powerModeVideoLength.toString()}
                  onValueChange={(v) => setPowerModeVideoLength(parseInt(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="power-video-length">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 seconds - Quick teaser</SelectItem>
                    <SelectItem value="16">16 seconds - Short clip</SelectItem>
                    <SelectItem value="32">32 seconds - Medium video</SelectItem>
                    <SelectItem value="56">56 seconds - Full explanation</SelectItem>
                    <SelectItem value="120">2 minutes - Detailed walkthrough</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Video Style */}
              <div className="space-y-2">
                <Label>Video Style</Label>
                <RadioGroup
                  value={videoStyle}
                  onValueChange={(v) => setVideoStyle(v as 'single' | 'sequential')}
                  disabled={isGenerating}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="single" id="single" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="single" className="font-semibold cursor-pointer">Single Scene</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate one {duration}-second video and loop/extend it to fill {powerModeVideoLength} seconds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="sequential" id="sequential" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="sequential" className="font-semibold cursor-pointer">Sequential Scenes</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Split into {Math.ceil(powerModeVideoLength / duration)} different {duration}-second segments that tell a story
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Step 3: Segment Duration (for Sequential style) */}
              {videoStyle === 'sequential' && (
                <div className="space-y-2">
                  <Label htmlFor="segment-duration">Segment Duration</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(v) => setDuration(parseInt(v) as 4 | 6 | 8)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="segment-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 seconds per segment ({Math.ceil(powerModeVideoLength / 4)} segments total)</SelectItem>
                      <SelectItem value="6">6 seconds per segment ({Math.ceil(powerModeVideoLength / 6)} segments total)</SelectItem>
                      <SelectItem value="8">8 seconds per segment ({Math.ceil(powerModeVideoLength / 8)} segments total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Simple Mode: Dead Simple UI */}
          {mode === 'simple' && (
            <div className="space-y-4">
              {/* Master Prompt */}
              <div className="space-y-2">
                <Label htmlFor="master-prompt">What do you want your video to say?</Label>
                <Textarea
                  id="master-prompt"
                  placeholder="Example: 'Explain how QuoteMoto helps California drivers save up to $500 per year by comparing 50+ insurance companies in just 5 minutes'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  ✨ AI will automatically create a professional video script
                </p>
              </div>

              {/* Video Length */}
              <div className="space-y-2">
                <Label htmlFor="video-length">How long should your video be?</Label>
                <Select
                  value={videoLength.toString()}
                  onValueChange={(v) => setVideoLength(parseInt(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="video-length">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 seconds (Quick teaser)</SelectItem>
                    <SelectItem value="16">16 seconds (Short clip)</SelectItem>
                    <SelectItem value="32">32 seconds (Medium video)</SelectItem>
                    <SelectItem value="56">56 seconds (Full explanation)</SelectItem>
                    <SelectItem value="120">2 minutes (Detailed walkthrough)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Character Gender */}
              <div className="space-y-2">
                <Label>Who should present your video?</Label>
                <RadioGroup
                  value={character}
                  onValueChange={(v) => setCharacter(v as 'male' | 'female')}
                  disabled={isGenerating}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">Female presenter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">Male presenter</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="tone">What tone should the video have?</Label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional - Business and trustworthy</SelectItem>
                    <SelectItem value="casual">Casual - Friendly and relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic - Upbeat and exciting</SelectItem>
                    <SelectItem value="friendly">Friendly - Warm and approachable</SelectItem>
                    <SelectItem value="serious">Serious - Direct and authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <Label htmlFor="environment">Where should the video take place?</Label>
                <Select
                  value={environment}
                  onValueChange={setEnvironment}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="environment">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office - Professional workspace</SelectItem>
                    <SelectItem value="outdoor">Outdoor - Natural setting</SelectItem>
                    <SelectItem value="home">Home - Comfortable interior</SelectItem>
                    <SelectItem value="studio">Studio - Clean modern background</SelectItem>
                    <SelectItem value="street">Street - Urban environment</SelectItem>
                    <SelectItem value="cafe">Cafe - Casual meeting space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Power Mode: Advanced Segment Builder (Sequential Style Only) */}
          {mode === 'advanced' && videoStyle === 'sequential' && (
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
                    Applies settings to all {numberOfSegments} segments
                  </p>
                </div>
              </div>

              {/* Individual Segment Builders */}
              <div className="space-y-2">
                <Label>Segment Configuration</Label>
                <p className="text-xs text-muted-foreground">
                  Configure each {duration}s segment with Simple/Power Mode controls. Green checkmarks indicate valid configuration.
                </p>
                <Accordion type="multiple" className="w-full">
                  {Array.from({ length: numberOfSegments }, (_, i) => (
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
              </div>
            </div>
          )}

          {/* Progress Display */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2Icon className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{progressMessage}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">{progress}%</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (mode === 'simple' && !prompt.trim()) ||
                (mode === 'advanced' && videoStyle === 'sequential' && !segmentValidations.every(v => v))
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FilmIcon className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
