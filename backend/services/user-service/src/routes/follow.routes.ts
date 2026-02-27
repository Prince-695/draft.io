import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as followController from '../controllers/follow.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Follow user
router.post('/follow/:userId', followController.followUser);

// Unfollow user
router.delete('/unfollow/:userId', followController.unfollowUser);

// Get user's followers
router.get('/followers/:userId', followController.getFollowers);

// Get user's following
router.get('/following/:userId', followController.getFollowing);

// Check if current user follows another user
router.get('/status/:userId', followController.checkFollowStatus);

export default router;
