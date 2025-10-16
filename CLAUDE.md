# CLAUDE.md - SmokeTech Platform Monorepo

## 🎯 PROJECT OVERVIEW

**SmokeTech Platform** is a unified monorepo containing the complete AI-powered video generation system with professional UI and backend engine.

### What This Is:
- **Monorepo**: Single repository containing frontend UI + backend AI engine + shared configuration
- **Purpose**: Professional AI video generation platform with Google VEO3, Sora2, and NanoBanana integration
- **Architecture**: Turborepo + npm workspaces for efficient development and builds

### Repository Contents:
- **apps/frontend** (omega-platform): Next.js 15 professional UI with visual workflow builder
- **apps/backend** (viral): Temporal-based AI video generation engine with VEO3 + Sora2
- **packages/shared-config**: Character presets and shot type configurations

---

## 🏗️ MONOREPO ARCHITECTURE

### Directory Structure:
```
smoketech-platform/
├── apps/
│   ├── backend/           # Viral AI Content System (formerly "viral" repo)
│   │   ├── src/
│   │   │   ├── services/       # VEO3, Sora2, NanoBanana services
│   │   │   ├── pipelines/      # Video generation pipelines
│   │   │   ├── characters/     # Character definitions (Aria, Marcus, etc.)
│   │   │   ├── temporal/       # Temporal workflows and activities
│   │   │   └── comfyui/        # ComfyUI workflow engine
│   │   └── package.json        # "viral-ai-content-system"
│   │
│   └── frontend/          # Omega Platform UI (formerly "omega-platform" repo)
│       ├── src/
│       │   ├── app/            # Next.js 15 app router
│       │   │   ├── api/        # API routes (generate-videos, etc.)
│       │   │   └── components/ # React components
│       │   └── lib/            # Utility functions
│       └── package.json        # "openjourney-app"
│
├── packages/
│   └── shared-config/     # Shared Character Presets & Shot Types
│       ├── src/
│       │   ├── config/
│       │   │   ├── character-presets.json  # 6 character presets
│       │   │   └── shot-types-config.json  # 4 shot type configs
│       │   └── index.ts        # TypeScript exports
│       └── package.json        # "@smoketech/shared-config"
│
├── package.json           # Root workspace config
├── turbo.json            # Turborepo build pipeline
├── CLAUDE.md             # This file
└── README.md             # User documentation
```

---

## 🚀 QUICK START

### Prerequisites:
- Node.js 18+ (specified in package.json engines)
- npm 8+
- FFmpeg (for video processing)
- Temporal CLI (local .exe in backend/)
- Google Cloud credentials (vertex-ai-key.json files - NOT committed)

### Installation:
```bash
# Navigate to monorepo root
cd "E:\v2 repo\smoketech-platform"

# Install all dependencies (backend + frontend + shared-config)
npm install

# Build all packages
npm run build
```

### Development:
```bash
# Start EVERYTHING with one command!
npm run dev

# This automatically starts:
# - Temporal Server (http://localhost:8233)
# - Temporal Worker (backend services)
# - Frontend UI (http://localhost:7777)

# All processes run in one terminal with color-coded output:
# - Temporal Server: Blue
# - Worker: Green
# - Frontend: Yellow
```

### Common Commands:
```bash
npm run build          # Build all apps and packages
npm run dev            # Start all apps in dev mode (one command!)
npm run dev:frontend   # Start only frontend (for quick UI testing)
npm run dev:backend    # Start only backend worker
npm run test           # Run tests in all apps
npm run lint           # Lint all code
npm run clean          # Clean build artifacts
```

---

## 📦 APPS & PACKAGES DETAILS

### Backend (apps/backend)
**Package Name**: `viral-ai-content-system`
**Port**: N/A (Temporal workflows + API via frontend)
**Tech Stack**: TypeScript, Temporal, Google Vertex AI, FFmpeg

#### Key Features:
- **VEO3 Service**: Google's premier video generation model
  - JSON prompting for 300%+ quality boost
  - Sequential Smart Extend (8s → 56s seamless videos)
  - Advanced cinematography controls

