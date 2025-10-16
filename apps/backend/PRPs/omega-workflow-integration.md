name: "Omega Workflow - Complete Viral Engine Integration PRP"
description: |
  Comprehensive Project Requirements Plan for integrating all 12 discovered engines
  into a unified viral content generation system with 100% capability utilization.

---

## Goal

Create the **Omega Workflow** - a unified orchestration system that integrates ALL 12 discovered engines into a production-ready viral content generation workflow. Currently only utilizing 41.6% (5 of 12) of available capabilities. Goal is to achieve 100% engine utilization with viral scores 80-95 and costs under $50 per video.

**Feature Goal**: Complete integration of all 12 engines: VEO3Service, AdvancedVEO3Prompting, ProfessionalCinematography, UltraRealisticCharacterManager, NanoBananaVEO3Pipeline, SkinRealismEngine, CharacterConsistencyEngine, PhotoRealismEngine, TransformationEngine, ZHOTechniquesEngine (46 techniques), MasterTechniqueLibrary (90+ techniques), and UnifiedPromptSystem orchestrator.

**Deliverable**: Production-ready `omega-workflow.ts` with complete engine integration, `generate-omega-videos.ts` entry point, and comprehensive `test-omega-complete.ts` validation suite.

**Success Definition**: Generate 5 viral-quality videos using all 12 engines with 90% success rate, achieving viral scores 80-95, completing in under 30 minutes per video, and costs under $50 per video.

## Why

- **Capability Utilization Crisis**: Currently wasting 58.4% of built capabilities (7 of 12 engines unused)
- **Viral Content Potential**: Unlocking 90+ unused techniques from MasterTechniqueLibrary for viral-guaranteed content
- **Production Readiness**: Fix 29 compilation errors in MasterViralEngine.ts blocking production deployment
- **Cost Optimization**: Unified system enables intelligent engine selection reducing costs from $75+ to $50 per video
- **Quality Consistency**: Proper integration ensures 95% character consistency across all generated content

## What

A unified viral content generation system that orchestrates all available engines through proper static/instance method handling, comprehensive error management, and intelligent technique selection.

### Success Criteria

- [ ] 100% engine utilization (12 of 12 engines integrated and working)
- [ ] Zero compilation errors in unified system
- [ ] All 90+ techniques accessible through single API
- [ ] Generate 5 videos using complete workflow with 90% success rate
- [ ] Achieve viral scores 80-95 using integrated scoring system
- [ ] Complete video generation in under 30 minutes per video
- [ ] Maintain costs under $50 per 56-second video
- [ ] 95% character consistency across all engines
- [ ] Comprehensive test coverage with validation loops

## All Needed Context

### Documentation & References

