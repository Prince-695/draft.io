import pool from '../config/database';

export interface UserProfile {
  user_id: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: string;
  website?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  github_url?: string;
  interests?: string[];
  writing_goals?: string[];
  experience_level?: string;
  followers_count: number;
  following_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProfileData {
  user_id: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  writing_goals?: string[];
  experience_level?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: string;
  website?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  github_url?: string;
  interests?: string[];
  writing_goals?: string[];
  experience_level?: string;
}

export const createProfile = async (data: CreateProfileData): Promise<UserProfile> => {
  const query = `
    INSERT INTO user_profiles (
      user_id, bio, location, website, interests, writing_goals, experience_level
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [
    data.user_id,
    data.bio || null,
    data.location || null,
    data.website || null,
    data.interests || [],
    data.writing_goals || [],
    data.experience_level || null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findProfileByUserId = async (userId: string): Promise<UserProfile | null> => {
  const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile | null> => {
  // Update full_name in users table if provided
  if (data.full_name !== undefined) {
    await pool.query('UPDATE users SET full_name = $1 WHERE id = $2', [data.full_name, userId]);
  }

  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.bio !== undefined) {
    fields.push(`bio = $${paramCount++}`);
    values.push(data.bio);
  }
  if (data.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramCount++}`);
    values.push(data.avatar_url);
  }
  if (data.cover_image_url !== undefined) {
    fields.push(`cover_image_url = $${paramCount++}`);
    values.push(data.cover_image_url);
  }
  if (data.location !== undefined) {
    fields.push(`location = $${paramCount++}`);
    values.push(data.location);
  }
  if (data.website !== undefined) {
    fields.push(`website = $${paramCount++}`);
    values.push(data.website);
  }
  if (data.twitter_handle !== undefined) {
    fields.push(`twitter_handle = $${paramCount++}`);
    values.push(data.twitter_handle);
  }
  if (data.linkedin_url !== undefined) {
    fields.push(`linkedin_url = $${paramCount++}`);
    values.push(data.linkedin_url);
  }
  if (data.github_url !== undefined) {
    fields.push(`github_url = $${paramCount++}`);
    values.push(data.github_url);
  }
  if (data.interests !== undefined) {
    fields.push(`interests = $${paramCount++}`);
    values.push(data.interests);
  }
  if (data.writing_goals !== undefined) {
    fields.push(`writing_goals = $${paramCount++}`);
    values.push(data.writing_goals);
  }
  if (data.experience_level !== undefined) {
    fields.push(`experience_level = $${paramCount++}`);
    values.push(data.experience_level);
  }

  if (fields.length === 0) {
    // No profile fields to update (e.g. only full_name was changed) — upsert blank row then return
    await pool.query(
      `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    return findProfileByUserId(userId);
  }

  // UPSERT: create the profile row if it doesn't exist, then apply updates
  values.push(userId);
  const insertCols = ['user_id', ...fields.map(f => f.split(' = ')[0].trim())];
  const insertPlaceholders = ['$' + paramCount, ...fields.map((_, i) => '$' + (i + 1))];
  const query = `
    INSERT INTO user_profiles (${insertCols.join(', ')})
    VALUES (${insertPlaceholders.join(', ')})
    ON CONFLICT (user_id) DO UPDATE
    SET ${fields.join(', ')}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const searchUsers = async (searchTerm: string, limit = 10): Promise<any[]> => {
  const query = `
    SELECT 
      u.id, u.username, u.full_name, u.email,
      up.bio, up.avatar_url, up.followers_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE 
      u.username ILIKE $1 OR 
      u.full_name ILIKE $1 OR
      u.email ILIKE $1
    LIMIT $2
  `;
  const result = await pool.query(query, [`%${searchTerm}%`, limit]);
  return result.rows;
};
