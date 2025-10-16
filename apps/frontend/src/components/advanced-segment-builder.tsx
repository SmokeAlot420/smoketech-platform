"use client";

import { useState, useEffect } from 'react';
import {
  SegmentBuilderConfig,
  SimpleSegmentConfig,
  PowerSegmentConfig,
  AdvancedMode,
  LABELS,
  SIMPLE_LABELS,
  SEGMENT_PRESETS
} from '@/types/segmentBuilder';
import { validateConfig, applyPreset } from '@/utils/segmentPromptBuilder';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CameraIcon,
  SunIcon,
  UserIcon,
  MapPinIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  SparklesIcon,
  ZapIcon,
  SettingsIcon
} from 'lucide-react';

interface AdvancedSegmentBuilderProps {
  segmentNumber: number; // 1-based index
  config: SegmentBuilderConfig | SimpleSegmentConfig | PowerSegmentConfig;
  onChange: (config: SegmentBuilderConfig | SimpleSegmentConfig | PowerSegmentConfig) => void;
  onValidationChange: (isValid: boolean) => void;
  showPresets?: boolean;
}

export function AdvancedSegmentBuilder({
  segmentNumber,
  config,
  onChange,
  onValidationChange,
  showPresets = true
}: AdvancedSegmentBuilderProps) {
  // Determine initial control level based on config (basic = SimpleMode, advanced = PowerMode)
  const initialMode: AdvancedMode = 'mode' in config ? config.mode : 'simple';

  const [controlLevel, setControlLevel] = useState<'basic' | 'advanced'>(initialMode === 'simple' ? 'basic' : 'advanced');
  const [localConfig, setLocalConfig] = useState<SimpleSegmentConfig | PowerSegmentConfig>(
    controlLevel === 'basic' ? initializeSimpleConfig(config) : initializePowerConfig(config)
  );
  const [validation, setValidation] = useState(validateConfig(localConfig as any));
  const [dialogueCharCount, setDialogueCharCount] = useState(localConfig.dialogue.length);

  // Validate and update parent whenever local config changes
  useEffect(() => {
    const validationResult = validateConfig(localConfig as any);
    setValidation(validationResult);
    onValidationChange(validationResult.isValid);
    onChange(localConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig]); // Only depend on localConfig to avoid infinite loop

  // Update dialogue character count
  useEffect(() => {
    setDialogueCharCount(localConfig.dialogue.length);
  }, [localConfig.dialogue]);

  // Handle control level change (Basic <-> Advanced)
  const handleControlLevelChange = (newLevel: 'basic' | 'advanced') => {
    setControlLevel(newLevel);

    // Convert config based on control level
    if (newLevel === 'basic') {
      setLocalConfig(convertToPowerToSimple(localConfig));
    } else {
      setLocalConfig(convertToSimpleToPower(localConfig));
    }
  };

  const handlePresetChange = (presetKey: string) => {
    const presetConfig = applyPreset(presetKey as keyof typeof SEGMENT_PRESETS);
    // Preserve dialogue when applying preset
    if (controlLevel === 'basic') {
      const simpleConfig = convertToSimple(presetConfig);
      setLocalConfig({
        ...simpleConfig,
        dialogue: localConfig.dialogue
      });
    } else {
      const powerConfig = convertToPower(presetConfig);
      setLocalConfig({
        ...powerConfig,
        dialogue: localConfig.dialogue
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Level Tabs - Basic (16 controls) vs Advanced (50+ controls) */}
      <Tabs value={controlLevel} onValueChange={(v) => handleControlLevelChange(v as 'basic' | 'advanced')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            <span>Basic Controls</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Advanced Controls</span>
          </TabsTrigger>
        </TabsList>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {controlLevel === 'basic' ? '16 essential controls for quick setup' : '50+ professional controls for advanced users'}
        </div>
      </Tabs>

      {/* Preset Selector */}
      {showPresets && (
        <div className="space-y-2">
          <Label htmlFor={`preset-${segmentNumber}`} className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Quick Preset
          </Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger id={`preset-${segmentNumber}`}>
              <SelectValue placeholder="Apply a preset template..." />
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
        </div>
      )}

      {/* Dialogue Input (shared by both modes) */}
      <div className="space-y-2">
        <Label htmlFor={`dialogue-${segmentNumber}`}>
          Dialogue (What character says)
        </Label>
        <Textarea
          id={`dialogue-${segmentNumber}`}
          placeholder="Enter 2-3 sentences for this segment..."
          value={localConfig.dialogue}
          onChange={(e) => setLocalConfig({ ...localConfig, dialogue: e.target.value })}
          rows={3}
          className="resize-none"
          maxLength={300}
        />
        <div className="flex justify-between text-xs">
          <span className={dialogueCharCount > 250 ? 'text-amber-600' : 'text-muted-foreground'}>
            {dialogueCharCount}/300 characters
          </span>
          {dialogueCharCount > 0 && (
            <span className="text-muted-foreground">
              ~{Math.ceil(dialogueCharCount / 150)} sentences
            </span>
          )}
        </div>
      </div>

      {/* Conditional Rendering Based on Control Level */}
      {controlLevel === 'basic' && <BasicControls config={localConfig as SimpleSegmentConfig} onChange={setLocalConfig} segmentNumber={segmentNumber} />}
      {controlLevel === 'advanced' && <AdvancedControls config={localConfig as PowerSegmentConfig} onChange={setLocalConfig} segmentNumber={segmentNumber} />}

      {/* Validation Feedback */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-amber-600">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.isValid && validation.warnings.length === 0 && localConfig.dialogue.trim() !== '' && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2Icon className="h-4 w-4" />
          Segment {segmentNumber} configured correctly
        </div>
      )}
    </div>
  );
}

// ==================== BASIC CONTROLS COMPONENT ====================
function BasicControls({
  config,
  onChange,
  segmentNumber
}: {
  config: SimpleSegmentConfig;
  onChange: (config: SimpleSegmentConfig) => void;
  segmentNumber: number;
}) {
  const updateConfig = (updates: Partial<SimpleSegmentConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCharacter = (updates: Partial<SimpleSegmentConfig['character']>) => {
    onChange({
      ...config,
      character: { ...config.character, ...updates }
    });
  };

  const updateCamera = (updates: Partial<SimpleSegmentConfig['camera']>) => {
    onChange({
      ...config,
      camera: { ...config.camera, ...updates }
    });
  };

  const updateLighting = (updates: Partial<SimpleSegmentConfig['lighting']>) => {
    onChange({
      ...config,
      lighting: { ...config.lighting, ...updates }
    });
  };

  const updateEnvironment = (updates: Partial<SimpleSegmentConfig['environment']>) => {
    onChange({
      ...config,
      environment: { ...config.environment, ...updates }
    });
  };

  const updateTechnical = (updates: Partial<SimpleSegmentConfig['technical']>) => {
    onChange({
      ...config,
      technical: { ...config.technical, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Character Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UserIcon className="w-4 h-4" />
          Character
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`gender-${segmentNumber}`} className="text-xs">Gender</Label>
            <Select value={config.character.gender} onValueChange={(v) => updateCharacter({ gender: v as any })}>
              <SelectTrigger id={`gender-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.gender).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`age-${segmentNumber}`} className="text-xs">Age Range</Label>
            <Select value={config.character.ageRange} onValueChange={(v) => updateCharacter({ ageRange: v as any })}>
              <SelectTrigger id={`age-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.ageRange).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`profession-${segmentNumber}`} className="text-xs">Profession</Label>
            <Select value={config.character.profession} onValueChange={(v) => updateCharacter({ profession: v as any })}>
              <SelectTrigger id={`profession-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.profession).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expression-${segmentNumber}`} className="text-xs">Expression</Label>
            <Select value={config.character.expression} onValueChange={(v) => updateCharacter({ expression: v as any })}>
              <SelectTrigger id={`expression-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.expression).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Camera Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CameraIcon className="w-4 h-4" />
          Camera
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`camera-motion-${segmentNumber}`} className="text-xs">Motion</Label>
            <Select value={config.camera.motion} onValueChange={(v) => updateCamera({ motion: v as any })}>
              <SelectTrigger id={`camera-motion-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.cameraMotion).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`camera-angle-${segmentNumber}`} className="text-xs">Angle</Label>
            <Select value={config.camera.angle} onValueChange={(v) => updateCamera({ angle: v as any })}>
              <SelectTrigger id={`camera-angle-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.cameraAngle).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`framing-${segmentNumber}`} className="text-xs">Framing</Label>
            <Select value={config.camera.framing} onValueChange={(v) => updateCamera({ framing: v as any })}>
              <SelectTrigger id={`framing-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.framing).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`camera-position-${segmentNumber}`} className="text-xs">Position</Label>
            <Select value={config.camera.position} onValueChange={(v) => updateCamera({ position: v as any })}>
              <SelectTrigger id={`camera-position-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.cameraPosition).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lighting Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SunIcon className="w-4 h-4" />
          Lighting
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`lighting-mood-${segmentNumber}`} className="text-xs">Mood</Label>
            <Select value={config.lighting.mood} onValueChange={(v) => updateLighting({ mood: v as any })}>
              <SelectTrigger id={`lighting-mood-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.lightingMood).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`time-of-day-${segmentNumber}`} className="text-xs">Time of Day</Label>
            <Select value={config.lighting.timeOfDay} onValueChange={(v) => updateLighting({ timeOfDay: v as any })}>
              <SelectTrigger id={`time-of-day-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.timeOfDay).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor={`lighting-style-${segmentNumber}`} className="text-xs">Style</Label>
            <Select value={config.lighting.style} onValueChange={(v) => updateLighting({ style: v as any })}>
              <SelectTrigger id={`lighting-style-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.lightingStyle).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Environment & Technical Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPinIcon className="w-4 h-4" />
          Environment & Technical
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`location-${segmentNumber}`} className="text-xs">Location</Label>
            <Select value={config.environment.location} onValueChange={(v) => updateEnvironment({ location: v as any })}>
              <SelectTrigger id={`location-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.location).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`atmosphere-${segmentNumber}`} className="text-xs">Atmosphere</Label>
            <Select value={config.environment.atmosphere} onValueChange={(v) => updateEnvironment({ atmosphere: v as any })}>
              <SelectTrigger id={`atmosphere-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.atmosphere).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`aspect-ratio-${segmentNumber}`} className="text-xs">Aspect Ratio</Label>
            <Select value={config.technical.aspectRatio} onValueChange={(v) => updateTechnical({ aspectRatio: v as any })}>
              <SelectTrigger id={`aspect-ratio-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.aspectRatio).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`duration-${segmentNumber}`} className="text-xs">Duration</Label>
            <Select value={config.technical.duration.toString()} onValueChange={(v) => updateTechnical({ duration: parseInt(v) as any })}>
              <SelectTrigger id={`duration-${segmentNumber}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIMPLE_LABELS.duration).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ADVANCED CONTROLS COMPONENT ====================
function AdvancedControls({
  config,
  onChange,
  segmentNumber
}: {
  config: PowerSegmentConfig;
  onChange: (config: PowerSegmentConfig) => void;
  segmentNumber: number;
}) {
  const updateConfig = (updates: Partial<PowerSegmentConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full" defaultValue={['basic']}>
        {/* Basic Settings */}
        <AccordionItem value="basic">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Basic Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Video Style */}
              <div className="space-y-2">
                <Label htmlFor={`style-${segmentNumber}`} className="text-xs">Video Style</Label>
                <Select value={config.style} onValueChange={(v) => updateConfig({ style: v as any })}>
                  <SelectTrigger id={`style-${segmentNumber}`} className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS.videoStyle).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label htmlFor={`quality-${segmentNumber}`} className="text-xs">Quality</Label>
                <Select value={config.quality} onValueChange={(v) => updateConfig({ quality: v as any })}>
                  <SelectTrigger id={`quality-${segmentNumber}`} className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS.quality).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label htmlFor={`power-aspect-${segmentNumber}`} className="text-xs">Aspect Ratio</Label>
                <Select value={config.aspectRatio} onValueChange={(v) => updateConfig({ aspectRatio: v as any })}>
                  <SelectTrigger id={`power-aspect-${segmentNumber}`} className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS.aspectRatio).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor={`power-duration-${segmentNumber}`} className="text-xs">Duration</Label>
                <Select value={config.duration.toString()} onValueChange={(v) => updateConfig({ duration: parseInt(v) as any })}>
                  <SelectTrigger id={`power-duration-${segmentNumber}`} className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4" className="text-sm">4 seconds</SelectItem>
                    <SelectItem value="6" className="text-sm">6 seconds</SelectItem>
                    <SelectItem value="8" className="text-sm">8 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Character Settings - Placeholder for next task */}
        <AccordionItem value="character">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Character (11 controls)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              Coming in next phase: Name, Gender, Age (18-80), Ethnicity, Profession, Emotion (20+ options), Pose, Movement, Actions, Clothing, Hair, Distance (1-10m)
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Camera Settings - Placeholder */}
        <AccordionItem value="camera">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <CameraIcon className="w-4 h-4" />
              Camera (9 controls)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              Coming in next phase: Lens, Aperture, Angle, Framing, Movement, Focus, Shutter Speed, FOV (40-120°), Stabilization
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Lighting Settings - Placeholder */}
        <AccordionItem value="lighting">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4" />
              Lighting (Nested sources)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              Coming in next phase: Light Sources (add/remove), Mood, Color Palette, Special Effects (lens flare, god rays, rim light)
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Environment Settings - Placeholder */}
        <AccordionItem value="environment">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              Environment (9 controls)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              Coming in next phase: Location (30+ options), Time, Weather, Era, Geography, Materials, Physics, Atmosphere
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Settings - Placeholder */}
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Advanced (Props, Audio, Effects)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              Coming in next phase: Props, Audio (5 structures), Color Grading (4 params), Special Effects, Speed Control, Constraints
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function initializeSimpleConfig(config: any): SimpleSegmentConfig {
  if ('mode' in config && config.mode === 'simple') {
    return config as SimpleSegmentConfig;
  }

  // Convert from legacy or power config
  return {
    mode: 'simple',
    dialogue: config.dialogue || '',
    character: {
      gender: 'female',
      ageRange: 'adult_30_45',
      profession: 'professional',
      expression: 'friendly'
    },
    camera: {
      motion: 'static',
      angle: 'eye_level',
      framing: 'medium_shot',
      position: 'center'
    },
    lighting: {
      mood: 'natural',
      timeOfDay: 'midday',
      style: 'soft'
    },
    environment: {
      location: 'office',
      atmosphere: 'professional'
    },
    technical: {
      aspectRatio: '16:9',
      duration: 8
    }
  };
}