- **Sora2 Service**: OpenAI's Sora2 integration
  - Text-to-video generation
  - Video extension capabilities

- **NanoBanana Service**: Ultra-realistic character generation
  - $0.02 per image (FREE with $1k Google Cloud credits)
  - Character consistency across generations
  - ZHO techniques integration (46 viral patterns)

- **Character System**:
  - Aria QuoteMoto (insurance expert - MAIN CHARACTER)
  - Marcus Professional (business executive)
  - Sophia Influencer
  - Bianca QuoteMoto

- **Temporal Workflows**: Fault-tolerant video generation
  - Orchestrated multi-step pipelines
  - Automatic retry on failures
  - Progress tracking and monitoring

#### Important Files:
- `src/services/veo3Service.ts` - VEO3 video generation
- `src/services/sora2Service.ts` - Sora2 integration
- `src/services/vertexAINanoBanana.ts` - NanoBanana character generation
- `src/services/sequentialPromptGenerator.ts` - Smart prompt splitter for sequential extend
- `src/characters/quotemoto-baddie.ts` - Aria character definition
- `src/pipelines/nanoBananaVeo3Pipeline.ts` - Ultra-realistic video pipeline
- `src/temporal/workflows/` - Temporal workflow definitions

### Frontend (apps/frontend)
**Package Name**: `openjourney-app`
**Port**: 7777
**Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS

#### Key Features:
- **Visual Workflow Builder**: Node-based video generation interface
- **Model Selection**: VEO3 Fast, VEO3 Extended, Sora2, etc.
- **Power Mode vs Simple Mode**:
  - Simple: Quick generation with presets
  - Power: Full control over all parameters
- **Character Showcase**: Browse and select character presets
- **Real-time Progress Tracking**: WebSocket-based updates
- **Video Gallery**: View, playback, and extend generated videos

#### Important Files:
- `src/app/api/generate-videos/route.ts` - Main video generation API
- `src/app/api/generate-omega/route.ts` - Omega workflow integration
- `src/app/components/GenerateVideoDialog.tsx` - Video generation UI
- `src/app/components/CharacterShowcase.tsx` - Character selection
- `src/app/workflow/` - Visual workflow builder components

### Shared Config (packages/shared-config)
**Package Name**: `@smoketech/shared-config`
**Purpose**: Centralized character presets and shot type configurations

#### Presets Included:
**Character Presets** (6):
1. Aria QuoteMoto - Insurance expert influencer
2. Marcus Professional - Business executive
3. Sophia Influencer - Fashion/lifestyle influencer
4. Bianca QuoteMoto - Insurance specialist
5. Pedro Contractor - Construction professional
6. Generic Professional - Customizable professional

**Shot Types** (4):
1. Close-up Portrait
2. Medium Shot
3. Wide Establishing
4. Dynamic Action

#### Usage:
```typescript
// In backend or frontend
import {
  getCharacterPresets,
  getShotTypes,
  getCharacterById
} from '@smoketech/shared-config';

const aria = getCharacterById('aria-quotemoto');
const closeUp = getShotTypes().find(s => s.id === 'close-up-portrait');
```

---

## ⚙️ CONFIGURATION & ENVIRONMENT

### Required Environment Variables:

**Backend (.env in apps/backend):**
```bash
# Google Cloud / Vertex AI
GEMINI_API_KEY=your_gemini_api_key
GCP_PROJECT_ID=your_gcp_project_id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json

# Temporal
TEMPORAL_ADDRESS=localhost:7233

# Database (optional)
DATABASE_URL=mongodb://localhost:27017/viral
REDIS_URL=redis://localhost:6379
```

**Frontend (.env in apps/frontend):**
```bash
# Google Cloud (for frontend API routes)
NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3007
```

### Credential Files (NOT committed):
These must be placed locally but are protected by .gitignore:
- `apps/backend/vertex-ai-key.json` - Google Cloud service account
- `apps/frontend/vertex-ai-key.json` - Google Cloud service account

