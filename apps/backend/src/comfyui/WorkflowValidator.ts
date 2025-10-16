/**
 * Workflow Validator
 *
 * Validates ComfyUI-style workflows for structural integrity,
 * connection validity, and circular dependencies
 */

import {
  WorkflowConfig,
  WorkflowValidationResult,
  WorkflowValidationError,
  WorkflowValidationWarning,
  WorkflowGraph
} from './types/WorkflowConfig.js';
import { NodeConfig, NodeConnection } from './types/NodeConfig.js';

/**
 * Workflow Validator
 * Validates workflow configurations before execution
 */
export class WorkflowValidator {
  /**
   * Validate a complete workflow
   */
  static validate(workflow: WorkflowConfig): WorkflowValidationResult {
    const errors: WorkflowValidationError[] = [];
    const warnings: WorkflowValidationWarning[] = [];

    // 1. Basic structure validation
    this.validateStructure(workflow, errors);

    // 2. Node validation
    this.validateNodes(workflow, errors, warnings);

    // 3. Connection validation
    this.validateConnections(workflow, errors);

    // 4. Graph validation (circular dependencies, etc.)
    try {
      const graph = this.buildGraph(workflow);
      this.validateGraph(graph, errors, warnings);
    } catch (error) {
      errors.push({
        type: 'invalid_config',
        message: `Failed to build workflow graph: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // 5. Cost and performance warnings
    this.analyzePerformance(workflow, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate basic workflow structure
   */
  private static validateStructure(
    workflow: WorkflowConfig,
    errors: WorkflowValidationError[]
  ): void {
    if (!workflow.id || workflow.id.trim() === '') {
      errors.push({
        type: 'invalid_config',
        message: 'Workflow ID is required'
      });
    }

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({
        type: 'invalid_config',
        message: 'Workflow name is required'
      });
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push({
        type: 'invalid_config',
        message: 'Workflow must have nodes array'
      });
    }

    if (!workflow.connections || !Array.isArray(workflow.connections)) {
      errors.push({
        type: 'invalid_config',
        message: 'Workflow must have connections array'
      });
    }

    if (workflow.nodes && workflow.nodes.length === 0) {
      errors.push({
        type: 'invalid_config',
        message: 'Workflow must have at least one node'
      });
    }
  }

  /**
   * Validate individual nodes
   */
  private static validateNodes(
    workflow: WorkflowConfig,
    errors: WorkflowValidationError[],
    warnings: WorkflowValidationWarning[]
  ): void {
    const nodeIds = new Set<string>();

    for (const node of workflow.nodes) {
      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        errors.push({
          type: 'invalid_config',
          message: `Duplicate node ID: ${node.id}`,
          nodeId: node.id
        });
      }
      nodeIds.add(node.id);

      // Validate node structure
      if (!node.type) {
        errors.push({
          type: 'invalid_config',
          message: `Node ${node.id} is missing type`,
          nodeId: node.id
        });
      }

      if (!node.inputs || !Array.isArray(node.inputs)) {
        errors.push({
          type: 'invalid_config',
          message: `Node ${node.id} inputs must be an array`,
          nodeId: node.id
        });
      }

      if (!node.outputs || !Array.isArray(node.outputs)) {
        errors.push({
          type: 'invalid_config',
          message: `Node ${node.id} outputs must be an array`,
          nodeId: node.id
        });
      }
    }
  }

  /**
   * Validate connections between nodes
   */
  private static validateConnections(
    workflow: WorkflowConfig,
    errors: WorkflowValidationError[]
  ): void {
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

    for (const conn of workflow.connections) {
      // Check source node exists
      const sourceNode = nodeMap.get(conn.sourceNodeId);
      if (!sourceNode) {
        errors.push({
          type: 'missing_node',
          message: `Connection references non-existent source node: ${conn.sourceNodeId}`,
          connection: conn
        });
        continue;
      }

      // Check target node exists
      const targetNode = nodeMap.get(conn.targetNodeId);
      if (!targetNode) {
        errors.push({
          type: 'missing_node',
          message: `Connection references non-existent target node: ${conn.targetNodeId}`,
          connection: conn
        });
        continue;
      }

      // Check source output slot exists
      const sourceSlot = sourceNode.outputs.find((s) => s.name === conn.sourceSlot);
      if (!sourceSlot) {
        errors.push({
          type: 'invalid_connection',
          message: `Source node ${conn.sourceNodeId} has no output slot '${conn.sourceSlot}'`,
          connection: conn
        });
      }

      // Check target input slot exists
      const targetSlot = targetNode.inputs.find((s) => s.name === conn.targetSlot);
      if (!targetSlot) {
        errors.push({
          type: 'invalid_connection',
          message: `Target node ${conn.targetNodeId} has no input slot '${conn.targetSlot}'`,
          connection: conn
        });
      }

      // Check type compatibility
      if (sourceSlot && targetSlot && sourceSlot.type !== targetSlot.type) {
        // Allow 'object' and 'array' to accept any type
        if (targetSlot.type !== 'object' && targetSlot.type !== 'array') {
          errors.push({
            type: 'type_mismatch',
            message: `Type mismatch: ${conn.sourceNodeId}.${conn.sourceSlot} (${sourceSlot.type}) -> ${conn.targetNodeId}.${conn.targetSlot} (${targetSlot.type})`,
            connection: conn
          });
        }
      }
    }

    // Check for missing required inputs
    for (const node of workflow.nodes) {
      const incomingConnections = workflow.connections.filter(
        (c) => c.targetNodeId === node.id
      );

      for (const input of node.inputs) {
        if (input.required) {
          const hasConnection = incomingConnections.some((c) => c.targetSlot === input.name);
          const hasDefault = input.defaultValue !== undefined;
          const hasWorkflowInput = workflow.inputs.some(
            (wi) => wi.targetNodeId === node.id && wi.targetSlot === input.name
          );

          if (!hasConnection && !hasDefault && !hasWorkflowInput) {
            errors.push({
              type: 'missing_input',
              message: `Node ${node.id} has required input '${input.name}' with no connection and no default value`,
              nodeId: node.id
            });
          }
        }
      }
    }
  }

  /**
   * Build workflow graph
   */
  static buildGraph(workflow: WorkflowConfig): WorkflowGraph {
    const nodes = new Map(workflow.nodes.map((n) => [n.id, n]));
    const adjacencyList = new Map<string, string[]>();
    const dependencies = new Map<string, string[]>();

    // Initialize adjacency lists
    for (const node of workflow.nodes) {
      adjacencyList.set(node.id, []);
      dependencies.set(node.id, []);
    }

    // Build adjacency lists from connections
    for (const conn of workflow.connections) {
      const adj = adjacencyList.get(conn.sourceNodeId) || [];
      adj.push(conn.targetNodeId);
      adjacencyList.set(conn.sourceNodeId, adj);

      const deps = dependencies.get(conn.targetNodeId) || [];
      deps.push(conn.sourceNodeId);
      dependencies.set(conn.targetNodeId, deps);
    }

    // Find entry and exit nodes
    const entryNodes: string[] = [];
    const exitNodes: string[] = [];

    Array.from(dependencies.entries()).forEach(([nodeId, deps]) => {
      if (deps.length === 0) entryNodes.push(nodeId);
    });

    Array.from(adjacencyList.entries()).forEach(([nodeId, adj]) => {
      if (adj.length === 0) exitNodes.push(nodeId);
    });

    // Topological sort
    const executionOrder = this.topologicalSort(adjacencyList, dependencies);

    return {
      nodes,
      adjacencyList,
      dependencies,
      executionOrder,
      entryNodes,
      exitNodes
    };
  }

  /**
   * Validate graph structure
   */
  private static validateGraph(
    graph: WorkflowGraph,
    errors: WorkflowValidationError[],
    warnings: WorkflowValidationWarning[]
  ): void {
    // Check for circular dependencies
    const cycles = this.detectCycles(graph.adjacencyList);
    if (cycles.length > 0) {
      errors.push({
        type: 'circular_dependency',
        message: `Circular dependency detected: ${cycles[0].join(' -> ')}`,
        context: { cycles }
      });
    }

    // Warn about unused nodes
    const usedNodes = new Set<string>();
    for (const nodeId of graph.executionOrder) {
      usedNodes.add(nodeId);
    }

    Array.from(graph.nodes.entries()).forEach(([nodeId]) => {
      if (!usedNodes.has(nodeId)) {
        warnings.push({
          type: 'unused_node',
          message: `Node ${nodeId} is not reachable in execution flow`,
          nodeId,
          suggestion: 'Remove unused node or add connections to it'
        });
      }
    });

    // Warn about nodes with no outputs used
    Array.from(graph.nodes.entries()).forEach(([nodeId, node]) => {
      if (node.outputs.length > 0) {
        const adj = graph.adjacencyList.get(nodeId) || [];
        if (adj.length === 0 && !graph.exitNodes.includes(nodeId)) {
          warnings.push({
            type: 'unused_output',
            message: `Node ${nodeId} has outputs but no outgoing connections`,
            nodeId,
            suggestion: 'Connect this node to another node or mark as workflow output'
          });
        }
      }
    });
  }

  /**
   * Topological sort (Kahn's algorithm)
   */
  private static topologicalSort(
    adjacencyList: Map<string, string[]>,
    dependencies: Map<string, string[]>
  ): string[] {
    const sorted: string[] = [];
    const inDegree = new Map<string, number>();

    // Calculate in-degrees
    Array.from(dependencies.entries()).forEach(([nodeId, deps]) => {
      inDegree.set(nodeId, deps.length);
    });

    // Queue nodes with no dependencies
    const queue: string[] = [];
    Array.from(inDegree.entries()).forEach(([nodeId, degree]) => {
      if (degree === 0) queue.push(nodeId);
    });

    // Process queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      sorted.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);

        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return sorted;
  }

  /**
   * Detect cycles using DFS
   */
  private static detectCycles(adjacencyList: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          // Found cycle
          const cycleStart = path.indexOf(neighbor);
          cycles.push([...path.slice(cycleStart), neighbor]);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    Array.from(adjacencyList.keys()).forEach((nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    });

    return cycles;
  }

  /**
   * Analyze performance and costs
   */
  private static analyzePerformance(
    workflow: WorkflowConfig,
    warnings: WorkflowValidationWarning[]
  ): void {
    // Warn about potentially expensive nodes
    const expensiveTypes = ['video_generator', 'video_enhancer'];

    for (const node of workflow.nodes) {
      if (expensiveTypes.includes(node.type)) {
        warnings.push({
          type: 'high_cost',
          message: `Node ${node.id} (${node.type}) may incur significant costs`,
          nodeId: node.id,
          suggestion: 'Consider cost limits and monitoring'
        });
      }
    }

    // Warn about long execution chains
    if (workflow.nodes.length > 10) {
      warnings.push({
        type: 'long_execution',
        message: `Workflow has ${workflow.nodes.length} nodes, which may take a long time to execute`,
        suggestion: 'Consider breaking into smaller workflows or using parallel execution'
      });
    }
  }
}
