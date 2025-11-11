<template>
  <div
    class="auth-choice-card"
    :class="[`auth-choice-card--${flavor}`]"
    tabindex="0"
    role="button"
    @click="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown.enter.prevent="handleClick"
  >
    <div class="card-content">
      <div class="card-back">
        <div class="card-back__glow"></div>
        <div class="card-back__content">
          <div class="card-back__icon">
            <component :is="iconComponent" />
          </div>
          <div class="card-back__heading">
            <small class="card-badge">{{ badge }}</small>
            <h2>{{ title }}</h2>
          </div>
        </div>
      </div>

      <div class="card-front">
        <div class="card-front__drip" />
        <div class="card-front__body">
          <ul class="feature-list">
            <li v-for="feature in features" :key="feature">
              <v-icon size="16" class="feature-icon">mdi-check-circle</v-icon>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <v-btn
            class="cta-button"
            :color="flavor === 'web3' ? 'success' : 'primary'"
            variant="elevated"
            size="large"
            block
            @click.stop="handleClick"
          >
            <v-icon start size="18">
              {{ flavor === 'web3' ? 'mdi-wallet-plus' : 'mdi-login' }}
            </v-icon>
            {{ ctaLabel }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Web3Icon from './icons/Web3Icon.vue';
import Web2Icon from './icons/Web2Icon.vue';

interface Props {
  title: string;
  badge: string;
  features: string[];
  ctaLabel: string;
  flavor: 'web3' | 'web2';
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'click'): void }>();

const iconComponent = computed(() => (props.flavor === 'web3' ? Web3Icon : Web2Icon));

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.auth-choice-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 500px;
  margin: 2.5rem auto;
  perspective: 1200px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-choice-card:focus {
  outline: 2px solid rgba(59, 130, 246, 0.6);
  outline-offset: 6px;
}

.auth-choice-card:hover {
  transform: translateY(-10px);
}

.card-content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  border-radius: 16px;
  position: relative;
}

.auth-choice-card:hover .card-content {
  transform: rotateY(180deg);
}

.card-back,
.card-front {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 70%);
}

.card-back__glow {
  position: absolute;
  width: 180%;
  height: 180%;
  animation: rotateGlow 6s linear infinite;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.2),
    rgba(59, 130, 246, 0.45),
    rgba(59, 130, 246, 0.2),
    transparent
  );
}

.auth-choice-card--web3 .card-back__glow {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 197, 94, 0.25),
    rgba(34, 197, 94, 0.5),
    rgba(34, 197, 94, 0.25),
    transparent
  );
}

@keyframes rotateGlow {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.card-back__content {
  position: relative;
  width: 92%;
  height: 92%;
  background: rgba(237, 242, 247, 0.95);
  border-radius: 14px;
  color: #0f1729;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 3.5rem 2.5rem;
  text-align: center;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.auth-choice-card--web3 .card-back__content {
  background: rgba(220, 255, 235, 0.95);
}

:global(.dark-theme) .auth-choice-card .card-back__content {
  background: rgba(10, 17, 29, 0.92);
  color: white;
}

.card-back__icon {
  width: 86px;
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back__icon svg {
  width: 100%;
  height: 100%;
}

:global(.dark-theme) .auth-choice-card .card-back__icon svg {
  color: white;
}

.card-back__heading h2 {
  margin: 0.5rem 0 0;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.card-back__heading .card-badge {
  display: inline-flex;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: rgba(255, 255, 255, 0.15);
}

.card-front {
  transform: rotateY(180deg);
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);
}

.auth-choice-card--web3 .card-front {
  background: linear-gradient(135deg, rgba(91, 200, 91, 0.08), rgba(91, 200, 91, 0.02));
}

.auth-choice-card--web2 .card-front {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(102, 126, 234, 0.03));
}

.card-front__drip {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.12), transparent 60%);
  opacity: 0.6;
  transition: opacity 0.4s ease;
}

.auth-choice-card--web3 .card-front__drip {
  background: radial-gradient(circle at 20% 20%, rgba(91, 200, 91, 0.18), transparent 60%);
}

.auth-choice-card:hover .card-front__drip {
  opacity: 0.2;
}

.card-front__body {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.75rem 2.5rem;
  backdrop-filter: blur(8px);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-size: 1rem;
  color: rgba(15, 23, 42, 0.78);
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  line-height: 1.4;
}

.feature-icon {
  color: #3b82f6;
}

.auth-choice-card--web3 .feature-icon {
  color: #34d399;
}

.cta-button {
  margin-top: 2rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 30px rgba(59, 130, 246, 0.25);
}

.auth-choice-card--web3 .cta-button:hover {
  box-shadow: 0 18px 30px rgba(34, 197, 94, 0.35);
}

@media (max-width: 960px) {
  .auth-choice-card {
    max-width: 380px;
    height: 460px;
  }

  .card-front__body {
    padding: 2.25rem 2rem;
  }
}

@media (max-width: 600px) {
  .auth-choice-card {
    max-width: 320px;
    min-height: 380px;
    height: auto;
  }

  .card-content {
    transform: none !important;
  }

  .auth-choice-card:hover .card-content {
    transform: none;
  }

  .card-front__body {
    padding: 2.25rem 1.75rem 1.75rem;
  }
}
</style>

