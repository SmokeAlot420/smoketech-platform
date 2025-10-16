# CLAUDE.md - SmokeTech Studio

This file provides guidance to Claude Code when working with the SmokeTech Studio frontend platform.

## Project Overview

SmokeTech Studio is the professional frontend UI for AI content generation, featuring modular model selection and seamless integration with the Omega Workflow viral engine. Built with Next.js 15 and designed for scalability, it provides users with an intuitive interface to generate high-quality images and videos using multiple AI models.

## 🏗 Architecture

### Dual Repository Strategy
- **SmokeTech Studio** (this repo): Frontend UI platform with model selector and Omega integration
- **Viral Engine** (E:\v2 repo\viral): Core AI generation pipeline with ultra-realistic video capabilities
- **Communication**: HTTP microservices via omega-service.js on port 3007

### Key Design Principles
- **Modular Model Selection**: Users can choose between Imagen 3, Imagen 4, and NanoBanana
- **Microservices Architecture**: Clean separation between UI and processing
- **Professional Branding**: SmokeTech Studio identity with optimized logo and styling
- **Cost Transparency**: Real-time cost estimation for different models

## 🎯 Critical Files & Components

### Core Application Structure
```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── generate-images/    # Imagen 3/4 generation
│   │   ├── generate-nanobana/  # NanoBanana (forwarded to Omega)
│   │   └── generate-omega/     # Full Omega workflow
│   ├── layout.tsx              # SmokeTech Studio branding
│   └── page.tsx                # Main application page
├── components/
│   ├── prompt-bar.tsx          # Main input with SmokeTech logo
│   ├── model-selector.tsx      # Modular AI model selector
│   └── content-grid.tsx        # Generation display and management
└── lib/
    ├── model-types.ts          # Model configurations and types
    ├── omega-bridge.ts         # Omega service communication
    └── omega-types.ts          # Type definitions for Omega integration
```

### Essential Components

#### 1. Model Selector (`src/components/model-selector.tsx`)
**Purpose**: Dropdown interface for choosing AI models
**Models Supported**:
- **Imagen 3**: $0.08/image, production quality
- **Imagen 4**: $0.08/image, latest generation
- **NanoBanana**: $0.02/image, rapid generation via Gemini 2.5 Flash

**Key Features**:
- Cost estimation display
- Model descriptions and capabilities
- Real-time availability status
- Persistent selection via localStorage

#### 2. Omega Bridge (`src/lib/omega-bridge.ts`)
**Purpose**: Communication layer with viral engine
**Endpoints**:
- `/api/generate-nanobana` → Forwards to omega-service.js
- `/api/generate-omega` → Full viral workflow integration
- `/api/omega-status` → Real-time status tracking

#### 3. Prompt Bar (`src/components/prompt-bar.tsx`)
**Purpose**: Main input interface with SmokeTech branding
**Key Elements**:
- SmokeTech logo (responsive: hidden < 640px, visible 640px+)
- Model selector integration
- Character settings panel toggle
- Mobile/desktop layout variants (sm:hidden patterns)

## 🎨 Branding & UI Guidelines

### SmokeTech Studio Identity
- **Logo**: `/public/SmokeTech Logo-min.png` (180×180px PNG)
- **Colors**: `from-green-600 to-green-700` gradient
- **Responsive**: Logo hidden on mobile (< 640px), visible desktop (640px+)
- **Layout**: Title scales `text-2xl sm:text-4xl lg:text-5xl`

### Critical Design Patterns
1. **Responsive Logo**: Hidden on mobile, h-24 on desktop with text overlay
2. **Flexible Layout**: `flex-col` mobile, `sm:flex-row` desktop
3. **Baseline Alignment**: `items-baseline` for input field positioning
4. **Green Gradient**: Professional tone with darker green shades

## 🔧 Development Workflow

### Local Development Setup
```bash
# Terminal 1: Main application
cd "E:\v2 repo\omega-platform"
npm run dev  # Runs on http://localhost:7777

# Terminal 2: Omega service
node omega-service.js  # Runs on http://localhost:3007
```

### Environment Configuration
```env
# .env (required)
GEMINI_API_KEY=your_google_ai_api_key_here
```

### Model Integration Flow
1. **User selects model** in ModelSelector dropdown
2. **Input prompt** in PromptBar
3. **API routing**:
   - Imagen 3/4 → `/api/generate-images`
   - NanoBanana → `/api/generate-nanobana` → omega-service.js
   - Full workflow → `/api/generate-omega` → viral engine
