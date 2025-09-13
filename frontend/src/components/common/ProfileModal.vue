<template>
  <!-- 
    We use Vue's <Transition> component to automatically handle the fade-in/out animations.
    The actual animation is defined by the .modal-container and .hidden classes in your CSS.
  -->
  <Transition name="fade">
    <div v-if="modelValue" class="modal-container">
      <div class="modal-overlay"></div>
      <div class="modal-panel">
        <h2 id="profile-modal-heading">{{ headingText }}</h2>
        <p id="profile-modal-subheading">{{ subheadingText }}</p>

        <div class="dp-container">
          <img id="profile-modal-dp" :src="currentDpUrl" alt="Your Profile Picture" />
          <button
            id="profile-modal-refresh-dp"
            class="dp-refresh-btn"
            aria-label="Get a new profile picture"
            @click="refreshDp"
            :class="{ spinning: isSpinning }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          id="profile-modal-username"
          class="username-input"
          placeholder="Enter your name"
          v-model="currentUsername"
        />
        
        <button id="profile-modal-continue-btn" class="continue-btn" @click="handleContinue">
          Let's Go!
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// --- PROPS & EMITS ---
// This defines the "API" of our component.
// `defineProps` and `defineEmits` are compiler macros, so no import is needed.
const props = withDefaults(defineProps<{
  modelValue: boolean, // This allows using v-model for visibility
  headingText?: string,
  subheadingText?: string
}>(), {
  headingText: 'Create Your Profile',
  subheadingText: 'Choose an avatar and name to get started.'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void, // For v-model
  (e: 'profileCreated', profile: { username: string, dpUrl: string }): void
}>()

// --- INTERNAL STATE ---
// `ref` creates reactive variables.
const currentUsername = ref('')
const currentDpUrl = ref('')
const isSpinning = ref(false)

// --- LOGIC / METHODS ---

// Helper functions for generating profile details, same as in your original project.
function generateUsername(): string {
  const ADJECTIVES = ['Agile', 'Bright', 'Clever', 'Daring', 'Eager', 'Fast', 'Golden', 'Happy', 'Jolly', 'Keen', 'Lucky', 'Merry', 'Noble', 'Omega', 'Proud', 'Quick', 'Royal', 'Swift', 'True', 'Valiant', 'Witty', 'Young', 'Zesty']
  const ANIMALS = ['Ape', 'Bear', 'Cat', 'Dog', 'Eel', 'Fox', 'Gator', 'Hawk', 'Impala', 'Jaguar', 'Koala', 'Lion', 'Mink', 'Newt', 'Owl', 'Puma', 'Quail', 'Rhino', 'Stork', 'Tiger', 'Unicorn', 'Viper', 'Wolf', 'Yak', 'Zebra']
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${animal}`
}

function generateDpUrl(): string {
  const seed = Math.random().toString(36).substring(2, 15)
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}`
}

// Method for the refresh button.
function refreshDp() {
  currentDpUrl.value = generateDpUrl()
  
  // Animate the button spin.
  isSpinning.value = true
  // The animation duration is 400ms in the CSS, so we remove the class after it finishes.
  setTimeout(() => {
    isSpinning.value = false
  }, 400)
}

// Method for the "Let's Go!" button.
function handleContinue() {
  const finalUsername = currentUsername.value.trim()
  if (!finalUsername) {
    alert('Please enter a username.')
    return
  }

  // Emit the data up to the parent component.
  emit('profileCreated', {
    username: finalUsername,
    dpUrl: currentDpUrl.value,
  })

  // Tell the parent to close the modal.
  emit('update:modelValue', false)
}

// --- LIFECYCLE HOOKS ---
// `watch` is a hook that reacts to changes in a reactive variable.
// We use it to populate the modal with default data when it opens.
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    currentUsername.value = generateUsername()
    currentDpUrl.value = generateDpUrl()
  }
})
</script>

<style scoped>
/* 
  This defines the fade animation for Vue's <Transition> component.
  It links directly to the opacity transition in your existing CSS.
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>