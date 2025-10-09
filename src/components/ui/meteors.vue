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
  minDelay: 0.2,
  maxDelay: 1.2,
  minDuration: 2,
  maxDuration: 10,
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
  
  for (let i = 0; i < props.number; i++) {
    newMeteors.push({
      left: Math.floor(Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)),
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.meteor {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 9999px;
  background-color: rgb(113, 113, 122);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: rotate(var(--angle));
  animation: meteor-animation linear infinite;
  pointer-events: none;
}

.meteor-tail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 1px;
  background: linear-gradient(to right, rgb(113, 113, 122), transparent);
  pointer-events: none;
  z-index: -10;
}

@keyframes meteor-animation {
  0% {
    transform: rotate(var(--angle)) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(-500px);
    opacity: 0;
  }
}
</style>