4. **Real-time status** tracking and display

## 🎭 Character Library - Real Data Integration

**IMPORTANT**: No mock data. All character data is real, sourced from viral engine.

### Data Flow
1. **Character Presets**: `E:\v2 repo\viral\config\character-presets.json`
2. **API Route**: `src/app/api/character-library/presets/route.ts` reads directly from viral repo
3. **Generated Images**: Saved to `omega-platform/public/character-library/{timestamp}/`
4. **Display**: ResultsGallery.tsx serves from `/character-library/{timestamp}/{image}`

### Key Configuration
**Viral engine output path** (batchCharacterLibraryGenerator.ts:66):
```typescript
outputLocation: path.join('E:\\v2 repo\\omega-platform\\public', 'character-library', timestamp)
```

**Why this matters**: Changes to character presets in viral repo immediately affect omega-platform API responses. Both repos must be synced for character generation workflow.

## 🚀 Integration with Viral Engine

### Omega Service Bridge (omega-service.js)
**Purpose**: HTTP microservice bridging SmokeTech Studio with viral engine
**Port**: 3007
**Key Endpoints**:
- `POST /api/generate-nanobana` - NanoBanana image generation
- `POST /api/generate-video` - Omega workflow video generation
- `GET /api/status/:operationId` - Real-time progress tracking

### Connection Pattern
```
SmokeTech Studio (7777) → HTTP Request → Omega Service (3007) → Viral Engine
```

### Benefits of This Architecture
- **Clean separation**: UI concerns vs AI processing
- **Scalability**: Microservices can be deployed independently
- **Development flexibility**: Frontend and backend can be updated separately
- **Error isolation**: Service failures don't crash the UI

## 🎯 Key Learnings & Best Practices

### Model Selection Implementation
- **Cost transparency**: Always display cost per generation
- **Model descriptions**: Help users choose appropriate model
- **Persistent selection**: Use localStorage for user preference
- **Graceful fallbacks**: Handle API failures appropriately

### Omega Integration Patterns
- **Timeout handling**: Set appropriate timeouts for generation
- **Status polling**: Implement real-time progress tracking
- **Error communication**: Clear error messages for users
- **Service health checks**: Monitor Omega service availability

### Branding Optimization
- **WebP format**: 25-35% smaller than PNG for logos
- **Responsive scaling**: Proper sizing across device types
- **Professional spacing**: Negative margins for tight design
- **Color psychology**: Darker greens for professional appearance

## 🔄 Workflow Recommendations

### Primary Development Path
1. **Work from SmokeTech Studio** for UI/UX improvements
2. **Reference viral repo** for core AI functionality
3. **Test integration** via omega-service.js bridge
4. **Deploy both services** for production

### Cross-Repository Updates
- **UI changes**: Update SmokeTech Studio repo
- **AI improvements**: Update viral engine repo
- **Integration fixes**: Update omega-service.js in SmokeTech Studio
- **Documentation**: Update both CLAUDE.md files

### Git Strategy
- **SmokeTech Studio**: User-facing features and UI
- **Viral Engine**: Core AI and generation capabilities
- **Sync pattern**: Pull viral engine updates when needed
- **Backup strategy**: Both repos serve as complete system backups

## 📦 Deployment Considerations

### Production Requirements
- **Node.js 18+** for both frontend and omega-service
- **Environment variables** properly configured
- **Port management**: 7777 (frontend), 3007 (omega-service)
- **API key security**: Secure GEMINI_API_KEY handling

### Scaling Strategy
- **Frontend scaling**: Standard Next.js deployment patterns
- **Omega service**: Can be containerized and load balanced
- **Viral engine**: Separate deployment pipeline
- **Database**: Consider shared state management for production

## 🚨 Important Notes

### Critical Dependencies
- **Omega service must be running** for NanoBanana and video generation
- **Viral engine repo** contains the core AI capabilities
- **API keys** required for all model integrations
- **Port conflicts**: Ensure 7777 and 3007 are available

### Common Issues & Solutions
1. **Port 7777 in use**: Kill existing processes, don't use blanket kill commands
2. **Omega service down**: Check omega-service.js is running on 3007
3. **Model selection not persisting**: Verify localStorage in ModelSelector
4. **Branding issues**: Check WebP logo path and gradient classes

---

**SmokeTech Studio** - Professional AI Content Generation Platform

This documentation covers the UI platform. For core AI generation capabilities, see the viral engine repository's CLAUDE.md.

Built by SmokeDev 🚬