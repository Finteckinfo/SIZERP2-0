<template>
  <div class="retro-grid-container">
    <div 
      class="retro-grid" 
      :style="{
        '--grid-angle': `${angle}deg`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface RetroGridProps {
  angle?: number
}

const props = withDefaults(defineProps<RetroGridProps>(), {
  angle: 65
})
</script>

<style scoped>
.retro-grid-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

.retro-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: perspective(1000px) rotateX(var(--grid-angle));
  transform-origin: bottom;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: center center;
  animation: retro-grid-animation 20s linear infinite;
}

/* Add a gradient fade at the top and bottom */
.retro-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}

/* Glowing horizon line effect */
.retro-grid::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 20%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.6) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.3);
  animation: horizon-glow 3s ease-in-out infinite;
}

@keyframes retro-grid-animation {
  0% {
    background-position: center 0;
  }
  100% {
    background-position: center 80px;
  }
}

@keyframes horizon-glow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>

