import { toast } from "@/hooks/use-toast";

// Error types with user-friendly messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Connection failed. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "Request timed out. The server might be busy. Please try again.",

  // API errors
  API_KEY_MISSING: "API key not configured. Please add your Gemini API key in settings.",
  API_KEY_INVALID: "Invalid API key. Please check your Gemini API key in settings.",
  RATE_LIMIT: "Rate limit exceeded. Please wait a moment before trying again.",
  QUOTA_EXCEEDED: "API quota exceeded. Please check your Google Cloud billing.",

  // Service errors
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.",
  OMEGA_SERVICE_DOWN: "Omega service is not responding. Please ensure it's running on port 3007.",
  GENERATION_FAILED: "Generation failed. Please try again with different parameters.",

  // Validation errors
  INVALID_INPUT: "Invalid input. Please check your prompt and try again.",
  FILE_TOO_LARGE: "File size exceeds limit. Please use a smaller file.",
  UNSUPPORTED_FORMAT: "Unsupported file format. Please use a supported format.",

  // Generic errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  PERMISSION_DENIED: "Permission denied. Please check your access rights.",
};

// Error severity levels
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

// Custom error class with additional metadata
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    retryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.severity = severity;
    this.retryable = retryable;
    this.details = details;
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Exponential backoff with jitter
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, config.maxDelay);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

// Retry wrapper for async functions
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not retryable
      if (error instanceof AppError && !error.retryable) {
        throw error;
      }

      // Don't retry on certain HTTP status codes
      if (error instanceof Response) {
        const status = error.status;
        if ([400, 401, 403, 404, 422].includes(status)) {
          throw error;
        }
      }

      // Check if we should retry
      if (attempt < retryConfig.maxAttempts) {
        const delay = calculateDelay(attempt, retryConfig);

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Show retry toast for user awareness
        if (attempt === 1) {
          toast({
            title: "Retrying...",
            description: `Attempt ${attempt + 1} of ${retryConfig.maxAttempts}`,
            variant: "default",
          });
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Error handler for API responses
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
  let errorCode = "UNKNOWN_ERROR";
  let severity = ErrorSeverity.ERROR;
  let retryable = false;

  try {
    const errorData = await response.json();

    // Parse error based on status code
    switch (response.status) {
      case 400:
        errorMessage = errorData.error || ERROR_MESSAGES.INVALID_INPUT;
        errorCode = "INVALID_INPUT";
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.API_KEY_INVALID;
        errorCode = "UNAUTHORIZED";
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.PERMISSION_DENIED;
        errorCode = "FORBIDDEN";
        break;
      case 404:
        errorMessage = errorData.error || "Resource not found";
        errorCode = "NOT_FOUND";
        break;
      case 429:
        errorMessage = ERROR_MESSAGES.RATE_LIMIT;
        errorCode = "RATE_LIMIT";
        retryable = true;
        break;
      case 500:
        errorMessage = ERROR_MESSAGES.SERVICE_UNAVAILABLE;
        errorCode = "INTERNAL_ERROR";
        severity = ErrorSeverity.CRITICAL;
        retryable = true;
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = ERROR_MESSAGES.SERVICE_UNAVAILABLE;
        errorCode = "SERVICE_UNAVAILABLE";
        retryable = true;
        break;
      default:
        errorMessage = errorData.error || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    // Override with specific error message if provided
    if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch (parseError) {
    // If we can't parse the error response, use default message
    console.error("Failed to parse error response:", parseError);
  }

  throw new AppError(errorMessage, errorCode, severity, retryable, {
    status: response.status,
    statusText: response.statusText,
  });
}

// Global error handler for unhandled errors
export function handleError(error: unknown, showToast: boolean = true): void {
  console.error("Error caught:", error);

  let message = ERROR_MESSAGES.UNKNOWN_ERROR;
  let severity = ErrorSeverity.ERROR;
  let variant: "default" | "destructive" | "success" = "destructive";

  if (error instanceof AppError) {
    message = error.message;
    severity = error.severity;

    // Determine toast variant based on severity
    switch (severity) {
      case ErrorSeverity.INFO:
        variant = "default";
        break;
      case ErrorSeverity.WARNING:
        variant = "default";
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        variant = "destructive";
        break;
    }
  } else if (error instanceof Error) {
    message = error.message;

    // Check for specific error patterns
    if (message.includes("network") || message.includes("fetch")) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (message.includes("timeout")) {
      message = ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (message.includes("API key")) {
      message = ERROR_MESSAGES.API_KEY_MISSING;
    }
  }

  if (showToast) {
    toast({
      title: severity === ErrorSeverity.CRITICAL ? "Critical Error" : "Error",
      description: message,
      variant,
    });
  }
}

// Graceful degradation wrapper
export async function withGracefulDegradation<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T> | T,
  onFallback?: (error: Error) => void
): Promise<T> {
  try {
    return await primaryFn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (onFallback) {
      onFallback(err);
    }

    // Log the fallback
    console.warn("Primary function failed, using fallback:", err.message);

    // Show info toast about fallback
    toast({
      title: "Using fallback",
      description: "Some features may be limited.",
      variant: "default",
    });

    return await fallbackFn();
  }
}

// Timeout wrapper for promises
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = ERROR_MESSAGES.TIMEOUT_ERROR
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new AppError(errorMessage, "TIMEOUT", ErrorSeverity.ERROR, true)), timeoutMs)
    ),
  ]);
}

// Service health check
export async function checkServiceHealth(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await withTimeout(
      fetch(url, { method: "HEAD" }),
      timeout
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}