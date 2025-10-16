# TypeScript-Node.js Subprocess Bridge Patterns

## Overview

This document provides production-ready patterns for calling external TypeScript applications via subprocess from Node.js APIs. These patterns enable integration with existing TypeScript systems (like the Omega Workflow system) without modifying the working codebase.

## Table of Contents

1. [Subprocess Management](#subprocess-management)
2. [Communication Patterns](#communication-patterns)
3. [Error Handling](#error-handling)
4. [Security Considerations](#security-considerations)
5. [Performance Optimization](#performance-optimization)
6. [Production Examples](#production-examples)

## Subprocess Management

### Basic TypeScript Process Execution

```typescript
import { spawn, fork, exec, execSync } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

interface ProcessConfig {
  command: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
  encoding?: BufferEncoding;
}

class TypeScriptProcessManager {
  private activeProcesses = new Map<string, ChildProcess>();

  async executeTypeScript(
    scriptPath: string,
    config: ProcessConfig = {}
  ): Promise<ProcessResult> {
    const processId = this.generateProcessId();

    try {
      // Use ts-node for direct TypeScript execution
      const tsNodePath = path.resolve('./node_modules/.bin/ts-node');
      const fullScriptPath = path.resolve(scriptPath);

      const childProcess = spawn(tsNodePath, [fullScriptPath, ...(config.args || [])], {
        cwd: config.cwd || process.cwd(),
        env: { ...process.env, ...config.env },
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        timeout: config.timeout || 300000, // 5 minutes default
      });

      this.activeProcesses.set(processId, childProcess);

      const result = await this.handleProcessExecution(childProcess, config);
      return { processId, ...result };

    } catch (error) {
      throw new ProcessExecutionError(`Failed to execute TypeScript process: ${error.message}`, error);
    } finally {
      this.activeProcesses.delete(processId);
    }
  }

  private generateProcessId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Process Lifecycle Management

```typescript
interface ProcessResult {
  processId: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  success: boolean;
}

class ProcessManager {
  private processes = new Map<string, ProcessInfo>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: ProcessManagerConfig = {}) {
    this.startCleanupService();
  }

  async handleProcessExecution(
    childProcess: ChildProcess,
    config: ProcessConfig
  ): Promise<ProcessResult> {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutHandle = config.timeout ?
        setTimeout(() => {
          childProcess.kill('SIGTERM');
          reject(new ProcessTimeoutError(`Process exceeded ${config.timeout}ms timeout`));
        }, config.timeout) : null;

      // Collect stdout data
      childProcess.stdout?.on('data', (data) => {
        const chunk = data.toString(config.encoding || 'utf8');
        stdout += chunk;
        this.emitProgress(childProcess.pid!, 'stdout', chunk);
      });

      // Collect stderr data
      childProcess.stderr?.on('data', (data) => {
        const chunk = data.toString(config.encoding || 'utf8');
        stderr += chunk;
        this.emitProgress(childProcess.pid!, 'stderr', chunk);
      });

      // Handle process completion
      childProcess.on('exit', (code, signal) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);

        const executionTime = Date.now() - startTime;
        const result: ProcessResult = {
          processId: childProcess.pid!.toString(),
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          executionTime,
          success: code === 0,
        };

        if (code === 0) {
          resolve(result);
        } else {
          reject(new ProcessExecutionError(
            `Process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`,
            result
          ));
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject(new ProcessSpawnError(`Failed to spawn process: ${error.message}`, error));
      });
    });
  }

  private emitProgress(pid: number, type: 'stdout' | 'stderr', data: string) {
    // Emit progress events for real-time monitoring
    process.emit('subprocess-progress', { pid, type, data, timestamp: Date.now() });
  }
}
```

### Working Directory and Environment Management

```typescript
interface EnvironmentConfig {
  workingDirectory?: string;
  environmentVariables?: Record<string, string>;
  pathExtensions?: string[];
  nodeOptions?: string[];
}

class EnvironmentManager {
  static prepareEnvironment(config: EnvironmentConfig): {
    cwd: string;
    env: NodeJS.ProcessEnv;
  } {
    // Prepare working directory
    const cwd = config.workingDirectory
      ? path.resolve(config.workingDirectory)
      : process.cwd();

    // Validate directory exists
    if (!fs.existsSync(cwd)) {
      throw new Error(`Working directory does not exist: ${cwd}`);
    }

    // Prepare environment variables
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ...config.environmentVariables,
    };

    // Extend PATH if needed
    if (config.pathExtensions?.length) {
      const currentPath = env.PATH || env.Path || '';
      const additionalPaths = config.pathExtensions.map(p => path.resolve(p));
      env.PATH = [currentPath, ...additionalPaths].join(path.delimiter);
    }

    // Set Node.js options
    if (config.nodeOptions?.length) {
      env.NODE_OPTIONS = (env.NODE_OPTIONS || '') + ' ' + config.nodeOptions.join(' ');
    }

    return { cwd, env };
  }
}
```

## Communication Patterns

### JSON-Based IPC Communication

```typescript
interface IPCMessage {
  id: string;
  type: 'request' | 'response' | 'error' | 'progress';
  payload: any;
  timestamp: number;
}

class IPCCommunicator {
  private messageHandlers = new Map<string, (message: IPCMessage) => void>();
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(private childProcess: ChildProcess) {
    this.setupMessageHandling();
  }

  private setupMessageHandling() {
    this.childProcess.on('message', (rawMessage) => {
      try {
        const message: IPCMessage = typeof rawMessage === 'string'
          ? JSON.parse(rawMessage)
          : rawMessage;

        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse IPC message:', error);
      }
    });
  }

  async sendRequest<T>(type: string, payload: any, timeout = 30000): Promise<T> {
    const messageId = this.generateMessageId();

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new Error(`IPC request timeout after ${timeout}ms`));
      }, timeout);

      // Store pending request
      this.pendingRequests.set(messageId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      // Send message
      const message: IPCMessage = {
        id: messageId,
        type: 'request',
        payload: { type, data: payload },
        timestamp: Date.now(),
      };

      this.childProcess.send!(message);
    });
  }

  private handleMessage(message: IPCMessage) {
    const pending = this.pendingRequests.get(message.id);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(message.id);

      if (message.type === 'response') {
        pending.resolve(message.payload);
      } else if (message.type === 'error') {
        pending.reject(new Error(message.payload.message || 'IPC request failed'));
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Output Parsing and Streaming

```typescript
interface ParsedOutput {
  logs: LogEntry[];
  progress: ProgressUpdate[];
  results: any[];
  errors: ErrorEntry[];
}

class OutputParser {
  private logPattern = /^\[(.*?)\] (DEBUG|INFO|WARN|ERROR): (.*)$/;
  private progressPattern = /^PROGRESS: (\d+)\/(\d+) - (.*)$/;
  private resultPattern = /^RESULT: (.*)$/;

  parseStreamingOutput(data: string): ParsedOutput {
    const lines = data.split('\n').filter(line => line.trim());
    const parsed: ParsedOutput = {
      logs: [],
      progress: [],
      results: [],
      errors: [],
    };

    for (const line of lines) {
      this.parseLine(line, parsed);
    }

    return parsed;
  }

  private parseLine(line: string, parsed: ParsedOutput) {
    // Parse log entries
    const logMatch = line.match(this.logPattern);
    if (logMatch) {
      parsed.logs.push({
        timestamp: new Date(logMatch[1]),
        level: logMatch[2] as LogLevel,
        message: logMatch[3],
      });
      return;
    }

    // Parse progress updates
    const progressMatch = line.match(this.progressPattern);
    if (progressMatch) {
      parsed.progress.push({
        current: parseInt(progressMatch[1]),
        total: parseInt(progressMatch[2]),
        message: progressMatch[3],
        percentage: (parseInt(progressMatch[1]) / parseInt(progressMatch[2])) * 100,
      });
      return;
    }

    // Parse results
    const resultMatch = line.match(this.resultPattern);
    if (resultMatch) {
      try {
        parsed.results.push(JSON.parse(resultMatch[1]));
      } catch (error) {
        parsed.results.push(resultMatch[1]);
      }
      return;
    }

    // Treat unmatched lines as potential errors
    if (line.includes('ERROR') || line.includes('Exception') || line.includes('Failed')) {
      parsed.errors.push({
        message: line,
        timestamp: new Date(),
      });
    }
  }
}
```

### Progress Reporting and Cancellation

```typescript
interface CancellableProcess {
  process: ChildProcess;
  cancellationToken: CancellationToken;
  progressCallback?: (progress: ProgressUpdate) => void;
}

class CancellationToken {
  private _isCancelled = false;
  private _callbacks: (() => void)[] = [];

  get isCancelled(): boolean {
    return this._isCancelled;
  }

  cancel(): void {
    if (!this._isCancelled) {
      this._isCancelled = true;
      this._callbacks.forEach(callback => callback());
    }
  }

  onCancellation(callback: () => void): void {
    if (this._isCancelled) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
  }
}

class CancellableProcessExecutor {
  async executeWithCancellation(
    scriptPath: string,
    config: ProcessConfig,
    progressCallback?: (progress: ProgressUpdate) => void
  ): Promise<{ result: ProcessResult; cancellationToken: CancellationToken }> {
    const cancellationToken = new CancellationToken();

    const childProcess = spawn('ts-node', [scriptPath, ...(config.args || [])], {
      cwd: config.cwd,
      env: config.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Set up cancellation
    cancellationToken.onCancellation(() => {
      if (!childProcess.killed) {
        childProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
      }
    });

    // Set up progress monitoring
    if (progressCallback) {
      const parser = new OutputParser();
      childProcess.stdout?.on('data', (data) => {
        const parsed = parser.parseStreamingOutput(data.toString());
        parsed.progress.forEach(progressCallback);
      });
    }

    const result = await this.handleProcessExecution(childProcess, config);
    return { result, cancellationToken };
  }
}
```

## Error Handling

### Comprehensive Error Capture

```typescript
// Custom error classes
class ProcessExecutionError extends Error {
  constructor(message: string, public processResult?: ProcessResult) {
    super(message);
    this.name = 'ProcessExecutionError';
  }
}

class ProcessSpawnError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message);
    this.name = 'ProcessSpawnError';
  }
}

class ProcessTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessTimeoutError';
  }
}

// Error handler with comprehensive capture
class ProcessErrorHandler {
  static async handleProcessExecution(
    childProcess: ChildProcess,
    config: ProcessConfig
  ): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const startTime = Date.now();

      // Capture all output streams
      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle various exit scenarios
      childProcess.on('exit', (code, signal) => {
        const executionTime = Date.now() - startTime;
        const result: ProcessResult = {
          processId: childProcess.pid!.toString(),
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          executionTime,
          success: code === 0,
        };

        if (code === 0) {
          resolve(result);
        } else {
          const errorMessage = this.buildErrorMessage(code, signal, stderr);
          reject(new ProcessExecutionError(errorMessage, result));
        }
      });

      // Handle spawn errors
      childProcess.on('error', (error) => {
        reject(new ProcessSpawnError(
          `Failed to spawn process: ${error.message}`,
          error
        ));
      });

      // Handle disconnect (for IPC processes)
      childProcess.on('disconnect', () => {
        console.warn('Process disconnected from IPC channel');
      });
    });
  }

  private static buildErrorMessage(
    code: number | null,
    signal: NodeJS.Signals | null,
    stderr: string
  ): string {
    let message = `Process failed with exit code ${code}`;

    if (signal) {
      message += ` (killed by signal: ${signal})`;
    }

    if (stderr.trim()) {
      message += `\nStderr: ${stderr.trim()}`;
    }

    return message;
  }
}
```

### Graceful Failure Handling

```typescript
interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

class ResilientProcessExecutor {
  async executeWithRetry(
    scriptPath: string,
    config: ProcessConfig,
    retryConfig: RetryConfig = {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      retryableErrors: ['ENOENT', 'EACCES', 'EAGAIN'],
    }
  ): Promise<ProcessResult> {
    let lastError: Error;
    let delayMs = retryConfig.delayMs;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await this.executeProcess(scriptPath, config);
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (!this.isRetryableError(error, retryConfig.retryableErrors)) {
          throw error;
        }

        if (attempt < retryConfig.maxAttempts) {
          console.warn(`Process execution attempt ${attempt} failed, retrying in ${delayMs}ms...`);
          await this.delay(delayMs);
          delayMs *= retryConfig.backoffMultiplier;
        }
      }
    }

    throw new Error(`Process execution failed after ${retryConfig.maxAttempts} attempts. Last error: ${lastError.message}`);
  }

  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorCode = (error as any).code;
    return retryableErrors.includes(errorCode) ||
           error instanceof ProcessTimeoutError ||
           (error instanceof ProcessExecutionError && (error.processResult?.exitCode || 0) > 128);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Resource Cleanup

```typescript
class ResourceManager {
  private activeProcesses = new Set<ChildProcess>();
  private tempFiles = new Set<string>();
  private cleanupHandlers: (() => void)[] = [];

  constructor() {
    this.setupGracefulShutdown();
  }

  registerProcess(process: ChildProcess): void {
    this.activeProcesses.add(process);

    process.on('exit', () => {
      this.activeProcesses.delete(process);
    });
  }

  registerTempFile(filePath: string): void {
    this.tempFiles.add(filePath);
  }

  registerCleanupHandler(handler: () => void): void {
    this.cleanupHandlers.push(handler);
  }

  async cleanup(): Promise<void> {
    // Kill active processes
    const killPromises = Array.from(this.activeProcesses).map(process => {
      return this.killProcessGracefully(process);
    });

    await Promise.allSettled(killPromises);

    // Clean up temporary files
    for (const filePath of this.tempFiles) {
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${filePath}:`, error);
      }
    }

    // Run custom cleanup handlers
    this.cleanupHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.warn('Cleanup handler failed:', error);
      }
    });

    this.activeProcesses.clear();
    this.tempFiles.clear();
  }

  private async killProcessGracefully(process: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      if (process.killed) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        process.kill('SIGKILL');
        resolve();
      }, 5000);

      process.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      process.kill('SIGTERM');
    });
  }

  private setupGracefulShutdown(): void {
    const shutdownHandler = async (signal: string) => {
      console.log(`Received ${signal}, cleaning up...`);
      await this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await this.cleanup();
      process.exit(1);
    });
  }
}
```

## Security Considerations

### Input Sanitization and Validation

```typescript
class SecurityManager {
  private static readonly ALLOWED_COMMANDS = [
    'ts-node',
    'node',
    'npm',
    'yarn',
  ];

  private static readonly DANGEROUS_PATTERNS = [
    /[;&|`$()]/,  // Shell injection characters
    /\.\.\//, // Directory traversal
    /^\//, // Absolute paths (depending on context)
  ];

  static validateScriptPath(scriptPath: string): string {
    // Normalize and resolve path
    const normalizedPath = path.normalize(scriptPath);
    const resolvedPath = path.resolve(normalizedPath);

    // Ensure path is within allowed directory
    const allowedBasePath = path.resolve('./');
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new SecurityError(`Script path outside allowed directory: ${resolvedPath}`);
    }

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(scriptPath)) {
        throw new SecurityError(`Dangerous pattern detected in script path: ${scriptPath}`);
      }
    }

    // Verify file exists and is readable
    if (!fs.existsSync(resolvedPath)) {
      throw new SecurityError(`Script file does not exist: ${resolvedPath}`);
    }

    return resolvedPath;
  }

  static sanitizeArguments(args: string[]): string[] {
    return args.map(arg => {
      // Remove or escape dangerous characters
      const sanitized = arg.replace(/[;&|`$()]/g, '');

      // Validate against dangerous patterns
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(sanitized)) {
          throw new SecurityError(`Dangerous pattern in argument: ${arg}`);
        }
      }

      return sanitized;
    });
  }

  static sanitizeEnvironment(env: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(env)) {
      // Validate key name
      if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
        throw new SecurityError(`Invalid environment variable name: ${key}`);
      }

      // Sanitize value
      sanitized[key] = value.replace(/[`$()]/g, '');
    }

    return sanitized;
  }
}

