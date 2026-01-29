import pool from '../config/database';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
}

// Tag operations
export const createTag = async (name: string, slug: string): Promise<Tag> => {
  const result = await pool.query(
    'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );
  return result.rows[0];
};

export const getOrCreateTag = async (name: string): Promise<Tag> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  // Try to get existing tag
  let result = await pool.query('SELECT * FROM tags WHERE slug = $1', [slug]);
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Create new tag
  return await createTag(name, slug);
};

export const getAllTags = async (): Promise<Tag[]> => {
  const result = await pool.query('SELECT * FROM tags ORDER BY usage_count DESC');
  return result.rows;
};

export const getTagById = async (tagId: number): Promise<Tag | null> => {
  const result = await pool.query('SELECT * FROM tags WHERE id = $1', [tagId]);
  return result.rows[0] || null;
};

// Category operations
export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const getCategoryById = async (categoryId: number): Promise<Category | null> => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
  return result.rows[0] || null;
};

// Blog-Tag associations
export const addTagsToBlog = async (blogId: string, tagIds: number[]): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Remove existing tags
    await client.query('DELETE FROM blog_tags WHERE blog_id = $1', [blogId]);
    
    // Add new tags
    for (const tagId of tagIds) {
      await client.query(
        'INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [blogId, tagId]
      );
      
      // Increment usage count
      await client.query('UPDATE tags SET usage_count = usage_count + 1 WHERE id = $1', [tagId]);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getBlogTags = async (blogId: string): Promise<Tag[]> => {
  const result = await pool.query(
    `SELECT t.* FROM tags t
     INNER JOIN blog_tags bt ON t.id = bt.tag_id
     WHERE bt.blog_id = $1`,
    [blogId]
  );
  return result.rows;
};

// Blog-Category associations
export const addCategoriesToBlog = async (blogId: string, categoryIds: number[]): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Remove existing categories
    await client.query('DELETE FROM blog_categories WHERE blog_id = $1', [blogId]);
    
    // Add new categories
    for (const categoryId of categoryIds) {
      await client.query(
        'INSERT INTO blog_categories (blog_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [blogId, categoryId]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getBlogCategories = async (blogId: string): Promise<Category[]> => {
  const result = await pool.query(
    `SELECT c.* FROM categories c
     INNER JOIN blog_categories bc ON c.id = bc.category_id
     WHERE bc.blog_id = $1`,
    [blogId]
  );
  return result.rows;
};
