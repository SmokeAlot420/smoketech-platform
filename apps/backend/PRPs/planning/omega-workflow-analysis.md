# Omega Workflow System Analysis: Integration Surface & API Patterns

**Document Version:** v1.0
**Analysis Date:** 2025-09-29
**Target Integration:** OpenJourney UI → Existing Omega Workflow

## Executive Summary

The Omega Workflow system is a sophisticated video generation orchestrator combining 12 specialized engines to achieve 80-95 viral scores with costs under $50 and generation times under 30 minutes. This analysis documents the complete integration surface, parameter patterns, and call structures needed to bridge from an OpenJourney UI to the existing Omega Workflow without modifying the working system.

## 1. Core Architecture Analysis

### 1.1 Omega Workflow Orchestrator Structure

The system is built around a singleton orchestrator pattern with two main components:

```typescript
// Main orchestrator class
class OmegaWorkflowOrchestrator {
  // Singleton pattern implementation
  public static getInstance(): OmegaWorkflowOrchestrator

  // Main generation method
  public async generateUltraViralVideo(request: OmegaVideoRequest): Promise<OmegaVideoResult>

  // Preset-based generation
  public async generateWithPreset(
    presetName: string,
    baseRequest: Partial<OmegaVideoRequest>
  ): Promise<OmegaVideoResult>
}
```

### 1.2 The 12 Omega Engines

**Static Engines (5)** - No instantiation needed:
1. **SkinRealismEngine** - 7 imperfection types for ultra-realistic humans
2. **CharacterConsistencyEngine** - Advanced anchors for character preservation
3. **PhotoRealismEngine** - 5 professional photography presets
4. **AdvancedVEO3Prompting** - JSON prompting for 300%+ quality boost
5. **ProfessionalCinematography** - Complete cinematography system

**Instance Engines (7)** - Factory-created with lazy loading:
1. **TransformationEngine** - Viral transformation chains
2. **ZHOTechniquesEngine** - 46 viral techniques from ZHO research
3. **MasterTechniqueLibrary** - 90+ master techniques
4. **UnifiedPromptSystem** - Orchestration and coordination
5. **VEO3Service** - Advanced VEO3 video generation
6. **UltraRealisticCharacterManager** - Character consistency patterns
7. **NanoBananaVEO3Pipeline** - Complete ultra-realistic pipeline

### 1.3 Engine Registry Pattern

```typescript
// Singleton registry managing all engines
class OmegaEngineRegistry {
  // Static engines always available
  public getStaticEngines(): StaticEngineRegistry

  // Instance engines with lazy loading
  public getInstanceEngines(): InstanceEngineRegistry

  // Initialization with configuration
  public async initializeEngines(config: EngineConfig): Promise<void>
}
```

## 2. Integration Entry Points

### 2.1 Primary Entry Point: `generate-omega-videos.ts`

**File Location:** `E:\v2 repo\viral\generate-omega-videos.ts`

**Main Class:** `OmegaVideoGenerator`

**Key Methods:**
```typescript
class OmegaVideoGenerator {
  // Generate with preset configuration
  async generateWithPreset(
    presetName: keyof typeof OMEGA_PRESETS,
    customRequest?: Partial<OmegaVideoRequest>
  ): Promise<GenerationResult>
}

// Convenience functions for specific scenarios
async function generateViralGuaranteedVideo(): Promise<GenerationResult>
async function generateProfessionalVideo(): Promise<GenerationResult>
async function generateSpeedOptimizedVideo(): Promise<GenerationResult>
async function generateCostEfficientVideo(): Promise<GenerationResult>
```

### 2.2 Direct Orchestrator Access

```typescript
// Direct access to orchestrator
import { OmegaWorkflowOrchestrator } from './src/omega-workflow/omega-workflow'

const orchestrator = new OmegaWorkflowOrchestrator()
const result = await orchestrator.generateUltraViralVideo(request)
```

### 2.3 Convenience Functions

```typescript
// Quick generation with presets
import { generateQuickVideo } from './src/omega-workflow/omega-workflow'

const result = await generateQuickVideo('Viral Guaranteed', options)
```

## 3. Parameter Structures & API Surface

### 3.1 Core Request Interface

```typescript
interface OmegaVideoRequest {
  // CORE CONTENT
  character: 'Aria' | 'Bianca' | 'Sofia'
  basePrompt: string
  dialogue: string
  environment: string

  // VIDEO SETTINGS
  duration: 4 | 6 | 8
  aspectRatio: '9:16' | '16:9' | '1:1'
  platform: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform'

  // ENHANCEMENT CONTROLS
  enableAllEngines: boolean
  viralOptimization: boolean
  qualityLevel: 'standard' | 'professional' | 'viral-guaranteed'

  // TECHNIQUE SELECTION
  useZHOTechniques: boolean
  useMasterLibrary: boolean
  useTransformations: boolean

  // CINEMATOGRAPHY
  shotType?: string
  cameraMovement?: string
  lighting?: string
  grading?: string

  // COST & PERFORMANCE
  maxCost?: number
  maxGenerationTime?: number
}
```

