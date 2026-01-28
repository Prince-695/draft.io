import { body } from 'express-validator';

export const validateUpdateProfile = [
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('location').optional().isString().isLength({ max: 100 }),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('twitter_handle').optional().isString().matches(/^@?[a-zA-Z0-9_]{1,15}$/),
  body('linkedin_url').optional().isURL(),
  body('github_url').optional().isURL(),
  body('interests').optional().isArray(),
  body('writing_goals').optional().isArray(),
  body('experience_level').optional().isIn(['beginner', 'intermediate', 'advanced']),
];

export const validatePersonalization = [
  body('interests').isArray().withMessage('Interests must be an array'),
  body('interests.*').isString(),
  body('writing_goals').isArray().withMessage('Writing goals must be an array'),
  body('writing_goals.*').isString(),
  body('experience_level').isIn(['beginner', 'intermediate', 'advanced']),
];
