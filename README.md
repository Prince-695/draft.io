# Draft.IO — AI-Powered Blogging Platform

> A full-stack, production-ready blogging platform with AI-assisted writing, real-time chat, personalized recommendations, and a microservices backend.

---

## Table of Contents

- [Overview](#overview)
- [Live Architecture Diagram](#live-architecture-diagram)
- [Feature Set](#feature-set)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
  - [Microservices Map](#microservices-map)
  - [Database Design](#database-design)
  - [Request Flow — End to End](#request-flow--end-to-end)
  - [Authentication Flow](#authentication-flow)
  - [Real-Time Architecture](#real-time-architecture)
  - [AI Pipeline](#ai-pipeline)
  - [Recommendation Engine](#recommendation-engine)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference Overview](#api-reference-overview)

---

## Overview

Draft.IO is a modern, full-stack blogging platform that combines rich content creation tools with AI writing assistance. Users can write, publish, and discover blog posts while the platform learns their preferences to deliver a personalized reading feed. The entire backend is split into **9 independent microservices**, each with its own database, deployed together via Docker Compose.

---

## Live Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT  (Browser)                               │
│                    Next.js 16  ·  React 19  ·  Port 3000                │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  HTTP / REST  (API calls)
                               │  WebSocket    (chat + notifications)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY  :5000                               │
│   Helmet · CORS · Rate-Limit · Morgan · http-proxy-middleware            │
│                                                                          │
│  /api/auth   →  auth-service          :5001                             │
│  /api/users  →  user-service          :5002                             │
│  /api/blogs  →  blog-service          :5003                             │
│  /api/engagement → engagement-service :5004                             │
│  /api/ai     →  ai-service            :5005                             │
│  /api/notifications → notification-service :5006 (ws)                   │
│  /api/chat   →  chat-service          :5007 (ws)                        │
│  /api/recommendations → recommendation-service :5008                    │
└──────┬───────────────────────────────────────────────────────────────────┘
       │  Internal Docker network  (draftio-network)
       │
       ├──► auth-service        :5001   ──► PostgreSQL  (users, tokens)
       │                                ──► Redis       (refresh tokens, blacklists)
       │
       ├──► user-service        :5002   ──► PostgreSQL  (user_profiles, follows)
       │
       ├──► blog-service        :5003   ──► PostgreSQL  (blogs, tags, analytics)
       │                                ──► MongoDB     (blog_content — rich HTML)
       │                                ──► Redis       (cache)
       │
       ├──► engagement-service  :5004   ──► PostgreSQL  (likes, comments, bookmarks, shares)
       │
       ├──► ai-service          :5005   ──► Redis       (rate limit counters)
       │                                ──► OpenAI API  (GPT-4o-mini)
       │
       ├──► notification-service :5006  ──► PostgreSQL  (notifications)
       │                                ──► Redis       (cache)
       │                                ──► Socket.io   (push to browser)
       │
       ├──► chat-service        :5007   ──► MongoDB     (messages, conversations)
       │                                ──► Socket.io   (real-time DMs)
       │
       └──► recommendation-service :5008 ──► PostgreSQL (reading_history, user_interests)
                                         ──► Redis      (feed cache, 5-min TTL)
                                         ──► OpenAI API (embedding similarity)
```

---

## Feature Set

| Category | Features |
|---|---|
| **Auth** | Email/password register & login, Google OAuth 2.0, JWT access + refresh tokens, email verification, password reset |
| **Blog Writing** | Rich TipTap editor (headings, code blocks, images, links), 30-second autosave, draft system, publish/unpublish, cover image, tagging, reading-time estimate |
| **AI Writing** | Generate content from a prompt, improve existing content, grammar check, SEO suggestions, content summarization, title suggestions, outline generation — 10 requests/month/user |
| **Discovery** | Personalized feed, trending blogs (engagement-weighted), similar blogs, full-text search, category/tag browsing |
| **Engagement** | Like, comment (threaded), bookmark, share tracking, view count, analytics dashboard |
| **Social** | Follow/unfollow users, follower & following lists, public user profiles |
| **Real-Time Chat** | One-to-one direct messages, conversation history, online presence detection, typing indicators, unread badge |
| **Notifications** | Real-time push notifications for follows, likes, comments, messages; mark-as-read, mark-all-as-read |
| **Personalization** | Onboarding questionnaire seeds interests; reading history continuously updates preference weights |
| **Themes** | Light / Dark mode toggle |

---

## Technology Stack

### Frontend
| Tech | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework, SSR/CSR routing |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | Component library |
| TipTap | Rich text editor |
| Zustand | Client state (auth, chat, UI) |
| TanStack React Query v5 | Server state, caching, mutations |
| Axios | HTTP client with JWT interceptors |
| Socket.io-client | WebSocket connections |
| Zod + react-hook-form | Form validation |
| Framer Motion | Animations |
| marked | Markdown → HTML conversion |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Bun | Runtime |
| Express.js | HTTP framework |
| TypeScript | Type safety |
| Socket.io | Real-time WebSocket server |
| OpenAI SDK | GPT-4o-mini for AI features |
| JSON Web Tokens | Auth tokens |
| bcrypt | Password hashing |
| Passport.js | Google OAuth strategy |
| Zod | Request validation |
| Swagger / OpenAPI | Auto-generated API docs |

### Databases
| Database | Used By | Data |
|---|---|---|
| PostgreSQL 15 | auth, user, blog, engagement, notification, recommendation | Structured relational data |
| MongoDB 7 | blog (content), chat | Rich HTML content, chat messages |
| Redis 7 | auth, blog, ai, notification, recommendation | Tokens, rate limits, caches |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local orchestration of all 9 services + 3 databases |
| Docker network (`draftio-network`) | Private inter-service communication |
| Railway | Cloud deployment target |
| GitHub | Source control |

---

## System Architecture

### Microservices Map

| Service | Port | Responsibility | Databases |
|---|---|---|---|
| `api-gateway` | 5000 | Single entry point; HTTP proxying, rate limiting, CORS | — |
| `auth-service` | 5001 | Register, login, Google OAuth, JWT issue/refresh/revoke | PostgreSQL, Redis |
| `user-service` | 5002 | User profiles, follow graph, personalization questionnaire, user search | PostgreSQL |
| `blog-service` | 5003 | Blog CRUD, publish/draft lifecycle, tags, search, analytics | PostgreSQL, MongoDB, Redis |
| `engagement-service` | 5004 | Likes, threaded comments, bookmarks, share tracking | PostgreSQL |
| `ai-service` | 5005 | AI content generation, improvement, grammar, SEO; monthly rate limiting | Redis, OpenAI |
| `notification-service` | 5006 | Notification storage and real-time delivery via Socket.io | PostgreSQL, Redis |
| `chat-service` | 5007 | Direct messaging, conversation management, real-time socket | MongoDB |
| `recommendation-service` | 5008 | Personalized feed, trending algorithm, similar blogs, reading history | PostgreSQL, Redis, OpenAI |

### Database Design

```
PostgreSQL (shared across multiple services via init.sql)
─────────────────────────────────────────────────────────
users                    ◄── auth-service owns this
  id (UUID PK)
  email, username, full_name, is_verified
  password_hash, verification_token, reset_token
  last_login_at, created_at

user_profiles            ◄── user-service owns this
  user_id (FK → users.id)
  bio, location, website
  twitter_handle, linkedin_url, github_url
  interests[], expertise_tags[]
  writing_goals, experience_level
  followers_count, following_count

follows
  follower_id (FK → users.id)
  following_id (FK → users.id)
  UNIQUE(follower_id, following_id)

blogs                    ◄── blog-service owns this
  id (UUID PK), author_id (FK → users.id)
  title, slug, excerpt, cover_image_url
  status (draft|published|archived)
  reading_time, views_count, likes_count
  comments_count, shares_count
  published_at, created_at, updated_at

tags, blog_tags          ◄── many-to-many blog↔tag
categories
blog_analytics           ◄── view/engagement events

comments                 ◄── engagement-service
  id, blog_id, user_id, parent_id (for threads)
  content, likes_count

likes                    ◄── UNIQUE(user_id, blog_id)
bookmarks                ◄── UNIQUE(user_id, blog_id)
shares

notifications            ◄── notification-service
  id, user_id, type, title, message
  is_read, created_at

reading_history          ◄── recommendation-service
  user_id, blog_id, time_spent, read_at

user_interests
  user_id, tag, weight   ◄── float, updated on every read

MongoDB
────────────────────────
blog_content collection  ◄── blog-service
  blog_id (string)
  content (rich HTML from TipTap)

messages collection      ◄── chat-service
  senderId, receiverId, conversationId
  content, createdAt, readAt

conversations collection

Redis
────────────────────────
auth:refresh:{userId}         → refresh token storage
auth:blacklist:{token}        → invalidated tokens
ai:monthly:{userId}:{YYYY-MM} → request counter (TTL 35 days)
feed:{userId}                 → cached recommendation feed (TTL 5 min)
blog:{id}                     → cached blog data
```

### Request Flow — End to End

Below is a complete trace of a user clicking **Publish** on a blog post:

```
1. Browser          → POST /api/blogs/:id/publish
                       Authorization: Bearer <access_token>

2. API Gateway      → validates rate limit (express-rate-limit)
                    → strips /api/blogs prefix
                    → proxies to blog-service:5003

3. blog-service     → authMiddleware: verifies JWT signature
                    → blogController.publishBlog()
                    → UPDATE blogs SET status='published', published_at=NOW()
                    → PostgreSQL commit

4. blog-service     → returns { success: true, data: blog }

5. API Gateway      → forwards response back to browser

6. Browser          → React Query invalidates 'my-blogs' cache
                    → UI shows "Published" badge
```

### Authentication Flow

```
Register / Login
────────────────
POST /api/auth/register  →  hash password (bcrypt)
                         →  INSERT INTO users
                         →  issue accessToken (JWT, 15 min)
                         →  issue refreshToken (JWT, 7 days)
                         →  store refreshToken in Redis

POST /api/auth/refresh   →  verify refreshToken from Redis
                         →  issue new accessToken
                         →  rotate refreshToken

POST /api/auth/logout    →  blacklist accessToken in Redis
                         →  delete refreshToken from Redis

Google OAuth
────────────
GET /api/auth/google      →  redirect to Google consent screen
Callback                  →  Passport.js verifies token
                          →  upsert user in PostgreSQL
                          →  issue JWT pair
                          →  redirect to /auth/callback?token=...
                          →  frontend stores tokens in Zustand + localStorage

Token Auto-Refresh (Frontend)
──────────────────────────────
Axios response interceptor watches for 401 responses
  → attempts POST /api/auth/refresh with stored refreshToken
  → on success: retries original request with new accessToken
  → on failure: calls logout(), redirects to /sign-in
```

### Real-Time Architecture

```
Chat (Socket.io on port 5007)
──────────────────────────────
Client → socket.connect('ws://localhost:5007', { auth: { token } })
       ← server authenticates JWT from handshake
       → socket.emit('send_message', { receiverId, content })
       ← socket.on('message_received', message)
       ← socket.on('message_sent', confirmation)
       → socket.emit('check_online', { userId })
       ← socket.on('user_status', { userId, online })
       → socket.emit('typing', { receiverId })
       ← socket.on('user_typing', { userId })

Messages stored in MongoDB; history loaded via REST GET /api/chat/:userId

Notifications (Socket.io on port 5006)
────────────────────────────────────────
Client → socket.connect('ws://localhost:5006', { auth: { token } })
       ← server pushes 'notification' events on follow/like/comment/message
       ← socket.on('new_notification', notification)
       ← socket.on('unread_count', count)

Notification records persisted in PostgreSQL; REST endpoints for history
```

### AI Pipeline

```
User clicks "Generate" in the write toolbar
         │
         ▼
POST /api/ai/generate/content  { prompt, context }
         │
         ▼
ai-service: rateLimiter middleware
  → INCR ai:monthly:{userId}:{YYYY-MM}  in Redis
  → if count > 10 → 429 Too Many Requests
  → set X-AI-Requests-Used / X-AI-Requests-Limit headers
         │
         ▼
content.controller.generateContent()
  → openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [system prompt + user prompt + existing content context]
    })
  → returns { result: "<markdown string>" }
         │
         ▼
Frontend: marked.parse(result) → HTML
  → appended into TipTap editor
  → axios interceptor reads X-AI-Requests-Used header
  → updates Zustand uiStore.aiRequestsUsed (live quota bar)

AI Endpoints available:
  POST /api/ai/generate/content   — full blog content from prompt
  POST /api/ai/generate/titles    — 5 title suggestions for a topic
  POST /api/ai/generate/outline   — structured outline for a topic
  POST /api/ai/improve/content    — rewrite/improve pasted content (with history)
  POST /api/ai/improve/grammar    — grammar fix (with conversation history)
  POST /api/ai/seo/suggestions    — SEO title/description/keyword suggestions
  POST /api/ai/summarize          — TL;DR summary of a blog
  GET  /api/ai/usage              — current month quota (free, no deduction)
```

### Recommendation Engine

```
User reads a blog
  → POST /api/recommendations/track-read  { blogId, timeSpent }
  → INSERT/UPDATE reading_history
  → fetch blog's tags from PostgreSQL
  → for each tag: UPSERT user_interests weight += 1.0
  → bust cached feed (DEL feed:{userId})

User requests feed
  → GET /api/recommendations/feed
  → check Redis cache (feed:{userId}, TTL 5 min)
    → cache hit: return immediately
  → cache miss:
      1. Load reading history (last 50 blogs)
      2. Load top-10 user interests by weight
      3. Collaborative filtering: find users with overlapping interests
      4. Score candidate blogs: interest match weight + recency bonus
      5. Deduplicate already-read blogs
      6. Cache result in Redis for 5 min
      7. Return ranked list

Onboarding: POST /api/recommendations/seed-interests { interests: string[] }
  → weight 2.0 per tag (explicit preference > inferred 1.0)

Trending algorithm:
  score = (likes + comments×2) / (hours_since_published + 2)
  applied to blogs published in last 7 days
```

---

## Directory Structure

```
draft.io/
├── frontend/                  # Next.js application (port 3000)
│   └── src/
│       ├── app/               # Next.js App Router pages
│       │   ├── page.tsx           # Landing page
│       │   ├── feed/              # Public feed (unauthenticated)
│       │   ├── (auth)/            # Auth group: sign-in, sign-up, questionnaire
│       │   └── (main)/            # Protected group: dashboard, write, blog, chat…
│       ├── components/            # Shared UI components
│       │   ├── ui/                # shadcn/ui primitives
│       │   ├── Editor.tsx         # TipTap rich text editor wrapper
│       │   ├── AIToolbar.tsx      # AI generation toolbar
│       │   ├── MessageSidebar.tsx # Floating chat panel
│       │   └── NotificationDropdown.tsx
│       ├── hooks/                 # React Query mutation/query hooks
│       ├── lib/api/               # Axios API client modules (auth, blog, ai, chat…)
│       ├── stores/                # Zustand stores (authStore, chatStore, uiStore)
│       ├── types/                 # Global TypeScript types
│       └── utils/                 # Constants (ROUTES, API_ENDPOINTS), helpers
│
└── backend/
    ├── docker-compose.yml     # Orchestrates all 9 services + 3 databases
    ├── init.sql               # PostgreSQL schema (runs on first container start)
    └── services/
        ├── api-gateway/       # :5000 — http-proxy-middleware reverse proxy
        ├── auth-service/      # :5001 — JWT + Google OAuth
        ├── user-service/      # :5002 — profiles + follow graph
        ├── blog-service/      # :5003 — blog CRUD + content storage
        ├── engagement-service/# :5004 — likes, comments, bookmarks
        ├── ai-service/        # :5005 — OpenAI integration + rate limiting
        ├── notification-service/:5006 — Socket.io notifications
        ├── chat-service/      # :5007 — Socket.io DMs + MongoDB messages
        └── recommendation-service/:5008 — feed, trending, collaborative filter
```

---

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2
- [Bun](https://bun.sh) (for local frontend dev)
- Node.js 20+

### 1. Clone the repository
```bash
git clone https://github.com/Prince-695/draft.io.git
cd draft.io
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Fill in OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
```

### 3. Start the full backend stack
```bash
cd backend
docker compose up --build
# API Gateway available at http://localhost:5000
```

### 4. Start the frontend
```bash
cd frontend
bun install
bun dev
# App available at http://localhost:3000
```

---

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `OPENAI_API_KEY` | ai-service, recommendation-service | OpenAI API key |
| `JWT_SECRET` | auth-service | Secret for signing JWTs |
| `GOOGLE_CLIENT_ID` | auth-service | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | auth-service | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | auth-service | OAuth redirect URI |
| `DATABASE_URL` | all pg services | Postgres connection string (Railway) |
| `REDIS_URL` | all redis services | Redis connection string (Railway) |
| `MONGO_URL` | blog, chat | MongoDB connection string (Railway) |
| `NEXT_PUBLIC_API_URL` | frontend | API Gateway URL |
| `NEXT_PUBLIC_WS_URL` | frontend | Notification WebSocket URL |
| `FRONTEND_URL` | backend services | Allowed CORS origin |

---

## API Reference Overview

All requests go through the API Gateway at `http://localhost:5000`.

| Prefix | Service | Example endpoints |
|---|---|---|
| `/api/auth` | auth-service | `POST /register`, `POST /login`, `GET /google`, `POST /refresh` |
| `/api/users` | user-service | `GET /profile/:username`, `PUT /profile`, `POST /follow/:userId` |
| `/api/blogs` | blog-service | `GET /feed`, `POST /`, `PUT /:id`, `POST /:id/publish`, `GET /search` |
| `/api/engagement` | engagement-service | `POST /:id/like`, `POST /:id/comments`, `POST /:id/bookmark` |
| `/api/ai` | ai-service | `POST /generate/content`, `POST /improve/grammar`, `GET /usage` |
| `/api/notifications` | notification-service | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |
| `/api/chat` | chat-service | `GET /:userId` (history), `GET /unread/count` |
| `/api/recommendations` | recommendation-service | `GET /feed`, `GET /trending`, `GET /similar/:id` |

Swagger UI docs are available at `http://localhost:{PORT}/api-docs` on each individual service.