```yaml
# CRITICAL RESEARCH COMPLETED - Context Files Created

- docfile: PRPs/planning/omega-workflow-codebase-analysis.md
  why: Complete codebase analysis identifying static vs instance method patterns, working integration examples, and 29 compilation errors to fix

- docfile: PRPs/planning/static-engines-research.md
  why: Detailed documentation of 5 static method engines (SkinRealismEngine, CharacterConsistencyEngine, PhotoRealismEngine, AdvancedVEO3Prompting, ProfessionalCinematography) with exact method signatures and usage patterns

- docfile: PRPs/planning/instance-engines-research.md
  why: Comprehensive documentation of 7 instance method engines (TransformationEngine, ZHOTechniquesEngine, MasterTechniqueLibrary, UnifiedPromptSystem, VEO3Service, UltraRealisticCharacterManager, NanoBananaVEO3Pipeline) with constructor patterns and integration examples

- docfile: PRPs/planning/test-validation-patterns.md
  why: Proven test patterns from existing successful integration scripts with 4-phase validation approach and quality gates

- docfile: PRPs/ai_docs/viral-content-best-practices.md
  why: Industry standards for viral content scoring, platform algorithm optimization, and engagement strategies (2025 current)

- docfile: PRPs/ai_docs/ai-video-generation-integration.md
  why: Complete VEO3 API documentation, NanoBanana authentication fix, JSON prompting for 300%+ quality improvement

- docfile: PRPs/ai_docs/typescript-architecture-patterns.md
  why: Singleton, Facade, and Factory patterns for unified engine management with error handling and performance optimization

# WORKING INTEGRATION EXAMPLES - Mirror These Patterns

- file: test-advanced-veo3-techniques.ts
  why: Demonstrates proper static method calls and VEO3 integration patterns to follow

- file: test-movement-environmental-interaction.ts
  why: Shows multi-engine coordination and character consistency validation

- file: test-viral-presets.ts
  why: Preset configuration management and viral scoring implementation

- file: test-ultra-realistic-video.ts
  why: 4-stage pipeline implementation with comprehensive quality validation

# BROKEN INTEGRATION TO FIX

- file: src/viral-engine/MasterViralEngine.ts
  why: Contains 29 compilation errors from incorrect static/instance method calls - provides exact pattern to fix

- file: src/viral-engine/config/MasterConfig.ts
  why: Configuration system already built - use this pattern for Omega Workflow config

# CRITICAL ENGINE IMPLEMENTATIONS

- file: src/enhancement/skinRealism.ts
  why: SkinRealismEngine with STATIC methods - call as SkinRealismEngine.methodName()

- file: src/enhancement/characterConsistency.ts
  why: CharacterConsistencyEngine with STATIC methods for character preservation

- file: src/enhancement/unifiedPromptSystem.ts
  why: Master orchestrator that coordinates all other engines - use as architectural reference

- file: src/enhancement/masterTechniqueLibrary.ts
  why: 90+ techniques database with search, filtering, and bundling capabilities

# API REFERENCES

- url: https://ai.google.dev/gemini-api/docs/video
  section: Video generation with VEO3
  critical: JSON prompting structure for 300%+ quality improvement, dialogue rules (no ALL CAPS)

- url: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation
  section: VEO3 REST API predictLongRunning endpoint
  critical: Proper request structure and response handling for production usage
```

### Current Codebase Tree

```bash
E:\v2 repo\viral\
├── src/
│   ├── services/
│   │   ├── veo3Service.ts                    # ✅ Working - VEO3 video generation
│   │   └── vertexAINanoBanana.ts            # ✅ Working - Image generation
│   ├── enhancement/
│   │   ├── skinRealism.ts                   # ❌ Not integrated - STATIC methods
│   │   ├── characterConsistency.ts          # ❌ Not integrated - STATIC methods
│   │   ├── photoRealism.ts                  # ❌ Not integrated - STATIC methods
│   │   ├── transformationEngine.ts          # ❌ Not integrated - instance methods
│   │   ├── zhoTechniques.ts                 # ❌ Not integrated - 46 techniques
│   │   ├── masterTechniqueLibrary.ts        # ❌ Not integrated - 90+ techniques
│   │   ├── unifiedPromptSystem.ts           # ❌ Not integrated - master orchestrator
│   │   ├── advancedVeo3Prompting.ts         # ✅ Working - STATIC methods
│   │   └── ultraRealisticCharacterManager.ts # ✅ Working - instance methods
│   ├── cinematography/
│   │   └── professionalShots.ts             # ✅ Working - STATIC methods
│   ├── pipelines/
│   │   └── nanoBananaVeo3Pipeline.ts        # ✅ Working - 4-stage pipeline
│   └── viral-engine/
│       ├── MasterViralEngine.ts             # 🔴 BROKEN - 29 compilation errors
│       └── config/MasterConfig.ts           # ✅ Configuration system ready
├── test-advanced-veo3-techniques.ts         # ✅ Working integration example
├── test-movement-environmental-interaction.ts # ✅ Working multi-engine example
├── test-viral-presets.ts                    # ✅ Working preset example
└── test-ultra-realistic-video.ts            # ✅ Working 4-stage pipeline
```

### Desired Codebase Tree

