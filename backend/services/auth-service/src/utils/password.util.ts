// Password Utility - Hashing and verification
// NEVER store passwords as plain text! Always hash them!

import bcrypt from 'bcrypt';

/**
 * What is hashing?
 * - Takes password "hello123"
 * - Converts to: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 * - CANNOT be reversed! (one-way function)
 * - Same password = different hash every time (salt)
 * 
 * Why 10 rounds?
 * - More rounds = more secure but slower
 * - 10 rounds is the sweet spot (fast enough, secure enough)
 */

const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param password - Plain text password
 * @returns Hashed password
 * @example
 * const hash = await hashPassword("mypassword123");
 * // Returns: "$2b$10$..."
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 * @param password - Plain text password from user
 * @param hash - Stored hash from database
 * @returns true if password matches, false otherwise
 * @example
 * const isValid = await comparePassword("mypassword123", storedHash);
 * if (isValid) {
 *   // Login successful
 * }
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
