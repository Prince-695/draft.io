import { Router } from 'express';
import { generateContent, generateTitles, generateOutline } from '../controllers/content.controller';
import { checkGrammar, improveContent } from '../controllers/improvement.controller';
import { generateSEO, summarizeContent } from '../controllers/seo.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { rateLimiter, getUsageHandler } from '../middleware/ratelimit.middleware';
import {
  validate,
  contentGenerationSchema,
  grammarCheckSchema,
  contentImprovementSchema,
  seoSuggestionsSchema,
  summarizationSchema,
  titleSuggestionsSchema,
  outlineGenerationSchema,
} from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Usage check does NOT consume a request — must be registered before rateLimiter
router.get('/usage', getUsageHandler);

// Rate limiting applied to all AI generation/improvement routes below
router.use(rateLimiter);

// Content generation routes
router.post('/generate/content', validate(contentGenerationSchema), generateContent);
router.post('/generate/titles', validate(titleSuggestionsSchema), generateTitles);
router.post('/generate/outline', validate(outlineGenerationSchema), generateOutline);

// Content improvement routes
router.post('/improve/grammar', validate(grammarCheckSchema), checkGrammar);
router.post('/improve/content', validate(contentImprovementSchema), improveContent);

// SEO and summarization routes
router.post('/seo/suggestions', validate(seoSuggestionsSchema), generateSEO);
router.post('/summarize', validate(summarizationSchema), summarizeContent);

export default router;
