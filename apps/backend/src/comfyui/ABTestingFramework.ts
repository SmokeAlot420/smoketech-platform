/**
 * A/B Testing Framework for Model Comparison
 *
 * Automates model comparison by running the same workflow with different models
 * in parallel using Temporal, then comparing cost, quality, and speed metrics.
 */

import { Connection, Client, WorkflowHandle } from '@temporalio/client';
import * as fs from 'fs';
import * as path from 'path';
import type { WorkflowConfig } from './types/WorkflowConfig.js';
import type { ComfyUIWorkflowInput, ComfyUIWorkflowResult } from '../temporal/workflows/comfyUIWorkflow.js';
import { WorkflowValidator } from './WorkflowValidator.js';

/**
 * Model variant configuration for A/B testing
 */
export interface ModelVariant {
  /** Unique identifier for this variant */
  id: string;

  /** Human-readable name */
  name: string;

  /** Node type to target (e.g., "image_generator", "video_generator") */
  nodeType: string;

  /** Model to use (e.g., "nanobana", "midjourney", "veo3", "sora-2") */
  model: string;

  /** Optional: Override other node params */
  paramOverrides?: Record<string, any>;
}

/**
 * A/B test execution result for a single variant
 */
export interface ABTestVariantResult {
  /** Variant configuration */
  variant: ModelVariant;

  /** Workflow execution result */
  workflowResult: ComfyUIWorkflowResult;

  /** Performance metrics */
  metrics: {
    /** Total cost in dollars */
    totalCost: number;

    /** Total execution time in milliseconds */
    totalTime: number;

    /** Time per node in milliseconds */
    timePerNode: number;

    /** Cost per node in dollars */
    costPerNode: number;

    /** Success rate (0-1) */
    successRate: number;
  };

  /** Workflow handle for querying */
  workflowId: string;

  /** Generated output files */
  outputs: Record<string, any>;
}

/**
 * Complete A/B test results with comparison
 */
export interface ABTestResults {
  /** Test metadata */
  testId: string;
  testName: string;
  startTime: number;
  endTime: number;
  totalDuration: number;

  /** Base workflow used */
  baseWorkflow: WorkflowConfig;

  /** All variant results */
  variants: ABTestVariantResult[];

  /** Comparison metrics */
  comparison: {
    /** Fastest variant by execution time */
    fastest: ModelVariant;
    fastestTime: number;

    /** Cheapest variant by cost */
    cheapest: ModelVariant;
    cheapestCost: number;

    /** Best value (cost/time ratio) */
    bestValue: ModelVariant;
    bestValueScore: number;

    /** Winner based on weighted scoring */
    winner: ModelVariant;
    winnerScore: number;
  };

  /** Detailed comparison table */
  comparisonTable: {
    variant: string;
    cost: number;
    time: number;
    costPerNode: number;
    timePerNode: number;
    valueScore: number;
    qualityScore?: number;
  }[];
}

/**
 * A/B Testing Framework
 */
export class ABTestingFramework {
  private client: Client | null = null;

  /**
   * Connect to Temporal server
   */
  async connect(address: string = 'localhost:7233'): Promise<void> {
    const connection = await Connection.connect({ address });
    this.client = new Client({ connection });
  }

  /**
   * Create workflow variant with specific model
   */
  private createWorkflowVariant(
    baseWorkflow: WorkflowConfig,
    variant: ModelVariant
  ): WorkflowConfig {
    // Deep clone workflow
    const variantWorkflow: WorkflowConfig = JSON.parse(JSON.stringify(baseWorkflow));

    // Update workflow ID and name
    variantWorkflow.id = `${baseWorkflow.id}-${variant.id}`;
    variantWorkflow.name = `${baseWorkflow.name} (${variant.name})`;

    // Find and update matching nodes
    for (const node of variantWorkflow.nodes) {
      if (node.type === variant.nodeType) {
        // Update model
        node.params.model = variant.model;

        // Apply parameter overrides
        if (variant.paramOverrides) {
          Object.assign(node.params, variant.paramOverrides);
        }

        console.log(`   Updated node ${node.id}: ${node.type} → ${variant.model}`);
      }
    }

    return variantWorkflow;
  }

