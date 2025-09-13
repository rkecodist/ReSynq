<template>
  <div v-if="profileStore.hasProfile" class="main-container">
    <section class="video-wrapper" aria-label="Video area">
      <div class="video-player" id="video-player-container">
        <div class="video-placeholder" id="video-placeholder">
          <h3>Connecting to room...</h3>
        </div>
      </div>
    </section>
    <TabSystem />
  </div>
  <div v-else class="loading-container">
    <p>Loading profile or redirecting...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useRoomStore } from '@/stores/room';
// 1. IMPORT THE CHAT STORE
import { useChatStore } from '@/stores/chat';
import { useSocket } from '@/composables/useSocket';
import { useSession } from '@/composables/useSession';
import TabSystem from '@/components/room/TabSystem.vue';

// --- SETUP ---
const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const roomStore = useRoomStore();
// 2. INITIALIZE THE CHAT STORE
const chatStore = useChatStore();
const { socket, connect, disconnect } = useSocket();
const { getSessionId } = useSession();

const roomIdFromUrl = Array.isArray(route.params.roomId)
  ? route.params.roomId[0]
  : route.params.roomId;

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  if (!profileStore.hasProfile) {
    router.push('/');
    return;
  }

  roomStore.setInitialState(roomIdFromUrl);
  
  // 3. LOAD CHAT HISTORY
  // This must be called after setInitialState so the store knows the room ID.
  chatStore.loadHistory();

  connect();

  socket.on('connect', () => {
    roomStore.setConnectionState(socket.id!);
    
    const joinData = {
      roomId: roomIdFromUrl,
      userId: profileStore.userId,
      username: profileStore.username,
      sessionId: getSessionId(),
      dpUrl: profileStore.dpUrl,
    };
    socket.emit('join-room', joinData);
  });

  // --- 4. WIRE UP ALL SOCKET EVENTS ---

  // -- Room Events --
  socket.on('room-joined', (data) => {
    roomStore.setRoomJoined(data);
    // Add the initial "You joined" system message to the chat.
    chatStore.addMessage({
      type: 'system',
      parts: [{ text: 'You joined', isStrong: false }]
    });
  });

  socket.on('user-joined', (data) => {
    roomStore.addUser(data);
    // Add a system message when another user joins.
    chatStore.addMessage({
      type: 'system',
      parts: [{ text: data.userName, isStrong: true }, { text: ' joined', isStrong: false }]
    });
  });

  socket.on('user-left', (data) => {
    const userLeavingName = roomStore.users[data.userId]?.name || 'A user';
    roomStore.removeUser(data);
    // Add a system message when another user leaves.
    chatStore.addMessage({
      type: 'system',
      parts: [{ text: userLeavingName, isStrong: true }, { text: ' left', isStrong: false }]
    });
  });

  socket.on('host-update', (data) => roomStore.setHost(data));
  socket.on('host-disconnected', () => roomStore.setHost({ hostId: null }));

  // -- Chat Events --
  socket.on('chat-message', (data) => {
    // Add the incoming chat message to our store.
    chatStore.addMessage({ type: 'chat', ...data });
  });
  
  // -- Session/Error Events --
  socket.on('session-deactivated', () => {
    alert('This session has been deactivated because you joined from another tab or window.');
    router.push('/');
  });
  
  socket.on('error', (data) => {
    alert(`A server error occurred: ${data.message}. You will be redirected.`);
    router.push('/');
  });
});

onUnmounted(() => {
  // 5. CLEAN UP STORES WHEN LEAVING THE ROOM
  roomStore.disconnect();
  chatStore.clearHistory(); // Clear chat messages from the store.
  
  // The useSocket composable automatically handles disconnecting the socket
  // and removing all listeners, so no need for socket.off() here.
});
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #e0e0e0;
}
</style>