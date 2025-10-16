import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface WebSocketStatus {
  connected: boolean;
  connectionId?: string;
  reconnectAttempts: number;
  lastPing?: number;
  error?: string;
}

export interface ProgressUpdate {
  operationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  stage?: string;
  estimatedTime?: number;
  elapsedTime?: number;
  result?: any;
  error?: string;
}

export interface WebSocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnectDelay?: number;
  reconnectDelayMax?: number;
  reconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
}

class WebSocketManager extends EventEmitter {
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private status: WebSocketStatus = {
    connected: false,
    reconnectAttempts: 0
  };
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimer: NodeJS.Timeout | null = null;
  private operationSubscriptions: Set<string> = new Set();
  private connectionPromise: Promise<void> | null = null;

  constructor(config: WebSocketConfig = {}) {
    super();
    this.config = {
      url: config.url || 'http://localhost:7778',  // WebSocket server port
      autoConnect: config.autoConnect ?? false,  // Disable auto-connect for now
      reconnectDelay: config.reconnectDelay ?? 1000,
      reconnectDelayMax: config.reconnectDelayMax ?? 30000,
      reconnectAttempts: config.reconnectAttempts ?? 3,  // Limit reconnect attempts
      pingInterval: config.pingInterval ?? 25000,
      pongTimeout: config.pongTimeout ?? 10000
    };

    // Disabled WebSocket auto-connect to prevent errors
    // if (this.config.autoConnect && typeof window !== 'undefined') {
    //   this.connect();
    // }
  }

  public connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.connected) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          transports: ['websocket', 'polling'],
          reconnection: false, // We handle reconnection manually
          timeout: 20000,
          forceNew: true
        });

        this.setupEventHandlers();

        const connectTimeout = setTimeout(() => {
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }, 30000);

        this.socket.once('connect', () => {
          clearTimeout(connectTimeout);
          this.connectionPromise = null;
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(connectTimeout);
          this.connectionPromise = null;
          reject(error);
        });
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.status = {
        connected: true,
        connectionId: this.socket?.id,
        reconnectAttempts: 0
      };
      this.emit('connected', this.status);
      this.startPingInterval();

      // Re-subscribe to operations after reconnection
      this.operationSubscriptions.forEach(operationId => {
        this.socket?.emit('subscribe', { operationId });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.status.connected = false;
      this.emit('disconnected', reason);
      this.stopPingInterval();

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't auto-reconnect
        this.disconnect();
      } else {
        // Client-side disconnect, attempt reconnection
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.status.error = error.message;
      this.emit('error', error);
    });

    // Progress update events
    this.socket.on('progress', (data: ProgressUpdate) => {
      this.emit('progress', data);
      this.emit(`progress:${data.operationId}`, data);
    });

    this.socket.on('operation:complete', (data: any) => {
      this.emit('operation:complete', data);
      this.emit(`complete:${data.operationId}`, data);
      this.unsubscribeFromOperation(data.operationId);
    });

    this.socket.on('operation:error', (data: any) => {
      this.emit('operation:error', data);
      this.emit(`error:${data.operationId}`, data);
      this.unsubscribeFromOperation(data.operationId);
    });

    // Ping/Pong for connection health
    this.socket.on('pong', () => {
      this.status.lastPing = Date.now();
      if (this.pongTimer) {
        clearTimeout(this.pongTimer);
        this.pongTimer = null;
      }
    });

    // Custom events
    this.socket.on('notification', (data: any) => {
      this.emit('notification', data);
    });

    this.socket.on('status:update', (data: any) => {
      this.emit('status:update', data);
    });
  }

  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');

        // Set pong timeout
        this.pongTimer = setTimeout(() => {
          console.warn('Pong timeout - connection may be lost');
          this.socket?.disconnect();
        }, this.config.pongTimeout);
      }
    }, this.config.pingInterval);
  }

  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.status.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect:failed');
      return;
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.status.reconnectAttempts),
      this.config.reconnectDelayMax
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.status.reconnectAttempts + 1})`);
    this.status.reconnectAttempts++;
    this.emit('reconnecting', { attempt: this.status.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPingInterval();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.status = {
      connected: false,
      reconnectAttempts: 0
    };

    this.operationSubscriptions.clear();
    this.emit('disconnected', 'manual');
  }

  public subscribeToOperation(operationId: string): void {
    if (!operationId) return;

    this.operationSubscriptions.add(operationId);

    if (this.socket?.connected) {
      this.socket.emit('subscribe', { operationId });
    }
  }

  public unsubscribeFromOperation(operationId: string): void {
    this.operationSubscriptions.delete(operationId);

    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { operationId });
    }
  }

  public emit(event: string, ...args: any[]): boolean {
    // Override emit to handle both EventEmitter and Socket.IO events
    if (event.startsWith('ws:') && this.socket?.connected) {
      // Custom WebSocket events
      const wsEvent = event.substring(3);
      this.socket.emit(wsEvent, ...args);
    }
    return super.emit(event, ...args);
  }

  public getStatus(): WebSocketStatus {
    return { ...this.status };
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public getConnectionId(): string | undefined {
    return this.socket?.id;
  }

  // Helper method to wait for connection
  public async waitForConnection(timeout = 10000): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off('connected', onConnect);
        reject(new Error('Connection timeout'));
      }, timeout);

      const onConnect = () => {
        clearTimeout(timer);
        resolve();
      };

      this.once('connected', onConnect);

      if (!this.connectionPromise) {
        this.connect().catch(reject);
      }
    });
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(config?: WebSocketConfig): WebSocketManager {
  if (!wsManager && typeof window !== 'undefined') {
    wsManager = new WebSocketManager(config);
  }
  return wsManager!;
}

export function disconnectWebSocket(): void {
  if (wsManager) {
    wsManager.disconnect();
    wsManager = null;
  }
}

export default WebSocketManager;