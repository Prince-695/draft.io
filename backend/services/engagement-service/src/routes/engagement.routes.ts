import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as controller from '../controllers/engagement.controller';

const router = Router();

// Like routes
router.post('/:blogId/like', authMiddleware, controller.likeBlog);
router.delete('/:blogId/like', authMiddleware, controller.unlikeBlog);

// Comment routes
router.post('/:blogId/comments', authMiddleware, controller.createComment);
router.get('/:blogId/comments', controller.getBlogComments);
router.put('/comments/:commentId', authMiddleware, controller.updateComment);
router.delete('/comments/:commentId', authMiddleware, controller.deleteComment);

// Bookmark routes
router.post('/:blogId/bookmark', authMiddleware, controller.bookmarkBlog);
router.delete('/:blogId/bookmark', authMiddleware, controller.unbookmarkBlog);
router.get('/bookmarks', authMiddleware, controller.getUserBookmarks);

// Share route
router.post('/:blogId/share', controller.trackShare);

export default router;
