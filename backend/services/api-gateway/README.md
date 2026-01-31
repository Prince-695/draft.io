# API Gateway

Single entry point for all Draft.IO microservices. Routes requests to appropriate backend services with rate limiting and security.

## Features

- 🚦 **Request Routing** - Proxies requests to microservices
- 🛡️ **Rate Limiting** - Redis-based request throttling
- 🔒 **Security** - Helmet.js security headers
- 📊 **Logging** - Morgan request logging
- ⚡ **Performance** - Gzip compression
- 🔧 **CORS** - Configured for frontend access

## Routes

All requests go through `http://localhost:5000/api/*`:

- `/api/auth/*` → Auth Service (5001)
- `/api/users/*` → User Service (5002)
- `/api/blogs/*` → Blog Service (5003)
- `/api/engagement/*` → Engagement Service (5004)
- `/api/ai/*` → AI Service (5005)

## Setup

```bash
# Install dependencies
bun install

# Start in development mode
bun run dev

# Start in production
bun start
```

## Environment Variables

See `.env` file for configuration.
