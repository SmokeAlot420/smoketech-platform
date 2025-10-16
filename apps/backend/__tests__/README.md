# Test Suite Documentation

Comprehensive test suite for the Viral AI Content System with unit, integration, E2E, and load tests.

## Test Structure

```
__tests__/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests for individual components
│   ├── video-router.test.ts    # VideoRouter class tests
│   └── character-generation.test.ts # Character generation logic tests
├── integration/                # API integration tests
│   └── api-routes.test.ts      # API endpoint tests
├── e2e/                        # End-to-end workflow tests
│   └── video-generation-workflow.test.ts # Complete pipeline tests
└── load/                       # Load and performance tests
    └── concurrent-generation.test.ts # Concurrent request handling
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # E2E tests only
npm run test:load          # Load tests only

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Test Coverage

### Unit Tests
- ✅ VideoRouter platform selection logic
- ✅ Cost calculation for different video durations
- ✅ Platform optimization (TikTok, YouTube, Instagram)
- ✅ ROI calculations
- ✅ Character generation from user requests

### Integration Tests
- ✅ POST /api/generate-video endpoint
- ✅ GET /api/status/:operationId endpoint
- ✅ GET /api/options endpoint
- ✅ POST /api/suggest-dialogue endpoint
- ✅ POST /api/generate-quotemoto-content endpoint
- ✅ GET /api/health endpoint
- ✅ Error handling across all endpoints

### E2E Tests
- ✅ Complete ultra-realistic video pipeline (Image → Video → Stitch)
- ✅ QuoteMoto campaign generation workflow
- ✅ Multi-character library generation with consistency
- ✅ Performance metrics tracking
- ✅ Error recovery and retry logic

### Load Tests
- ✅ 5, 10, and 20 concurrent video generations
- ✅ Rate limiting compliance
- ✅ Queue management under load
- ✅ Partial failure handling
- ✅ Resource cleanup verification
- ✅ Throughput benchmarks

## Configuration

Test configuration is in `jest.config.ts`:
- Test environment: Node.js
- Test timeout: 30 seconds
- Coverage directory: `coverage/`
- Setup file: `__tests__/setup.ts`

Environment variables for tests are in `.env.test`.

## Mocking Strategy

All external services are mocked:
- NanoBanana image generation
- VEO3 video generation
- FFmpeg stitching
- QuoteMoto activities
- ModularCharacterVideoAPI

This ensures:
- Fast test execution
- No external API costs
- Reliable, deterministic results
- Offline testing capability

---
SmokeDev 🚬
