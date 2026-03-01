// Rate Limiter Middleware
// Prevents abuse by limiting requests per IP address

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// In development: skip entirely (no false rate-limit blocks during local dev)
// In production:  200 req/15min per IP
export const rateLimiter = isDev
  ? (_req: Request, _res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: 'Check Retry-After header'
      },
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    });

export default rateLimiter;
