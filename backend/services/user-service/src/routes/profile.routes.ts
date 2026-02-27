import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validateUpdateProfile, validatePersonalization } from '../middleware/validation.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Get my profile (protected) — must come before /:username
router.get('/me/profile', authMiddleware, profileController.getMyProfile);

// Search users (protected) — must come before /:username
router.get('/search/users', authMiddleware, profileController.searchUsers);

// Update profile (protected)
router.put('/', authMiddleware, validateUpdateProfile, profileController.updateProfile);

// Upload avatar (protected)
router.post('/avatar', authMiddleware, upload.single('avatar'), profileController.uploadAvatar);

// Upload cover image (protected)
router.post('/cover', authMiddleware, upload.single('cover'), profileController.uploadCoverImage);

// Submit personalization (protected)
router.post('/personalize', authMiddleware, validatePersonalization, profileController.submitPersonalization);

// Get profile by username (public) — must be last (dynamic param catches everything)
router.get('/:username', profileController.getProfile);

export default router;
