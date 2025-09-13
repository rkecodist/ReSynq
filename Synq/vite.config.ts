import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // This is the new section to add.
  server: {
    proxy: {
      // Proxy requests that start with '/socket.io'
      '/socket.io': {
        target: 'http://localhost:3000', // Your Node.js backend
        ws: true, // IMPORTANT: Enable WebSocket proxying
      },
      // Proxy API requests (e.g., /create-room, /check-room)
      // We use a regex here to catch any path that doesn't seem like a file.
      '^/(create-room|check-room)/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
})