<template>
  <div>
    <form class="chat-input-form" @submit.prevent="sendMessage">
      <div class="chat-input-wrapper">
        <div class="chat-input-container">
          <textarea
            ref="chatInputEl"
            v-model="message"
            placeholder="Type a message..."
            rows="1"
            @input="handleInputResize"
            @keydown.enter.exact.prevent="sendMessage"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            @keyup="saveCursorPosition"
            @click="saveCursorPosition"
          ></textarea>
          <button
            type="button"
            class="emoji-picker-btn"
            aria-label="Toggle emoji picker"
            @click.stop="toggleEmojiPicker"
          >
            <!-- The icon inside this button changes based on the picker's state -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              v-html="emojiButtonIcon"
            ></svg>
          </button>
        </div>
      </div>
      <button id="send-chat-btn" type="submit" aria-label="Send Message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>

    <!-- 
      The EmojiPicker component is included here.
      - Its visibility is controlled by the `is-open` prop.
      - We pass the chat page element down for its size calculations.
      - We listen for the `emoji-selected` event to insert the text.
    -->
    <EmojiPicker
      :is-open="isEmojiPickerOpen"
      :chat-page-el="chatPageEl"
      @emoji-selected="insertEmoji"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import EmojiPicker from './EmojiPicker.vue';

const emit = defineEmits<{
  (e: 'sendMessage', message: string): void;
}>();

// --- Local State ---
const message = ref('');
const chatInputEl = ref<HTMLTextAreaElement | null>(null);
const isEmojiPickerOpen = ref(false);
const isInputFocused = ref(false);
const chatPageEl = ref<HTMLElement | null>(null); // A reference to the parent container
let lastCursorPosition = 0;

onMounted(() => {
  // Get a reference to the parent tab page for sizing calculations.
  // This assumes the component is a child of an element with id="chat-page".
  chatPageEl.value = document.getElementById('chat-page');
});

// --- Smart Textarea Resizing Logic (Ported from vanilla JS) ---
function handleInputResize() {
  const input = chatInputEl.value;
  if (!input || !chatPageEl.value) return;

  // Temporarily reset height to calculate the natural scroll height
  input.style.height = 'auto';
  const contentHeight = input.scrollHeight;

  // Get the current height of the emoji picker (0 if closed)
  const emojiPickerHeight = isEmojiPickerOpen.value ? (chatPageEl.value.querySelector('.emoji-picker-panel')?.clientHeight ?? 0) : 0;
  
  // Calculate the maximum allowed height for the textarea
  const availableSpace = chatPageEl.value.clientHeight - emojiPickerHeight;
  const maxAllowedHeight = Math.min(availableSpace * 0.4, 150);

  if (contentHeight > maxAllowedHeight) {
    input.style.height = `${maxAllowedHeight}px`;
    input.style.overflowY = 'auto'; // Show scrollbar if content exceeds max height
  } else {
    input.style.height = `${contentHeight}px`;
    input.style.overflowY = 'hidden'; // Hide scrollbar if content fits
  }
}

// Re-calculate textarea size whenever the emoji picker is opened or closed
watch(isEmojiPickerOpen, handleInputResize);

// --- Emoji Picker Integration ---

const emojiButtonIcon = computed(() => isEmojiPickerOpen.value
  ? '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-4H6V6h12v8z"/>' // Keyboard icon
  : '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>' // Smiley icon
);

function toggleEmojiPicker() {
  isEmojiPickerOpen.value = !isEmojiPickerOpen.value;
  // If we're closing the picker, focus back on the input.
  if (!isEmojiPickerOpen.value) {
    chatInputEl.value?.focus();
  }
}

// Watch for the input to gain focus, and if it does, close the emoji picker.
watch(isInputFocused, (isFocused) => {
  if (isFocused) {
    isEmojiPickerOpen.value = false;
  }
});

function saveCursorPosition() {
  if (chatInputEl.value) {
    lastCursorPosition = chatInputEl.value.selectionStart;
  }
}

function insertEmoji(shortcode: string) {
  const input = chatInputEl.value;
  if (!input) return;

  const currentVal = message.value;
  const before = currentVal.slice(0, lastCursorPosition);
  const after = currentVal.slice(lastCursorPosition);
  message.value = before + shortcode + after;

  // Use nextTick to wait for the DOM to update with the new message value
  // before we try to set the cursor position.
  nextTick(() => {
    const newCursorPosition = lastCursorPosition + shortcode.length;
    input.selectionStart = newCursorPosition;
    input.selectionEnd = newCursorPosition;
    lastCursorPosition = newCursorPosition;
    input.focus(); // Bring focus back to the input
    handleInputResize(); // Manually trigger a resize
  });
}

// --- Send Message Logic ---
function sendMessage() {
  const content = message.value.trim();
  if (content) {
    emit('sendMessage', content);
    message.value = '';
    // After sending, wait for the v-model to update the DOM, then resize
    // the textarea back to its default single-line height.
    nextTick(handleInputResize);
  }
}
</script>