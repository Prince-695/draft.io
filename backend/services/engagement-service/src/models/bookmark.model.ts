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
    `SELECT
       bm.blog_id,
       bm.created_at AS saved_at,
       b.title,
       b.slug,
       b.excerpt,
       b.cover_image_url,
       b.status,
       b.published_at,
       b.views_count,
       b.likes_count,
       b.comments_count,
       b.reading_time,
       u.id        AS author_id,
       u.username  AS author_username,
       u.full_name AS author_full_name,
       NULL AS author_avatar
     FROM bookmarks bm
     JOIN blogs b ON b.id = bm.blog_id
     LEFT JOIN users u  ON u.id = b.author_id
     WHERE bm.user_id = $1
     ORDER BY bm.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows.map((row) => ({
    id: row.blog_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    status: row.status,
    published_at: row.published_at,
    views_count: row.views_count,
    likes_count: row.likes_count,
    comments_count: row.comments_count,
    reading_time: row.reading_time,
    saved_at: row.saved_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      full_name: row.author_full_name,
      profile_picture_url: row.author_avatar,
    },
  }));
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