class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
```

### Process Isolation and Sandboxing

```typescript
interface SandboxConfig {
  allowedPaths: string[];
  blockedPaths: string[];
  maxMemoryMB: number;
  maxCpuPercent: number;
  networkAccess: boolean;
  tempDirectory?: string;
}

class ProcessSandbox {
  constructor(private config: SandboxConfig) {}

  async executeInSandbox(
    scriptPath: string,
    processConfig: ProcessConfig
  ): Promise<ProcessResult> {
    const sandboxedConfig = await this.applySandboxing(processConfig);
    const resourceLimiter = new ResourceLimiter(this.config);

    try {
      const process = spawn('ts-node', [scriptPath, ...(sandboxedConfig.args || [])], {
        ...sandboxedConfig,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Apply resource limits
      await resourceLimiter.applyLimits(process);

      // Monitor resource usage
      const monitor = new ResourceMonitor(process, this.config);
      monitor.startMonitoring();

      const result = await this.handleProcessExecution(process, sandboxedConfig);

      monitor.stopMonitoring();
      return result;

    } catch (error) {
      throw new SandboxExecutionError(`Sandboxed execution failed: ${error.message}`, error);
    }
  }

  private async applySandboxing(config: ProcessConfig): Promise<ProcessConfig> {
    const sandboxedEnv = {
      ...config.env,
      // Remove dangerous environment variables
      PATH: this.buildSafePath(config.env?.PATH),
      // Limit temp directory access
      TMPDIR: this.config.tempDirectory || '/tmp/sandbox',
    };

    // Remove network access if disabled
    if (!this.config.networkAccess) {
      // This would typically involve network namespace isolation
      // or using tools like firejail, docker, etc.
    }

    return {
      ...config,
      env: sandboxedEnv,
      cwd: this.validateWorkingDirectory(config.cwd),
    };
  }

  private buildSafePath(originalPath?: string): string {
    const safePaths = [
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      path.resolve('./node_modules/.bin'),
    ];

    return safePaths.join(path.delimiter);
  }

  private validateWorkingDirectory(cwd?: string): string {
    const workingDir = cwd || process.cwd();
    const resolvedDir = path.resolve(workingDir);

    // Check if directory is in allowed paths
    const isAllowed = this.config.allowedPaths.some(allowedPath =>
      resolvedDir.startsWith(path.resolve(allowedPath))
    );

    if (!isAllowed) {
      throw new SecurityError(`Working directory not allowed: ${resolvedDir}`);
    }

    // Check if directory is blocked
    const isBlocked = this.config.blockedPaths.some(blockedPath =>
      resolvedDir.startsWith(path.resolve(blockedPath))
    );

    if (isBlocked) {
      throw new SecurityError(`Working directory is blocked: ${resolvedDir}`);
    }

    return resolvedDir;
  }
}

class SandboxExecutionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'SandboxExecutionError';
  }
}
```

### Environment Variable Security

```typescript
class SecureEnvironmentManager {
  private static readonly SENSITIVE_VARS = [
    'PASSWORD',
    'SECRET',
    'KEY',
    'TOKEN',
    'CREDENTIAL',
  ];

