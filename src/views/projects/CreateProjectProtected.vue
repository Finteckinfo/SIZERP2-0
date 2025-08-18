<template>
  <WalletGuard>
    <CreateProject />
  </WalletGuard>
</template>

<script setup lang="ts">
import WalletGuard from '@/components/guards/WalletGuard.vue';
import CreateProject from './CreateProject.vue';
</script>
