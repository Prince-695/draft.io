import pool from '../config/database';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
}

export const followUser = async (followerId: string, followingId: string): Promise<Follow> => {
  const query = `
    INSERT INTO follows (follower_id, following_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [followerId, followingId]);
  return result.rows[0];
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  const query = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
  const result = await pool.query(query, [followerId, followingId]);
  return result.rowCount !== null && result.rowCount > 0;
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const query = 'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2';
  const result = await pool.query(query, [followerId, followingId]);
  return result.rows.length > 0;
};

export const getFollowers = async (userId: string, limit = 20, offset = 0): Promise<any[]> => {
  const query = `
    SELECT 
      u.id, u.username, u.full_name,
      up.avatar_url, up.bio, up.followers_count,
      f.created_at as followed_at
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE f.following_id = $1
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

export const getFollowing = async (userId: string, limit = 20, offset = 0): Promise<any[]> => {
  const query = `
    SELECT 
      u.id, u.username, u.full_name,
      up.avatar_url, up.bio, up.followers_count,
      f.created_at as followed_at
    FROM follows f
    JOIN users u ON f.following_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE f.follower_id = $1
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  const query = 'SELECT COUNT(*) FROM follows WHERE following_id = $1';
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const query = 'SELECT COUNT(*) FROM follows WHERE follower_id = $1';
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
};
