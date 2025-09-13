<template>
  <div class="chat-box">
    <!-- 
      We assign a `ref` to this div. This gives us a direct handle to the
      DOM element in our script, which is necessary for manipulating its scroll position.
    -->
    <div class="message-list" ref="messageListEl">
      <!-- 
        We loop through the messages from our chatStore.
        For each message, we render the ChatMessage component we created in the previous step.
        The `:key` is important here for performance. We create a unique key based on the
        message's index and, if it's a chat message, its sender's socket ID.
      -->
      <ChatMessage
        v-for="(msg, index) in chatStore.messages"
        :key="msg.type === 'chat' ? `${index}-${msg.senderSocketId}` : index"
        :message="msg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';
import ChatMessage from './ChatMessage.vue';

// --- SETUP ---
const chatStore = useChatStore();

// --- REFS ---
// This creates a reactive reference that we will link to our message-list div in the template.
// Its initial value is `null`, but Vue will populate it with the DOM element once mounted.
const messageListEl = ref<HTMLDivElement | null>(null);

// --- AUTO-SCROLLING LOGIC ---

/**
 * A helper function to scroll the message list to the bottom.
 */
function scrollToBottom() {
  // We use a guard to make sure the element actually exists.
  if (messageListEl.value) {
    // The core of the auto-scroll logic.
    messageListEl.value.scrollTop = messageListEl.value.scrollHeight;
  }
}

// `watch` is a powerful Vue feature that lets us react to changes in a data source.
// Here, we are watching the `messages` array inside our chatStore.
watch(
  () => chatStore.messages, // The data source to watch
  async () => {
    // This callback function runs every time a message is added or removed.

    // `nextTick` is a crucial utility. It waits until Vue has finished updating the DOM
    // with the new message. Without this, we would try to scroll *before* the new
    // message is actually rendered, leading to incorrect scroll positions.
    await nextTick();
    
    // Once the DOM is updated, we call our scroll function.
    scrollToBottom();
  },
  { 
    // `deep: true` tells Vue to watch for changes *inside* the array (i.e., new messages),
    // not just if the array itself is replaced.
    deep: true 
  }
);
</script>

<style scoped>
/*
  The styles for `.chat-box` and `.message-list` are already in your global CSS.
  This scoped block is here to ensure component encapsulation.
*/
</style>