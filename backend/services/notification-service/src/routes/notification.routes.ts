import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as controller from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's notifications (paginated)
router.get('/', controller.getNotifications);

// Get unread count
router.get('/unread-count', controller.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', controller.markAsRead);

// Mark all as read
router.patch('/read-all', controller.markAllAsRead);

// Delete notification
router.delete('/:notificationId', controller.deleteNotification);

export default router;
