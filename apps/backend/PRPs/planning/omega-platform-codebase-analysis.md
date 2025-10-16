# Omega Platform Codebase Architecture Analysis - VEO3 UI Integration

**Purpose:** Complete architectural reference for VEO3 video generation UI integration
**Analyzed:** October 2, 2025
**Platform:** SmokeTech Studio (omega-platform)
**Target:** VEO3 feature exposure in UI

## 🎯 Executive Summary

The omega-platform is a **production-ready Next.js 15 application** with:
- **Frontend**: React 19, TypeScript, shadcn/ui components, Tailwind CSS 4
- **Backend**: Next.js API routes, omega-service.js bridge (port 3007)
- **VEO3 Integration**: **ALREADY COMPLETE** in `src/lib/veo3Service.ts`
- **Architecture**: Component-based with hooks, localStorage persistence, custom events

**🔑 KEY FINDING**: VEO3 video generation service is **FULLY IMPLEMENTED** with all viral techniques. UI just needs to expose existing functionality through selectors and buttons.

---

## 📋 VEO3 Service Status

### Already Implemented ✅
Located at: `E:\v2 repo\omega-platform\src\lib\veo3Service.ts` (Lines 117-993)

**Complete Features:**
- ✅ JSON prompting for 300%+ quality improvement (Lines 195-259)
- ✅ Snubroot timing methodology (Lines 630-653)
- ✅ Platform-specific optimizations (Lines 904-927)
- ✅ Character consistency & preservation (Lines 229-235)
- ✅ Micro-expressions and skin realism (Lines 681-701, 252)
- ✅ Professional cinematography patterns (Lines 217-221)
- ✅ Native audio generation with lip sync (Lines 242-249)
- ✅ Image-to-video support (Lines 332-345)
- ✅ A/B hook testing variations (Lines 932-955)
- ✅ Rate limiting (Line 138)
- ✅ Retry logic with exponential backoff (Line 301)
- ✅ REST API integration via Vertex AI (Lines 264-468)

### What Needs Building 🔨
**UI Components Only:**
1. Video model selector dropdown
2. Video duration selector (4s, 6s, 8s)
3. VEO3 button in prompt bar
4. API route wrapper (`/api/generate-veo3`)
5. Video result display in content grid

---

---

## 1. Component Architecture Patterns

### 1.1 Selector Component Structure (Dropdowns & Selects)

The platform uses **two distinct patterns** for user selection components:

#### Pattern A: DropdownMenu (Radix UI) - Used for Rich Content Displays
**Files:** `model-selector.tsx`, `character-selector.tsx`
**When to use:** Complex items with descriptions, icons, metadata, multiple visual elements

