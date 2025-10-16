# TypeScript Architecture Patterns for Unified Engine Management

## Design Patterns for AI Service Integration and Unified API Design

This document provides proven TypeScript architecture patterns for building unified engines that manage multiple AI services, with specific focus on singleton patterns, facade designs, factory configurations, and comprehensive error handling.

## 1. Singleton Pattern for Engine Management

### Thread-Safe Singleton Implementation

```typescript
interface EngineConfig {
  services: {
    imageGeneration: 'nanobanan' | 'midjourney' | 'dalle3';
    videoGeneration: 'veo3' | 'veo3-fast' | 'runway';
    enhancement: 'topaz' | 'waifu2x' | 'none';
  };
  limits: {
    maxConcurrentJobs: number;
    rateLimitPerMinute: number;
    maxRetries: number;
  };
  monitoring: {
    metricsEnabled: boolean;
    costTracking: boolean;
    qualityAssessment: boolean;
  };
}

class UnifiedViralEngine {
  private static instance: UnifiedViralEngine | null = null;
  private static initializationPromise: Promise<UnifiedViralEngine> | null = null;
  private initialized: boolean = false;

  private config: EngineConfig;
  private services: Map<string, any> = new Map();
  private jobQueue: Array<any> = [];
  private activeJobs: Set<string> = new Set();

  private constructor(config: EngineConfig) {
    this.config = config;
  }

  static async getInstance(config?: EngineConfig): Promise<UnifiedViralEngine> {
    if (UnifiedViralEngine.instance && UnifiedViralEngine.instance.initialized) {
      return UnifiedViralEngine.instance;
    }

    if (UnifiedViralEngine.initializationPromise) {
      return UnifiedViralEngine.initializationPromise;
    }

    UnifiedViralEngine.initializationPromise = UnifiedViralEngine.createInstance(config);
    return UnifiedViralEngine.initializationPromise;
  }

  private static async createInstance(config?: EngineConfig): Promise<UnifiedViralEngine> {
    if (!config) {
      throw new Error('Configuration required for first initialization');
    }

    const instance = new UnifiedViralEngine(config);
    await instance.initialize();

    UnifiedViralEngine.instance = instance;
    UnifiedViralEngine.initializationPromise = null;

    return instance;
  }

  private async initialize(): Promise<void> {
    console.log('Initializing Unified Viral Engine...');

    // Initialize all configured services
    await this.initializeServices();

    // Setup monitoring and metrics
    await this.setupMonitoring();

    // Initialize job management
    this.initializeJobManagement();

    this.initialized = true;
    console.log('Unified Viral Engine initialized successfully');
  }

  private async initializeServices(): Promise<void> {
    const { services } = this.config;

    // Lazy initialization - services created when first needed
    this.services.set('imageGeneration', null);
    this.services.set('videoGeneration', null);
    this.services.set('enhancement', null);
  }

  // Prevent cloning
  private clone(): never {
    throw new Error('Cannot clone singleton instance');
  }

  // Safe destruction for testing
  static destroyInstance(): void {
    if (UnifiedViralEngine.instance) {
      UnifiedViralEngine.instance.destroy();
      UnifiedViralEngine.instance = null;
    }
    UnifiedViralEngine.initializationPromise = null;
  }

  private destroy(): void {
    this.services.clear();
    this.jobQueue = [];
    this.activeJobs.clear();
    this.initialized = false;
  }
}
```

### Lazy Loading Pattern for Heavy Services

```typescript
interface ServiceRegistry<T> {
  get(key: string): Promise<T>;
  has(key: string): boolean;
  clear(): void;
}

class LazyServiceRegistry<T> implements ServiceRegistry<T> {
  private services: Map<string, T> = new Map();
  private factories: Map<string, () => Promise<T>> = new Map();
  private loading: Map<string, Promise<T>> = new Map();

  registerFactory(key: string, factory: () => Promise<T>): void {
    this.factories.set(key, factory);
  }

  async get(key: string): Promise<T> {
    // Return existing service if already loaded
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }

    // Return loading promise if currently loading
    if (this.loading.has(key)) {
      return this.loading.get(key)!;
    }

    // Start loading service
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`No factory registered for service: ${key}`);
    }

    const loadingPromise = this.loadService(key, factory);
    this.loading.set(key, loadingPromise);

    try {
      const service = await loadingPromise;
      this.services.set(key, service);
      this.loading.delete(key);
      return service;
    } catch (error) {
      this.loading.delete(key);
      throw error;
    }
  }

  private async loadService(key: string, factory: () => Promise<T>): Promise<T> {
    console.log(`Loading service: ${key}`);
    const startTime = Date.now();

    try {
      const service = await factory();
      const loadTime = Date.now() - startTime;
      console.log(`Service ${key} loaded in ${loadTime}ms`);
      return service;
    } catch (error) {
      console.error(`Failed to load service ${key}:`, error);
      throw error;
    }
  }

  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.loading.clear();
  }
}
```

