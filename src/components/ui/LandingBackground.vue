<template>
  <div :class="['landing-page', { 'dark-theme': isDark }]" :style="backgroundStyle">
    <div v-if="showThemeToggle" class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>

    <Particles
      :quantity="150"
      :staticity="50"
      :ease="50"
      :size="0.4"
      class="particles-background" 
    />

    <World class="world-background" />

    <div class="landing-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import Particles from '@/components/ui/Particles.vue';
import World from '@/components/ui/World.vue';

const props = withDefaults(defineProps<{ showThemeToggle?: boolean }>(), {
  showThemeToggle: true,
});

const { isDark } = useTheme();
const showThemeToggle = computed(() => props.showThemeToggle);

const backgroundStyle = computed(() => {
  if (isDark.value) {
    return {
      background: 'linear-gradient(135deg, #02124C 0%, #001A6B 50%, #002680 100%)',
    };
  }

  return {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f5 100%)',
  };
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.landing-page:not(.dark-theme) {
  color: #1a202c;
}

.landing-page.dark-theme {
  color: white;
}

.theme-toggle-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .theme-toggle-container {
    top: auto;
    bottom: 20px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .theme-toggle-container {
    bottom: 15px;
  }
}

.particles-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.world-background {
  position: fixed;
  bottom: -100px;
  right: -100px;
  z-index: 2;
  opacity: 0.8;
}

.landing-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