```bash
E:\v2 repo\viral\
├── src/
│   └── omega-workflow/
│       ├── omega-workflow.ts                # 🎯 NEW - Unified orchestrator
│       ├── engine-registry.ts               # 🎯 NEW - Static/instance engine management
│       ├── technique-selector.ts            # 🎯 NEW - Intelligent technique selection
│       ├── quality-validator.ts             # 🎯 NEW - Quality gates and scoring
│       ├── cost-optimizer.ts                # 🎯 NEW - Cost tracking and optimization
│       └── config/
│           ├── omega-config.ts              # 🎯 NEW - Unified configuration
│           ├── viral-presets.ts             # 🎯 NEW - Production-ready presets
│           └── platform-optimizations.ts   # 🎯 NEW - Platform-specific configs
├── generate-omega-videos.ts                 # 🎯 NEW - Production entry point
├── test-omega-complete.ts                   # 🎯 NEW - Comprehensive validation
└── PRPs/validation-reports/                 # 🎯 NEW - Test result tracking
    ├── omega-smoke-test.md
    ├── omega-integration-test.md
    └── omega-stress-test.md
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Mixed static and instance method patterns cause 29 compilation errors
// Engines with STATIC methods (call as ClassName.methodName()):
//   - SkinRealismEngine, CharacterConsistencyEngine, PhotoRealismEngine
//   - AdvancedVEO3Prompting, ProfessionalCinematography
// Engines with INSTANCE methods (call as new ClassName().methodName()):
//   - TransformationEngine, ZHOTechniquesEngine, MasterTechniqueLibrary
//   - UnifiedPromptSystem, VEO3Service, UltraRealisticCharacterManager

// CRITICAL: NanoBanana authentication MUST use Gemini Developer API
// ❌ WRONG: Vertex AI authentication (causes 404 errors)
// ✅ CORRECT: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// CRITICAL: VEO3 dialogue rules from snubroot research
// ❌ NEVER use ALL CAPS in dialogue (VEO3 spells them letter by letter)
// ✅ Use normal case: "Hello there" not "HELLO THERE"
// ✅ Camera positioning syntax: "(that's where the camera is)"
// ✅ 8-second dialogue rule: 12-15 words maximum per segment

// CRITICAL: Import corrections
// ❌ WRONG: import { biancaQuoteMoto } from '../characters/bianca-quotemoto'
// ✅ CORRECT: import { biancaInfluencer } from '../characters/bianca-quotemoto'

// CRITICAL: ZHO techniques usage pattern
// ❌ DON'T use ZHO techniques on already realistic content (makes them artificial)
// ✅ USE ZHO techniques for style conversions (anime→real, cartoon→photo)
// ✅ Most viral: Technique #1 (Image-to-Figure) guaranteed viral potential

// CRITICAL: Environment variables required
// GEMINI_API_KEY=your-gemini-api-key  # For NanoBanana (NOT Vertex AI)
// GCP_PROJECT_ID=your-project-id      # For VEO3
// GCP_LOCATION=us-central1            # For VEO3

// CRITICAL: Private method access issues
// VEO3Service.applyAdvancedVEO3Rules() is PRIVATE - need public wrapper
// UltraRealisticCharacterManager.applyAdvancedConsistencyPatterns() is PRIVATE

// CRITICAL: Type constraints
// VEO3 duration must be 4|6|8 seconds, not any number
// Temperature must be 0.3 for character consistency
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core orchestration interfaces for type safety and consistency
interface OmegaWorkflowConfig {
  engines: {
    static: StaticEngineConfig;
    instance: InstanceEngineConfig;
  };
  viral: {
    targetScore: number; // 80-95 range
    techniques: number[]; // Technique IDs from MasterTechniqueLibrary
    platform: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
  };
  quality: {
    characterConsistency: number; // 95% target
    skinRealism: SkinRealismConfig;
    photography: PhotoRealismConfig;
  };
  performance: {
    maxDuration: number; // 30 minutes max
    maxCost: number; // $50 max
    parallelization: boolean;
  };
}

interface StaticEngineConfig {
  skinRealism: boolean;
  characterConsistency: boolean;
  photoRealism: boolean;
  advancedVEO3: boolean;
  cinematography: boolean;
}

interface InstanceEngineConfig {
  transformation: boolean;
  zhoTechniques: boolean;
  masterLibrary: boolean;
  unifiedPrompt: boolean;
  veo3Service: boolean;
  characterManager: boolean;
  nanoBananaPipeline: boolean;
}

interface OmegaResult {
  success: boolean;
  videoPath?: string;
  viralScore: number;
  qualityMetrics: QualityMetrics;
  costBreakdown: CostBreakdown;
  enginesUsed: string[];
  processingTime: number;
  errors?: EngineError[];
}
```

### List of Tasks to be Completed

