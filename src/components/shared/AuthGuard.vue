<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useAuth } from '@clerk/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const { isLoaded, isSignedIn } = useAuth();
const { isDark } = useTheme();

onMounted(() => {
  if (isLoaded.value && !isSignedIn.value) {
    router.replace('/login');
  }
});
</script>

<template>
  <div 
    v-if="isLoaded && isSignedIn"
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
</template>