## 2. Facade Pattern for Unified API Design

### Comprehensive Facade Implementation

```typescript
interface ContentGenerationRequest {
  type: 'image' | 'video' | 'full-pipeline';
  prompt: string;
  character?: string;
  style?: string;
  platform?: 'tiktok' | 'instagram' | 'youtube';
  quality?: 'draft' | 'production' | 'premium';
  urgency?: 'low' | 'medium' | 'high';
}

interface ContentGenerationResult {
  id: string;
  type: string;
  files: {
    image?: string;
    video?: string;
    enhanced?: string;
  };
  metadata: {
    generationTime: number;
    cost: number;
    quality: number;
    services: string[];
  };
  success: boolean;
  error?: string;
}

class ViralContentFacade {
  private engine: UnifiedViralEngine;
  private serviceRegistry: LazyServiceRegistry<any>;
  private configManager: ConfigurationManager;
  private errorHandler: ErrorHandler;
  private metricsCollector: MetricsCollector;

  constructor(
    engine: UnifiedViralEngine,
    serviceRegistry: LazyServiceRegistry<any>,
    configManager: ConfigurationManager
  ) {
    this.engine = engine;
    this.serviceRegistry = serviceRegistry;
    this.configManager = configManager;
    this.errorHandler = new ErrorHandler();
    this.metricsCollector = new MetricsCollector();
  }

  /**
   * Main content generation method - simplified interface for complex operations
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      console.log(`Starting content generation [${requestId}]:`, request.type);

      // Get optimized configuration for request
      const config = await this.configManager.getOptimalConfig(request);

      // Execute generation pipeline based on type
      const result = await this.executeGenerationPipeline(request, config, requestId);

      // Collect metrics
      const generationTime = Date.now() - startTime;
      await this.metricsCollector.recordGeneration(requestId, request, result, generationTime);

      return {
        id: requestId,
        type: request.type,
        files: result.files,
        metadata: {
          generationTime,
          cost: result.cost,
          quality: result.quality,
          services: result.servicesUsed
        },
        success: true
      };

    } catch (error) {
      const generationTime = Date.now() - startTime;

      console.error(`Content generation failed [${requestId}]:`, error);
      await this.metricsCollector.recordFailure(requestId, request, error, generationTime);

      return {
        id: requestId,
        type: request.type,
        files: {},
        metadata: {
          generationTime,
          cost: 0,
          quality: 0,
          services: []
        },
        success: false,
        error: this.errorHandler.getUserFriendlyMessage(error)
      };
    }
  }

  private async executeGenerationPipeline(
    request: ContentGenerationRequest,
    config: any,
    requestId: string
  ): Promise<any> {
    switch (request.type) {
      case 'image':
        return this.generateImageOnly(request, config, requestId);

      case 'video':
        return this.generateVideoOnly(request, config, requestId);

      case 'full-pipeline':
        return this.generateFullPipeline(request, config, requestId);

      default:
        throw new Error(`Unsupported generation type: ${request.type}`);
    }
  }

  private async generateFullPipeline(
    request: ContentGenerationRequest,
    config: any,
    requestId: string
  ): Promise<any> {
    const servicesUsed: string[] = [];
    let totalCost = 0;

    // Step 1: Generate character image
    console.log(`[${requestId}] Generating character image...`);
    const imageService = await this.serviceRegistry.get(config.imageService);
    const imageResult = await imageService.generate(request.prompt);
    servicesUsed.push(config.imageService);
    totalCost += imageResult.cost;

    // Step 2: Generate video from image
    console.log(`[${requestId}] Generating video...`);
    const videoService = await this.serviceRegistry.get(config.videoService);
    const videoResult = await videoService.generate(request.prompt, imageResult.buffer);
    servicesUsed.push(config.videoService);
    totalCost += videoResult.cost;

    // Step 3: Enhancement (if configured)
    let enhancedResult = null;
    if (config.enhancementService !== 'none') {
      console.log(`[${requestId}] Enhancing video...`);
      const enhancementService = await this.serviceRegistry.get(config.enhancementService);
      enhancedResult = await enhancementService.enhance(videoResult.buffer);
      servicesUsed.push(config.enhancementService);
      totalCost += enhancedResult.cost;
    }

    return {
      files: {
        image: imageResult.filePath,
        video: videoResult.filePath,
        enhanced: enhancedResult?.filePath
      },
      cost: totalCost,
      quality: this.calculateAverageQuality([imageResult, videoResult, enhancedResult]),
      servicesUsed
    };
  }

  private generateRequestId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageQuality(results: any[]): number {
    const validResults = results.filter(r => r && r.quality);
    if (validResults.length === 0) return 0;

    return validResults.reduce((sum, r) => sum + r.quality, 0) / validResults.length;
  }
}
```

