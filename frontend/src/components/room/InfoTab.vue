<template>
  <div class="info-content">
    <div class="info-item">
      <p>Room ID</p>
      <!-- We add a @click handler to the div to trigger our copy method -->
      <div
        class="info-display-box"
        id="room-id-box"
        title="Click to copy Room ID"
        @click="copyRoomId"
      >
        <!-- The text content is bound directly to our roomStore's state -->
        <span id="room-id-display">{{ roomStore.roomId }}</span>
      </div>
    </div>
    <div class="info-item">
      <p>Invite Link</p>
      <div
        class="info-display-box"
        id="invite-link-box"
        title="Click to copy Invite Link"
        @click="copyInviteLink"
      >
        <!-- This `inviteLink` is a computed property, so it will always be up-to-date -->
        <span id="invite-link-display">{{ inviteLink }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '@/stores/room';

// Get a reactive instance of our room store.
const roomStore = useRoomStore();

// --- COMPUTED PROPERTIES ---
// A computed property is a value that is derived from other reactive data.
// It's cached and will only re-calculate when its dependencies (roomStore.roomId) change.
const inviteLink = computed(() => {
  // We need to check if we are in a browser context before accessing `window`.
  // This is good practice for Server-Side Rendering (SSR), even if we're not using it now.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/room/${roomStore.roomId}`;
  }
  return '';
});

// --- METHODS ---
// These functions handle the copy-to-clipboard logic.

async function copyRoomId() {
  if (!roomStore.roomId) return;
  try {
    await navigator.clipboard.writeText(roomStore.roomId);
    // In a real app, you would use a toast notification component here.
    // For now, an alert is a simple and effective way to give user feedback.
    alert('Room ID copied!');
  } catch (err) {
    alert('Failed to copy Room ID.');
    console.error('Failed to copy Room ID: ', err);
  }
}

async function copyInviteLink() {
  const link = inviteLink.value;
  if (!link) return;
  try {
    await navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  } catch (err) {
    alert('Failed to copy invite link.');
    console.error('Failed to copy invite link: ', err);
  }
}
</script>

<style scoped>
/*
  Again, `scoped` ensures these styles don't leak out.
  The component will use the global styles for `.info-content`, etc.,
  and we only add component-specific layout styles here if needed.
  In this case, the global styles are sufficient.
*/
</style>