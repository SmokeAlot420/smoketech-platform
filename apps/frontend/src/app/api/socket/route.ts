import { Server } from 'socket.io';
import { createServer } from 'http';
import { NextRequest } from 'next/server';

// Store for active operations and their subscriptions
const operationSubscriptions = new Map<string, Set<string>>();
const activeOperations = new Map<string, any>();

let io: Server | null = null;

function initializeSocketServer() {
  if (io) return io;

  const httpServer = createServer();

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : ['http://localhost:7777', 'http://localhost:3000'],
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle operation subscriptions
    socket.on('subscribe', ({ operationId }) => {
      if (!operationId) return;

      if (!operationSubscriptions.has(operationId)) {
        operationSubscriptions.set(operationId, new Set());
      }
      operationSubscriptions.get(operationId)?.add(socket.id);

      console.log(`Client ${socket.id} subscribed to operation ${operationId}`);

      // Send current status if operation exists
      const operation = activeOperations.get(operationId);
      if (operation) {
        socket.emit('progress', {
          operationId,
          status: operation.status,
          progress: operation.progress,
          message: operation.message,
          stage: operation.stage,
          estimatedTime: operation.estimatedTime,
          elapsedTime: operation.elapsedTime
        });
      }
    });

    socket.on('unsubscribe', ({ operationId }) => {
      if (!operationId) return;

      const subscribers = operationSubscriptions.get(operationId);
      if (subscribers) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          operationSubscriptions.delete(operationId);
        }
      }

      console.log(`Client ${socket.id} unsubscribed from operation ${operationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove from all subscriptions
      operationSubscriptions.forEach((subscribers, operationId) => {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          operationSubscriptions.delete(operationId);
        }
      });
    });
  });

  // Start listening on a different port for WebSocket
  const wsPort = process.env.WS_PORT || 7778;
  httpServer.listen(wsPort, () => {
    console.log(`WebSocket server listening on port ${wsPort}`);
  });

  return io;
}

// Initialize on module load
if (typeof window === 'undefined') {
  initializeSocketServer();
}

// Export functions to emit events from other parts of the application
export function emitOperationProgress(
  operationId: string,
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    stage?: string;
    estimatedTime?: number;
    elapsedTime?: number;
    result?: any;
    error?: string;
  }
) {
  if (!io) {
    initializeSocketServer();
  }

  // Store operation state
  activeOperations.set(operationId, data);

  // Emit to all subscribed clients
  const subscribers = operationSubscriptions.get(operationId);
  if (subscribers && io) {
    subscribers.forEach((socketId) => {
      const socket = io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('progress', {
          operationId,
          ...data
        });

        // Handle completion/error states
        if (data.status === 'completed') {
          socket.emit('operation:complete', {
            operationId,
            result: data.result
          });
        } else if (data.status === 'failed') {
          socket.emit('operation:error', {
            operationId,
            error: data.error
          });
        }
      }
    });

    // Clean up completed/failed operations
    if (data.status === 'completed' || data.status === 'failed') {
      setTimeout(() => {
        activeOperations.delete(operationId);
        operationSubscriptions.delete(operationId);
      }, 60000); // Keep for 1 minute after completion
    }
  }
}

export function broadcastNotification(type: string, message: string, data?: any) {
  if (!io) {
    initializeSocketServer();
  }

  io?.emit('notification', {
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// API Route handler (minimal, actual WebSocket runs on different port)
export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({
    success: true,
    message: 'WebSocket server is running',
    port: process.env.WS_PORT || 7778
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, operationId, data } = body;

    if (action === 'progress' && operationId && data) {
      emitOperationProgress(operationId, data);
      return new Response(JSON.stringify({
        success: true,
        message: 'Progress update sent'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (action === 'notify' && data) {
      broadcastNotification(data.type || 'info', data.message, data.data);
      return new Response(JSON.stringify({
        success: true,
        message: 'Notification sent'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action or missing data'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}