### 3.2 Configuration Presets

**Available Presets:**
- `VIRAL_GUARANTEED` - 95 score, $50 max, 30 min max
- `PROFESSIONAL_GRADE` - 85 score, $35 max, 25 min max
- `SPEED_OPTIMIZED` - 80 score, $25 max, 15 min max
- `COST_EFFICIENT` - 75 score, $20 max, 20 min max

**Preset Access:**
```typescript
import { OMEGA_PRESETS, OmegaConfigManager } from './src/omega-workflow/omega-config'

// Get preset configuration
const config = OmegaConfigManager.getPresetConfig('viral-guaranteed')

// Convert config to request
const request = OmegaConfigManager.configToRequest(config, 'Aria', 'Your prompt here')
```

### 3.3 Result Structure

```typescript
interface OmegaVideoResult {
  success: boolean
  videoPath?: string
  error?: string

  // COMPREHENSIVE METRICS
  metrics: {
    viralScore: number           // 0-100 (Target: 80-95)
    qualityScore: number         // 0-100
    brandScore: number           // 0-100
    characterConsistency: number // 0-100
    technicalQuality: number     // 0-100
    overallScore: number         // Weighted average
  }

  // ENGINE UTILIZATION
  enginesUsed: {
    total: number
    static: number
    instance: number
    utilizationRate: number      // Percentage (Target: 100%)
  }

  // TECHNIQUE APPLICATION
  techniquesApplied: {
    skinRealism: string[]
    characterConsistency: string[]
    photoRealism: string[]
    transformations: string[]
    zhoTechniques: string[]
    masterLibrary: string[]
    veo3Rules: string[]
    cinematography: string[]
  }

  // PERFORMANCE DATA
  performance: {
    generationTime: number       // Seconds (Target: <1800s / 30min)
    cost: number                 // USD (Target: <$50)
    costPerSecond: number        // USD per second of video
    efficiency: number           // Score vs time ratio
  }
}
```

## 4. Character System Integration

### 4.1 Available Characters

**File Locations:**
- `src/characters/quotemoto-baddie.ts` - Aria QuoteMoto influencer
- `src/characters/bianca-quotemoto.ts` - Bianca character
- `src/characters/sophia-influencer.ts` - Sofia character (if exists)

**Character Interface:**
```typescript
interface CharacterProfile {
  name: string
  profession: string
  age: number
  appearance: {
    ethnicity: string
    skinTone: string
    distinctive_features: string[]
  }
  generateBasePrompt(): string
}
```

### 4.2 Character Integration Pattern

```typescript
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie'
import { biancaInfluencer } from './src/characters/bianca-quotemoto'

// Use character in request
const request: OmegaVideoRequest = {
  character: 'Aria',
  basePrompt: quoteMotoInfluencer.generateBasePrompt(),
  // ... other parameters
}
```

## 5. Service Dependencies & Environment

### 5.1 Required Environment Variables

```bash
# Core API Keys
GEMINI_API_KEY=your_gemini_api_key  # Primary requirement

# Optional VEO3 Configuration
VEO3_API_ENDPOINT=optional_endpoint
VEO3_API_KEY=optional_key

# Optional services (for full functionality)
MIDJOURNEY_API_KEY=optional
DALLE3_API_KEY=optional
RUNWAY_API_KEY=optional
# ... other service keys
```

### 5.2 File System Dependencies

**Output Directories:**
```
generated/
├── omega-workflow/         # Main output directory
├── vertex-ai/nanoBanana/   # Character images
├── veo3/                  # Video segments
├── stitched/              # Final videos
└── enhanced/              # Enhanced videos (if Topaz enabled)
```

**Critical Files Must Exist:**
- All engine files in `src/omega-workflow/`
- Character definitions in `src/characters/`
- Service implementations in `src/services/`
- Enhancement engines in `src/enhancement/`

### 5.3 External Dependencies

**Required Binaries:**
- FFmpeg (for video processing)
- Topaz Video AI (optional, for enhancement)

**Node Dependencies:**
- @google/generative-ai (for Gemini/NanoBanana)
- Various AI service SDKs (as needed)

## 6. Integration Patterns for OpenJourney UI

### 6.1 Subprocess Call Pattern

