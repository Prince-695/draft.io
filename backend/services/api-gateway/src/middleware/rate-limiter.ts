// Rate Limiter Middleware using Redis
// Prevents abuse by limiting requests per IP address

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
  console.error('Redis Rate Limiter Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Rate Limiter Redis connected');
});

// Rate limiter configuration
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: new RedisStore({
    // @ts-ignore - Redis v4 client
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:',
  }),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: 'Check Retry-After header'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export default rateLimiter;
