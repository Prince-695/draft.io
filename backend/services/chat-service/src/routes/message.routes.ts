import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import messageModel from '../models/message.model';

const router = Router();

/**
 * Get message history with another user
 * GET /messages/:userId?page=1&limit=50
 */
router.get('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await messageModel.getMessages(currentUserId, otherUserId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

/**
 * Get user's conversation list
 * GET /conversations
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversations = await messageModel.getConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

/**
 * Delete a message
 * DELETE /messages/:messageId
 */
router.delete('/:messageId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const messageId = req.params.messageId;

    const deleted = await messageModel.deleteMessage(messageId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Message not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

/**
 * Get unread message count
 * GET /unread-count
 */
router.get('/unread/count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const count = await messageModel.getUnreadCount(userId);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
});

export default router;
