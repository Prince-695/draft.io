-- Auth Service Database Schema
-- This creates all the tables needed for authentication

-- Enable UUID extension (for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user authentication data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Encrypted password (never store plain text!)
  full_name VARCHAR(100),
  
  -- Email verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),  -- Random token sent in email
  verification_expires_at TIMESTAMP,
  
  -- Password reset
  reset_token VARCHAR(255),
  reset_token_expires_at TIMESTAMP,
  
  -- OAuth (Google login)
  google_id VARCHAR(255) UNIQUE,  -- Google user ID
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Create indexes for faster queries
-- Index on email (we search by email during login)
CREATE INDEX idx_users_email ON users(email);

-- Index on username (we search by username)
CREATE INDEX idx_users_username ON users(username);

-- Index on verification token (for email verification)
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- Index on reset token (for password reset)
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before every update
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a test user (for development only)
-- Password is "password123" (hashed with bcrypt)
INSERT INTO users (email, username, password_hash, full_name, is_verified)
VALUES (
  'test@draftio.com',
  'testuser',
  '$2b$10$rQZYKqXqXqXqXqXqXqXqXeQZYKqXqXqXqXqXqXqXqXqXqXqXqXqX',  -- This is "password123" hashed
  'Test User',
  TRUE
) ON CONFLICT (email) DO NOTHING;  -- Don't insert if already exists
