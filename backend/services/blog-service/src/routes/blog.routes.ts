import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import {
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogId,
  validatePagination,
  validateSearchQuery,
  validateDraftSave
} from '../middleware/validation.middleware';
import * as blogController from '../controllers/blog.controller';

const router = Router();

// Public routes
router.get('/feed', validatePagination, blogController.getPublishedBlogs);
router.get('/search', validateSearchQuery, blogController.searchBlogs);
router.get('/:blogId', validateBlogId, optionalAuthMiddleware, blogController.getBlog);

// Protected routes
router.post('/', authMiddleware, validateCreateBlog, blogController.createBlog);
router.put('/:blogId', authMiddleware, validateBlogId, validateUpdateBlog, blogController.updateBlog);
router.delete('/:blogId', authMiddleware, validateBlogId, blogController.deleteBlog);
router.post('/:blogId/publish', authMiddleware, validateBlogId, blogController.publishBlog);
router.post('/:blogId/unpublish', authMiddleware, validateBlogId, blogController.unpublishBlog);
router.get('/me/blogs', authMiddleware, validatePagination, blogController.getMyBlogs);

// Draft routes
router.post('/:blogId/draft', authMiddleware, validateBlogId, validateDraftSave, blogController.saveDraft);
router.get('/:blogId/draft', authMiddleware, validateBlogId, blogController.getDraft);

// Analytics routes
router.get('/:blogId/analytics', authMiddleware, validateBlogId, blogController.getBlogAnalytics);

export default router;
