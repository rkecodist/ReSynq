// src/main.ts
import './assets/css/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import App from './App.vue';
import router from './router'; // Import our new router

const app = createApp(App);

app.use(createPinia()); // Tell Vue to use Pinia
app.use(router); // Tell Vue to use the router

app.mount('#app');
