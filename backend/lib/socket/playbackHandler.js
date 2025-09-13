// lib/socket/playbackHandler.js
const roomManager = require('../roomManager');

/**
 * Initializes all video playback and synchronization event handlers.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket - The individual socket connection.
 */
function initPlaybackHandler(io, socket) {
  /**
   * A wrapper to ensure only the room host can trigger playback events.
   * @param {string} eventName - The name of the event to listen for.
   * @param {function} handler - The callback to execute if the sender is the host.
   */
  const securePlaybackHandler = (eventName, handler) => {
    socket.on(eventName, (data) => {
      if (!data || !data.roomId) return;
      const room = roomManager.getRoom(data.roomId);
      if (room && roomManager.isHost(data.roomId, socket.id)) {
        handler(data);
      }
    });
  };

  // --- Host-only Playback Controls ---
  securePlaybackHandler('play', (data) => {
    socket.to(data.roomId).emit('play');
  });

  securePlaybackHandler('pause', (data) => {
    socket.to(data.roomId).emit('pause');
  });

  securePlaybackHandler('seek', (data) => {
    socket.to(data.roomId).emit('seek', { isPlaying: data.isPlaying });
  });

  securePlaybackHandler('host-changed-video', (data) => {
    socket.to(data.roomId).emit('host-changed-video-reset');
  });

  securePlaybackHandler('host-time-update', (data) => {
    socket
      .to(data.roomId)
      .emit('host-time-update', { isPlaying: data.isPlaying });
  });

  // --- Client-to-Host Sync Logic ---
  socket.on('request-sync', (data) => {
    if (!data || !data.roomId) return;
    const hostId = roomManager.getRoom(data.roomId)?.hostSocketId;
    if (hostId) {
      io.to(hostId).emit('request-sync', { from: socket.id });
    }
  });

  socket.on('sync-state', (data) => {
    if (!data || !data.to) return;
    // This is a direct host-to-client message, no need for room validation.
    io.to(data.to).emit('sync-state', { state: data.state });
  });
}

module.exports = {
  initPlaybackHandler,
};