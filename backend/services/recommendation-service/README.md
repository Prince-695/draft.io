# Recommendation Service

AI-powered personalized blog recommendation service for Draft.IO platform.

## Status

✅ **Phase 2 - IN PROGRESS**

## Features

- Personalized blog feed based on user interests
- Collaborative filtering (user behavior patterns)
- Content-based filtering (blog similarity)
- Trending blogs calculation
- Reading history tracking
- OpenAI embeddings for content similarity
- Redis caching for performance
- Kafka event consumer for real-time updates

## Tech Stack

- **Runtime**: Bun v1.3.8
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (user preferences, reading history)
- **Cache**: Redis (recommendations, trending)
- **Events**: Kafka (blog.published, engagement events)
- **AI**: OpenAI Embeddings API
- **Authentication**: JWT

## Recommendation Algorithm

### 1. Collaborative Filtering
- Finds users with similar reading patterns
- Recommends blogs liked by similar users
- Weight: 40%

### 2. Content-Based Filtering
- Uses OpenAI embeddings to find similar blogs
- Based on user's reading history and interests
- Weight: 40%

### 3. Trending Score
- Recent blogs with high engagement
- Time decay factor
- Weight: 20%

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/feed` | Get personalized blog feed | Yes |
| GET | `/trending` | Get trending blogs | No |
| GET | `/similar/:blogId` | Get similar blogs | No |
| POST | `/track-read` | Track blog read event | Yes |
| GET | `/history` | Get reading history | Yes |
| GET | `/health` | Health check | No |

## Environment Variables

```env
PORT=5008
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=draftio
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=recommendation-service
KAFKA_GROUP_ID=recommendation-service-group

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# JWT
JWT_SECRET=your-jwt-secret
```

## Installation

```bash
cd backend/services/recommendation-service
bun install
```

## Run

```bash
bun run dev
```

Server starts on `http://localhost:5008`
