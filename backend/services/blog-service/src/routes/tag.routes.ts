import { Router } from 'express';
import { validatePagination } from '../middleware/validation.middleware';
import * as tagController from '../controllers/tag.controller';

const router = Router();

// Public routes
router.get('/tags', tagController.getAllTags);
router.get('/categories', tagController.getAllCategories);
router.get('/category/:categoryId/blogs', validatePagination, tagController.getBlogsByCategory);
router.get('/tag/:tagId/blogs', validatePagination, tagController.getBlogsByTag);

export default router;
