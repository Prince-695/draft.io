# User Service

User profile management and social features for Draft.IO

## Features

- ✅ User profile CRUD
- ✅ Profile picture & cover image upload (Cloudinary)
- ✅ Follow/Unfollow system
- ✅ Personalization questionnaire
- ✅ User search
- ✅ Pagination for followers/following

## API Endpoints

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile/:username` | No | Get user profile by username |
| GET | `/users/profile/me/profile` | Yes | Get current user profile |
| PUT | `/users/profile` | Yes | Update profile |
| POST | `/users/profile/avatar` | Yes | Upload avatar |
| POST | `/users/profile/cover` | Yes | Upload cover image |
| POST | `/users/profile/personalize` | Yes | Submit personalization |
| GET | `/users/profile/search/users?q=term` | Yes | Search users |

### Follow

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/:userId/follow` | Yes | Follow a user |
| DELETE | `/users/:userId/unfollow` | Yes | Unfollow a user |
| GET | `/users/:userId/followers` | Yes | Get user's followers |
| GET | `/users/:userId/following` | Yes | Get user's following |
| GET | `/users/:userId/status` | Yes | Check follow status |

## Installation

```bash
cd backend/services/user-service
bun install
cp .env.example .env
# Edit .env with your credentials
```

## Run

```bash
bun run dev
```

## Environment Variables

See `.env.example` for required variables.

## Database Schema

- `user_profiles` - User profile data
- `follows` - Follow relationships
- Auto-updating follower/following counts via triggers
