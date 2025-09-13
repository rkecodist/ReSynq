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
  server: {
    proxy: {
      // This rule for Socket.IO is correct and remains unchanged.
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
      // --- THIS IS THE CORRECTED PART ---
      // Rule for the create room POST request.
      // It matches the exact path '/create-room'.
      '/create-room': {
        target: 'http://localhost:3000',
        changeOrigin: true, // Recommended for avoiding CORS issues
      },
      // Rule for the check room GET request.
      // It matches any path that *starts with* '/check-room'.
      '/check-room': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})