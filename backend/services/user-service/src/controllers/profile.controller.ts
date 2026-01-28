import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ProfileModel from '../models/profile.model';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload.util';
import { validationResult } from 'express-validator';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    // Get user ID from username
    const userQuery = await require('../config/database').default.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userQuery.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userId = userQuery.rows[0].id;
    const profile = await ProfileModel.findProfileByUserId(userId);

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: { profile } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id!;
    let profile = await ProfileModel.findProfileByUserId(userId);

    // Create profile if doesn't exist
    if (!profile) {
      profile = await ProfileModel.createProfile({ user_id: userId });
    }

    res.json({ success: true, data: { profile } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user?.user_id!;
    const profile = await ProfileModel.updateProfile(userId, req.body);

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.user_id!;
    const profile = await ProfileModel.findProfileByUserId(userId);

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      await deleteFromCloudinary(profile.avatar_url);
    }

    // Upload new avatar
    const avatarUrl = await uploadToCloudinary(req.file, 'avatars');
    const updatedProfile = await ProfileModel.updateProfile(userId, { avatar_url: avatarUrl });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar_url: avatarUrl, profile: updatedProfile },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadCoverImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.user_id!;
    const profile = await ProfileModel.findProfileByUserId(userId);

    // Delete old cover if exists
    if (profile?.cover_image_url) {
      await deleteFromCloudinary(profile.cover_image_url);
    }

    // Upload new cover
    const coverUrl = await uploadToCloudinary(req.file, 'covers');
    const updatedProfile = await ProfileModel.updateProfile(userId, { cover_image_url: coverUrl });

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: { cover_image_url: coverUrl, profile: updatedProfile },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitPersonalization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user?.user_id!;
    const { interests, writing_goals, experience_level } = req.body;

    const profile = await ProfileModel.updateProfile(userId, {
      interests,
      writing_goals,
      experience_level,
    });

    res.json({
      success: true,
      message: 'Personalization saved successfully',
      data: { profile },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: 'Search query required' });
      return;
    }

    const users = await ProfileModel.searchUsers(q, 20);

    res.json({
      success: true,
      data: { users, count: users.length },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
