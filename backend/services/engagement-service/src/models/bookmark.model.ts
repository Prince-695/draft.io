import pool from '../config/database';

// Bookmark a blog
export const bookmarkBlog = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'INSERT INTO bookmarks (user_id, blog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [userId, blogId]
  );
  return result.rows[0];
};

// Unbookmark a blog
export const unbookmarkBlog = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'DELETE FROM bookmarks WHERE user_id = $1 AND blog_id = $2 RETURNING *',
    [userId, blogId]
  );
  return result.rows[0];
};

// Get user bookmarks
export const getUserBookmarks = async (userId: string, limit = 20, offset = 0) => {
  const result = await pool.query(
    'SELECT blog_id, created_at FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return result.rows;
};

// Check if user bookmarked
export const hasUserBookmarked = async (userId: string, blogId: string) => {
  const result = await pool.query(
    'SELECT id FROM bookmarks WHERE user_id = $1 AND blog_id = $2',
    [userId, blogId]
  );
  return result.rows.length > 0;
};

// Track share
export const trackShare = async (blogId: string, userId: string | null, platform: string) => {
  const result = await pool.query(
    'INSERT INTO shares (blog_id, user_id, platform) VALUES ($1, $2, $3) RETURNING *',
    [blogId, userId, platform]
  );
  
  // Update blog shares_count
  await pool.query(
    'UPDATE blogs SET shares_count = shares_count + 1 WHERE id = $1',
    [blogId]
  );
  
  return result.rows[0];
};

// Get blog shares count
export const getBlogSharesCount = async (blogId: string) => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM shares WHERE blog_id = $1',
    [blogId]
  );
  return parseInt(result.rows[0].count);
};
