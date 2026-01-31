import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.routes';
import { connectRedis } from './config/redis';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'ai-service',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// AI routes
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected');

    // Check Gemini API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('⚠️  Warning: GOOGLE_GEMINI_API_KEY not set. AI features will not work.');
    }

    app.listen(PORT, () => {
      console.log(`🤖 AI Service running on port ${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/health`);
      console.log(`🚀 API endpoints: http://localhost:${PORT}/api/ai`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
