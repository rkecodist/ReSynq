<template>
  <!-- Case 1: The message is a system notification (e.g., "User Joined") -->
  <div v-if="message.type === 'system'" class="system-message">
    <!-- Loop through the safe 'parts' array to build the message -->
    <template v-for="(part, index) in message.parts" :key="index">
      <strong v-if="part.isStrong">{{ part.text }}</strong>
      <span v-else>{{ part.text }}</span>
    </template>
  </div>

  <!-- Case 2: The message is a standard user chat message -->
  <div v-else class="message-container" :class="{ self: isSelf }">
    <!-- The user's avatar, shown only for messages from others -->
    <img v-if="!isSelf" :src="message.senderDpUrl" :alt="message.senderName" class="chat-dp" />
    
    <div class="message-bubble">
      <!-- The sender's info, also only shown for messages from others -->
      <div v-if="!isSelf" class="sender-name">
        <Icon 
          :name="message.isSenderHost ? 'host' : 'user'" 
          :class="message.isSenderHost ? 'host-icon' : 'viewer-icon'" 
          :size="16" 
          class="chat-icon"
        />
        <span>{{ message.senderName }}</span>
      </div>
      
      <!-- 
        The message content. We use v-html here because our computed property
        `renderedMessage` will generate safe HTML with <img> tags for emojis.
      -->
      <span class="message-text" v-html="renderedMessage"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProfileStore } from '@/stores/profile';
import type { Message } from '@/stores/chat';
import { emojiList } from '@/assets/emojis';
import Icon from '@/components/common/Icon.vue';

const props = defineProps<{
  message: Message;
}>();

const profileStore = useProfileStore();

// This computed property determines if the message bubble should be aligned to the right.
const isSelf = computed(() => {
  // A message is "self" if its type is 'chat' and its sender ID matches our own.
  return props.message.type === 'chat' && props.message.senderUserId === profileStore.userId;
});

// This computed property handles the emoji parsing, ported directly from the original logic.
const renderedMessage = computed(() => {
  if (props.message.type === 'system') return '';
  
  const text = props.message.message;
  
  // Step 1: Sanitize the raw text to prevent any user-injected HTML.
  const sanitizedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Step 2: Iterate through our emoji list and replace shortcodes with <img> tags.
  let renderedText = sanitizedText;
  emojiList.forEach((emoji) => {
    // Create a regular expression from the shortcode safely.
    const shortcodeRegex = new RegExp(
      emoji.shortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
      'g'
    );
    const emojiHtml = `<img src="${emoji.url}" alt="${emoji.shortcode}" class="chat-emoji" />`;
    renderedText = renderedText.replace(shortcodeRegex, emojiHtml);
  });

  return renderedText;
});
</script>

<!-- 
  No <style scoped> block is needed here.
  This component is designed to be styled by the global `_chat.css` file,
  just like the original vanilla JS implementation.
-->