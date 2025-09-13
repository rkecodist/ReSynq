<template>
  <!-- 
    The v-if ensures we don't try to render the room until the user's profile is loaded.
    The `main-container` class comes from your global CSS and provides the main layout.
  -->
  <div v-if="profileStore.hasProfile" class="main-container">
    
    <!-- Video Player Placeholder -->
    <section class="video-wrapper" aria-label="Video area">
      <div class="video-player" id="video-player-container">
        <div class="video-placeholder" id="video-placeholder">
          <!-- We will make this text dynamic in a future milestone -->
          <h3>Connecting to room...</h3>
        </div>
      </div>
    </section>

    <!-- 
      This is it. We are replacing all the old placeholder text with our single,
      powerful TabSystem component. All the complexity of the tabs, participants list,
      and info panel is now neatly encapsulated inside it.
    -->
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
import { useSocket } from '@/composables/useSocket';
import TabSystem from '@/components/room/TabSystem.vue'; // Import our new component

// --- SETUP ---
const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const roomStore = useRoomStore();
const { socket, connect, disconnect } = useSocket();

const roomIdFromUrl = Array.isArray(route.params.roomId)
  ? route.params.roomId[0]
  : route.params.roomId;

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  // Guard Clause: If the user lands here without a profile, send them home.
  if (!profileStore.hasProfile) {
    router.push('/');
    return;
  }

  // Set up the initial state in our Pinia store.
  roomStore.setInitialState(roomIdFromUrl);

  // Connect to the WebSocket server.
  connect();

  // Register all our event listeners.
  socket.on('connect', () => {
    roomStore.setConnectionState(socket.id);
    
    // Once connected, we can emit the event to join the room.
    const joinData = {
      roomId: roomIdFromUrl,
      userId: profileStore.userId,
      username: profileStore.username,
      sessionId: `session_${socket.id}`, // Placeholder
      dpUrl: profileStore.dpUrl,
    };
    socket.emit('join-room', joinData);
  });

  socket.on('room-joined', (data) => roomStore.setRoomJoined(data));
  socket.on('user-joined', (data) => roomStore.addUser(data));
  socket.on('user-left', (data) => roomStore.removeUser(data));
  socket.on('host-update', (data) => roomStore.setHost(data));
  socket.on('host-disconnected', () => roomStore.setHost({ hostId: null }));
  
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
  // Reset the room store to its default empty state.
  roomStore.disconnect();
  // The useSocket composable will automatically handle disconnecting the socket.
});
</script>

<style scoped>
/*
  We remove the old placeholder styles and add a simple one for the loading text.
  The main layout styles now come from your global CSS files.
*/
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #e0e0e0;
}
</style>