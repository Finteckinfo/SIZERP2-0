<template>
  <div class="meteors-container">
    <span
      v-for="(meteor, index) in meteors"
      :key="index"
      class="meteor"
      :style="{
        '--angle': `${-angle}deg`,
        top: '-5%',
        left: `calc(0% + ${meteor.left}px)`,
        animationDelay: `${meteor.delay}s`,
        animationDuration: `${meteor.duration}s`
      }"
    >
      <!-- Meteor Tail -->
      <div class="meteor-tail"></div>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
}

const props = withDefaults(defineProps<MeteorsProps>(), {
  number: 20,
  minDelay: 0.5,
  maxDelay: 2,
  minDuration: 5,
  maxDuration: 15,
  angle: 215
})

interface Meteor {
  left: number
  delay: number
  duration: number
}

const meteors = ref<Meteor[]>([])

const generateMeteors = () => {
  const newMeteors: Meteor[] = []
  const width = typeof window !== 'undefined' ? window.innerWidth : 1000
  
  for (let i = 0; i < props.number; i++) {
    newMeteors.push({
      left: Math.floor(Math.random() * (width + 400)), // Extended range to cover full width
      delay: Math.random() * (props.maxDelay - props.minDelay) + props.minDelay,
      duration: Math.floor(Math.random() * (props.maxDuration - props.minDuration) + props.minDuration)
    })
  }
  
  meteors.value = newMeteors
}

onMounted(() => {
  generateMeteors()
  
  // Regenerate on window resize
  window.addEventListener('resize', generateMeteors)
})

watch(() => props.number, () => {
  generateMeteors()
})
</script>

<style scoped>
.meteors-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.meteor {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: meteor-animation linear infinite;
  pointer-events: none;
}

.meteor-tail {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%) translateX(-100%);
  width: 50px;
  height: 1px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent);
  pointer-events: none;
}

@keyframes meteor-animation {
  0% {
    transform: rotate(var(--angle)) translateX(0) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(-500px) translateY(500px);
    opacity: 0;
  }
}
</style>

