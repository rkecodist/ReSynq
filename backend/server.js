// server.js (Refactored)

// --- 1. Imports ---
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const roomManager = require('./lib/roomManager');
// [MODIFIED] Import the new central socket handler index file
const socketHandler = require('./lib/socket');

// --- 2. Server Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// --- 3. Middleware ---
app.use(express.static('public'));
app.use(express.json()); // Add JSON body parser for POST requests

// --- 4. HTTP Routes ---
app.post('/create-room', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const result = roomManager.createRoom(userId);
  if (result) {
    // [NEW] Log for room creation event
    console.log(`User (${userId}) created room (${result.roomId})`);
    res.status(201).json({ roomId: result.roomId });
  } else {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/check-room/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (roomManager.roomExists(roomId)) {
    res.status(200).send('Room exists');
  } else {
    res.status(404).send('Room not found');
  }
});

app.get('/room/:roomId', (req, res) => {
  // This route serves the room page for valid rooms.
  // The client-side JS will handle the "room not found" case after connecting via socket.
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// --- 5. Real-time Logic ---
// Hand over the `io` instance to the socket handler module.
socketHandler.listen(io);

// --- 6. Start Server ---
server.listen(PORT, () => {
  console.log(`[INFO] Server is running on http://localhost:${PORT}`);
});