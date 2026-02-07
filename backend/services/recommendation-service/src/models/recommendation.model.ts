import { query } from '../config/database';
import redisClient from '../config/redis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BlogScore {
  blogId: string;
  score: number;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author_id: string;
  published_at: Date;
}

class RecommendationModel {
  /**
   * Track blog read event
   */
  async trackRead(userId: string, blogId: string, timeSpent: number = 0): Promise<void> {
    await query(
      `INSERT INTO reading_history (user_id, blog_id, time_spent, read_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, blog_id)
       DO UPDATE SET time_spent = reading_history.time_spent + $3, read_at = NOW()`,
      [userId, blogId, timeSpent]
    );
  }

  /**
   * Update user interests based on reading history
   */
  async updateUserInterests(userId: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      await query(
        `INSERT INTO user_interests (user_id, tag, weight, updated_at)
         VALUES ($1, $2, 1.0, NOW())
         ON CONFLICT (user_id, tag)
         DO UPDATE SET weight = user_interests.weight + 0.5, updated_at = NOW()`,
        [userId, tag]
      );
    }
  }

  /**
   * Get personalized blog recommendations
   */
  async getPersonalizedFeed(userId: string, limit: number = 20): Promise<any[]> {
    // Check cache first
    const cacheKey = `feed:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 1. Get user's reading history
    const historyResult = await query(
      `SELECT blog_id FROM reading_history WHERE user_id = $1 ORDER BY read_at DESC LIMIT 50`,
      [userId]
    );
    const readBlogIds = historyResult.rows.map((r) => r.blog_id);

    // 2. Get user interests
    const interestsResult = await query(
      `SELECT tag, weight FROM user_interests WHERE user_id = $1 ORDER BY weight DESC LIMIT 10`,
      [userId]
    );
    const userTags = interestsResult.rows.map((r) => r.tag);

    // 3. Collaborative filtering - find similar users
    const similarUsersResult = await query(
      `SELECT rh2.user_id, COUNT(*) as common_reads
       FROM reading_history rh1
       JOIN reading_history rh2 ON rh1.blog_id = rh2.blog_id
       WHERE rh1.user_id = $1 AND rh2.user_id != $1
       GROUP BY rh2.user_id
       ORDER BY common_reads DESC
       LIMIT 10`,
      [userId]
    );
    const similarUserIds = similarUsersResult.rows.map((r) => r.user_id);

    let recommendations: BlogScore[] = [];

    // 4. Get blogs from similar users (collaborative filtering - 40% weight)
    if (similarUserIds.length > 0) {
      const collabResult = await query(
        `SELECT DISTINCT b.id as blog_id, COUNT(*) as read_count
         FROM blogs b
         JOIN reading_history rh ON b.id = rh.blog_id
         WHERE rh.user_id = ANY($1)
         AND b.id != ALL($2)
         AND b.status = 'published'
         GROUP BY b.id
         ORDER BY read_count DESC
         LIMIT 10`,
        [similarUserIds, readBlogIds.length > 0 ? readBlogIds : ['']]
      );
      
      recommendations.push(
        ...collabResult.rows.map((r) => ({
          blogId: r.blog_id,
          score: parseFloat(r.read_count) * 0.4,
        }))
      );
    }

    // 5. Content-based filtering - blogs with matching tags (40% weight)
    if (userTags.length > 0) {
      const contentResult = await query(
        `SELECT b.id as blog_id, 
                COUNT(DISTINCT bt.tag_name) as matching_tags,
                EXTRACT(EPOCH FROM (NOW() - b.published_at)) / 86400 as days_old
         FROM blogs b
         LEFT JOIN blog_tags bt ON b.id = bt.blog_id
         WHERE bt.tag_name = ANY($1)
         AND b.id != ALL($2)
         AND b.status = 'published'
         GROUP BY b.id, b.published_at
         LIMIT 20`,
        [userTags, readBlogIds.length > 0 ? readBlogIds : ['']]
      );

      recommendations.push(
        ...contentResult.rows.map((r) => ({
          blogId: r.blog_id,
          score: (parseFloat(r.matching_tags) * 2) * 0.4,
        }))
      );
    }

    // 6. Trending blogs (20% weight)
    const trendingResult = await query(
      `SELECT b.id as blog_id,
              COUNT(DISTINCT l.user_id) as like_count,
              COUNT(DISTINCT c.id) as comment_count,
              EXTRACT(EPOCH FROM (NOW() - b.published_at)) / 3600 as hours_old
       FROM blogs b
       LEFT JOIN likes l ON b.id = l.blog_id
       LEFT JOIN comments c ON b.id = c.blog_id
       WHERE b.published_at > NOW() - INTERVAL '7 days'
       AND b.status = 'published'
       AND b.id != ALL($1)
       GROUP BY b.id, b.published_at
       HAVING COUNT(DISTINCT l.user_id) > 0
       ORDER BY (COUNT(DISTINCT l.user_id) + COUNT(DISTINCT c.id) * 2) / (EXTRACT(EPOCH FROM (NOW() - b.published_at)) / 3600 + 2) DESC
       LIMIT 10`,
      [readBlogIds.length > 0 ? readBlogIds : ['']]
    );

    recommendations.push(
      ...trendingResult.rows.map((r) => ({
        blogId: r.blog_id,
        score: (parseFloat(r.like_count) + parseFloat(r.comment_count) * 2) * 0.2,
      }))
    );

    // 7. Merge and deduplicate recommendations
    const scoreMap = new Map<string, number>();
    recommendations.forEach(({ blogId, score }) => {
      scoreMap.set(blogId, (scoreMap.get(blogId) || 0) + score);
    });

    const sortedBlogIds = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([blogId]) => blogId);

    // 8. Fetch full blog details
    if (sortedBlogIds.length === 0) {
      // Fallback to latest blogs
      const fallbackResult = await query(
        `SELECT * FROM blogs 
         WHERE status = 'published' 
         ORDER BY published_at DESC 
         LIMIT $1`,
        [limit]
      );
      const fallback = fallbackResult.rows;
      await redisClient.setEx(cacheKey, 300, JSON.stringify(fallback)); // Cache 5 min
      return fallback;
    }

    const blogsResult = await query(
      `SELECT b.*, u.username, u.full_name, u.avatar_url
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.id = ANY($1)`,
      [sortedBlogIds]
    );

    // Sort by recommendation score
    const blogs = sortedBlogIds
      .map((id) => blogsResult.rows.find((b) => b.id === id))
      .filter(Boolean);

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(blogs));

    return blogs;
  }

  /**
   * Get trending blogs
   */
  async getTrending(limit: number = 10): Promise<any[]> {
    const cacheKey = 'trending:blogs';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await query(
      `SELECT b.*, u.username, u.full_name, u.avatar_url,
              COUNT(DISTINCT l.user_id) as like_count,
              COUNT(DISTINCT c.id) as comment_count,
              (COUNT(DISTINCT l.user_id) + COUNT(DISTINCT c.id) * 2) / 
              (EXTRACT(EPOCH FROM (NOW() - b.published_at)) / 3600 + 2) as trending_score
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       LEFT JOIN likes l ON b.id = l.blog_id
       LEFT JOIN comments c ON b.id = c.blog_id
       WHERE b.published_at > NOW() - INTERVAL '7 days'
       AND b.status = 'published'
       GROUP BY b.id, u.id
       ORDER BY trending_score DESC
       LIMIT $1`,
      [limit]
    );

    const trending = result.rows;
    await redisClient.setEx(cacheKey, 600, JSON.stringify(trending)); // Cache 10 min

    return trending;
  }

  /**
   * Get similar blogs using content similarity
   */
  async getSimilarBlogs(blogId: string, limit: number = 5): Promise<any[]> {
    const cacheKey = `similar:${blogId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get blog tags
    const tagsResult = await query(
      `SELECT tag_name FROM blog_tags WHERE blog_id = $1`,
      [blogId]
    );
    const tags = tagsResult.rows.map((r) => r.tag_name);

    if (tags.length === 0) {
      return [];
    }

    // Find blogs with matching tags
    const result = await query(
      `SELECT b.*, u.username, u.full_name, u.avatar_url,
              COUNT(DISTINCT bt.tag_name) as matching_tags
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       LEFT JOIN blog_tags bt ON b.id = bt.blog_id
       WHERE bt.tag_name = ANY($1)
       AND b.id != $2
       AND b.status = 'published'
       GROUP BY b.id, u.id
       ORDER BY matching_tags DESC
       LIMIT $3`,
      [tags, blogId, limit]
    );

    const similar = result.rows;
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(similar)); // Cache 1 hour

    return similar;
  }

  /**
   * Get user's reading history
   */
  async getReadingHistory(userId: string, limit: number = 20): Promise<any[]> {
    const result = await query(
      `SELECT b.*, u.username, u.full_name, u.avatar_url, rh.read_at, rh.time_spent
       FROM reading_history rh
       JOIN blogs b ON rh.blog_id = b.id
       LEFT JOIN users u ON b.author_id = u.id
       WHERE rh.user_id = $1
       ORDER BY rh.read_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}

export default new RecommendationModel();
