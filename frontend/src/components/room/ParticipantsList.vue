<template>
  <div class="participants-list-container">
    <ul class="participants-list">
      <!-- 
        We loop through the `participants` getter from our roomStore.
        Vue's `v-for` will efficiently render and update this list.
        The `:key="user.id"` is crucial for performance, telling Vue how to
        track each item in the list.
      -->
      <li v-for="user in roomStore.participants" :key="user.id" class="participant-item">
        <img :src="user.dpUrl" :alt="user.name" class="participant-dp" />

        <div class="participant-name-container">
          <!-- 
            We determine which icon to show based on the user's role.
            The `v-html` directive is used to render the raw SVG path. This is safe
            here because the icon data is from our own trusted `icons.ts` file,
            not from user input.
          -->
          <svg
            class="participant-icon"
            :class="user.id === roomStore.hostId ? 'host-icon' : 'viewer-icon'"
            viewBox="0 0 24 24"
            v-html="user.id === roomStore.hostId ? ROLE_ICONS.host : ROLE_ICONS.user"
          ></svg>
          
          <span class="participant-name">{{ user.name }}</span>
          
          <!-- Conditionally render the "(You)" badge -->
          <span v-if="user.id === roomStore.myId" class="you-badge">(You)</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoomStore } from '@/stores/room';
import { ROLE_ICONS } from '@/assets/icons';

// Get a reactive instance of our room store. The component will now
// automatically re-render whenever the data in this store changes.
const roomStore = useRoomStore();

// The script is very lean. Its only job is to provide the roomStore
// and ROLE_ICONS to the template above. All the complex logic is
// handled by the Pinia store and Vue's reactivity system.
</script>

<style scoped>
/*
  By adding styles here with the `scoped` attribute, we ensure that these
  CSS rules will ONLY apply to this component. This prevents accidental
  style conflicts with other parts of our application.
*/
.participants-list-container {
  /* This container can be used for padding or other layout needs */
  height: 100%;
  overflow-y: auto;
}

/* 
  We don't need to copy the styles from _panel.css for .participant-item, etc.,
  because they are already loaded globally in our main.css. This component
  will automatically pick them up.
*/
</style>