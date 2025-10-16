/**
 * Workflows Index
 *
 * Export all workflows for Temporal worker bundling
 */

// Export only the workflow functions, NOT signals and queries
// (they have conflicting names and shouldn't be exported from index)
export { singleVideoWorkflow } from './singleVideoWorkflow.js';
export { seriesVideoWorkflow } from './seriesVideoWorkflow.js';
export { comfyUIWorkflow } from './comfyUIWorkflow.js';

// Export types for external use
export type {
  SingleVideoWorkflowInput,
  WorkflowProgress,
  SingleVideoWorkflowResult
} from './singleVideoWorkflow.js';

export type {
  SeriesVideoWorkflowInput,
  VideoScenario,
  SeriesWorkflowProgress,
  SeriesVideoWorkflowResult,
  VideoResult
} from './seriesVideoWorkflow.js';

export type {
  ComfyUIWorkflowInput,
  ComfyUIWorkflowProgress,
  ComfyUIWorkflowResult,
  NodeResult
} from './comfyUIWorkflow.js';
