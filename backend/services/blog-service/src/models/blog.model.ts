import pool from '../config/database';
import { getDB } from '../config/mongodb';

export interface Blog {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  reading_time?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface BlogContent {
  blog_id: string;
  author_id: string;
  content: string;
  content_html?: string;
  created_at: Date;
  updated_at: Date;
}

export const createBlog = async (
  authorId: string,
  title: string,
  slug: string,
  content: string,
  excerpt?: string,
  coverImageUrl?: string
): Promise<Blog> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Create blog metadata in PostgreSQL
    const blogResult = await client.query(
      `INSERT INTO blogs (author_id, title, slug, excerpt, cover_image_url, reading_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [authorId, title, slug, excerpt, coverImageUrl, readingTime]
    );
    
    const blog = blogResult.rows[0];
    
    // Store content in MongoDB
    const db = getDB();
    await db.collection('blog_content').insertOne({
      blog_id: blog.id,
      author_id: authorId,
      content,
      content_html: content, // TODO: Convert markdown to HTML
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await client.query('COMMIT');
    return blog;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getBlogById = async (blogId: string): Promise<{ blog: Blog; content: BlogContent } | null> => {
  const blogResult = await pool.query('SELECT * FROM blogs WHERE id = $1', [blogId]);
  
  if (blogResult.rows.length === 0) {
    return null;
  }
  
  const blog = blogResult.rows[0];
  
  // Get content from MongoDB
  const db = getDB();
  const content = await db.collection('blog_content').findOne({ blog_id: blogId });
  
  return {
    blog,
    content: content as unknown as BlogContent
  };
};

export const updateBlog = async (
  blogId: string,
  authorId: string,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    cover_image_url: string;
    content: string;
  }>
): Promise<Blog | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update metadata in PostgreSQL
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (updates.title) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.slug) {
      fields.push(`slug = $${paramCount++}`);
      values.push(updates.slug);
    }
    if (updates.excerpt !== undefined) {
      fields.push(`excerpt = $${paramCount++}`);
      values.push(updates.excerpt);
    }
    if (updates.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramCount++}`);
      values.push(updates.cover_image_url);
    }
    
    // Recalculate reading time if content changed
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      fields.push(`reading_time = $${paramCount++}`);
      values.push(readingTime);
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(blogId, authorId);
    const result = await client.query(
      `UPDATE blogs SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND author_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    
    // Update content in MongoDB if provided
    if (updates.content) {
      const db = getDB();
      await db.collection('blog_content').updateOne(
        { blog_id: blogId, author_id: authorId },
        {
          $set: {
            content: updates.content,
            content_html: updates.content,
            updated_at: new Date()
          }
        }
      );
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const publishBlog = async (blogId: string, authorId: string): Promise<Blog | null> => {
  const result = await pool.query(
    `UPDATE blogs
     SET status = 'published', published_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND author_id = $2 AND status = 'draft'
     RETURNING *`,
    [blogId, authorId]
  );
  
  return result.rows[0] || null;
};

export const unpublishBlog = async (blogId: string, authorId: string): Promise<Blog | null> => {
  const result = await pool.query(
    `UPDATE blogs
     SET status = 'draft', published_at = NULL
     WHERE id = $1 AND author_id = $2 AND status = 'published'
     RETURNING *`,
    [blogId, authorId]
  );
  
  return result.rows[0] || null;
};

export const deleteBlog = async (blogId: string, authorId: string): Promise<boolean> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      'DELETE FROM blogs WHERE id = $1 AND author_id = $2 RETURNING id',
      [blogId, authorId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    
    // Delete content from MongoDB
    const db = getDB();
    await db.collection('blog_content').deleteOne({ blog_id: blogId });
    await db.collection('blog_drafts').deleteMany({ blog_id: blogId });
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getUserBlogs = async (
  authorId: string,
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<Blog[]> => {
  let query = 'SELECT * FROM blogs WHERE author_id = $1';
  const params: any[] = [authorId];
  
  if (status) {
    query += ' AND status = $2';
    params.push(status);
  }
  
  query += ` ORDER BY updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getPublishedBlogs = async (
  limit: number = 20,
  offset: number = 0
): Promise<Blog[]> => {
  const result = await pool.query(
    `SELECT 
      b.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'full_name', u.full_name,
        'email', u.email,
        'avatar_url', up.avatar_url
      ) as author,
      COALESCE(
        (SELECT json_agg(t.name)
         FROM blog_tags bt
         JOIN tags t ON bt.tag_id = t.id
         WHERE bt.blog_id = b.id),
        '[]'::json
      ) as tags
     FROM blogs b
     LEFT JOIN users u ON b.author_id = u.id
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE b.status = 'published'
     ORDER BY b.published_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return result.rows;
};

export const incrementViewCount = async (blogId: string): Promise<void> => {
  await pool.query(
    'UPDATE blogs SET views_count = views_count + 1 WHERE id = $1',
    [blogId]
  );
};

// Draft auto-save functionality
export const saveDraft = async (
  blogId: string,
  authorId: string,
  content: string
): Promise<void> => {
  const db = getDB();
  await db.collection('blog_drafts').updateOne(
    { blog_id: blogId, author_id: authorId },
    {
      $set: {
        content,
        updated_at: new Date()
      }
    },
    { upsert: true }
  );
};

export const getDraft = async (blogId: string, authorId: string): Promise<any> => {
  const db = getDB();
  return await db.collection('blog_drafts').findOne({ blog_id: blogId, author_id: authorId });
};
