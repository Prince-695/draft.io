// API Gateway - Single Entry Point for All Microservices
// Routes all requests to the appropriate backend service

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { rateLimiter } from './middleware/rate-limiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan('combined')); // Request logging

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Expose custom AI quota headers so the browser JS can read them
  exposedHeaders: ['X-AI-Requests-Used', 'X-AI-Requests-Limit', 'X-AI-Requests-Remaining'],
}));

// Only parse JSON for non-proxied routes
app.use('/health', express.json());
app.use('/status', express.json());

// Apply rate limiting to all routes
app.use(rateLimiter);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Service Status Check
app.get('/status', async (req: Request, res: Response) => {
  const services = {
    auth: process.env.AUTH_SERVICE_URL,
    user: process.env.USER_SERVICE_URL,
    blog: process.env.BLOG_SERVICE_URL,
    engagement: process.env.ENGAGEMENT_SERVICE_URL,
    ai: process.env.AI_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
    chat: process.env.CHAT_SERVICE_URL,
    recommendation: process.env.RECOMMENDATION_SERVICE_URL
  };

  res.json({
    gateway: 'running',
    services,
    timestamp: new Date().toISOString()
  });
});

// Proxy Routes - Forward requests to microservices

// Auth Service - Authentication & Authorization
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Auth service unavailable'
    });
  }
}));

// User Service - User profiles, follows
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('User Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'User service unavailable'
    });
  }
}));

// Blog Service - Blog CRUD operations
app.use('/api/blogs', createProxyMiddleware({
  target: process.env.BLOG_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/blogs': '/blogs'
  },
  onError: (err, req, res) => {
    console.error('Blog Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Blog service unavailable'
    });
  }
}));

// Engagement Service - Likes, comments, bookmarks
app.use('/api/engagement', createProxyMiddleware({
  target: process.env.ENGAGEMENT_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/engagement': '/engagement'
  },
  onError: (err, req, res) => {
    console.error('Engagement Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Engagement service unavailable'
    });
  }
}));

// AI Service - AI-powered content generation
app.use('/api/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ai': '/api/ai'
  },
  onError: (err, req, res) => {
    console.error('AI Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}));

// Notification Service - Real-time notifications
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/notifications': '/notifications'
  },
  onError: (err, req, res) => {
    console.error('Notification Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Notification service unavailable'
    });
  }
}));

// Chat Service - Real-time messaging
app.use('/api/chat', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL || 'http://localhost:5007',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/chat': ''
  },
  onError: (err, req, res) => {
    console.error('Chat Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Chat service unavailable'
    });
  }
}));

// Recommendation Service - Personalized blog recommendations
app.use('/api/recommendations', createProxyMiddleware({
  target: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5008',
  changeOrigin: true,
  pathRewrite: {
    '^/api/recommendations': '/api/recommendations'
  },
  onError: (err, req, res) => {
    console.error('Recommendation Service Proxy Error:', err.message);
    (res as Response).status(503).json({
      success: false,
      error: 'Recommendation service unavailable'
    });
  }
}));

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Gateway Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal gateway error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Health check: http://localhost:${PORT}/health`);
  console.log('🚀 ========================================');
  console.log('📡 Proxying to services:');
  console.log(`   - Auth: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   - User: ${process.env.USER_SERVICE_URL}`);
  console.log(`   - Blog: ${process.env.BLOG_SERVICE_URL}`);
  console.log(`   - Engagement: ${process.env.ENGAGEMENT_SERVICE_URL}`);
  console.log(`   - AI: ${process.env.AI_SERVICE_URL}`);
  console.log(`   - Notification: ${process.env.NOTIFICATION_SERVICE_URL}`);
  console.log('🚀 ========================================');
});