function initializePowerConfig(config: any): PowerSegmentConfig {
  if ('mode' in config && config.mode === 'power') {
    return config as PowerSegmentConfig;
  }

  // Placeholder - will be properly implemented in next phase
  return {
    mode: 'power',
    dialogue: config.dialogue || '',
    style: 'cinematic',
    quality: 'high',
    aspectRatio: '16:9',
    duration: 8,
    character: {
      gender: 'female',
      age: 35,
      emotion: 'confident',
      pose: 'standing',
      movement: 'natural',
      actions: ['talking']
    },
    camera: {
      lens: 'standard_50mm',
      aperture: 'f2_8',
      angle: 'eye_level',
      framing: 'medium_shot',
      movement: 'static',
      focusBehavior: 'locked',
      shutterSpeed: 'normal_1_50',
      fieldOfView: 50,
      stabilization: 'handheld'
    },
    lighting: {
      sources: [{
        type: 'natural',
        intensity: 'medium',
        color: 'neutral',
        position: 'front',
        directionality: 'diffused'
      }],
      mood: 'natural',
      specialEffects: []
    },
    environment: {
      location: 'office',
      timeOfDay: 'midday',
      weather: 'clear',
      atmosphere: 'professional'
    },
    props: {
      items: []
    },
    audio: {
      dialogue: { volume: 'medium', sync: 'perfect' },
      ambient: [],
      soundEffects: [],
      music: { genre: 'none', mood: 'neutral', volume: 'off' }
    },
    colorGrading: {
      warmth: 'neutral',
      contrast: 'medium',
      saturation: 'natural',
      look: 'natural'
    },
    specialEffects: {
      motionBlur: 'subtle',
      particles: [],
      reflections: []
    },
    speedControl: {},
    constraints: {},
    ending: {}
  };
}

