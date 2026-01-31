# Notification Service

Real-time notification service using WebSocket (Socket.io). Receives events from Kafka and delivers instant notifications to connected users.

## Features

- 🔔 **Real-time Notifications** - WebSocket delivery
- 📨 **Event-Driven** - Consumes Kafka events
- 💾 **Persistent Storage** - PostgreSQL notification history
- 🟢 **Online Status** - Redis-based presence
- 🔐 **Secure** - JWT authentication for WebSocket

## Notification Types

- **Follow** - New follower
- **Like** - Blog post liked
- **Comment** - New comment on blog
- **Reply** - Reply to comment
- **Mention** - User mentioned in content

## WebSocket Events

### Client → Server
- `connection` - Connect with JWT token
- `mark_read` - Mark notification as read

### Server → Client
- `notification` - New notification received
- `notification_read` - Acknowledgment

## HTTP Endpoints

- `GET /notifications` - Get user's notifications (paginated)
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

## Setup

```bash
bun install
bun run dev
```
