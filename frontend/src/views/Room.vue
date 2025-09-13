<template>
  <div v-if="profileStore.hasProfile" class="room-container">
    <h1>Welcome to Room: {{ roomStore.roomId }}</h1>
    <hr />

    <h2>My Info</h2>
    <p>My Socket ID: {{ roomStore.myId || 'Connecting...' }}</p>
    <p>Am I the host? {{ roomStore.amHost ? 'Yes' : 'No' }}</p>
    <hr />

    <h2>Room Info</h2>
    <p>Current Host ID: {{ roomStore.hostId || 'No host in room' }}</p>
    <hr />

    <h2>Participants ({{ roomStore.participants.length }})</h2>
    <ul v-if="roomStore.participants.length">
      <!-- We use the `participants` getter which is a pre-sorted array -->
      <li v-for="user in roomStore.participants" :key="user.id">
        <img :src="user.dpUrl" :alt="user.name" class="participant-dp" />
        <span>{{ user.name }}</span>
        <span v-if="user.id === roomStore.myId"> (You)</span>
        <span v-if="user.id === roomStore.hostId"> (Host)</span>
      </li>
    </ul>
    <p v-else>Just you in here for now.</p>
  </div>
  <div v-else>
    <p>Loading profile or redirecting...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useRoomStore } from '@/stores/room'
import { useSocket } from '@/composables/useSocket'

// --- SETUP ---
const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const roomStore = useRoomStore()
const { socket, connect, disconnect } = useSocket()

// Extract the Room ID from the URL. It's an array if the param name is repeated, so we take the first.
const roomIdFromUrl = Array.isArray(route.params.roomId) ? route.params.roomId[0] : route.params.roomId

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  // Guard Clause: If the user lands here without a profile, send them home.
  if (!profileStore.hasProfile) {
    router.push('/')
    return
  }

  // 1. Set up the initial state in our Pinia store.
  roomStore.setInitialState(roomIdFromUrl)

  // 2. Connect to the WebSocket server.
  connect()

  // 3. Register all our event listeners.
  // These listeners will call the appropriate actions in our roomStore.
  socket.on('connect', () => {
    roomStore.setConnectionState(socket.id)
    
    // Once connected, we can emit the event to join the room.
    // We send our persistent userId from the profile store, not our temporary socket.id.
    const joinData = {
      roomId: roomIdFromUrl,
      userId: profileStore.userId,
      username: profileStore.username,
      sessionId: `session_${socket.id}`, // Placeholder session ID logic
      dpUrl: profileStore.dpUrl,
    }
    socket.emit('join-room', joinData)
  })

  socket.on('room-joined', (data) => roomStore.setRoomJoined(data))
  socket.on('user-joined', (data) => roomStore.addUser(data))
  socket.on('user-left', (data) => roomStore.removeUser(data))
  socket.on('host-update', (data) => roomStore.setHost(data))
  socket.on('host-disconnected', () => roomStore.setHost({ hostId: null }))
  
  // Handle session deactivation from the server
  socket.on('session-deactivated', () => {
    alert('This session has been deactivated because you joined from another tab or window.')
    router.push('/')
    // The disconnect logic will be handled automatically by the onUnmounted hook.
  })
  
  // Handle server errors
  socket.on('error', (data) => {
    alert(`A server error occurred: ${data.message}. You will be redirected.`)
    router.push('/')
  })
})

onUnmounted(() => {
  // When the component is destroyed (e.g., user navigates away),
  // we reset the room store to its default empty state.
  roomStore.disconnect()
  // The useSocket composable will automatically handle disconnecting the socket.
})
</script>

<style scoped>
/* Scoped styles for this placeholder view */
.room-container {
  font-family: sans-serif;
  padding: 20px;
  color: #e0e0e0;
}
.participant-dp {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
</style>