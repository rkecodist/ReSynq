// lib/socket/voiceHandler.js
const roomManager = require('../roomManager');

/**
 * Helper function to get the current voice chat state and broadcast it.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {string} roomId - The ID of the room to update.
 */
const broadcastVCState = (io, roomId) => {
  const room = roomManager.getRoom(roomId);
  if (room) {
    // Get a simple array of the user objects in the voice chat
    const participants = Object.values(room.voiceChatUsers).map(
      (user, index) => ({
        id: Object.keys(room.voiceChatUsers)[index],
        ...user,
      })
    );
    io.to(roomId).emit('vc-state-update', { participants });
  }
};

/**
 * Initializes all voice-chat-related event handlers, including lifecycle
 * and WebRTC signaling for voice.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket - The individual socket connection.
 */
function initVoiceHandler(io, socket) {
  socket.on('vc-join', (data) => {
    if (!data || !data.roomId) return;
    const { roomId } = data;

    const newUser = roomManager.addUserToVoiceChat(roomId, socket.id);
    if (newUser) {
      const otherUsers = roomManager.getOtherVoiceChatUsers(roomId, socket.id);
      // Tell the joining user who is already in the call so they can initiate connections.
      socket.emit('vc-join-success', { participants: otherUsers });
      // Tell everyone else (via broadcast) that the UI state has changed.
      broadcastVCState(io, roomId);
    }
  });

  socket.on('vc-leave', (data) => {
    if (!data || !data.roomId) return;
    const { roomId } = data;

    if (roomManager.removeUserFromVoiceChat(roomId, socket.id)) {
      // Tell everyone else (via broadcast) that the UI state has changed.
      broadcastVCState(io, roomId);
    }
  });

  // --- Dedicated Voice Chat WebRTC Signaling Relays ---
  socket.on('vc-offer', (data) => {
    if (!data || !data.to || !data.offer) return;
    socket
      .to(data.to)
      .emit('vc-offer', { from: socket.id, offer: data.offer });
  });

  socket.on('vc-answer', (data) => {
    if (!data || !data.to || !data.answer) return;
    socket
      .to(data.to)
      .emit('vc-answer', { from: socket.id, answer: data.answer });
  });

  socket.on('vc-ice-candidate', (data) => {
    if (!data || !data.to || !data.candidate) return;
    socket.to(data.to).emit('vc-ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });
}

module.exports = {
  initVoiceHandler,
  broadcastVCState,
};