# SmokeTech Studio (Omega Platform) Architecture Analysis
## VEO3 UI Integration Reference Guide

> **Analysis Date:** October 2, 2025
> **Purpose:** Document existing patterns for VEO3 UI integration
> **Location:** E:\v2 repo\omega-platform

---

## 1. Component Structure Patterns

### 1.1 Main Component Architecture (prompt-bar.tsx)

**File:** `src/components/prompt-bar.tsx` (229 lines)

#### Component Organization:
```typescript
// Pattern 1: "use client" directive at top
"use client";

// Pattern 2: Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Pattern 3: Import lucide-react icons
import { ImageIcon, VideoIcon, Sparkles, Users } from "lucide-react";

// Pattern 4: Import custom components and hooks
import { ModelSelector, useModelSelection } from "@/components/model-selector";
import { PlatformSelector, usePersistentPlatformSelection } from "@/components/platform-selector";

// Pattern 5: Interface definition with props typing
interface PromptBarProps {
  onGenerate?: (type: "image" | "video" | "omega", prompt: string, options?: {
    model?: ImageModel;
    imageCount?: number;
    platform?: VideoPlatform;
    omegaOptions?: {
      character: OmegaCharacter;
      preset: OmegaPreset;
    }
  }) => void;
  onPanelToggle?: () => void;
  selectedCharacter: OmegaCharacter;
  onCharacterChange: (character: OmegaCharacter) => void;
  selectedPreset: OmegaPreset;
  onPresetChange: (preset: OmegaPreset) => void;
}

// Pattern 6: Main component with destructured props
export function PromptBar({
  onGenerate,
  onPanelToggle,
  selectedCharacter,
  onCharacterChange,
  selectedPreset,
  onPresetChange
}: PromptBarProps) {
  // Local state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom hooks for child component state
  const { selectedModel, setSelectedModel } = useModelSelection();
  const { selectedCount, setSelectedCount } = useImageCountSelection(selectedModel);
  const { selectedPlatform, setSelectedPlatform } = usePersistentPlatformSelection();

  // Event handlers
  const handleGenerate = (type: "image" | "video" | "omega") => {
    // Validation
    if (!prompt.trim()) return;

    // State management
    setIsGenerating(true);

    // Call parent handler with options
    if (onGenerate) {
      if (type === "omega") {
        onGenerate(type, prompt.trim(), {
          omegaOptions: {
            character: selectedCharacter,
            preset: selectedPreset
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

    // Clear prompt and reset state
    setPrompt("");
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  // Return JSX...
}
```

#### Key Structural Patterns:
1. **Props drilling** for state management (selectedCharacter, selectedPreset)
2. **Custom hooks** for encapsulated state (useModelSelection, usePersistentPlatformSelection)
3. **Type-safe interfaces** for all props and callbacks
4. **Conditional rendering** based on generation type
5. **Local state** for UI state (isGenerating, prompt)

---

## 2. State Management Patterns

### 2.1 Custom Hooks Pattern

#### Model Selection Hook (model-selector.tsx):
```typescript
// Hook for managing model selection with localStorage persistence
export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ImageModel>(DEFAULT_MODEL);

  useEffect(() => {
    // Load saved model from localStorage
    const savedModel = localStorage.getItem("openjourney-selected-model") as ImageModel;
    if (savedModel && MODEL_CONFIGS[savedModel]) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (model: ImageModel) => {
    setSelectedModel(model);
    localStorage.setItem("openjourney-selected-model", model);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('modelChanged', {
      detail: { model }
    }));
  };

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
  };
}
```

**Pattern Insights:**
- ✅ **localStorage persistence** on selection change
- ✅ **CustomEvent dispatch** for cross-component communication
- ✅ **useEffect** for initialization from localStorage
- ✅ **Type safety** with ImageModel type
- ✅ **Validation** before setting from localStorage

#### Platform Selection Hook (platform-selector.tsx):
```typescript
export function usePersistentPlatformSelection() {
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform>("youtube");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("preferred_video_platform");
    if (saved && platforms.some(p => p.value === saved)) {
      setSelectedPlatform(saved as VideoPlatform);
    }
    setIsLoaded(true);
  }, []);

  const updatePlatform = (platform: VideoPlatform) => {
    setSelectedPlatform(platform);
    localStorage.setItem("preferred_video_platform", platform);
  };

  return {
    selectedPlatform: isLoaded ? selectedPlatform : "youtube",
    setSelectedPlatform: updatePlatform,
    platformConfig: platforms.find(p => p.value === selectedPlatform) || platforms[0],
    isLoaded
  };
}
```

