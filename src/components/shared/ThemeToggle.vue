<template>
  <button
    @click="toggle"
    :class="[
      'theme-toggle-btn',
      'flex items-center w-full cursor-pointer mr-10 text-sm rounded-md',
      isDark 
        ? 'text-gray-200 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-gray-100'
    ]"
    :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
  >
         <div v-if="isDark" class="border-4 border-gray-700 dark:border-gray-600 rounded-md p-2">
       <v-icon class="text-lg dark:text-gray-200">mdi-weather-sunny</v-icon>
     </div>
     <div v-else class="border-4 border-gray-200 rounded-md p-2">
       <v-icon class="text-lg">mdi-weather-night</v-icon>
     </div>
    <span class="ml-2">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
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
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-weight: 500;
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

/* Ensure proper spacing and alignment */
.theme-toggle-btn .v-icon {
  font-size: 1.125rem;
  line-height: 1;
}

/* Border styling for the icon containers */
.theme-toggle-btn div {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  min-height: 2.5rem;
}
</style>
