<template>
  <!-- 
    SOLUTION: We add a class to this root div so we can target it with our new style.
  -->
  <div class="tab-system-wrapper">
    <header class="room-actions-header">
      <div class="action-buttons-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          :aria-label="tab.label"
          @click="setActiveTab(tab.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            v-html="tab.icon"
          ></svg>
        </button>
      </div>
    </header>

    <aside class="floating-content-panel">
      <div class="tab-title-container">
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
        <Transition :name="slideDirection" mode="out-in">
          <!-- 
            The 'id' attribute is added here so our child components 
            (like ChatInput) can find this element for sizing calculations.
          -->
          <component :is="activeComponent" :id="`${activeTab}-page`" class="tab-page" />
        </Transition>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ParticipantsList from '@/components/room/ParticipantsList.vue';
import InfoTab from '@/components/room/InfoTab.vue';
// 1. IMPORT THE NEW CHAT COMPONENT
import Chat from '@/components/room/Chat.vue';

const Placeholder = {
  template: '<div style="text-align: center; margin-top: 40px; color: #888;">Content coming soon...</div>'
}

const activeTab = ref('chat');
const slideDirection = ref('slide-left'); 

const tabs = [
  { id: 'chat', label: 'Show Chat', title: 'CHATS', icon: '<path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" transform="scale(0.025) translate(0, 960)"/>'},
  { id: 'media', label: 'Show Media', title: 'MEDIA', icon: '<path d="m460-380 280-180-280-180v360ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" transform="scale(0.025) translate(0, 960)"/>' },
  { id: 'voice', label: 'Show Voice Chat', title: 'VOICE CHAT', icon: '<path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/>' },
  { id: 'participants', label: 'Show Participants', title: 'PARTICIPANTS', icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
  { id: 'info', label: 'Show Info', title: 'INFO', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' }
];

const components: { [key: string]: any } = {
  // 2. REPLACE THE PLACEHOLDER WITH THE ACTUAL CHAT COMPONENT
  chat: Chat,
  media: Placeholder,
  voice: Placeholder,
  participants: ParticipantsList,
  info: InfoTab,
};

const activeComponent = computed(() => components[activeTab.value]);

const tabIndexMap = new Map(tabs.map((tab, index) => [tab.id, index]));

function setActiveTab(tabId: string) {
  const currentIndex = tabIndexMap.get(activeTab.value) ?? 0;
  const nextIndex = tabIndexMap.get(tabId) ?? 0;
  slideDirection.value = nextIndex > currentIndex ? 'slide-left' : 'slide-right';
  activeTab.value = tabId;
}
</script>

<!-- SOLUTION: Add the scoped style block below -->
<style scoped>
.tab-system-wrapper {
  /* This tells the wrapper to grow and fill the available vertical space. */
  flex: 1;
  /* This is crucial for flex-grow to work in a column layout. */
  min-height: 0;
  
  /* This makes the wrapper a flex container for its own children. */
  display: flex;
  flex-direction: column;
}
</style>

<style>
/* Non-scoped transition styles remain the same */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
.slide-right-enter-from {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>