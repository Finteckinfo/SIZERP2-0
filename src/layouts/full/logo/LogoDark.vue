<template>
  <div 
    class="logo"
    :class="{ 'dark-theme': isDark }"
  >
    <RouterLink to="/">
      <img :src="logoUrl" alt="Logo" width="92" height="76" />
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const logoUrl = new URL('../../../assets/images/logos/logo.png', import.meta.url).href;
const { isDark } = useTheme();
</script>