To get these:
1. Go to Google Cloud Console
2. Create service account with "Vertex AI User" role
3. Download JSON key
4. Place in respective directories

---

## 🔧 BUILD SYSTEM (TURBOREPO)

### How It Works:
Turborepo orchestrates builds, tests, and dev servers across all apps and packages.

### Task Pipeline (turbo.json):
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,           // Don't cache dev mode
      "persistent": true        // Keep running
    },
    "test": {
      "dependsOn": ["build"]    // Build before testing
    }
  }
}
```

### Build Order:
1. **shared-config** builds first (dependency of backend/frontend)
2. **backend** builds (depends on shared-config)
3. **frontend** builds (depends on shared-config)

### Caching:
Turborepo caches build outputs. Subsequent builds only rebuild changed packages.

---

## 🧪 TESTING

### Run All Tests:
```bash
npm run test
```

### Run Backend Tests Only:
```bash
cd apps/backend
npm run test
```

### Run Frontend Tests Only:
```bash
cd apps/frontend
npm run test
```

### Test Coverage:
Backend uses Jest with comprehensive test suites:
- `__tests__/unit/` - Unit tests for services
- `__tests__/integration/` - API integration tests
- `__tests__/e2e/` - End-to-end workflow tests

---

## 🎬 VIDEO GENERATION WORKFLOW

### Standard Flow:
1. **User Input** (Frontend): Select character, shot type, prompt
2. **API Request** (Frontend → Backend): POST to /api/generate-videos
3. **Temporal Workflow** (Backend): Orchestrate generation
4. **Character Image** (Backend): NanoBanana generates ultra-realistic character
5. **Video Generation** (Backend): VEO3 or Sora2 creates video from image + prompt
6. **Post-Processing** (Backend): FFmpeg processing, logo overlay (optional)
7. **Response** (Backend → Frontend): Return video URL
8. **Display** (Frontend): Show video in gallery with playback controls

### Sequential Smart Extend Flow:
1. Generate 8s base video
2. Split master prompt into segment-specific prompts
3. Generate 7 sequential 8s extensions
4. Stitch all segments into seamless 56s video
5. Result: Smooth 56-second video with narrative continuity

---

## 💰 COST OPTIMIZATION

### Using $1,000 Google Cloud Credits:
- **NanoBanana**: $0.02/image = 50,000 images FREE
- **VEO3**: ~$42/video (56s) = ~23 videos FREE
- **Gemini Flash**: Prompt enhancement = negligible cost

### Cost per Video (56s):
- NanoBanana (3 images): $0.06
- VEO3 (7x8s segments): $42.00
- Processing (FFmpeg): $2.50
- **Total**: ~$44.56 per 56-second video

### Free Tier Strategy:
1. Generate character library with NanoBanana (cheap)
2. Reuse character images for multiple videos (save cost)
3. Use VEO3 Fast for quicker/cheaper results when quality not critical
4. Batch generation to maximize credit usage

---

## 🎨 CHARACTER CONSISTENCY SYSTEM

### How It Works:
1. **Base Character Definition** (TypeScript class):
   - Core features (face shape, eyes, nose, lips, etc.)
   - Distinctive marks (moles, freckles, asymmetry)
   - Personality traits (default expression, energy level)

2. **Consistency Anchors**:
   - Identity preservation markers
   - Feature constraints
   - Proportion guidelines

3. **Multi-Angle Generation**:
   - Frontal, 3/4, profile, slight-turn
   - Cross-angle validation
   - Same person recognizable from all angles

### Character Files:
- `apps/backend/src/characters/quotemoto-baddie.ts` - Aria (MAIN)
- `apps/backend/src/characters/marcus-professional.ts` - Marcus
- `apps/backend/src/characters/sophia-influencer.ts` - Sophia
- `apps/backend/src/characters/bianca-quotemoto.ts` - Bianca

### Using Shared Presets:
```typescript
import { getCharacterById } from '@smoketech/shared-config';