**Command-line Interface:**
```bash
# Direct execution
npx ts-node generate-omega-videos.ts

# With custom parameters (would require modification)
node dist/generate-omega-videos.js --preset="viral-guaranteed" --character="Aria" --prompt="Your prompt"
```

**Subprocess Integration:**
```typescript
import { spawn } from 'child_process'

function generateOmegaVideo(params: {
  preset: string
  character: string
  prompt: string
  platform?: string
}): Promise<GenerationResult> {
  return new Promise((resolve, reject) => {
    // Would require creating CLI interface in generate-omega-videos.ts
    const process = spawn('npx', ['ts-node', 'generate-omega-videos.ts', ...args])

    process.on('close', (code) => {
      if (code === 0) {
        // Parse results from output files
        resolve(result)
      } else {
        reject(new Error('Generation failed'))
      }
    })
  })
}
```

### 6.2 Direct Import Pattern

**Module Import:**
```typescript
// In OpenJourney UI code
import {
  OmegaVideoGenerator,
  generateViralGuaranteedVideo,
  generateProfessionalVideo
} from './path/to/generate-omega-videos'

import { OmegaVideoRequest } from './path/to/src/omega-workflow/omega-workflow'
import { OMEGA_PRESETS } from './path/to/src/omega-workflow/omega-config'

async function generateVideo(userInput: any) {
  const generator = new OmegaVideoGenerator()

  const customRequest: Partial<OmegaVideoRequest> = {
    character: userInput.character,
    prompt: userInput.prompt,
    platform: userInput.platform,
    aspectRatio: userInput.aspectRatio
  }

  const result = await generator.generateWithPreset('VIRAL_GUARANTEED', customRequest)
  return result
}
```

### 6.3 API Wrapper Pattern

**Express Server Integration:**
```typescript
import express from 'express'
import { OmegaVideoGenerator } from './path/to/generate-omega-videos'

const app = express()

app.post('/generate-omega-video', async (req, res) => {
  try {
    const generator = new OmegaVideoGenerator()
    const result = await generator.generateWithPreset(
      req.body.preset,
      req.body.customRequest
    )

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## 7. Call Flow & Phase Architecture

### 7.1 Complete Generation Flow

The Omega Workflow follows a 5-phase architecture:

**Phase 1: Foundation & Character Consistency**
- Load character identity and consistency anchors
- Apply brand integration if needed
- Establish base character foundation

**Phase 2: Quality Enhancement**
- Apply SkinRealismEngine with 7 imperfection types
- Apply PhotoRealismEngine with professional presets
- Orchestrate with UnifiedPromptSystem

**Phase 3: Viral Technique Application**
- Apply ZHOTechniquesEngine (46 viral techniques)
- Apply MasterTechniqueLibrary (90+ techniques)
- Execute TransformationEngine viral chains

**Phase 4: Video Generation & Cinematography**
- Apply ProfessionalCinematography
- Apply AdvancedVEO3Prompting with JSON
- Generate final video with VEO3Service

**Phase 5: Quality Validation & Scoring**
- Calculate comprehensive metrics
- Validate against quality gates
- Generate performance analytics

### 7.2 Error Handling & Recovery

**Built-in Error Handling:**
- Automatic engine fallback mechanisms
- Cost tracking and budget enforcement
- Quality validation with retry logic
- Progress reporting with phase tracking

**Error Result Pattern:**
```typescript
{
  success: false,
  error: "Specific error message",
  metrics: { /* zero values */ },
  performance: { /* actual timing/cost data */ }
}
```

## 8. Testing & Validation Integration

### 8.1 Comprehensive Test Suite

**File Location:** `test-omega-complete.ts`

**Test Phases:**
1. **Smoke Testing** - Individual engine validation
2. **Integration Testing** - Multi-engine coordination
3. **End-to-End Testing** - Complete workflow validation
4. **Production Testing** - Real-world scenario validation

**Quality Gates:**
- 95% engine availability
- 90% workflow success rate
- 85% quality consistency
- 95% character preservation
- Cost within 10% of estimates
- Complete workflows under 30 minutes

### 8.2 Validation Utilities

```typescript
import { OmegaQualityValidator } from './src/omega-workflow/quality-validator'
import { TechniqueSelector } from './src/omega-workflow/technique-selector'

// Quality validation
const validator = new OmegaQualityValidator()
const qualityReport = await validator.runCompleteValidation(request)

