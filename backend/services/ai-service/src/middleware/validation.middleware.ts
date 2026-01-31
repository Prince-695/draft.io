import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
};

// Validation schemas
export const contentGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic is too long'),
  tone: z.enum(['professional', 'casual', 'technical', 'creative']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export const grammarCheckSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content exceeds maximum length'),
});

export const contentImprovementSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content exceeds maximum length'),
  improvementType: z.enum(['clarity', 'engagement', 'professionalism', 'all']).optional(),
});

export const seoSuggestionsSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content exceeds maximum length'),
  targetKeywords: z.array(z.string()).optional(),
});

export const summarizationSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content exceeds maximum length'),
  maxLength: z.number().min(50).max(1000).optional(),
});

export const titleSuggestionsSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content is too long'),
  count: z.number().min(1).max(10).optional(),
});

export const outlineGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic is too long'),
  sections: z.number().min(3).max(10).optional(),
});
