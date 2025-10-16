/**
 * Workflow JSON Validator
 *
 * Validates ComfyUI workflow JSON structures with comprehensive error checking:
 * - JSON schema validation
 * - Node type validation
 * - Input/output connection validation
 * - Circular dependency detection
 * - User-friendly error messages
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'schema' | 'node' | 'connection' | 'circular' | 'input';
  message: string;
  path?: string;
  nodeId?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'performance' | 'cost' | 'compatibility';
  message: string;
  nodeId?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  inputs?: Record<string, any>;
  outputs?: string[];
}

export interface Workflow {
  workflowId: string;
  description?: string;
  metadata?: Record<string, any>;
  nodes: WorkflowNode[];
}

export interface ABTestDefinition {
  testId: string;
  description?: string;
  metadata?: Record<string, any>;
  variants: ABTestVariant[];
}

export interface ABTestVariant {
  variantId: string;
  workflowId: string;
  description?: string;
  nodes: WorkflowNode[];
}

// Supported node types and their valid inputs
const NODE_TYPE_SCHEMAS: Record<string, {
  requiredInputs: string[];
  optionalInputs: string[];
  outputs: string[];
  description: string;
}> = {
  character_image: {
    requiredInputs: ['characterPrompt', 'model'],
    optionalInputs: ['preserveFeatures', 'temperature', 'negativePrompt', 'seed'],
    outputs: ['characterImagePath'],
    description: 'Generates a character image using AI models'
  },
  video_generation: {
    requiredInputs: ['prompt', 'model'],
    optionalInputs: ['characterImagePath', 'duration', 'aspectRatio', 'seed', 'guidanceScale'],
    outputs: ['videoPath'],
    description: 'Generates video from text prompt and optional character image'
  },
  video_stitch: {
    requiredInputs: ['videoPaths'],
    optionalInputs: ['transitionType', 'transitionDuration', 'outputPath'],
    outputs: ['stitchedVideoPath'],
    description: 'Stitches multiple videos together with transitions'
  },
  audio_generation: {
    requiredInputs: ['text', 'voice'],
    optionalInputs: ['speed', 'pitch', 'emotion'],
    outputs: ['audioPath'],
    description: 'Generates audio from text using TTS'
  },
  video_enhance: {
    requiredInputs: ['videoPath'],
    optionalInputs: ['targetResolution', 'model', 'denoise'],
    outputs: ['enhancedVideoPath'],
    description: 'Enhances video quality using Topaz Video AI'
  }
};

// Valid model names for different node types
const VALID_MODELS: Record<string, string[]> = {
  character_image: ['nanobana', 'midjourney', 'dalle', 'imagen', 'stable-diffusion'],
  video_generation: ['veo3-fast', 'veo3-standard', 'sora-2', 'runway-gen3'],
  video_enhance: ['proteus', 'artemis']
};

export class WorkflowValidator {
  /**
   * Validate a standard workflow
   */
  validateWorkflow(workflow: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Step 1: Schema validation
    const schemaErrors = this.validateWorkflowSchema(workflow);
    errors.push(...schemaErrors);
    if (schemaErrors.length > 0) {
      return { valid: false, errors, warnings };
    }

    // Step 2: Node validation
    const nodeErrors = this.validateNodes(workflow.nodes);
    errors.push(...nodeErrors);

    // Step 3: Connection validation
    const connectionErrors = this.validateConnections(workflow.nodes);
    errors.push(...connectionErrors);

    // Step 4: Circular dependency detection
    const circularErrors = this.detectCircularDependencies(workflow.nodes);
    errors.push(...circularErrors);

    // Step 5: Performance and cost warnings
    const performanceWarnings = this.generateWarnings(workflow.nodes);
    warnings.push(...performanceWarnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate an A/B test definition
   */
  validateABTest(testDefinition: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Schema validation for A/B test
    if (!testDefinition.testId) {
      errors.push({
        type: 'schema',
        message: 'A/B test must have a testId',
        path: 'testId',
        suggestion: 'Add a unique testId like "test-veo3-comparison"'
      });
    }

    if (!testDefinition.variants || !Array.isArray(testDefinition.variants)) {
      errors.push({
        type: 'schema',
        message: 'A/B test must have a variants array',
        path: 'variants',
        suggestion: 'Add a variants array with at least 2 variants'
      });
    } else if (testDefinition.variants.length < 2) {
      errors.push({
        type: 'schema',
        message: 'A/B test must have at least 2 variants',
        path: 'variants',
        suggestion: 'Add more variants to compare different approaches'
      });
    }

    // Validate each variant as a workflow
    if (testDefinition.variants && Array.isArray(testDefinition.variants)) {
      testDefinition.variants.forEach((variant: ABTestVariant, index: number) => {
        if (!variant.variantId) {
          errors.push({
            type: 'schema',
            message: `Variant ${index} must have a variantId`,
            path: `variants[${index}].variantId`,
            suggestion: 'Add a unique variantId like "variant-a" or "veo3-fast"'
          });
        }

        if (!variant.workflowId) {
          errors.push({
            type: 'schema',
            message: `Variant ${index} must have a workflowId`,
            path: `variants[${index}].workflowId`,
            suggestion: 'Add a workflowId like "workflow-v1"'
          });
        }

        if (variant.nodes) {
          const nodeErrors = this.validateNodes(variant.nodes);
          nodeErrors.forEach(error => {
            error.path = `variants[${index}].${error.path}`;
            errors.push(error);
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate workflow schema structure
   */
  private validateWorkflowSchema(workflow: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!workflow) {
      errors.push({
        type: 'schema',
        message: 'Workflow cannot be null or undefined',
        suggestion: 'Provide a valid workflow object'
      });
      return errors;
    }

    if (!workflow.workflowId) {
      errors.push({
        type: 'schema',
        message: 'Workflow must have a workflowId',
        path: 'workflowId',
        suggestion: 'Add a unique workflowId like "workflow-v1" or "aria-video-generation"'
      });
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push({
        type: 'schema',
        message: 'Workflow must have a nodes array',
        path: 'nodes',
        suggestion: 'Add a nodes array containing workflow steps'
      });
    } else if (workflow.nodes.length === 0) {
      errors.push({
        type: 'schema',
        message: 'Workflow must have at least one node',
        path: 'nodes',
        suggestion: 'Add nodes to define what the workflow should do'
      });
    }

    return errors;
  }

  /**
   * Validate individual nodes
   */
  private validateNodes(nodes: WorkflowNode[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set<string>();

    nodes.forEach((node, index) => {
      const nodePath = `nodes[${index}]`;

      // Check required node fields
      if (!node.id) {
        errors.push({
          type: 'node',
          message: `Node at index ${index} must have an id`,
          path: `${nodePath}.id`,
          suggestion: 'Add a unique id like "character_image_1" or "video_gen_1"'
        });
      } else {
        // Check for duplicate IDs
        if (nodeIds.has(node.id)) {
          errors.push({
            type: 'node',
            message: `Duplicate node id: ${node.id}`,
            path: `${nodePath}.id`,
            nodeId: node.id,
            suggestion: 'Each node must have a unique id'
          });
        }
        nodeIds.add(node.id);
      }

      if (!node.type) {
        errors.push({
          type: 'node',
          message: `Node ${node.id || index} must have a type`,
          path: `${nodePath}.type`,
          nodeId: node.id,
          suggestion: 'Add a type like "character_image", "video_generation", or "video_stitch"'
        });
      } else {
        // Validate node type
        const schema = NODE_TYPE_SCHEMAS[node.type];
        if (!schema) {
          errors.push({
            type: 'node',
            message: `Unknown node type: ${node.type}`,
            path: `${nodePath}.type`,
            nodeId: node.id,
            suggestion: `Use one of: ${Object.keys(NODE_TYPE_SCHEMAS).join(', ')}`
          });
        } else {
          // Validate node inputs
          const inputErrors = this.validateNodeInputs(node, schema, nodePath);
          errors.push(...inputErrors);
        }
      }
    });

    return errors;
  }

  /**
   * Validate node inputs against schema
   */
  private validateNodeInputs(
    node: WorkflowNode,
    schema: typeof NODE_TYPE_SCHEMAS[string],
    nodePath: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!node.inputs) {
      if (schema.requiredInputs.length > 0) {
        errors.push({
          type: 'input',
          message: `Node ${node.id} missing required inputs`,
          path: `${nodePath}.inputs`,
          nodeId: node.id,
          suggestion: `Required: ${schema.requiredInputs.join(', ')}`
        });
      }
      return errors;
    }

    // Check required inputs
    schema.requiredInputs.forEach(inputName => {
      if (!(inputName in node.inputs!)) {
        errors.push({
          type: 'input',
          message: `Node ${node.id} missing required input: ${inputName}`,
          path: `${nodePath}.inputs.${inputName}`,
          nodeId: node.id,
          suggestion: `Add ${inputName} to the inputs object`
        });
      }
    });

    // Check for unknown inputs
    const allValidInputs = [...schema.requiredInputs, ...schema.optionalInputs];
    Object.keys(node.inputs).forEach(inputName => {
      if (!allValidInputs.includes(inputName)) {
        errors.push({
          type: 'input',
          message: `Node ${node.id} has unknown input: ${inputName}`,
          path: `${nodePath}.inputs.${inputName}`,
          nodeId: node.id,
          suggestion: `Valid inputs: ${allValidInputs.join(', ')}`
        });
      }
    });

    // Validate model names
    if ('model' in node.inputs!) {
      const validModels = VALID_MODELS[node.type];
      if (validModels && !validModels.includes(node.inputs!.model)) {
        errors.push({
          type: 'input',
          message: `Invalid model "${node.inputs!.model}" for ${node.type}`,
          path: `${nodePath}.inputs.model`,
          nodeId: node.id,
          suggestion: `Valid models: ${validModels.join(', ')}`
        });
      }
    }

    return errors;
  }

  /**
   * Validate connections between nodes
   */
  private validateConnections(nodes: WorkflowNode[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeOutputs = new Map<string, string[]>();

    // Build map of node outputs
    nodes.forEach(node => {
      const schema = NODE_TYPE_SCHEMAS[node.type];
      if (schema) {
        nodeOutputs.set(node.id, schema.outputs);
      }
    });

    // Validate input connections
    nodes.forEach((node, index) => {
      if (!node.inputs) return;

      Object.entries(node.inputs).forEach(([inputName, inputValue]) => {
        if (typeof inputValue === 'string' && inputValue.match(/\{\{(.+?)\}\}/)) {
          // Extract connection reference
          const match = inputValue.match(/\{\{(.+?)\.(.+?)\}\}/);
          if (!match) {
            errors.push({
              type: 'connection',
              message: `Invalid connection syntax in ${node.id}.${inputName}`,
              path: `nodes[${index}].inputs.${inputName}`,
              nodeId: node.id,
              suggestion: 'Use format: {{node_id.output_name}}'
            });
            return;
          }

          const [, sourceNodeId, outputName] = match;

          // Check if source node exists
          if (!nodeOutputs.has(sourceNodeId)) {
            errors.push({
              type: 'connection',
              message: `Node ${node.id} references non-existent node: ${sourceNodeId}`,
              path: `nodes[${index}].inputs.${inputName}`,
              nodeId: node.id,
              suggestion: `Available nodes: ${Array.from(nodeOutputs.keys()).join(', ')}`
            });
            return;
          }

          // Check if output exists on source node
          const sourceOutputs = nodeOutputs.get(sourceNodeId)!;
          if (!sourceOutputs.includes(outputName)) {
            errors.push({
              type: 'connection',
              message: `Node ${sourceNodeId} does not have output: ${outputName}`,
              path: `nodes[${index}].inputs.${inputName}`,
              nodeId: node.id,
              suggestion: `Available outputs: ${sourceOutputs.join(', ')}`
            });
          }
        }
      });
    });

    return errors;
  }

  /**
   * Detect circular dependencies in workflow
   */
  private detectCircularDependencies(nodes: WorkflowNode[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const graph = this.buildDependencyGraph(nodes);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        const cyclePath = [...path, nodeId].join(' → ');
        errors.push({
          type: 'circular',
          message: `Circular dependency detected: ${cyclePath}`,
          nodeId,
          suggestion: 'Remove circular references between nodes'
        });
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      for (const dep of dependencies) {
        if (detectCycle(dep, [...path, nodeId])) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // Check each node for cycles
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        detectCycle(node.id, []);
      }
    });

    return errors;
  }

  /**
   * Build dependency graph from nodes
   */
  private buildDependencyGraph(nodes: WorkflowNode[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    nodes.forEach(node => {
      const dependencies: string[] = [];

      if (node.inputs) {
        Object.values(node.inputs).forEach(inputValue => {
          if (typeof inputValue === 'string') {
            const match = inputValue.match(/\{\{(.+?)\..+?\}\}/);
            if (match) {
              dependencies.push(match[1]);
            }
          }
        });
      }

      graph.set(node.id, dependencies);
    });

    return graph;
  }

  /**
   * Generate performance and cost warnings
   */
  private generateWarnings(nodes: WorkflowNode[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    nodes.forEach(node => {
      // Cost warnings for expensive models
      if (node.type === 'video_generation' && node.inputs?.model === 'veo3-standard') {
        warnings.push({
          type: 'cost',
          message: `VEO3 Standard costs $5/second. Consider veo3-fast ($0.75/second) for cost savings`,
          nodeId: node.id
        });
      }

      // Performance warnings for long durations
      if (node.type === 'video_generation' && node.inputs?.duration > 30) {
        warnings.push({
          type: 'performance',
          message: `Long video duration (${node.inputs.duration}s) may take significant time to generate`,
          nodeId: node.id
        });
      }

      // Compatibility warnings
      if (node.type === 'video_generation' && node.inputs?.model === 'sora-2') {
        warnings.push({
          type: 'compatibility',
          message: `Sora 2 model is not yet fully available. Fallback to veo3-fast recommended`,
          nodeId: node.id
        });
      }
    });

    return warnings;
  }

  /**
   * Format validation result for display
   */
  formatValidationResult(result: ValidationResult): string {
    let output = '';

    if (result.valid) {
      output += '✅ Workflow validation passed!\n';
    } else {
      output += `❌ Workflow validation failed with ${result.errors.length} error(s)\n\n`;
    }

    // Format errors
    if (result.errors.length > 0) {
      output += 'ERRORS:\n';
      result.errors.forEach((error, index) => {
        output += `${index + 1}. [${error.type.toUpperCase()}] ${error.message}\n`;
        if (error.path) output += `   Path: ${error.path}\n`;
        if (error.nodeId) output += `   Node: ${error.nodeId}\n`;
        if (error.suggestion) output += `   💡 ${error.suggestion}\n`;
        output += '\n';
      });
    }

    // Format warnings
    if (result.warnings.length > 0) {
      output += `⚠️  ${result.warnings.length} WARNING(S):\n`;
      result.warnings.forEach((warning, index) => {
        output += `${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}\n`;
        if (warning.nodeId) output += `   Node: ${warning.nodeId}\n`;
        output += '\n';
      });
    }

    return output;
  }
}

// Export singleton instance
export const workflowValidator = new WorkflowValidator();
