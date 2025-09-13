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
      // This is the line that fixes the issue for Vite.
      // It tells Vite that whenever it sees an import starting with '@',
      // it should look inside the './src' directory.
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})