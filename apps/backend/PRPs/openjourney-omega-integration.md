name: "OpenJourney-Omega Integration PRP"
description: |
  Comprehensive PRP for integrating the existing Omega Workflow system with the OpenJourney UI platform,
  creating a professional video generation interface without modifying the working Omega system.

---

## Goal

**Feature Goal:** Create a professional web UI platform by forking OpenJourney and integrating it with the existing Omega Workflow system to provide a beautiful, user-friendly interface for ultra-realistic viral video generation.

**Deliverable:** A fully functional Next.js 15 web application that bridges the OpenJourney UI with the Omega Workflow system, providing:
- Character selection (Aria, Bianca, Custom)
- Preset-based generation (VIRAL_GUARANTEED, PROFESSIONAL_GRADE, etc.)
- Real-time progress tracking for 15-30 minute generations
- Professional video output management
- Cost tracking and viral score prediction

**Success Definition:** User can generate videos through the web interface with the same quality and features as the existing Omega Workflow, while maintaining system stability and not modifying the working viral system.

## Why

- **Business value**: Professional web interface increases accessibility and user adoption
- **User impact**: Eliminates command-line complexity, enables non-technical users
- **Integration value**: Leverages existing OpenJourney UI architecture with proven Omega engines
- **Cost efficiency**: Fork existing solution instead of building from scratch
- **Time savings**: Reduces development time from months to weeks

## What

**User-visible behavior:**
- Beautiful MidJourney-style web interface for video generation
- Character customization with visual previews
- Real-time progress tracking with WebSocket updates
- Generated video gallery with download capabilities
- Cost tracking and viral score predictions
- Queue management for multiple generations

**Technical requirements:**
- Next.js 15 with TypeScript integration
- Bridge to existing Omega Workflow without modification
- Subprocess management with proper error handling
- WebSocket integration for real-time updates
- File handling for generated videos
- Environment configuration with $1,300 Google credits

### Success Criteria
- [ ] OpenJourney UI successfully forked and operational
- [ ] Omega Workflow integration bridge functional
- [ ] Character selection (Aria, Bianca, Custom) working
- [ ] All 4 presets generating videos successfully
- [ ] Real-time progress tracking operational
- [ ] Generated videos displayable in UI
- [ ] Cost tracking accurate with Google credits
- [ ] Error handling graceful for all failure modes
- [ ] System handles 15-30 minute generation times
- [ ] No modifications to existing viral repo

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- docfile: PRPs/planning/openjourney-analysis.md
  why: Complete OpenJourney architecture patterns, component structure, API routes, integration points

- docfile: PRPs/planning/omega-workflow-analysis.md
  why: Omega Workflow integration surface, parameter patterns, entry points, 12 engines architecture

- docfile: PRPs/ai_docs/nextjs-15-api-patterns.md
  why: Long-running API route patterns, streaming responses, error handling, subprocess management

- docfile: PRPs/ai_docs/typescript-subprocess-patterns.md
  why: Production-ready TypeScript subprocess bridge patterns, process management, security considerations

- docfile: PRPs/ai_docs/veo3-integration-patterns.md
  why: VEO3 API integration patterns, error handling, polling mechanisms, alternative services

- file: E:\v2 repo\omega-platform\src\app\api\generate-videos\route.ts
  why: Existing VEO3 integration pattern to mirror for consistency

- file: E:\v2 repo\omega-platform\src\components\content-grid.tsx
  why: Component state management patterns and UI update mechanisms

- file: E:\v2 repo\viral\generate-omega-videos.ts
  why: Primary integration entry point, parameter structure, preset system

- file: E:\v2 repo\viral\src\omega-workflow\omega-config.ts
  why: Preset configurations, cost structures, quality settings
```

### Current Codebase Tree
```bash
E:\v2 repo\omega-platform\
├── src\
│   ├── app\
│   │   ├── api\
│   │   │   ├── generate-images\route.ts    # Imagen 4 integration (replace with NanoBanana)
│   │   │   ├── generate-videos\route.ts    # VEO3 integration (enhance with Omega)
│   │   │   └── image-to-video\route.ts     # Image-to-video conversion
│   │   ├── layout.tsx                      # Root layout with providers
│   │   └── page.tsx                        # Main page component
│   ├── components\
│   │   ├── ui\                            # shadcn/ui components
│   │   ├── content-grid.tsx               # Main content management
│   │   ├── prompt-bar.tsx                 # Input interface
│   │   └── settings-dropdown.tsx          # Configuration UI
│   └── lib\
│       └── utils.ts                       # Utility functions
├── package.json                           # Dependencies (Next.js 15, React 19)
└── README.md