**Key Pattern:**
```tsx
// Line 40-114: model-selector.tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-10 sm:h-8 px-3">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3" />
        <span className="text-xs">{displayName}</span>
      </div>
      <ChevronDown className="w-3 h-3 ml-1" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px]">
    <DropdownMenuLabel>Choose Model</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {items.map((item) => (
      <DropdownMenuItem onClick={() => onChange(item)} className={`p-3 ${isSelected ? 'bg-accent' : ''}`}>
        {/* Rich content: icon, title, description, metrics, etc. */}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

**Critical Details:**
- **Mobile width:** `w-[calc(100vw-2rem)]` - Ensures dropdown doesn't overflow on mobile
- **Max width:** `max-w-[320px]` - Desktop constraint
- **Item padding:** `p-3` or `p-4` for touch-friendly targets
- **Selection indicator:** Background color `bg-accent` + colored dot for selected state
- **Responsive text:** `text-xs` for metadata, `text-sm` for primary labels

#### Pattern B: Select (Radix UI) - Used for Simple Selections
**Files:** `platform-selector.tsx`, `image-count-selector.tsx`
**When to use:** Simpler options, less metadata, standard form-like selections

**Key Pattern:**
```tsx
// Line 74-100: platform-selector.tsx
<Select value={selected} onValueChange={onChange}>
  <SelectTrigger className="w-[140px] h-8">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  </SelectTrigger>
  <SelectContent className="w-[calc(100vw-2rem)] max-w-[320px]">
    {options.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2">
            {option.icon}
            <span className="font-medium">{option.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">{option.description}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Critical Details:**
- **Fixed trigger width:** `w-[140px]` or `w-[80px]` (number selector)
- **Height:** `h-8` standard for all selectors
- **Same mobile pattern:** `w-[calc(100vw-2rem)] max-w-[320px]`
- **Cursor:** `cursor-pointer` on SelectItem for UX clarity

### 1.2 Icon Integration Pattern

**Universal Pattern Across All Selectors:**
```tsx
// Line 17-21: model-selector.tsx
const MODEL_ICONS = {
  'imagen-3': Zap,
  'imagen-4': Sparkles,
  'nanobana': User,
} as const;

// Line 62-66: character-selector.tsx
const CHARACTER_ICONS = {
  'aria': User,
  'bianca': Users,
  'custom': Sparkles,
} as const;
```

**Icon Sizing:**
- Trigger button: `w-3 h-3` or `w-4 h-4`
- Dropdown items: `w-4 h-4` consistently
- Additional emoji/avatar: Can use larger sizes for visual hierarchy

---

## 2. State Management & Persistence

### 2.1 Local State with localStorage Persistence Pattern

**Critical Hook Pattern (All Selectors Follow This):**

```tsx
// Line 119-144: model-selector.tsx
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

**localStorage Keys Pattern:**
- `"openjourney-selected-model"` - Model selection
- `"preferred_video_platform"` - Platform selection
- `"smoketech-selected-character"` - Character selection

**Cross-Component Communication:**
- Uses `window.dispatchEvent(new CustomEvent(...))` for state changes
- Other components listen with `window.addEventListener('modelChanged', ...)`
- Enables reactive updates without prop drilling

### 2.2 Parent-Child State Flow

**Pattern from `page.tsx` → `prompt-bar.tsx` → `content-grid.tsx`:**

```tsx
// page.tsx (Line 14-21)
const [generateHandler, setGenerateHandler] = useState<((type, prompt, options) => void) | null>(null);
const { selectedCharacter, setSelectedCharacter } = useCharacterSelection();
const { selectedPreset, setSelectedPreset } = usePresetSelection();

// Pass to PromptBar
<PromptBar
  onGenerate={generateHandler}
  selectedCharacter={selectedCharacter}
  onCharacterChange={setSelectedCharacter}
/>

// ContentGrid sets handler
useEffect(() => {
  if (onNewGeneration) {
    onNewGeneration(handleGenerationWrapper);
  }
}, [onNewGeneration]);
```

**Key Insights:**
1. **Function Lifting Pattern:** Child components (ContentGrid) provide handlers to parent via callbacks
2. **Centralized State:** Character/preset selection managed at page level
3. **Unidirectional Flow:** State flows down, events flow up

### 2.3 Configuration Objects Pattern

**Type-Safe Config Objects (Line 19-74: model-types.ts):**
```tsx
export type ImageModel = 'imagen-3' | 'imagen-4' | 'nanobana';

export interface ModelConfig {
  id: ImageModel;
  name: string;
  description: string;
  capabilities: string[];
  cost: number;
  estimatedTime: number;
  maxImages: number;
  quality: 'Good' | 'High' | 'Ultra';
  speciality: string;
  apiEndpoint: string;
  modelIdentifier: string;
}

export const MODEL_CONFIGS: Record<ImageModel, ModelConfig> = {
  'imagen-3': { /* config */ },
  'imagen-4': { /* config */ },
  'nanobana': { /* config */ }
};
```

**Helper Functions Pattern:**
```tsx
export const getModelConfig = (model: ImageModel): ModelConfig => MODEL_CONFIGS[model];
export const getModelDisplayName = (model: ImageModel): string => MODEL_CONFIGS[model].name;
export const getModelCost = (model: ImageModel, numImages: number = 1): number =>
  MODEL_CONFIGS[model].cost * numImages;
```

---

## 3. API Integration Patterns

### 3.1 Component → API Route → External Service Flow

**Step 1: Component initiates request (content-grid.tsx Line 258-295):**
```tsx
const handleNewGeneration = async (type, prompt, model, imageCount, omegaOptions) => {
  const userApiKey = localStorage.getItem("gemini_api_key");

  if (!userApiKey) {
    toast({ title: "API Key Required", variant: "destructive" });
    setShowApiKeyDialog(true);
    return;
  }

  const response = await withRetry(
    async () => {
      const res = await withTimeout(
        fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            apiKey: userApiKey,
            model: model || 'imagen-4',
            numberOfImages: imageCount
          }),
        }),
        30000 // 30 second timeout
      );

      if (!res.ok) await handleApiError(res);
      return res;
    },
    { maxAttempts: 2, initialDelay: 2000 },
    (attempt, error) => {
      toast({ title: "Retrying...", description: `Attempt ${attempt + 1}` });
    }
  );
};
```

**Step 2: API Route processes (generate-images/route.ts Line 4-84):**
```tsx
export async function POST(request: NextRequest) {
  const { prompt, apiKey: userApiKey, model = 'imagen-4', numberOfImages } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      error: "No API key provided. Please add your Google AI API key in the settings."
    }, { status: 401 });
  }

  // Route NanoBanana to Omega service
  if (model === 'nanobana') {
    return NextResponse.json({
      error: "NanoBanana generation should use /api/generate-nanobana endpoint"
    }, { status: 400 });
  }

  const modelMapping = {
    'imagen-3': 'imagen-3.0-generate-001',
    'imagen-4': 'imagen-4.0-generate-preview-06-06'
  };

  const modelId = modelMapping[model] || modelMapping['imagen-4'];
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateImages({
    model: modelId,
    prompt: prompt,
    config: { numberOfImages: imageCount },
  });

  return NextResponse.json({
    success: true,
    images: response.generatedImages.map((img, i) => ({
      id: `${Date.now()}-${i}`,
      url: `data:image/png;base64,${img.image.imageBytes}`,
      imageBytes: img.image.imageBytes
    })),
    metadata: { model, numberOfImages, cost, estimatedTime }
  });
}
```

**Step 3: Omega Service Bridge (generate-omega/route.ts Line 42-98):**
```tsx
// Forward request to Omega Service on port 3007
const omegaServiceUrl = "http://localhost:3007";

