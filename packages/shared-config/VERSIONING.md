# Versioning Policy

## Semantic Versioning

@smoketech/shared-config follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

### Version Format

- **MAJOR** (1.x.x): Breaking changes that require code updates in consuming projects
- **MINOR** (x.1.x): New features added in backward-compatible manner
- **PATCH** (x.x.1): Backward-compatible bug fixes

### Version Pinning

**Production Usage:**
Always pin to exact versions in package.json:

```json
{
  "dependencies": {
    "@smoketech/shared-config": "1.0.0"
  }
}
```

**Development Usage:**
Use caret (^) or tilde (~) for automatic patch updates:

```json
{
  "devDependencies": {
    "@smoketech/shared-config": "^1.0.0"
  }
}
```

## Release Process

### 1. Make Changes
- Update configuration files or code
- Add/update tests
- Update README if needed

### 2. Update CHANGELOG.md
Add entry under appropriate section:
- **Added**: New features/presets
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

Example:
```markdown
## [1.1.0] - 2025-10-20

### Added
- New "Healthcare Professional" character preset
- getShotTypesByPlatform() helper function

### Changed
- Updated Business Executive preset styling
- Improved type definitions for better IDE support
```

### 3. Bump Version
Update version in package.json:

```bash
# Patch release (bug fixes)
npm version patch  # 1.0.0 -> 1.0.1

# Minor release (new features)
npm version minor  # 1.0.0 -> 1.1.0

# Major release (breaking changes)
npm version major  # 1.0.0 -> 2.0.0
```

### 4. Build and Test
```bash
npm run build
npm test
```

### 5. Commit and Tag
```bash
git add .
git commit -m "chore: release v1.1.0"
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin main --tags
```

### 6. Update Linked Projects
```bash
# In viral directory
npm link @smoketech/shared-config

# In omega-platform directory
npm link @smoketech/shared-config
```

## Breaking Changes

### What Constitutes a Breaking Change?

- **MAJOR version bump required:**
  - Removing character presets
  - Removing shot types
  - Changing preset/shot type IDs
  - Removing exported functions
  - Changing function signatures
  - Renaming configuration fields
  - Changing JSON schema structure

- **MINOR version bump allowed:**
  - Adding new character presets
  - Adding new shot types
  - Adding new helper functions
  - Adding new optional fields to configuration
  - Improving documentation

- **PATCH version bump allowed:**
  - Fixing typos in descriptions
  - Updating metadata
  - Bug fixes that don't change API
  - Documentation clarifications

### Migration Guide Template

When releasing breaking changes, include migration guide:

```markdown
## [2.0.0] - 2025-XX-XX

### BREAKING CHANGES

**Changed:** Preset ID format now uses kebab-case instead of camelCase

**Migration:**
```typescript
// Before (v1.x)
getCharacterPreset('businessExecutive')

// After (v2.x)
getCharacterPreset('business-executive')
```

**Impact:** All consumers must update preset ID references
```

## Version History

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 1.0.0 | 2025-10-15 | Initial | First stable release with 6 presets, 4 shot types |

## Deprecation Policy

1. **Announce deprecation** in MINOR version
2. **Maintain for at least 6 months** or 2 MAJOR versions
3. **Remove in next MAJOR version**

Example:
```typescript
/**
 * @deprecated Use getCharacterPreset() instead. Will be removed in v2.0.0
 */
export function getPreset(id: string) {
  console.warn('getPreset() is deprecated. Use getCharacterPreset() instead');
  return getCharacterPreset(id);
}
```

## Testing Requirements

Before any release:
- ✅ All tests passing (`npm test`)
- ✅ Build succeeds (`npm run build`)
- ✅ No TypeScript errors
- ✅ CHANGELOG.md updated
- ✅ Version bumped in package.json
- ✅ Documentation updated

## Consumer Update Strategy

### viral repository
```bash
cd viral
npm link @smoketech/shared-config
npm test  # Verify no breaking changes
```

### omega-platform repository
```bash
cd omega-platform
npm link @smoketech/shared-config
npm run build  # Verify no breaking changes
npm run dev  # Manual testing
```

## Rollback Procedure

If a release has issues:

```bash
# Revert to previous version
git revert HEAD
npm version patch  # Increment to new patch version
npm run build
npm test

# Consumers revert
npm link @smoketech/shared-config
```

---

**Current Version:** 1.0.0
**Release Date:** 2025-10-15
**Stability:** Stable

**SmokeDev** 🚬
