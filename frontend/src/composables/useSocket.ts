import { io, Socket } from 'socket.io-client'
import { onUnmounted } from 'vue'

// --- SINGLETON INSTANCE ---
// We create a single socket instance that will be shared across the entire application.
// The `autoConnect: false` option is crucial. It means the socket will NOT try to
// connect automatically when the application loads. We will control the connection
// manually from our Room.vue component.
const socket: Socket = io({
  autoConnect: false,
})

/**
 * A Vue Composable for managing a global Socket.IO connection.
 *
 * @returns An object containing the socket instance and control methods.
 */
export function useSocket() {
  
  // --- METHODS ---

  /**
   * Establishes the connection to the Socket.IO server.
   */
  const connect = () => {
    if (socket.connected) return
    socket.connect()
    console.log('Socket.IO connection initiated.')
  }

  /**
   * Disconnects from the Socket.IO server.
   */
  const disconnect = () => {
    if (socket.disconnected) return
    socket.disconnect()
    console.log('Socket.IO connection terminated.')
  }

  // --- LIFECYCLE HOOK ---
  
  // `onUnmounted` is a powerful Vue hook. We register a cleanup function here.
  // When any component that uses this `useSocket` composable is destroyed
  // (e.g., the user navigates away from the room page), this function will
  // be automatically called, ensuring we never leave dangling connections.
  onUnmounted(() => {
    // We also remove all event listeners to prevent memory leaks when the component
    // that set them up is gone.
    socket.offAny()
    disconnect()
  })

  // --- RETURN VALUE ---
  
  // We expose the socket instance itself and our custom control methods.
  return {
    socket,
    connect,
    disconnect,
  }
}