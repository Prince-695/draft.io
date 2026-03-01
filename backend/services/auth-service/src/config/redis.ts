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

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 200, 3000);
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 10) return null;
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
