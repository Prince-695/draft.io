import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/database';
import { connectRedis } from './config/redis';
// Kafka removed
import recommendationRoutes from './routes/recommendation.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'recommendation-service' });
});

app.use('/api/recommendations', recommendationRoutes);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initDB();

    // Connect to Redis (non-fatal — service works without it)
    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('⚠️  Redis unavailable, continuing without cache:', (redisError as any)?.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Recommendation Service running on port ${PORT}`);
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
  process.exit(0);
});
