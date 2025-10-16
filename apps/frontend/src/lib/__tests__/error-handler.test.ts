import {
  withRetry,
  handleApiError,
  handleError,
  withTimeout,
  checkServiceHealth,
  AppError,
  ErrorSeverity,
  ERROR_MESSAGES
} from '../error-handler';

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');

      const onRetry = jest.fn();
      const result = await withRetry(fn, { maxAttempts: 3 }, onRetry);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should fail after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(
        withRetry(fn, { maxAttempts: 2 })
      ).rejects.toThrow('Persistent failure');

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable status codes', async () => {
      const error = new Error('Bad Request') as any;
      error.status = 400;

      const fn = jest.fn().mockRejectedValue(error);

      await expect(withRetry(fn)).rejects.toThrow('Bad Request');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect exponential backoff with jitter', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000
      });

      // First attempt fails immediately
      await jest.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // Second attempt after delay with jitter
      await jest.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Third attempt after exponential delay
      await jest.advanceTimersByTimeAsync(4000);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('withTimeout', () => {
    it('should resolve if promise completes before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);
      expect(result).toBe('success');
    });

    it('should reject if promise takes longer than timeout', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });

      const timeoutPromise = withTimeout(promise, 1000, 'Custom timeout message');

      jest.advanceTimersByTime(1001);

      await expect(timeoutPromise).rejects.toThrow(AppError);
      await expect(timeoutPromise).rejects.toMatchObject({
        message: 'Custom timeout message',
        severity: 'HIGH'
      });
    });
  });

  describe('handleApiError', () => {
    it('should handle 404 errors', async () => {
      const response = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ message: 'Resource not found' })
      } as any;

      await expect(handleApiError(response)).rejects.toThrow(AppError);
      await expect(handleApiError(response)).rejects.toMatchObject({
        message: 'Resource not found',
        status: 404,
        severity: 'MEDIUM'
      });
    });

    it('should handle 500 errors', async () => {
      const response = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Parse error'))
      } as any;

      await expect(handleApiError(response)).rejects.toThrow(AppError);
      await expect(handleApiError(response)).rejects.toMatchObject({
        message: 'Internal Server Error',
        status: 500,
        severity: 'HIGH'
      });
    });

    it('should handle rate limiting (429)', async () => {
      const response = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({})
      } as any;

      await expect(handleApiError(response)).rejects.toThrow(AppError);
      await expect(handleApiError(response)).rejects.toMatchObject({
        message: ERROR_MESSAGES.RATE_LIMIT_ERROR,
        status: 429,
        severity: 'MEDIUM'
      });
    });
  });

  describe('handleError', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    it('should return AppError for AppError input', () => {
      const appError = new AppError('Test error', 'HIGH', 500);
      const result = handleError(appError, 'Test context');

      expect(result).toBe(appError);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Test context] Error:',
        expect.objectContaining({
          message: 'Test error',
          severity: 'HIGH'
        })
      );
    });

    it('should convert regular Error to AppError', () => {
      const error = new Error('Regular error');
      const result = handleError(error, 'Test context');

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Regular error');
      expect(result.severity).toBe('MEDIUM');
    });

    it('should handle string errors', () => {
      const result = handleError('String error', 'Test context');

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('String error');
    });

    it('should handle unknown errors', () => {
      const result = handleError(null, 'Test context');

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unknown error occurred');
    });
  });

  describe('checkServiceHealth', () => {
    global.fetch = jest.fn();

    it('should return true for healthy service', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      });

      const result = await checkServiceHealth('http://localhost:3000/health');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/health');
    });

    it('should return false for unhealthy service', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await checkServiceHealth('http://localhost:3000/health');

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await checkServiceHealth('http://localhost:3000/health');

      expect(result).toBe(false);
    });

    it('should timeout after specified duration', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 10000);
        })
      );

      const promise = checkServiceHealth('http://localhost:3000/health', 1000);

      jest.advanceTimersByTime(1001);

      const result = await promise;
      expect(result).toBe(false);
    });
  });
});