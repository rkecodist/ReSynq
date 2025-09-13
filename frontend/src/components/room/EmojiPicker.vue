<template>
  <!-- The v-show directive is used for elements that are toggled frequently. -->
  <!-- It keeps the element in the DOM and toggles its display via CSS. -->
  <div
    v-show="isOpen"
    ref="pickerPanelEl"
    class="emoji-picker-panel"
    :class="{ 'is-hidden': !isOpen }"
  >
    <div class="emoji-list">
      <!-- 
        We use a v-for to render a button for each emoji in our data file.
        @mousedown.prevent is important to stop the chat input from losing focus immediately.
      -->
      <button
        v-for="emoji in emojiList"
        :key="emoji.shortcode"
        class="emoji-item"
        :title="emoji.shortcode"
        @mousedown.prevent
        @click="onEmojiClick(emoji.shortcode)"
      >
        <img :src="emoji.url" :alt="emoji.shortcode" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { emojiList } from '@/assets/emojis';

const props = defineProps<{
  isOpen: boolean;
  chatPageEl: HTMLElement | null; // Pass the container element for size calculations
}>();

const emit = defineEmits<{
  (e: 'emojiSelected', shortcode: string): void;
}>();

const pickerPanelEl = ref<HTMLElement | null>(null);

function onEmojiClick(shortcode: string) {
  emit('emojiSelected', shortcode);
}

// --- Animation Logic (Ported from vanilla JS) ---
function animateInEmojis() {
  const items = pickerPanelEl.value?.querySelectorAll('.emoji-item');
  if (!items || items.length === 0) return;

  const EMOJIS_PER_ROW = 7;
  let currentIndex = 0;

  function revealNextRow() {
    const rowEndIndex = Math.min(currentIndex + EMOJIS_PER_ROW, items.length);
    for (let i = currentIndex; i < rowEndIndex; i++) {
      (items[i] as HTMLElement).classList.add('is-visible');
    }
    currentIndex += EMOJIS_PER_ROW;
    if (currentIndex < items.length) {
      requestAnimationFrame(revealNextRow);
    }
  }
  requestAnimationFrame(revealNextRow);
}

// --- Dynamic Resizing Logic (Ported from vanilla JS) ---
function resizePicker() {
  if (!props.isOpen || !pickerPanelEl.value || !props.chatPageEl) return;
  
  const MAX_HEIGHT = 280;
  const THRESHOLD = 560; // 2 * MAX_HEIGHT
  const RATIO = 0.4; // 40% of available space
  
  const availableHeight = props.chatPageEl.clientHeight;
  const pickerHeight = availableHeight < THRESHOLD ? availableHeight * RATIO : MAX_HEIGHT;
  
  pickerPanelEl.value.style.height = `${pickerHeight}px`;
}

// Watch for the 'isOpen' prop to change.
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    // Use nextTick to ensure the element is visible in the DOM before we
    // try to measure it or animate its children.
    await nextTick();
    resizePicker();
    animateInEmojis();
  }
});

// Add and remove global event listeners for resizing.
onMounted(() => {
  window.addEventListener('resize', resizePicker);
  window.addEventListener('orientationchange', resizePicker);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizePicker);
  window.removeEventListener('orientationchange', resizePicker);
});
</script>

<!-- 
  No scoped styles are needed. The component is styled by the global `_chat.css` file.
  The animation classes `.emoji-item` and `.emoji-item.is-visible` are defined there.
-->