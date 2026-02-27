// Rate Limiter Middleware
// Prevents abuse by limiting requests per IP address

import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// Rate limiter configuration
// Development: 1000 req/min (very permissive — won't interfere with dev)
// Production:  200 req/15min per IP
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDev ? '60000' : '900000')),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDev ? '1000' : '200')),
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
