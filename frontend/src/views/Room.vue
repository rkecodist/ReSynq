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
// --- SOLUTION START ---
// 1. Import the new chat store
import { useChatStore } from '@/stores/chat';
// --- SOLUTION END ---
import { useSocket } from '@/composables/useSocket';
import TabSystem from '@/components/room/TabSystem.vue';

// --- SETUP ---
const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const roomStore = useRoomStore();
// --- SOLUTION START ---
// 2. Get an instance of the chat store
const chatStore = useChatStore();
// --- SOLUTION END ---
const { socket, connect, disconnect } = useSocket();

const roomIdFromUrl = Array.isArray(route.params.roomId)
  ? route.params.roomId[0]
  : route.params.roomId;

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  if (!profileStore.hasProfile) {
    router.push('/');
    return;
  }

  // --- SOLUTION START ---
  // 3. Set the context for our chat history
  chatStore.setContext(roomIdFromUrl, profileStore.userId!);
  // --- SOLUTION END ---

  roomStore.setInitialState(roomIdFromUrl);
  connect();

  socket.on('connect', () => {
    roomStore.setConnectionState(socket.id);
    
    const joinData = {
      roomId: roomIdFromUrl,
      userId: profileStore.userId,
      username: profileStore.username,
      sessionId: `session_${socket.id}`,
      dpUrl: profileStore.dpUrl,
    };
    socket.emit('join-room', joinData);
  });

  // --- Room Event Listeners ---
  socket.on('room-joined', (data) => {
    roomStore.setRoomJoined(data);
    // --- SOLUTION START ---
    // 4. Load chat history and add "You joined" message
    chatStore.loadHistory();
    chatStore.addSystemMessage([{ text: 'You joined the room.', isStrong: false }]);
    // --- SOLUTION END ---
  });

  socket.on('user-joined', (data) => {
    roomStore.addUser(data);
    // --- SOLUTION START ---
    // 5. Add "User joined" system message
    chatStore.addSystemMessage([
      { text: data.userName, isStrong: true },
      { text: 'joined.', isStrong: false }
    ]);
    // --- SOLUTION END ---
  });

  socket.on('user-left', (data) => {
    // We need the user's name before they are removed from the room store.
    const userLeavingName = roomStore.users[data.userId]?.name || 'A user';
    roomStore.removeUser(data);
    // --- SOLUTION START ---
    // 6. Add "User left" system message
    chatStore.addSystemMessage([
      { text: userLeavingName, isStrong: true },
      { text: 'left.', isStrong: false }
    ]);
    // --- SOLUTION END ---
  });

  socket.on('host-update', (data) => roomStore.setHost(data));
  socket.on('host-disconnected', () => roomStore.setHost({ hostId: null }));
  
  // --- SOLUTION START ---
  // 7. Add the listener for incoming chat messages
  socket.on('chat-message', (data) => {
    chatStore.addChatMessage(data);
  });
  // --- SOLUTION END ---
  
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
  // Reset both stores on cleanup
  roomStore.disconnect();
  // --- SOLUTION START ---
  // 8. Clear the chat history from the store
  chatStore.clearChat();
  // --- SOLUTION END ---
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