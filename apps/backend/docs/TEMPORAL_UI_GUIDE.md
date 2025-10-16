# Temporal UI Guide - Workflow Monitoring and Debugging

This guide covers how to use the Temporal UI to monitor, debug, and troubleshoot workflows in the Viral Content Generation system.

## Accessing the Temporal UI

**Local Development:**
```bash
# Start Temporal server
"E:\v2 repo\viral\temporal.exe" server start-dev

# Access UI at:
http://localhost:8233
```

**Production:**
- Use Temporal Cloud: https://cloud.temporal.io/
- Or self-hosted Temporal Server with ingress configured

## UI Overview

### Main Dashboard
- **Workflows**: List of all workflow executions
- **Task Queues**: View active task queues and workers
- **Namespaces**: Switch between different environments
- **Archival**: Access archived workflow history

## Monitoring Workflows

### Workflow Execution List

**Filter Options:**
- **Status**: Running, Completed, Failed, Terminated
- **Workflow Type**: `viralContentPipeline`, `comfyUIWorkflow`, etc.
- **Time Range**: Last hour, day, week, custom range
- **Workflow ID**: Search by specific workflow ID

**Key Columns:**
- **Workflow ID**: Unique identifier (e.g., `abtest-1759764637512-nanobana`)
- **Type**: Workflow function name
- **Status**: Current execution state
- **Start Time**: When workflow began
- **End Time**: When workflow completed (if finished)

### Viewing Workflow Details

Click any workflow to see:

1. **Summary Tab**:
   - Workflow status and result
   - Total execution time
   - Input parameters (JSON)
   - Output values (JSON)
   - Parent/child workflow relationships

2. **History Tab**:
   - Complete event history (every state change)
   - Activity executions with start/end times
   - Signals received
   - Timers set and fired
   - Child workflows spawned

3. **Workers Tab**:
   - Which worker executed the workflow
   - Worker version and build ID
   - Task queue name

4. **Queries Tab**:
   - Execute queries like `getStatus()` or `getMetrics()`
   - Get real-time workflow state
   - No workflow restart required

5. **Stack Trace Tab**:
   - Current execution position in code
   - Call stack for debugging
   - Only available for running workflows

## Debugging Failed Workflows

### Step 1: Identify Failure
Navigate to workflow and check:
- **Status**: "Failed" or "Terminated"
- **Failure Message**: Top of Summary tab
- **Last Event**: In History tab

### Step 2: Find Error Details
In History tab, look for:
- `ActivityTaskFailed` events
- `WorkflowExecutionFailed` events
- Expand event to see:
  - Error message
  - Error type
  - Stack trace
  - Activity/workflow name

### Step 3: Check Activity Execution
For `ActivityTaskFailed`:
1. Note the activity name (e.g., `generateAIContent`)
2. Check activity inputs in event details
3. View retry history (if activity was retried)
4. Check error type (timeout, application error, etc.)

### Step 4: Review Workflow Code Path
Use Stack Trace tab to see:
- Current line of code being executed
- Call stack leading to failure
- Variable values at time of failure

## Common Debugging Scenarios

### Scenario 1: Activity Timeout
**Symptoms**: `ActivityTaskFailed` with timeout error

**Steps**:
1. Check activity inputs for large data
2. Review activity timeout settings in workflow code
3. Check worker logs for activity progress
4. Increase timeout if needed

**Fix**:
```typescript
// In workflow code
await executeActivity(generateAIContent, input, {
  startToCloseTimeout: '30 minutes', // Increase timeout
  heartbeatTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3
  }
});
```

### Scenario 2: Workflow Stuck
**Symptoms**: Workflow shows "Running" but no progress

**Steps**:
1. Check History tab for last event
2. Use Queries tab to run `getStatus()` query
3. Check if waiting for signal
4. Check worker logs for deadlock

**Fix**:
- Send signal if workflow is waiting
- Restart worker if deadlocked
- Terminate and retry workflow if corrupted

### Scenario 3: High Cost/Long Duration
**Symptoms**: Workflow completes but takes too long or costs too much

**Steps**:
1. Check History tab for activity durations
2. Identify slowest activities
3. Review activity inputs/outputs
4. Check for redundant API calls

**Fix**:
- Optimize prompts to reduce token usage
- Use parallel activities where possible
- Cache frequent API responses
- Use faster models for non-critical steps

### Scenario 4: Intermittent Failures
**Symptoms**: Same workflow sometimes succeeds, sometimes fails

**Steps**:
1. Compare successful vs failed execution histories
2. Check for rate limits (HTTP 429 errors)
3. Review error types (network vs application)
4. Check for race conditions

**Fix**:
- Add exponential backoff retry logic
- Implement circuit breaker pattern
- Add jitter to parallel requests
- Increase retry attempts

## Using Queries for Real-Time Monitoring

### Available Queries
From workflow code at `src/orchestrator.ts`:

1. **Get Status**:
```bash
# In Temporal UI Queries tab
Query: getStatus
Arguments: (none)

# Returns:
{
  "isRunning": true,
  "isPaused": false,
  "totalBatches": 50,
  "batchesCompleted": 23,
  "totalPosts": 150,
  "postsCompleted": 69,
  "currentPhase": "distribution"
}
```

