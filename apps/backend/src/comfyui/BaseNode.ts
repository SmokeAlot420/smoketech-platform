/**
 * Base Node Implementation
 *
 * Abstract base class for all ComfyUI-style nodes
 * Provides common functionality for validation, logging, cost tracking
 */

import {
  INode,
  NodeConfig,
  NodeExecutionContext,
  NodeExecutionResult,
  NodeSlot
} from './types/NodeConfig.js';

/**
 * Abstract Base Node
 * Extend this class to create new node types
 */
export abstract class BaseNode implements INode {
  config: NodeConfig;

  constructor(config: NodeConfig) {
    this.config = config;
  }

  /**
   * Execute the node (must be implemented by subclasses)
   */
  abstract execute(
    inputs: Record<string, any>,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult>;

  /**
   * Validate node configuration
   */
  validate(): string[] {
    const errors: string[] = [];

    // Validate node ID
    if (!this.config.id || this.config.id.trim() === '') {
      errors.push('Node ID is required');
    }

    // Validate node type
    if (!this.config.type) {
      errors.push('Node type is required');
    }

    // Validate inputs
    if (!this.config.inputs || !Array.isArray(this.config.inputs)) {
      errors.push('Node inputs must be an array');
    } else {
      this.config.inputs.forEach((input, idx) => {
        if (!input.name) {
          errors.push(`Input ${idx} is missing name`);
        }
        if (!input.type) {
          errors.push(`Input ${idx} (${input.name}) is missing type`);
        }
      });
    }

    // Validate outputs
    if (!this.config.outputs || !Array.isArray(this.config.outputs)) {
      errors.push('Node outputs must be an array');
    } else {
      this.config.outputs.forEach((output, idx) => {
        if (!output.name) {
          errors.push(`Output ${idx} is missing name`);
        }
        if (!output.type) {
          errors.push(`Output ${idx} (${output.name}) is missing type`);
        }
      });
    }

    // Validate input slot constraints
    this.config.inputs.forEach((input) => {
      const constraint = input.constraints;
      if (constraint) {
        if (constraint.min !== undefined && constraint.max !== undefined) {
          if (constraint.min > constraint.max) {
            errors.push(`Input ${input.name}: min (${constraint.min}) > max (${constraint.max})`);
          }
        }
      }
    });

    return errors;
  }

  /**
   * Estimate cost (default implementation returns 0)
   * Override in subclasses for accurate cost estimation
   */
  estimateCost(inputs: Record<string, any>): number {
    return 0;
  }

  /**
   * Validate input data against slot definitions
   */
  protected validateInputs(inputs: Record<string, any>): string[] {
    const errors: string[] = [];

    for (const slot of this.config.inputs) {
      const value = inputs[slot.name];

      // Check required inputs
      if (slot.required && (value === undefined || value === null)) {
        if (slot.defaultValue === undefined) {
          errors.push(`Required input '${slot.name}' is missing`);
        }
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const actualType = this.getValueType(value);
        if (actualType !== slot.type && slot.type !== 'object' && slot.type !== 'array') {
          errors.push(
            `Input '${slot.name}' has wrong type: expected ${slot.type}, got ${actualType}`
          );
        }
      }

      // Constraint validation
      if (slot.constraints && value !== undefined) {
        const { min, max, pattern, enum: enumValues } = slot.constraints;

        if (typeof value === 'number') {
          if (min !== undefined && value < min) {
            errors.push(`Input '${slot.name}' is below minimum: ${value} < ${min}`);
          }
          if (max !== undefined && value > max) {
            errors.push(`Input '${slot.name}' is above maximum: ${value} > ${max}`);
          }
        }

        if (typeof value === 'string') {
          if (pattern && !new RegExp(pattern).test(value)) {
            errors.push(`Input '${slot.name}' does not match pattern: ${pattern}`);
          }
        }

        if (enumValues && !enumValues.includes(value)) {
          errors.push(
            `Input '${slot.name}' is not in allowed values: ${enumValues.join(', ')}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Apply default values to inputs
   */
  protected applyDefaults(inputs: Record<string, any>): Record<string, any> {
    const withDefaults = { ...inputs };

    for (const slot of this.config.inputs) {
      if (withDefaults[slot.name] === undefined && slot.defaultValue !== undefined) {
        withDefaults[slot.name] = slot.defaultValue;
      }
    }

    return withDefaults;
  }

  /**
   * Get the type of a value
   */
  private getValueType(value: any): string {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'object';
    return typeof value;
  }

  /**
   * Helper: Create successful result
   */
  protected createSuccessResult(
    outputs: Record<string, any>,
    executionTime: number,
    cost: number = 0,
    metadata?: Record<string, any>
  ): NodeExecutionResult {
    return {
      success: true,
      outputs,
      executionTime,
      cost,
      metadata
    };
  }

  /**
   * Helper: Create error result
   */
  protected createErrorResult(
    error: string,
    executionTime: number
  ): NodeExecutionResult {
    return {
      success: false,
      outputs: {},
      executionTime,
      cost: 0,
      error
    };
  }

  /**
   * Helper: Log with context
   */
  protected log(
    context: NodeExecutionContext,
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    const logMessage = `[${this.config.type}:${this.config.id}] ${message}`;
    context.logger[level](logMessage, data);
  }

  /**
   * Helper: Update progress
   */
  protected updateProgress(
    context: NodeExecutionContext,
    percent: number,
    message?: string
  ): void {
    context.progress.update(percent, message);
  }

  /**
   * Helper: Track cost
   */
  protected trackCost(
    context: NodeExecutionContext,
    amount: number,
    description: string
  ): void {
    context.costTracker.addCost(amount, description);
  }

  /**
   * Helper: Send heartbeat (for long-running operations)
   */
  protected heartbeat(context: NodeExecutionContext): void {
    if (context.temporal?.heartbeat) {
      context.temporal.heartbeat();
    }
  }
}
