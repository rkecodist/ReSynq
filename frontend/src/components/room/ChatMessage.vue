<template>
  <!-- 
    The root element's class is dynamically determined.
    If the message is a system message, it gets a simple, centered style.
    Otherwise, it's a chat bubble aligned left or right.
  -->
  <div v-if="message.type === 'system'" class="system-message">
    <!-- Loop through the parts of the system message -->
    <template v-for="(part, index) in message.parts" :key="index">
      <!-- Use <strong> for strong parts, <span> for normal parts -->
      <component :is="part.isStrong ? 'strong' : 'span'">{{ part.text }}</component>
      <!-- Add a space after each part -->
      <span>&nbsp;</span>
    </template>
  </div>
  
  <div v-else class="message-container" :class="{ self: isSelf, other: !isSelf }">
    <!-- The sender's avatar, shown only for other users' messages -->
    <img v-if="!isSelf" :src="message.senderDpUrl" :alt="message.senderName" class="chat-dp" />

    <div class="message-bubble">
      <!-- The sender's name and host icon, also only for other users -->
      <div v-if="!isSelf" class="sender-name">
        <svg
          class="chat-icon"
          :class="message.isSenderHost ? 'host-icon' : 'viewer-icon'"
          viewBox="0 0 24 24"
          v-html="message.isSenderHost ? ROLE_ICONS.host : ROLE_ICONS.user"
        ></svg>
        <span>{{ message.senderName }}</span>
      </div>

      <!-- 
        The message text itself. v-html is used to render emoji images.
        This is safe because our `sanitizedAndEmojiText` computed property
        handles XSS protection first.
      -->
      <span class="message-text" v-html="sanitizedAndEmojiText"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProfileStore } from '@/stores/profile';
import type { Message } from '@/stores/chat';
import { ROLE_ICONS } from '@/assets/icons';

// --- PROPS ---
// This component expects a single `message` object as its input.
const props = defineProps<{
  message: Message;
}>();

// --- SETUP ---
const profileStore = useProfileStore();

// --- DATA ---
// A hardcoded list of emoji definitions, directly from your original project.
// In a larger app, this might come from a config file or API.
const emojiList = [
  { shortcode: ':Facepalm:', url: '/emojis/Facepalm.png' }, { shortcode: ':Grin:', url: '/emojis/Grin.png' },
  { shortcode: ':Chuckle:', url: '/emojis/Chuckle.png' }, { shortcode: ':Awesome:', url: '/emojis/Awesome.png' },
  { shortcode: ':NoProb:', url: '/emojis/NoProb.png' }, { shortcode: ':Laugh:', url: '/emojis/Laugh.png' },
  { shortcode: ':Cry:', url: '/emojis/Cry.png' }, { shortcode: ':Angry:', url: '/emojis/Angry.png' },
  { shortcode: ':SillyFace:', url: '/emojis/SillyFace.png' }, { shortcode: ':Sob:', url: '/emojis/Sob.png' },
  { shortcode: ':Bye:', url: '/emojis/Bye.png' }, { shortcode: ':Wow:', url: '/emojis/Wow.png' },
  { shortcode: ':Funny:', url: '/emojis/Funny.png' }, { shortcode: ':Kiss:', url: '/emojis/Kiss.png' },
  { shortcode: ':Clap:', url: '/emojis/Clap.png' }, { shortcode: ':TearingUP:', url: '/emojis/TearingUP.png' },
  { shortcode: ':Trick:', url: '/emojis/Trick.png' }, { shortcode: ':Panic:', url: '/emojis/Panic.png' },
  { shortcode: ':Lol:', url: '/emojis/Lol.png' }, { shortcode: ':Please:', url: '/emojis/Please.png' },
  { shortcode: ':Yay:', url: '/emojis/Yay.png' }, { shortcode: ':Yeah:', url: '/emojis/Yeah.png' },
  { shortcode: ':Sweats:', url: '/emojis/Sweats.png' }, { shortcode: ':RollEyes:', url: '/emojis/RollEyes.png' },
  { shortcode: ':Dazed:', url: '/emojis/Dazed.png' }, { shortcode: ':DrinkWater:', url: '/emojis/DrinkWater.png' },
  { shortcode: ':OMG:', url: '/emojis/OMG.png' }, { shortcode: ':Drool:', url: '/emojis/Drool.png' },
  { shortcode: ':Saucy:', url: '/emojis/Saucy.png' }, { shortcode: ':Blush:', url: '/emojis/Blush.png' },
  { shortcode: ':DayDream:', url: '/emojis/DayDream.png' }, { shortcode: ':SpitBlood:', url: '/emojis/SpitBlood.png' },
  { shortcode: ':Yummy:', url: '/emojis/Yummy.png' }, { shortcode: ':Sleep:', url: '/emojis/Sleep.png' },
  { shortcode: ':PassAway:', url: '/emojis/PassAway.png' }, { shortcode: ':Love:', url: '/emojis/Love.png' },
  { shortcode: ':Dizzy:', url: '/emojis/Dizzy.png' }, { shortcode: ':Moving:', url: '/emojis/Moving.png' },
  { shortcode: ':Pooh-pooh:', url: '/emojis/Pooh-pooh.png' }, { shortcode: ':Cool:', url: '/emojis/Cool.png' },
  { shortcode: ':Cheers:', url: '/emojis/Cheers.png' }, { shortcode: ':What:', url: '/emojis/What.png' },
];

// --- COMPUTED PROPERTIES ---
/**
 * Determines if the message was sent by the current user.
 */
const isSelf = computed(() => {
  if (props.message.type === 'system') return false;
  return props.message.senderUserId === profileStore.userId;
});

/**
 * A computed property that performs the crucial sanitization and emoji replacement.
 * It only runs when the message text changes, making it very efficient.
 */
const sanitizedAndEmojiText = computed(() => {
  if (props.message.type === 'system') return '';

  // 1. Sanitize: Prevent XSS by escaping HTML characters.
  const sanitizedText = props.message.message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Replace Emojis: Iterate through the emoji list and replace shortcodes.
  let renderedText = sanitizedText;
  for (const emoji of emojiList) {
    // Escape special characters in the shortcode for use in the RegExp
    const shortcodeRegex = new RegExp(
      emoji.shortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
      'g'
    );
    const emojiHtml = `<img src="${emoji.url}" alt="${emoji.shortcode}" class="chat-emoji" />`;
    renderedText = renderedText.replace(shortcodeRegex, emojiHtml);
  }

  return renderedText;
});
</script>

<style scoped>
/*
  All styles for the message bubbles (.message-container, .chat-dp, etc.)
  are already defined in your global CSS (_chat.css). This component will
  automatically pick them up. We add `scoped` to ensure that if we add any
  component-specific styles later, they won't affect anything else.
*/
</style>