# @smoketech/shared-config

Shared configuration and presets for SmokeTech video generation system.

## Purpose

This package centralizes configuration shared between:
- **viral engine** - Core AI video generation system
- **omega-platform** - Professional UI and API gateway

## Contents

- **Character Presets** - Pre-configured character profiles for consistent video generation
- **Shot Type Configurations** - Camera angles, movements, and framing presets
- **Model Configurations** - AI model settings and parameters
- **Helper Functions** - Utilities for loading and validating configuration

## Installation

### Local Development (npm link)

```bash
# In shared-config directory
npm install
npm run build
npm link

# In viral directory
npm link @smoketech/shared-config

# In omega-platform directory
npm link @smoketech/shared-config
```

### Production

```bash
npm install @smoketech/shared-config@1.0.0
```

## Usage

```typescript
import {
  getCharacterPresets,
  getCharacterPreset,
  getShotTypes,
  validateCharacterPreset
} from '@smoketech/shared-config';

// Load all character presets
const presets = getCharacterPresets();

// Get specific preset
const businessExec = getCharacterPreset('business-executive');

// Load shot type configurations
const shotTypes = getShotTypes();

// Validate preset structure
const isValid = validateCharacterPreset(myCustomPreset);
```

## Configuration Files

- `character-presets.json` - Character definitions with physical traits, style, and behaviors
- `shot-types-config.json` - Camera configurations for different shot types
- `model-configs.json` - AI model parameters and settings

## TypeScript Support

Full TypeScript definitions included:
- `CharacterPreset` interface
- `ShotTypeConfig` interface
- `ModelConfig` interface
- Type guards for validation

## Version Management

This package uses semantic versioning (semver):
- **1.0.x** - Patch releases (bug fixes, no breaking changes)
- **1.x.0** - Minor releases (new features, backward compatible)
- **x.0.0** - Major releases (breaking changes)

Always pin to exact version in production:
```json
{
  "dependencies": {
    "@smoketech/shared-config": "1.0.0"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Watch mode
npm run build -- --watch
```

## Contributing

1. Make changes to `src/` files
2. Add tests for new features
3. Run `npm run build` to compile
4. Run `npm test` to verify
5. Update CHANGELOG.md
6. Commit with descriptive message

## License

MIT

---

**SmokeDev** 🚬
