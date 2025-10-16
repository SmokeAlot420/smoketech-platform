/**
 * Structured Logger for Temporal Workflows
 *
 * Provides structured logging with log levels, context, and JSON output support.
 * Respects LOG_LEVEL environment variable for filtering.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  workflowId?: string;
  runId?: string;
  activityId?: string;
  nodeId?: string;
  model?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private jsonOutput: boolean;

  constructor() {
    // Read from environment
    const logLevelStr = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.minLevel = LogLevel[logLevelStr as keyof typeof LogLevel] || LogLevel.INFO;
    this.jsonOutput = process.env.LOG_FORMAT === 'json';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: LogLevel[level],
      message,
      context
    };

    if (error) {
      logEntry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    if (this.jsonOutput) {
      // JSON output for production/log aggregation
      console.log(JSON.stringify(logEntry));
    } else {
      // Human-readable output for development
      const levelEmoji = {
        [LogLevel.DEBUG]: '🔍',
        [LogLevel.INFO]: 'ℹ️ ',
        [LogLevel.WARN]: '⚠️ ',
        [LogLevel.ERROR]: '❌'
      };

      const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
      const errorStr = error ? `\n   Error: ${error.message}${error.stack ? '\n' + error.stack : ''}` : '';

      console.log(`${levelEmoji[level]} [${logEntry.timestamp}] ${message}${contextStr}${errorStr}`);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Create child logger with inherited context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level: LogLevel, message: string, childContext?: LogContext, error?: Error) => {
      const mergedContext = { ...context, ...childContext };
      originalLog(level, message, mergedContext, error);
    };

    return childLogger;
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