  /**
   * Run A/B test comparing multiple model variants
   */
  async runABTest(
    baseWorkflow: WorkflowConfig,
    variants: ModelVariant[],
    inputs: Record<string, any>,
    options: {
      testName?: string;
      taskQueue?: string;
      weightCost?: number;
      weightSpeed?: number;
      weightQuality?: number;
    } = {}
  ): Promise<ABTestResults> {
    if (!this.client) {
      throw new Error('Not connected to Temporal. Call connect() first.');
    }

    const {
      testName = 'Model Comparison Test',
      taskQueue = 'comfyui-test-queue',
      weightCost = 0.4,
      weightSpeed = 0.4,
      weightQuality = 0.2
    } = options;

    const testId = `abtest-${Date.now()}`;
    const startTime = Date.now();

    console.log('\n🧪 Starting A/B Test');
    console.log('='.repeat(80));
    console.log(`📋 Test: ${testName}`);
    console.log(`🔢 Variants: ${variants.length}`);
    console.log(`📊 Base Workflow: ${baseWorkflow.name}`);
    console.log();

    // Build execution graph once
    const graph = WorkflowValidator.buildGraph(baseWorkflow);

    // Create variant workflows
    const variantWorkflows = variants.map(v => ({
      variant: v,
      workflow: this.createWorkflowVariant(baseWorkflow, v)
    }));

    console.log('🚀 Launching workflows in parallel...\n');

    // Start all workflows in parallel
    const workflowHandles: Array<{
      variant: ModelVariant;
      workflow: WorkflowConfig;
      handle: WorkflowHandle<ComfyUIWorkflowResult>;
    }> = [];

    for (const { variant, workflow } of variantWorkflows) {
      const workflowId = `${testId}-${variant.id}`;

      const workflowInput: ComfyUIWorkflowInput = {
        workflow,
        executionOrder: graph.executionOrder,
        inputs
      };

      const handle = await this.client.workflow.start('comfyUIWorkflow', {
        workflowId,
        taskQueue,
        args: [workflowInput]
      });

      workflowHandles.push({ variant, workflow, handle });

      console.log(`   ✅ Started: ${variant.name} (${workflowId})`);
    }

    console.log('\n⏳ Waiting for all workflows to complete...\n');

    // Wait for all workflows to complete
    const results: ABTestVariantResult[] = [];

    for (const { variant, workflow, handle } of workflowHandles) {
      try {
        const workflowResult = await handle.result();

        const metrics = {
          totalCost: workflowResult.totalCost,
          totalTime: workflowResult.totalTime,
          timePerNode: workflowResult.totalTime / graph.executionOrder.length,
          costPerNode: workflowResult.totalCost / graph.executionOrder.length,
          successRate: workflowResult.success ? 1.0 : 0.0
        };

        results.push({
          variant,
          workflowResult,
          metrics,
          workflowId: handle.workflowId,
          outputs: workflowResult.outputs
        });

        console.log(`   ✅ Completed: ${variant.name}`);
        console.log(`      Cost: $${metrics.totalCost.toFixed(4)}`);
        console.log(`      Time: ${(metrics.totalTime / 1000).toFixed(1)}s`);
        console.log(`      Success: ${workflowResult.success ? '✅' : '❌'}`);
        console.log();

      } catch (error) {
        console.error(`   ❌ Failed: ${variant.name}`);
        console.error(`      Error: ${error instanceof Error ? error.message : String(error)}`);
        console.log();

        // Add failed result
        results.push({
          variant,
          workflowResult: {
            success: false,
            outputs: {},
            totalCost: 0,
            totalTime: 0,
            nodeResults: new Map(),
            error: error instanceof Error ? error.message : String(error)
          },
          metrics: {
            totalCost: 0,
            totalTime: 0,
            timePerNode: 0,
            costPerNode: 0,
            successRate: 0
          },
          workflowId: handle.workflowId,
          outputs: {}
        });
      }
    }

    const endTime = Date.now();

    // Calculate comparison metrics
    const successfulResults = results.filter(r => r.workflowResult.success);

    if (successfulResults.length === 0) {
      throw new Error('All variants failed! Cannot generate comparison.');
    }

    // Find fastest
    const fastest = successfulResults.reduce((min, r) =>
      r.metrics.totalTime < min.metrics.totalTime ? r : min
    );

    // Find cheapest
    const cheapest = successfulResults.reduce((min, r) =>
      r.metrics.totalCost < min.metrics.totalCost ? r : min
    );

    // Calculate value scores (lower is better: cost * time)
    const withValueScores = successfulResults.map(r => ({
      ...r,
      valueScore: r.metrics.totalCost * (r.metrics.totalTime / 1000)
    }));

    const bestValue = withValueScores.reduce((min, r) =>
      r.valueScore < min.valueScore ? r : min
    );

    // Calculate weighted winner score
    const withWinnerScores = successfulResults.map(r => {
      // Normalize metrics (0-1, lower is better)
      const maxCost = Math.max(...successfulResults.map(x => x.metrics.totalCost));
      const maxTime = Math.max(...successfulResults.map(x => x.metrics.totalTime));

      const normalizedCost = r.metrics.totalCost / maxCost;
      const normalizedTime = r.metrics.totalTime / maxTime;
      const normalizedQuality = 0.5; // TODO: Implement quality scoring

      // Weighted score (lower is better)
      const score =
        normalizedCost * weightCost +
        normalizedTime * weightSpeed +
        (1 - normalizedQuality) * weightQuality;

      return { ...r, winnerScore: score };
    });

    const winner = withWinnerScores.reduce((min, r) =>
      r.winnerScore < min.winnerScore ? r : min
    );

    // Build comparison table
    const comparisonTable = results.map(r => ({
      variant: r.variant.name,
      cost: r.metrics.totalCost,
      time: r.metrics.totalTime / 1000, // Convert to seconds
      costPerNode: r.metrics.costPerNode,
      timePerNode: r.metrics.timePerNode / 1000, // Convert to seconds
      valueScore: r.metrics.totalCost * (r.metrics.totalTime / 1000)
    }));

    // Return complete results
    return {
      testId,
      testName,
      startTime,
      endTime,
      totalDuration: endTime - startTime,
      baseWorkflow,
      variants: results,
      comparison: {
        fastest: fastest.variant,
        fastestTime: fastest.metrics.totalTime,
        cheapest: cheapest.variant,
        cheapestCost: cheapest.metrics.totalCost,
        bestValue: bestValue.variant,
        bestValueScore: bestValue.valueScore,
        winner: winner.variant,
        winnerScore: winner.winnerScore
      },
      comparisonTable
    };
  }

