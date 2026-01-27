// JWT Utility - Generate and verify JSON Web Tokens
// JWT = JSON Web Token (like a digital passport)

import jwt from 'jsonwebtoken';
import redis from '../config/redis';

/**
 * What is JWT?
 * - A token that proves "this user is logged in"
 * - Contains user ID (not password!)
 * - Signed with a secret key (prevents forgery)
 * - Has expiration time (1 hour for access, 7 days for refresh)
 * 
 * Structure: header.payload.signature
 * Example: eyJhbGc.eyJ1c2VyX2lkI.SflKxwRJ
 * 
 * Access Token vs Refresh Token:
 * - Access Token: Short-lived (1 hour), used for API requests
 * - Refresh Token: Long-lived (7 days), used to get new access tokens
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
  user_id: string;
  email: string;
}

/**
 * Generate access token (short-lived)
 * @param userId - User's unique ID
 * @param email - User's email
 * @returns JWT access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
  const payload: TokenPayload = {
    user_id: userId,
    email,
  };

  // Sign the token with secret and set expiration
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token (long-lived)
 * @param userId - User's unique ID
 * @param email - User's email
 * @returns JWT refresh token
 */
export const generateRefreshToken = (userId: string, email: string): string => {
  const payload: TokenPayload = {
    user_id: userId,
    email,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify access token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;  // Token invalid or expired
  }
};

/**
 * Verify refresh token
 * @param token - Refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Store refresh token in Redis
 * @param userId - User ID
 * @param token - Refresh token
 * @param expiresIn - Expiration time in seconds
 * 
 * Why Redis?
 * - We can revoke tokens (logout)
 * - Redis is super fast (in-memory)
 * - Tokens auto-delete when expired (TTL)
 */
export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresIn: number = 7 * 24 * 60 * 60  // 7 days in seconds
): Promise<void> => {
  const key = `refresh_token:${userId}`;
  // Store with expiration (TTL = Time To Live)
  await redis.set(key, token, 'EX', expiresIn);
};

/**
 * Get refresh token from Redis
 * @param userId - User ID
 * @returns Stored refresh token or null
 */
export const getRefreshToken = async (userId: string): Promise<string | null> => {
  const key = `refresh_token:${userId}`;
  return redis.get(key);
};

/**
 * Delete refresh token from Redis (logout)
 * @param userId - User ID
 */
export const deleteRefreshToken = async (userId: string): Promise<void> => {
  const key = `refresh_token:${userId}`;
  await redis.del(key);
};

/**
 * Generate a random token (for email verification, password reset)
 * @returns Random 32-character token
 */
export const generateRandomToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};