const response = await fetch(`${omegaServiceUrl}/api/generate-video`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    characterName,
    userRequest,
    platform,
    simpleMode,
    apiKey
  }),
  signal: AbortSignal.timeout(120000) // 2 minute timeout
});

if (data.success) {
  return NextResponse.json({
    success: true,
    operationId: data.operationId,
    estimatedTime: 300,
    statusEndpoint: `/api/omega-status/${data.operationId}`,
    metadata: { service: "omega", character, platform, simpleMode }
  });
}
```

### 3.2 Error Handling & Retry Logic

**Comprehensive Pattern (error-handler.ts):**

```tsx
// Line 86-136: Retry with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const retryConfig = { maxAttempts: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 };

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry non-retryable errors or 4xx status codes
      if (error instanceof AppError && !error.retryable) throw error;
      if (error instanceof Response && [400, 401, 403, 404, 422].includes(error.status)) throw error;

      if (attempt < retryConfig.maxAttempts) {
        const delay = calculateDelay(attempt, retryConfig);
        if (onRetry) onRetry(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Line 280-291: Timeout wrapper
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new AppError("Request timed out", "TIMEOUT", ErrorSeverity.ERROR, true)), timeoutMs)
    ),
  ]);
}

// Line 294-304: Service health check
export async function checkServiceHealth(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await withTimeout(fetch(url, { method: "HEAD" }), timeout);
    return response.ok;
  } catch {
    return false;
  }
}
```

**Usage in content-grid.tsx (Line 401-409):**
```tsx
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
```

### 3.3 Toast Notification Pattern

**Custom Hook (use-toast.ts):**
```tsx
// Line 142-169: Toast function
function toast({ ...props }: Toast) {
  const id = genId();
  const update = (props: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } },
  });

  return { id, dismiss, update };
}

// Line 171-189: Hook usage
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { /* cleanup */ };
  }, [state]);

  return { ...state, toast, dismiss };
}
```

**Usage Pattern in Components:**
```tsx
const { toast } = useToast();

// Success
toast({ title: "Success!", description: "Image generation completed", variant: "success" });

// Error
toast({ title: "API Key Required", description: ERROR_MESSAGES.API_KEY_MISSING, variant: "destructive" });

// Retry notification
toast({ title: "Retrying...", description: `Attempt ${attempt + 1}`, variant: "default" });
```

---

## 4. Mobile Responsiveness Patterns

### 4.1 Core Responsive Patterns

**Tailwind Breakpoints (Standard):**
- `sm:` - 640px and up (tablets/small laptops)
- `md:` - 768px and up (tablets landscape)
- `lg:` - 1024px and up (laptops/desktops)
- Mobile: Default (no prefix)

### 4.2 Layout Patterns

**Pattern 1: Hidden/Show Pattern (page.tsx Line 36, 59):**
```tsx
{/* Logo - Hidden on mobile, shown on sm+ */}
<div className="hidden sm:block flex-shrink-0" style={{ minWidth: '180px' }}>
  <Image src="/SmokeTech Logo-min.png" alt="SmokeTech" />
</div>