  private static readonly READONLY_VARS = [
    'HOME',
    'USER',
    'SHELL',
  ];

  static createSecureEnvironment(
    baseEnv: Record<string, string>,
    additionalVars: Record<string, string> = {}
  ): NodeJS.ProcessEnv {
    const secureEnv: NodeJS.ProcessEnv = {};

    // Copy safe base environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (this.isSafeEnvironmentVariable(key)) {
        secureEnv[key] = value;
      }
    }

    // Add validated additional variables
    for (const [key, value] of Object.entries(additionalVars)) {
      SecurityManager.validateEnvironmentVariable(key, value);
      secureEnv[key] = value;
    }

    return secureEnv;
  }

  private static isSafeEnvironmentVariable(key: string): boolean {
    const upperKey = key.toUpperCase();

    // Skip sensitive variables
    if (this.SENSITIVE_VARS.some(pattern => upperKey.includes(pattern))) {
      return false;
    }

    // Allow known safe variables
    const safeVars = [
      'PATH', 'NODE_OPTIONS', 'NODE_ENV',
      'HOME', 'USER', 'SHELL',
      'LANG', 'LC_ALL', 'TZ',
    ];

    return safeVars.includes(upperKey) || upperKey.startsWith('npm_');
  }

  static maskSensitiveOutput(output: string): string {
    const patterns = [
      /password[=:]\s*\S+/gi,
      /secret[=:]\s*\S+/gi,
      /key[=:]\s*\S+/gi,
      /token[=:]\s*\S+/gi,
      /Bearer\s+\S+/gi,
      /Authorization:\s*\S+/gi,
    ];

    let maskedOutput = output;
    patterns.forEach(pattern => {
      maskedOutput = maskedOutput.replace(pattern, '[REDACTED]');
    });

    return maskedOutput;
  }
}
```

## Performance Optimization

### Process Pooling and Reuse

```typescript
interface PoolConfig {
  minSize: number;
  maxSize: number;
  maxAge: number; // milliseconds
  idleTimeout: number; // milliseconds
  warmupScript?: string;
}