**Pattern Insights:**
- ✅ **Loading state** (isLoaded) to prevent hydration mismatches
- ✅ **Default fallback** until localStorage loads
- ✅ **Validation** against allowed values
- ✅ **Config object** included in return

### 2.2 Props Drilling Pattern (page.tsx → prompt-bar.tsx)

```typescript
// page.tsx
const { selectedCharacter, setSelectedCharacter } = useCharacterSelection();
const { selectedPreset, setSelectedPreset } = usePresetSelection();

// Pass down to PromptBar
<PromptBar
  onGenerate={generateHandler || undefined}
  onPanelToggle={() => setIsPanelOpen(true)}
  selectedCharacter={selectedCharacter}
  onCharacterChange={setSelectedCharacter}
  selectedPreset={selectedPreset}
  onPresetChange={setSelectedPreset}
/>
```

**VEO3 Implementation Pattern:**
```typescript
// To add VEO3 options:
// 1. Create custom hook in veo3-options.tsx
export function useVeo3Options() {
  const [aspectRatio, setAspectRatio] = useState<Veo3AspectRatio>("16:9");
  const [duration, setDuration] = useState<number>(8);
  const [enableSound, setEnableSound] = useState<boolean>(true);

  return {
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration,
    enableSound,
    setEnableSound
  };
}

// 2. Use in page.tsx
const veo3Options = useVeo3Options();

// 3. Pass to PromptBar
<PromptBar
  // ... existing props
  veo3AspectRatio={veo3Options.aspectRatio}
  onVeo3AspectRatioChange={veo3Options.setAspectRatio}
  veo3Duration={veo3Options.duration}
  onVeo3DurationChange={veo3Options.setDuration}
  veo3EnableSound={veo3Options.enableSound}
  onVeo3EnableSoundChange={veo3Options.setEnableSound}
/>
```

---

## 3. Button & Toggle UI Patterns

