import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/mongodb';
import { initializeSocketHandlers } from './controllers/socket.controller';
import messageRoutes from './routes/message.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5007;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

app.use('/conversations', messageRoutes);
app.use('/messages', messageRoutes);

// Initialize Socket.io handlers
initializeSocketHandlers(io);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Chat Service running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
