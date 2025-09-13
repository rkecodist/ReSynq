import { defineStore } from 'pinia'
import { ref } from 'vue'

// --- TYPE DEFINITIONS ---
// We define the exact "shape" of our data for type safety and clarity.

export interface ChatMessage {
  type: 'chat'
  message: string
  senderSocketId: string
  senderUserId: string
  senderName: string
  isSenderHost: boolean
  senderDpUrl: string
}

export interface SystemMessage {
  type: 'system'
  parts: { text: string; isStrong: boolean }[]
}

// A "union type" that can be either a ChatMessage or a SystemMessage.
export type Message = ChatMessage | SystemMessage

export const useChatStore = defineStore('chat', () => {
  // --- STATE ---
  // A reactive array that will hold all messages for the current chat session.
  const messages = ref<Message[]>([])
  // These will store the context needed for localStorage keys.
  const currentRoomId = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)

  // --- PRIVATE HELPERS ---
  
  /**
   * Saves the current message array to localStorage.
   * This is a "private" helper because it's only called by other actions in this store.
   */
  function _saveHistory() {
    if (!currentRoomId.value || !currentUserId.value) return
    const key = `synq-chathistory-${currentUserId.value}-${currentRoomId.value}`
    try {
      localStorage.setItem(key, JSON.stringify(messages.value))
    } catch (e) {
      console.error('Failed to save chat history:', e)
    }
  }

  // --- ACTIONS ---
  
  /**
   * Sets the context (roomId and userId) for the store, usually when a user joins a room.
   */
  function setContext(roomId: string, userId: string) {
    currentRoomId.value = roomId
    currentUserId.value = userId
  }

  /**
   * Adds a new user-sent chat message to the state.
   */
  function addChatMessage(message: Omit<ChatMessage, 'type'>) {
    messages.value.push({ type: 'chat', ...message })
    _saveHistory()
  }

  /**
   * Adds a new system message (e.g., "User joined") to the state.
   */
  function addSystemMessage(parts: { text: string; isStrong: boolean }[]) {
    messages.value.push({ type: 'system', parts })
    _saveHistory()
  }

  /**
   * Loads chat history from localStorage for the current context.
   */
  function loadHistory() {
    if (!currentRoomId.value || !currentUserId.value) return
    const key = `synq-chathistory-${currentUserId.value}-${currentRoomId.value}`
    const savedHistory = localStorage.getItem(key)

    if (savedHistory) {
      try {
        const parsedHistory: Message[] = JSON.parse(savedHistory)
        messages.value = parsedHistory
      } catch (e) {
        console.error('Could not parse chat history, starting fresh.', e)
        messages.value = []
      }
    } else {
      messages.value = []
    }
  }

  /**
   * Clears all messages from the state. Called when leaving a room.
   */
  function clearChat() {
    messages.value = []
    currentRoomId.value = null
    currentUserId.value = null
  }

  return {
    // State
    messages,
    // Actions
    setContext,
    addChatMessage,
    addSystemMessage,
    loadHistory,
    clearChat,
  }
})