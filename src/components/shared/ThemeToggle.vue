<template>
  <v-btn
    @click="toggle"
    :color="isDark ? 'warning' : 'dark'"
    variant="elevated"
    size="small"
    class="theme-toggle-btn"
    :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
  >
    <v-icon
      :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      class="mr-2"
    />
    <span v-if="showLabel">
      {{ isDark ? 'Light' : 'Dark' }}
    </span>
  </v-btn>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

interface Props {
  showLabel?: boolean;
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  size: 'default'
});

const { isDark, toggle } = useTheme();
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}
</style>
