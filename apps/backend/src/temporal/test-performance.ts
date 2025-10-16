/**
 * Performance Testing Suite
 *
 * Comprehensive performance tests for production readiness:
 * 1. Concurrent workflow execution (10+ workflows)
 * 2. Long-running workflow stress test
 * 3. Memory leak detection
 * 4. Worker scaling tests
 * 5. System resource monitoring
 */

import { Connection, Client } from '@temporalio/client';
import { metricsCollector } from './monitoring/metrics.js';
import { errorAggregator } from './monitoring/errorAggregator.js';
import { logger } from './monitoring/logger.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface PerformanceMetrics {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  workflowCount: number;
  successCount: number;
  failureCount: number;
  avgWorkflowDuration: number;
  maxWorkflowDuration: number;
  minWorkflowDuration: number;
  totalCost: number;
  avgCost: number;
  throughput: number; // workflows per minute
  memoryUsage: {
    initial: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
    final: NodeJS.MemoryUsage;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
}

class PerformanceTester {
  private client: Client | null = null;
  private memorySnapshots: NodeJS.MemoryUsage[] = [];
  private cpuStartUsage: NodeJS.CpuUsage = process.cpuUsage();

  async connect(address: string = 'localhost:7233'): Promise<void> {
    const connection = await Connection.connect({ address });
    this.client = new Client({ connection });
    logger.info('Connected to Temporal server', { address });
  }

