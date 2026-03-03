# Draft.IO — Backend

A set of **9 independent microservices** written in TypeScript, running on Express/Bun, orchestrated with Docker Compose.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services Reference](#services-reference)
- [Database Schema](#database-schema)
- [Inter-Service Communication](#inter-service-communication)
- [Authentication & Security](#authentication--security)
- [AI Rate Limiting](#ai-rate-limiting)
- [Real-Time (WebSockets)](#real-time-websockets)
- [Recommendation Engine](#recommendation-engine)
- [Running Locally](#running-locally)
- [Individual Service Docs](#individual-service-docs)
- [Project Conventions](#project-conventions)

---

## Architecture Overview

```
                    ┌──────────────────────────────────────┐
                    │         API GATEWAY  :5000           │
                    │  Helmet · CORS · Rate-Limit · Morgan │
                    │  http-proxy-middleware               │
                    └──┬───────────────────────────────────┘
                       │  draftio-network (Docker bridge)
          ┌────┬───────┼─────────────────┬────┬─────────┬─────────┬───────┐
          │    │       │                 │    │         │         │       │
          ▼    │       ▼                 ▼    │         ▼         │       ▼
    auth :5001 │ user :5002       blog :5003  │ engagement :5004  │   ai :5005
    pg, redis  │    pg          pg,mongo,redis│        pg         │ redis, openai
               │                              │                   │
               ▼                              ▼                   ▼
        notification :5006              chat :5007     recommendation :5008
        pg, redis, socket              mongo, socket    pg, redis, openai
```

All services sit on a shared Docker bridge network (`draftio-network`). Only the API Gateway and the two WebSocket services (5006, 5007) expose ports to the host. The rest are internal only.

---

## Services Reference

### 1. API Gateway — port 5000

The sole public entry point. Every browser request hits here first.

**Responsibilities:**
- Reverse-proxy routing to downstream services via `http-proxy-middleware`
- Global rate limiting (`express-rate-limit`)
- CORS policy (configured via `FRONTEND_URL` env var)
- Security headers (`helmet`)
- Request logging (`morgan`)
- Exposes `X-AI-Requests-Used/Limit/Remaining` headers from AI service

**Proxy Rules:**

| Incoming path | Target service | Port |
|---|---|---|
| `/api/auth/*` | auth-service | 5001 |
| `/api/users/*` | user-service | 5002 |
| `/api/blogs/*` | blog-service | 5003 |
| `/api/engagement/*` | engagement-service | 5004 |
| `/api/ai/*` | ai-service | 5005 |
| `/api/notifications/*` | notification-service | 5006 (WebSocket) |
| `/api/chat/*` | chat-service | 5007 (WebSocket) |
| `/api/recommendations/*` | recommendation-service | 5008 |

**Health:** `GET /health`, `GET /status` (pings all downstream services)

---

### 2. Auth Service — port 5001

Full authentication lifecycle for all users.

**Databases:** PostgreSQL (`users` table), Redis (token storage + blacklisting)

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, hash password, issue JWT pair |
| POST | `/auth/login` | — | Verify credentials, issue JWT pair |
| POST | `/auth/logout` | ✓ | Blacklist access token, delete refresh token |
| POST | `/auth/refresh` | — | Exchange refresh token for new access token |
| GET | `/auth/me` | ✓ | Return authenticated user info |
| GET | `/auth/verify-email` | — | Verify email via token link |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password` | — | Set new password via reset token |
| GET | `/auth/google` | — | Initiate Google OAuth redirect |
| GET | `/auth/google/callback` | — | Handle OAuth callback, issue JWT pair |

**Token Strategy:**
- `accessToken` — JWT, 15 minute TTL, signed with `JWT_SECRET`
- `refreshToken` — JWT, 7 day TTL, stored in Redis under `auth:refresh:{userId}`
- On logout: access token added to Redis blacklist `auth:blacklist:{token}`
- On refresh: old refresh token deleted, new pair issued (rotation)

**Google OAuth:** Passport.js `passport-google-oauth20` strategy. On callback, user is upserted into PostgreSQL. JWT pair issued and returned as query params to `/auth/callback` frontend page.

---

### 3. User Service — port 5002

User profile management and the social follow graph.

**Database:** PostgreSQL (`user_profiles`, `follows`)

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/profile/me/profile` | ✓ | Own full profile |
| GET | `/users/profile/:username` | — | Public profile by username |
| GET | `/users/profile/id/:userId` | ✓ | Profile by UUID |
| PUT | `/users/profile` | ✓ | Update bio, social links, etc. |
| POST | `/users/profile/personalize` | ✓ | Submit onboarding interests/goals |
| GET | `/users/profile/search/users?q=` | ✓ | Search users by name/username |
| POST | `/users/follow/:userId` | ✓ | Follow a user |
| DELETE | `/users/unfollow/:userId` | ✓ | Unfollow a user |
| GET | `/users/followers/:userId` | ✓ | Paginated follower list |
| GET | `/users/following/:userId` | ✓ | Paginated following list |
| GET | `/users/status/:userId` | ✓ | Check if current user follows target |

**Notes:** `followers_count` and `following_count` are maintained as denormalized integer columns on `user_profiles` for O(1) reads. Incremented/decremented on follow/unfollow.

---

### 4. Blog Service — port 5003

Core content management — creation, editing, publishing, search, and analytics.

**Databases:** PostgreSQL (`blogs`, `tags`, `blog_tags`, `categories`, `blog_analytics`), MongoDB (`blog_content`), Redis (optional caching)

**Why two databases?** Blog metadata (author, slug, status, counts) lives in PostgreSQL for relational queries and JOINs. The rich HTML body from TipTap lives in MongoDB to avoid large text columns in Postgres and allow flexible content schemas.

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/blogs/feed` | — | Paginated published blogs |
| GET | `/blogs/search?q=` | — | Full-text search |
| GET | `/blogs/my-blogs` | ✓ | Own blogs (all statuses) |
| GET | `/blogs/user/:authorId` | — | Public blogs by author |
| GET | `/blogs/:blogId` | opt | Single blog with content |
| POST | `/blogs` | ✓ | Create blog (draft or published) |
| PUT | `/blogs/:blogId` | ✓ | Update title, content, tags, cover |
| DELETE | `/blogs/:blogId` | ✓ | Delete blog |
| POST | `/blogs/:blogId/publish` | ✓ | Set status = published |
| POST | `/blogs/:blogId/unpublish` | ✓ | Set status = draft |
| POST | `/blogs/:blogId/draft` | ✓ | Save draft content to MongoDB |
| GET | `/blogs/:blogId/draft` | ✓ | Load last draft |
| GET | `/blogs/:blogId/analytics` | ✓ | View/engagement analytics |

**Slug generation:** Auto-generated from title on create; collision-safe via suffix counter.

**Reading time:** Calculated server-side as `Math.ceil(wordCount / 200)` minutes.

---

### 5. Engagement Service — port 5004

All user interactions with blog posts.

**Database:** PostgreSQL (`likes`, `comments`, `bookmarks`, `shares`)

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/engagement/:blogId/like` | ✓ | Like a blog |
| DELETE | `/engagement/:blogId/like` | ✓ | Unlike |
| POST | `/engagement/:blogId/comments` | ✓ | Add comment (top-level or reply) |
| GET | `/engagement/:blogId/comments` | — | Threaded comment list |
| PUT | `/engagement/comments/:commentId` | ✓ | Edit own comment |
| DELETE | `/engagement/comments/:commentId` | ✓ | Delete own comment |
| POST | `/engagement/:blogId/bookmark` | ✓ | Bookmark |
| DELETE | `/engagement/:blogId/bookmark` | ✓ | Remove bookmark |
| GET | `/engagement/bookmarks` | ✓ | Current user's bookmarks |
| POST | `/engagement/:blogId/share` | — | Track share event + platform |

**Denormalization:** `likes_count` and `comments_count` on the `blogs` table are updated via triggers/queries on every engagement event for fast read performance.

---

### 6. AI Service — port 5005

OpenAI-powered writing tools with per-user monthly rate limiting.

**Database:** Redis (rate limit counters)  
**External API:** OpenAI `gpt-4o-mini`

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/ai/usage` | Current month's used/limit (free — no deduction) |
| POST | `/api/ai/generate/content` | Generate blog content from prompt |
| POST | `/api/ai/generate/titles` | Suggest 5 blog titles |
| POST | `/api/ai/generate/outline` | Generate structured outline |
| POST | `/api/ai/improve/content` | Improve/rewrite content (supports conversation history) |
| POST | `/api/ai/improve/grammar` | Grammar and spelling fix |
| POST | `/api/ai/seo/suggestions` | SEO title, description, keyword suggestions |
| POST | `/api/ai/summarize` | TL;DR summary |

**Rate Limiting Logic:**
```
Redis key: ai:monthly:{userId}:{YYYY-MM}
TTL: 35 days (auto-expires after month end)
Limit: 10 requests/month (configurable via AI_MONTHLY_LIMIT env var)

On each generation request:
  1. GET counter from Redis
  2. If >= 10 → return 429 with error message
  3. INCR counter
  4. Set response headers:
     X-AI-Requests-Used: N
     X-AI-Requests-Limit: 10
     X-AI-Requests-Remaining: 10-N
```

The frontend axios interceptor reads these headers on every response and updates the live quota progress bar without any additional API call.

---

### 7. Notification Service — port 5006

Real-time push notifications with PostgreSQL persistence.

**Databases:** PostgreSQL (`notifications`), Redis (caching)  
**Transport:** Socket.io (WebSocket, exposed on port 5006)

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | Paginated notification list |
| GET | `/notifications/unread-count` | Unread badge count |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |

**Socket.io Events (server → client):**
- `new_notification` — pushed when a followed user publishes, likes, comments, or messages
- `unread_count` — updated count after any change

**Notification types:** `follow`, `like`, `comment`, `mention`, `message`

---

### 8. Chat Service — port 5007

One-to-one direct messaging, fully real-time.

**Database:** MongoDB (`messages`, `conversations`)  
**Transport:** Socket.io (WebSocket, exposed on port 5007)

**REST Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/messages/:userId` | Paginated message history with a user |
| GET | `/messages` | All conversations for current user |
| GET | `/messages/unread/count` | Total unread messages |
| DELETE | `/messages/:messageId` | Delete own message |

**Socket.io Events:**

| Direction | Event | Payload |
|---|---|---|
| client → server | `send_message` | `{ receiverId, content }` |
| server → client | `message_received` | Full message object |
| server → client | `message_sent` | Confirmation of own message |
| client → server | `check_online` | `{ userId }` |
| server → client | `user_status` | `{ userId, online: bool }` |
| client → server | `typing` | `{ receiverId }` |
| server → client | `user_typing` | `{ userId }` |

Messages are persisted to MongoDB on every `send_message` event. Conversation list is derived by grouping messages.

---

### 9. Recommendation Service — port 5008

Personalized content discovery using collaborative filtering and interest graphs.

**Databases:** PostgreSQL (`reading_history`, `user_interests`), Redis (feed cache)  
**External API:** OpenAI (optional embedding similarity)

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/recommendations/feed` | Personalized blog feed |
| GET | `/api/recommendations/trending` | Trending blogs (last 7 days) |
| GET | `/api/recommendations/similar/:blogId` | Tag-similarity based related posts |
| POST | `/api/recommendations/seed-interests` | Seed explicit interests from onboarding |
| POST | `/api/recommendations/track-read` | Track a blog read event |
| GET | `/api/recommendations/history` | User reading history |

**Algorithm:**
1. User reads a blog → tags extracted → `user_interests.weight += 1.0` per tag
2. Onboarding seeds interests at weight `2.0` (explicit > inferred)
3. Feed request: load top-10 interests → score all blogs by tag overlap + recency
4. Collaborative filtering: find other users with ≥60% tag overlap → pull their top reads
5. Cache result in Redis (TTL 5 min); bust on new read event

---

## Database Schema

Full PostgreSQL schema is in [`init.sql`](./init.sql). It runs automatically on first `docker compose up`. MongoDB collections are created lazily by each service.

Key tables:

```sql
-- Auth
users (id UUID, email, username, full_name, password_hash, is_verified, ...)

-- User
user_profiles (user_id FK, bio, location, interests[], followers_count, ...)
follows (follower_id FK, following_id FK, UNIQUE constraint)

-- Blog
blogs (id UUID, author_id FK, title, slug, status, reading_time, views_count, ...)
tags (id SERIAL, name, slug)
blog_tags (blog_id FK, tag_id FK, PK)
blog_analytics (id UUID, blog_id FK, action, ...)

-- Engagement
comments (id UUID, blog_id, user_id, parent_id, content, ...)
likes (id UUID, user_id, blog_id, UNIQUE)
bookmarks (id UUID, user_id, blog_id, UNIQUE)
shares (id UUID, blog_id, user_id, platform)

-- Notification
notifications (id UUID, user_id, type, title, message, is_read, ...)

-- Recommendation
reading_history (user_id, blog_id, time_spent, read_at, UNIQUE conflict → UPDATE)
user_interests (user_id, tag, weight FLOAT)
```

---

## Inter-Service Communication

All services communicate exclusively via **HTTP REST** on the internal Docker network. There is no message queue or Kafka. The API gateway is the only service called by the frontend.

```
frontend → api-gateway → target-service
```

Services do **not** call each other directly (no service-to-service HTTP). Each service is autonomous with its own database.

---

## Authentication & Security

Every protected endpoint uses a shared `authenticateToken` / `authMiddleware` function that:
1. Reads `Authorization: Bearer <token>` header
2. Verifies JWT signature with `JWT_SECRET`
3. Checks Redis blacklist for invalidated tokens
4. Attaches `req.user` / `req.userId` to the request

The token is validated per-service — no central auth server call is made. Each service embeds its own `auth.middleware.ts` that reads the same `JWT_SECRET`.

---

## AI Rate Limiting

The `rateLimiter` middleware in ai-service is applied **globally** to all generation/improvement/SEO routes via `router.use(rateLimiter)`. The `/usage` endpoint is registered **before** `router.use(rateLimiter)` and is therefore free.

The Redis key expires after 35 days, which naturally resets the counter at the start of every month.

---

## Real-Time (WebSockets)

Both WebSocket services (chat and notification) accept connections directly from the browser. The API Gateway proxies HTTP requests to them but WebSocket **upgrade requests** bypass the gateway — the frontend connects directly to `:5006` (notifications) and `:5007` (chat).

Authentication for WebSocket connections is handled via the `auth` option in `socket.io-client`:
```js
io('ws://localhost:5007', { auth: { token: accessToken } })
```
The server verifies the JWT in the `connection` event handler before allowing any events.

---

## Running Locally

```bash
# 1. Clone
git clone https://github.com/Prince-695/draft.io.git
cd draft.io/backend

# 2. Create .env from the template (fill in secrets)
cp .env.example .env

# 3. Start everything (builds images + starts all services + databases)
docker compose up --build

# 4. Rebuild a single service after code change
docker compose up --build blog-service

# 5. View logs of one service
docker compose logs -f ai-service

# 6. Stop everything
docker compose down
```

**Services boot order:** PostgreSQL → MongoDB → Redis → application services → api-gateway

---

## Individual Service Docs

Each service ships a Swagger UI. Once running:

| Service | Swagger URL |
|---|---|
| auth-service | http://localhost:5001/api-docs |
| user-service | http://localhost:5002/api-docs |
| blog-service | http://localhost:5003/api-docs |
| engagement-service | http://localhost:5004/api-docs |
| ai-service | http://localhost:5005/api-docs |

---

## Project Conventions

- **Runtime:** All services use [Bun](https://bun.sh) as the TypeScript runner (`bun src/index.ts`)
- **Validation:** Zod schemas are used for all incoming request bodies
- **Error responses:** All services return `{ success: false, error: string }` on error
- **Success responses:** All services return `{ success: true, data: T }` on success
- **Logging:** `console.log` with emoji prefixes (🚀 start, ✅ success, ❌ error)
- **Graceful shutdown:** All services listen for `SIGTERM` to close DB connections cleanly
- **Connection pools:** Each service obtains its own PG pool — not shared across services
