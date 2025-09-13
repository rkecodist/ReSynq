import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// --- SOLUTION START ---
// Import the profile store here
import { useProfileStore } from './stores/profile'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // Use Pinia first

// Get an instance of the profile store
const profileStore = useProfileStore()

// Initialize the profile from localStorage BEFORE mounting the app.
// This guarantees that by the time any page component loads, the profile
// state is already accurate. This fixes the refresh race condition.
profileStore.initializeProfile()

// --- SOLUTION END ---

app.use(router)

app.mount('#app')