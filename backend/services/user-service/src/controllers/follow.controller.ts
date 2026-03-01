import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as FollowModel from '../models/follow.model';


export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user?.user_id!;
    const { userId } = req.params;

    // Can't follow yourself
    if (followerId === userId) {
      res.status(400).json({ success: false, error: 'Cannot follow yourself' });
      return;
    }

    // Check if already following
    const alreadyFollowing = await FollowModel.isFollowing(followerId, userId);
    if (alreadyFollowing) {
      res.status(400).json({ success: false, error: 'Already following this user' });
      return;
    }

    const follow = await FollowModel.followUser(followerId, userId);

    res.json({
      success: true,
      message: 'Successfully followed user',
      data: { follow },
    });
  } catch (error: any) {
    if (error.code === '23503') {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user?.user_id!;
    const { userId } = req.params;

    const success = await FollowModel.unfollowUser(followerId, userId);

    if (!success) {
      res.status(404).json({ success: false, error: 'Follow relationship not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const followers = await FollowModel.getFollowers(userId, limit, offset);
    const total = await FollowModel.getFollowersCount(userId);

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const following = await FollowModel.getFollowing(userId, limit, offset);
    const total = await FollowModel.getFollowingCount(userId);

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkFollowStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user?.user_id!;
    const { userId } = req.params;

    const isFollowing = await FollowModel.isFollowing(followerId, userId);

    res.json({
      success: true,
      data: { is_following: isFollowing },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