2. **Get Metrics**:
```bash
Query: getMetrics
Arguments: (none)

# Returns:
{
  "totalContentGenerated": 150,
  "totalDistributed": 69,
  "totalReplicated": 12,
  "successRate": 0.92,
  "averageViralScore": 45.6,
  "topPerformers": [
    { "postId": "post-123", "score": 87.5, "platform": "tiktok" }
  ]
}
```

### When to Use Queries
- Check workflow progress without waiting for completion
- Monitor real-time metrics during long-running workflows
- Debug stuck workflows to see internal state
- Validate workflow behavior during testing

## Performance Monitoring

### Key Metrics to Track

1. **Workflow Duration**:
   - Compare Start Time to End Time
   - Identify outliers (much slower than average)
   - Track trends over time

2. **Activity Duration**:
   - View in History tab
   - Calculate time between `ActivityTaskScheduled` and `ActivityTaskCompleted`
   - Identify bottlenecks

3. **Retry Rate**:
   - Count `ActivityTaskFailed` events with retry
   - High retry rate indicates reliability issues
   - Check error types to identify root cause

4. **Task Queue Backlog**:
   - View in Task Queues page
   - High backlog means workers can't keep up
   - Scale workers or optimize activities

### Export Workflow Data

Use the monitoring utilities to export detailed metrics:

```typescript
import { metricsCollector } from './src/temporal/monitoring/metrics';
import { errorAggregator } from './src/temporal/monitoring/errorAggregator';
import * as fs from 'fs';

// Export all metrics to JSON
const metricsJSON = metricsCollector.exportToJSON();
fs.writeFileSync('workflow-metrics.json', metricsJSON);

// Export all errors to JSON
const errorsJSON = errorAggregator.exportToJSON();
fs.writeFileSync('workflow-errors.json', errorsJSON);
```

## Best Practices

### 1. Use Structured Workflow IDs
```typescript
// Good: Includes type, timestamp, variant
const workflowId = `abtest-${Date.now()}-${variant.id}`;

// Bad: Generic or random
const workflowId = `workflow-${Math.random()}`;
```

### 2. Add Business Context to Events
```typescript
// In workflow code
await executeActivity(generateVideo, {
  prompt: input.prompt,
  metadata: {
    personaId: 'sophia-influencer',
    seriesId: 'viral-series-001',
    platform: 'tiktok'
  }
});
```

### 3. Implement Detailed Logging
```typescript
import { logger } from './src/temporal/monitoring/logger';

logger.info('Starting video generation', {
  workflowId: workflowInfo().workflowId,
  nodeId: 'video_gen',
  model: 'veo3-fast'
});
```

### 4. Set Reasonable Timeouts
```typescript
// Too short: Causes false timeouts
startToCloseTimeout: '1 minute' // Bad for video generation

// Too long: Masks real issues
startToCloseTimeout: '24 hours' // Bad for quick API calls

// Just right: Based on actual performance
startToCloseTimeout: '5 minutes' // Good for video generation
```

### 5. Use Retry Policies
```typescript
retry: {
  initialInterval: '1 second',
  backoffCoefficient: 2,
  maximumInterval: '1 minute',
  maximumAttempts: 3,
  nonRetryableErrorTypes: ['ValidationError']
}
```

## Troubleshooting Common Issues

### Issue: Workflow Not Appearing in UI
**Cause**: Worker not connected or workflow not started

**Fix**:
1. Check worker is running: `npm run worker`
2. Verify task queue matches: `comfyui-test-queue`
3. Check workflow starter logs for errors

### Issue: "Workflow Execution Already Started"
**Cause**: Duplicate workflow ID

**Fix**:
1. Use unique workflow IDs (include timestamp)
2. Or use workflow ID reuse policy:
```typescript
await client.workflow.start('myWorkflow', {
  workflowId: 'my-workflow',
  workflowIdReusePolicy: 'ALLOW_DUPLICATE'
});
```

### Issue: Stack Trace Not Available
**Cause**: Workflow is not running or stack trace disabled

**Fix**:
- Stack traces only work for running workflows
- Enable in worker options if disabled:
```typescript
const worker = await Worker.create({
  enableNonLocalActivities: true
});
```

### Issue: Query Fails with "Not Registered"
**Cause**: Query not defined in workflow

**Fix**:
1. Add query to workflow code:
```typescript
import { defineQuery, setHandler } from '@temporalio/workflow';

const myQuery = defineQuery<string>('myQuery');

export async function myWorkflow() {
  setHandler(myQuery, () => 'result');
}
```

## Additional Resources

- **Temporal Docs**: https://docs.temporal.io/
- **Temporal UI Guide**: https://docs.temporal.io/web-ui
- **Workflow Debugging**: https://docs.temporal.io/develop/typescript/debugging
- **Production Deployment**: https://docs.temporal.io/production-deployment

## Integration with Monitoring Utilities

The Temporal UI works seamlessly with our custom monitoring utilities:

1. **Structured Logs**: Set `LOG_FORMAT=json` to export logs to aggregation service
2. **Metrics Export**: Use `metricsCollector.exportToJSON()` for external analysis
3. **Error Alerts**: Configure `errorAggregator` to send alerts to Slack/PagerDuty

See `CLAUDE.md` monitoring section for detailed usage of monitoring utilities.