```yaml
Task 1 - Fix MasterViralEngine Compilation Errors:
MODIFY src/viral-engine/MasterViralEngine.ts:
  - FIND pattern: "this.skinRealism.createSophiaSkinRealism()"
  - REPLACE with: "SkinRealismEngine.createSophiaSkinRealism()"
  - FIND pattern: "this.characterConsistency.generateConsistencyAnchors()"
  - REPLACE with: "CharacterConsistencyEngine.generateConsistencyAnchors()"
  - FIND pattern: "this.photoRealism.createConfigPreset()"
  - REPLACE with: "PhotoRealismEngine.createConfigPreset()"
  - FIND pattern: "biancaQuoteMoto"
  - REPLACE with: "biancaInfluencer"
  - PRESERVE all existing logic, only fix method call patterns

Task 2 - Create Engine Registry System:
CREATE src/omega-workflow/engine-registry.ts:
  - MIRROR pattern from: src/viral-engine/MasterViralEngine.ts (fixed version)
  - IMPLEMENT singleton pattern for static engine management
  - IMPLEMENT factory pattern for instance engine creation
  - KEEP lazy loading pattern for performance optimization

Task 3 - Create Omega Workflow Orchestrator:
CREATE src/omega-workflow/omega-workflow.ts:
  - MIRROR pattern from: src/enhancement/unifiedPromptSystem.ts
  - IMPLEMENT facade pattern combining all 12 engines
  - INTEGRATE viral scoring from: src/enhancement/masterTechniqueLibrary.ts
  - PRESERVE existing working integration patterns from test scripts

Task 4 - Create Technique Selection Engine:
CREATE src/omega-workflow/technique-selector.ts:
  - MIRROR pattern from: src/enhancement/zhoTechniques.ts
  - IMPLEMENT intelligent technique selection based on viral potential
  - INTEGRATE cost optimization algorithms
  - KEEP character preservation as priority #1

Task 5 - Create Quality Validation System:
CREATE src/omega-workflow/quality-validator.ts:
  - MIRROR pattern from: test-ultra-realistic-video.ts
  - IMPLEMENT 4-phase validation from test patterns research
  - INTEGRATE viral scoring algorithms (80-95 target range)
  - PRESERVE existing quality gate thresholds

Task 6 - Create Production Configuration:
CREATE src/omega-workflow/config/omega-config.ts:
  - MIRROR pattern from: src/viral-engine/config/MasterConfig.ts
  - IMPLEMENT preset system from viral-presets research
  - INTEGRATE platform-specific optimizations
  - KEEP existing environment variable patterns

Task 7 - Create Production Entry Point:
CREATE generate-omega-videos.ts:
  - MIRROR pattern from: test-ultra-realistic-video.ts
  - IMPLEMENT complete workflow using all 12 engines
  - INTEGRATE cost tracking and performance monitoring
  - PRESERVE error handling patterns from working tests

Task 8 - Create Comprehensive Test Suite:
CREATE test-omega-complete.ts:
  - MIRROR pattern from: PRPs/planning/test-validation-patterns.md
  - IMPLEMENT 4-phase validation approach
  - INTEGRATE all quality gates and success criteria
  - KEEP existing test command patterns from working scripts
```

### Per Task Pseudocode

