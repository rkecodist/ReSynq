// lib/socket/index.js
const { initRoomHandler } = require('./roomHandler');
const { initPlaybackHandler } = require('./playbackHandler');
const { initCommunicationHandler } = require('./communicationHandler');
const { initVoiceHandler } = require('./voiceHandler');
const { initSignalingHandler } = require('./signalingHandler');

/**
 * Attaches all modularized socket event handlers to the 'connection' event.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
function listen(io) {
  io.on('connection', (socket) => {
    // Each function initializes a specific feature set for the connected socket.
    initRoomHandler(io, socket);
    initPlaybackHandler(io, socket);
    initCommunicationHandler(io, socket);
    initVoiceHandler(io, socket);
    initSignalingHandler(io, socket);
  });
}

module.exports = {
  listen,
};