import { Pool } from 'pg';

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'draftio',
        user: process.env.DB_USER || 'draftio',
        password: process.env.DB_PASSWORD || 'draftio123',
      }
);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL (Recommendation Service)');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const initDB = async () => {
  try {
    // Create reading_history table
    await query(`
      CREATE TABLE IF NOT EXISTS reading_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        blog_id VARCHAR(255) NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        time_spent INTEGER DEFAULT 0,
        UNIQUE(user_id, blog_id)
      )
    `);

    // Create user_interests table
    await query(`
      CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        tag VARCHAR(255) NOT NULL,
        weight FLOAT DEFAULT 1.0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tag)
      )
    `);

    // Create blog_embeddings table for content similarity
    await query(`
      CREATE TABLE IF NOT EXISTS blog_embeddings (
        id SERIAL PRIMARY KEY,
        blog_id VARCHAR(255) UNIQUE NOT NULL,
        embedding FLOAT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Recommendation tables initialized');
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error);
    throw error;
  }
};

export default pool;