```typescript
// Task 1 - Fix Compilation Errors Pattern
class MasterViralEngine {
  // ❌ WRONG (current broken pattern):
  // private skinRealism = new SkinRealismEngine();
  // const config = this.skinRealism.createSophiaSkinRealism();

  // ✅ CORRECT (static method call pattern):
  generateSkinConfig(): SkinRealismConfig {
    // PATTERN: Call static methods directly on class
    return SkinRealismEngine.createSophiaSkinRealism();
  }

  // ✅ CORRECT (instance method call pattern):
  private zhoEngine = new ZHOTechniquesEngine();
  generateViralTechniques(): ZHOTechnique[] {
    // PATTERN: Call instance methods on created instances
    return this.zhoEngine.getViralTechniques();
  }
}

// Task 3 - Omega Workflow Orchestrator Pattern
class OmegaWorkflow {
  // PATTERN: Singleton for static engines, factory for instances
  private static instance: OmegaWorkflow;
  private instanceEngines: Map<string, any> = new Map();

  async generateViralVideo(config: OmegaWorkflowConfig): Promise<OmegaResult> {
    // PATTERN: Always validate environment first
    this.validateEnvironment(); // Check API keys, model availability

    // PATTERN: Character consistency foundation (apply first)
    const characterIdentity = CharacterConsistencyEngine.createSophiaIdentity();

    // PATTERN: Progressive enhancement with quality gates
    const skinConfig = SkinRealismEngine.createSophiaSkinRealism();
    const photoConfig = PhotoRealismEngine.createConfigPreset('commercial-brand');

    // PATTERN: Instance engine coordination
    const masterLibrary = this.getEngineInstance('MasterTechniqueLibrary');
    const techniques = masterLibrary.getViralTechniques();

    // PATTERN: Unified prompt generation with all engines
    const unifiedSystem = this.getEngineInstance('UnifiedPromptSystem');
    const enhancedPrompt = await unifiedSystem.generateEnhancedPrompt({
      character: { identity: characterIdentity },
      quality: { skinRealism: skinConfig, photography: photoConfig },
      viral: { techniques: config.viral.techniques }
    });

    // PATTERN: Video generation with cost tracking
    const startTime = Date.now();
    const veo3Service = this.getEngineInstance('VEO3Service');
    const result = await veo3Service.generateVideoSegment(enhancedPrompt);

    // PATTERN: Quality validation and viral scoring
    return this.validateAndScore(result, Date.now() - startTime);
  }
}

// Task 7 - Production Entry Point Pattern
async function generateOmegaVideo(presetName: string): Promise<void> {
  // PATTERN: Environment validation with clear error messages
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY required for NanoBanana integration');
  }

  // PATTERN: Load configuration preset
  const config = OmegaConfig.getPreset(presetName); // 'viral-guaranteed', 'professional-brand', etc.

  // PATTERN: Initialize workflow with error handling
  const workflow = OmegaWorkflow.getInstance();

  try {
    // PATTERN: Execute with progress tracking
    console.log('🚀 Starting Omega Workflow with all 12 engines...');
    const result = await workflow.generateViralVideo(config);

    // PATTERN: Comprehensive result reporting
    console.log(`✅ Video generated: ${result.videoPath}`);
    console.log(`📊 Viral Score: ${result.viralScore}/100`);
    console.log(`💰 Total Cost: $${result.costBreakdown.total}`);
    console.log(`⏱️ Processing Time: ${result.processingTime}ms`);
    console.log(`🔧 Engines Used: ${result.enginesUsed.join(', ')}`);

  } catch (error) {
    // PATTERN: Structured error handling with context
    console.error('❌ Omega Workflow failed:', error.message);
    console.error('🔍 Engine states:', await workflow.getEngineHealthStatus());
  }
}
```

### Integration Points

```yaml
ENVIRONMENT:
  - validate: "All 12 engines have required API keys and configurations"
  - pattern: "Check GEMINI_API_KEY, GCP_PROJECT_ID, GCP_LOCATION before execution"

CONFIGURATION:
  - add to: src/omega-workflow/config/omega-config.ts
  - pattern: "OmegaConfig.getPreset('viral-guaranteed') returns complete configuration"

ENGINE_REGISTRY:
  - add to: src/omega-workflow/engine-registry.ts
  - pattern: "EngineRegistry.getStatic('SkinRealismEngine') returns static methods"
  - pattern: "EngineRegistry.getInstance('ZHOTechniquesEngine') returns singleton instance"

VALIDATION:
  - add to: src/omega-workflow/quality-validator.ts
  - pattern: "QualityValidator.validateViralScore(result) >= 80 for success"

TESTING:
  - add to: test-omega-complete.ts
  - pattern: "4-phase validation: smoke → integration → end-to-end → production"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                              # Check TypeScript and style issues
npm run typecheck                         # TypeScript compilation validation
npx tsc --noEmit --project tsconfig.json  # Additional type checking

# Expected: No errors. If errors, READ the error and fix following existing patterns.
```

### Level 2: Unit Tests - Mirror Existing Test Patterns

