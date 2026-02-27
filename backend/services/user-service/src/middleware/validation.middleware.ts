import { body } from 'express-validator';

export const validateUpdateProfile = [
  body('full_name').optional({ checkFalsy: true }).isString().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('bio').optional({ checkFalsy: true }).isString().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('location').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
  // website can be a full URL — skip validation when empty
  body('website').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).withMessage('Invalid website URL'),
  // social handles: accept plain username, @handle, or full URL — just validate max length
  body('twitter_handle').optional({ checkFalsy: true }).isString().isLength({ max: 100 }).withMessage('Invalid Twitter handle'),
  body('linkedin_url').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).withMessage('Invalid LinkedIn URL'),
  body('github_url').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).withMessage('Invalid GitHub URL'),
  body('interests').optional({ checkFalsy: true }).isArray(),
  body('writing_goals').optional({ checkFalsy: true }).isArray(),
  body('experience_level').optional({ checkFalsy: true }).isIn(['beginner', 'intermediate', 'advanced']),
];

export const validatePersonalization = [
  body('interests').isArray().withMessage('Interests must be an array'),
  body('interests.*').isString(),
  body('writing_goals').isArray().withMessage('Writing goals must be an array'),
  body('writing_goals.*').isString(),
  body('experience_level').isIn(['beginner', 'intermediate', 'advanced']),
];