// Get preset configuration
const ariaPreset = getCharacterById('aria-quotemoto');

// Use in backend character system
const aria = new QuoteMotoCharacter(ariaPreset);
```

---

## 🚨 QUOTEMOTO CONTENT STANDARDS

**CRITICAL:** ALL video tests generate production-ready content for quotemoto.com.

### Brand Identity:
- **Business:** California auto insurance comparison marketplace
- **Value Proposition:** Compare 30+ insurers, save $427-$500/year in 5 minutes
- **Specialties:** SR-22, high-risk drivers, DUI insurance
- **Website:** quotemoto.com
- **Phone:** 760-420-9174
- **Rating:** 4.9/5 stars, A+ BBB

### Content Guidelines:
- **8s Videos:** Hook + Benefit + CTA
- **16s Videos:** Problem + Solution + CTA
- **56s Videos (7x8s):** Hook + Problem + 3 Benefits + Social Proof + CTA

### Forbidden:
- Generic insurance talk without QuoteMoto branding
- Competitor mentions
- Misleading claims
- Videos without clear QuoteMoto association

---

## 📚 DOCUMENTATION LOCATIONS

### Monorepo Root:
- `README.md` - User-facing guide for getting started
- `CLAUDE.md` - This file (AI context)

### Backend Documentation:
- `apps/backend/CLAUDE.md` - Backend-specific AI context
- `apps/backend/COMFYUI_TEMPORAL_GUIDE.md` - ComfyUI + Temporal integration
- `apps/backend/SEQUENTIAL_EXTEND_PROMPTING_GUIDE.md` - Sequential extend system
- `apps/backend/VEO3_SYSTEM_COMPLETE.md` - VEO3 mastery guide
- `apps/backend/VERTEX-AI-NANO-BANANA-COMPLETE-GUIDE.md` - NanoBanana guide
- `apps/backend/TEMPORAL_FAULT_TOLERANCE.md` - Fault tolerance patterns
- `apps/backend/zho-nano-research/README.md` - 46 ZHO viral techniques

### Frontend Documentation:
- `apps/frontend/README.md` - Frontend development guide

---

## 🔄 DEVELOPMENT WORKFLOW

### Starting Local Development:

**Terminal 1 - Temporal Server:**
```bash
cd "E:\v2 repo\smoketech-platform\apps\backend"
./temporal.exe server start-dev
# Access UI: http://localhost:8233
```

**Terminal 2 - Backend Worker:**
```bash
cd "E:\v2 repo\smoketech-platform\apps\backend"
npm run worker
# Executes Temporal workflows
```

**Terminal 3 - Frontend:**
```bash
cd "E:\v2 repo\smoketech-platform"
npm run dev
# Frontend: http://localhost:7777
```

**Terminal 4 - Omega Service (if needed):**
```bash
cd "E:\v2 repo\omega-platform"  # Original repo if still needed
node omega-service.js
# Bridge service: http://localhost:3007
```

### Making Changes:

**To add a new character preset:**
1. Edit `packages/shared-config/src/config/character-presets.json`
2. Rebuild: `npm run build` (or `turbo run build --filter=@smoketech/shared-config`)
3. Backend and frontend automatically get updated presets

**To modify VEO3 service:**
1. Edit `apps/backend/src/services/veo3Service.ts`
2. Backend hot-reloads (if using `npm run dev`)

**To update frontend UI:**
1. Edit components in `apps/frontend/src/app/components/`
2. Next.js hot-reloads automatically

---

## 🐛 TROUBLESHOOTING

### Build Errors:

**"Cannot find module '@smoketech/shared-config'"**
- Solution: `npm run build` from root (or rebuild shared-config)

**"Turbo command not found"**
- Solution: `npm install` from root to install Turborepo

**Backend TypeScript errors**
- Note: ~120 pre-existing errors (not monorepo-related)
- Solution: Use `"skipLibCheck": true` in tsconfig or fix individually

### Runtime Errors:

**"vertex-ai-key.json not found"**
- Solution: Place credential files in apps/backend/ and apps/frontend/
- These are protected by .gitignore

**"Temporal server connection failed"**
- Solution: Start Temporal server first (see Terminal 1 above)

**Frontend can't reach backend**
- Check if omega-service.js bridge is running on port 3007
- Verify NEXT_PUBLIC_API_URL in frontend .env

### Git/GitHub Issues:

**"Push declined due to repository rule violations"**
- Cause: Attempting to commit credential files
- Solution: Files are already in .gitignore, don't bypass it

---

## 🔐 SECURITY BEST PRACTICES

### Credential Management:
1. **NEVER commit** vertex-ai-key.json or any *-credentials.json files
2. **Always use** environment variables for API keys
3. **Protected patterns** in .gitignore:
   - `**/vertex-ai-key.json`
   - `**/service-account*.json`
   - `**/*-credentials.json`
   - `**/*-key.json`

### Environment Variables:
- Use `.env.local` for local overrides (not committed)
- Use `.env.example` to document required variables
- Never hardcode secrets in source code

---

## 📊 MONITORING & OBSERVABILITY

### Temporal UI:
- URL: http://localhost:8233
- View workflow executions
- Track task status and retries
- Debug failures

### Langfuse (Optional):
```bash
cd apps/backend
docker-compose -f docker-compose.langfuse.yml up -d
# Access at http://localhost:3000
```

### Logging:
- Temporal workflows: Structured logging in `src/temporal/monitoring/logger.ts`
- Error aggregation: `src/temporal/monitoring/errorAggregator.ts`
- Metrics: `src/temporal/monitoring/metrics.ts`

---

## 🚢 DEPLOYMENT CONSIDERATIONS

### Production Build:
```bash
npm run build
```
Builds all apps with production optimizations.

### Environment Setup:
1. Set production environment variables
2. Ensure Google Cloud credentials are available
3. Configure Temporal server (cloud or self-hosted)

### Scaling:
- **Frontend**: Deploy to Vercel/Netlify (Next.js)
- **Backend**: Deploy Temporal workers to cloud (AWS/GCP)
- **Temporal Server**: Use Temporal Cloud or self-hosted cluster

---

## 🎯 PROJECT GOALS & ROADMAP

### Current State:
✅ Monorepo migration complete
✅ Backend AI engine fully functional
✅ Frontend UI with visual workflow builder
✅ Character consistency system
✅ Sequential Smart Extend (8s → 56s)
✅ Google Cloud $1k credits integration

### Future Enhancements:
- [ ] Fix remaining backend TypeScript errors
- [ ] Optimize build times with Turborepo remote caching
- [ ] Add comprehensive E2E tests
- [ ] Implement user authentication
- [ ] Add database for video history
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Deploy to production

---

## 📞 IMPORTANT CONTACTS & RESOURCES

### Documentation:
- Temporal Docs: https://docs.temporal.io
- Next.js 15 Docs: https://nextjs.org/docs
- Turborepo Docs: https://turbo.build/repo/docs
- Google Vertex AI: https://cloud.google.com/vertex-ai/docs

### Support:
- GitHub Issues: https://github.com/SmokeAlot420/smoketech-platform/issues
- Temporal Community: https://community.temporal.io

---

## 🚬 DEVELOPMENT PHILOSOPHY

### Code Standards:
- **TypeScript strict mode** for type safety
- **Modular architecture** for maintainability
- **Shared configuration** to eliminate duplication
- **Fault tolerance** via Temporal workflows

### Commit Standards:
- Use conventional commits: `feat:`, `fix:`, `refactor:`, etc.
- Sign commits as "SmokeDev 🚬"
- Keep commits focused and atomic

### Testing Standards:
- Unit tests for business logic
- Integration tests for API routes
- E2E tests for critical workflows
- 80%+ code coverage goal

---

**Last Updated:** 2025-01-16
**Monorepo Version:** 1.0.0
**Maintained By:** SmokeDev 🚬
