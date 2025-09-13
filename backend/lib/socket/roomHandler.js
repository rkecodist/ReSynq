// lib/socket/roomHandler.js
const roomManager = require('../roomManager');
const { broadcastVCState } = require('./voiceHandler');

/**
 * Initializes all room-related event handlers for a given socket connection.
 * This includes joining, session management, and disconnecting.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket - The individual socket connection.
 */
function initRoomHandler(io, socket) {
  socket.on('join-room', (data) => {
    const { roomId, userId, username, sessionId, dpUrl } = data;

    if (!roomManager.roomExists(roomId)) {
      return socket.emit('error', { message: 'Room not found' });
    }
    if (!userId || !username || !sessionId || !dpUrl) {
      return socket.emit('error', { message: 'Invalid user data provided.' });
    }

    const oldSessionId = roomManager.updateUserSession(
      roomId,
      userId,
      sessionId
    );
    if (oldSessionId) {
      // --- [FIXED] LOGIC FOR SESSION TAKEOVER ---
      console.log(
        `[SESSION] User ${username} (${userId}) starting new session. Terminating old one.`
      );
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets) {
        for (const socketId of roomSockets) {
          const socketData = roomManager.getUserData(roomId, socketId);
          if (socketData && socketData.sessionId === oldSessionId) {
            const oldSocket = io.sockets.sockets.get(socketId);
            if (oldSocket) {
              // 1. Manually trigger the "leave" event for the old socket
              // This happens before the new user "joins" in the eyes of other clients
              io.to(roomId).emit('user-left', {
                userId: socketId,
                name: socketData.name,
              });

              if (roomManager.isHost(roomId, socketId)) {
                io.to(roomId).emit('host-disconnected', {
                  name: socketData.name,
                  userId: socketId,
                });
              }

              // 2. Evict and disconnect the old socket
              // The evictUser function logs the eviction.
              roomManager.evictUser(roomId, socketId);
              oldSocket.emit('session-deactivated');
              oldSocket.disconnect(); // This will trigger the 'disconnecting' log for the old user.
            }
            break;
          }
        }
      }
    }

    console.log(
      `User ${username} (${userId}) joined room (${roomId}) in session (${socket.id})`
    );

    socket.join(roomId);

    const userAddResult = roomManager.addUserToRoom(
      roomId,
      socket.id,
      userId,
      username,
      sessionId,
      dpUrl
    );
    if (!userAddResult) return;

    const { userName } = userAddResult;
    const { isHost } = roomManager.claimHost(roomId, socket.id, userId);

    const currentRoom = roomManager.getRoom(roomId);
    if (!currentRoom) return;
    io.to(roomId).emit('host-update', { hostId: currentRoom.hostSocketId });

    const otherUsers = roomManager.getOtherUsersInRoom(roomId, socket.id);
    socket.emit('room-joined', {
      roomId,
      isHost,
      userName,
      dpUrl,
      otherUsers,
      hostId: currentRoom.hostSocketId,
    });

    // This event tells other clients that a new user has appeared.
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userName: userName,
      dpUrl: dpUrl,
    });

    // [MODIFIED] Send the current VC state to the user who just joined
    const participants = Object.values(currentRoom.voiceChatUsers).map(
      (user, index, arr) => ({
        id: Object.keys(currentRoom.voiceChatUsers)[index],
        ...user,
      })
    );
    socket.emit('vc-state-update', { participants });
  });

  socket.on('disconnecting', () => {
    for (const roomName of socket.rooms) {
      if (roomName !== socket.id) {
        const wasInVC = roomManager.isUserInVoiceChat(roomName, socket.id);

        const removalDetails = roomManager.removeUserFromRoom(
          roomName,
          socket.id
        );
        if (removalDetails) {
          const {
            userLeavingName,
            wasHost,
            userLeavingId,
            userLeavingData,
            isLastHost,
          } = removalDetails;

          const persistentUserId = userLeavingData.userId || 'UNKNOWN';
          console.log(
            `User ${userLeavingName} (${persistentUserId}) left room (${roomName}) in session (${userLeavingId})`
          );

          socket.to(roomName).emit('user-left', {
            userId: userLeavingId,
            name: userLeavingName,
          });

          // If the user was in VC, we need to let others know.
          // This is handled in the voiceHandler, which will also be listening to this event.
          if (wasInVC) {
            broadcastVCState(io, roomName);
          }

          if (wasHost) {
            socket.to(roomName).emit('host-disconnected', {
              name: userLeavingName,
              userId: userLeavingId,
            });
          }

          if (isLastHost) {
            socket.to(roomName).emit('update-player-to-no-host');
          }
        }
      }
    }
  });
}

module.exports = {
  initRoomHandler,
};