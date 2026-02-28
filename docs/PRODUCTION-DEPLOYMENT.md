# Draft.IO — Production Deployment Guide

**Last Updated**: February 27, 2026  
**Project Status**: ✅ Phase 4 Complete — All features implemented, ready for production  
**Author**: For both developer reference and LLM context

---

## Table of Contents

1. [What We've Built — Full Feature Inventory](#1-what-weve-built--full-feature-inventory)
2. [Architecture Overview](#2-architecture-overview)
3. [Pre-Deployment: Cloud Services Setup](#3-pre-deployment-cloud-services-setup)
4. [Environment Variables — Every Service](#4-environment-variables--every-service)
5. [Dockerizing Every Service](#5-dockerizing-every-service)
6. [Docker Compose for Production](#6-docker-compose-for-production)
7. [Deployment Options](#7-deployment-options)
8. [Frontend Deployment (Vercel)](#8-frontend-deployment-vercel)
9. [Backend Deployment (Railway — Recommended)](#9-backend-deployment-railway--recommended)
10. [Post-Deployment Checklist](#10-post-deployment-checklist)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What We've Built — Full Feature Inventory

Cross-referenced against PRD.md, PROGRESS.md, and checklist.md.

### Core Features (All Implemented ✅)

| Feature | Status | Where |
|---|---|---|
| User registration & login (JWT) | ✅ | auth-service |
| Google OAuth login | ✅ | auth-service |
| User profiles + avatar upload | ✅ | user-service + Cloudinary |
| Follow / Unfollow other users | ✅ | user-service |
| Blog CRUD (create, edit, delete, publish) | ✅ | blog-service |
| Rich text editor (TipTap v3) | ✅ | frontend |
| Draft auto-save | ✅ | blog-service |
| Blog tags & categories | ✅ | blog-service |
| Blog slug generation | ✅ | blog-service |
| Blog cover image upload | ✅ | user-service / blog-service |
| Blog views tracking | ✅ | blog-service |
| Like / Unlike blogs | ✅ | engagement-service |
| Comments + nested replies | ✅ | engagement-service |
| Bookmark / Save posts | ✅ | engagement-service |
| Real-time notifications | ✅ | notification-service + Socket.IO |
| Real-time chat (direct messages) | ✅ | chat-service + Socket.IO + MongoDB |
| AI blog generation (OpenAI) | ✅ | ai-service |
| AI grammar & improvement | ✅ | ai-service |
| Trending blogs (Redis cached) | ✅ | recommendation-service |
| Personalized feed (For You / Following) | ✅ | recommendation-service |
| Explore page (Latest / Trending / Search) | ✅ | frontend |
| LinkedIn-style blog cards | ✅ | frontend (BlogPostCard.tsx) |
| Dark / Light theme | ✅ | frontend |
| Saved Posts dashboard tab | ✅ | my-posts page |
| Your Blogs dashboard tab | ✅ | dashboard page |
| Global search (users + blogs) | ✅ | frontend GlobalSearch.tsx |

### What Is NOT Implemented (Deferred)

- Unit tests (skipped across all services)
- Connection request system (follow-only, not mutual requests)
- Email verification (endpoint exists, no SMTP configured)
- Kafka event streaming (was set up, then removed — not needed for current feature set)

---

## 2. Architecture Overview

```
Internet
    │
    ▼
[Vercel] Next.js Frontend (port 3000 / deployed URL)
    │  NEXT_PUBLIC_API_URL → API Gateway
    │  NEXT_PUBLIC_WS_URL  → Notification Service (Socket.IO)
    ▼
[API Gateway :5000] ← All HTTP requests route here
    │
    ├──→ Auth Service        :5001  (PostgreSQL + Redis)
    ├──→ User Service        :5002  (PostgreSQL + Redis + Cloudinary)
    ├──→ Blog Service        :5003  (PostgreSQL + MongoDB + Redis)
    ├──→ Engagement Service  :5004  (PostgreSQL + Redis)
    ├──→ AI Service          :5005  (OpenAI API + Redis)
    ├──→ Notification Service:5006  (PostgreSQL + Redis + Socket.IO)
    ├──→ Chat Service        :5007  (MongoDB + Socket.IO)
    ├──→ Recommendation Svc  :5008  (PostgreSQL + Redis)

[Databases — Cloud]
    ├── PostgreSQL  → Neon.tech (or Supabase / Aiven)
    ├── MongoDB     → MongoDB Atlas
    └── Redis       → Upstash Redis
```

> **Note**: Kafka and Zookeeper were removed from this project. The docker-compose.yml
> currently only runs PostgreSQL, MongoDB, and Redis. No Kafka setup is needed.

---

## 3. Pre-Deployment: Cloud Services Setup

You need to replace 3 local databases with cloud equivalents.
Sign up for all **free tiers** — they are enough for a production launch.

---

### 3.1 PostgreSQL → Neon.tech (Free)

**Why Neon**: Serverless PostgreSQL, free tier, instant setup, works with any Postgres client.

**Steps:**
1. Go to → https://neon.tech
2. Sign up with GitHub
3. Create a new project → name it `draftio`
4. Select region closest to your users (e.g., `eu-west-2` or `us-east-1`)
5. Copy the **Connection String** — it looks like:
   ```
   postgresql://draftio_owner:PASSWORD@ep-xxx-xxx.us-east-2.aws.neon.tech/draftio?sslmode=require
   ```
6. You will use this URL as `DATABASE_URL` (or split into `DB_HOST`, `DB_PORT`, etc.)

**What uses PostgreSQL:**
- auth-service
- user-service
- blog-service
- engagement-service
- notification-service
- recommendation-service

All 6 services connect to the **same database** `draftio`. Tables are separated by naming convention.

> **Important**: When you switch to cloud Postgres, the tables need to be initialized.
> Each service auto-creates its tables on startup (via `CREATE TABLE IF NOT EXISTS`).
> Just start all services once and they will self-migrate.

---

### 3.2 MongoDB → MongoDB Atlas (Free)

**Why Atlas**: Official MongoDB cloud, free 512MB M0 cluster, always free.

**Steps:**
1. Go to → https://www.mongodb.com/cloud/atlas
2. Sign up (can use Google)
3. Create a **Free Cluster** (M0 Sandbox — 512MB free forever)
4. Choose region closest to you
5. Set **username** and **password** (e.g., `draftio` / `yourpassword`)
6. Go to **Network Access** → Add IP Address → Allow from anywhere (`0.0.0.0/0`) for now
7. Go to **Database** → Click **Connect** → **Connect your application**
8. Copy the connection string:
   ```
   mongodb+srv://draftio:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**What uses MongoDB:**
- blog-service → stores blog content (HTML from TipTap)
  - Connection string variable: `MONGO_URI`
  - Database name: `draftio`
- chat-service → stores chat messages
  - Connection string variable: `MONGODB_URI`
  - Database name: `draftio_chat`

Use the same Atlas cluster for both, just different database names:
- Blog service: `mongodb+srv://...mongodb.net/draftio?...`
- Chat service: `mongodb+srv://...mongodb.net/draftio_chat?...`

---

### 3.3 Redis → Upstash (Free)

**Why Upstash**: Serverless Redis, free tier (10,000 req/day), no server to manage.

**Steps:**
1. Go to → https://upstash.com
2. Sign up with GitHub
3. Create a new **Redis** database → name it `draftio`
4. Select region
5. Copy the **Redis URL** — it looks like:
   ```
   rediss://default:PASSWORD@global-xxx.upstash.io:6379
   ```
6. Also copy the **REST URL** and **REST Token** (optional, not currently used)

**What uses Redis (all 8 services except chat):**
- auth-service → refresh token storage
- api-gateway → rate limiting
- user-service → caching
- blog-service → caching
- engagement-service → caching
- ai-service → rate limiting
- notification-service → online status / caching
- recommendation-service → trending blogs cache (10-min TTL)

> **Note**: All services use `REDIS_HOST` + `REDIS_PORT` separately.
> For Upstash, extract from URL:
> - `REDIS_HOST` = `global-xxx.upstash.io`
> - `REDIS_PORT` = `6379`
> - `REDIS_PASSWORD` = the password part after `default:` in the URL
> - `REDIS_TLS` = `true` (Upstash requires TLS — uses `rediss://`)

For Upstash TLS, you may need to add to services that use Redis:
```typescript
// In Redis client initialization, add:
tls: process.env.REDIS_TLS === 'true' ? {} : undefined
```
Or use the full `REDIS_URL` environment variable if the services support it.
If not, stick to a **non-TLS** Upstash Redis or use **Redis Cloud** free tier instead.

**Alternative**: Redis Cloud (https://redis.io/cloud/) also has a free 30MB tier.

---

### 3.4 Google OAuth → Google Cloud Console

**Steps:**
1. Go to → https://console.cloud.google.com
2. Create a project (or use existing)
3. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs → add:
   ```
   https://your-backend-auth-service-url.com/auth/google/callback
   ```
   (Also keep `http://localhost:5001/auth/google/callback` for local testing)
6. Copy **Client ID** and **Client Secret**

> Update `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` in auth-service.

---

### 3.5 Cloudinary → Already Set Up

You already use Cloudinary for image uploads (profile pictures, blog covers).
Confirm these are in `user-service/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If not set up yet: https://cloudinary.com → Free tier (25GB storage, 25GB bandwidth/month).

---

### 3.6 OpenAI API → Already Set Up

You already have an OpenAI API key in `ai-service/.env`.
For production, do NOT hardcode or commit it. Set it as an environment variable in your deployment platform.

---

## 4. Environment Variables — Every Service

Replace all `localhost` URLs and local credentials with cloud equivalents.

### Frontend (.env.local / Vercel env)

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway.railway.app
NEXT_PUBLIC_WS_URL=https://your-notification-service.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
NEXT_PUBLIC_APP_NAME=Draft.IO
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

---

### API Gateway (.env)

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-domain.vercel.app

# Internal service URLs (use deployed URLs in production)
AUTH_SERVICE_URL=https://your-auth-service.railway.app
USER_SERVICE_URL=https://your-user-service.railway.app
BLOG_SERVICE_URL=https://your-blog-service.railway.app
ENGAGEMENT_SERVICE_URL=https://your-engagement-service.railway.app
AI_SERVICE_URL=https://your-ai-service.railway.app
NOTIFICATION_SERVICE_URL=https://your-notification-service.railway.app
CHAT_SERVICE_URL=https://your-chat-service.railway.app
RECOMMENDATION_SERVICE_URL=https://your-recommendation-service.railway.app

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT (must match all services)
JWT_SECRET=generate-32-byte-hex
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### Auth Service (.env)

```env
PORT=5001
NODE_ENV=production

# PostgreSQL (Neon)
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# JWT
JWT_SECRET=generate-32-byte-hex
JWT_REFRESH_SECRET=generate-another-32-byte-hex
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-auth-service.railway.app/auth/google/callback

# CORS
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

---

### User Service (.env)

```env
PORT=5002
NODE_ENV=production

# PostgreSQL (same Neon DB)
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT (must match auth-service)
JWT_SECRET=same-32-byte-hex-as-auth

# CORS
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

---

### Blog Service (.env)

```env
PORT=5003
NODE_ENV=production

# PostgreSQL
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# MongoDB Atlas (blog content storage)
MONGO_URI=mongodb+srv://draftio:password@cluster0.xxxxx.mongodb.net/draftio?retryWrites=true&w=majority
MONGO_DB_NAME=draftio

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT
JWT_SECRET=same-32-byte-hex-as-auth

# CORS
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

---

### Engagement Service (.env)

```env
PORT=5004
NODE_ENV=production

# PostgreSQL
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT
JWT_SECRET=same-32-byte-hex-as-auth

# CORS
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

---

### AI Service (.env)

```env
PORT=5005
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=sk-proj-your-actual-key

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT
JWT_SECRET=same-32-byte-hex-as-auth

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_FREE_MAX=10
RATE_LIMIT_PREMIUM_MAX=100
MAX_CONTENT_LENGTH=10000
MAX_GENERATION_TOKENS=2000
```

---

### Notification Service (.env)

```env
PORT=5006
NODE_ENV=production

# PostgreSQL
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT
JWT_SECRET=same-32-byte-hex-as-auth

# CORS / WebSocket
FRONTEND_URL=https://your-vercel-domain.vercel.app
WS_CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

---

### Chat Service (.env)

```env
PORT=5007
NODE_ENV=production

# MongoDB Atlas (chat messages)
MONGODB_URI=mongodb+srv://draftio:password@cluster0.xxxxx.mongodb.net/draftio_chat?retryWrites=true&w=majority

# JWT
JWT_SECRET=same-32-byte-hex-as-auth

# CORS / WebSocket
CLIENT_URL=https://your-vercel-domain.vercel.app
```

---

### Recommendation Service (.env)

```env
PORT=5008
NODE_ENV=production

# PostgreSQL
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=draftio
DB_USER=draftio_owner
DB_PASSWORD=your-neon-password

# Redis
REDIS_HOST=global-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# OpenAI (used for AI recommendations)
OPENAI_API_KEY=sk-proj-your-actual-key

# JWT
JWT_SECRET=same-32-byte-hex-as-auth
```

---

## 5. Dockerizing Every Service

Create a `Dockerfile` in each service directory. All services use Bun runtime.

### Standard Dockerfile (copy for every service)

```dockerfile
# Use official Bun image
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build

# Production stage
FROM oven/bun:1.1-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json

# Don't run as root
USER bun

EXPOSE $PORT
CMD ["bun", "run", "start"]
```

> If a service doesn't have a `build` script yet, check its `package.json`.
> For services that run `ts-node` or `bun run src/index.ts` directly (no build step),
> use this simpler Dockerfile instead:

```dockerfile
FROM oven/bun:1.1-alpine
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .

USER bun
EXPOSE $PORT
CMD ["bun", "run", "src/index.ts"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build the Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass build-time env vars (public ones only)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_APP_NAME=Draft.IO

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

> For the Next.js standalone output, add to `next.config.ts`:
> ```ts
> output: 'standalone'
> ```

---

## 6. Docker Compose for Production

This runs **all 9 services + 3 databases** on a single VPS.
Use this if you want everything on one server (cheapest option — ~$5–10/month on Hetzner/DigitalOcean).

Create file: `docker-compose.prod.yml` at project root:

```yaml
version: '3.9'

services:
  # ─── Databases ─────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    container_name: draftio-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - draftio-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7-jammy
    container_name: draftio-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - draftio-network

  redis:
    image: redis:7-alpine
    container_name: draftio-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - draftio-network

  # ─── Backend Services ──────────────────────────────────────
  api-gateway:
    build: ./backend/services/api-gateway
    container_name: draftio-api-gateway
    restart: always
    ports:
      - "5000:5000"
    env_file:
      - ./backend/services/api-gateway/.env.prod
    depends_on:
      - redis
    networks:
      - draftio-network

  auth-service:
    build: ./backend/services/auth-service
    container_name: draftio-auth
    restart: always
    ports:
      - "5001:5001"
    env_file:
      - ./backend/services/auth-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - draftio-network

  user-service:
    build: ./backend/services/user-service
    container_name: draftio-user
    restart: always
    ports:
      - "5002:5002"
    env_file:
      - ./backend/services/user-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - draftio-network

  blog-service:
    build: ./backend/services/blog-service
    container_name: draftio-blog
    restart: always
    ports:
      - "5003:5003"
    env_file:
      - ./backend/services/blog-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_started
    networks:
      - draftio-network

  engagement-service:
    build: ./backend/services/engagement-service
    container_name: draftio-engagement
    restart: always
    ports:
      - "5004:5004"
    env_file:
      - ./backend/services/engagement-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - draftio-network

  ai-service:
    build: ./backend/services/ai-service
    container_name: draftio-ai
    restart: always
    ports:
      - "5005:5005"
    env_file:
      - ./backend/services/ai-service/.env.prod
    depends_on:
      - redis
    networks:
      - draftio-network

  notification-service:
    build: ./backend/services/notification-service
    container_name: draftio-notification
    restart: always
    ports:
      - "5006:5006"
    env_file:
      - ./backend/services/notification-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - draftio-network

  chat-service:
    build: ./backend/services/chat-service
    container_name: draftio-chat
    restart: always
    ports:
      - "5007:5007"
    env_file:
      - ./backend/services/chat-service/.env.prod
    depends_on:
      - mongodb
    networks:
      - draftio-network

  recommendation-service:
    build: ./backend/services/recommendation-service
    container_name: draftio-recommendation
    restart: always
    ports:
      - "5008:5008"
    env_file:
      - ./backend/services/recommendation-service/.env.prod
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - draftio-network

  # ─── Frontend ──────────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://your-domain.com:5000
        NEXT_PUBLIC_WS_URL: https://your-domain.com:5006
        NEXT_PUBLIC_APP_URL: https://your-domain.com
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: your-cloudinary-name
        NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: your-preset
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: your-google-client-id
    container_name: draftio-frontend
    restart: always
    ports:
      - "3000:3000"
    networks:
      - draftio-network

# ─── Volumes & Networks ────────────────────────────────────────
volumes:
  postgres_data:
  mongodb_data:
  redis_data:

networks:
  draftio-network:
    driver: bridge
```

> Create `.env.prod` files for each service (copy from `.env`, replace localhost with docker container names,
> e.g., `DB_HOST=postgres`, `REDIS_HOST=redis`, `MONGO_URI=mongodb://draftio:password@mongodb:27017/draftio`).
> Inside Docker network, services talk to each other by container/service name, not `localhost`.

---

## 7. Deployment Options

### Option A: VPS (Cheapest — Full Control) ⭐ Recommended for Microservices

**Cost**: $5–10/month  
**Provider**: Hetzner Cloud (cheapest) or DigitalOcean or Linode

**When to use**: You want everything in one place, full Docker control.

```bash
# On your VPS (Ubuntu 22.04):

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone your repo
git clone https://github.com/YOUR_USERNAME/draft.io.git
cd draft.io

# 3. Create all .env.prod files (see Section 4)
# Swap DB_HOST=postgres, REDIS_HOST=redis, etc.

# 4. Build and start everything
docker compose -f docker-compose.prod.yml up -d --build

# 5. Check all services are running
docker compose -f docker-compose.prod.yml ps

# 6. View logs for a specific service
docker compose -f docker-compose.prod.yml logs -f api-gateway
```

**With custom domain + HTTPS (Nginx + Certbot):**
```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Configure Nginx to proxy:
# yourdomain.com → localhost:3000 (frontend)
# api.yourdomain.com → localhost:5000 (api-gateway)
```

---

### Option B: Railway.app (Easiest for Microservices)

**Cost**: $0–$20/month (free tier available, then pay per usage)  
**Website**: https://railway.app

**Why Railway**:
- Native Docker support
- Each service gets its own URL
- Built-in environment variable management
- Free PostgreSQL and Redis add-ons available

**Steps:**
1. Push your code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Deploy each service as a separate Railway service
4. Set environment variables via Railway dashboard (not .env files)
5. Railway gives each service a URL like `your-service.up.railway.app`
6. Update all service URLs in api-gateway env vars

---

### Option C: Render.com (Good Free Tier)

**Cost**: Free (with limitations — services sleep after 15min inactivity)  
**Website**: https://render.com

Similar to Railway. Good for testing but free tier services spin down when idle (bad for real-time features like Socket.IO). Upgrade to paid to avoid this.

---

### Option D: Fly.io (Good for Microservices)

**Cost**: Free tier + pay per usage  
**Website**: https://fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy each service
cd backend/services/auth-service
fly launch   # creates fly.toml
fly deploy

# Repeat for each service
```

---

## 8. Frontend Deployment (Vercel)

**Recommended**: Deploy frontend to Vercel (free, perfect for Next.js).

### Steps:

1. Push code to GitHub
2. Go to → https://vercel.com → Import Project → select your repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `.next`
6. Add all environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL         = https://your-api-gateway-url.railway.app
NEXT_PUBLIC_WS_URL          = https://your-notification-service.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-google-client-id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = your-preset
NEXT_PUBLIC_APP_NAME        = Draft.IO
NEXT_PUBLIC_APP_URL         = https://your-app.vercel.app
```

7. Click **Deploy** → done.

> Every `git push` to main will auto-redeploy on Vercel.

---

## 9. Backend Deployment (Railway — Recommended)

### Step-by-Step Railway Deployment

**Step 1: Create Dockerfiles**

Add the standard Dockerfile (from Section 5) to each of these directories:
- `backend/services/api-gateway/Dockerfile`
- `backend/services/auth-service/Dockerfile`
- `backend/services/user-service/Dockerfile`
- `backend/services/blog-service/Dockerfile`
- `backend/services/engagement-service/Dockerfile`
- `backend/services/ai-service/Dockerfile`
- `backend/services/notification-service/Dockerfile`
- `backend/services/chat-service/Dockerfile`
- `backend/services/recommendation-service/Dockerfile`

**Step 2: Push to GitHub**

```bash
git add .
git commit -m "Add Dockerfiles for all services"
git push origin main
```

**Step 3: Deploy on Railway**

1. Go to railway.app → New Project
2. For each of the 9 services, create a **New Service** → **GitHub repo** → set **Root Directory** to the service path, e.g. `backend/services/auth-service`
3. Railway will detect the Dockerfile and build it

**Step 4: Add Cloud Add-ons on Railway**

Railway provides managed databases as add-ons:
- Click **New** → **Database** → **PostgreSQL** (free $5 credit/month)
- Click **New** → **Database** → **Redis** (free $5 credit/month)

Get connection strings from Railway dashboard → use in env vars.

**Step 5: Set Environment Variables**

For each service on Railway dashboard → **Variables** tab → paste in all env vars from Section 4.

**Step 6: Connect Services**

Once all 9 services are deployed, Railway gives each a URL.
Go to **api-gateway** → Variables → update all `*_SERVICE_URL` variables to the Railway URLs of each service.

**Step 7: Update Frontend**

Update `NEXT_PUBLIC_API_URL` on Vercel to the Railway api-gateway URL.
Update `NEXT_PUBLIC_WS_URL` to the Railway notification-service URL.

---

## 10. Post-Deployment Checklist

After deploying, verify these in order:

- [ ] `GET https://your-api-gateway/health` → returns `{ status: 'ok' }`
- [ ] Register a new user → check PostgreSQL has new row
- [ ] Login → get JWT token back
- [ ] Google OAuth login → redirects and logs in correctly
- [ ] Create a blog post → saved in MongoDB
- [ ] Upload profile picture → appears on Cloudinary dashboard
- [ ] Like a blog → engagement service responds
- [ ] Send a chat message → stored in MongoDB
- [ ] Real-time notification → Socket.IO connecting to notification-service
- [ ] AI generate content → OpenAI API responding
- [ ] Trending blogs → recommendation-service responding
- [ ] Frontend loads → images from Cloudinary/Pexels showing (remotePatterns configured ✅)

---

## 11. Troubleshooting

### Services can't connect to each other

**In Docker Compose**: Use service names not `localhost`:
```env
# Wrong (local dev)
DB_HOST=localhost
REDIS_HOST=localhost

# Correct (docker compose)
DB_HOST=postgres
REDIS_HOST=redis
MONGO_URI=mongodb://draftio:pass@mongodb:27017/draftio
```

### PostgreSQL tables not created

Services create tables on startup via `CREATE TABLE IF NOT EXISTS`.
Just start all services once — they self-initialize.
If a service crashes before startup, check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`.

### Redis TLS error with Upstash

Upstash uses `rediss://` (TLS). Some services may need:
```env
REDIS_TLS=true
```
Or switch to the full URL format if the service client supports it.

### CORS errors in browser

All services have `FRONTEND_URL` in their env. Update it to your Vercel URL:
```env
FRONTEND_URL=https://your-app.vercel.app
```
Also update `WS_CORS_ORIGIN` in notification-service.

### Socket.IO not connecting

Notification-service and Chat-service use WebSocket.
Ensure your deployment platform supports long-lived connections (Railway ✅, Render free tier ❌ — use paid).
Check `NEXT_PUBLIC_WS_URL` points to notification-service (not api-gateway).

### AI service not responding

Check `OPENAI_API_KEY` is valid and not expired.
The free tier has rate limits — monitor usage at platform.openai.com.

### Deleted blogs still showing in Explore

Redis `trending:blogs` key has a 10-min TTL.
The recommendation-service now validates cached results against live DB on every read.
If still stuck, flush Redis:
```bash
# On your Redis instance / Upstash CLI
DEL trending:blogs
```

---

## Quick Reference: All Service Ports

| Service | Port | Uses |
|---|---|---|
| API Gateway | 5000 | Routes all requests |
| Auth Service | 5001 | PostgreSQL, Redis |
| User Service | 5002 | PostgreSQL, Redis, Cloudinary |
| Blog Service | 5003 | PostgreSQL, MongoDB, Redis |
| Engagement Service | 5004 | PostgreSQL, Redis |
| AI Service | 5005 | Redis, OpenAI API |
| Notification Service | 5006 | PostgreSQL, Redis, Socket.IO |
| Chat Service | 5007 | MongoDB, Socket.IO |
| Recommendation Service | 5008 | PostgreSQL, Redis |
| Frontend | 3000 | Next.js |

## Quick Reference: Cloud Services Needed

| Service | Free Provider | What for |
|---|---|---|
| PostgreSQL | Neon.tech | 6 backend services |
| MongoDB | MongoDB Atlas | Blog content, Chat messages |
| Redis | Upstash | Caching, rate limiting, session storage |
| File Storage | Cloudinary (already set up) | Profile pics, blog covers |
| AI | OpenAI (already set up) | Blog generation, editing |
| OAuth | Google Cloud Console | Social login |
| Frontend Hosting | Vercel | Next.js deployment |
| Backend Hosting | Railway / Hetzner VPS | 9 microservices |

---

*This document is the single source of truth for deploying Draft.IO to production.
Cross-reference with PRD.md (feature list), checklist.md (what's done), and PROGRESS.md (implementation history).*
