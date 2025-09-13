// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

// We will create these view components in the next step
import HomeView from '../views/Home.vue';
import RoomView from '../views/Room.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    // The ':roomId' part is a dynamic parameter.
    // It means we can access the room's ID in our component.
    path: '/room/:roomId',
    name: 'Room',
    component: RoomView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
