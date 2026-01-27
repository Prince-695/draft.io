# Auth Service

Authentication microservice for Draft.IO platform.

## Features

- ✅ User Registration (Email/Password)
- ✅ User Login with JWT
- ✅ Refresh Token Mechanism
- ✅ Email Verification
- ✅ Password Reset
- ✅ OAuth (Google) - Coming soon
- ✅ Redis for Token Storage
- ✅ Kafka Events Integration

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: Kafka
- **Authentication**: JWT + bcrypt

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Kafka + Zookeeper

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env and fill in your values
```

3. **Start databases (from backend folder)**
```bash
cd ../../
docker-compose up -d
```

4. **Run development server**
```bash
npm run dev
```

Server will start on `http://localhost:5001`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/verify-email/:token` | Verify email address |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/me` | Get current user info | Yes |
| POST | `/auth/logout` | Logout user | Yes |

## Example Requests

### Register
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc..."
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## Project Structure

```
auth-service/
├── src/
│   ├── config/           # Database & Redis config
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth & validation
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── schema.sql        # Database schema
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Scripts

```bash
npm run dev      # Start development server (with auto-reload)
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests
```

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The service creates the following tables:

- **users** - User accounts and authentication data
  - id, email, username, password_hash
  - is_verified, verification_token
  - reset_token, google_id
  - created_at, updated_at, last_login_at

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT with expiration (1 hour access, 7 days refresh)
- ✅ Refresh token storage in Redis
- ✅ Email verification required
- ✅ Password reset with expiring tokens
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Input validation

## Coming Soon

- [ ] OAuth (Google, GitHub)
- [ ] Email sending (verification, password reset)
- [ ] Rate limiting
- [ ] 2FA (Two-Factor Authentication)
- [ ] Account deletion
- [ ] Password change

## License

MIT