## 3. Factory Pattern for Configuration Management

### Configuration Factory Implementation

```typescript
interface ServiceConfiguration {
  provider: string;
  apiKey: string;
  endpoint?: string;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  costPerUnit: number;
  qualityRating: number;
}

interface PipelineConfiguration {
  imageGeneration: ServiceConfiguration;
  videoGeneration: ServiceConfiguration;
  enhancement: ServiceConfiguration;
  estimatedCost: number;
  estimatedTime: number;
  qualityLevel: number;
}

class ConfigurationFactory {
  private static configurations: Map<string, PipelineConfiguration> = new Map();

  static {
    // Pre-configured pipeline templates
    this.registerConfiguration('budget-fast', {
      imageGeneration: {
        provider: 'dalle3',
        apiKey: process.env.OPENAI_API_KEY!,
        timeout: 30000,
        retryPolicy: { maxRetries: 2, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 },
        costPerUnit: 0.04,
        qualityRating: 7.5
      },
      videoGeneration: {
        provider: 'veo3-fast',
        apiKey: process.env.GEMINI_API_KEY!,
        timeout: 180000,
        retryPolicy: { maxRetries: 3, initialDelay: 5000, maxDelay: 30000, backoffMultiplier: 2 },
        costPerUnit: 4.0,
        qualityRating: 8.5
      },
      enhancement: {
        provider: 'none',
        apiKey: '',
        timeout: 0,
        retryPolicy: { maxRetries: 0, initialDelay: 0, maxDelay: 0, backoffMultiplier: 1 },
        costPerUnit: 0,
        qualityRating: 0
      },
      estimatedCost: 4.04,
      estimatedTime: 120000,
      qualityLevel: 8.0
    });

    this.registerConfiguration('premium-quality', {
      imageGeneration: {
        provider: 'nanobanan',
        apiKey: process.env.GEMINI_API_KEY!,
        timeout: 60000,
        retryPolicy: { maxRetries: 3, initialDelay: 2000, maxDelay: 15000, backoffMultiplier: 2 },
        costPerUnit: 0.02,
        qualityRating: 9.0
      },
      videoGeneration: {
        provider: 'veo3',
        apiKey: process.env.GEMINI_API_KEY!,
        timeout: 300000,
        retryPolicy: { maxRetries: 3, initialDelay: 10000, maxDelay: 60000, backoffMultiplier: 2 },
        costPerUnit: 6.0,
        qualityRating: 9.5
      },
      enhancement: {
        provider: 'topaz',
        apiKey: process.env.TOPAZ_API_KEY!,
        timeout: 600000,
        retryPolicy: { maxRetries: 2, initialDelay: 15000, maxDelay: 45000, backoffMultiplier: 2 },
        costPerUnit: 2.5,
        qualityRating: 9.8
      },
      estimatedCost: 8.52,
      estimatedTime: 480000,
      qualityLevel: 9.4
    });
  }

  static registerConfiguration(name: string, config: PipelineConfiguration): void {
    this.configurations.set(name, config);
  }

  static getConfiguration(name: string): PipelineConfiguration | null {
    return this.configurations.get(name) || null;
  }

  static createOptimalConfiguration(requirements: ContentGenerationRequest): PipelineConfiguration {
    const { quality, urgency, platform } = requirements;

    // Decision matrix for optimal configuration
    if (urgency === 'high' && quality === 'draft') {
      return this.getConfiguration('budget-fast')!;
    }

    if (quality === 'premium' || platform === 'youtube') {
      return this.getConfiguration('premium-quality')!;
    }

    // Default to balanced configuration
    return this.createBalancedConfiguration(requirements);
  }

  private static createBalancedConfiguration(requirements: ContentGenerationRequest): PipelineConfiguration {
    return {
      imageGeneration: {
        provider: 'nanobanan',
        apiKey: process.env.GEMINI_API_KEY!,
        timeout: 45000,
        retryPolicy: { maxRetries: 3, initialDelay: 2000, maxDelay: 15000, backoffMultiplier: 2 },
        costPerUnit: 0.02,
        qualityRating: 9.0
      },
      videoGeneration: {
        provider: requirements.urgency === 'high' ? 'veo3-fast' : 'veo3',
        apiKey: process.env.GEMINI_API_KEY!,
        timeout: 240000,
        retryPolicy: { maxRetries: 3, initialDelay: 7500, maxDelay: 45000, backoffMultiplier: 2 },
        costPerUnit: requirements.urgency === 'high' ? 4.0 : 6.0,
        qualityRating: requirements.urgency === 'high' ? 8.5 : 9.5
      },
      enhancement: {
        provider: requirements.quality === 'production' ? 'basic' : 'none',
        apiKey: process.env.ENHANCEMENT_API_KEY || '',
        timeout: 300000,
        retryPolicy: { maxRetries: 2, initialDelay: 10000, maxDelay: 30000, backoffMultiplier: 2 },
        costPerUnit: requirements.quality === 'production' ? 1.0 : 0,
        qualityRating: requirements.quality === 'production' ? 8.5 : 0
      },
      estimatedCost: 0.02 + (requirements.urgency === 'high' ? 4.0 : 6.0) + (requirements.quality === 'production' ? 1.0 : 0),
      estimatedTime: 180000,
      qualityLevel: 8.5
    };
  }

  static getAllConfigurations(): string[] {
    return Array.from(this.configurations.keys());
  }
}

class ConfigurationManager {
  async getOptimalConfig(request: ContentGenerationRequest): Promise<PipelineConfiguration> {
    // Analyze requirements and return optimal configuration
    const config = ConfigurationFactory.createOptimalConfiguration(request);

    // Validate configuration before returning
    this.validateConfiguration(config);

    return config;
  }

  private validateConfiguration(config: PipelineConfiguration): void {
    // Validate API keys are present
    if (config.imageGeneration.apiKey && !process.env[this.getEnvKeyName(config.imageGeneration.provider)]) {
      throw new Error(`Missing API key for ${config.imageGeneration.provider}`);
    }

    if (config.videoGeneration.apiKey && !process.env[this.getEnvKeyName(config.videoGeneration.provider)]) {
      throw new Error(`Missing API key for ${config.videoGeneration.provider}`);
    }

    // Validate timeouts are reasonable
    if (config.imageGeneration.timeout > 300000) {
      console.warn('Image generation timeout is very high, consider reducing for better UX');
    }

    if (config.videoGeneration.timeout > 600000) {
      console.warn('Video generation timeout is very high, consider reducing for better UX');
    }
  }

  private getEnvKeyName(provider: string): string {
    const mapping: Record<string, string> = {
      'nanobanan': 'GEMINI_API_KEY',
      'veo3': 'GEMINI_API_KEY',
      'veo3-fast': 'GEMINI_API_KEY',
      'dalle3': 'OPENAI_API_KEY',
      'midjourney': 'MIDJOURNEY_API_KEY',
      'topaz': 'TOPAZ_API_KEY'
    };

    return mapping[provider] || `${provider.toUpperCase()}_API_KEY`;
  }
}
```

