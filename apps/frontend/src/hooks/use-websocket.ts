import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketManager, WebSocketStatus, ProgressUpdate, disconnectWebSocket } from '@/lib/websocket-manager';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnecting?: (attempt: number, delay: number) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    reconnectAttempts: 0
  });
  const [isReconnecting, setIsReconnecting] = useState(false);
  const managerRef = useRef<ReturnType<typeof getWebSocketManager>>();

  useEffect(() => {
    const manager = getWebSocketManager({
      autoConnect: options.autoConnect ?? true
    });
    managerRef.current = manager;

    // Update status
    const updateStatus = () => {
      setStatus(manager.getStatus());
    };

    // Event handlers
    const handleConnect = () => {
      setStatus(manager.getStatus());
      setIsReconnecting(false);
      options.onConnect?.();
    };

    const handleDisconnect = (reason: string) => {
      setStatus(manager.getStatus());
      options.onDisconnect?.(reason);
    };

    const handleError = (error: Error) => {
      setStatus(manager.getStatus());
      options.onError?.(error);
    };

    const handleReconnecting = (data: { attempt: number; delay: number }) => {
      setIsReconnecting(true);
      options.onReconnecting?.(data.attempt, data.delay);
    };

    const handleReconnectFailed = () => {
      setIsReconnecting(false);
    };

    // Attach event listeners
    manager.on('connected', handleConnect);
    manager.on('disconnected', handleDisconnect);
    manager.on('error', handleError);
    manager.on('reconnecting', handleReconnecting);
    manager.on('reconnect:failed', handleReconnectFailed);

    // Initial status
    updateStatus();

    // Cleanup
    return () => {
      manager.off('connected', handleConnect);
      manager.off('disconnected', handleDisconnect);
      manager.off('error', handleError);
      manager.off('reconnecting', handleReconnecting);
      manager.off('reconnect:failed', handleReconnectFailed);
    };
  }, [options.autoConnect]);

  const connect = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
  }, []);

  return {
    status,
    isReconnecting,
    connect,
    disconnect,
    manager: managerRef.current
  };
}

// Hook for subscribing to operation progress
export function useOperationProgress(operationId: string | null) {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<ReturnType<typeof getWebSocketManager>>();

  useEffect(() => {
    if (!operationId) return;

    const manager = getWebSocketManager();
    managerRef.current = manager;

    // Subscribe to operation
    manager.subscribeToOperation(operationId);

    // Event handlers
    const handleProgress = (data: ProgressUpdate) => {
      if (data.operationId === operationId) {
        setProgress(data);
        setError(null);
      }
    };

    const handleComplete = (data: any) => {
      if (data.operationId === operationId) {
        setIsComplete(true);
        setProgress({
          operationId,
          status: 'completed',
          progress: 100,
          result: data.result
        });
      }
    };

    const handleError = (data: any) => {
      if (data.operationId === operationId) {
        setError(data.error || 'Operation failed');
        setProgress({
          operationId,
          status: 'failed',
          progress: progress?.progress || 0,
          error: data.error
        });
      }
    };

    // Listen to specific operation events
    manager.on(`progress:${operationId}`, handleProgress);
    manager.on(`complete:${operationId}`, handleComplete);
    manager.on(`error:${operationId}`, handleError);

    // Cleanup
    return () => {
      manager.off(`progress:${operationId}`, handleProgress);
      manager.off(`complete:${operationId}`, handleComplete);
      manager.off(`error:${operationId}`, handleError);
      manager.unsubscribeFromOperation(operationId);
    };
  }, [operationId]);

  return {
    progress,
    isComplete,
    error,
    status: progress?.status || 'pending'
  };
}

// Hook for connection status indicator
export function useConnectionStatus() {
  const { status, isReconnecting } = useWebSocket({ autoConnect: false });

  const getStatusColor = useCallback(() => {
    if (status.connected) return 'green';
    if (isReconnecting) return 'yellow';
    return 'red';
  }, [status.connected, isReconnecting]);

  const getStatusText = useCallback(() => {
    if (status.connected) return 'Connected';
    if (isReconnecting) return `Reconnecting (${status.reconnectAttempts})`;
    return 'Disconnected';
  }, [status.connected, isReconnecting, status.reconnectAttempts]);

  return {
    isConnected: status.connected,
    isReconnecting,
    color: getStatusColor(),
    text: getStatusText(),
    connectionId: status.connectionId
  };
}