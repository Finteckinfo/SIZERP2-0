<template>
  <div :class="{ 'dark-theme': isDark }">
    <WalletGuard>
      <CreateProject />
    </WalletGuard>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import WalletGuard from '@/components/guards/WalletGuard.vue';
import CreateProject from './CreateProject.vue';

const { isDark } = useTheme();
</script>
