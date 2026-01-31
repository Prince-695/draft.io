# AI Service

AI-powered content generation and improvement service using Google Gemini API.

## Features

- **Content Generation**: Generate blog content from topics
- **Title Suggestions**: Get catchy, SEO-friendly title ideas
- **Outline Creation**: Generate structured outlines for blog posts
- **Grammar Check**: Check and correct grammar, spelling, and punctuation
- **Content Improvement**: Improve clarity, engagement, and professionalism
- **SEO Suggestions**: Get meta titles, descriptions, and optimization tips
- **Content Summarization**: Create concise summaries of long content
- **Rate Limiting**: Free (10 requests/15 min) and Premium (100 requests/15 min)
- **Usage Tracking**: Track AI usage for analytics

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **AI**: Google Gemini API (gemini-1.5-flash)
- **Cache**: Redis (rate limiting & usage tracking)
- **Validation**: Zod
- **Authentication**: JWT

## Environment Variables

```env
PORT=5005
NODE_ENV=development

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_FREE_MAX=10            # Free tier limit
RATE_LIMIT_PREMIUM_MAX=100        # Premium tier limit

# Feature Limits
MAX_CONTENT_LENGTH=10000
MAX_GENERATION_TOKENS=2000
```

## Installation

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Update .env with your Google Gemini API key
```

## Running the Service

```bash
# Development mode
bun run dev

# Production mode
bun run build
bun start
```

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Content Generation

#### Generate Blog Content
```http
POST /api/ai/generate/content
Content-Type: application/json

{
  "topic": "The Future of AI in Web Development",
  "tone": "professional",      // optional: professional|casual|technical|creative
  "length": "medium"           // optional: short|medium|long
}
```

#### Generate Title Suggestions
```http
POST /api/ai/generate/titles
Content-Type: application/json

{
  "content": "Your blog content here...",
  "count": 5                   // optional: 1-10
}
```

#### Generate Outline
```http
POST /api/ai/generate/outline
Content-Type: application/json

{
  "topic": "Machine Learning Basics",
  "sections": 5                // optional: 3-10
}
```

### Content Improvement

#### Check Grammar
```http
POST /api/ai/improve/grammar
Content-Type: application/json

{
  "content": "Your text to check..."
}
```

#### Improve Content
```http
POST /api/ai/improve/content
Content-Type: application/json

{
  "content": "Your content here...",
  "improvementType": "all"     // optional: clarity|engagement|professionalism|all
}
```

### SEO & Summarization

#### Get SEO Suggestions
```http
POST /api/ai/seo/suggestions
Content-Type: application/json

{
  "content": "Your blog content...",
  "targetKeywords": ["ai", "machine learning"]  // optional
}
```

#### Summarize Content
```http
POST /api/ai/summarize
Content-Type: application/json

{
  "content": "Your long content here...",
  "maxLength": 200             // optional: 50-1000 words
}
```

## Rate Limiting

- **Free Plan**: 10 requests per 15 minutes
- **Premium Plan**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: When the rate limit resets

## Error Responses

```json
{
  "success": false,
  "error": "Error message here",
  "details": []  // Validation errors (if applicable)
}
```

## Testing

```bash
# Get a JWT token first from auth-service
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test content generation
curl -X POST http://localhost:5005/api/ai/generate/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topic": "The Future of AI",
    "tone": "professional",
    "length": "short"
  }'

# Test title generation
curl -X POST http://localhost:5005/api/ai/generate/titles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Artificial intelligence is transforming how we build applications...",
    "count": 3
  }'
```

## Architecture

```
ai-service/
├── src/
│   ├── config/
│   │   ├── gemini.ts          # Google Gemini API setup
│   │   └── redis.ts           # Redis connection
│   ├── controllers/
│   │   ├── content.controller.ts    # Content generation
│   │   ├── improvement.controller.ts # Grammar & improvement
│   │   └── seo.controller.ts        # SEO & summarization
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── ratelimit.middleware.ts  # Rate limiting
│   │   └── validation.middleware.ts # Request validation
│   ├── routes/
│   │   └── ai.routes.ts      # API routes
│   ├── types/
│   │   └── ai.types.ts       # TypeScript types
│   └── index.ts              # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Health Check

```bash
curl http://localhost:5005/health
```

Response:
```json
{
  "success": true,
  "service": "ai-service",
  "status": "running",
  "timestamp": "2026-01-31T..."
}
```

## Notes

- Google Gemini API key is required for AI features to work
- Rate limiting is tracked per user via Redis
- All content is limited to 10,000 characters max
- Generation output is limited to 2,000 tokens
- Safety settings are enabled to block harmful content
