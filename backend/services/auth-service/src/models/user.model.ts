// User Model - Database operations for users table
// This file handles all database queries related to users

import pool from '../config/database';
import { User } from '../../../shared/types';

/**
 * Create a new user in the database
 */
export const createUser = async (
  email: string,
  username: string,
  passwordHash: string,
  fullName?: string
): Promise<User> => {
  const query = `
    INSERT INTO users (email, username, password_hash, full_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, username, full_name, is_verified, created_at, updated_at
  `;

  // $1, $2, $3, $4 are placeholders (prevents SQL injection attacks)
  const values = [email, username, passwordHash, fullName || null];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<any | null> => {
  const query = `
    SELECT * FROM users WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by username
 */
export const findUserByUsername = async (username: string): Promise<any | null> => {
  const query = `
    SELECT * FROM users WHERE username = $1
  `;
  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const query = `
    SELECT id, email, username, full_name, is_verified, created_at, updated_at
    FROM users WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Update user's verification status
 */
export const verifyUser = async (userId: string): Promise<void> => {
  const query = `
    UPDATE users 
    SET is_verified = TRUE, verification_token = NULL, verification_expires_at = NULL
    WHERE id = $1
  `;
  await pool.query(query, [userId]);
};

/**
 * Set verification token for email verification
 */
export const setVerificationToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  const query = `
    UPDATE users 
    SET verification_token = $1, verification_expires_at = $2
    WHERE id = $3
  `;
  await pool.query(query, [token, expiresAt, userId]);
};

/**
 * Find user by verification token
 */
export const findUserByVerificationToken = async (token: string): Promise<any | null> => {
  const query = `
    SELECT * FROM users 
    WHERE verification_token = $1 
    AND verification_expires_at > NOW()
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
};

/**
 * Set password reset token
 */
export const setResetToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  const query = `
    UPDATE users 
    SET reset_token = $1, reset_token_expires_at = $2
    WHERE id = $3
  `;
  await pool.query(query, [token, expiresAt, userId]);
};

/**
 * Find user by reset token
 */
export const findUserByResetToken = async (token: string): Promise<any | null> => {
  const query = `
    SELECT * FROM users 
    WHERE reset_token = $1 
    AND reset_token_expires_at > NOW()
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
};

/**
 * Update user password
 */
export const updatePassword = async (
  userId: string,
  newPasswordHash: string
): Promise<void> => {
  const query = `
    UPDATE users 
    SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL
    WHERE id = $2
  `;
  await pool.query(query, [newPasswordHash, userId]);
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  const query = `
    UPDATE users SET last_login_at = NOW() WHERE id = $1
  `;
  await pool.query(query, [userId]);
};
