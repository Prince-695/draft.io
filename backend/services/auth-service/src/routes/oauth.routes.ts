import { Router } from 'express';
import * as oauthController from '../controllers/oauth.controller';

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [OAuth]
 *     description: Redirects user to Google login page
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get('/google', oauthController.googleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Handles Google OAuth callback and creates/logs in user
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: OAuth authorization code from Google
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token
 *       400:
 *         description: OAuth error
 */
router.get('/google/callback', oauthController.googleCallback);

export default router;
