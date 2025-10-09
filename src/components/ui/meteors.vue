<template>
  <div class="meteors-container">
    <div
      v-for="(meteor, index) in meteors"
      :key="index"
      class="meteor"
      :style="{
        top: `${meteor.top}%`,
        left: `${meteor.left}%`,
        animationDelay: `${meteor.delay}s`,
        animationDuration: `${meteor.duration}s`,
        '--meteor-size': `${meteor.size}px`,
        '--meteor-tail-length': `${meteor.tailLength}px`
      }"
    >
      <span class="meteor-tail"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MeteorsProps {
  number?: number
  minSize?: number
  maxSize?: number
  minDuration?: number
  maxDuration?: number
  minDelay?: number
  maxDelay?: number
}

const props = withDefaults(defineProps<MeteorsProps>(), {
  number: 20,
  minSize: 1,
  maxSize: 3,
  minDuration: 2,
  maxDuration: 5,
  minDelay: 0,
  maxDelay: 3
})

interface Meteor {
  top: number
  left: number
  size: number
  duration: number
  delay: number
  tailLength: number
}

const meteors = ref<Meteor[]>([])

const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const generateMeteors = () => {
  const newMeteors: Meteor[] = []
  
  for (let i = 0; i < props.number; i++) {
    const size = random(props.minSize, props.maxSize)
    newMeteors.push({
      top: random(-10, 50),
      left: random(0, 100),
      size,
      duration: random(props.minDuration, props.maxDuration),
      delay: random(props.minDelay, props.maxDelay),
      tailLength: size * 20
    })
  }
  
  meteors.value = newMeteors
}

onMounted(() => {
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
  width: var(--meteor-size);
  height: var(--meteor-size);
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
  animation: meteor-fall linear infinite;
  opacity: 0;
}

.meteor-tail {
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  width: var(--meteor-tail-length);
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.4) 100%);
  filter: blur(0.5px);
}

@keyframes meteor-fall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(-45deg);
  }
  
  10% {
    opacity: 1;
  }
  
  90% {
    opacity: 1;
  }
  
  100% {
    opacity: 0;
    transform: translateY(300px) translateX(300px) rotate(-45deg);
  }
}

/* Stagger effect for more natural appearance */
.meteor:nth-child(even) {
  animation-direction: alternate;
}

/* Different glow colors for variety */
.meteor:nth-child(3n) {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(59, 130, 246, 0) 100%);
}

.meteor:nth-child(3n) .meteor-tail {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(59, 130, 246, 0.4) 100%);
}

.meteor:nth-child(5n) {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0) 0%, rgba(168, 85, 247, 0.8) 50%, rgba(168, 85, 247, 0) 100%);
}

.meteor:nth-child(5n) .meteor-tail {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0) 0%, rgba(168, 85, 247, 0.8) 50%, rgba(168, 85, 247, 0.4) 100%);
}
</style>

