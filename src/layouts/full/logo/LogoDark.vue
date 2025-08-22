<template>
  <div class="logo">
    <RouterLink to="/">
      <img :src="logoUrl" alt="Logo" width="92" height="76" />
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
const logoUrl = new URL('../../../assets/images/logos/logo.png', import.meta.url).href;
</script>
