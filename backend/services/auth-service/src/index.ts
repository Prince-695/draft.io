// Main Server File - Entry point for Auth Service
// This is where everything comes together!

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import pool from './config/database';
import redis from './config/redis';
import passport from './config/passport';
import { swaggerSpec } from './config/swagger';

// Load environment variables from .env file
dotenv.config();

/**
 * What happens in this file?
 * 1. Create Express app
 * 2. Setup middleware (CORS, JSON parser)
 * 3. Connect to databases (PostgreSQL, Redis)
 * 4. Setup routes
 * 5. Start server
 */

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE
// ============================================

/**
 * CORS - Cross-Origin Resource Sharing
 * Allows frontend (localhost:3000) to call backend (localhost:5001)
 * Without this, browser blocks the requests!
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,  // Allow cookies
}));

/**
 * Body Parser - Parse JSON requests
 * Converts: '{"email":"test@example.com"}' → { email: "test@example.com" }
 */
app.use(express.json());

/**
 * URL Encoded - Parse form data
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Initialize Passport
 */
app.use(passport.initialize());

// ============================================
// ROUTES
// ============================================

/**
 * Health check route
 * GET /health
 * Returns: { status: "ok", service: "auth-service" }
 * Used by monitoring tools to check if service is running
 * 
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: auth-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Swagger API Documentation
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Draft.IO Auth API Docs',
}));

/**
 * Auth routes
 * All routes prefixed with /auth
 * Example: POST /auth/register, POST /auth/login
 */
app.use('/auth', authRoutes);

/**
 * OAuth routes
 * Google OAuth: GET /auth/google, GET /auth/google/callback
 */
app.use('/auth', oauthRoutes);

/**
 * 404 Not Found
 * This runs if no route matches
 */
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

/**
 * Initialize database schema
 * This creates tables if they don't exist
 */
const initDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');
    
    // Read and execute schema.sql file
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    await pool.query(schema);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't exit - let server try to start anyway
  }
};

// ============================================
// START SERVER
// ============================================

/**
 * Start the Express server
 */
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    
    // Test database connections
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');
    
    await redis.ping();
    console.log('✅ Redis connected');
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Auth Service running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Health check: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);  // Exit with error
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  await pool.end();
  await redis.quit();
  process.exit(0);
});

// Start the server!
startServer();

export default app;