class ProcessPool {
  private availableProcesses: PooledProcess[] = [];
  private busyProcesses: Map<string, PooledProcess> = new Map();
  private poolConfig: PoolConfig;

  constructor(config: PoolConfig) {
    this.poolConfig = {
      minSize: 2,
      maxSize: 10,
      maxAge: 30 * 60 * 1000, // 30 minutes
      idleTimeout: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    this.initializePool();
    this.startMaintenanceTimer();
  }

  async acquireProcess(): Promise<PooledProcess> {
    // Try to get from available pool
    let pooledProcess = this.availableProcesses.pop();

    if (!pooledProcess) {
      // Create new process if under max size
      if (this.getTotalProcesses() < this.poolConfig.maxSize) {
        pooledProcess = await this.createNewProcess();
      } else {
        // Wait for a process to become available
        pooledProcess = await this.waitForAvailableProcess();
      }
    }

    // Move to busy pool
    this.busyProcesses.set(pooledProcess.id, pooledProcess);
    pooledProcess.lastUsed = Date.now();

    return pooledProcess;
  }

  releaseProcess(processId: string): void {
    const pooledProcess = this.busyProcesses.get(processId);
    if (!pooledProcess) return;

    this.busyProcesses.delete(processId);

    // Check if process should be retired
    if (this.shouldRetireProcess(pooledProcess)) {
      this.retireProcess(pooledProcess);
    } else {
      this.availableProcesses.push(pooledProcess);
    }
  }

  private async createNewProcess(): Promise<PooledProcess> {
    const process = fork('./process-worker.js', [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      cwd: process.cwd(),
    });

    const pooledProcess: PooledProcess = {
      id: this.generateProcessId(),
      process,
      created: Date.now(),
      lastUsed: Date.now(),
      usageCount: 0,
    };

    // Warm up process if configured
    if (this.poolConfig.warmupScript) {
      await this.warmupProcess(pooledProcess);
    }

    return pooledProcess;
  }

  private shouldRetireProcess(pooledProcess: PooledProcess): boolean {
    const now = Date.now();
    const age = now - pooledProcess.created;
    const idleTime = now - pooledProcess.lastUsed;

    return age > this.poolConfig.maxAge ||
           idleTime > this.poolConfig.idleTimeout ||
           pooledProcess.process.killed;
  }

  private getTotalProcesses(): number {
    return this.availableProcesses.length + this.busyProcesses.size;
  }
}

interface PooledProcess {
  id: string;
  process: ChildProcess;
  created: number;
  lastUsed: number;
  usageCount: number;
}
```

### Memory Management and Resource Monitoring

```typescript
class ResourceMonitor {
  private monitoringInterval?: NodeJS.Timeout;
  private resourceUsage: ResourceUsageData[] = [];

