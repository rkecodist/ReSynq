<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="viewBox"
    :width="size"
    :height="size"
    :fill="fill"
    role="img"
    :aria-label="`${name} icon`"
  >
    <!-- 
      v-html is used here in a controlled environment. 
      This is the ONLY place in the app where we will use it for icons, 
      making it secure because the data comes from our own trusted icons.ts file.
    -->
    <g v-html="iconPath"></g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// 1. Import all your icon sets
import { ROLE_ICONS } from '@/assets/icons';

// 2. Combine all icon sets into a single, easy-to-use map.
// As you create more icon sets (e.g., for player controls), you'll add them here.
const ICONS_MAP = {
  ...ROLE_ICONS,
};

const props = withDefaults(
  defineProps<{
    // 3. The 'name' prop is now type-safe. Your code editor will show an error
    //    if you try to use an icon name that doesn't exist in ICONS_MAP.
    name: keyof typeof ICONS_MAP;
    size?: number;
    fill?: string;
    viewBox?: string;
  }>(),
  {
    size: 24, // A sensible default size
    fill: 'currentColor', // 'currentColor' makes the icon inherit its color from CSS.
    viewBox: '0 0 24 24', // A common default viewBox
  }
);

// 4. This computed property finds the correct SVG path data from our map.
const iconPath = computed(() => {
  return ICONS_MAP[props.name] || ''; // Return path data or an empty string if not found.
});
</script>

<style scoped>
/* Scoped styles ensure these rules only apply to this component */
svg {
  display: inline-block;
  vertical-align: middle; /* Helps align icons with text */
}
</style>