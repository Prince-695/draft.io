import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pool from './config/database';
import redis from './config/redis';
import profileRoutes from './routes/profile.routes';
import followRoutes from './routes/follow.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// Routes
app.use('/users/profile', profileRoutes);
app.use('/users', followRoutes);

// Database initialization
const initDatabase = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing database...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('✅ Database initialized successfully');
  } catch (error: any) {
    // Ignore "already exists" errors
    if (!error.message.includes('already exists')) {
      console.error('❌ Database initialization error:', error.message);
      throw error;
    }
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    // Test Redis connection
    await redis.ping();

    // Initialize database
    await initDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 User Service running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Health check: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, closing connections...');
  await pool.end();
  await redis.quit();
  process.exit(0);
});

startServer();
