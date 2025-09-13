import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Define the shape of a user object for type safety
interface User {
  id: string
  name: string
  dpUrl: string
}

// Define the shape of the `users` object in our state
interface UserMap {
  [socketId: string]: {
    name: string
    dpUrl: string
  }
}

export const useRoomStore = defineStore('room', () => {
  // --- STATE ---
  const roomId = ref<string | null>(null)
  const myId = ref<string | null>(null) // Our own socket.id
  const hostId = ref<string | null>(null)
  const users = ref<UserMap>({})

  // --- GETTERS ---
  // Computed properties that derive state from the core state variables.
  
  /**
   * Reactively checks if the current client is the host.
   */
  const amHost = computed(() => myId.value !== null && myId.value === hostId.value)

  /**
   * Reactively returns a sorted array of all participants, including the current user.
   * This is much easier to work with in the UI than the `users` object.
   */
  const participants = computed((): User[] => {
    const userArray = Object.entries(users.value).map(([id, data]) => ({
      id,
      name: data.name,
      dpUrl: data.dpUrl,
    }))

    // Sort the array: host first, then alphabetically by name.
    userArray.sort((a, b) => {
      if (a.id === hostId.value) return -1
      if (b.id === hostId.value) return 1
      return a.name.localeCompare(b.name)
    })

    return userArray
  })

  // --- ACTIONS ---

  /**
   * Sets the initial Room ID from the URL.
   */
  function setInitialState(id: string) {
    roomId.value = id
  }

  /**
   * Sets our own socket ID upon successful connection.
   */
  function setConnectionState(id: string) {
    myId.value = id
  }

  /**
   * Populates the store with data received when first joining a room.
   */
  function setRoomJoined(data: { hostId: string; otherUsers: { id: string, name: string, dpUrl: string }[], userName: string, dpUrl: string }) {
    hostId.value = data.hostId

    const initialUsers: UserMap = {}
    // Add other users to the map
    data.otherUsers.forEach(user => {
      initialUsers[user.id] = { name: user.name, dpUrl: user.dpUrl }
    })
    // Add ourselves to the map
    if (myId.value) {
      initialUsers[myId.value] = { name: data.userName, dpUrl: data.dpUrl }
    }
    users.value = initialUsers
  }
  
  /**
   * Adds a new user to the room state.
   */
  function addUser(data: { userId: string, userName: string, dpUrl: string }) {
    users.value[data.userId] = { name: data.userName, dpUrl: data.dpUrl }
  }

  /**
   * Removes a user from the room state.
   */
  function removeUser(data: { userId: string }) {
    delete users.value[data.userId]
  }

  /**
   * Updates the host ID for the room.
   */
  function setHost(data: { hostId: string | null }) {
    hostId.value = data.hostId
  }

  /**
   * Resets the entire store to its initial, empty state.
   * This is crucial for cleanup when leaving a room.
   */
  function disconnect() {
    roomId.value = null
    myId.value = null
    hostId.value = null
    users.value = {}
  }

  return {
    // State
    roomId,
    myId,
    hostId,
    users,
    // Getters
    amHost,
    participants,
    // Actions
    setInitialState,
    setConnectionState,
    setRoomJoined,
    addUser,
    removeUser,
    setHost,
    disconnect,
  }
})