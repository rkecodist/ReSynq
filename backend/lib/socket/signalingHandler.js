// lib/socket/signalingHandler.js

/**
 * Initializes WebRTC signaling event handlers for the main video stream.
 * These are simple, direct relays from one client to another.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket - The individual socket connection.
 */
function initSignalingHandler(io, socket) {
  // These handlers are for the HOST's VIDEO stream ONLY.
  socket.on('webrtc-offer', (data) => {
    if (!data || !data.to || !data.offer) return;
    io.to(data.to).emit('webrtc-offer', {
      from: socket.id,
      offer: data.offer,
    });
  });

  socket.on('webrtc-answer', (data) => {
    if (!data || !data.to || !data.answer) return;
    io.to(data.to).emit('webrtc-answer', {
      from: socket.id,
      answer: data.answer,
    });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    if (!data || !data.to || !data.candidate) return;
    io.to(data.to).emit('webrtc-ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });
}

module.exports = {
  initSignalingHandler,
};