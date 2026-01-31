// WebSocket Controller - Handles real-time connections and events

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import redis from '../config/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Setup WebSocket event handlers
export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string };
      socket.userId = decoded.user_id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`✅ User ${userId} connected to notifications`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Mark user as online
    await redis.set(`online:${userId}`, '1', { EX: 300 }); // 5 min expiry

    // Heartbeat to keep user online
    const heartbeatInterval = setInterval(async () => {
      await redis.set(`online:${userId}`, '1', { EX: 300 });
    }, 60000); // Every minute

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User ${userId} disconnected from notifications`);
      clearInterval(heartbeatInterval);
      await redis.del(`online:${userId}`);
    });

    // Mark notification as read
    socket.on('mark_read', async (notificationId: string) => {
      // Will be handled by HTTP endpoint, this is just for real-time acknowledgment
      socket.emit('notification_read', { notificationId });
    });
  });
};

// Send notification to specific user
export const sendNotificationToUser = (io: SocketIOServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