E:\v2 repo\viral\                          # EXISTING OMEGA SYSTEM (DO NOT MODIFY)
├── generate-omega-videos.ts               # Primary entry point
├── src\omega-workflow\                    # 12 engines system
├── src\characters\                        # Character definitions
└── test-omega-complete.ts                 # Validation system
```

### Desired Codebase Tree with New Files
```bash
E:\v2 repo\omega-platform\
├── src\
│   ├── app\
│   │   ├── api\
│   │   │   ├── generate-omega\route.ts         # NEW: Omega Workflow bridge
│   │   │   ├── omega-status\route.ts           # NEW: Progress tracking
│   │   │   ├── omega-presets\route.ts          # NEW: Preset configuration
│   │   │   └── omega-characters\route.ts       # NEW: Character management
│   │   └── omega\page.tsx                      # NEW: Omega mode UI
│   ├── components\
│   │   ├── omega\
│   │   │   ├── character-selector.tsx          # NEW: Character selection UI
│   │   │   ├── preset-dropdown.tsx             # NEW: Preset selection
│   │   │   ├── progress-tracker.tsx            # NEW: Real-time progress
│   │   │   ├── omega-grid.tsx                  # NEW: Omega content display
│   │   │   └── metrics-display.tsx             # NEW: Cost/viral score display
│   │   └── mode-toggle.tsx                     # NEW: Switch between VEO3/Omega
│   └── lib\
│       ├── omega-bridge.ts                     # NEW: Subprocess bridge logic
│       ├── omega-types.ts                      # NEW: TypeScript interfaces
│       └── websocket-manager.ts                # NEW: Real-time updates
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Omega Workflow requires specific environment setup
// Must set GEMINI_API_KEY in subprocess environment
// Working directory must be E:\v2 repo\viral for imports to work

// CRITICAL: Next.js 15 API routes timeout after 60 seconds by default
// Omega generations take 15-30 minutes - need streaming/polling pattern
// Use Server-Sent Events or WebSocket for progress updates

// CRITICAL: OpenJourney uses @google/genai v1.10.0
// Omega system uses @google/generative-ai - compatible but different exports
// Must maintain environment variable compatibility

// CRITICAL: Child process cleanup essential
// Omega processes must be cleaned up on browser close/navigation
// Use AbortController and cleanup handlers

// GOTCHA: File paths in generated videos are absolute
// Must convert to relative/served URLs for web display
// Generated files in E:\v2 repo\viral\generated\ need serving

// GOTCHA: OpenJourney expects base64 encoded images immediately
// Omega system generates file paths - need conversion layer
// Must handle video streaming vs immediate display
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core interfaces for Omega integration
interface OmegaRequest {
  character: 'Aria' | 'Bianca' | 'Sofia' | 'Custom';
  prompt: string;
  preset: 'VIRAL_GUARANTEED' | 'PROFESSIONAL_GRADE' | 'SPEED_OPTIMIZED' | 'COST_EFFICIENT';
  platform: 'tiktok' | 'youtube' | 'instagram' | 'cross-platform';
  customCharacter?: {
    age: number;
    gender: string;
    ethnicity: string;
    profession: string;
    description: string;
  };
}

interface OmegaResponse {
  success: boolean;
  jobId: string;
  estimatedTime: number;
  estimatedCost: number;
  videoPath?: string;
  metrics?: {
    viralScore: number;
    totalCost: number;
    generationTime: number;
    engineUtilization: number;
  };
  error?: string;
}

interface ProgressUpdate {
  jobId: string;
  phase: 'character-generation' | 'video-creation' | 'processing' | 'complete';
  progress: number;
  message: string;
  currentStep: string;
}
```

### List of Tasks to be Completed

```yaml
Task 1 - Environment Setup and Validation:
VERIFY E:\v2 repo\omega-platform setup:
  - CONFIRM OpenJourney cloned and dependencies installed
  - VALIDATE existing VEO3 API route functionality
  - TEST with user's $1,300 Google credits
  - PRESERVE all existing functionality

Task 2 - Create Omega Bridge Infrastructure:
CREATE src/lib/omega-bridge.ts:
  - IMPLEMENT subprocess management with proper cleanup
  - MIRROR pattern from PRPs/ai_docs/typescript-subprocess-patterns.md
  - ADD environment variable passing for GEMINI_API_KEY
  - INCLUDE timeout handling for 35-minute max duration

CREATE src/lib/omega-types.ts:
  - DEFINE all TypeScript interfaces for Omega integration
  - MIRROR existing OpenJourney response patterns
  - ENSURE compatibility with existing UI components

