# Chat Service

Real-time 1-on-1 messaging service for Draft.IO platform.

## Status

✅ **Phase 2 - IN PROGRESS**

## Features

- Real-time 1-on-1 messaging via WebSocket
- Message persistence in MongoDB
- Typing indicators
- Read receipts
- Message history with pagination
- Online/offline status
- Message deletion
- Conversation list

## Tech Stack

- **Runtime**: Bun v1.3.8
- **Framework**: Express.js + TypeScript
- **WebSocket**: Socket.io 4.8.3
- **Database**: MongoDB
- **Authentication**: JWT

## API Endpoints

### WebSocket Events

**Client → Server:**
- `send_message` - Send a message to another user
- `typing_start` - Indicate typing started
- `typing_stop` - Indicate typing stopped
- `mark_read` - Mark messages as read
- `join_conversation` - Join a conversation room

**Server → Client:**
- `receive_message` - Receive new message
- `typing_indicator` - User is typing
- `message_read` - Message was read
- `online_status` - User online/offline status

### REST API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/conversations` | Get user's conversation list | Yes |
| GET | `/messages/:userId` | Get message history with user | Yes |
| DELETE | `/messages/:messageId` | Delete a message | Yes |
| GET | `/health` | Health check | No |

## Environment Variables

```env
PORT=5007
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/draftio_chat

# JWT
JWT_SECRET=your-jwt-secret

# CORS
CLIENT_URL=http://localhost:3000
```

## Installation

```bash
cd backend/services/chat-service
bun install
```

## Run

```bash
bun run dev
```

Server starts on `http://localhost:5007`
