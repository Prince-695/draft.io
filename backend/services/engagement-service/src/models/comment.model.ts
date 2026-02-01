import pool from '../config/database';

export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  replies_count: number;
  is_edited: boolean;
  created_at: Date;
  updated_at: Date;
}

// Create comment
export const createComment = async (blogId: string, userId: string, content: string, parentId: string | null = null) => {
  const result = await pool.query(
    `INSERT INTO comments (blog_id, user_id, parent_id, content) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [blogId, userId, parentId, content]
  );
  
  // Update blog comments_count
  await pool.query(
    'UPDATE blogs SET comments_count = comments_count + 1 WHERE id = $1',
    [blogId]
  );
  
  // Update parent replies_count if reply
  if (parentId) {
    await pool.query(
      'UPDATE comments SET replies_count = replies_count + 1 WHERE id = $1',
      [parentId]
    );
  }
  
  return result.rows[0];
};

// Get blog comments
export const getBlogComments = async (blogId: string, limit = 20, offset = 0) => {
  const result = await pool.query(
    `SELECT * FROM comments 
     WHERE blog_id = $1 AND parent_id IS NULL 
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [blogId, limit, offset]
  );
  return result.rows;
};

// Get comment replies
export const getCommentReplies = async (commentId: string, limit = 10, offset = 0) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE parent_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
    [commentId, limit, offset]
  );
  return result.rows;
};

// Update comment
export const updateComment = async (commentId: string, userId: string, content: string) => {
  const result = await pool.query(
    'UPDATE comments SET content = $1, is_edited = TRUE WHERE id = $2 AND user_id = $3 RETURNING *',
    [content, commentId, userId]
  );
  return result.rows[0];
};

// Delete comment
export const deleteComment = async (commentId: string, userId: string) => {
  const result = await pool.query(
    'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING blog_id, parent_id',
    [commentId, userId]
  );
  
  if (result.rows[0]) {
    const { blog_id, parent_id } = result.rows[0];
    
    await pool.query(
      'UPDATE blogs SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1',
      [blog_id]
    );
    
    if (parent_id) {
      await pool.query(
        'UPDATE comments SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = $1',
        [parent_id]
      );
    }
  }
  
  return result.rows[0];
};
