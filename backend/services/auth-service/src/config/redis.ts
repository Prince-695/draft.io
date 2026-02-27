// Redis Connection - For storing refresh tokens and sessions
// Redis is super fast because it stores data in memory (RAM)

import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * What is Redis used for in Auth Service?
 * 1. Store refresh tokens (when user stays logged in)
 * 2. Blacklist revoked tokens (when user logs out)
 * 3. Store email verification codes
 * 4. Rate limiting (prevent spam)
 */

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  // Don't queue commands when offline — fail immediately so callers get an error
  // instead of hanging forever waiting for Redis to reconnect
  enableOfflineQueue: false,
  // Retry connection in background but fail any pending commands fast
  retryStrategy(times) {
    if (times > 10) return null; // stop retrying after 10 attempts
    return Math.min(times * 200, 3000);
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
