import { Request, Response } from 'express';
import * as tagModel from '../models/tag.model';

// Get all tags
export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await tagModel.getAllTags();

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tags'
    });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await tagModel.getAllCategories();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
};

// Get blogs by category
export const getBlogsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await require('../config/database').default.query(
      `SELECT b.* FROM blogs b
       INNER JOIN blog_categories bc ON b.id = bc.blog_id
       WHERE bc.category_id = $1 AND b.status = 'published'
       ORDER BY b.published_at DESC
       LIMIT $2 OFFSET $3`,
      [categoryId, Number(limit), Number(offset)]
    );

    res.json({
      success: true,
      data: { blogs: result.rows, count: result.rows.length }
    });
  } catch (error) {
    console.error('Get blogs by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blogs'
    });
  }
};

// Get blogs by tag
export const getBlogsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await require('../config/database').default.query(
      `SELECT b.* FROM blogs b
       INNER JOIN blog_tags bt ON b.id = bt.blog_id
       WHERE bt.tag_id = $1 AND b.status = 'published'
       ORDER BY b.published_at DESC
       LIMIT $2 OFFSET $3`,
      [tagId, Number(limit), Number(offset)]
    );

    res.json({
      success: true,
      data: { blogs: result.rows, count: result.rows.length }
    });
  } catch (error) {
    console.error('Get blogs by tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blogs'
    });
  }
};
