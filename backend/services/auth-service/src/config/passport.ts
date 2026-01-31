import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import pool from './database';
import { v4 as uuidv4 } from 'uuid';

// Initialize Passport Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Check if user already exists with this Google ID
        const existingUserQuery = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [profile.id]
        );

        if (existingUserQuery.rows.length > 0) {
          // User exists, return user
          return done(null, existingUserQuery.rows[0]);
        }

        // Check if email already exists (user signed up with email/password)
        const email = profile.emails?.[0]?.value;
        if (email) {
          const emailUserQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );

          if (emailUserQuery.rows.length > 0) {
            // Link Google account to existing user
            const user = emailUserQuery.rows[0];
            await pool.query(
              'UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2',
              [profile.id, user.id]
            );
            return done(null, user);
          }
        }

        // Create new user with Google profile
        const username = email?.split('@')[0] || `user_${uuidv4().slice(0, 8)}`;
        const fullName = profile.displayName || 'Google User';

        const newUserQuery = await pool.query(
          `INSERT INTO users (id, email, username, full_name, google_id, email_verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
           RETURNING *`,
          [uuidv4(), email, username, fullName, profile.id]
        );

        const newUser = newUserQuery.rows[0];
        
        // Publish USER_REGISTERED event (import will be added in controller)
        // This will be handled after passport initialization
        
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user to store in session (not used in JWT-based auth, but required by Passport)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