  constructor(
    private process: ChildProcess,
    private limits: ResourceLimits
  ) {}

  startMonitoring(intervalMs = 1000): void {
    this.monitoringInterval = setInterval(() => {
      this.checkResourceUsage();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private async checkResourceUsage(): Promise<void> {
    if (!this.process.pid || this.process.killed) {
      this.stopMonitoring();
      return;
    }

    try {
      const usage = await this.getProcessResourceUsage(this.process.pid);
      this.resourceUsage.push(usage);

      // Enforce limits
      if (usage.memoryMB > this.limits.maxMemoryMB) {
        throw new ResourceLimitError(`Memory limit exceeded: ${usage.memoryMB}MB > ${this.limits.maxMemoryMB}MB`);
      }

      if (usage.cpuPercent > this.limits.maxCpuPercent) {
        console.warn(`CPU usage high: ${usage.cpuPercent}% > ${this.limits.maxCpuPercent}%`);
      }

    } catch (error) {
      if (error instanceof ResourceLimitError) {
        this.process.kill('SIGTERM');
        throw error;
      }
    }
  }

  private async getProcessResourceUsage(pid: number): Promise<ResourceUsageData> {
    return new Promise((resolve, reject) => {
      const psProcess = spawn('ps', ['-p', pid.toString(), '-o', 'pid,pcpu,pmem,rss,vsz'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      psProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      psProcess.on('exit', (code) => {
        if (code === 0) {
          const usage = this.parseProcessStats(output);
          resolve(usage);
        } else {
          reject(new Error(`Failed to get process stats for PID ${pid}`));
        }
      });
    });
  }

  private parseProcessStats(output: string): ResourceUsageData {
    const lines = output.trim().split('\n');
    const dataLine = lines[1]; // Skip header
    const [pid, cpuPercent, memPercent, rss, vsz] = dataLine.trim().split(/\s+/);

    return {
      pid: parseInt(pid),
      cpuPercent: parseFloat(cpuPercent),
      memoryPercent: parseFloat(memPercent),
      memoryMB: parseInt(rss) / 1024, // RSS is in KB
      virtualMemoryMB: parseInt(vsz) / 1024, // VSZ is in KB
      timestamp: Date.now(),
    };
  }

  getResourceHistory(): ResourceUsageData[] {
    return [...this.resourceUsage];
  }
}

interface ResourceUsageData {
  pid: number;
  cpuPercent: number;
  memoryPercent: number;
  memoryMB: number;
  virtualMemoryMB: number;
  timestamp: number;
}

interface ResourceLimits {
  maxMemoryMB: number;
  maxCpuPercent: number;
}

class ResourceLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceLimitError';
  }
}
```

### Concurrent Subprocess Management

```typescript
class ConcurrentProcessManager {
  private executionQueue = new PriorityQueue<ProcessTask>();
  private runningTasks = new Map<string, ProcessExecution>();
  private maxConcurrency: number;

  constructor(maxConcurrency = 4) {
    this.maxConcurrency = maxConcurrency;
  }

  async executeParallel<T>(
    tasks: ProcessTask[],
    options: ParallelExecutionOptions = {}
  ): Promise<ProcessTaskResult<T>[]> {
    const {
      failFast = false,
      timeout = 300000, // 5 minutes
      priority = 0,
    } = options;

    // Add tasks to queue with priority
    const taskPromises = tasks.map(task => {
      const taskId = this.generateTaskId();
      const prioritizedTask = { ...task, id: taskId, priority };

      return this.scheduleTask<T>(prioritizedTask, timeout);
    });

    if (failFast) {
      return Promise.all(taskPromises);
    } else {
      const results = await Promise.allSettled(taskPromises);
      return results.map((result, index) => ({
        taskId: tasks[index].id || `task_${index}`,
        success: result.status === 'fulfilled',
        result: result.status === 'fulfilled' ? result.value : undefined,
        error: result.status === 'rejected' ? result.reason : undefined,
      }));
    }
  }

  private async scheduleTask<T>(
    task: ProcessTask,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedTask: ProcessTask = {
        ...task,
        resolve: resolve as any,
        reject: reject as any,
        timeout,
        queuedAt: Date.now(),
      };

      this.executionQueue.enqueue(queuedTask);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.runningTasks.size >= this.maxConcurrency || this.executionQueue.isEmpty()) {
      return;
    }

    const task = this.executionQueue.dequeue()!;
    const execution = this.executeTask(task);

    this.runningTasks.set(task.id!, execution);

    try {
      const result = await execution.promise;
      task.resolve!(result);
    } catch (error) {
      task.reject!(error);
    } finally {
      this.runningTasks.delete(task.id!);
      // Process next task in queue
      setImmediate(() => this.processQueue());
    }
  }

  private executeTask(task: ProcessTask): ProcessExecution {
    const startTime = Date.now();
    const timeoutHandle = setTimeout(() => {
      if (execution.process && !execution.process.killed) {
        execution.process.kill('SIGTERM');
        task.reject!(new ProcessTimeoutError(`Task ${task.id} timed out after ${task.timeout}ms`));
      }
    }, task.timeout!);

    const processPromise = this.spawnProcess(task)
      .then(result => {
        clearTimeout(timeoutHandle);
        return result;
      })
      .catch(error => {
        clearTimeout(timeoutHandle);
        throw error;
      });

    const execution: ProcessExecution = {
      taskId: task.id!,
      promise: processPromise,
      startedAt: startTime,
    };

    return execution;
  }

  private async spawnProcess(task: ProcessTask): Promise<any> {
    const childProcess = spawn('ts-node', [task.scriptPath, ...(task.args || [])], {
      cwd: task.cwd,
      env: task.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return ProcessErrorHandler.handleProcessExecution(childProcess, task);
  }
}

interface ProcessTask {
  id?: string;
  scriptPath: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  priority?: number;
  timeout?: number;
  queuedAt?: number;
  resolve?: (value: any) => void;
  reject?: (error: any) => void;
}

interface ProcessExecution {
  taskId: string;
  promise: Promise<any>;
  process?: ChildProcess;
  startedAt: number;
}

interface ProcessTaskResult<T> {
  taskId: string;
  success: boolean;
  result?: T;
  error?: any;
}

interface ParallelExecutionOptions {
  failFast?: boolean;
  timeout?: number;
  priority?: number;
}
```

## Production Examples

### Omega Workflow Integration

```typescript
// omega-workflow-bridge.ts
interface OmegaWorkflowConfig {
  scriptPath: string;
  workingDirectory: string;
  timeout: number;
  resourceLimits: ResourceLimits;
}

class OmegaWorkflowBridge {
  private processManager: ResilientProcessExecutor;
  private resourceManager: ResourceManager;
  private securityManager: SecurityManager;

  constructor(private config: OmegaWorkflowConfig) {
    this.processManager = new ResilientProcessExecutor();
    this.resourceManager = new ResourceManager();
    this.securityManager = new SecurityManager();
  }

  async executeWorkflow(
    workflowType: string,
    parameters: WorkflowParameters,
    options: ExecutionOptions = {}
  ): Promise<WorkflowResult> {
    try {
      // Validate and sanitize inputs
      const validatedParams = this.validateWorkflowParameters(parameters);
      const sanitizedArgs = SecurityManager.sanitizeArguments([
        '--workflow', workflowType,
        '--params', JSON.stringify(validatedParams),
        '--output-format', 'json',
      ]);

      // Prepare secure execution environment
      const processConfig: ProcessConfig = {
        args: sanitizedArgs,
        cwd: this.config.workingDirectory,
        env: SecureEnvironmentManager.createSecureEnvironment(
          process.env as Record<string, string>,
          options.environmentVariables || {}
        ),
        timeout: options.timeout || this.config.timeout,
      };

      // Execute with monitoring and resource limits
      const execution = await this.executeWithMonitoring(processConfig);

      // Parse and validate result
      const result = this.parseWorkflowResult(execution.stdout);

      return {
        success: true,
        result,
        executionTime: execution.executionTime,
        processId: execution.processId,
      };

    } catch (error) {
      throw new OmegaWorkflowError(`Workflow execution failed: ${error.message}`, error);
    }
  }

  private async executeWithMonitoring(
    config: ProcessConfig
  ): Promise<ProcessResult> {
    const sandbox = new ProcessSandbox({
      allowedPaths: [this.config.workingDirectory],
      blockedPaths: ['/etc', '/usr', '/var'],
      maxMemoryMB: this.config.resourceLimits.maxMemoryMB,
      maxCpuPercent: this.config.resourceLimits.maxCpuPercent,
      networkAccess: false,
    });

    return sandbox.executeInSandbox(this.config.scriptPath, config);
  }

  private validateWorkflowParameters(parameters: WorkflowParameters): WorkflowParameters {
    const requiredFields = ['inputPath', 'outputPath'];

    for (const field of requiredFields) {
      if (!(field in parameters)) {
        throw new ValidationError(`Missing required parameter: ${field}`);
      }
    }

    // Validate file paths
    if (parameters.inputPath && !this.isValidFilePath(parameters.inputPath)) {
      throw new ValidationError(`Invalid input path: ${parameters.inputPath}`);
    }

    if (parameters.outputPath && !this.isValidFilePath(parameters.outputPath)) {
      throw new ValidationError(`Invalid output path: ${parameters.outputPath}`);
    }

    return parameters;
  }

  private isValidFilePath(filePath: string): boolean {
    try {
      const resolvedPath = path.resolve(filePath);
      const workingDir = path.resolve(this.config.workingDirectory);

      // Ensure path is within working directory
      return resolvedPath.startsWith(workingDir);
    } catch {
      return false;
    }
  }

  private parseWorkflowResult(stdout: string): any {
    try {
      // Look for JSON result markers
      const resultMatch = stdout.match(/RESULT_START\n(.*?)\nRESULT_END/s);
      if (resultMatch) {
        return JSON.parse(resultMatch[1]);
      }

      // Fallback to parsing entire stdout as JSON
      return JSON.parse(stdout);
    } catch {
      throw new ResultParsingError(`Failed to parse workflow result from stdout: ${stdout.slice(0, 200)}...`);
    }
  }
}

interface WorkflowParameters {
  inputPath: string;
  outputPath: string;
  [key: string]: any;
}

interface WorkflowResult {
  success: boolean;
  result: any;
  executionTime: number;
  processId: string;
}

interface ExecutionOptions {
  timeout?: number;
  environmentVariables?: Record<string, string>;
}

class OmegaWorkflowError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'OmegaWorkflowError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ResultParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResultParsingError';
  }
}
```

### Express.js API Integration

```typescript
// api-routes.ts
import express from 'express';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();
const omegaBridge = new OmegaWorkflowBridge({
  scriptPath: path.resolve('./omega-workflow/main.ts'),
  workingDirectory: path.resolve('./omega-workflow'),
  timeout: 300000, // 5 minutes
  resourceLimits: {
    maxMemoryMB: 1024,
    maxCpuPercent: 80,
  },
});

// Execute workflow endpoint
router.post('/workflow/:type/execute',
  [
    param('type').isIn(['video-generation', 'image-processing', 'data-analysis']),
    body('parameters').isObject(),
    body('parameters.inputPath').isString().notEmpty(),
    body('parameters.outputPath').isString().notEmpty(),
  ],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { type } = req.params;
      const { parameters, options = {} } = req.body;

      // Execute workflow
      const result = await omegaBridge.executeWorkflow(type, parameters, {
        timeout: options.timeout || 300000,
        environmentVariables: options.env || {},
      });

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      next(error);
    }
  }
);

// Batch workflow execution
router.post('/workflow/batch',
  [
    body('workflows').isArray({ min: 1, max: 10 }),
    body('workflows.*.type').isString(),
    body('workflows.*.parameters').isObject(),
  ],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { workflows, options = {} } = req.body;
      const concurrentManager = new ConcurrentProcessManager(4); // Max 4 parallel workflows

      const tasks: ProcessTask[] = workflows.map((workflow: any, index: number) => ({
        id: `batch_${Date.now()}_${index}`,
        scriptPath: omegaBridge.config.scriptPath,
        args: [
          '--workflow', workflow.type,
          '--params', JSON.stringify(workflow.parameters),
          '--output-format', 'json',
        ],
        cwd: omegaBridge.config.workingDirectory,
        priority: workflow.priority || 0,
      }));

      const results = await concurrentManager.executeParallel(tasks, {
        failFast: options.failFast || false,
        timeout: options.timeout || 300000,
      });

      res.json({
        success: true,
        results: results.map((result, index) => ({
          workflowId: workflows[index].id || `workflow_${index}`,
          ...result,
        })),
      });

    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Workflow execution error:', error);

  let statusCode = 500;
  let errorType = 'InternalError';

  if (error instanceof ValidationError) {
    statusCode = 400;
    errorType = 'ValidationError';
  } else if (error instanceof SecurityError) {
    statusCode = 403;
    errorType = 'SecurityError';
  } else if (error instanceof ProcessTimeoutError) {
    statusCode = 408;
    errorType = 'TimeoutError';
  } else if (error instanceof ResourceLimitError) {
    statusCode = 413;
    errorType = 'ResourceLimitError';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.originalError,
      }),
    },
  });
});

