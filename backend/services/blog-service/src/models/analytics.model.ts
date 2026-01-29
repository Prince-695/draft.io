import pool from '../config/database';

export const trackBlogView = async (blogId: string, userId?: string): Promise<void> => {
  await pool.query(
    `INSERT INTO blog_analytics (blog_id, user_id, action)
     VALUES ($1, $2, 'view')`,
    [blogId, userId || null]
  );
};

export const trackBlogLike = async (blogId: string, userId: string): Promise<void> => {
  await pool.query(
    `INSERT INTO blog_analytics (blog_id, user_id, action)
     VALUES ($1, $2, 'like')
     ON CONFLICT DO NOTHING`,
    [blogId, userId]
  );
};

export const trackBlogShare = async (blogId: string, userId?: string): Promise<void> => {
  await pool.query(
    `INSERT INTO blog_analytics (blog_id, user_id, action)
     VALUES ($1, $2, 'share')`,
    [blogId, userId || null]
  );
};

export const trackBlogBookmark = async (blogId: string, userId: string): Promise<void> => {
  await pool.query(
    `INSERT INTO blog_analytics (blog_id, user_id, action)
     VALUES ($1, $2, 'bookmark')
     ON CONFLICT DO NOTHING`,
    [blogId, userId]
  );
};

export const getBlogAnalytics = async (blogId: string): Promise<{
  views: number;
  likes: number;
  shares: number;
  bookmarks: number;
}> => {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE action = 'view') as views,
       COUNT(*) FILTER (WHERE action = 'like') as likes,
       COUNT(*) FILTER (WHERE action = 'share') as shares,
       COUNT(*) FILTER (WHERE action = 'bookmark') as bookmarks
     FROM blog_analytics
     WHERE blog_id = $1`,
    [blogId]
  );
  
  return result.rows[0];
};

export const getUserBlogAnalytics = async (authorId: string): Promise<{
  total_views: number;
  total_likes: number;
  total_shares: number;
}> => {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE ba.action = 'view') as total_views,
       COUNT(*) FILTER (WHERE ba.action = 'like') as total_likes,
       COUNT(*) FILTER (WHERE ba.action = 'share') as total_shares
     FROM blog_analytics ba
     INNER JOIN blogs b ON ba.blog_id = b.id
     WHERE b.author_id = $1`,
    [authorId]
  );
  
  return result.rows[0];
};
