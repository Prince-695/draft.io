import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ProfileModel from '../models/profile.model';
import { validationResult } from 'express-validator';

// Build a flat, normalized profile object from a joined users+user_profiles row
const buildProfileResponse = (row: any) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  full_name: row.full_name,
  bio: row.bio ?? null,
  location: row.location ?? null,
  website: row.website ?? null,
  twitter_handle: row.twitter_handle ?? null,
  linkedin_url: row.linkedin_url ?? null,
  github_url: row.github_url ?? null,
  interests: row.interests ?? [],
  expertise_tags: row.expertise_tags ?? [],
  writing_goals: row.writing_goals ?? null,
  experience_level: row.experience_level ?? null,
  followers_count: Number(row.followers_count ?? 0),
  following_count: Number(row.following_count ?? 0),
  is_verified: row.is_verified ?? false,
  created_at: row.created_at,
});

export const getProfileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const db = require('../config/database').default;

    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.is_verified, u.created_at,
              p.bio, p.avatar_url, p.cover_image_url, p.location, p.website,
              p.twitter_handle, p.linkedin_url, p.github_url,
              p.interests, p.expertise_tags, p.writing_goals, p.experience_level,
              p.followers_count, p.following_count
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const row = result.rows[0];
    res.json({ success: true, data: buildProfileResponse(row) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const db = require('../config/database').default;

    // JOIN users + user_profiles in one query
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.is_verified, u.created_at,
              p.bio, p.avatar_url, p.cover_image_url, p.location, p.website,
              p.twitter_handle, p.linkedin_url, p.github_url,
              p.interests, p.expertise_tags, p.writing_goals, p.experience_level,
              p.followers_count, p.following_count
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const row = result.rows[0];
    res.json({ success: true, data: buildProfileResponse(row) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id!;
    const db = require('../config/database').default;

    // Ensure profile row exists
    let profile = await ProfileModel.findProfileByUserId(userId);
    if (!profile) {
      await ProfileModel.createProfile({ user_id: userId }).catch(() => null);
    }

    // Return full joined data
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.is_verified, u.created_at,
              p.bio, p.avatar_url, p.cover_image_url, p.location, p.website,
              p.twitter_handle, p.linkedin_url, p.github_url,
              p.interests, p.expertise_tags, p.writing_goals, p.experience_level,
              p.followers_count, p.following_count
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: buildProfileResponse(result.rows[0]) });
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
