<template>
  <!-- 
    We use v-show instead of v-if. This keeps the component in the DOM but hidden,
    which is better for performance since we don't want to re-calculate the emoji grid
    every time it's opened.
  -->
  <div v-show="modelValue" class="emoji-picker-panel">
    <div class="emoji-list">
      <!-- 
        We use Vue's <TransitionGroup> to apply an animation to each item
        as it enters the list. This is what will create the nice pop-in effect.
        The `appear` prop ensures the animation runs on the very first render.
      -->
      <TransitionGroup name="emoji-pop" appear>
        <button
          v-for="(emoji, index) in emojiList"
          :key="emoji.shortcode"
          class="emoji-item is-visible"
          :title="emoji.shortcode"
          @mousedown.prevent
          @click="onEmojiClick(emoji.shortcode)"
          :style="{ transitionDelay: `${index * 10}ms` }"
        >
          <img :src="emoji.url" :alt="emoji.shortcode" />
        </button>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---
defineProps<{
  modelValue: boolean; // For v-model to control visibility
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'insert-emoji', emojiShortcode: string): void; // The event to notify the parent
}>();

// --- DATA ---
// We import the same emoji list as the ChatMessage component.
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

// --- METHODS ---
function onEmojiClick(shortcode: string) {
  // When an emoji is clicked, this component's only job is to tell the parent.
  emit('insert-emoji', shortcode);
}
</script>

<style scoped>
/*
  This CSS is for the <TransitionGroup> animation.
  It's a more robust way to achieve the staggered pop-in effect from your
  original project's CSS.
*/
.emoji-pop-enter-active {
  transition: all 0.25s ease;
}
.emoji-pop-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
</style>