## 4. Error Handling Strategies

### Comprehensive Error Management System

```typescript
enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT = 'TIMEOUT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNKNOWN = 'UNKNOWN'
}

interface ErrorDetails {
  type: ErrorType;
  service: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;
  metadata?: any;
}

class ServiceError extends Error {
  public readonly type: ErrorType;
  public readonly service: string;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly metadata?: any;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'ServiceError';
    this.type = details.type;
    this.service = details.service;
    this.userMessage = details.userMessage;
    this.retryable = details.retryable;
    this.retryAfter = details.retryAfter;
    this.metadata = details.metadata;
  }
}

class ErrorHandler {
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: Map<string, Date> = new Map();

  handleError(error: any, service: string): ServiceError {
    const errorDetails = this.classifyError(error, service);

    // Track error frequency
    this.trackError(service, errorDetails.type);

    // Create structured error
    const serviceError = new ServiceError(errorDetails);

    // Log error details
    this.logError(serviceError);

    return serviceError;
  }

  private classifyError(error: any, service: string): ErrorDetails {
    // Authentication errors
    if (this.isAuthenticationError(error)) {
      return {
        type: ErrorType.AUTHENTICATION,
        service,
        message: error.message,
        userMessage: 'Authentication failed. Please check your API credentials.',
        retryable: false
      };
    }

    // Rate limiting errors
    if (this.isRateLimitError(error)) {
      return {
        type: ErrorType.RATE_LIMIT,
        service,
        message: error.message,
        userMessage: 'Service temporarily unavailable due to rate limiting. Please try again later.',
        retryable: true,
        retryAfter: this.extractRetryAfter(error)
      };
    }

    // Service unavailable
    if (this.isServiceUnavailableError(error)) {
      return {
        type: ErrorType.SERVICE_UNAVAILABLE,
        service,
        message: error.message,
        userMessage: 'Service is temporarily unavailable. Please try again in a few minutes.',
        retryable: true,
        retryAfter: 60000 // 1 minute default
      };
    }

    // Timeout errors
    if (this.isTimeoutError(error)) {
      return {
        type: ErrorType.TIMEOUT,
        service,
        message: error.message,
        userMessage: 'Request timed out. This may be due to high demand. Please try again.',
        retryable: true
      };
    }

    // Quota exceeded
    if (this.isQuotaExceededError(error)) {
      return {
        type: ErrorType.QUOTA_EXCEEDED,
        service,
        message: error.message,
        userMessage: 'Service quota exceeded. Please try again later or upgrade your plan.',
        retryable: false
      };
    }

    // Invalid input
    if (this.isInvalidInputError(error)) {
      return {
        type: ErrorType.INVALID_INPUT,
        service,
        message: error.message,
        userMessage: 'Invalid input provided. Please check your parameters and try again.',
        retryable: false
      };
    }

    // Unknown/generic error
    return {
      type: ErrorType.UNKNOWN,
      service,
      message: error.message || 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      retryable: true
    };
  }

  private isAuthenticationError(error: any): boolean {
    return error.status === 401 ||
           error.code === 'UNAUTHENTICATED' ||
           error.message?.includes('authentication') ||
           error.message?.includes('unauthorized') ||
           error.message?.includes('API key');
  }

  private isRateLimitError(error: any): boolean {
    return error.status === 429 ||
           error.code === 'RATE_LIMIT_EXCEEDED' ||
           error.message?.includes('rate limit') ||
           error.message?.includes('too many requests');
  }

  private isServiceUnavailableError(error: any): boolean {
    return error.status === 503 ||
           error.status === 502 ||
           error.code === 'SERVICE_UNAVAILABLE' ||
           error.message?.includes('service unavailable') ||
           error.message?.includes('temporarily unavailable');
  }

  private isTimeoutError(error: any): boolean {
    return error.code === 'ETIMEDOUT' ||
           error.code === 'TIMEOUT' ||
           error.message?.includes('timeout') ||
           error.message?.includes('timed out');
  }

  private isQuotaExceededError(error: any): boolean {
    return error.status === 403 ||
           error.code === 'QUOTA_EXCEEDED' ||
           error.message?.includes('quota') ||
           error.message?.includes('limit exceeded');
  }

  private isInvalidInputError(error: any): boolean {
    return error.status === 400 ||
           error.code === 'INVALID_ARGUMENT' ||
           error.message?.includes('invalid') ||
           error.message?.includes('bad request');
  }

  private extractRetryAfter(error: any): number | undefined {
    // Try to extract retry-after header value
    if (error.response?.headers?.['retry-after']) {
      const retryAfter = parseInt(error.response.headers['retry-after']);
      return isNaN(retryAfter) ? undefined : retryAfter * 1000; // Convert to milliseconds
    }

    // Default retry delays based on error type
    if (this.isRateLimitError(error)) {
      return 60000; // 1 minute for rate limits
    }

    return undefined;
  }

  private trackError(service: string, errorType: ErrorType): void {
    const key = `${service}:${errorType}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
    this.lastErrors.set(key, new Date());
  }

  private logError(error: ServiceError): void {
    console.error(`[${error.service}] ${error.type}: ${error.message}`, {
      service: error.service,
      type: error.type,
      retryable: error.retryable,
      retryAfter: error.retryAfter,
      metadata: error.metadata
    });
  }

  getUserFriendlyMessage(error: any): string {
    if (error instanceof ServiceError) {
      return error.userMessage;
    }

    return 'An unexpected error occurred. Please try again or contact support.';
  }

  getErrorStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, count] of this.errorCounts) {
      stats[key] = count;
    }
    return stats;
  }

  isServiceHealthy(service: string, timeWindow: number = 300000): boolean {
    const now = new Date();
    let recentErrors = 0;

    for (const [key, lastError] of this.lastErrors) {
      if (key.startsWith(`${service}:`) &&
          now.getTime() - lastError.getTime() <= timeWindow) {
        recentErrors++;
      }
    }

    // Consider service unhealthy if more than 5 errors in time window
    return recentErrors <= 5;
  }
}
```

## 5. Complete Implementation Example

### Unified Viral Engine Implementation

```typescript
// Complete implementation bringing all patterns together
class UltimateViralEngine {
  private static instance: UltimateViralEngine;
  private facade: ViralContentFacade;
  private serviceRegistry: LazyServiceRegistry<any>;
  private configManager: ConfigurationManager;
  private errorHandler: ErrorHandler;
  private metricsCollector: MetricsCollector;

