// ===============================|| Blank Layout ||=============================== //
<template>
  <v-app>
    <!-- Theme Toggle in top-right corner -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>
    <RouterView />
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
</script>

<style scoped>
.theme-toggle-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}
</style>
