// ===============================|| Blank Layout ||=============================== //
<template>
  <v-app :class="['blank-layout', { 'dark-theme': isDark }]">
    <RouterView />
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.blank-layout {
  background: transparent !important;
  background-color: transparent !important;
}

/* Ensure no Vuetify default backgrounds interfere */
.blank-layout .v-application {
  background: transparent !important;
  background-color: transparent !important;
}

/* Let child components handle their own backgrounds */
.blank-layout .v-main {
  background: transparent !important;
  background-color: transparent !important;
}
</style>
