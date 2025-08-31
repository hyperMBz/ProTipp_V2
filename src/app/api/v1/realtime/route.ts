import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';

// WebSocket server instance
let io: SocketIOServer | null = null;

// Initialize WebSocket server
function initializeWebSocketServer() {
  if (io) return io;

  const httpServer = createServer();
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Validate JWT token (simplified for demo)
    try {
      // In production, you would validate the JWT token here
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // socket.userId = decoded.userId;
      
      // For now, we'll accept any token
      (socket as unknown as { userId: string }).userId = 'demo-user';
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Rate limiting
    let messageCount = 0;
    const rateLimitReset = Date.now() + 60000; // 1 minute

    // Handle ping/pong for latency measurement
    socket.on('ping', (callback: (timestamp: number) => void) => {
      if (typeof callback === 'function') {
        callback(Date.now());
      }
    });

    // Handle heartbeat
    socket.on('heartbeat', (data: { timestamp?: number }) => {
      socket.emit('heartbeat_ack', { timestamp: Date.now() });
    });

    // Handle odds subscription
    socket.on('subscribe_odds', (data: { bookmaker_id?: string; event_id?: string; market?: string }) => {
      const { bookmaker_id, event_id, market } = data;
      
      if (bookmaker_id) {
        socket.join(`odds:${bookmaker_id}`);
      }
      if (event_id) {
        socket.join(`event:${event_id}`);
      }
      if (market) {
        socket.join(`market:${market}`);
      }

      socket.emit('subscription_confirmed', {
        bookmaker_id,
        event_id,
        market,
        timestamp: Date.now()
      });
    });

    // Handle odds unsubscription
    socket.on('unsubscribe_odds', (data: { bookmaker_id?: string; event_id?: string; market?: string }) => {
      const { bookmaker_id, event_id, market } = data;
      
      if (bookmaker_id) {
        socket.leave(`odds:${bookmaker_id}`);
      }
      if (event_id) {
        socket.leave(`event:${event_id}`);
      }
      if (market) {
        socket.leave(`market:${market}`);
      }

      socket.emit('unsubscription_confirmed', {
        bookmaker_id,
        event_id,
        market,
        timestamp: Date.now()
      });
    });

    // Handle custom events with rate limiting
    socket.onAny((eventName: string, ...args: unknown[]) => {
      // Skip internal events
      if (eventName.startsWith('internal_')) return;

      // Rate limiting check
      if (Date.now() > rateLimitReset) {
        messageCount = 0;
      }

      messageCount++;
      if (messageCount > 100) { // 100 messages per minute
        socket.emit('rate_limit_exceeded', {
          retryAfter: Math.ceil((rateLimitReset - Date.now()) / 1000)
        });
        return;
      }

      // Broadcast to other clients
      socket.broadcast.emit(eventName, ...args);
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`Socket error: ${error.message}`);
      socket.emit('error', { message: 'Internal server error' });
    });
  });

  // Start server on port 3001 (or use environment variable)
  const port = process.env.WEBSOCKET_PORT || 3001;
  httpServer.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
  });

  return io;
}

// GET handler for WebSocket connection info
export async function GET(request: NextRequest) {
  try {
    const io = initializeWebSocketServer();
    
    return NextResponse.json({
      status: 'ok',
      message: 'WebSocket server is running',
      connections: io.engine.clientsCount,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('WebSocket server error:', error);
    return NextResponse.json(
      { error: 'WebSocket server error' },
      { status: 500 }
    );
  }
}

// POST handler for sending messages to connected clients
export async function POST(request: NextRequest) {
  try {
    const io = initializeWebSocketServer();
    const body = await request.json();
    const { event, data, room } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Event and data are required' },
        { status: 400 }
      );
    }

    // Validate event name
    if (typeof event !== 'string' || event.length === 0) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      );
    }

    // Send to specific room or all clients
    if (room) {
      io.to(room).emit(event, {
        ...data,
        timestamp: Date.now(),
        source: 'api'
      });
    } else {
      io.emit(event, {
        ...data,
        timestamp: Date.now(),
        source: 'api'
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Event sent successfully',
      event,
      room,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Utility function to broadcast odds updates
function broadcastOddsUpdate(oddsData: { bookmaker_id?: string; event_id?: string; market?: string; [key: string]: unknown }) {
  try {
    const io = initializeWebSocketServer();
    
    // Send to specific bookmaker room
    if (oddsData.bookmaker_id) {
      io.to(`odds:${oddsData.bookmaker_id}`).emit('odds_update', {
        ...oddsData,
        timestamp: Date.now(),
        source: 'system'
      });
    }

    // Send to specific event room
    if (oddsData.event_id) {
      io.to(`event:${oddsData.event_id}`).emit('odds_update', {
        ...oddsData,
        timestamp: Date.now(),
        source: 'system'
      });
    }

    // Send to specific market room
    if (oddsData.market) {
      io.to(`market:${oddsData.market}`).emit('odds_update', {
        ...oddsData,
        timestamp: Date.now(),
        source: 'system'
      });
    }

    // Broadcast to all clients
    io.emit('odds_update', {
      ...oddsData,
      timestamp: Date.now(),
      source: 'system'
    });
  } catch (error) {
    console.error('Error broadcasting odds update:', error);
  }
}

// Utility function to broadcast connection status
function broadcastConnectionStatus(status: { [key: string]: unknown }) {
  try {
    const io = initializeWebSocketServer();
    io.emit('connection_status', {
      ...status,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error broadcasting connection status:', error);
  }
}