  private constructor() {
    this.errorHandler = new ErrorHandler();
    this.metricsCollector = new MetricsCollector();
    this.configManager = new ConfigurationManager();
    this.serviceRegistry = new LazyServiceRegistry();

    this.initializeServices();
  }

  static async getInstance(): Promise<UltimateViralEngine> {
    if (!UltimateViralEngine.instance) {
      UltimateViralEngine.instance = new UltimateViralEngine();
      await UltimateViralEngine.instance.initialize();
    }
    return UltimateViralEngine.instance;
  }

  private async initialize(): Promise<void> {
    const baseEngine = await UnifiedViralEngine.getInstance({
      services: {
        imageGeneration: 'nanobanan',
        videoGeneration: 'veo3',
        enhancement: 'topaz'
      },
      limits: {
        maxConcurrentJobs: 5,
        rateLimitPerMinute: 60,
        maxRetries: 3
      },
      monitoring: {
        metricsEnabled: true,
        costTracking: true,
        qualityAssessment: true
      }
    });

    this.facade = new ViralContentFacade(
      baseEngine,
      this.serviceRegistry,
      this.configManager
    );
  }

  private initializeServices(): void {
    // Register service factories
    this.serviceRegistry.registerFactory('nanobanan', async () => {
      const { NanoBananaService } = await import('../services/nanoBananaService');
      return new NanoBananaService();
    });

    this.serviceRegistry.registerFactory('veo3', async () => {
      const { VEO3Service } = await import('../services/veo3Service');
      return new VEO3Service({
        apiKey: process.env.GEMINI_API_KEY!,
        model: 'veo-3.0-generate-001',
        aspectRatio: '16:9',
        resolution: '1080p'
      });
    });

    this.serviceRegistry.registerFactory('topaz', async () => {
      const { TopazEnhancementService } = await import('../services/topazService');
      return new TopazEnhancementService();
    });
  }

