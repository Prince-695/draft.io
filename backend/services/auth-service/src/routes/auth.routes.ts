// Auth Routes - Define all authentication endpoints

import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} from '../middleware/validation.middleware';

const router = express.Router();

/**
 * Route structure:
 * router.METHOD(path, middleware1, middleware2, ..., handler)
 * 
 * Middleware runs in order:
 * 1. Validation middleware (check if data is valid)
 * 2. Auth middleware (check if user is logged in) - only for protected routes
 * 3. Controller (handle the request)
 */

// Public routes (no authentication required)

/**
 * POST /auth/register
 * Register a new user
 * Body: { email, username, password, full_name? }
 */
router.post('/register', validateRegister, authController.register);

/**
 * POST /auth/login
 * Login with email and password
 * Body: { email, password }
 */
router.post('/login', validateLogin, authController.login);

/**
 * POST /auth/refresh
 * Get new access token using refresh token
 * Body: { refresh_token }
 */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * GET /auth/verify-email/:token
 * Verify user's email address
 * Params: { token }
 */
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes (authentication required)

/**
 * GET /auth/me
 * Get current logged-in user's information
 * Headers: Authorization: Bearer <access_token>
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * POST /auth/logout
 * Logout and revoke refresh token
 * Headers: Authorization: Bearer <access_token>
 * Body: { user_id }
 */
router.post('/logout', authMiddleware, authController.logout);

export default router;
