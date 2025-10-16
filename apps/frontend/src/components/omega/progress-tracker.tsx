"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOperationProgress, useConnectionStatus } from "@/hooks/use-websocket";
import {
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  Play,
  X,
  Wifi,
  WifiOff,
  TrendingUp
} from "lucide-react";

export interface OmegaOperation {
  operationId: string;
  character: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  elapsedTime: number;
  estimatedTime: number;
  videoPath?: string;
  metrics?: {
    viralScore?: number;
    totalCost?: number;
    generationTime?: number;
    engineUtilization?: number;
  };
  lastChecked?: string;
  refreshInterval?: number | null;
  canCancel?: boolean;
}

interface ProgressTrackerProps {
  operation: OmegaOperation;
  onStatusUpdate?: (operation: OmegaOperation) => void;
  onCancel?: (operationId: string) => void;
  onPause?: (operationId: string) => void;
  onResume?: (operationId: string) => void;
  showControls?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pending',
    description: 'Waiting to start generation...'
  },
  processing: {
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Processing',
    description: 'Generating your content...'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Completed',
    description: 'Generation successful!'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Failed',
    description: 'Generation failed'
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Cancelled',
    description: 'Generation was cancelled'
  }
};

export function ProgressTracker({
  operation,
  onStatusUpdate,
  onCancel,
  onPause,
  onResume,
  showControls = true,
  compact = false
}: ProgressTrackerProps) {
  // Use WebSocket hooks for real-time updates
  const { progress, status: wsStatus, error: wsError } = useOperationProgress(operation.operationId);
  const { isConnected, isReconnecting, color: connectionColor } = useConnectionStatus();

  // Merge WebSocket updates with the operation data
  const [currentOperation, setCurrentOperation] = useState<OmegaOperation>(operation);

  // Update operation when WebSocket receives progress updates
  useEffect(() => {
    if (progress) {
      const updatedOperation: OmegaOperation = {
        ...currentOperation,
        status: progress.status,
        progress: progress.progress,
        elapsedTime: progress.elapsedTime || currentOperation.elapsedTime,
        estimatedTime: progress.estimatedTime || currentOperation.estimatedTime,
        lastChecked: new Date().toISOString()
      };

      setCurrentOperation(updatedOperation);

      if (onStatusUpdate) {
        onStatusUpdate(updatedOperation);
      }
    }
  }, [progress]);

  // Update operation from props
  useEffect(() => {
    setCurrentOperation(operation);
  }, [operation]);

  const statusConfig = STATUS_CONFIG[currentOperation.status];
  const StatusIcon = statusConfig.icon;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`;
  };

  const handleCancel = () => {
    if (onCancel && currentOperation.canCancel) {
      onCancel(currentOperation.operationId);
    }
  };

  const handlePause = () => {
    if (onPause) {
      onPause(currentOperation.operationId);
    }
  };

  const handleResume = () => {
    if (onResume) {
      onResume(currentOperation.operationId);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <div className={`p-1 rounded-full ${statusConfig.bgColor}`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{currentOperation.character}</span>
            <Badge variant="outline" className="text-xs">
              {statusConfig.label}
            </Badge>
            {wsError && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>
          <Progress value={currentOperation.progress} className="h-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {currentOperation.progress}%
          </div>
          {isReconnecting && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            </div>
            Generation Progress
            <div className="flex items-center gap-1 ml-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : isReconnecting ? (
                <Wifi className="w-4 h-4 text-yellow-600 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              {progress && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              {currentOperation.status === 'processing' && (
                <>
                  <Button size="sm" variant="outline" onClick={handlePause}>
                    <Pause className="w-4 h-4" />
                  </Button>
                  {currentOperation.canCancel && (
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
              {currentOperation.status === 'pending' && currentOperation.canCancel && (
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Character */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={statusConfig.bgColor + ' ' + statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm font-medium">{currentOperation.character}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {wsError ? wsError : statusConfig.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentOperation.progress}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={currentOperation.progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{currentOperation.progress}/100</span>
          </div>
        </div>

        {/* Time and Cost Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium">
                {formatTime(currentOperation.elapsedTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                / {formatTime(currentOperation.estimatedTime)} est.
              </div>
            </div>
          </div>

          {currentOperation.metrics?.totalCost && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">
                  {formatCost(currentOperation.metrics.totalCost)}
                </div>
                <div className="text-xs text-muted-foreground">Cost</div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Metrics */}
        {currentOperation.status === 'completed' && currentOperation.metrics && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            {currentOperation.metrics.viralScore && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">
                    {currentOperation.metrics.viralScore}/100
                  </div>
                  <div className="text-xs text-muted-foreground">Viral Score</div>
                </div>
              </div>
            )}

            {currentOperation.metrics.generationTime && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium">
                    {formatTime(currentOperation.metrics.generationTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">Generation Time</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        {currentOperation.lastChecked && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {new Date(currentOperation.lastChecked).toLocaleTimeString()}
            {isReconnecting && " • Reconnecting..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for managing progress tracking with WebSocket integration
export function useProgressTracking(operationId: string) {
  const [operation, setOperation] = useState<OmegaOperation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use WebSocket hooks for real-time updates
  const { progress, status: wsStatus, error: wsError } = useOperationProgress(operationId);
  const { isConnected } = useConnectionStatus();

  // Initial fetch to get full operation data
  const fetchStatus = useCallback(async () => {
    if (!operationId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/omega-status/${operationId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data = await response.json();
      setOperation(data);
    } catch (err) {
      console.error('Failed to fetch initial status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [operationId]);

  // Update operation when WebSocket receives updates
  useEffect(() => {
    if (progress && operation) {
      const updatedOperation: OmegaOperation = {
        ...operation,
        status: progress.status,
        progress: progress.progress,
        elapsedTime: progress.elapsedTime || operation.elapsedTime,
        estimatedTime: progress.estimatedTime || operation.estimatedTime,
        lastChecked: new Date().toISOString()
      };

      // If we have result data, update metrics
      if (progress.result) {
        updatedOperation.videoPath = progress.result.videoPath;
        updatedOperation.metrics = progress.result.metrics;
      }

      setOperation(updatedOperation);
    }
  }, [progress]);

  const cancelOperation = useCallback(async () => {
    if (!operationId) return;

    try {
      const response = await fetch(`/api/omega-status/${operationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });

      if (response.ok && operation) {
        setOperation({ ...operation, status: 'cancelled' });
      }
    } catch (err) {
      console.error('Failed to cancel operation:', err);
    }
  }, [operationId, operation]);

  // Initial fetch on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    operation,
    isLoading,
    error: wsError,
    isConnected,
    refetch: fetchStatus,
    cancel: cancelOperation,
  };
}