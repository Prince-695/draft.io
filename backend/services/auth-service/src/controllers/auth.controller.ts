// Auth Controller - Handles authentication requests
// This is where the magic happens! Registration, login, etc.

import { Request, Response } from 'express';
import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  deleteRefreshToken,
  generateRandomToken,
} from '../utils/jwt.util';

/**
 * REGISTER - Create a new user account
 * POST /auth/register
 * Body: { email, username, password, full_name }
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, full_name } = req.body;

    // 1. Check if email already exists
    const existingEmail = await UserModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // 2. Check if username already exists
    const existingUsername = await UserModel.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken',
      });
    }

    // 3. Hash the password (NEVER store plain text!)
    const passwordHash = await hashPassword(password);

    // 4. Create user in database
    const user = await UserModel.createUser(
      email,
      username,
      passwordHash,
      full_name
    );

    // 5. Generate email verification token
    const verificationToken = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);  // Expires in 24 hours

    await UserModel.setVerificationToken(user.id, verificationToken, expiresAt);

    // TODO: Send verification email (we'll implement this later)
    // await sendVerificationEmail(email, verificationToken);

    // 6. Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // 7. Store refresh token in Redis
    await storeRefreshToken(user.id, refreshToken);

    // 8. TODO: Publish "user.registered" event to Kafka
    // await kafkaProducer.sendEvent('user.registered', {
    //   event_type: 'user.registered',
    //   timestamp: new Date(),
    //   data: { user_id: user.id, email: user.email, username: user.username }
    // });

    // 9. Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          is_verified: user.is_verified,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * LOGIN - Authenticate existing user
 * POST /auth/login
 * Body: { email, password }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // 2. Compare password with stored hash
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // 4. Store refresh token in Redis
    await storeRefreshToken(user.id, refreshToken);

    // 5. Update last login timestamp
    await UserModel.updateLastLogin(user.id);

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          is_verified: user.is_verified,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * REFRESH TOKEN - Get new access token using refresh token
 * POST /auth/refresh
 * Body: { refresh_token }
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    // 1. Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // 2. Check if token exists in Redis (not revoked)
    const storedToken = await UserModel.findUserById(decoded.user_id);
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        error: 'Token revoked or user not found',
      });
    }

    // 3. Generate new access token
    const newAccessToken = generateAccessToken(decoded.user_id, decoded.email);

    // 4. Return new access token
    return res.status(200).json({
      success: true,
      data: {
        access_token: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * LOGOUT - Revoke refresh token
 * POST /auth/logout
 * Body: { user_id }
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    // Delete refresh token from Redis
    await deleteRefreshToken(user_id);

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * VERIFY EMAIL - Verify user's email address
 * GET /auth/verify-email/:token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // 1. Find user by verification token
    const user = await UserModel.findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    // 2. Mark user as verified
    await UserModel.verifyUser(user.id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * GET ME - Get current logged-in user's info
 * GET /auth/me
 * Headers: Authorization: Bearer <access_token>
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // User ID is added by auth middleware
    const userId = (req as any).user?.user_id;

    const user = await UserModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