  /**
   * Test 1: Concurrent Workflow Execution
   * Launch 10+ workflows simultaneously and measure performance
   */
  async testConcurrentExecution(workflowCount: number = 10): Promise<PerformanceMetrics> {
    if (!this.client) throw new Error('Not connected to Temporal');

    console.log('\n🧪 Test 1: Concurrent Workflow Execution');
    console.log('='.repeat(80));
    console.log(`Launching ${workflowCount} workflows concurrently...\n`);

    const startTime = Date.now();
    const initialMemory = process.memoryUsage();
    this.memorySnapshots = [initialMemory];
    this.cpuStartUsage = process.cpuUsage();

    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      this.memorySnapshots.push(process.memoryUsage());
    }, 1000);

    const workflows: Promise<any>[] = [];
    const workflowDurations: number[] = [];

    try {
      // Launch workflows concurrently
      for (let i = 0; i < workflowCount; i++) {
        const workflowId = `perf-test-concurrent-${Date.now()}-${i}`;
        const workflowStart = Date.now();

        const workflowPromise = this.client.workflow.execute('singleVideoWorkflow', {
          workflowId,
          taskQueue: 'test-task-queue',
          args: [{
            characterPrompt: `Test character ${i}`,
            videoPrompt: `Test video scene ${i}`,
            template: 'single-video-v1'
          }]
        }).then(result => {
          const duration = Date.now() - workflowStart;
          workflowDurations.push(duration);
          logger.info(`Workflow ${i + 1}/${workflowCount} completed`, {
            workflowId,
            duration: `${(duration / 1000).toFixed(1)}s`
          });
          return { success: true, workflowId, duration };
        }).catch(error => {
          const duration = Date.now() - workflowStart;
          workflowDurations.push(duration);
          logger.error(`Workflow ${i + 1}/${workflowCount} failed`, { workflowId }, error);
          return { success: false, workflowId, duration, error: error.message };
        });

        workflows.push(workflowPromise);

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ All ${workflowCount} workflows launched`);
      console.log('⏳ Waiting for completion...\n');

      // Wait for all workflows
      const results = await Promise.allSettled(workflows);

      clearInterval(memoryMonitor);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const finalMemory = process.memoryUsage();
      const cpuUsage = process.cpuUsage(this.cpuStartUsage);

      // Calculate metrics
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failureCount = workflowCount - successCount;

      const avgWorkflowDuration = workflowDurations.reduce((a, b) => a + b, 0) / workflowDurations.length;
      const maxWorkflowDuration = Math.max(...workflowDurations);
      const minWorkflowDuration = Math.min(...workflowDurations);

      const peakMemory = this.memorySnapshots.reduce((max, curr) =>
        curr.heapUsed > max.heapUsed ? curr : max
      );

      // Get cost data from metrics collector
      const stats = metricsCollector.getAggregatedStats();
      const totalCost = stats.totalCost;
      const avgCost = totalCost / workflowCount;

      const throughput = (workflowCount / (duration / 1000 / 60)); // workflows per minute

      const metrics: PerformanceMetrics = {
        testName: 'Concurrent Execution',
        startTime,
        endTime,
        duration,
        workflowCount,
        successCount,
        failureCount,
        avgWorkflowDuration,
        maxWorkflowDuration,
        minWorkflowDuration,
        totalCost,
        avgCost,
        throughput,
        memoryUsage: {
          initial: initialMemory,
          peak: peakMemory,
          final: finalMemory
        },
        cpuUsage: {
          user: cpuUsage.user / 1000000, // Convert to seconds
          system: cpuUsage.system / 1000000
        }
      };

      this.printMetrics(metrics);
      return metrics;

    } finally {
      clearInterval(memoryMonitor);
    }
  }

  /**
   * Test 2: Long-Running Workflow Stress Test
   * Run workflows continuously for extended period
   */
  async testLongRunningStress(durationMinutes: number = 5): Promise<PerformanceMetrics> {
    if (!this.client) throw new Error('Not connected to Temporal');

    console.log('\n🧪 Test 2: Long-Running Workflow Stress Test');
    console.log('='.repeat(80));
    console.log(`Running workflows for ${durationMinutes} minutes...\n`);

    const startTime = Date.now();
    const endTimeTarget = startTime + (durationMinutes * 60 * 1000);
    const initialMemory = process.memoryUsage();
    this.memorySnapshots = [initialMemory];
    this.cpuStartUsage = process.cpuUsage();

    let workflowCount = 0;
    let successCount = 0;
    let failureCount = 0;
    const workflowDurations: number[] = [];

    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      this.memorySnapshots.push(process.memoryUsage());
    }, 5000);

    try {
      while (Date.now() < endTimeTarget) {
        const workflowId = `perf-test-longrun-${Date.now()}-${workflowCount}`;
        const workflowStart = Date.now();

        try {
          await this.client.workflow.execute('singleVideoWorkflow', {
            workflowId,
            taskQueue: 'test-task-queue',
            args: [{
              characterPrompt: `Stress test character ${workflowCount}`,
              videoPrompt: `Stress test video ${workflowCount}`,
              template: 'single-video-v1'
            }]
          });

          const duration = Date.now() - workflowStart;
          workflowDurations.push(duration);
          successCount++;
          workflowCount++;

          logger.info(`Stress test workflow completed`, {
            workflowId,
            count: workflowCount,
            duration: `${(duration / 1000).toFixed(1)}s`
          });

        } catch (error) {
          const duration = Date.now() - workflowStart;
          workflowDurations.push(duration);
          failureCount++;
          workflowCount++;

          logger.error(`Stress test workflow failed`, { workflowId, count: workflowCount }, error as Error);
        }

        // Check if we've reached time limit
        if (Date.now() >= endTimeTarget) break;
      }

      clearInterval(memoryMonitor);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const finalMemory = process.memoryUsage();
      const cpuUsage = process.cpuUsage(this.cpuStartUsage);

      const avgWorkflowDuration = workflowDurations.length > 0
        ? workflowDurations.reduce((a, b) => a + b, 0) / workflowDurations.length
        : 0;
      const maxWorkflowDuration = workflowDurations.length > 0 ? Math.max(...workflowDurations) : 0;
      const minWorkflowDuration = workflowDurations.length > 0 ? Math.min(...workflowDurations) : 0;

      const peakMemory = this.memorySnapshots.reduce((max, curr) =>
        curr.heapUsed > max.heapUsed ? curr : max
      );

      const stats = metricsCollector.getAggregatedStats();
      const totalCost = stats.totalCost;
      const avgCost = workflowCount > 0 ? totalCost / workflowCount : 0;
      const throughput = (workflowCount / (duration / 1000 / 60));

      const metrics: PerformanceMetrics = {
        testName: 'Long-Running Stress Test',
        startTime,
        endTime,
        duration,
        workflowCount,
        successCount,
        failureCount,
        avgWorkflowDuration,
        maxWorkflowDuration,
        minWorkflowDuration,
        totalCost,
        avgCost,
        throughput,
        memoryUsage: {
          initial: initialMemory,
          peak: peakMemory,
          final: finalMemory
        },
        cpuUsage: {
          user: cpuUsage.user / 1000000,
          system: cpuUsage.system / 1000000
        }
      };

      this.printMetrics(metrics);
      return metrics;

    } finally {
      clearInterval(memoryMonitor);
    }
  }

  /**
   * Test 3: Memory Leak Detection
   * Monitor memory usage over time
   */
  async testMemoryLeaks(iterations: number = 20): Promise<PerformanceMetrics> {
    if (!this.client) throw new Error('Not connected to Temporal');

    console.log('\n🧪 Test 3: Memory Leak Detection');
    console.log('='.repeat(80));
    console.log(`Running ${iterations} iterations with memory monitoring...\n`);

    const startTime = Date.now();
    const initialMemory = process.memoryUsage();
    this.memorySnapshots = [initialMemory];
    this.cpuStartUsage = process.cpuUsage();

    let workflowCount = 0;
    let successCount = 0;
    let failureCount = 0;
    const workflowDurations: number[] = [];

    // Force garbage collection if available
    if (global.gc) {
      console.log('🗑️  Running garbage collection before test...');
      global.gc();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    for (let i = 0; i < iterations; i++) {
      const workflowId = `perf-test-memory-${Date.now()}-${i}`;
      const workflowStart = Date.now();

      try {
        await this.client.workflow.execute('singleVideoWorkflow', {
          workflowId,
          taskQueue: 'test-task-queue',
          args: [{
            characterPrompt: `Memory test character ${i}`,
            videoPrompt: `Memory test video ${i}`,
            template: 'single-video-v1'
          }]
        });

        const duration = Date.now() - workflowStart;
        workflowDurations.push(duration);
        successCount++;

      } catch (error) {
        const duration = Date.now() - workflowStart;
        workflowDurations.push(duration);
        failureCount++;
        logger.error('Memory test workflow failed', { workflowId }, error as Error);
      }

      workflowCount++;

      // Take memory snapshot
      const memSnapshot = process.memoryUsage();
      this.memorySnapshots.push(memSnapshot);

      const memoryGrowth = ((memSnapshot.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2);
      console.log(`   Iteration ${i + 1}/${iterations}: Memory: ${(memSnapshot.heapUsed / 1024 / 1024).toFixed(2)} MB (Δ ${memoryGrowth} MB)`);

      // Force GC every 5 iterations if available
      if (global.gc && (i + 1) % 5 === 0) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const finalMemory = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.cpuStartUsage);

    // Analyze memory trend
    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    const memoryGrowthPerIteration = memoryGrowthMB / iterations;

    console.log(`\n📊 Memory Analysis:`);
    console.log(`   Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Growth: ${memoryGrowthMB.toFixed(2)} MB`);
    console.log(`   Growth per iteration: ${memoryGrowthPerIteration.toFixed(2)} MB`);

    if (memoryGrowthPerIteration > 10) {
      console.log(`   ⚠️  WARNING: Possible memory leak detected! (${memoryGrowthPerIteration.toFixed(2)} MB/iteration)`);
    } else if (memoryGrowthPerIteration > 5) {
      console.log(`   ⚠️  CAUTION: High memory growth (${memoryGrowthPerIteration.toFixed(2)} MB/iteration)`);
    } else {
      console.log(`   ✅ Memory growth within acceptable range`);
    }

    const avgWorkflowDuration = workflowDurations.reduce((a, b) => a + b, 0) / workflowDurations.length;
    const maxWorkflowDuration = Math.max(...workflowDurations);
    const minWorkflowDuration = Math.min(...workflowDurations);

    const peakMemory = this.memorySnapshots.reduce((max, curr) =>
      curr.heapUsed > max.heapUsed ? curr : max
    );

    const stats = metricsCollector.getAggregatedStats();
    const totalCost = stats.totalCost;
    const avgCost = totalCost / workflowCount;
    const throughput = (workflowCount / (duration / 1000 / 60));

    const metrics: PerformanceMetrics = {
      testName: 'Memory Leak Detection',
      startTime,
      endTime,
      duration,
      workflowCount,
      successCount,
      failureCount,
      avgWorkflowDuration,
      maxWorkflowDuration,
      minWorkflowDuration,
      totalCost,
      avgCost,
      throughput,
      memoryUsage: {
        initial: initialMemory,
        peak: peakMemory,
        final: finalMemory
      },
      cpuUsage: {
        user: cpuUsage.user / 1000000,
        system: cpuUsage.system / 1000000
      }
    };

    this.printMetrics(metrics);
    return metrics;
  }

  /**
   * Test 4: System Resource Monitoring
   * Monitor system resources during workflow execution
   */
  async testSystemResources(): Promise<void> {
    console.log('\n🧪 Test 4: System Resource Monitoring');
    console.log('='.repeat(80));

    const cpuCount = os.cpus().length;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory * 100).toFixed(2);

    console.log('\n💻 System Information:');
    console.log(`   Platform: ${os.platform()}`);
    console.log(`   Architecture: ${os.arch()}`);
    console.log(`   CPU Cores: ${cpuCount}`);
    console.log(`   Total Memory: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Free Memory: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Used Memory: ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB (${memoryUsagePercent}%)`);

    console.log('\n📊 Process Information:');
    const processMemory = process.memoryUsage();
    console.log(`   Heap Used: ${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   RSS: ${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   External: ${(processMemory.external / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n📈 CPU Information:');
    const cpus = os.cpus();
    cpus.forEach((cpu, i) => {
      console.log(`   CPU ${i}: ${cpu.model} @ ${cpu.speed} MHz`);
    });

    console.log('\n⚡ Recommendations:');
    if (cpuCount < 4) {
      console.log(`   ⚠️  Low CPU count (${cpuCount}). Consider scaling up for production.`);
    } else {
      console.log(`   ✅ CPU count adequate for concurrent workflows`);
    }

    if (freeMemory < 2 * 1024 * 1024 * 1024) {
      console.log(`   ⚠️  Low free memory (${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB). Consider adding more RAM.`);
    } else {
      console.log(`   ✅ Memory adequate for workflow execution`);
    }

    const heapUsagePercent = (processMemory.heapUsed / processMemory.heapTotal * 100).toFixed(2);
    if (parseFloat(heapUsagePercent) > 80) {
      console.log(`   ⚠️  High heap usage (${heapUsagePercent}%). Consider optimizing memory usage.`);
    } else {
      console.log(`   ✅ Heap usage within normal range (${heapUsagePercent}%)`);
    }
  }

  /**
   * Print formatted metrics
   */
  private printMetrics(metrics: PerformanceMetrics): void {
    console.log('\n' + '='.repeat(80));
    console.log(`📊 ${metrics.testName} - Results`);
    console.log('='.repeat(80));

    console.log('\n⏱️  Timing:');
    console.log(`   Total Duration: ${(metrics.duration / 1000).toFixed(1)}s`);
    console.log(`   Avg Workflow Duration: ${(metrics.avgWorkflowDuration / 1000).toFixed(1)}s`);
    console.log(`   Max Workflow Duration: ${(metrics.maxWorkflowDuration / 1000).toFixed(1)}s`);
    console.log(`   Min Workflow Duration: ${(metrics.minWorkflowDuration / 1000).toFixed(1)}s`);

    console.log('\n📈 Throughput:');
    console.log(`   Workflows Executed: ${metrics.workflowCount}`);
    console.log(`   Success Rate: ${((metrics.successCount / metrics.workflowCount) * 100).toFixed(1)}%`);
    console.log(`   Throughput: ${metrics.throughput.toFixed(2)} workflows/minute`);

    console.log('\n💰 Cost:');
    console.log(`   Total Cost: $${metrics.totalCost.toFixed(4)}`);
    console.log(`   Avg Cost per Workflow: $${metrics.avgCost.toFixed(4)}`);

    console.log('\n💾 Memory:');
    console.log(`   Initial: ${(metrics.memoryUsage.initial.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Peak: ${(metrics.memoryUsage.peak.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Final: ${(metrics.memoryUsage.final.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Growth: ${((metrics.memoryUsage.final.heapUsed - metrics.memoryUsage.initial.heapUsed) / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n⚙️  CPU:');
    console.log(`   User Time: ${metrics.cpuUsage.user.toFixed(2)}s`);
    console.log(`   System Time: ${metrics.cpuUsage.system.toFixed(2)}s`);
  }

  /**
   * Export all metrics to JSON
   */
  exportMetrics(metrics: PerformanceMetrics[], outputPath: string): void {
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      },
      tests: metrics
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Performance report exported to: ${outputPath}`);
  }
}

// Run performance tests
async function runPerformanceTests() {
  console.log('\n🚀 Starting Performance Test Suite');
  console.log('='.repeat(80));
  console.log('⚠️  Note: Run with --expose-gc flag for accurate memory testing');
  console.log('   Example: node --expose-gc dist/temporal/test-performance.js');
  console.log('='.repeat(80));

  const tester = new PerformanceTester();

  try {
    await tester.connect();

    const allMetrics: PerformanceMetrics[] = [];

    // Test 1: Concurrent Execution (10 workflows)
    const concurrentMetrics = await tester.testConcurrentExecution(10);
    allMetrics.push(concurrentMetrics);

    // Wait between tests
    console.log('\n⏸️  Waiting 30 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test 2: Long-Running Stress Test (5 minutes)
    const stressMetrics = await tester.testLongRunningStress(5);
    allMetrics.push(stressMetrics);

    // Wait between tests
    console.log('\n⏸️  Waiting 30 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test 3: Memory Leak Detection (20 iterations)
    const memoryMetrics = await tester.testMemoryLeaks(20);
    allMetrics.push(memoryMetrics);

    // Test 4: System Resources
    await tester.testSystemResources();

    // Export results
    const outputDir = path.join(process.cwd(), 'generated', 'performance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, `performance-report-${Date.now()}.json`);
    tester.exportMetrics(allMetrics, reportPath);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Performance Testing Complete!');
    console.log('='.repeat(80));
    console.log('\n📋 Summary:');
    allMetrics.forEach(m => {
      console.log(`   ${m.testName}:`);
      console.log(`      - ${m.workflowCount} workflows in ${(m.duration / 1000).toFixed(1)}s`);
      console.log(`      - Success rate: ${((m.successCount / m.workflowCount) * 100).toFixed(1)}%`);
      console.log(`      - Throughput: ${m.throughput.toFixed(2)} workflows/min`);
      console.log(`      - Total cost: $${m.totalCost.toFixed(4)}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

runPerformanceTests();
