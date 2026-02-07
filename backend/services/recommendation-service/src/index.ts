import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/database';
import { connectRedis } from './config/redis';
import { initKafkaConsumer } from './kafka/consumer';
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

    // Connect to Redis
    await connectRedis();

    // Initialize Kafka consumer
    await initKafkaConsumer();

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
