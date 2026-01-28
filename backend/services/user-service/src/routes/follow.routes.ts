import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as followController from '../controllers/follow.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Follow user
router.post('/:userId/follow', followController.followUser);

// Unfollow user
router.delete('/:userId/unfollow', followController.unfollowUser);

// Get user's followers
router.get('/:userId/followers', followController.getFollowers);

// Get user's following
router.get('/:userId/following', followController.getFollowing);

// Check if current user follows another user
router.get('/:userId/status', followController.checkFollowStatus);

export default router;
