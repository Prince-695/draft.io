import pool from '../config/database';

// Like a blog
export const likeBlog = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'INSERT INTO likes (user_id, blog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [userId, blogId]
  );
  
  // Update blog likes_count
  await pool.query(
    'UPDATE blogs SET likes_count = likes_count + 1 WHERE id = $1',
    [blogId]
  );
  
  return result.rows[0];
};

// Unlike a blog
export const unlikeBlog = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'DELETE FROM likes WHERE user_id = $1 AND blog_id = $2 RETURNING *',
    [userId, blogId]
  );
  
  if (result.rows[0]) {
    await pool.query(
      'UPDATE blogs SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
      [blogId]
    );
  }
  
  return result.rows[0];
};

// Check if user liked a blog
export const hasUserLiked = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'SELECT id FROM likes WHERE user_id = $1 AND blog_id = $2',
    [userId, blogId]
  );
  return result.rows.length > 0;
};

// Get blog likes
export const getBlogLikes = async (blogId: string, limit = 20, offset = 0) => {
  const result = await pool.query(
    'SELECT user_id, created_at FROM likes WHERE blog_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [blogId, limit, offset]
  );
  return result.rows;
};
