<template>
  <div>
    <!-- The HTML structure is copied directly from your original index.html -->
    <div class="page-wrapper">
      <div class="container">
        <header>
          <h1>Synq</h1>
        </header>
        <main>
          <h2>Watch Together. Instantly.</h2>
          <p>
            Create a private room, share the link, and stream videos in sync. No
            accounts. No ads.
          </p>
          <div class="action-buttons">
            <!-- We attach our Vue methods to the @click event -->
            <button id="create-room-btn" @click="handleCreateRoom">
              Create a Watch Party
            </button>

            <!-- We use @submit.prevent to stop the default form submission -->
            <form class="join-form" @submit.prevent="handleJoinRoom">
              <!-- v-model creates a two-way binding between the input and our `joinRoomId` variable -->
              <input
                type="text"
                id="join-room-input"
                placeholder="Or enter a Room ID..."
                v-model="joinRoomId"
              />
              <button id="join-room-btn" aria-label="Join Room" type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>

    <footer style="position: fixed; bottom: 10px; right: 10px">
      <button
        id="delete-data-btn"
        @click="handleDeleteData"
        style="
          background-color: #444; color: #ccc; border: 1px solid #666;
          padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;
        "
      >
        Delete My Data
      </button>
    </footer>

    <!--
      This is how we integrate our ProfileModal component.
      - `v-model="isProfileModalVisible"` controls when it's shown.
      - `:heading-text` passes down the custom heading.
      - `@profile-created` listens for the event when the user clicks "Let's Go!".
    -->
    <ProfileModal
      v-model="isProfileModalVisible"
      :heading-text="modalHeading"
      :subheading-text="modalSubheading"
      @profile-created="onProfileCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import * as roomService from '@/services/roomService'
import ProfileModal from '@/components/common/ProfileModal.vue'

// --- SETUP ---
// Get access to the router instance for navigation.
const router = useRouter()
// Get access to our profile store.
const profileStore = useProfileStore()

// --- STATE ---
// Reactive variables to hold the state of this page.
const joinRoomId = ref('')
const isProfileModalVisible = ref(false)
const modalHeading = ref('')
const modalSubheading = ref('')

// This is a more advanced technique to handle the async flow of the modal.
// It stores the `resolve` function of a Promise, allowing us to "complete" the
// promise from a different part of our code (the onProfileCreated handler).
let resolveProfilePromise: (value: boolean) => void

// --- METHODS ---

/**
 * Ensures a user profile exists. If not, it shows the modal and waits for it
 * to be completed. This is the core of the user identification flow.
 */
function ensureProfile(heading: string, subheading: string): Promise<boolean> {
  // If the profile already exists, we can continue immediately.
  if (profileStore.hasProfile) {
    return Promise.resolve(true)
  }

  // If not, we set the modal's text and show it.
  modalHeading.value = heading
  modalSubheading.value = subheading
  isProfileModalVisible.value = true

  // We return a new Promise. This Promise will only be resolved when
  // the `onProfileCreated` function is called after the user fills out the modal.
  return new Promise((resolve) => {
    resolveProfilePromise = resolve
  })
}

/**
 * This function is called when the ProfileModal emits the `profileCreated` event.
 */
function onProfileCreated(profile: { username: string; dpUrl: string }) {
  // Use the data from the modal to create the profile in our Pinia store.
  profileStore.createProfile(profile.username, profile.dpUrl)
  // Now that the profile is created, we resolve the promise from `ensureProfile`.
  // This tells the `handleCreateRoom` or `handleJoinRoom` functions that they can proceed.
  if (resolveProfilePromise) {
    resolveProfilePromise(true)
  }
}

/**
 * Handles the "Create a Watch Party" button click.
 */
async function handleCreateRoom() {
  try {
    // First, wait for the profile to be ready.
    await ensureProfile('First, Your Alias', 'Choose an avatar and name to create a party.')

    // Once ensured, get the userId from the store.
    const userId = profileStore.userId! // The "!" tells TypeScript we know userId is not null here.

    // Call our service to create the room on the backend.
    const roomId = await roomService.createRoom(userId)

    // Navigate to the new room.
    router.push(`/room/${roomId}`)
  } catch (error) {
    console.error('Error creating room:', error)
    alert('Could not create a room. Please try again later.')
  }
}

/**
 * Handles the "Join Room" form submission.
 */
async function handleJoinRoom() {
  const roomIdToJoin = joinRoomId.value.trim()
  if (!roomIdToJoin) {
    alert('Please enter a Room ID.')
    return
  }

  try {
    // Wait for the profile to be ready.
    await ensureProfile('Welcome to the Party', 'Set your name before you join.')

    // Check if the room exists.
    const exists = await roomService.checkRoom(roomIdToJoin)

    if (exists) {
      router.push(`/room/${roomIdToJoin}`)
    } else {
      alert('Room not found. Please check the ID and try again.')
    }
  } catch (error) {
    console.error('Error joining room:', error)
    alert('Could not connect to the server. Please check your connection.')
  }
}

/**
 * Handles the "Delete My Data" button click.
 */
function handleDeleteData() {
  profileStore.deleteProfile()
  alert(
    'Your persistent user data has been deleted. You will be prompted to create a new profile on your next action.'
  )
}

// --- LIFECYCLE HOOK ---
// `onMounted` is a hook that runs after the component has been added to the page.
// We use it to initialize our profile store from localStorage.
onMounted(() => {
  profileStore.initializeProfile()
})
</script>