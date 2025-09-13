<template>
  <!-- This is the main component that replaces the simple placeholders in Room.vue -->
  <div>
    <!-- 2. The Action Header with Icon-based Tab Buttons -->
    <header class="room-actions-header">
      <div class="action-buttons-container">
        <!-- We use v-for to dynamically create the buttons from our `tabs` array -->
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          :aria-label="tab.label"
          @click="setActiveTab(tab.id)"
        >
          <!-- The SVG icon is rendered using v-html for simplicity -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            v-html="tab.icon"
          ></svg>
        </button>
      </div>
    </header>

    <!-- 3. The Floating Content Panel -->
    <aside class="floating-content-panel">
      <!-- The focus mode button can be added here later in a future milestone -->

      <div class="tab-title-container">
        <!-- Dynamically render the title plates and show the active one -->
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-title-plate"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.title }}
        </div>
      </div>

      <div class="tab-content-wrapper">
        <!-- 
          Here we conditionally render our content components.
          `v-show` is efficient here because it keeps the components mounted
          and just toggles their display with CSS.
        -->
        <div v-show="activeTab === 'chat'" class="tab-page">
          <!-- Chat component will go here in the next milestone -->
          <p style="text-align: center; margin-top: 40px;">Chat Placeholder</p>
        </div>
        <div v-show="activeTab === 'media'" class="tab-page">
          <p style="text-align: center; margin-top: 40px;">Media Placeholder</p>
        </div>
        <div v-show="activeTab === 'voice'" class="tab-page">
          <p style="text-align: center; margin-top: 40px;">Voice Placeholder</p>
        </div>
        
        <!-- Our actual, functional components -->
        <ParticipantsList v-show="activeTab === 'participants'" class="tab-page" />
        <InfoTab v-show="activeTab === 'info'" class="tab-page" />

      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ParticipantsList from '@/components/room/ParticipantsList.vue';
import InfoTab from '@/components/room/InfoTab.vue';

// --- STATE ---
// This reactive variable will hold the ID of the currently active tab.
const activeTab = ref('chat');

// --- DATA ---
// We define our tabs as an array of objects to keep the template clean.
const tabs = [
  { id: 'chat', label: 'Show Chat', title: 'CHATS', icon: '<path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" transform="scale(0.025) translate(0, 960)"/>'},
  { id: 'media', label: 'Show Media', title: 'MEDIA', icon: '<path d="m460-380 280-180-280-180v360ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" transform="scale(0.025) translate(0, 960)"/>' },
  { id: 'voice', label: 'Show Voice Chat', title: 'VOICE CHAT', icon: '<path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/>' },
  { id: 'participants', label: 'Show Participants', title: 'PARTICIPANTS', icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
  { id: 'info', label: 'Show Info', title: 'INFO', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' }
];
// Note on chat icon: I had to add a transform to get it to display correctly from the original path data.

// --- METHODS ---
/**
 * Sets the active tab.
 * @param tabId The ID of the tab to make active.
 */
function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}
</script>

<style scoped>
/* 
  The `.tab-page` class from the original CSS has `position: absolute`,
  which takes it out of the normal document flow. We add a simple style here
  to make sure our `v-show` works as expected by giving the visible page
  a relative position so it occupies space.
  
  (NOTE: We will replace this with a better animation system in the final step).
*/
.tab-page {
  position: relative;
}
</style>