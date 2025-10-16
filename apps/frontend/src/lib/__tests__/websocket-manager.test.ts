import { EventEmitter } from 'events';
import { getWebSocketManager, disconnectWebSocket } from '../websocket-manager';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('WebSocketManager', () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock socket that extends EventEmitter
    mockSocket = new EventEmitter() as any;
    mockSocket.connected = false;
    mockSocket.id = 'test-socket-id';
    mockSocket.emit = jest.fn((event, data) => {
      // Simulate server response for certain events
      if (event === 'ping') {
        setImmediate(() => mockSocket.emit('pong'));
      }
      return mockSocket;
    });
    mockSocket.on = jest.fn(mockSocket.on.bind(mockSocket));
    mockSocket.once = jest.fn(mockSocket.once.bind(mockSocket));
    mockSocket.off = jest.fn(mockSocket.off.bind(mockSocket));
    mockSocket.removeAllListeners = jest.fn(mockSocket.removeAllListeners.bind(mockSocket));
    mockSocket.disconnect = jest.fn();

    (io as jest.Mock).mockReturnValue(mockSocket);

    // Clean up any existing manager
    disconnectWebSocket();
  });

  afterEach(() => {
    disconnectWebSocket();
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should create singleton instance', () => {
      const manager1 = getWebSocketManager();
      const manager2 = getWebSocketManager();

      expect(manager1).toBe(manager2);
      expect(io).toHaveBeenCalledTimes(1);
    });

    it('should auto-connect by default', async () => {
      const manager = getWebSocketManager({ autoConnect: true });

      // Simulate successful connection
      mockSocket.connected = true;
      mockSocket.emit('connect');

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          transports: ['websocket', 'polling'],
          reconnection: false,
          timeout: 20000,
          forceNew: true
        })
      );
    });

    it('should not auto-connect when disabled', () => {
      getWebSocketManager({ autoConnect: false });

      expect(io).not.toHaveBeenCalled();
    });

    it('should handle connection success', async () => {
      const manager = getWebSocketManager();
      const connectHandler = jest.fn();

      manager.on('connected', connectHandler);

      // Simulate connection
      await manager.connect();
      mockSocket.connected = true;
      mockSocket.emit('connect');

      expect(connectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: true,
          connectionId: 'test-socket-id',
          reconnectAttempts: 0
        })
      );
    });

    it('should handle connection failure', async () => {
      const manager = getWebSocketManager();
      const errorHandler = jest.fn();

      manager.on('error', errorHandler);

      // Simulate connection error
      const error = new Error('Connection failed');
      mockSocket.emit('connect_error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle disconnection', () => {
      const manager = getWebSocketManager();
      const disconnectHandler = jest.fn();

      manager.on('disconnected', disconnectHandler);

      mockSocket.connected = true;
      mockSocket.emit('connect');
      mockSocket.emit('disconnect', 'transport close');

      expect(disconnectHandler).toHaveBeenCalledWith('transport close');
      expect(manager.isConnected()).toBe(false);
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should attempt reconnection on disconnect', () => {
      const manager = getWebSocketManager({
        reconnectDelay: 1000,
        reconnectAttempts: 3
      });

      const reconnectingHandler = jest.fn();
      manager.on('reconnecting', reconnectingHandler);

      // Simulate disconnect that should trigger reconnect
      mockSocket.emit('disconnect', 'transport error');

      // Advance timer to trigger reconnection
      jest.advanceTimersByTime(1000);

      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        delay: 1000
      });
    });

    it('should use exponential backoff for reconnection', () => {
      const manager = getWebSocketManager({
        reconnectDelay: 1000,
        reconnectDelayMax: 10000
      });

      const reconnectingHandler = jest.fn();
      manager.on('reconnecting', reconnectingHandler);

      // First disconnect
      mockSocket.emit('disconnect', 'transport error');
      jest.advanceTimersByTime(1000);
      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        delay: 1000
      });

      // Simulate failed reconnection
      mockSocket.emit('connect_error', new Error('Still failing'));

      // Second attempt with exponential backoff
      jest.advanceTimersByTime(2000);
      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 2,
        delay: 2000
      });
    });

    it('should stop reconnecting after max attempts', () => {
      const manager = getWebSocketManager({
        reconnectDelay: 100,
        reconnectAttempts: 2
      });

      const failHandler = jest.fn();
      manager.on('reconnect:failed', failHandler);

      // First disconnect
      mockSocket.emit('disconnect', 'transport error');
      jest.advanceTimersByTime(100);

      // Fail first reconnect
      mockSocket.emit('connect_error', new Error('Fail 1'));
      jest.advanceTimersByTime(200);

      // Fail second reconnect
      mockSocket.emit('connect_error', new Error('Fail 2'));
      jest.advanceTimersByTime(400);

      // Should emit reconnect:failed
      expect(failHandler).toHaveBeenCalled();
    });

    it('should not reconnect on server-initiated disconnect', () => {
      const manager = getWebSocketManager();
      const reconnectingHandler = jest.fn();

      manager.on('reconnecting', reconnectingHandler);

      // Server-initiated disconnect
      mockSocket.emit('disconnect', 'io server disconnect');

      jest.advanceTimersByTime(10000);

      expect(reconnectingHandler).not.toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Operation Subscriptions', () => {
    it('should subscribe to operation', () => {
      const manager = getWebSocketManager();
      mockSocket.connected = true;

      manager.subscribeToOperation('op-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', {
        operationId: 'op-123'
      });
    });

    it('should unsubscribe from operation', () => {
      const manager = getWebSocketManager();
      mockSocket.connected = true;

      manager.subscribeToOperation('op-123');
      manager.unsubscribeFromOperation('op-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe', {
        operationId: 'op-123'
      });
    });

    it('should re-subscribe after reconnection', () => {
      const manager = getWebSocketManager();

      // Subscribe while connected
      mockSocket.connected = true;
      manager.subscribeToOperation('op-123');
      manager.subscribeToOperation('op-456');

      // Clear mock calls
      mockSocket.emit.mockClear();

      // Simulate reconnection
      mockSocket.emit('connect');

      // Should re-subscribe to all operations
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', {
        operationId: 'op-123'
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', {
        operationId: 'op-456'
      });
    });

    it('should handle progress updates', () => {
      const manager = getWebSocketManager();
      const progressHandler = jest.fn();
      const specificHandler = jest.fn();

      manager.on('progress', progressHandler);
      manager.on('progress:op-123', specificHandler);

      const progressData = {
        operationId: 'op-123',
        status: 'processing' as const,
        progress: 50,
        message: 'Processing...'
      };

      mockSocket.emit('progress', progressData);

      expect(progressHandler).toHaveBeenCalledWith(progressData);
      expect(specificHandler).toHaveBeenCalledWith(progressData);
    });

    it('should handle operation completion', () => {
      const manager = getWebSocketManager();
      const completeHandler = jest.fn();
      const specificHandler = jest.fn();

      manager.subscribeToOperation('op-123');
      manager.on('operation:complete', completeHandler);
      manager.on('complete:op-123', specificHandler);

      const completeData = {
        operationId: 'op-123',
        result: { videoPath: '/path/to/video.mp4' }
      };

      mockSocket.emit('operation:complete', completeData);

      expect(completeHandler).toHaveBeenCalledWith(completeData);
      expect(specificHandler).toHaveBeenCalledWith(completeData);
    });

    it('should handle operation error', () => {
      const manager = getWebSocketManager();
      const errorHandler = jest.fn();
      const specificHandler = jest.fn();

      manager.subscribeToOperation('op-123');
      manager.on('operation:error', errorHandler);
      manager.on('error:op-123', specificHandler);

      const errorData = {
        operationId: 'op-123',
        error: 'Generation failed'
      };

      mockSocket.emit('operation:error', errorData);

      expect(errorHandler).toHaveBeenCalledWith(errorData);
      expect(specificHandler).toHaveBeenCalledWith(errorData);
    });
  });

  describe('Health Check (Ping/Pong)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should send periodic pings', () => {
      const manager = getWebSocketManager({ pingInterval: 5000 });

      mockSocket.connected = true;
      mockSocket.emit('connect');

      // Clear initial calls
      mockSocket.emit.mockClear();

      // Advance timer to trigger ping
      jest.advanceTimersByTime(5000);

      expect(mockSocket.emit).toHaveBeenCalledWith('ping');
    });

    it('should handle pong response', () => {
      const manager = getWebSocketManager({ pingInterval: 5000 });

      mockSocket.connected = true;
      mockSocket.emit('connect');

      jest.advanceTimersByTime(5000);

      // Simulate pong response
      mockSocket.emit('pong');

      // Status should be updated with last ping time
      const status = manager.getStatus();
      expect(status.lastPing).toBeDefined();
    });

    it('should disconnect on pong timeout', () => {
      const manager = getWebSocketManager({
        pingInterval: 5000,
        pongTimeout: 2000
      });

      mockSocket.connected = true;
      mockSocket.emit('connect');

      // Remove automatic pong response for this test
      mockSocket.emit = jest.fn();

      // Trigger ping
      jest.advanceTimersByTime(5000);

      // Don't send pong, wait for timeout
      jest.advanceTimersByTime(2001);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should return connection status', () => {
      const manager = getWebSocketManager();

      expect(manager.isConnected()).toBe(false);

      mockSocket.connected = true;
      expect(manager.isConnected()).toBe(true);
    });

    it('should return connection ID', () => {
      const manager = getWebSocketManager();

      expect(manager.getConnectionId()).toBeUndefined();

      mockSocket.connected = true;
      mockSocket.emit('connect');

      expect(manager.getConnectionId()).toBe('test-socket-id');
    });

    it('should return status object', () => {
      const manager = getWebSocketManager();

      const status = manager.getStatus();

      expect(status).toEqual({
        connected: false,
        reconnectAttempts: 0
      });
    });

    it('should wait for connection', async () => {
      jest.useFakeTimers();
      const manager = getWebSocketManager({ autoConnect: false });

      const promise = manager.waitForConnection(5000);

      // Simulate connection after delay
      setTimeout(() => {
        mockSocket.connected = true;
        manager.emit('connected');
      }, 1000);

      jest.advanceTimersByTime(1000);

      await expect(promise).resolves.toBeUndefined();
      jest.useRealTimers();
    });

    it('should timeout waiting for connection', async () => {
      jest.useFakeTimers();
      const manager = getWebSocketManager({ autoConnect: false });

      const promise = manager.waitForConnection(1000);

      jest.advanceTimersByTime(1001);

      await expect(promise).rejects.toThrow('Connection timeout');
      jest.useRealTimers();
    });

    it('should handle disconnect method', () => {
      const manager = getWebSocketManager();
      mockSocket.connected = true;

      manager.subscribeToOperation('op-123');
      manager.disconnect();

      expect(mockSocket.removeAllListeners).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(manager.isConnected()).toBe(false);
    });
  });
});