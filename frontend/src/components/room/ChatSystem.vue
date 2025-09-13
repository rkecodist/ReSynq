<template>
  <!-- 
    The root element of our chat system. The `tab-page` class ensures
    it integrates correctly with our tab animation system.
  -->
  <div class="chat-system-container tab-page">
    <!-- The list that displays all the messages. -->
    <MessageList />

    <!-- The input area with the textarea, emoji picker, and send button. -->
    <ChatInput />
  </div>
</template>

<script setup lang="ts">
// This component is a "presentational" component. It just organizes other
// components, so its script is very lean.
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';
</script>

<style scoped>
/*
  This scoped style is crucial for the layout to work. It tells the container
  to use flexbox, to arrange its children in a column, and to allow the
  MessageList to grow and fill all available space while the ChatInput
  remains fixed at the bottom.
*/
.chat-system-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>