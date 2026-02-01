// Database Connection - PostgreSQL
// This file creates a connection pool to PostgreSQL database

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * What is a Connection Pool?
 * - Instead of creating a new database connection for each request (slow),
 * - We create a "pool" of 10 connections that are reused (fast!)
 * 
 * Think of it like a taxi stand:
 * - Without pool: Call a taxi every time (slow)
 * - With pool: Taxis waiting at the stand (fast)
 */

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'draftio',
  user: process.env.DB_USER || 'draftio',
  password: process.env.DB_PASSWORD || 'draftio123',
  max: 10,  // Maximum 10 connections in the pool
  idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000,  // Wait 2 seconds max when connecting
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(1);  // Exit if database connection fails
});

export default pool;
