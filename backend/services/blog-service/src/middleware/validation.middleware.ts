import { body, query, param } from 'express-validator';

export const validateCreateBlog = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
  
  body('cover_image_url')
    .optional()
    .trim()
    .isURL().withMessage('Invalid cover image URL'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('categories')
    .optional()
    .isArray().withMessage('Categories must be an array')
];

export const validateUpdateBlog = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
  
  body('content')
    .optional()
    .trim()
    .notEmpty().withMessage('Content cannot be empty')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
  
  body('cover_image_url')
    .optional()
    .trim()
    .isURL().withMessage('Invalid cover image URL'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('categories')
    .optional()
    .isArray().withMessage('Categories must be an array')
];

export const validateBlogId = [
  param('blogId')
    .trim()
    .notEmpty().withMessage('Blog ID is required')
    .isUUID().withMessage('Invalid blog ID format')
];

export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be a positive number')
    .toInt()
];

export const validateSearchQuery = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  
  ...validatePagination
];

export const validateDraftSave = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
];

export const validateTagCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tag name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Tag name must be 2-50 characters')
];