function convertToPowerToSimple(config: PowerSegmentConfig | SimpleSegmentConfig): SimpleSegmentConfig {
  if ('mode' in config && config.mode === 'simple') {
    return config;
  }

  const powerConfig = config as PowerSegmentConfig;
  return {
    mode: 'simple',
    dialogue: powerConfig.dialogue,
    character: {
      gender: powerConfig.character.gender,
      ageRange: powerConfig.character.age < 30 ? 'young_adult_18_29' : 'adult_30_45',
      profession: 'professional',
      expression: powerConfig.character.emotion === 'confident' ? 'confident' : 'friendly'
    },
    camera: {
      motion: powerConfig.camera.movement === 'static' ? 'static' : 'slow_pan',
      angle: powerConfig.camera.angle as any,
      framing: powerConfig.camera.framing as any,
      position: 'center'
    },
    lighting: {
      mood: powerConfig.lighting.mood as any,
      timeOfDay: powerConfig.environment.timeOfDay as any,
      style: 'soft'
    },
    environment: {
      location: powerConfig.environment.location as any,
      atmosphere: powerConfig.environment.atmosphere as any
    },
    technical: {
      aspectRatio: powerConfig.aspectRatio,
      duration: powerConfig.duration
    }
  };
}

function convertToSimpleToPower(config: SimpleSegmentConfig | PowerSegmentConfig): PowerSegmentConfig {
  if ('mode' in config && config.mode === 'power') {
    return config;
  }

  const simpleConfig = config as SimpleSegmentConfig;
  return initializePowerConfig({ dialogue: simpleConfig.dialogue });
}

function convertToSimple(legacyConfig: SegmentBuilderConfig): SimpleSegmentConfig {
  return {
    mode: 'simple',
    dialogue: legacyConfig.dialogue,
    character: {
      gender: 'female',
      ageRange: 'adult_30_45',
      profession: 'professional',
      expression: 'friendly'
    },
    camera: {
      motion: legacyConfig.camera.motion as any,
      angle: legacyConfig.camera.angle as any,
      framing: 'medium_shot',
      position: legacyConfig.camera.position as any
    },
    lighting: {
      mood: legacyConfig.lighting.mood as any,
      timeOfDay: legacyConfig.lighting.timeOfDay as any,
      style: legacyConfig.lighting.style as any
    },
    environment: {
      location: legacyConfig.environment.location as any,
      atmosphere: legacyConfig.environment.atmosphere as any
    },
    technical: {
      aspectRatio: '16:9',
      duration: 8
    }
  };
}

function convertToPower(legacyConfig: SegmentBuilderConfig): PowerSegmentConfig {
  return initializePowerConfig(legacyConfig);
}
