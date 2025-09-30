# WebSocket Implementation Guide for Sizland ERP Chat

## Backend WebSocket Server Setup

### 1. Install Dependencies
```bash
npm install ws socket.io
# OR
npm install ws
```

### 2. Basic WebSocket Server (Express + ws)

```javascript
// server.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

// Store active connections
const connections = new Map(); // userId -> WebSocket
const roomUsers = new Map(); // roomId -> Set of userIds

// Authentication middleware for WebSocket
wss.on('connection', (ws, req) => {
  // Extract token from query params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  if (!token) {
    ws.close(1008, 'No authentication token');
    return;
  }
  
  try {
    // Verify JWT token (same as your REST API)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // Store connection
    connections.set(userId, ws);
    
    ws.userId = userId;
    ws.isAlive = true;
    
    console.log(`User ${userId} connected to WebSocket`);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      userId,
      timestamp: Date.now()
    }));
    
  } catch (error) {
    console.error('WebSocket authentication failed:', error);
    ws.close(1008, 'Invalid token');
    return;
  }
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(ws, message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  // Handle ping/pong for connection health
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log(`User ${ws.userId} disconnected`);
    connections.delete(ws.userId);
    
    // Remove from all rooms
    for (const [roomId, users] of roomUsers.entries()) {
      if (users.has(ws.userId)) {
        users.delete(ws.userId);
        
        // Notify room users
        broadcastToRoom(roomId, {
          type: 'user_left',
          roomId,
          userId: ws.userId,
          timestamp: Date.now()
        });
      }
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle WebSocket messages
function handleWebSocketMessage(ws, message) {
  const { type, roomId, ...data } = message;
  
  switch (type) {
    case 'join_room':
      joinRoom(ws, roomId);
      break;
    case 'leave_room':
      leaveRoom(ws, roomId);
      break;
    case 'typing_start':
      handleTypingStart(ws, roomId);
      break;
    case 'typing_stop':
      handleTypingStop(ws, roomId);
      break;
    case 'reaction':
      handleReaction(ws, roomId, data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

// Join room
function joinRoom(ws, roomId) {
  // Verify user has access to room (check database)
  // This is where you'd verify project membership
  
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  
  roomUsers.get(roomId).add(ws.userId);
  
  // Notify room users
  broadcastToRoom(roomId, {
    type: 'user_joined',
    roomId,
    userId: ws.userId,
    timestamp: Date.now()
  });
  
  // Send current online users
  const onlineUsers = Array.from(roomUsers.get(roomId));
  ws.send(JSON.stringify({
    type: 'online_update',
    roomId,
    online: onlineUsers,
    timestamp: Date.now()
  }));
}

// Leave room
function leaveRoom(ws, roomId) {
  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(ws.userId);
    
    // Notify room users
    broadcastToRoom(roomId, {
      type: 'user_left',
      roomId,
      userId: ws.userId,
      timestamp: Date.now()
    });
  }
}

// Handle typing indicators
function handleTypingStart(ws, roomId) {
  broadcastToRoom(roomId, {
    type: 'typing_start',
    roomId,
    userId: ws.userId,
    timestamp: Date.now()
  }, ws.userId); // Exclude sender
}

function handleTypingStop(ws, roomId) {
  broadcastToRoom(roomId, {
    type: 'typing_stop',
    roomId,
    userId: ws.userId,
    timestamp: Date.now()
  }, ws.userId); // Exclude sender
}

// Handle reactions
function handleReaction(ws, roomId, data) {
  // Save reaction to database
  // Then broadcast to room
  broadcastToRoom(roomId, {
    type: 'reaction',
    roomId,
    messageId: data.messageId,
    emoji: data.emoji,
    userId: ws.userId,
    timestamp: Date.now()
  });
}

// Broadcast message to all users in a room
function broadcastToRoom(roomId, message, excludeUserId = null) {
  if (!roomUsers.has(roomId)) return;
  
  const users = roomUsers.get(roomId);
  
  users.forEach(userId => {
    if (userId !== excludeUserId && connections.has(userId)) {
      const ws = connections.get(userId);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  });
}

// Broadcast new message to room (called from your REST API)
function broadcastNewMessage(roomId, messageData) {
  broadcastToRoom(roomId, {
    type: 'new_message',
    roomId,
    ...messageData
  });
}

// Keep connections alive
const interval = setInterval(() => {
  connections.forEach((ws, userId) => {
    if (ws.isAlive === false) {
      console.log(`Terminating dead connection for user ${userId}`);
      connections.delete(userId);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  clearInterval(interval);
  server.close(() => {
    console.log('Process terminated');
  });
});

// Export for use in your REST API
module.exports = {
  broadcastNewMessage,
  connections,
  roomUsers
};

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

### 3. Integration with Your REST API

```javascript
// In your message sending endpoint
const { broadcastNewMessage } = require('./server');

app.post('/api/chat/rooms/:roomId/messages', async (req, res) => {
  try {
    // Save message to database
    const message = await saveMessageToDatabase(req.body);
    
    // Broadcast to WebSocket clients
    broadcastNewMessage(req.params.roomId, {
      id: message.id,
      content: message.content,
      attachments: message.attachments,
      reactions: message.reactions,
      reply_to: message.reply_to,
      edited: message.edited,
      timestamp: message.timestamp,
      sender_user_id: message.sender_user_id,
      messageType: message.messageType
    });
    
    res.status(201).json({
      id: message.id,
      timestamp: message.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});
```

### 4. Environment Variables

Add to your `.env`:
```env
WS_PORT=3001
WS_URL=ws://localhost:3001
```

### 5. Frontend Configuration

Update your frontend environment variables:
```env
VITE_WS_URL=ws://localhost:3001
# For production:
VITE_WS_URL=wss://your-domain.com
```

## WebSocket Message Types

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room  
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `reaction` - Add reaction to message

### Server → Client
- `connected` - Connection established
- `new_message` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `online_update` - Online users list updated
- `reaction` - Message reaction added

## Security Considerations

1. **Authentication**: Always verify JWT tokens
2. **Authorization**: Check room access permissions
3. **Rate Limiting**: Implement rate limiting for WebSocket messages
4. **Input Validation**: Validate all incoming messages
5. **CORS**: Configure CORS for WebSocket connections

## Testing

```bash
# Test WebSocket connection
wscat -c ws://localhost:3001/ws?token=YOUR_JWT_TOKEN

# Send test message
{"type": "join_room", "roomId": "room-123"}
```

This implementation provides real-time messaging with typing indicators, online status, and reactions - exactly what your frontend expects! 🚀
