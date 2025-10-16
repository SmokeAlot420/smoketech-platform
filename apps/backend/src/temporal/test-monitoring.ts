/**
 * Test Monitoring Utilities
 *
 * Demonstrates usage of logger, metricsCollector, and errorAggregator
 * for workflow monitoring and debugging.
 */

import { logger } from './monitoring/logger.js';
import { metricsCollector } from './monitoring/metrics.js';
import { errorAggregator } from './monitoring/errorAggregator.js';
import * as fs from 'fs';
import * as path from 'path';

async function testMonitoringUtilities() {
  console.log('🧪 Testing Workflow Monitoring Utilities\n');
  console.log('='.repeat(80));

  // ==================================================================
  // Test 1: Structured Logger
  // ==================================================================
  console.log('\n📝 Test 1: Structured Logger\n');

  // Basic logging
  logger.info('Starting monitoring test', { testId: 'monitor-test-001' });
  logger.debug('This is a debug message (only shown if LOG_LEVEL=DEBUG)');
  logger.warn('This is a warning message');

  // Create child logger with inherited context
  const workflowLogger = logger.child({
    workflowId: 'abtest-123',
    workflowType: 'comfyUIWorkflow'
  });

  workflowLogger.info('Processing workflow nodes');
  workflowLogger.debug('Node details', { nodeId: 'character_image', model: 'nanobana' });

  // Log error with stack trace
  try {
    throw new Error('Simulated API timeout');
  } catch (error) {
    workflowLogger.error('Activity failed', { nodeId: 'video_gen' }, error as Error);
  }

  console.log('✅ Structured logging complete');
  console.log('   - Try setting LOG_LEVEL=DEBUG to see debug messages');
  console.log('   - Try setting LOG_FORMAT=json for production logging');

  // ==================================================================
  // Test 2: Performance Metrics
  // ==================================================================
  console.log('\n📊 Test 2: Performance Metrics\n');

  // Simulate workflow execution
  const workflowId = 'metrics-test-workflow';

  // Start tracking workflow
  metricsCollector.startWorkflow(workflowId, 'singleVideoWorkflow');
  logger.info('Started tracking workflow', { workflowId });

  // Simulate multiple nodes
  const nodes = [
    { id: 'character_image', type: 'image_generator', model: 'nanobana', duration: 7000, cost: 0.02 },
    { id: 'video_gen', type: 'video_generator', model: 'veo3-fast', duration: 110000, cost: 0.75 },
    { id: 'video_stitch', type: 'video_processor', model: 'ffmpeg', duration: 5000, cost: 0.001 }
  ];

  for (const node of nodes) {
    // Start node
    metricsCollector.startNode(workflowId, node.id, node.type, node.model);
    logger.info(`Processing node: ${node.id}`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    // End node with metrics
    metricsCollector.endNode(workflowId, node.id, {
      success: true,
      cost: node.cost,
      retryCount: 0
    });
  }

  // Complete workflow
  metricsCollector.endWorkflow(workflowId, true);
  logger.info('Workflow completed successfully', { workflowId });

  // Get metrics
  const workflowMetrics = metricsCollector.getWorkflowMetrics(workflowId);
  if (workflowMetrics) {
    console.log('\n📈 Workflow Metrics:');
    console.log(`   Total Cost: $${workflowMetrics.totalCost.toFixed(4)}`);
    console.log(`   Duration: ${((workflowMetrics.totalDuration || 0) / 1000).toFixed(1)}s`);
    console.log(`   Nodes Executed: ${workflowMetrics.nodesExecuted}`);
    console.log(`   Success Rate: ${workflowMetrics.nodesSucceeded}/${workflowMetrics.nodesExecuted}`);
  }

  // Get aggregated stats
  const stats = metricsCollector.getAggregatedStats();
  console.log('\n📊 Aggregated Stats:');
  console.log(`   Total Workflows: ${stats.totalWorkflows}`);
  console.log(`   Success Rate: ${(stats.successfulWorkflows / stats.totalWorkflows * 100).toFixed(1)}%`);
  console.log(`   Total Cost: $${stats.totalCost.toFixed(4)}`);
  console.log(`   Average Duration: ${(stats.averageDuration / 1000).toFixed(1)}s`);

  console.log('\n   Cost by Model:');
  for (const [model, cost] of stats.costByModel.entries()) {
    console.log(`      ${model}: $${cost.toFixed(4)}`);
  }

  console.log('\n✅ Performance metrics tracking complete');

  // ==================================================================
  // Test 3: Error Aggregation & Alerts
  // ==================================================================
  console.log('\n⚠️  Test 3: Error Aggregation & Alerts\n');

  // Set alert threshold
  errorAggregator.setAlertThreshold('APIError', 3, 60 * 1000); // 3 errors in 1 minute

  // Register alert handler
  errorAggregator.onAlert(async (error) => {
    console.log(`🚨 ALERT TRIGGERED: ${error.errorType}`);
    console.log(`   Workflow: ${error.workflowId}`);
    console.log(`   Message: ${error.errorMessage}`);
    console.log(`   This would send to Slack/PagerDuty in production`);
  });

  // Simulate errors
  console.log('Simulating API errors...');
  for (let i = 1; i <= 4; i++) {
    errorAggregator.recordError({
      timestamp: Date.now(),
      workflowId: 'error-test-workflow',
      nodeId: 'video_gen',
      errorType: 'APIError',
      errorMessage: `Rate limit exceeded (attempt ${i})`,
      errorStack: new Error().stack,
      retryCount: i,
      context: { model: 'veo3-fast', statusCode: 429 }
    });

    console.log(`   Recorded error ${i}/4`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Get error statistics
  const errorStats = errorAggregator.getStats({ since: Date.now() - 60000 }); // Last minute
  console.log('\n📋 Error Statistics:');
  console.log(`   Total Errors: ${errorStats.totalErrors}`);
  console.log(`   Errors by Type:`);
  for (const [type, count] of errorStats.errorsByType.entries()) {
    console.log(`      ${type}: ${count}`);
  }

  // Get workflow errors
  const workflowErrors = errorAggregator.getWorkflowErrors('error-test-workflow');
  console.log(`\n   Errors for error-test-workflow: ${workflowErrors.length}`);

  console.log('\n✅ Error aggregation and alerting complete');

  // ==================================================================
  // Test 4: Export Monitoring Data
  // ==================================================================
  console.log('\n💾 Test 4: Export Monitoring Data\n');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'generated', 'monitoring');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export metrics
  const metricsJSON = metricsCollector.exportToJSON();
  const metricsFile = path.join(outputDir, `metrics-${Date.now()}.json`);
  fs.writeFileSync(metricsFile, metricsJSON);
  console.log(`✅ Metrics exported to: ${metricsFile}`);

  // Export errors
  const errorsJSON = errorAggregator.exportToJSON();
  const errorsFile = path.join(outputDir, `errors-${Date.now()}.json`);
  fs.writeFileSync(errorsFile, errorsJSON);
  console.log(`✅ Errors exported to: ${errorsFile}`);

  console.log('\n📂 Exported Files:');
  console.log(`   Metrics: ${path.relative(process.cwd(), metricsFile)}`);
  console.log(`   Errors: ${path.relative(process.cwd(), errorsFile)}`);

  // ==================================================================
  // Test 5: Cleanup
  // ==================================================================
  console.log('\n🧹 Test 5: Cleanup\n');

  // Clear old metrics (older than 1 hour)
  metricsCollector.clearOld(60 * 60 * 1000);
  console.log('✅ Cleared metrics older than 1 hour');

  // Clear old errors (older than 1 hour)
  errorAggregator.clearOld(60 * 60 * 1000);
  console.log('✅ Cleared errors older than 1 hour');

  console.log('\n' + '='.repeat(80));
  console.log('🎉 All monitoring tests completed successfully!\n');

  console.log('💡 Next Steps:');
  console.log('   1. Integrate monitoring into your workflows');
  console.log('   2. Set up production alerts (Slack, PagerDuty)');
  console.log('   3. Configure log aggregation (CloudWatch, Datadog)');
  console.log('   4. Use Temporal UI for detailed debugging: http://localhost:8233');
  console.log('   5. See docs/TEMPORAL_UI_GUIDE.md for comprehensive guide');
}

// Run tests
testMonitoringUtilities()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
