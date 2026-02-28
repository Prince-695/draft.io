import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import messageModel from '../models/message.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthSocket extends Socket {
  userId?: string;
}

interface TypingData {
  receiverId: string;
}

interface SendMessageData {
  receiverId: string;
  content: string;
}

interface MarkReadData {
  senderId: string;
}

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocketHandlers = (io: Server) => {
  // JWT Authentication middleware for Socket.io
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; userId?: string };
      socket.userId = decoded.user_id ?? decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // Store online user
    onlineUsers.set(userId, socket.id);
    
    // Broadcast online status to all connected clients
    socket.broadcast.emit('user_online', { userId });

    // Join personal room for direct messages
    socket.join(`user:${userId}`);

    /**
     * Send a message to another user
     */
    socket.on('send_message', async (data: SendMessageData) => {
      try {
        const { receiverId, content } = data;

        if (!content || !receiverId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Save message to database
        const message = await messageModel.sendMessage(userId, receiverId, content);

        // Send to receiver if online
        io.to(`user:${receiverId}`).emit('receive_message', {
          ...message,
          _id: message._id?.toString(),
        });

        // Confirm to sender
        socket.emit('message_sent', {
          ...message,
          _id: message._id?.toString(),
        });

        console.log(`📨 Message from ${userId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Typing indicator - start
     */
    socket.on('typing_start', (data: TypingData) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('typing_indicator', {
        senderId: userId,
        isTyping: true,
      });
    });

    /**
     * Typing indicator - stop
     */
    socket.on('typing_stop', (data: TypingData) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('typing_indicator', {
        senderId: userId,
        isTyping: false,
      });
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_read', async (data: MarkReadData) => {
      try {
        const { senderId } = data;
        
        const count = await messageModel.markAsRead(userId, senderId);
        
        // Notify sender that messages were read
        io.to(`user:${senderId}`).emit('messages_read', {
          readBy: userId,
          count,
        });

        console.log(`✅ ${count} messages marked as read by ${userId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    /**
     * Join a specific conversation room
     */
    socket.on('join_conversation', (data: { userId: string }) => {
      const conversationId = messageModel.generateConversationId(userId, data.userId);
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    /**
     * Get online status of a user
     */
    socket.on('check_online', (data: { userId: string }) => {
      const isOnline = onlineUsers.has(data.userId);
      socket.emit('online_status', {
        userId: data.userId,
        isOnline,
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}`);
      
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Broadcast offline status
      socket.broadcast.emit('user_offline', { userId });
    });
  });

  // Heartbeat to keep connections alive
  setInterval(() => {
    io.emit('ping');
  }, 30000); // Every 30 seconds
};

export { onlineUsers };
