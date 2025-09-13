<!-- src/views/Room.vue -->
<template>
  <div>
    <h1>Room Placeholder</h1>
    <p>Currently in Room ID: {{ roomId }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

// This is the modern, "composable" way to access route information.
const route = useRoute();
const roomId = route.params.roomId;

// All the room logic will go here in future milestones.
</script>