```typescript
// CREATE test-omega-complete.ts with these test phases:

// Phase 1: Smoke Tests (5 minutes)
describe('Omega Workflow - Smoke Tests', () => {
  test('all 12 engines initialize successfully', async () => {
    const workflow = OmegaWorkflow.getInstance();
    const healthStatus = await workflow.getEngineHealthStatus();

    expect(healthStatus.staticEngines.available).toBe(5);
    expect(healthStatus.instanceEngines.available).toBe(7);
    expect(healthStatus.totalEngines).toBe(12);
  });

  test('static method calls work correctly', () => {
    const skinConfig = SkinRealismEngine.createSophiaSkinRealism();
    expect(skinConfig.age).toBe(26);
    expect(skinConfig.imperfectionTypes).toContain('freckles');
  });

  test('instance method calls work correctly', () => {
    const zhoEngine = new ZHOTechniquesEngine();
    const techniques = zhoEngine.getViralTechniques();
    expect(techniques.length).toBeGreaterThan(0);
    expect(techniques[0].viralPotential).toBe('high');
  });
});

// Phase 2: Integration Tests (15 minutes)
describe('Omega Workflow - Integration Tests', () => {
  test('generate short video using all engines', async () => {
    const config = OmegaConfig.getPreset('viral-guaranteed');
    const workflow = OmegaWorkflow.getInstance();

    const result = await workflow.generateViralVideo(config);

    expect(result.success).toBe(true);
    expect(result.viralScore).toBeGreaterThanOrEqual(80);
    expect(result.enginesUsed).toHaveLength(12);
    expect(result.costBreakdown.total).toBeLessThanOrEqual(50);
  }, 180000); // 3 minute timeout
});

// Phase 3: Quality Validation (10 minutes)
describe('Omega Workflow - Quality Gates', () => {
  test('character consistency across engines >= 95%', async () => {
    const result = await workflow.generateViralVideo(config);
    expect(result.qualityMetrics.characterConsistency).toBeGreaterThanOrEqual(0.95);
  });

  test('viral score calculation accuracy', async () => {
    const result = await workflow.generateViralVideo(config);
    expect(result.viralScore).toBeGreaterThanOrEqual(80);
    expect(result.viralScore).toBeLessThanOrEqual(100);
  });
});
```

```bash
# Run and iterate until passing:
npx ts-node test-omega-complete.ts
# If failing: Read error, identify engine causing failure, fix configuration, re-run
```

### Level 3: Production Integration Test

```bash
# Test the complete workflow end-to-end
npx ts-node generate-omega-videos.ts viral-guaranteed

# Expected:
# ✅ Video generated: generated/omega/viral-guaranteed-20250928.mp4
# 📊 Viral Score: 87/100
# 💰 Total Cost: $43.50
# ⏱️ Processing Time: 23min 15sec
# 🔧 Engines Used: VEO3Service, SkinRealismEngine, CharacterConsistencyEngine, [+9 more]

# If error: Check logs and engine health status
npx ts-node -e "console.log(await OmegaWorkflow.getInstance().getEngineHealthStatus())"
```

## Final Validation Checklist

- [ ] All tests pass: `npx ts-node test-omega-complete.ts`
- [ ] No compilation errors: `npm run typecheck`
- [ ] No linting errors: `npm run lint`
- [ ] Smoke test successful: All 12 engines initialize and respond
- [ ] Integration test successful: Generate video using all engines
- [ ] Quality gates passed: Viral score >= 80, character consistency >= 95%
- [ ] Performance targets met: < 30 minutes, < $50 cost
- [ ] Error cases handled: Engine failures degrade gracefully
- [ ] Documentation updated: Usage examples and configuration options

---

## Anti-Patterns to Avoid

- ❌ Don't call static methods as instance methods (causes 18 compilation errors)
- ❌ Don't access private methods directly (create public wrappers instead)
- ❌ Don't use ZHO techniques on already realistic content (makes them artificial)
- ❌ Don't use Vertex AI authentication for NanoBanana (use Gemini Developer API)
- ❌ Don't use ALL CAPS in VEO3 dialogue (causes letter-by-letter spelling)
- ❌ Don't skip character consistency setup (foundation for all other engines)
- ❌ Don't ignore cost tracking (prevents budget overruns)
- ❌ Don't skip environment validation (prevents runtime failures)
- ❌ Don't hardcode technique selections (use intelligent selection algorithms)
- ❌ Don't combine incompatible engines without proper orchestration

## Confidence Score: 9.5/10

**Justification**: Comprehensive research completed with 5 specialized subagents analyzing codebase patterns, engine architectures, external best practices, and validation approaches. All 29 compilation errors identified with specific fixes. Working integration examples documented. This PRP provides complete context for one-pass implementation success.

**Risk Mitigation**: Extensive test validation patterns ensure issues are caught early. Proven engine integration examples provide reliable patterns to follow. Complete API documentation and authentication fixes address historical blocking issues.