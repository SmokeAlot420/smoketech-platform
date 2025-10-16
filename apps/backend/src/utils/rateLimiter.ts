/**
 * Rate Limiter Utility for API Requests
 *
 * Implements intelligent rate limiting for VEO3 and other APIs
 * with exponential backoff and request queuing
 */

export interface RateLimiterConfig {
  requestsPerMinute: number;
  burstAllowance?: number; // Allow burst requests up to this limit
  exponentialBackoffBase?: number; // Base for exponential backoff (default: 2)
  maxBackoffDelay?: number; // Maximum backoff delay in ms (default: 60000)
  enableLogging?: boolean;
}

export interface RateLimitInfo {
  canProceed: boolean;
  suggestedDelay: number; // in milliseconds
  requestsInLastMinute: number;
  timeUntilNextSlot: number;
}

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private consecutiveErrors: number = 0;
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      requestsPerMinute: config.requestsPerMinute,
      burstAllowance: config.burstAllowance || Math.ceil(config.requestsPerMinute * 0.2),
      exponentialBackoffBase: config.exponentialBackoffBase || 2,
      maxBackoffDelay: config.maxBackoffDelay || 60000,
      enableLogging: config.enableLogging ?? true
    };

    if (this.config.enableLogging) {
      console.log(`🚦 Rate Limiter initialized: ${this.config.requestsPerMinute} requests/minute`);
    }
  }

  /**
   * Check if a request can proceed and get timing info
   */
  checkRateLimit(): RateLimitInfo {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    const requestsInLastMinute = this.requestTimestamps.length;
    const intervalMs = 60000 / this.config.requestsPerMinute; // Time between requests
    const timeSinceLastRequest = this.requestTimestamps.length > 0
      ? now - this.requestTimestamps[this.requestTimestamps.length - 1]
      : intervalMs;

    // Calculate when next slot is available
    const timeUntilNextSlot = Math.max(0, intervalMs - timeSinceLastRequest);

    // Check if we can proceed
    const canProceed = requestsInLastMinute < this.config.requestsPerMinute && timeUntilNextSlot === 0;

    // Calculate suggested delay
    let suggestedDelay = timeUntilNextSlot;

    // Add exponential backoff if we have consecutive errors
    if (this.consecutiveErrors > 0) {
      const backoffDelay = Math.min(
        Math.pow(this.config.exponentialBackoffBase, this.consecutiveErrors) * 1000,
        this.config.maxBackoffDelay
      );
      suggestedDelay = Math.max(suggestedDelay, backoffDelay);
    }

    return {
      canProceed,
      suggestedDelay,
      requestsInLastMinute,
      timeUntilNextSlot
    };
  }

  /**
   * Wait for rate limit and then record a request
   */
  async waitAndProceed(): Promise<void> {
    const rateInfo = this.checkRateLimit();

    if (this.config.enableLogging && rateInfo.suggestedDelay > 0) {
      console.log(`⏳ Rate limiting: waiting ${Math.round(rateInfo.suggestedDelay / 1000)}s (${rateInfo.requestsInLastMinute}/${this.config.requestsPerMinute} requests used)`);
    }

    if (rateInfo.suggestedDelay > 0) {
      await this.delay(rateInfo.suggestedDelay);
    }

    // Record the request
    this.requestTimestamps.push(Date.now());

    if (this.config.enableLogging) {
      const updated = this.checkRateLimit();
      console.log(`🚦 Request proceeding (${updated.requestsInLastMinute}/${this.config.requestsPerMinute} requests used)`);
    }
  }

  /**
   * Record a successful request (resets error count)
   */
  recordSuccess(): void {
    this.consecutiveErrors = 0;
    if (this.config.enableLogging && this.consecutiveErrors > 0) {
      console.log(`✅ Request successful - error count reset`);
    }
  }

  /**
   * Record a failed request (increases backoff)
   */
  recordError(errorType: '429' | '503' | 'timeout' | 'other' = 'other'): void {
    this.consecutiveErrors++;

    if (this.config.enableLogging) {
      const nextBackoff = Math.min(
        Math.pow(this.config.exponentialBackoffBase, this.consecutiveErrors) * 1000,
        this.config.maxBackoffDelay
      );
      console.log(`❌ Request failed (${errorType}) - consecutive errors: ${this.consecutiveErrors}, next backoff: ${Math.round(nextBackoff / 1000)}s`);
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsInLastMinute: number;
    consecutiveErrors: number;
    nextRequestAvailable: number; // timestamp
  } {
    const rateInfo = this.checkRateLimit();
    return {
      requestsInLastMinute: rateInfo.requestsInLastMinute,
      consecutiveErrors: this.consecutiveErrors,
      nextRequestAvailable: Date.now() + rateInfo.timeUntilNextSlot
    };
  }

  /**
   * Reset the rate limiter (useful for testing)
   */
  reset(): void {
    this.requestTimestamps = [];
    this.consecutiveErrors = 0;
    if (this.config.enableLogging) {
      console.log(`🔄 Rate limiter reset`);
    }
  }

  /**
   * Delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Pre-configured rate limiters for common services
 */
export class RateLimiters {
  /**
   * VEO3 rate limiter (10 requests per minute)
   */
  static createVEO3RateLimiter(): RateLimiter {
    return new RateLimiter({
      requestsPerMinute: 10,
      burstAllowance: 2, // Allow small bursts
      exponentialBackoffBase: 2,
      maxBackoffDelay: 60000, // 1 minute max
      enableLogging: true
    });
  }

  /**
   * Gemini API rate limiter (more permissive)
   */
  static createGeminiRateLimiter(): RateLimiter {
    return new RateLimiter({
      requestsPerMinute: 60,
      burstAllowance: 10,
      exponentialBackoffBase: 1.5,
      maxBackoffDelay: 30000,
      enableLogging: true
    });
  }

  /**
   * Conservative rate limiter for testing
   */
  static createConservativeRateLimiter(): RateLimiter {
    return new RateLimiter({
      requestsPerMinute: 5, // Extra conservative
      burstAllowance: 1,
      exponentialBackoffBase: 3,
      maxBackoffDelay: 120000, // 2 minutes max
      enableLogging: true
    });
  }
}

/**
 * Utility function to wrap API calls with rate limiting
 */
export async function withRateLimit<T>(
  rateLimiter: RateLimiter,
  apiCall: () => Promise<T>,
  retryCount: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // Wait for rate limit
      await rateLimiter.waitAndProceed();

      // Make the API call
      const result = await apiCall();

      // Record success
      rateLimiter.recordSuccess();

      return result;
    } catch (error: any) {
      console.error(`API call attempt ${attempt}/${retryCount} failed:`, error.message);

      // Record the error type
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        rateLimiter.recordError('429');
      } else if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
        rateLimiter.recordError('503');
      } else if (error.message?.includes('timeout')) {
        rateLimiter.recordError('timeout');
      } else {
        rateLimiter.recordError('other');
      }

      // If this is the last attempt, throw the error
      if (attempt === retryCount) {
        throw error;
      }

      // Otherwise, the rate limiter will handle the backoff on the next iteration
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Maximum retry attempts exceeded');
}