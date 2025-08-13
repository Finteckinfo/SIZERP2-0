<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useAuth } from '@clerk/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { isLoaded, isSignedIn } = useAuth();

onMounted(() => {
  if (isLoaded.value && !isSignedIn.value) {
    router.replace('/login');
  }
});
</script>

<template>
  <div v-if="isLoaded && isSignedIn">
    <slot />
  </div>
</template>
