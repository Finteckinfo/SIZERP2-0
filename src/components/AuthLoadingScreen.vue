<template>
  <div class="auth-loading-container">
    <div class="loading-content">
      <!-- Animated Logo/Icon -->
      <div class="logo-container">
        <div class="logo-circle">
          <v-icon size="48" color="primary" class="logo-icon">mdi-shield-check</v-icon>
        </div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring delay-1"></div>
        <div class="pulse-ring delay-2"></div>
      </div>

      <!-- Loading Text -->
      <div class="loading-text">
        <h2 class="loading-title">{{ loadingTitle }}</h2>
        <p class="loading-subtitle">{{ loadingSubtitle }}</p>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-container">
        <v-progress-linear
          :model-value="progressValue"
          color="primary"
          height="4"
          rounded
          class="progress-bar"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>

      <!-- Retry Button (if needed) -->
      <div v-if="showRetry" class="retry-container">
        <v-btn
          color="primary"
          variant="outlined"
          @click="handleRetry"
          :loading="retrying"
          class="retry-btn"
        >
          <v-icon start>mdi-refresh</v-icon>
          Try Again
        </v-btn>
      </div>

      <!-- Tips/Help -->
      <div class="tips-container">
        <v-card variant="tonal" color="primary" class="tips-card">
          <v-card-text class="text-center">
            <v-icon color="primary" class="mb-2">mdi-lightbulb-outline</v-icon>
            <p class="text-caption mb-0">{{ tipText }}</p>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Background Animation -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  loadingTitle?: string;
  loadingSubtitle?: string;
  progressValue?: number;
  progressText?: string;
  tipText?: string;
  showRetry?: boolean;
  retrying?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loadingTitle: 'Initializing Authentication',
  loadingSubtitle: 'Please wait while we set up your secure session...',
  progressValue: 0,
  progressText: 'Loading...',
  tipText: 'This usually takes just a few seconds',
  showRetry: false,
  retrying: false
});

const emit = defineEmits<{
  retry: [];
}>();

const handleRetry = () => {
  emit('retry');
};

// Animate progress bar
const animatedProgress = ref(0);
let progressInterval: NodeJS.Timeout;

onMounted(() => {
  // Animate progress bar smoothly
  progressInterval = setInterval(() => {
    if (animatedProgress.value < props.progressValue) {
      animatedProgress.value += 2;
    }
  }, 50);
});

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<style scoped>
.auth-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.loading-content {
  text-align: center;
  color: white;
  z-index: 2;
  max-width: 400px;
  padding: 2rem;
}

.logo-container {
  position: relative;
  margin: 0 auto 2rem;
  width: 120px;
  height: 120px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: logoFloat 3s ease-in-out infinite;
}

.logo-icon {
  animation: iconPulse 2s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

.loading-text {
  margin-bottom: 2rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.4;
}

.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.7;
}

.retry-container {
  margin-bottom: 2rem;
}

.retry-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tips-container {
  margin-top: 1rem;
}

.tips-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  left: 80%;
  animation-delay: 1s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  top: 80%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 30px;
  height: 30px;
  top: 30%;
  left: 70%;
  animation-delay: 3s;
}

.shape-5 {
  width: 50px;
  height: 50px;
  top: 10%;
  left: 50%;
  animation-delay: 4s;
}

/* Animations */
@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-content {
    padding: 1rem;
    max-width: 90%;
  }
  
  .loading-title {
    font-size: 1.2rem;
  }
  
  .logo-container {
    width: 100px;
    height: 100px;
  }
  
  .logo-circle {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon {
    font-size: 32px !important;
  }
}
</style>
