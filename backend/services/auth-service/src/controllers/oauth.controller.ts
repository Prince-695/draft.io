import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { generateToken } from '../utils/jwt.util';
import { publishEvent, EventType } from '../../../shared/events';

/**
 * Initiates Google OAuth login
 * GET /auth/google
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * Google OAuth callback handler
 * GET /auth/google/callback
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    try {
      if (err || !user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in?error=oauth_failed`
        );
      }

      // Check if this is a new user (no password means OAuth-only user)
      const isNewUser = !user.password_hash;

      // Publish USER_REGISTERED event for new users
      if (isNewUser) {
        try {
          await publishEvent(EventType.USER_REGISTERED, {
            userId: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name,
          });
        } catch (kafkaError) {
          console.error('Failed to publish user.registered event:', kafkaError);
        }
      }

      // Generate JWT token
      const token = generateToken({
        user_id: user.id,
        email: user.email,
        username: user.username,
      });

      // Redirect to frontend with token
      // Frontend will extract token from URL and store it
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in?error=oauth_failed`
      );
    }
  })(req, res, next);
};
