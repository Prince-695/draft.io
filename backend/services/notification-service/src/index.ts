// Notification Service - Real-time notifications with WebSocket

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import redis from './config/redis';
import notificationRoutes from './routes/notification.routes';
import { initDatabase } from './models/notification.model';
import { setupSocketHandlers } from './controllers/socket.controller';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5006;

// WebSocket Server
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/notifications', notificationRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    websocket: 'active'
  });
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initDatabase();
    console.log('✅ Database initialized');

    // Start HTTP + WebSocket server
    httpServer.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Notification Service running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
      console.log(`🚀 HTTP Health: http://localhost:${PORT}/health`);
      console.log(`🚀 WebSocket: ws://localhost:${PORT}`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('Failed to start Notification Service:', error);
    process.exit(1);
  }
};

startServer();
