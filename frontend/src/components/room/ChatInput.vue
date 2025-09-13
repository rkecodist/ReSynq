<template>
  <div class="chat-interaction-area">
    <!-- 
      We use @submit.prevent to call our sendMessage method on form submission,
      which can be triggered by pressing Enter on a desktop.
    -->
    <form class="chat-input-form" @submit.prevent="sendMessage">
      <div class="chat-input-wrapper">
        <div class="chat-input-container">
          <!-- 
            - `ref="textareaEl"` links this element to our script.
            - `v-model="inputText"` provides two-way data binding.
            - `@input="handleInputResize"` calls our smart resize function on every keystroke.
            - `@keydown.enter.exact.prevent="sendMessage"` allows sending with Enter but not Shift+Enter.
            - `@focus="onFocus"` and `@blur="onBlur"` help us manage the emoji picker state.
          -->
          <textarea
            ref="textareaEl"
            id="chat-input"
            placeholder="Type a message..."
            aria-label="Message"
            rows="1"
            v-model="inputText"
            @input="handleInputResize"
            @keydown.enter.exact.prevent="sendMessage"
            @focus="onFocus"
            @blur="onBlur"
          ></textarea>

          <button
            type="button"
            id="emoji-picker-btn"
            class="emoji-picker-btn"
            aria-label="Open emoji picker"
            @mousedown.prevent="toggleEmojiPicker"
          >
            <!-- The icon inside this button will change based on the picker's state -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" v-html="emojiButtonIcon"></svg>
          </button>
        </div>
      </div>
      <button id="send-chat-btn" aria-label="Send Message" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
    
    <!-- 
      Here we include our EmojiPicker component.
      - `v-model="isEmojiPickerVisible"` controls its visibility.
      - `@insert-emoji="handleEmojiInsert"` listens for the event it emits.
    -->
    <EmojiPicker v-model="isEmojiPickerVisible" @insert-emoji="handleEmojiInsert" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useSocket } from '@/composables/useSocket';
import { useRoomStore } from '@/stores/room';
import EmojiPicker from './EmojiPicker.vue';

// --- SETUP ---
const { socket } = useSocket();
const roomStore = useRoomStore();

// --- STATE ---
const inputText = ref('');
const isEmojiPickerVisible = ref(false);
const textareaEl = ref<HTMLTextAreaElement | null>(null);
let lastCursorPosition = 0;
const isFocused = ref(false);

// --- COMPUTED ---
const emojiButtonIcon = computed(() => {
  return isEmojiPickerVisible.value
    ? '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-4H6V6h12v8z"/>' // Keyboard icon
    : '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>'; // Smiley icon
});

// --- METHODS ---

function sendMessage() {
  const message = inputText.value.trim();
  if (message && roomStore.roomId) {
    socket.emit('send-chat-message', { roomId: roomStore.roomId, message });
    inputText.value = '';
    // After sending, we must trigger the resize logic again to shrink the textarea.
    nextTick(handleInputResize);
  }
}

// Replicates the smart resizing logic from your original project's `chat.js`.
function handleInputResize() {
  const ta = textareaEl.value;
  if (!ta) return;

  ta.style.height = 'auto'; // Temporarily shrink to calculate the true scroll height
  const contentHeight = ta.scrollHeight;
  
  // As in the original, we cap the height to prevent it from taking over the screen.
  const maxAllowedHeight = 120;

  if (contentHeight > maxAllowedHeight) {
    ta.style.height = `${maxAllowedHeight}px`;
    ta.style.overflowY = 'auto'; // Show scrollbar if it overflows
  } else {
    ta.style.height = `${contentHeight}px`;
    ta.style.overflowY = 'hidden'; // Hide scrollbar if it fits
  }
}

// --- EMOJI PICKER LOGIC ---

function onFocus() {
  isFocused.value = true;
  isEmojiPickerVisible.value = false; // Hide picker when user focuses the input
}

function onBlur() {
  isFocused.value = false;
  // Save the cursor position when the user clicks away from the textarea
  if (textareaEl.value) {
    lastCursorPosition = textareaEl.value.selectionStart;
  }
}

function toggleEmojiPicker() {
  isEmojiPickerVisible.value = !isEmojiPickerVisible.value;
  if (isEmojiPickerVisible.value) {
    // If we open the picker, we need to blur the input to hide the mobile keyboard.
    textareaEl.value?.blur();
  } else {
    // If we close it, we should focus the input and restore the cursor.
    textareaEl.value?.focus();
    nextTick(() => {
      if(textareaEl.value) {
        textareaEl.value.selectionStart = textareaEl.value.selectionEnd = lastCursorPosition;
      }
    });
  }
}

function handleEmojiInsert(shortcode: string) {
  const ta = textareaEl.value;
  if (!ta) return;
  const currentVal = ta.value;
  const before = currentVal.slice(0, lastCursorPosition);
  const after = currentVal.slice(lastCursorPosition);
  
  inputText.value = before + shortcode + after;
  
  const newCursorPosition = lastCursorPosition + shortcode.length;
  lastCursorPosition = newCursorPosition;

  // We must wait for Vue to update the input's value in the DOM before setting the cursor.
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = newCursorPosition;
    handleInputResize(); // Also resize in case the new emoji causes a line break
  });
}

// --- GLOBAL CLICK LISTENER ---
// This handles closing the emoji picker if the user clicks anywhere outside the chat area.
function handleClickOutside(event: MouseEvent) {
  const chatArea = (event.target as HTMLElement).closest('.chat-interaction-area');
  if (!chatArea && isEmojiPickerVisible.value) {
    isEmojiPickerVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>