export default router;
```

### Real-time Progress Monitoring

```typescript
// websocket-progress.ts
import WebSocket from 'ws';
import { EventEmitter } from 'events';

interface ProgressUpdate {
  taskId: string;
  progress: number;
  message: string;
  stage: string;
  timestamp: number;
}

class WorkflowProgressMonitor extends EventEmitter {
  private activeWorkflows = new Map<string, WebSocket[]>();

  async executeWithProgress(
    workflowId: string,
    workflowType: string,
    parameters: WorkflowParameters
  ): Promise<WorkflowResult> {
    const progressCallback = (progress: ProgressUpdate) => {
      this.broadcastProgress(workflowId, progress);
    };

    // Execute with progress monitoring
    const cancellableExecutor = new CancellableProcessExecutor();
    const { result, cancellationToken } = await cancellableExecutor.executeWithCancellation(
      './omega-workflow/main.ts',
      {
        args: [
          '--workflow', workflowType,
          '--params', JSON.stringify(parameters),
          '--progress-mode', 'websocket',
          '--workflow-id', workflowId,
        ],
        cwd: './omega-workflow',
      },
      progressCallback
    );

    // Store cancellation token for potential cancellation
    this.emit('workflow-started', { workflowId, cancellationToken });

    return result;
  }

  subscribeToProgress(workflowId: string, ws: WebSocket): void {
    if (!this.activeWorkflows.has(workflowId)) {
      this.activeWorkflows.set(workflowId, []);
    }

    this.activeWorkflows.get(workflowId)!.push(ws);

    // Clean up on disconnect
    ws.on('close', () => {
      this.unsubscribeFromProgress(workflowId, ws);
    });
  }