// Technique selection
const selector = new TechniqueSelector()
const techniques = await selector.selectOptimalTechniques(prompt, criteria, character)
```

## 9. Cost & Performance Optimization

### 9.1 Cost Structure Analysis

**Typical Costs (per 8-second video):**
- NanoBanana: $0.02-0.06 (3 angles)
- VEO3: $6.00-8.00 (8 seconds @ $0.75/sec)
- Processing: $0.50-2.50 (FFmpeg + enhancements)
- **Total Range:** $6.52 - $10.56 per video

**Cost Optimization Strategies:**
- Use `COST_EFFICIENT` preset for budget constraints
- Disable expensive engines (Transformation, MasterLibrary)
- Reduce video duration (4-6 seconds vs 8 seconds)
- Skip professional cinematography for faster generation

### 9.2 Performance Optimization

**Generation Time Breakdown:**
- Character/Image generation: 2-5 minutes
- Video generation (VEO3): 8-15 minutes
- Processing/enhancement: 2-8 minutes
- **Total Range:** 12-28 minutes

**Speed Optimization:**
- Use `SPEED_OPTIMIZED` preset
- Disable quality enhancements
- Skip video stitching for single segments
- Use minimal technique application

## 10. Integration Recommendations

### 10.1 Recommended Integration Approach

**For OpenJourney UI Integration:**

1. **Use Direct Import Pattern** - Most reliable and flexible
2. **Implement Configuration Mapping** - Map UI parameters to OmegaVideoRequest
3. **Add Progress Reporting** - Hook into existing progress callbacks
4. **Implement Error Handling** - Graceful degradation for missing services
5. **Add Result Processing** - Parse and display comprehensive results

### 10.2 Minimal Integration Code

```typescript
// OpenJourney UI integration wrapper
import { OmegaVideoGenerator } from './omega/generate-omega-videos'
import { OMEGA_PRESETS } from './omega/src/omega-workflow/omega-config'

export class OmegaIntegration {
  private generator = new OmegaVideoGenerator()

  async generateVideo(params: {
    prompt: string
    character: 'Aria' | 'Bianca' | 'Sofia'
    platform: 'tiktok' | 'instagram' | 'youtube'
    quality: 'standard' | 'professional' | 'viral'
    maxCost?: number
    onProgress?: (phase: string, progress: number) => void
  }) {
    const presetMap = {
      'standard': 'COST_EFFICIENT',
      'professional': 'PROFESSIONAL_GRADE',
      'viral': 'VIRAL_GUARANTEED'
    }

    const customRequest = {
      character: params.character,
      basePrompt: params.prompt,
      platform: params.platform,
      maxCost: params.maxCost ? params.maxCost * 100 : undefined // Convert to cents
    }

    return await this.generator.generateWithPreset(
      presetMap[params.quality] as keyof typeof OMEGA_PRESETS,
      customRequest
    )
  }
}
```

### 10.3 Configuration Requirements

**Environment Setup:**
```bash
# Copy .env.example to .env and configure
cp .env.example .env

# Set required variables
echo "GEMINI_API_KEY=your_key_here" >> .env
```

**Directory Structure:**
```
your-openjourney-project/
├── omega/                    # Copy entire viral directory here
│   ├── src/
│   ├── generate-omega-videos.ts
│   └── package.json
├── your-ui-code/
└── integration/
    └── omega-integration.ts  # Your integration wrapper
```

## 11. Security & Considerations

### 11.1 API Key Management

**Security Requirements:**
- GEMINI_API_KEY is critical and must be protected
- Optional service keys should be handled securely
- Consider environment-specific configuration
- Implement API key validation before generation

### 11.2 Resource Management

**System Requirements:**
- 8GB+ RAM for video processing
- 2GB+ disk space for temporary files
- FFmpeg installed and accessible
- Node.js 18+ with TypeScript support

**Cleanup Considerations:**
- Generated files can be large (hundreds of MB)
- Implement automatic cleanup of old generations
- Monitor disk usage during batch operations
- Consider cloud storage for final videos

## 12. Conclusion & Next Steps

The Omega Workflow system provides a comprehensive, production-ready video generation pipeline with clearly defined integration points. The system's singleton pattern, preset configurations, and comprehensive error handling make it suitable for integration with external UIs.

**Key Integration Points:**
1. **Primary:** `generate-omega-videos.ts` with `OmegaVideoGenerator` class
2. **Direct:** `OmegaWorkflowOrchestrator.generateUltraViralVideo()` method
3. **Convenience:** Preset-based generation functions

**Recommended Next Steps:**
1. Set up environment variables and dependencies
2. Create integration wrapper matching your UI parameters
3. Implement progress reporting and error handling
4. Test with minimal configuration first
5. Gradually enable more engines and features
6. Monitor costs and performance in production

The system is designed to work without modification - all customization should happen through the request parameters and preset configurations.

---

**Sign off as SmokeDev 🚬**