### 3.1 Dropdown Menu Pattern (model-selector.tsx)

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  showCost = true
}: ModelSelectorProps) {
  const currentConfig = getModelConfig(selectedModel);
  const CurrentIcon = MODEL_ICONS[selectedModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-10 sm:h-8 px-3 font-medium min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-3 h-3" />
            <span className="text-xs">{getModelDisplayName(selectedModel)}</span>
          </div>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px]">
        <DropdownMenuLabel className="text-sm font-medium">
          Choose Image Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(MODEL_CONFIGS) as ImageModel[]).map((modelId) => {
          const config = getModelConfig(modelId);
          const Icon = MODEL_ICONS[modelId];
          const isSelected = selectedModel === modelId;

          return (
            <DropdownMenuItem
              key={modelId}
              onClick={() => onModelChange(modelId)}
              className={`p-3 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {config.name}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {config.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {config.quality} • {config.speciality}
                    </span>
                    {showCost && (
                      <span className="font-medium text-primary">
                        ${config.cost.toFixed(3)}/img
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          💡 NanoBanana excels at realistic humans, Imagen 4 for general use
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Pattern Insights:**
- ✅ **Trigger button** with current selection displayed
- ✅ **Icon + text** in trigger button
- ✅ **Responsive width** (calc(100vw-2rem) on mobile, max-w-[320px])
- ✅ **Rich menu items** with icon, title, description, metadata
- ✅ **Visual selection indicator** (bg-accent, dot indicator)
- ✅ **Info footer** for helpful tips
- ✅ **Type-safe mapping** over config objects

### 3.2 Select Dropdown Pattern (platform-selector.tsx)

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
  className = ""
}: PlatformSelectorProps) {
  const selectedOption = platforms.find(p => p.value === selectedPlatform) || platforms[0];

  return (
    <Select
      value={selectedPlatform}
      onValueChange={(value) => onPlatformChange(value as VideoPlatform)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[140px] h-8 ${className}`}>
        <div className="flex items-center gap-2">
          {selectedOption.icon}
          <span className="text-sm">{selectedOption.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[calc(100vw-2rem)] max-w-[320px]">
        {platforms.map((platform) => (
          <SelectItem key={platform.value} value={platform.value} className="cursor-pointer">
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-2">
                {platform.icon}
                <span className="font-medium">{platform.label}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                {platform.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**Pattern Insights:**
- ✅ **Simpler than DropdownMenu** (good for basic selections)
- ✅ **Icon + label** in trigger
- ✅ **Two-line items** (title + description)
- ✅ **Fixed trigger width** with responsive content width
- ✅ **whitespace-normal** for wrapping long descriptions

### 3.3 Number Selector Pattern (image-count-selector.tsx)

```typescript
export function ImageCountSelector({
  selectedCount,
  onCountChange,
  selectedModel = 'imagen-4',
  disabled = false,
  className = ""
}: ImageCountSelectorProps) {
  const maxImages = MODEL_CONFIGS[selectedModel].maxImages;

  // Generate count options based on model limits
  const countOptions = Array.from({ length: maxImages }, (_, i) => i + 1);

  return (
    <Select
      value={selectedCount.toString()}
      onValueChange={(value) => onCountChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[80px] h-8 ${className}`}>
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{selectedCount}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {countOptions.map((count) => (
          <SelectItem key={count} value={count.toString()} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-medium">{count} image{count > 1 ? 's' : ''}</span>
              <span className="text-xs text-muted-foreground">
                ${(MODEL_CONFIGS[selectedModel].cost * count).toFixed(2)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**Pattern Insights:**
- ✅ **Dynamic options** based on model config
- ✅ **Cost calculation** per item
- ✅ **Narrow trigger** (80px) for compact UI
- ✅ **Icon-only** with number display

---

## 4. API Route → Omega Service → Viral Engine Flow

### 4.1 API Route Structure (generate-images/route.ts)

```typescript
// Pattern: Named export of async POST function
export async function POST(request: NextRequest) {
  try {
    // Step 1: Extract and validate request body
    const { prompt, apiKey: userApiKey, model = 'imagen-4', numberOfImages } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Step 2: Get API key (user-provided or environment)
    const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "No API key provided. Please add your Google AI API key in the settings."
      }, { status: 401 });
    }

    // Step 3: Route to appropriate service
    if (model === 'nanobana') {
      return NextResponse.json({
        error: "NanoBanana generation should use /api/generate-nanobana endpoint"
      }, { status: 400 });
    }

    // Step 4: Map model names to actual identifiers
    const modelMapping = {
      'imagen-3': 'imagen-3.0-generate-001',
      'imagen-4': 'imagen-4.0-generate-preview-06-06'
    };

    const modelId = modelMapping[model as keyof typeof modelMapping] || modelMapping['imagen-4'];

    // Step 5: Initialize service and generate
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: modelId,
      prompt: prompt,
      config: {
        numberOfImages: imageCount,
      },
    });

    // Step 6: Process and return results
    const images = (response.generatedImages || []).map((generatedImage, index) => {
      const imageBytes = generatedImage.image?.imageBytes;
      if (!imageBytes) return null;
      const base64 = `data:image/png;base64,${imageBytes}`;
      return {
        id: `${Date.now()}-${index}`,
        url: base64,
        imageBytes: imageBytes
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      images,
      prompt,
      metadata: {
        model: model,
        modelName: model === 'imagen-3' ? 'Imagen 3' : 'Imagen 4',
        numberOfImages: images.length,
        cost: (model === 'imagen-3' ? 0.04 : 0.08) * images.length,
        estimatedTime: model === 'imagen-3' ? 8 : 12
      }
    });

  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
```

### 4.2 Omega Service Bridge Pattern (omega-service.js)

```javascript
// Pattern 1: Route-specific endpoint with viral engine integration
app.post('/api/generate-nanobana', async (req, res) => {
  try {
    const { prompt, apiKey, numberOfImages } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // ✅ VIRAL ENGINE INTEGRATION - Dynamic TypeScript import
    const { generateNanoBananaImages, validateRequest } = await import('./services/nanobana-bridge.ts');

    // Validate request
    const validation = validateRequest({ prompt, apiKey, numberOfImages });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Generate ultra-realistic images using viral engine
    const result = await generateNanoBananaImages({
      prompt,
      apiKey,
      numberOfImages: numberOfImages || 1
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Image generation failed'
      });
    }

    console.log(`✅ NanoBanana generation completed: ${result.images.length} ultra-realistic images`);
    console.log(`💰 Total cost: $${result.metadata.cost.toFixed(3)}`);

    // Return viral engine results
    res.json(result);

  } catch (error) {
    console.error('❌ NanoBanana generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Pattern 2: Video generation with subprocess spawning
app.post('/api/generate-video', async (req, res) => {
  try {
    const { characterName, userRequest, platform, simpleMode } = req.body;

    // Generate operation ID for tracking
    const operationId = `omega-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store operation with initial status
    activeOperations.set(operationId, {
      operationId,
      character: characterName,
      prompt: userRequest,
      platform: platform,
      status: 'processing',
      progress: 15,
      startTime: Date.now()
    });

    // Execute REAL Omega Workflow using viral engine
    const viralEnginePath = path.resolve(__dirname, '..', 'viral');
    const paintingScript = path.join(viralEnginePath, 'scripts', 'generate-painting-sop.ts');

    // Get API key from Authorization header or request body
    const apiKey = req.headers.authorization?.split(' ')[1] || req.body.apiKey || process.env.GEMINI_API_KEY;

    // Spawn subprocess
    const childProcess = spawn(command, {
      cwd: viralEnginePath,
      env: {
        ...process.env,
        GEMINI_API_KEY: apiKey
      },
      shell: true
    });

    // Track progress via stdout parsing
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();

      // Parse progress: PROGRESS:{"stage":"character","progress":10}
      const progressMatches = output.match(/PROGRESS:(.+)/);
      if (progressMatches) {
        const progressData = JSON.parse(progressMatches[1]);
        const operation = activeOperations.get(operationId);
        if (operation) {
          operation.progress = progressData.progress;
          operation.currentStage = progressData.stage;
        }
      }

      // Parse result: RESULT:{"success":true,"videoPath":"..."}
      const resultMatches = output.match(/RESULT:(.+)/);
      if (resultMatches) {
        const resultData = JSON.parse(resultMatches[1]);
        const operation = activeOperations.get(operationId);
        if (operation) {
          if (resultData.success) {
            operation.status = 'completed';
            operation.videoPath = resultData.videoPath;
          }
        }
      }
    });

    // Return operation ID for status polling
    res.json({
      success: true,
      operationId: operationId,
      message: `Video generation started for ${characterName}`
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Pattern 3: Status polling endpoint
app.get('/api/status/:operationId', (req, res) => {
  const operationId = req.params.operationId;
  const operation = activeOperations.get(operationId);

  if (!operation) {
    return res.status(404).json({
      success: false,
      error: 'Operation not found'
    });
  }

  const elapsedTime = Math.floor((Date.now() - operation.startTime) / 1000);
  operation.elapsedTime = elapsedTime;

  res.json({
    success: true,
    operationId: operationId,
    status: operation.status,
    character: operation.character,
    elapsedTime: elapsedTime,
    estimatedTime: 300,
    progress: operation.progress,
    videoPath: operation.videoPath,
    metrics: operation.metrics
  });
});
```

### 4.3 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                                                                 │
│  PromptBar Component                                            │
│  ├── User input: prompt + VEO3 options                         │
│  ├── handleGenerate("video")                                   │
│  └── onGenerate callback with { platform, veo3Options }        │
│                           │                                     │
│                           ▼                                     │
│  ContentGrid Component                                          │
│  ├── Receives generation request                               │
│  ├── fetch('/api/generate-videos', {                          │
│  │     method: 'POST',                                         │
│  │     body: JSON.stringify({ prompt, platform, veo3Options }) │
│  │   })                                                        │
│  └── Displays results or polls status                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTE                             │
│                                                                 │
│  /api/generate-videos/route.ts                                 │
│  ├── Extract: { prompt, apiKey, platform, veo3Options }       │
│  ├── Validate GCP configuration (projectId, location)          │
│  ├── Initialize VEO3Service with config                        │
│  ├── Get platform settings + merge veo3Options                 │
│  ├── await veo3Service.generateVideoSegment(...)              │
│  └── Return: { success, videos, metadata }                     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OMEGA SERVICE BRIDGE                         │
│                    (omega-service.js)                           │
│                                                                 │
│  OPTIONAL: For complex workflows requiring subprocess          │
│  ├── Generate operationId                                      │
│  ├── Spawn viral engine TypeScript process                     │
│  ├── Monitor stdout for PROGRESS/RESULT messages              │
│  ├── Store operation status in Map                             │
│  └── Return operationId for polling                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VIRAL ENGINE                               │
│              (E:\v2 repo\viral\src\services)                    │
│                                                                 │
│  veo3Service.ts                                                │
│  ├── Generate JSON-structured prompts                          │
│  ├── Call Vertex AI Gemini API                                │
│  ├── Apply ZHO viral techniques                                │
│  ├── Generate video with native audio                          │
│  └── Return video bytes + metadata                             │
└─────────────────────────────────────────────────────────────────┘
```

**VEO3 Integration Points:**
1. **Frontend:** Add VEO3 selector components (aspect ratio, duration, sound toggle)
2. **API Route:** Pass veo3Options to VEO3Service
3. **VEO3Service:** Use options in generateVideoSegment config
4. **Return Flow:** Videos → API Route → Frontend → ContentGrid display

---

## 5. Available Shadcn/UI Components

**Location:** `src/components/ui/`

### Core Components:
- ✅ **button.tsx** - Button with variants (default, outline, ghost, etc.)
- ✅ **input.tsx** - Text input field
- ✅ **label.tsx** - Form labels
- ✅ **select.tsx** - Dropdown select (simpler than DropdownMenu)
- ✅ **dropdown-menu.tsx** - Rich dropdown with separators, labels
- ✅ **switch.tsx** - Toggle switch (perfect for boolean options)
- ✅ **dialog.tsx** - Modal dialog
- ✅ **card.tsx** - Card container
- ✅ **badge.tsx** - Label badges
- ✅ **tooltip.tsx** - Hover tooltips
- ✅ **hover-card.tsx** - Rich hover popover

### Feedback Components:
- ✅ **skeleton.tsx** - Loading placeholder
- ✅ **progress.tsx** - Progress bar
- ✅ **toast.tsx** - Toast notifications
- ✅ **toaster.tsx** - Toast container
- ✅ **alert.tsx** - Alert messages

### VEO3 UI Recommendations:
```typescript
// Aspect Ratio Selector
import { Select, SelectTrigger, SelectItem } from "@/components/ui/select";
// or
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Duration Selector (number input)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sound Enable Toggle
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Quality Selector
import { Select } from "@/components/ui/select";

// Advanced Options Dialog
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
```

---

## 6. File Naming Conventions

### Component Files:
- ✅ **kebab-case.tsx** for all components (e.g., `model-selector.tsx`, `platform-selector.tsx`)
- ✅ **PascalCase.tsx** for special components (e.g., `CharacterPanel.tsx`, `WorkflowConfig.tsx`)

### API Routes:
- ✅ **kebab-case/route.ts** (e.g., `generate-images/route.ts`, `generate-videos/route.ts`)
- ✅ **Dynamic routes:** `[param]/route.ts`

### Library Files:
- ✅ **camelCase.ts** for utilities (e.g., `model-types.ts`, `veo3Service.ts`)

### VEO3 Component Structure (Recommended):
```
src/components/veo3/
├── veo3-aspect-ratio-selector.tsx    # Aspect ratio dropdown
├── veo3-duration-selector.tsx        # Duration input (4-8 seconds)
├── veo3-sound-toggle.tsx             # Enable/disable sound generation
├── veo3-quality-selector.tsx         # Quality dropdown
├── veo3-options-panel.tsx            # Combined options panel
└── useVeo3Options.ts                 # Custom hook for VEO3 state
```

---

## 7. Responsive Design Patterns

### Mobile-First Approach:
```typescript
// Pattern 1: Conditional rendering based on screen size
<div className="hidden sm:flex gap-2">
  {/* Desktop-only controls */}
</div>

<div className="sm:hidden space-y-3">
  {/* Mobile-only layout */}
</div>

// Pattern 2: Responsive widths
className="w-full sm:w-auto"
className="w-[calc(100vw-2rem)] max-w-[320px]"  // Mobile full-width, desktop capped

// Pattern 3: Responsive heights
className="h-10 sm:h-8"  // Larger touch targets on mobile

// Pattern 4: Flex direction changes
className="flex flex-col sm:flex-row gap-2 items-center"

// Pattern 5: Responsive padding/margins
className="px-4 sm:px-6 lg:px-8"
className="py-4 sm:py-6"
```

### Breakpoints (Tailwind):
- **sm:** 640px (tablet)
- **md:** 768px (small laptop)
- **lg:** 1024px (desktop)
- **xl:** 1280px (large desktop)

### VEO3 UI Responsive Strategy:
```typescript
// Desktop: All controls in prompt bar
<div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
  <ModelSelector />
  <ImageCountSelector />
  <Veo3AspectRatioSelector />  // NEW
  <Veo3DurationSelector />     // NEW
  <Veo3SoundToggle />          // NEW
  <Button>Video</Button>
</div>

// Mobile: Controls in separate row
<div className="sm:hidden space-y-3">
  <div className="flex gap-2 justify-center">
    <ModelSelector />
    <ImageCountSelector />
    <Veo3OptionsButton />  // Opens dialog with all VEO3 options
  </div>
  <div className="flex gap-2 justify-center">
    <Button>Image</Button>
    <Button>Video</Button>
  </div>
</div>
```

---

## 8. Key Integration Discoveries

### 8.1 Component Communication Patterns

**Pattern 1: Parent-Child Props Drilling**
- Used for: Direct state sharing (selectedCharacter, selectedPreset)
- Example: page.tsx → PromptBar → child selectors

**Pattern 2: Custom Hooks with localStorage**
- Used for: Persistent user preferences (model, platform)
- Example: useModelSelection(), usePersistentPlatformSelection()

**Pattern 3: CustomEvent Dispatch**
- Used for: Cross-component communication without props
- Example: modelChanged event when user switches models

### 8.2 API Integration Patterns

**Pattern 1: Direct API Route → Service**
- Used for: Simple single-step operations (image generation)
- Flow: Frontend → /api/generate-images → GoogleGenAI SDK → Response

**Pattern 2: API Route → Omega Bridge → Viral Engine**
- Used for: Complex multi-step workflows (character library, painting SOP)
- Flow: Frontend → /api/generate-* → omega-service.js → spawn subprocess → poll status

**Pattern 3: Subprocess with Progress Tracking**
- Used for: Long-running viral engine operations
- Pattern: stdout parsing for PROGRESS:/RESULT: JSON messages

### 8.3 Type Safety Patterns

**Centralized Type Definitions:**
```typescript
// lib/model-types.ts
export type ImageModel = 'imagen-3' | 'imagen-4' | 'nanobana';
export interface ModelConfig { /* ... */ }
export const MODEL_CONFIGS: Record<ImageModel, ModelConfig> = { /* ... */ };

// lib/veo3-types.ts (to be created)
export type Veo3AspectRatio = '16:9' | '9:16' | '1:1';
export type Veo3Quality = 'standard' | 'high' | 'ultra';
export interface Veo3Options {
  aspectRatio: Veo3AspectRatio;
  duration: number; // 4-8 seconds
  enableSound: boolean;
  quality: Veo3Quality;
}
export const VEO3_CONFIGS: Record<Veo3AspectRatio, { label: string; icon: any }> = { /* ... */ };
```

**Config-Driven UI:**
```typescript
// Instead of hardcoded options, use config objects:
const aspectRatioOptions = Object.entries(VEO3_CONFIGS).map(([key, config]) => ({
  value: key as Veo3AspectRatio,
  label: config.label,
  icon: config.icon
}));
```

---

## 9. VEO3 Integration Checklist

### Phase 1: Type Definitions
- [ ] Create `src/lib/veo3-types.ts` with Veo3Options interface
- [ ] Define Veo3AspectRatio, Veo3Quality types
- [ ] Create VEO3_CONFIGS similar to MODEL_CONFIGS

### Phase 2: Custom Hook
- [ ] Create `src/components/veo3/useVeo3Options.ts`
- [ ] Implement localStorage persistence
- [ ] Add default values (16:9, 8s, sound enabled)

### Phase 3: UI Components
- [ ] Create `veo3-aspect-ratio-selector.tsx` (DropdownMenu pattern)
- [ ] Create `veo3-duration-selector.tsx` (Select or Input pattern)
- [ ] Create `veo3-sound-toggle.tsx` (Switch pattern)
- [ ] Create `veo3-options-panel.tsx` (Dialog for mobile)

### Phase 4: Integration
- [ ] Add useVeo3Options() to page.tsx
- [ ] Pass veo3Options props to PromptBar
- [ ] Add VEO3 selectors to desktop prompt bar (hidden sm:flex)
- [ ] Add VEO3 options button to mobile layout (sm:hidden)
- [ ] Update handleGenerate to include veo3Options

### Phase 5: API Route
- [ ] Update /api/generate-videos/route.ts to accept veo3Options
- [ ] Pass options to VEO3Service.generateVideoSegment()
- [ ] Test with existing VEO3Service in viral engine

### Phase 6: Testing
- [ ] Test aspect ratio changes
- [ ] Test duration input (4-8 second validation)
- [ ] Test sound toggle
- [ ] Verify localStorage persistence
- [ ] Test mobile responsive layout

---

## 10. Example VEO3 Component Implementation

### veo3-aspect-ratio-selector.tsx
```typescript
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Monitor, Smartphone, Square } from "lucide-react";
import { Veo3AspectRatio, VEO3_ASPECT_RATIO_CONFIGS } from "@/lib/veo3-types";

const ASPECT_RATIO_ICONS = {
  '16:9': Monitor,
  '9:16': Smartphone,
  '1:1': Square,
} as const;

interface Veo3AspectRatioSelectorProps {
  selectedRatio: Veo3AspectRatio;
  onRatioChange: (ratio: Veo3AspectRatio) => void;
  disabled?: boolean;
}

export function Veo3AspectRatioSelector({
  selectedRatio,
  onRatioChange,
  disabled = false
}: Veo3AspectRatioSelectorProps) {
  const currentConfig = VEO3_ASPECT_RATIO_CONFIGS[selectedRatio];
  const CurrentIcon = ASPECT_RATIO_ICONS[selectedRatio];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-10 sm:h-8 px-3 font-medium min-w-[100px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-3 h-3" />
            <span className="text-xs">{selectedRatio}</span>
          </div>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel className="text-sm font-medium">
          Video Aspect Ratio
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(VEO3_ASPECT_RATIO_CONFIGS) as Veo3AspectRatio[]).map((ratio) => {
          const config = VEO3_ASPECT_RATIO_CONFIGS[ratio];
          const Icon = ASPECT_RATIO_ICONS[ratio];
          const isSelected = selectedRatio === ratio;

          return (
            <DropdownMenuItem
              key={ratio}
              onClick={() => onRatioChange(ratio)}
              className={`p-3 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {ratio}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config.label} • {config.platform}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          💡 9:16 for TikTok/Reels, 16:9 for YouTube
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### veo3-sound-toggle.tsx
```typescript
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX } from "lucide-react";

interface Veo3SoundToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function Veo3SoundToggle({
  enabled,
  onToggle,
  disabled = false
}: Veo3SoundToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Volume2 className="w-4 h-4 text-primary" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      )}
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      <Label className="text-xs cursor-pointer" onClick={() => !disabled && onToggle(!enabled)}>
        Sound
      </Label>
    </div>
  );
}
```

---

## Conclusion

This architecture analysis provides all the patterns needed to integrate VEO3 UI controls into the SmokeTech Studio platform. Key takeaways:

1. **Follow existing patterns:** DropdownMenu for rich selectors, Select for simple ones, Switch for toggles
2. **Use custom hooks:** Encapsulate state + localStorage persistence
3. **Maintain type safety:** Create veo3-types.ts with proper TypeScript definitions
4. **Responsive design:** Desktop controls in prompt bar, mobile in dialog/separate row
5. **API flow:** Frontend → /api/generate-videos → VEO3Service (no omega-service needed for direct VEO3)

The codebase is well-structured and consistent, making VEO3 integration straightforward by following these established patterns.

---

**Next Steps:** Use this analysis to create the VEO3 integration PRP with specific implementation tasks.
