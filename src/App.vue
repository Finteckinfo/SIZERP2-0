<template>
  <div :class="{ 'dark-theme': isDark }" :style="{ background: 'var(--erp-header-bg)' }">
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>