// lib/roomManager.js (Corrected with evictUser)

const { nanoid } = require('nanoid');

const rooms = {};

// --- Helper Functions ---

/**
 * [NEW] A non-destructive function to evict an old user session.
 * It removes the user but crucially DOES NOT check if the room is empty.
 * This is used specifically for session handovers.
 * @param {string} roomId
 * @param {string} socketId
 */
function evictUser(roomId, socketId) {
  const room = rooms[roomId];
  if (!room || !room.users[socketId]) {
    return;
  }

  const wasHost = room.hostSocketId === socketId;
  delete room.users[socketId];

  if (wasHost) {
    room.hostSocketId = null;
  }
  console.log(`[RoomManager] Evicted old session socket: ${socketId}`);
}

// --- Public API ---

function createRoom(userId) {
  if (!userId) {
    console.error('[RoomManager] Attempted to create a room without a userId.');
    return null;
  }
  const roomId = nanoid(6);
  rooms[roomId] = {
    ownerId: userId,
    hostSocketId: null,
    users: {},
    latestUserSessions: {},
    voiceChatUsers: {}, // [NEW] Add state for voice chat
  };
  return { roomId };
}

function roomExists(roomId) {
  return !!rooms[roomId];
}

function getRoom(roomId) {
  return rooms[roomId];
}

function addUserToRoom(roomId, socketId, userId, username, sessionId, dpUrl) {
  const room = rooms[roomId];
  if (!room) return null;

  const oldSocketId = Object.keys(room.users).find(
    (id) => room.users[id].userId === userId
  );
  if (oldSocketId) {
    delete room.users[oldSocketId];
  }

  room.users[socketId] = { userId, name: username, sessionId, dpUrl };
  return { userName: username };
}

function updateUserSession(roomId, userId, sessionId) {
  const room = rooms[roomId];
  if (!room) return null;
  const oldSessionId = room.latestUserSessions[userId] || null;
  room.latestUserSessions[userId] = sessionId;
  return oldSessionId;
}

function claimHost(roomId, socketId, userId) {
  const room = rooms[roomId];
  if (!room || room.ownerId !== userId) {
    return { isHost: false };
  }

  const wasHostless = room.hostSocketId === null;

  room.hostSocketId = socketId;
  return { isHost: true, wasHostless };
}

/**
 * This function is now only for genuine disconnects.
 */
function removeUserFromRoom(roomId, socketId) {
  const room = rooms[roomId];
  if (!room || !room.users[socketId]) {
    return null;
  }

  const userLeaving = room.users[socketId];
  const wasHost = room.hostSocketId === socketId;

  delete room.users[socketId];

  // [NEW] Also remove user from voice chat if they were in it
  if (room.voiceChatUsers[socketId]) {
    delete room.voiceChatUsers[socketId];
  }

  if (wasHost) {
    room.hostSocketId = null;
  }

  if (room.latestUserSessions[userLeaving.userId] === userLeaving.sessionId) {
    delete room.latestUserSessions[userLeaving.userId];
  }

  const result = {
    roomName: roomId,
    userLeavingName: userLeaving.name,
    userLeavingId: socketId,
    userLeavingData: userLeaving,
    wasHost,
    isLastHost: wasHost,
  };

  // [REMOVED] The automatic room deletion logic is now disabled
  // as per the requirement for rooms to be persistent.
  /*
    if (Object.keys(room.users).length === 0) {
        console.log(`[RoomManager] Deleting empty room: ${roomId}`);
        delete rooms[roomId];
    }
    */

  return result;
}

function getOtherUsersInRoom(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return [];
  return Object.entries(room.users)
    .filter(([id]) => id !== socketId)
    .map(([id, userData]) => ({
      id,
      name: userData.name,
      dpUrl: userData.dpUrl,
    }));
}

function isHost(roomId, socketId) {
  const room = rooms[roomId];
  return room && room.hostSocketId === socketId;
}

function getUserName(roomId, socketId) {
  const room = rooms[roomId];
  return room?.users[socketId]?.name;
}

function getUserData(roomId, socketId) {
  const room = rooms[roomId];
  return room?.users[socketId];
}

// --- [NEW] Voice Chat Management Functions ---

function addUserToVoiceChat(roomId, socketId) {
  const room = rooms[roomId];
  const user = room?.users[socketId];
  if (!room || !user) {
    return null;
  }
  room.voiceChatUsers[socketId] = {
    userId: user.userId,
    name: user.name,
    dpUrl: user.dpUrl,
  };
  return room.voiceChatUsers[socketId];
}

function removeUserFromVoiceChat(roomId, socketId) {
  const room = rooms[roomId];
  if (room?.voiceChatUsers[socketId]) {
    delete room.voiceChatUsers[socketId];
    return true;
  }
  return false;
}

function getOtherVoiceChatUsers(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return [];
  return Object.entries(room.voiceChatUsers)
    .filter(([id]) => id !== socketId)
    .map(([id, userData]) => ({ id, ...userData }));
}

function isUserInVoiceChat(roomId, socketId) {
  const room = rooms[roomId];
  return !!room?.voiceChatUsers[socketId];
}

module.exports = {
  createRoom,
  roomExists,
  getRoom,
  addUserToRoom,
  updateUserSession,
  claimHost,
  removeUserFromRoom,
  getOtherUsersInRoom,
  isHost,
  getUserName,
  getUserData,
  evictUser,
  // [NEW] Export new voice chat functions
  addUserToVoiceChat,
  removeUserFromVoiceChat,
  getOtherVoiceChatUsers,
  isUserInVoiceChat,
};