  // Public API methods
  async generateViralContent(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    return this.facade.generateContent(request);
  }

  async getSystemHealth(): Promise<{
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    errorStats: Record<string, number>;
  }> {
    const services = ['nanobanan', 'veo3', 'topaz'];
    const serviceHealth: Record<string, boolean> = {};

    for (const service of services) {
      serviceHealth[service] = this.errorHandler.isServiceHealthy(service);
    }

    const healthyServices = Object.values(serviceHealth).filter(Boolean).length;
    const overallHealth =
      healthyServices === services.length ? 'healthy' :
      healthyServices > 0 ? 'degraded' : 'unhealthy';

    return {
      overallHealth,
      services: serviceHealth,
      errorStats: this.errorHandler.getErrorStatistics()
    };
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.metricsCollector.getPerformanceReport();
  }
}

// Export for use in application
export { UltimateViralEngine, ContentGenerationRequest, ContentGenerationResult };
```

---

**Implementation Benefits:**

1. **Singleton Pattern**: Ensures single instance with thread-safe initialization
2. **Facade Pattern**: Simplifies complex AI service interactions into clean API
3. **Factory Pattern**: Flexible service configuration and instantiation
4. **Lazy Loading**: Services loaded only when needed, reducing startup time
5. **Comprehensive Error Handling**: Robust error classification and recovery
6. **Performance Monitoring**: Built-in metrics and health monitoring

**Sources:**
- [Refactoring.Guru Design Patterns](https://refactoring.guru/design-patterns/facade/typescript/example)
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- Production experience with large-scale AI service integration

**Last Updated:** September 2025
**Next Review:** December 2025