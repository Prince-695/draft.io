import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { generateAccessToken } from '../utils/jwt.util';

const isGoogleOAuthConfigured = () =>
  !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/**
 * Initiates Google OAuth login
 * GET /auth/google
 */
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};

/**
 * Google OAuth callback handler
 * GET /auth/google/callback
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  if (!isGoogleOAuthConfigured()) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in?error=oauth_not_configured`
    );
  }
  return passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    try {
      if (err || !user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in?error=oauth_failed`
        );
      }

      // _oauthStatus is set by passport strategy: 'new' | 'linked' | 'returning'
      const oauthStatus: string = user._oauthStatus || 'returning';

      // Generate JWT token
      const token = generateAccessToken(user.id, user.email);

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&status=${oauthStatus}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in?error=oauth_failed`
      );
    }
  })(req, res, next);
};
