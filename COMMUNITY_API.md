# Community API Documentation

## Overview

Lightweight, realtime community API using WebSockets for instant updates and REST endpoints for initial data loading.

## Architecture

- **Backend**: Next.js API Routes + Socket.IO
- **Database**: PostgreSQL with Drizzle ORM
- **Transport**: WebSocket (primary) + REST (fallback)
- **Port**: 3001

## Running the Server

```bash
# Install dependencies
npm install

# Generate database migration
npm run db:generate

# Push migration to database
npm run db:push

# Start the server with WebSocket support
node server.js
```

The server will start on `http://localhost:3001` with WebSocket endpoint at `ws://localhost:3001/api/community/socket`.

## REST Endpoints

### GET /api/community/posts
Fetch paginated list of community posts with replies.

**Response:**
```json
[
  {
    "id": "post_id",
    "userId": "user_id",
    "userName": "John Doe",
    "message": "Post content",
    "likes": 10,
    "dislikes": 2,
    "replyToId": null,
    "createdAt": "2026-04-11T10:00:00Z",
    "replies": [
      {
        "id": "reply_id",
        "userId": "user_id",
        "userName": "Jane Smith",
        "message": "Reply content",
        "likes": 5,
        "dislikes": 0,
        "replyToId": "post_id",
        "createdAt": "2026-04-11T10:05:00Z"
      }
    ]
  }
]
```

### POST /api/community/posts
Create a new post or reply.

**Request:**
```json
{
  "userId": "user_id",
  "message": "Post content",
  "replyToId": "optional_parent_post_id"
}
```

**Response:**
```json
{
  "id": "new_post_id",
  "userId": "user_id",
  "userName": "John Doe",
  "message": "Post content",
  "likes": 0,
  "dislikes": 0,
  "replyToId": null,
  "createdAt": "2026-04-11T10:00:00Z"
}
```

### POST /api/community/posts/:id
Like or dislike a post.

**Request:**
```json
{
  "action": "like" | "dislike"
}
```

**Response:**
```json
{
  "id": "post_id",
  "likes": 11,
  "dislikes": 2,
  ...
}
```

## WebSocket Events

### Client → Server

#### `community:join`
Join the community room to receive realtime updates.

**Payload:** None

#### `community:new_post`
Create a new post or reply.

**Payload:**
```json
{
  "userId": "user_id",
  "message": "Post content",
  "replyToId": "optional_parent_post_id"
}
```

#### `community:like`
Like or dislike a post.

**Payload:**
```json
{
  "postId": "post_id",
  "action": "like" | "dislike"
}
```

### Server → Client

#### `community:post_created`
Broadcast when a new post is created.

**Payload:**
```json
{
  "id": "post_id",
  "userId": "user_id",
  "userName": "John Doe",
  "message": "Post content",
  "likes": 0,
  "dislikes": 0,
  "replyToId": null,
  "createdAt": "2026-04-11T10:00:00Z"
}
```

#### `community:post_updated`
Broadcast when a post's likes/dislikes are updated.

**Payload:**
```json
{
  "id": "post_id",
  "likes": 11,
  "dislikes": 2,
  ...
}
```

#### `community:error`
Error notification.

**Payload:**
```json
{
  "message": "Error description"
}
```

## Android Integration

### Dependencies
```kotlin
implementation("io.socket:socket.io-client:2.1.0")
implementation("com.google.code.gson:gson:2.10.1")
```

### Usage Example
```kotlin
// Connect to WebSocket
CommunitySocket.connect()

// Join community room
CommunitySocket.on("community:post_created") { data ->
    // Handle new post
}

// Send a post
val data = JSONObject().apply {
    put("userId", userId)
    put("message", message)
}
CommunitySocket.emit("community:new_post", data)

// Disconnect when done
CommunitySocket.disconnect()
```

## Database Schema

```sql
CREATE TABLE community_post (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  message TEXT NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  dislikes INTEGER DEFAULT 0 NOT NULL,
  reply_to_id TEXT REFERENCES community_post(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Connection State Handling

The Android client automatically handles:
- **Connecting**: Shows loading state
- **Connected**: Enables realtime features
- **Disconnected**: Falls back to REST API
- **Reconnecting**: Automatic retry with exponential backoff

## CORS Configuration

The WebSocket server accepts connections from any origin. For production, update the CORS settings in `src/lib/socket.ts`:

```typescript
cors: {
  origin: 'https://your-domain.com',
  methods: ['GET', 'POST']
}
```

## Scaling Considerations

- **Stateless**: Server can be horizontally scaled
- **Redis Adapter**: For multi-instance deployments, add Socket.IO Redis adapter
- **Database Connection Pooling**: Configured via Drizzle ORM
- **Rate Limiting**: Add rate limiting middleware for production

## Security

- Validate user authentication before allowing posts
- Sanitize message content to prevent XSS
- Implement rate limiting per user
- Add CSRF protection for REST endpoints