{/* Spacer for balance - Desktop only */}
<div className="hidden sm:block flex-shrink-0" style={{ minWidth: '180px' }}></div>
```

**Pattern 2: Flex Direction Switch (page.tsx Line 34, prompt-bar.tsx Line 94):**
```tsx
{/* Vertical on mobile, horizontal on desktop */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
  {/* Content */}
</div>
```

**Pattern 3: Responsive Text Sizing (page.tsx Line 53):**
```tsx
<h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
  Infinite Creation, One Studio
</h1>
```

**Pattern 4: Width Adaptation (page.tsx Line 52):**
```tsx
{/* Full width on mobile, flex-1 on desktop */}
<div className="w-full sm:flex-1 text-center">
  {/* Content */}
</div>
```

### 4.3 Prompt Bar Mobile Pattern (Critical!)

**Desktop Layout (prompt-bar.tsx Line 94-162):**
```tsx
<div className="flex flex-col sm:flex-row gap-2 items-center">
  <div className="relative flex-1 w-full">
    <Input className="pr-2 sm:pr-44 h-12" />
    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
      <ModelSelector className="h-10 sm:h-8" />
      <ImageCountSelector className="h-10 sm:h-8" />
      <Button>Image</Button>
      <PlatformSelector className="h-10 sm:h-8" />
      <Button>Video</Button>
      <Button>Omega</Button>
      <Button>Character Settings</Button>
      <SettingsDropdown />
    </div>
  </div>
</div>
```

**Mobile Layout (prompt-bar.tsx Line 167-224):**
```tsx
{/* Mobile buttons row - Only visible on mobile */}
<div className="sm:hidden space-y-3">
  <div className="flex gap-2 justify-center">
    <ModelSelector />
    <ImageCountSelector />
    <PlatformSelector />
    <Button><Users className="w-4 h-4" /></Button>
    <SettingsDropdown />
  </div>
  <div className="flex gap-2 justify-center">
    <Button className="flex-1"><ImageIcon /> Image</Button>
    <Button className="flex-1"><VideoIcon /> Video</Button>
    <Button className="flex-1"><Sparkles /> Omega</Button>
  </div>
</div>
```

**Key Mobile Insights:**
1. **Duplicate UI:** Desktop controls in absolute position, mobile controls below (conditional rendering)
2. **Touch-Friendly:** Mobile buttons use `h-10` instead of desktop `h-8`
3. **Full Width Buttons:** `flex-1` on mobile for easy thumb access
4. **Icon-Only Options:** Character settings button shows only icon on mobile

### 4.4 Dropdown Mobile Pattern

**Universal Mobile Dropdown Width:**
```tsx
// ALL dropdowns use this pattern
className="w-[calc(100vw-2rem)] max-w-[320px]"
```

**Calculation:**
- `100vw` = Full viewport width
- `-2rem` = 32px padding (16px each side)
- `max-w-[320px]` = Desktop constraint
- **Result:** Full width on mobile (minus padding), constrained on desktop

### 4.5 Text Truncation & Overflow

**Pattern from focused-media-view.tsx (Line 459-470):**
```tsx
<span className="hidden sm:inline">Previous</span>
<span className="sm:hidden">Prev</span>

<span className="hidden sm:inline">Next</span>
<span className="sm:hidden">Next</span>
```

**Line Clamping (model-selector.tsx Line 87-88):**
```tsx
<p className="text-xs text-muted-foreground mb-2 line-clamp-2">
  {config.description}
</p>
```

---

## 5. Key Files Reference Guide

### 5.1 Core Selector Components

| File | Lines | Purpose | Key Patterns |
|------|-------|---------|--------------|
| `src/components/model-selector.tsx` | 17-21, 40-114, 119-144 | Rich dropdown selector with metadata | DropdownMenu pattern, localStorage hook, icon mapping |
| `src/components/platform-selector.tsx` | 23-56, 74-100, 117-141 | Simple select with descriptions | Select pattern, persistent state hook |
| `src/components/image-count-selector.tsx` | 21-59, 64-80 | Dynamic count selection | Select pattern, model-aware limits |
| `src/components/omega/character-selector.tsx` | 29-66, 75-172, 175-201 | Character selection with avatars | DropdownMenu pattern, config objects, emoji icons |

### 5.2 State Management & Utilities

| File | Lines | Purpose | Key Patterns |
|------|-------|---------|--------------|
| `src/lib/model-types.ts` | 3-17, 19-74, 79-94 | Type-safe config system | TypeScript config objects, helper functions |
| `src/hooks/use-toast.ts` | 1-189 | Global toast notifications | Reducer pattern, memory state, listener system |
| `src/lib/error-handler.ts` | 4-28, 39-59, 86-136, 280-304 | Error handling & retry logic | Exponential backoff, timeout wrapper, service health checks |

### 5.3 API & Integration

| File | Lines | Purpose | Key Patterns |
|------|-------|---------|--------------|
| `src/app/api/generate-images/route.ts` | 4-84 | Image generation API | Model mapping, API key handling, response formatting |
| `src/app/api/generate-omega/route.ts` | 4-131 | Omega service bridge | External service forwarding, timeout handling, operation tracking |
| `src/components/content-grid.tsx` | 221-503, 611-632 | Main generation orchestrator | Function lifting pattern, retry logic, state updates |

### 5.4 Layout & Mobile

| File | Lines | Purpose | Key Patterns |
|------|-------|---------|--------------|
| `src/app/page.tsx` | 30-60, 13-21, 63-92 | Main page layout | Mobile logo hiding, responsive flex, state lifting |
| `src/components/prompt-bar.tsx` | 94-162, 167-224 | Main input bar | Duplicate UI pattern, absolute positioning, mobile stacking |
| `src/components/focused-media-view.tsx` | 459-470 | Fullscreen media viewer | Text truncation for mobile |

### 5.5 Specific Line Numbers for Copy-Paste

**For Shot Type Selector Implementation:**

1. **Dropdown Structure:** Copy `model-selector.tsx` lines 40-114
2. **Icon Mapping:** Copy `model-selector.tsx` lines 17-21
3. **localStorage Hook:** Copy `model-selector.tsx` lines 119-144
4. **Mobile Width Pattern:** Copy from any selector: `className="w-[calc(100vw-2rem)] max-w-[320px]"`
5. **Selection Indicator:** Copy `model-selector.tsx` lines 70, 83-85
6. **Config Type Definition:** Copy pattern from `model-types.ts` lines 5-17
7. **Helper Functions:** Copy pattern from `model-types.tsx` lines 79-94

---

## 6. Architecture Decision Summary

### 6.1 When to Use Each Pattern

**Use DropdownMenu when:**
- Need rich visual displays (icons, descriptions, metadata)
- Multiple data points per option
- Character/model-like selections
- **Example:** Shot type selector (multiple metadata per shot)

**Use Select when:**
- Simple form-like selections
- Minimal metadata
- Count/number selections
- **Example:** Image count, simple toggles

**Use Custom Events when:**
- Cross-component state synchronization needed
- Avoiding prop drilling
- Multiple components need same state updates
- **Example:** Model change affecting multiple UI areas

**Use localStorage when:**
- User preferences persistence
- Selection memory across sessions
- Non-sensitive data
- **Example:** All selector states

### 6.2 Mobile-First Design Principles

1. **Duplicate, Don't Adapt:** Create separate mobile/desktop layouts with `sm:hidden` / `hidden sm:block`
2. **Touch Targets:** Minimum 40px (h-10) on mobile, can be 32px (h-8) on desktop
3. **Full Width Modals:** Always use `w-[calc(100vw-2rem)]` for mobile dropdowns
4. **Conditional Content:** Hide complex UI on mobile, show essential actions only
5. **Vertical Stacking:** Default to `flex-col`, switch to `flex-row` on `sm:` breakpoint

### 6.3 Type Safety & Config Objects

**Always structure configs as:**
```tsx
export type OptionType = 'option1' | 'option2' | 'option3';

export interface OptionConfig {
  id: OptionType;
  name: string;
  description: string;
  // ... metadata
}

export const OPTION_CONFIGS: Record<OptionType, OptionConfig> = {
  // ... definitions
};

// Helper functions for type-safe access
export const getConfig = (type: OptionType) => OPTION_CONFIGS[type];
```

---

## 7. VEO3 UI Integration Implementation Guide

### 7.1 Video Model Type System

**Create:** `src/lib/video-model-types.ts`

```typescript
// Video model type definitions (follow model-types.ts pattern)
export type VideoModel = 'veo-3-preview' | 'veo-3-standard';

export interface VideoModelConfig {
  id: VideoModel;
  name: string;
  description: string;
  capabilities: string[];
  costPerSecond: number;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  quality: 'Standard' | 'High' | 'Ultra';
  features: string[];
  apiEndpoint: string;
  modelIdentifier: string;
}

export const VIDEO_MODEL_CONFIGS: Record<VideoModel, VideoModelConfig> = {
  'veo-3-preview': {
    id: 'veo-3-preview',
    name: 'VEO3 Preview',
    description: 'Ultra-realistic video generation with JSON prompting and native audio',
    capabilities: [
      'Ultra-photorealistic humans',
      'Natural lip sync',
      'Professional cinematography',
      'Character consistency',
      'Snubroot timing'
    ],
    costPerSecond: 0.75,
    supportedDurations: [4, 6, 8],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    quality: 'Ultra',
    features: [
      'JSON prompting (300%+ quality)',
      'Native audio generation',
      'Prompt rewriting',
      'Image-to-video',
      'A/B hook testing',
      'Platform optimization'
    ],
    apiEndpoint: '/api/generate-veo3',
    modelIdentifier: 'veo-3.0-generate-preview'
  }
};

export const DEFAULT_VIDEO_MODEL: VideoModel = 'veo-3-preview';

// Helper functions
export const getVideoModelConfig = (model: VideoModel): VideoModelConfig => {
  return VIDEO_MODEL_CONFIGS[model];
};

export const getVideoModelDisplayName = (model: VideoModel): string => {
  return VIDEO_MODEL_CONFIGS[model].name;
};

export const getVideoModelCost = (model: VideoModel, duration: number = 8): number => {
  return VIDEO_MODEL_CONFIGS[model].costPerSecond * duration;
};
```

### 7.2 Video Duration Selector Component

**Create:** `src/components/video-duration-selector.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { VideoModel, VIDEO_MODEL_CONFIGS, getVideoModelConfig } from "@/lib/video-model-types";

interface VideoDurationSelectorProps {
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  selectedModel?: VideoModel;
  disabled?: boolean;
  className?: string;
}

export function VideoDurationSelector({
  selectedDuration,
  onDurationChange,
  selectedModel = 'veo-3-preview',
  disabled = false,
  className = ""
}: VideoDurationSelectorProps) {
  const supportedDurations = VIDEO_MODEL_CONFIGS[selectedModel].supportedDurations;

  return (
    <Select
      value={selectedDuration.toString()}
      onValueChange={(value) => onDurationChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[90px] h-8 ${className}`}>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{selectedDuration}s</span>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[calc(100vw-2rem)] max-w-[200px]">
        {supportedDurations.map((duration) => (
          <SelectItem key={duration} value={duration.toString()} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-medium">{duration} seconds</span>
              <span className="text-xs text-muted-foreground">
                ${(VIDEO_MODEL_CONFIGS[selectedModel].costPerSecond * duration).toFixed(2)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Hook with model-aware duration selection
export function useVideoDurationSelection(selectedModel: VideoModel = 'veo-3-preview') {
  const supportedDurations = VIDEO_MODEL_CONFIGS[selectedModel].supportedDurations;
  const defaultDuration = supportedDurations[supportedDurations.length - 1]; // Default to max
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("veo3-video-duration");
    if (saved) {
      const duration = parseInt(saved);
      if (supportedDurations.includes(duration)) {
        setSelectedDuration(duration);
        return;
      }
    }
    setSelectedDuration(defaultDuration);
  }, []);

  useEffect(() => {
    // Adjust if current duration not supported by new model
    if (!supportedDurations.includes(selectedDuration)) {
      setSelectedDuration(defaultDuration);
    }
  }, [selectedModel, supportedDurations, selectedDuration, defaultDuration]);

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    localStorage.setItem("veo3-video-duration", duration.toString());
  };

  return { selectedDuration, setSelectedDuration: handleDurationChange };
}
```

### 7.3 Video Model Selector Component

**Create:** `src/components/video-model-selector.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Video, Sparkles } from "lucide-react";
import { VideoModel, VIDEO_MODEL_CONFIGS, getVideoModelConfig, DEFAULT_VIDEO_MODEL } from "@/lib/video-model-types";

const VIDEO_MODEL_ICONS = {
  'veo-3-preview': Sparkles,
  'veo-3-standard': Video,
} as const;

interface VideoModelSelectorProps {
  selectedModel: VideoModel;
  onModelChange: (model: VideoModel) => void;
  disabled?: boolean;
}

export function VideoModelSelector({
  selectedModel,
  onModelChange,
  disabled = false
}: VideoModelSelectorProps) {
  const currentConfig = getVideoModelConfig(selectedModel);
  const CurrentIcon = VIDEO_MODEL_ICONS[selectedModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-10 sm:h-8 px-3 font-medium min-w-[110px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-3 h-3" />
            <span className="text-xs">VEO3</span>
          </div>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px]">
        <DropdownMenuLabel className="text-sm font-medium">
          Choose Video Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(VIDEO_MODEL_CONFIGS) as VideoModel[]).map((modelId) => {
          const config = getVideoModelConfig(modelId);
          const Icon = VIDEO_MODEL_ICONS[modelId];
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
                      {config.quality} quality
                    </span>
                    <span className="font-medium text-primary">
                      ${config.costPerSecond}/sec
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {config.features.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          💡 VEO3 includes JSON prompting, native audio, and ultra-realistic humans
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook with localStorage persistence
export function useVideoModelSelection() {
  const [selectedModel, setSelectedModel] = useState<VideoModel>(DEFAULT_VIDEO_MODEL);

  useEffect(() => {
    const savedModel = localStorage.getItem("veo3-selected-model") as VideoModel;
    if (savedModel && VIDEO_MODEL_CONFIGS[savedModel]) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (model: VideoModel) => {
    setSelectedModel(model);
    localStorage.setItem("veo3-selected-model", model);

    window.dispatchEvent(new CustomEvent('veo3ModelChanged', {
      detail: { model }
    }));
  };

  return { selectedModel, setSelectedModel: handleModelChange };
}
```

### 7.4 VEO3 API Route

**Create:** `src/app/api/generate-veo3/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { VEO3Service } from "@/lib/veo3Service";

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      apiKey: userApiKey,
      platform = 'youtube',
      duration = 8,
      aspectRatio,
      videoCount = 1,
      enablePromptRewriting = true,
      enableSoundGeneration = true,
      firstFrame // Optional: path to reference image for image-to-video
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check GCP configuration
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;

    if (!projectId || !location) {
      return NextResponse.json({
        error: "VEO3 requires GCP_PROJECT_ID and GCP_LOCATION environment variables."
      }, { status: 500 });
    }

    console.log("🎬 VEO3 generation request:", {
      prompt: prompt.substring(0, 100) + '...',
      platform,
      duration,
      aspectRatio,
      videoCount
    });

    // Initialize VEO3 service (uses existing service at src/lib/veo3Service.ts)
    const veo3Service = new VEO3Service({
      projectId,
      location,
      outputPath: './generated/veo3'
    });

    // Get platform settings (already implemented in VEO3Service)
    const platformSettings = VEO3Service.getPlatformSettings(platform as 'tiktok' | 'youtube' | 'instagram');

    // Build request
    const veo3Request = {
      prompt,
      duration,
      aspectRatio: aspectRatio || platformSettings.aspectRatio,
      firstFrame,
      quality: 'high' as const,
      videoCount,
      enablePromptRewriting,
      enableSoundGeneration
    };

    // Generate video using EXISTING VEO3 service
    const result = await veo3Service.generateVideoSegment(veo3Request);

    if (!result.success) {
      console.error("VEO3 generation failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to generate video" },
        { status: 500 }
      );
    }

    console.log(`✅ Generated ${result.videos.length} video(s) with VEO3`);

    // Transform response to frontend schema
    const videos = result.videos.map((video, index) => ({
      id: `veo3-${Date.now()}-${index}`,
      url: video.videoUrl || `/api/serve-video?path=${encodeURIComponent(video.videoPath)}`,
      duration: video.duration,
      quality: video.quality,
      platform,
      aspectRatio: veo3Request.aspectRatio
    }));

    return NextResponse.json({
      success: true,
      videos,
      prompt: result.prompt,
      enhancedPrompt: result.enhancedPrompt,
      metadata: {
        ...result.metadata,
        platform,
        aspectRatio: veo3Request.aspectRatio,
        features: {
          promptRewriting: enablePromptRewriting,
          soundGeneration: enableSoundGeneration,
          imageToVideo: !!firstFrame,
          jsonPrompting: true,
          snubrootTiming: true
        }
      }
    });

  } catch (error) {
    console.error("VEO3 API error:", error);

    if (error instanceof Error && error.message.includes('gcloud')) {
      return NextResponse.json({
        error: "VEO3 requires gcloud CLI. Run: gcloud auth application-default login"
      }, { status: 500 });
    }

    return NextResponse.json(
      { error: "VEO3 generation failed. Check server logs." },
      { status: 500 }
    );
  }
}
```

### 7.5 Update Prompt Bar for VEO3

**Modify:** `src/components/prompt-bar.tsx`

Add these imports at the top:
```typescript
import { useVideoModelSelection } from "@/components/video-model-selector";
import { useVideoDurationSelection } from "@/components/video-duration-selector";
import { VideoModelSelector } from "@/components/video-model-selector";
import { VideoDurationSelector } from "@/components/video-duration-selector";
```

Add state hooks in component:
```typescript
export function PromptBar({ onGenerate, ... }: PromptBarProps) {
  // Existing state...
  const { selectedModel, setSelectedModel } = useModelSelection(); // Image
  const { selectedVideoModel, setSelectedVideoModel } = useVideoModelSelection(); // NEW
  const { selectedDuration, setSelectedDuration } = useVideoDurationSelection(selectedVideoModel); // NEW
  const { selectedPlatform, setSelectedPlatform } = usePersistentPlatformSelection();

  const handleGenerate = (type: "image" | "video" | "veo3" | "omega") => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    if (onGenerate) {
      if (type === "veo3") {
        // NEW: VEO3 generation
        onGenerate(type, prompt.trim(), {
          videoModel: selectedVideoModel,
          duration: selectedDuration,
          platform: selectedPlatform,
          enablePromptRewriting: true,
          enableSoundGeneration: true
        });
      } else if (type === "omega") {
        onGenerate(type, prompt.trim(), {
          omegaOptions: { character: selectedCharacter, preset: selectedPreset }
        });
      } else if (type === "video") {
        onGenerate(type, prompt.trim(), { platform: selectedPlatform });
      } else {
        onGenerate(type, prompt.trim(), { model: selectedModel, imageCount: selectedCount });
      }
    }

    setPrompt("");
    setTimeout(() => setIsGenerating(false), 500);
  };
```

Add VEO3 controls to desktop layout (after Video button):
```typescript
<div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
  {/* Existing controls... */}
  <Button onClick={() => handleGenerate("video")}>
    <VideoIcon /> Video
  </Button>

  {/* NEW: VEO3 controls */}
  <VideoModelSelector
    selectedModel={selectedVideoModel}
    onModelChange={setSelectedVideoModel}
    disabled={isGenerating}
  />
  <VideoDurationSelector
    selectedDuration={selectedDuration}
    onDurationChange={setSelectedDuration}
    selectedModel={selectedVideoModel}
    disabled={isGenerating}
  />
  <Button
    onClick={() => handleGenerate("veo3")}
    disabled={!prompt.trim() || isGenerating}
    className="h-10 sm:h-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
  >
    <Sparkles className="w-4 h-4 mr-1" />
    VEO3
  </Button>

  {/* Omega button... */}
</div>
```

Add to mobile layout:
```typescript
<div className="sm:hidden space-y-3">
  <div className="flex gap-2 justify-center">
    {/* Existing selectors... */}
    <VideoModelSelector
      selectedModel={selectedVideoModel}
      onModelChange={setSelectedVideoModel}
      disabled={isGenerating}
    />
    <VideoDurationSelector
      selectedDuration={selectedDuration}
      onDurationChange={setSelectedDuration}
      selectedModel={selectedVideoModel}
      disabled={isGenerating}
    />
  </div>
  <div className="flex gap-2 justify-center">
    <Button className="flex-1" onClick={() => handleGenerate("image")}>Image</Button>
    <Button className="flex-1" onClick={() => handleGenerate("video")}>Video</Button>
    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600" onClick={() => handleGenerate("veo3")}>VEO3</Button>
    <Button className="flex-1" onClick={() => handleGenerate("omega")}>Omega</Button>
  </div>
</div>
```

---

## 8. Implementation Checklist

### Files to Create ✨
- [ ] `src/lib/video-model-types.ts` - Video model type system
- [ ] `src/components/video-model-selector.tsx` - Model dropdown selector
- [ ] `src/components/video-duration-selector.tsx` - Duration selector (4s, 6s, 8s)
- [ ] `src/app/api/generate-veo3/route.ts` - VEO3 API route wrapper

### Files to Modify 📝
- [ ] `src/components/prompt-bar.tsx` - Add VEO3 button and controls
- [ ] `src/app/page.tsx` - Update generate handler to support VEO3 type
- [ ] `src/components/content-grid.tsx` - Add video display for VEO3 results

### Environment Variables Required 🔐
```bash
# .env or .env.local
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GOOGLE_AI_API_KEY=your-gemini-api-key  # For image generation
```

### Testing Steps 🧪
1. Test VEO3Service connection: Already has `testConnection()` method
2. Create simple prompt: "Professional advisor explaining insurance"
3. Select VEO3 model, 8s duration, YouTube platform
4. Click VEO3 button
5. Verify video generation with all viral techniques applied

---

## 9. Key Architecture Decisions

### 9.1 Why VEO3Service is Separate from UI
- **Separation of Concerns**: Service handles complex AI logic, UI handles user interaction
- **Reusability**: Same service used by UI, CLI scripts, and Omega workflows
- **Testing**: Service can be tested independently
- **Evolution**: UI can change without affecting core generation logic

### 9.2 Component Pattern Choices
- **Video Model Selector**: DropdownMenu (rich metadata like image selector)
- **Duration Selector**: Select (simple value selection)
- **State Management**: localStorage + custom events (matches existing pattern)
- **Mobile**: Duplicate UI pattern (proven responsive approach)

### 9.3 Cost Display Strategy
- Show cost per second in model selector
- Calculate total cost in duration selector (duration × cost/sec)
- Display final cost in generation result metadata

---

## 10. Quick Reference

### Copy-Paste Locations
**For VEO3 Implementation:**

1. **DropdownMenu Structure**: Copy from `src/components/model-selector.tsx` lines 40-114
2. **Select Structure**: Copy from `src/components/platform-selector.tsx` lines 74-100
3. **localStorage Hook**: Copy from `src/components/model-selector.tsx` lines 119-144
4. **API Route Pattern**: Copy from `src/app/api/generate-videos/route.ts` lines 1-88
5. **Mobile Width Pattern**: `className="w-[calc(100vw-2rem)] max-w-[320px]"`
6. **Type Config Pattern**: Copy from `src/lib/model-types.ts` lines 3-74

### File Locations Reference
| Component | File | Lines |
|-----------|------|-------|
| VEO3 Service (COMPLETE) | `src/lib/veo3Service.ts` | 117-993 |
| Model Selector Pattern | `src/components/model-selector.tsx` | 17-21, 40-114, 119-144 |
| Platform Selector Pattern | `src/components/platform-selector.tsx` | 74-100, 117-141 |
| Count Selector Pattern | `src/components/image-count-selector.tsx` | 21-59, 64-80 |
| Prompt Bar Integration | `src/components/prompt-bar.tsx` | 16-229 |
| API Route Pattern | `src/app/api/generate-videos/route.ts` | 1-88 |

---

**Implementation Guide Complete**

This document provides ALL necessary patterns, code examples, and file locations to integrate VEO3 UI following omega-platform's exact architecture.

The VEO3Service is **production-ready** with all viral techniques. UI integration is straightforward: create selectors, add button, wrap API route.

Sign off as SmokeDev 🚬