Task 3 - Create Core API Routes:
CREATE src/app/api/generate-omega/route.ts:
  - IMPLEMENT main generation endpoint
  - MIRROR structure from existing generate-videos route
  - ADD job queue management for long-running operations
  - INCLUDE comprehensive error handling

CREATE src/app/api/omega-status/route.ts:
  - IMPLEMENT progress tracking endpoint
  - ADD WebSocket upgrade capability for real-time updates
  - MIRROR polling pattern from existing VEO3 implementation

Task 4 - Create Omega UI Components:
CREATE src/components/omega/character-selector.tsx:
  - IMPLEMENT character selection UI (Aria, Bianca, Custom)
  - MIRROR existing UI patterns from OpenJourney components
  - ADD custom character creation form

CREATE src/components/omega/preset-dropdown.tsx:
  - IMPLEMENT preset selection with cost/time estimates
  - DISPLAY viral score targets and generation parameters
  - ADD tooltip explanations for each preset

CREATE src/components/omega/progress-tracker.tsx:
  - IMPLEMENT real-time progress display
  - ADD WebSocket connection management
  - MIRROR existing loading patterns

Task 5 - Integrate Omega Mode into Main UI:
MODIFY src/components/content-grid.tsx:
  - ADD Omega generation option alongside existing VEO3
  - PRESERVE all existing functionality
  - IMPLEMENT mode switching between Standard/Omega

MODIFY src/components/prompt-bar.tsx:
  - ADD Omega-specific controls (character, preset)
  - MAINTAIN existing prompt input functionality
  - IMPLEMENT conditional UI based on selected mode

Task 6 - File Serving and Video Management:
CREATE src/app/api/serve-video/route.ts:
  - IMPLEMENT video file serving from Omega output directory
  - ADD security validation for file paths
  - ENSURE proper MIME types and streaming

MODIFY src/components/content-grid.tsx:
  - ADD video display for Omega-generated content
  - IMPLEMENT download functionality
  - ADD metrics display (viral score, cost, time)

Task 7 - WebSocket Integration for Real-time Updates:
CREATE src/lib/websocket-manager.ts:
  - IMPLEMENT WebSocket server for progress updates
  - ADD client connection management
  - ENSURE proper cleanup on disconnect

MODIFY relevant components:
  - INTEGRATE WebSocket updates for progress tracking
  - ADD connection status indicators
  - IMPLEMENT retry logic for connection failures

Task 8 - Error Handling and User Experience:
IMPLEMENT comprehensive error handling:
  - ADD user-friendly error messages
  - IMPLEMENT retry mechanisms for transient failures
  - ADD graceful degradation for service unavailability
  - ENSURE proper cleanup on errors

Task 9 - Testing and Validation:
CREATE comprehensive test suite:
  - UNIT tests for bridge functionality
  - INTEGRATION tests for API routes
  - E2E tests for complete generation workflow
  - LOAD tests for concurrent generations

Task 10 - Documentation and Deployment:
UPDATE documentation:
  - API documentation for new endpoints
  - User guide for Omega features
  - Deployment instructions
  - Troubleshooting guide
```

### Per Task Pseudocode

```typescript
// Task 2: Omega Bridge Implementation
class OmegaBridge {
  private activeJobs = new Map<string, ChildProcess>();

