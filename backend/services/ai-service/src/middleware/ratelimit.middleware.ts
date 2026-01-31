import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { AuthRequest } from './auth.middleware';

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const RATE_LIMIT_FREE_MAX = Number(process.env.RATE_LIMIT_FREE_MAX) || 10;
const RATE_LIMIT_PREMIUM_MAX = Number(process.env.RATE_LIMIT_PREMIUM_MAX) || 100;

export const rateLimiter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userPlan = req.user?.plan || 'free';

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
    }

    const key = `ai:ratelimit:${userId}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Get current usage
    const usage = await redisClient.zCount(key, windowStart, now);

    const maxRequests = userPlan === 'premium' ? RATE_LIMIT_PREMIUM_MAX : RATE_LIMIT_FREE_MAX;

    if (usage >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later or upgrade to premium.',
        usage: {
          current: usage,
          limit: maxRequests,
          resetIn: RATE_LIMIT_WINDOW_MS - (now % RATE_LIMIT_WINDOW_MS),
        },
      });
    }

    // Add current request to sorted set
    await redisClient.zAdd(key, { score: now, value: `${now}` });

    // Remove old entries
    await redisClient.zRemRangeByScore(key, 0, windowStart);

    // Set expiry on the key
    await redisClient.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));

    // Add usage info to response headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - usage - 1).toString());
    res.setHeader('X-RateLimit-Reset', new Date(now + RATE_LIMIT_WINDOW_MS).toISOString());

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't block request if rate limiter fails
    next();
  }
};

// Track AI usage for analytics
export const trackUsage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const endpoint = req.path;

    if (userId) {
      const key = `ai:usage:${userId}:${new Date().toISOString().split('T')[0]}`;
      await redisClient.hIncrBy(key, endpoint, 1);
      await redisClient.expire(key, 86400 * 30); // Keep for 30 days
    }

    next();
  } catch (error) {
    console.error('Usage tracking error:', error);
    next();
  }
};
