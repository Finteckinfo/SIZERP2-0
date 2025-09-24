<template>
  <div class="analytics-page">
    <!-- Analytics Tabs -->
    <AnalyticsTabs />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUser } from '@clerk/vue';

// Import the new tabbed structure
import AnalyticsTabs from './AnalyticsTabs.vue';

const { user } = useUser();

// Lifecycle
onMounted(() => {
  if (user.value?.id) {
    console.log('Analytics page mounted for user:', user.value.id);
  }
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: transparent;
}

/* Global styles for the analytics page */
:deep(.v-tabs) {
  background: transparent;
}

:deep(.v-window) {
  background: transparent;
}

:deep(.v-window-item) {
  background: transparent;
}
</style>