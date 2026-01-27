// Auth Middleware - Protects routes that require authentication
// Use this on routes that need a logged-in user

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';

/**
 * What is middleware?
 * - Code that runs BEFORE your route handler
 * - Like a security guard at a door
 * - Checks: "Do you have a valid ticket (token)?"
 * 
 * Flow:
 * Request → Middleware (check token) → Route Handler
 *                  ↓ (if invalid)
 *              Send error
 */

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from Authorization header
    // Header format: "Authorization: Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // 2. Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];  // "Bearer TOKEN" → "TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
    }

    // 3. Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // 4. Attach user info to request object
    // Now route handlers can access: req.user.user_id
    (req as any).user = decoded;

    // 5. Continue to next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for routes that change behavior based on login status
 * Example: Show "Edit" button only if viewing own profile
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
          (req as any).user = decoded;
        }
      }
    }

    // Continue regardless of token validity
    next();
  } catch (error) {
    // Continue even if error
    next();
  }
};