  unsubscribeFromProgress(workflowId: string, ws: WebSocket): void {
    const subscribers = this.activeWorkflows.get(workflowId);
    if (subscribers) {
      const index = subscribers.indexOf(ws);
      if (index > -1) {
        subscribers.splice(index, 1);
      }

      if (subscribers.length === 0) {
        this.activeWorkflows.delete(workflowId);
      }
    }
  }

  private broadcastProgress(workflowId: string, progress: ProgressUpdate): void {
    const subscribers = this.activeWorkflows.get(workflowId);
    if (!subscribers) return;

    const message = JSON.stringify({
      type: 'progress',
      workflowId,
      data: progress,
    });

    subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  cancelWorkflow(workflowId: string): void {
    this.emit('cancel-workflow', workflowId);
  }
}

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });
const progressMonitor = new WorkflowProgressMonitor();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'subscribe':
          progressMonitor.subscribeToProgress(message.workflowId, ws);
          ws.send(JSON.stringify({
            type: 'subscribed',
            workflowId: message.workflowId,
          }));
          break;

        case 'cancel':
          progressMonitor.cancelWorkflow(message.workflowId);
          ws.send(JSON.stringify({
            type: 'cancelled',
            workflowId: message.workflowId,
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`,
          }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON message',
      }));
    }
  });
});
```

## Key Resources and Documentation

### Node.js Official Documentation
- **Child Process Module**: https://nodejs.org/api/child_process.html
- **Process Module**: https://nodejs.org/api/process.html
- **Worker Threads**: https://nodejs.org/api/worker_threads.html

### TypeScript Integration
- **@types/node**: https://www.npmjs.com/package/@types/node
- **ts-node**: https://www.npmjs.com/package/ts-node
- **TypeScript Child Process Types**: Built into @types/node

### Security Best Practices
- **OWASP Process Injection**: https://owasp.org/www-community/attacks/Process_Injection
- **Node.js Security Guidelines**: https://nodejs.org/en/docs/guides/security/
- **Sandboxing Node.js Applications**: Various approaches using Docker, firejail, or similar tools

### Process Management Libraries
- **node-process-pool**: https://github.com/GeniusFunny/node-process-pool
- **process-pool**: https://www.npmjs.com/package/process-pool
- **execa**: https://www.npmjs.com/package/execa (Enhanced child_process)
- **tree-kill**: https://www.npmjs.com/package/tree-kill (Kill process trees)

### Performance Monitoring
- **pidusage**: https://www.npmjs.com/package/pidusage (Cross-platform process CPU and memory usage)
- **node-ps**: https://www.npmjs.com/package/node-ps (Process listing utilities)

### Error Handling Patterns
- **TypeScript Error Handling**: https://claritydev.net/blog/typescript-error-handling-and-defensive-programming
- **Result Pattern Implementation**: Various TypeScript Result/Either libraries

## Summary

This document provides comprehensive patterns for integrating TypeScript subprocess execution into Node.js applications. The patterns focus on:

1. **Robust Process Management** - Lifecycle management, timeout handling, and cleanup
2. **Secure Communication** - IPC channels, JSON messaging, and progress reporting
3. **Comprehensive Error Handling** - Custom error types, retry logic, and graceful failure
4. **Security-First Approach** - Input validation, process isolation, and environment security
5. **Performance Optimization** - Process pooling, resource monitoring, and concurrent execution
6. **Production-Ready Examples** - Complete integration examples with Express.js and WebSocket monitoring

These patterns enable calling external TypeScript applications (like the Omega Workflow system) from Node.js APIs without modifying existing working systems, while maintaining security, reliability, and performance.

---

**SmokeDev 🚬**