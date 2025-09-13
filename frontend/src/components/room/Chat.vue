<template>
  <div class="chat-box" id="chat-page">
    <!-- 
      The message list area. We give it a `ref` so we can programmatically
      scroll it to the bottom when new messages arrive.
    -->
    <div ref="messageListEl" class="message-list">
      <!-- 
        We loop through the messages from our Pinia store and pass each one
        as a prop to the ChatMessage component we created earlier.
      -->
      <ChatMessage 
        v-for="(msg, index) in chatStore.messages" 
        :key="index" 
        :message="msg" 
      />
    </div>

    <!-- The area for the input form and emoji picker -->
    <div class="chat-interaction-area">
      <!-- 
        This is our ChatInput component. We listen for its `sendMessage` event
        and call our local `onSendMessage` method in response.
      -->
      <ChatInput @send-message="onSendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useSocket } from '@/composables/useSocket';
import { useRoomStore } from '@/stores/room';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

const chatStore = useChatStore();
const roomStore = useRoomStore();
const { socket } = useSocket();
const messageListEl = ref<HTMLElement | null>(null);

// --- Send Message Logic ---
// This function is called when the ChatInput component emits the 'sendMessage' event.
function onSendMessage(message: string) {
  if (roomStore.roomId) {
    socket.emit('send-chat-message', { roomId: roomStore.roomId, message });
  }
}

// --- Auto-Scroll Logic ---
// We watch the `messages` array in our store for any changes.
watch(() => chatStore.messages, async () => {
  // `nextTick` waits for Vue to update the DOM with the new message.
  // This is crucial to ensure we scroll *after* the new message has been rendered.
  await nextTick();
  const el = messageListEl.value;
  if (el) {
    // Scroll to the bottom to reveal the latest message.
    el.scrollTop = el.scrollHeight;
  }
}, { deep: true }); // `deep` ensures we detect when items are pushed to the array.

</script>

<style scoped>
/*
  The global styles from `_chat.css` handle most of the styling.
  We add these scoped styles to ensure the Chat.vue component itself
  correctly fills the space provided by the TabSystem.
*/
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; /* Prevent its children from overflowing the rounded corners */
}
</style>