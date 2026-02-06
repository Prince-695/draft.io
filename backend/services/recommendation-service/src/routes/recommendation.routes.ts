import { Router, Response } from 'express';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import recommendationModel from '../models/recommendation.model';

const router = Router();

/**
 * Get personalized blog feed
 * GET /feed?limit=20
 */
router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;

    const feed = await recommendationModel.getPersonalizedFeed(userId, limit);

    res.json({
      success: true,
      data: feed,
      count: feed.length,
    });
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({ success: false, error: 'Failed to get personalized feed' });
  }
});

/**
 * Get trending blogs
 * GET /trending?limit=10
 */
router.get('/trending', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const trending = await recommendationModel.getTrending(limit);

    res.json({
      success: true,
      data: trending,
      count: trending.length,
    });
  } catch (error) {
    console.error('Error getting trending:', error);
    res.status(500).json({ success: false, error: 'Failed to get trending blogs' });
  }
});

/**
 * Get similar blogs
 * GET /similar/:blogId?limit=5
 */
router.get('/similar/:blogId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const blogId = req.params.blogId;
    const limit = parseInt(req.query.limit as string) || 5;

    const similar = await recommendationModel.getSimilarBlogs(blogId, limit);

    res.json({
      success: true,
      data: similar,
      count: similar.length,
    });
  } catch (error) {
    console.error('Error getting similar blogs:', error);
    res.status(500).json({ success: false, error: 'Failed to get similar blogs' });
  }
});

/**
 * Track blog read event
 * POST /track-read
 * Body: { blogId, timeSpent }
 */
router.post('/track-read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { blogId, timeSpent = 0 } = req.body;

    if (!blogId) {
      return res.status(400).json({ success: false, error: 'blogId is required' });
    }

    await recommendationModel.trackRead(userId, blogId, timeSpent);

    res.json({
      success: true,
      message: 'Read event tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking read:', error);
    res.status(500).json({ success: false, error: 'Failed to track read event' });
  }
});

/**
 * Get user's reading history
 * GET /history?limit=20
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await recommendationModel.getReadingHistory(userId, limit);

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ success: false, error: 'Failed to get reading history' });
  }
});

export default router;
