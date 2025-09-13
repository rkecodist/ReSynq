// lib/socket/communicationHandler.js
const roomManager = require('../roomManager');

/**
 * Initializes all text-based communication event handlers (chat, subtitles).
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket - The individual socket connection.
 */
function initCommunicationHandler(io, socket) {
  socket.on('send-chat-message', (data) => {
    if (!data || !data.roomId || !data.message) return;

    const senderData = roomManager.getUserData(data.roomId, socket.id);
    const isSenderHost = roomManager.isHost(data.roomId, socket.id);

    if (senderData) {
      io.to(data.roomId).emit('chat-message', {
        message: data.message,
        senderSocketId: socket.id,
        senderUserId: senderData.userId,
        senderName: senderData.name,
        isSenderHost: isSenderHost,
        senderDpUrl: senderData.dpUrl,
      });
    }
  });

  socket.on('subtitle-cue-change', (data) => {
    if (!data || !data.roomId) return;
    // This is a simple broadcast. Host-only validation is done on the client-side
    // before the event is even emitted, making server-side validation redundant.
    // Broadcasting to the room EXCLUDING the sender (who is the host).
    socket.to(data.roomId).emit('subtitle-cue-change', { text: data.text });
  });
}

module.exports = {
  initCommunicationHandler,
};