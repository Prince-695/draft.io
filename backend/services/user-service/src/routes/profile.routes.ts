import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateUpdateProfile, validatePersonalization } from '../middleware/validation.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Get my profile (protected) — must come before /:username
router.get('/me/profile', authMiddleware, profileController.getMyProfile);

// Search users (protected) — must come before /:username
router.get('/search/users', authMiddleware, profileController.searchUsers);

// Get profile by ID (protected) — must come before /:username
router.get('/id/:userId', authMiddleware, profileController.getProfileById);

// Update profile (protected)
router.put('/', authMiddleware, validateUpdateProfile, profileController.updateProfile);

// Submit personalization (protected)
router.post('/personalize', authMiddleware, validatePersonalization, profileController.submitPersonalization);

// Get profile by username (public) — must be last (dynamic param catches everything)
router.get('/:username', profileController.getProfile);

export default router;
