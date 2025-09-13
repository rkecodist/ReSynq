import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// This is the shape of our user profile object
interface UserProfile {
  userId: string
  username: string
  dpUrl: string
}

// A helper function to generate a unique user ID, taken directly from your original project.
// We keep it here as it's only used for profile creation.
function generateId(length = 24): string {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce(
      (t, e) =>
        (t +=
          (e &= 63) < 36
            ? e.toString(36)
            : e < 62
              ? (e - 26).toString(36).toUpperCase()
              : e < 63
                ? '_'
                : '-'),
      ''
    )
}

export const useProfileStore = defineStore('profile', () => {
  // --- STATE ---
  // We use `ref(null)` to indicate that the value might not exist initially.
  const userId = ref<string | null>(null)
  const username = ref<string | null>(null)
  const dpUrl = ref<string | null>(null)
  
  // This flag helps prevent re-checking localStorage unnecessarily.
  const isInitialized = ref(false)

  // --- GETTERS ---
  // A computed property that automatically updates when its dependencies (userId) change.
  // This provides a clean, reactive way to check if a profile exists.
  const hasProfile = computed(() => !!userId.value)

  // --- ACTIONS ---

  /**
   * Loads the user profile from localStorage.
   * This should be called once when the application starts.
   */
  function initializeProfile() {
    if (isInitialized.value) return // Don't run more than once

    const savedProfile = localStorage.getItem('synq_profile')
    if (savedProfile) {
      try {
        const profile: UserProfile = JSON.parse(savedProfile)
        userId.value = profile.userId
        username.value = profile.username
        dpUrl.value = profile.dpUrl
      } catch (e) {
        console.error('Failed to parse saved profile, removing it.', e)
        localStorage.removeItem('synq_profile')
      }
    }
    isInitialized.value = true
  }

  /**
   * Creates a new user profile, saves it to state and localStorage.
   * @param newUsername The name chosen by the user.
   * @param newDpUrl The avatar URL chosen by the user.
   */
  function createProfile(newUsername: string, newDpUrl: string) {
    const newUserId = generateId()
    const newProfile: UserProfile = {
      userId: newUserId,
      username: newUsername,
      dpUrl: newDpUrl,
    }

    // Update the state
    userId.value = newProfile.userId
    username.value = newProfile.username
    dpUrl.value = newProfile.dpUrl

    // Save to localStorage
    localStorage.setItem('synq_profile', JSON.stringify(newProfile))
  }

  /**
   * Deletes all user data from state and localStorage.
   */
  function deleteProfile() {
    // Clear the state
    userId.value = null
    username.value = null
    dpUrl.value = null

    // Clear from localStorage
    localStorage.removeItem('synq_profile')
  }

  // --- EXPORT ---
  // We return everything that should be accessible from outside the store.
  return {
    userId,
    username,
    dpUrl,
    isInitialized,
    hasProfile,
    initializeProfile,
    createProfile,
    deleteProfile,
  }
})