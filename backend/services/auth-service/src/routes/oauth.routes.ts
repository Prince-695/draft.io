import { Router } from 'express';
import * as oauthController from '../controllers/oauth.controller';

const router = Router();

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', oauthController.googleAuth);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', oauthController.googleCallback);

export default router;
