"use client";

import { useConnectionStatus } from '@/hooks/use-websocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WebSocketStatus() {
  const { isConnected, isReconnecting, color, text, connectionId } = useConnectionStatus();

  const getIcon = () => {
    if (isConnected) {
      return <Wifi className="h-4 w-4" />;
    }
    if (isReconnecting) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return <WifiOff className="h-4 w-4" />;
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900';
    }
  };

  const getDotColor = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
          getColorClasses()
        )}
        title={connectionId ? `Connection ID: ${connectionId}` : 'No connection'}
      >
        {getIcon()}
        <span>{text}</span>
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            getDotColor(),
            isConnected && "animate-pulse"
          )}
        />
      </div>
    </div>
  );
}