  /**
   * Print formatted A/B test results
   */
  printResults(results: ABTestResults): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎉 A/B TEST RESULTS');
    console.log('='.repeat(80));
    console.log();

    console.log(`📋 Test: ${results.testName}`);
    console.log(`⏱️  Duration: ${(results.totalDuration / 1000).toFixed(1)}s`);
    console.log(`🔢 Variants Tested: ${results.variants.length}`);
    console.log();

    console.log('📊 COMPARISON TABLE:');
    console.log('-'.repeat(80));
    console.log(
      'Variant'.padEnd(25) +
      'Cost'.padStart(12) +
      'Time'.padStart(12) +
      'Value Score'.padStart(15)
    );
    console.log('-'.repeat(80));

    for (const row of results.comparisonTable) {
      console.log(
        row.variant.padEnd(25) +
        `$${row.cost.toFixed(4)}`.padStart(12) +
        `${row.time.toFixed(1)}s`.padStart(12) +
        row.valueScore.toFixed(4).padStart(15)
      );
    }

    console.log('-'.repeat(80));
    console.log();

    console.log('🏆 WINNERS:');
    console.log(`   ⚡ Fastest: ${results.comparison.fastest.name} (${(results.comparison.fastestTime / 1000).toFixed(1)}s)`);
    console.log(`   💰 Cheapest: ${results.comparison.cheapest.name} ($${results.comparison.cheapestCost.toFixed(4)})`);
    console.log(`   ⭐ Best Value: ${results.comparison.bestValue.name} (score: ${results.comparison.bestValueScore.toFixed(4)})`);
    console.log(`   🎯 Overall Winner: ${results.comparison.winner.name} (score: ${results.comparison.winnerScore.toFixed(4)})`);
    console.log();

    console.log('='.repeat(80));
  }

  /**
   * Export results to JSON file
   */
  exportResults(results: ABTestResults, filepath: string): void {
    // Convert Map to array for JSON serialization
    const exportData = {
      ...results,
      variants: results.variants.map(v => {
        // Handle nodeResults whether it's a Map or already an object
        let nodeResultsArray;
        if (v.workflowResult.nodeResults instanceof Map) {
          nodeResultsArray = Array.from(v.workflowResult.nodeResults.entries()).map(([k, val]) => ({
            nodeId: k,
            ...val
          }));
        } else if (Array.isArray(v.workflowResult.nodeResults)) {
          nodeResultsArray = v.workflowResult.nodeResults;
        } else {
          // It's a plain object, convert to array
          nodeResultsArray = Object.entries(v.workflowResult.nodeResults).map(([k, val]) => ({
            nodeId: k,
            ...val as any
          }));
        }

        return {
          ...v,
          workflowResult: {
            ...v.workflowResult,
            nodeResults: nodeResultsArray
          }
        };
      })
    };

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Results exported to: ${filepath}`);
  }
}