  async generateVideo(request: OmegaRequest): Promise<OmegaResponse> {
    // PATTERN: Validate input first (see existing routes)
    const validated = this.validateRequest(request);

    // CRITICAL: Set working directory to viral repo
    const workingDir = 'E:\\v2 repo\\viral';

    // PATTERN: Create unique job ID for tracking
    const jobId = `omega-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // GOTCHA: Must pass environment variables to subprocess
    const env = {
      ...process.env,
      GEMINI_API_KEY: userApiKey || process.env.GEMINI_API_KEY,
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      GCP_LOCATION: process.env.GCP_LOCATION
    };

    // CRITICAL: Use spawn with proper error handling
    const child = spawn('npx', ['tsx', 'generate-omega-videos.ts'], {
      cwd: workingDir,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // PATTERN: Store process for cleanup
    this.activeJobs.set(jobId, child);

    // CRITICAL: Set timeout for max 35 minutes
    const timeout = setTimeout(() => {
      this.cleanup(jobId);
    }, 35 * 60 * 1000);

    return { success: true, jobId, estimatedTime: 25, estimatedCost: 45 };
  }
}

// Task 5: UI Integration Pattern
function ContentGrid({ onNewGeneration }: Props) {
  const [mode, setMode] = useState<'standard' | 'omega'>('standard');

  const handleGenerate = async (type: string, prompt: string) => {
    if (mode === 'omega') {
      // PATTERN: Use existing loading states
      setLoading(true);

      // CRITICAL: Call Omega API with proper error handling
      try {
        const response = await fetch('/api/generate-omega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            character: selectedCharacter,
            preset: selectedPreset
          })
        });

        const result = await response.json();

        // PATTERN: Start progress tracking
        if (result.success) {
          startProgressTracking(result.jobId);
        }
      } catch (error) {
        // PATTERN: User-friendly error handling
        setError('Failed to start generation. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // PRESERVE: Existing VEO3 functionality unchanged
      return existingGenerateHandler(type, prompt);
    }
  };
}
```

### Integration Points
```yaml
ENVIRONMENT:
  - verify: GEMINI_API_KEY available for subprocess
  - add: OMEGA_OUTPUT_DIR for file serving
  - configure: WebSocket port for real-time updates

API_ROUTES:
  - add to: src/app/api/ directory
  - pattern: Mirror existing route structure
  - ensure: Proper error response format consistency

COMPONENTS:
  - integrate: New Omega components with existing UI
  - preserve: All existing OpenJourney functionality
  - pattern: Follow existing component patterns

FILE_SERVING:
  - serve from: E:\v2 repo\viral\generated\
  - security: Validate file paths and access
  - format: Support video streaming and downloads
```

## Validation Loop

### Level 1: Environment & Setup
```bash
# Verify OpenJourney setup
cd "E:\v2 repo\omega-platform"
npm run build                    # Should build without errors
npm run dev                      # Should start on localhost:3000

# Test existing VEO3 functionality
curl -X POST http://localhost:3000/api/generate-videos \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test video", "apiKey": "'$GEMINI_API_KEY'"}'

# Expected: Should return operation in progress or success
```

### Level 2: Bridge Integration Tests
```bash
# Test Omega bridge connection
curl -X POST http://localhost:3000/api/generate-omega \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "character": "Aria", "preset": "COST_EFFICIENT"}'

# Expected: {"success": true, "jobId": "omega-...", "estimatedTime": 20}

# Test progress tracking
curl http://localhost:3000/api/omega-status/jobId

# Expected: Progress updates with phase and percentage
```

### Level 3: Full Integration Test
```bash
# Start the application
npm run dev

# Open browser to http://localhost:3000
# Test complete workflow:
# 1. Select Omega mode
# 2. Choose character (Aria)
# 3. Select preset (COST_EFFICIENT)
# 4. Enter prompt
# 5. Generate video
# 6. Monitor progress
# 7. View completed video

# Expected: Complete workflow without errors, video generation successful
```

### Level 4: Error Handling Tests
```bash
# Test invalid API key
curl -X POST http://localhost:3000/api/generate-omega \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "apiKey": "invalid"}'

# Expected: {"error": "Invalid API key"}

# Test process cleanup on timeout
# Start generation, then close browser/cancel request
# Expected: Child processes should be cleaned up
```

## Final Validation Checklist
- [ ] All existing OpenJourney functionality preserved
- [ ] Omega bridge generates videos successfully
- [ ] Real-time progress tracking operational
- [ ] Character selection (Aria, Bianca, Custom) working
- [ ] All 4 presets generating different quality/cost videos
- [ ] Generated videos displayable in UI with download
- [ ] Cost tracking accurate with Google credits
- [ ] Error handling graceful for all failure modes
- [ ] WebSocket connections properly managed and cleaned up
- [ ] Child processes properly cleaned up on all exit conditions
- [ ] No modifications made to E:\v2 repo\viral\ directory
- [ ] File serving secure with proper validation
- [ ] UI responsive and follows existing design patterns

---

## Anti-Patterns to Avoid
- ❌ Don't modify the existing Omega Workflow system in any way
- ❌ Don't assume child processes will clean themselves up
- ❌ Don't use synchronous operations for long-running tasks
- ❌ Don't hardcode file paths - use configurable paths
- ❌ Don't ignore WebSocket connection management
- ❌ Don't skip input validation for security
- ❌ Don't forget to handle browser navigation/close events
- ❌ Don't break existing OpenJourney functionality
- ❌ Don't use different error response formats than existing routes
- ❌ Don't skip process timeout handling for runaway jobs

## Confidence Score: 9/10

**Rationale:** This PRP provides comprehensive context including:
- Complete architecture analysis of both systems
- Detailed integration patterns and examples
- Production-ready code patterns from research
- Specific file references and existing patterns to follow
- Comprehensive validation loop with executable tests
- Clear separation between existing and new functionality

The high confidence is based on leveraging existing working systems (OpenJourney UI + Omega Workflow) with well-documented bridge patterns, comprehensive error handling, and thorough validation procedures.

**Sign off as SmokeDev 🚬**