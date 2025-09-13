import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useProfileStore } from './profile';
import { useRoomStore } from './room';

// Define the shape of our message objects for type safety.
// This ensures consistency across the application.
export interface ChatMessage {
  type: 'chat';
  message: string;
  senderName: string;
  senderUserId: string;
  isSenderHost: boolean;
  senderDpUrl: string;
}

export interface SystemMessage {
  type: 'system';
  // Replicate the safe structure from the original vanilla JS code
  // to prevent XSS vulnerabilities.
  parts: { text: string; isStrong: boolean }[];
}

export type Message = ChatMessage | SystemMessage;

export const useChatStore = defineStore('chat', () => {
  // --- STATE ---
  // A reactive array to hold all messages for the current chat session.
  const messages = ref<Message[]>([]);

  // --- ACTIONS ---

  /**
   * Adds a new message to the state.
   * @param message The message object to add.
   */
  function addMessage(message: Message) {
    messages.value.push(message);
  }

  /**
   * Loads chat history from localStorage into the state.
   * This is called when a user joins a room.
   */
  function loadHistory() {
    const profileStore = useProfileStore();
    const roomStore = useRoomStore();

    // Guard against running before profile/room info is available.
    if (!profileStore.userId || !roomStore.roomId) {
      console.warn('[ChatStore] Could not load history: Missing userId or roomId.');
      return;
    }

    const chatHistoryKey = `synq-chathistory-${profileStore.userId}-${roomStore.roomId}`;
    const savedHistory = localStorage.getItem(chatHistoryKey);

    if (savedHistory) {
      try {
        const history: Message[] = JSON.parse(savedHistory);
        messages.value = history;
      } catch (e) {
        console.error('Could not parse chat history:', e);
        messages.value = [];
        localStorage.removeItem(chatHistoryKey); // Clear corrupted data
      }
    }
  }
  
  /**
   * Clears all messages from the state. Used when disconnecting from a room.
   */
  function clearHistory() {
      messages.value = [];
  }

  // --- PERSISTENCE ---
  // Use a Pinia watcher to automatically save chat history to localStorage
  // whenever the `messages` array changes. This is a clean, reactive pattern.
  watch(messages, (newMessages) => {
    const profileStore = useProfileStore();
    const roomStore = useRoomStore();
    
    // Do not save if we don't have the necessary keys.
    if (!profileStore.userId || !roomStore.roomId) return;
    
    const chatHistoryKey = `synq-chathistory-${profileStore.userId}-${roomStore.roomId}`;
    localStorage.setItem(chatHistoryKey, JSON.stringify(newMessages));
  }, { deep: true }); // 'deep' is required to watch for changes inside the array.

  return {
    messages,
    addMessage,
    loadHistory,
    clearHistory,
  };
});