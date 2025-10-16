# 🚀 SmokeTech Platform - Monorepo

**One repo. One command. Everything together.**

AI-powered video generation platform combining viral content engine (backend) and professional UI (frontend) in a modern Turborepo monorepo.

## 📦 What's Inside

```
smoketech-platform/
├── apps/
│   ├── backend/         # Viral AI video generation engine
│   └── frontend/        # Next.js professional UI
└── packages/
    └── shared-config/   # Shared character presets & shot types
```

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Start everything (backend + frontend)
npm run dev

# Build everything
npm run build

# Run tests
npm run test
```

## 💻 Development

### Start Both Apps

```bash
npm run dev
```

This runs:
- **Backend** (viral): Temporal workflows, AI generation (port 3007)
- **Frontend** (omega): Next.js UI (port 7777)

### Start Individual Apps

```bash
# Backend only
cd apps/backend
npm run dev

# Frontend only
cd apps/frontend
npm run dev
```

## 🏗️ Architecture

### Backend (apps/backend)
- **Tech:** Node.js, TypeScript, Temporal workflows
- **Features:** VEO3 video generation, NanoBanana characters, Gemini AI
- **Port:** 3007 (omega-service)

### Frontend (apps/frontend)
- **Tech:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Features:** Professional UI, model selector, workflow visualization
- **Port:** 7777

### Shared Config (packages/shared-config)
- **Contains:** Character presets (6), Shot types (4)
- **Used by:** Both frontend and backend
- **Type-safe:** Full TypeScript definitions

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both apps in dev mode |
| `npm run build` | Build all packages |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run clean` | Clean build artifacts |

## 🔧 Configuration

### Environment Variables

Create `.env` files in each app directory:

**apps/backend/.env:**
```bash
GEMINI_API_KEY=your_key
GCP_PROJECT_ID=your_project
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./config/vertex-ai-key.json
```

**apps/frontend/.env:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3007
```

### Workspace References

Apps automatically reference shared-config via npm workspaces:

```json
{
  "dependencies": {
    "@smoketech/shared-config": "workspace:*"
  }
}
```

## 📊 Turborepo Features

- ⚡ **Fast builds** with smart caching
- 🔄 **Parallel execution** of tasks across packages
- 📦 **Dependency-aware** task ordering
- 🎯 **Incremental builds** - only rebuild what changed

## 🎯 Common Workflows

### Add New Character Preset

1. Edit `packages/shared-config/src/config/character-presets.json`
2. Run `npm run build` (rebuilds shared-config)
3. Both apps automatically get the new preset

### Update Backend Code

```bash
cd apps/backend
npm run dev  # Watch mode
```

### Update Frontend Code

```bash
cd apps/frontend
npm run dev  # Next.js hot reload
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific app
cd apps/backend && npm run test
cd apps/frontend && npm run test

# Test shared-config
cd packages/shared-config && npm run test
```

## 📦 Building for Production

```bash
# Build everything
npm run build

# Outputs:
# - apps/backend/dist/
# - apps/frontend/.next/
# - packages/shared-config/dist/
```

## 🚢 Deployment

### Option 1: Deploy Together
```bash
npm run build
# Deploy entire monorepo
```

### Option 2: Deploy Separately
```bash
# Deploy backend
cd apps/backend && npm run build
# Deploy dist/ folder

# Deploy frontend
cd apps/frontend && npm run build
# Deploy .next/ folder
```

## 🔍 Troubleshooting

### "Module not found: @smoketech/shared-config"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Turbo cache issues

```bash
# Clear turbo cache
npx turbo clean
npm run build
```

### Port conflicts

- Backend: Change `omega-service.js` port (default 3007)
- Frontend: Use `npm run dev -- --port 8888`

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, TypeScript, Temporal, Express |
| AI Models | VEO3, NanoBanana, Gemini 2.5, Sora 2 |
| Build | Turborepo, npm workspaces |
| Testing | Jest, Playwright |

## 📚 Project Structure

```
smoketech-platform/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── characters/      # Character definitions
│   │   │   ├── pipelines/       # Video pipelines
│   │   │   ├── services/        # VEO3, Sora2, NanoBanana
│   │   │   ├── temporal/        # Workflow orchestration
│   │   │   └── presets/         # Character preset manager
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── app/             # Next.js app router
│       │   ├── components/      # React components
│       │   └── lib/             # Utilities
│       ├── package.json
│       └── next.config.js
├── packages/
│   └── shared-config/
│       ├── src/
│       │   ├── config/          # JSON config files
│       │   ├── index.ts         # Helper functions
│       │   └── types.ts         # TypeScript types
│       └── package.json
├── package.json                  # Root workspace config
├── turbo.json                    # Turborepo configuration
└── README.md                     # This file
```

## 🤝 Contributing

1. Make changes in relevant app or package
2. Run `npm run build` to verify
3. Run `npm run test` to ensure tests pass
4. Commit with descriptive message

## 📖 Learn More

- [Turborepo Docs](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Next.js Docs](https://nextjs.org/docs)
- [Temporal Docs](https://docs.temporal.io/)

## 📞 Support

Need help? Check the docs in each app:
- Backend: `apps/backend/CLAUDE.md`
- Frontend: `apps/frontend/README.md`
- Shared Config: `packages/shared-config/README.md`

---

**Built with ❤️ by SmokeDev** 🚬

**One repo to rule them all.**
