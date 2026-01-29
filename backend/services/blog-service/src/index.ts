import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import redis from './config/redis';
import { connectMongoDB } from './config/mongodb';
import blogRoutes from './routes/blog.routes';
import tagRoutes from './routes/tag.routes';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/blogs', blogRoutes);
app.use('/taxonomy', tagRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'blog-service',
    timestamp: new Date().toISOString()
  });
});

// Initialize database
const initDatabase = async () => {
  try {
    console.log('🔧 Initializing databases...');
    
    // Connect to PostgreSQL
    await pool.connect();
    console.log('✅ PostgreSQL connected');
    
    // Execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ PostgreSQL schema initialized');
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Connect to Redis
    await redis.ping();
    console.log('✅ Redis connected');
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Blog Service running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Health check: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
