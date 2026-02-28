import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { AuthRequest } from './auth.middleware';

// Every user gets 10 AI requests per calendar month, regardless of plan.
const MONTHLY_LIMIT = Number(process.env.AI_MONTHLY_LIMIT) || 10;

/** Returns the Redis key for a user's monthly AI request counter, e.g. "ai:monthly:abc123:2026-02" */
const monthlyKey = (userId: string): string => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `ai:monthly:${userId}:${month}`;
};

export const rateLimiter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
    }

    const key = monthlyKey(userId);

    // Fetch current month's count (returns null if key doesn't exist yet)
    const raw = await redisClient.get(key);
    const used = raw ? parseInt(raw, 10) : 0;

    if (used >= MONTHLY_LIMIT) {
      return res.status(429).json({
        success: false,
        error: `You have used all ${MONTHLY_LIMIT} AI requests for this month. Your quota resets on the 1st of next month.`,
        usage: { used, limit: MONTHLY_LIMIT },
      });
    }

    // Increment counter; set TTL to 35 days so it naturally expires after the month
    await redisClient.incr(key);
    await redisClient.expire(key, 60 * 60 * 24 * 35);

    // Expose quota info in response headers so the frontend can update the usage indicator
    res.setHeader('X-AI-Requests-Used', (used + 1).toString());
    res.setHeader('X-AI-Requests-Limit', MONTHLY_LIMIT.toString());
    res.setHeader('X-AI-Requests-Remaining', (MONTHLY_LIMIT - used - 1).toString());

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't block the request if Redis is unavailable
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
