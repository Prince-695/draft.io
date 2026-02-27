import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import * as blogModel from '../models/blog.model';
import * as tagModel from '../models/tag.model';
import * as analyticsModel from '../models/analytics.model';
import { generateSlug, generateUniqueSlug } from '../utils/slug.util';
import pool from '../config/database';
import { getDB } from '../config/mongodb';
import { publishEvent, EventType } from '../../../../shared/events'; // no-op stubs

// Create new blog
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { title, content, excerpt, cover_image_url, tags, categories } = req.body;
    const authorId = req.user!.user_id;

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const result = await pool.query('SELECT id FROM blogs WHERE slug = $1', [s]);
      return result.rows.length > 0;
    });

    // Create blog
    const blog = await blogModel.createBlog(
      authorId,
      title,
      slug,
      content,
      excerpt,
      cover_image_url
    );

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          const tag = await tagModel.getOrCreateTag(tagName);
          return tag.id;
        })
      );
      await tagModel.addTagsToBlog(blog.id, tagIds);
    }

    // Add categories if provided
    if (categories && categories.length > 0) {
      await tagModel.addCategoriesToBlog(blog.id, categories);
    }

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog'
    });
  }
};

// Get blog by ID or slug
export const getBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    
    // Try to get blog
    const blogData = await blogModel.getBlogById(blogId);
    
    if (!blogData) {
      res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
      return;
    }

    // Track view (only for published blogs) — use actual UUID (in case blogId param was a slug)
    const actualBlogId = blogData.blog.id;
    if (blogData.blog.status === 'published') {
      await blogModel.incrementViewCount(actualBlogId);
      await analyticsModel.trackBlogView(actualBlogId, req.user?.user_id);
    }

    // Get tags and categories
    const tags = await tagModel.getBlogTags(actualBlogId);
    const categories = await tagModel.getBlogCategories(actualBlogId);

    res.json({
      success: true,
      data: {
        ...blogData.blog,
        content: blogData.content.content,
        tags,
        categories
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blog'
    });
  }
};

// Update blog
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { blogId } = req.params;
    const { title, content, excerpt, cover_image_url, tags, categories } = req.body;
    const authorId = req.user!.user_id;

    const updates: any = {};
    if (title) {
      updates.title = title;
      // Regenerate slug if title changed
      const baseSlug = generateSlug(title);
      updates.slug = await generateUniqueSlug(baseSlug, async (s) => {
        const result = await pool.query('SELECT id FROM blogs WHERE slug = $1 AND id != $2', [s, blogId]);
        return result.rows.length > 0;
      });
    }
    if (content) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;

    const blog = await blogModel.updateBlog(blogId, authorId, updates);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: 'Blog not found or unauthorized'
      });
      return;
    }

    // Update tags if provided
    if (tags && tags.length > 0) {
      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          const tag = await tagModel.getOrCreateTag(tagName);
          return tag.id;
        })
      );
      await tagModel.addTagsToBlog(blog.id, tagIds);
    }

    // Update categories if provided
    if (categories && categories.length > 0) {
      await tagModel.addCategoriesToBlog(blog.id, categories);
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog'
    });
  }
};

// Publish blog
export const publishBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const authorId = req.user!.user_id;

    const blog = await blogModel.publishBlog(blogId, authorId);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: 'Blog not found, already published, or unauthorized'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog published successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Publish blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish blog'
    });
  }
};

// Unpublish blog
export const unpublishBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const authorId = req.user!.user_id;

    const blog = await blogModel.unpublishBlog(blogId, authorId);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: 'Blog not found, not published, or unauthorized'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog unpublished successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Unpublish blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unpublish blog'
    });
  }
};

// Delete blog
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const authorId = req.user!.user_id;

    // Get blog info before deletion for event
    const blogData = await blogModel.getBlogById(blogId);
    
    const success = await blogModel.deleteBlog(blogId, authorId);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Blog not found or unauthorized'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog'
    });
  }
};

// Get user's blogs
export const getMyBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.user_id;
    const { status, limit = 20, offset = 0 } = req.query;

    const blogs = await blogModel.getUserBlogs(
      authorId,
      status as string,
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: { blogs, count: blogs.length }
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blogs'
    });
  }
};

// Get all published blogs by a specific author (public)
export const getUserBlogsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authorId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const blogs = await blogModel.getUserBlogs(
      authorId,
      'published',
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: { blogs, count: blogs.length }
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user blogs'
    });
  }
};

// Get published blogs (feed)
export const getPublishedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const blogs = await blogModel.getPublishedBlogs(
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: { blogs, count: blogs.length }
    });
  } catch (error) {
    console.error('Get published blogs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blogs'
    });
  }
};

// Auto-save draft
export const saveDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { blogId } = req.params;
    const { content } = req.body;
    const authorId = req.user!.user_id;

    await blogModel.saveDraft(blogId, authorId, content);

    res.json({
      success: true,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save draft'
    });
  }
};

// Get draft
export const getDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const authorId = req.user!.user_id;

    const draft = await blogModel.getDraft(blogId, authorId);

    if (!draft) {
      res.status(404).json({
        success: false,
        error: 'Draft not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { draft }
    });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get draft'
    });
  }
};

// Search blogs
export const searchBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        error: 'Search query required'
      });
      return;
    }

    const result = await pool.query(
      `SELECT b.*, 
        ts_rank(to_tsvector('english', b.title || ' ' || COALESCE(b.excerpt, '')), plainto_tsquery('english', $1)) as rank
       FROM blogs b
       WHERE b.status = 'published'
         AND (
           to_tsvector('english', b.title || ' ' || COALESCE(b.excerpt, '')) @@ plainto_tsquery('english', $1)
           OR b.title ILIKE $2
         )
       ORDER BY rank DESC, b.published_at DESC
       LIMIT $3 OFFSET $4`,
      [q, `%${q}%`, Number(limit), Number(offset)]
    );

    res.json({
      success: true,
      data: { blogs: result.rows, count: result.rows.length }
    });
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search blogs'
    });
  }
};

// Get blog analytics
export const getBlogAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;

    const analytics = await analyticsModel.getBlogAnalytics(blogId);

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    console.error('Get blog analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
};
