import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validateUpdateProfile, validatePersonalization } from '../middleware/validation.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Get profile by username (public)
router.get('/:username', profileController.getProfile);

// Get my profile (protected)
router.get('/me/profile', authMiddleware, profileController.getMyProfile);

// Update profile (protected)
router.put('/', authMiddleware, validateUpdateProfile, profileController.updateProfile);

// Upload avatar (protected)
router.post('/avatar', authMiddleware, upload.single('avatar'), profileController.uploadAvatar);

// Upload cover image (protected)
router.post('/cover', authMiddleware, upload.single('cover'), profileController.uploadCoverImage);

// Submit personalization (protected)
router.post('/personalize', authMiddleware, validatePersonalization, profileController.submitPersonalization);

// Search users (protected)
router.get('/search/users', authMiddleware, profileController.searchUsers);

export default router;
