import { useState, useEffect, useCallback, useRef } from 'react';

export interface WorkflowResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    fileSize?: string;
  };
}

export interface WorkflowProgress {
  operationId: string;
  status: string;
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  currentStage: string;
  progress: number;
  activityLog: string[];
  result?: WorkflowResult;
  details: {
    workflowType: string;
    startTime?: string;
    closeTime?: string;
    historyLength?: number;
  };
}

export interface UseWorkflowProgressReturn {
  progress: WorkflowProgress | null;
  isLoading: boolean;
  error: string | null;
  startTracking: (operationId: string, onComplete?: (result: WorkflowResult | undefined) => void) => void;
  stopTracking: () => void;
}

/**
 * Hook to track real-time workflow progress
 *
 * Polls the backend API every 2 seconds to get workflow status updates
 */
export function useWorkflowProgress(): UseWorkflowProgressReturn {
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef<((result: WorkflowResult | undefined) => void) | null>(null);

  // Fetch workflow status
  const fetchStatus = useCallback(async (opId: string) => {
    try {
      const response = await fetch(`/api/workflow-status/${opId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to fetch workflow status');
        return;
      }

      setProgress(data);
      setError(null);

      // Stop polling if workflow is completed or failed
      if (data.isCompleted || data.isFailed) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Call onComplete callback with result
        if (data.isCompleted && onCompleteRef.current) {
          onCompleteRef.current(data.result);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching workflow status');
      console.error('Error fetching workflow status:', err);
    }
  }, []);

  // Start tracking a workflow
  const startTracking = useCallback((opId: string, onComplete?: (result: WorkflowResult | undefined) => void) => {
    setOperationId(opId);
    setIsLoading(true);
    setError(null);
    setProgress(null);
    onCompleteRef.current = onComplete || null;

    // Initial fetch
    fetchStatus(opId);

    // Poll every 2 seconds
    intervalRef.current = setInterval(() => {
      fetchStatus(opId);
    }, 2000);
  }, [fetchStatus]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setOperationId(null);
    setIsLoading(false);
    setProgress(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update loading state
  useEffect(() => {
    if (progress) {
      setIsLoading(false);
    }
  }, [progress]);

  return {
    progress,
    isLoading,
    error,
    startTracking,
    stopTracking,
  };
}
