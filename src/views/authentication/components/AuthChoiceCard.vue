<template>
  <div
    class="auth-choice-card"
    :class="cardClasses"
    tabindex="0"
    role="button"
    @click="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown.enter.prevent="handleClick"
  >
    <div
      class="card-content"
      :class="{ 'card-content--static': !supportsHover }"
    >
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
          <div class="card-front__header">
            <div class="card-front__icon">
              <component :is="iconComponent" />
            </div>
            <div class="card-front__text">
              <small class="card-front__badge">{{ badge }}</small>
              <h3 class="card-front__title">{{ title }}</h3>
            </div>
          </div>

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
import { useTheme } from '@/composables/useTheme';
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
const supportsHover =
  typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover)').matches;

const { isDark } = useTheme();

const cardClasses = computed(() => {
  const classes: string[] = [`auth-choice-card--${props.flavor}`];
  if (supportsHover) {
    classes.push('auth-choice-card--hover');
  }
  classes.push(isDark.value ? 'auth-choice-card--dark' : 'auth-choice-card--light');
  return classes;
});

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.auth-choice-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 520px;
  margin: 2rem auto;
  perspective: 1200px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-choice-card:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.6);
  outline-offset: 6px;
}

.auth-choice-card--hover:hover {
  transform: translateY(-12px);
}

.card-content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  border-radius: 16px;
  position: relative;
}

.auth-choice-card--hover:hover .card-content {
  transform: rotateY(180deg);
}

.card-content--static {
  transform: none !important;
}

.card-content--static .card-back {
  display: none !important;
}

.card-content--static .card-front {
  transform: none !important;
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

.auth-choice-card--dark .card-back {
  background: radial-gradient(circle at 20% 20%, rgba(15, 23, 42, 0.5), transparent 75%);
}

.auth-choice-card--dark.auth-choice-card--web3 .card-back {
  background: radial-gradient(circle at 20% 20%, rgba(15, 58, 32, 0.5), transparent 75%);
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
.auth-choice-card--dark .card-back__glow {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(15, 23, 42, 0.5),
    rgba(15, 23, 42, 0.75),
    rgba(15, 23, 42, 0.5),
    transparent
  );
}

.auth-choice-card--dark.auth-choice-card--web3 .card-back__glow {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(15, 58, 32, 0.5),
    rgba(15, 58, 32, 0.8),
    rgba(15, 58, 32, 0.5),
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
  background: linear-gradient(135deg, rgba(233, 242, 255, 0.95), rgba(249, 252, 255, 0.92));
  border-radius: 16px;
  color: #0f1729;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 3.75rem 2.75rem;
  text-align: center;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.auth-choice-card--web3 .card-back__content {
  background: linear-gradient(135deg, rgba(226, 255, 241, 0.96), rgba(242, 255, 249, 0.92));
}

.auth-choice-card--dark .card-back__content {
  background: rgba(18, 26, 42, 0.92);
  color: #f8fafc;
}

.auth-choice-card--dark.auth-choice-card--web3 .card-back__content {
  background: rgba(17, 64, 37, 0.9);
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

.auth-choice-card--dark .card-back__icon svg {
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
  background: linear-gradient(135deg, rgba(91, 200, 91, 0.1), rgba(91, 200, 91, 0.02));
}

.auth-choice-card--web2 .card-front {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.14), rgba(102, 126, 234, 0.03));
}

.auth-choice-card--dark .card-front {
  background: rgba(15, 23, 42, 0.88);
}

.auth-choice-card--dark.auth-choice-card--web3 .card-front {
  background: rgba(15, 58, 32, 0.88);
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
.auth-choice-card--dark .card-front__drip {
  opacity: 0.18;
  background: radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.18), transparent 60%);
}

.auth-choice-card--dark.auth-choice-card--web3 .card-front__drip {
  background: radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.18), transparent 60%);
}

.card-front__body {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 2.75rem 2.25rem;
  backdrop-filter: blur(8px);
}

.card-front__header {
  margin-bottom: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  text-align: center;
}

.card-front__icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-front__icon svg {
  width: 100%;
  height: 100%;
  color: #0f1729;
}

.auth-choice-card--web3 .card-front__icon svg {
  color: #047857;
}

.auth-choice-card--web2 .card-front__icon svg {
  color: #1d4ed8;
}

.card-front__badge {
  display: inline-flex;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.75);
}

.auth-choice-card--web3 .card-front__badge {
  background: rgba(34, 197, 94, 0.14);
  color: #047857;
}

.auth-choice-card--web2 .card-front__badge {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}

.card-front__title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.auth-choice-card--dark .card-front__icon svg {
  color: #f1f5f9;
}

.auth-choice-card--dark.auth-choice-card--web3 .card-front__icon svg {
  color: #86efac;
}

.auth-choice-card--dark.auth-choice-card--web2 .card-front__icon svg {
  color: #93c5fd;
}

.auth-choice-card--dark .card-front__badge {
  background: rgba(248, 250, 252, 0.14);
  color: #f1f5f9;
}

.auth-choice-card--dark.auth-choice-card--web3 .card-front__badge {
  background: rgba(34, 197, 94, 0.22);
  color: #dcfce7;
}

.auth-choice-card--dark.auth-choice-card--web2 .card-front__badge {
  background: rgba(96, 165, 250, 0.24);
  color: #dbeafe;
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
  flex: 1;
  width: 100%;
}

.auth-choice-card--dark .card-front__body {
  color: #f1f5f9;
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

.auth-choice-card--dark.auth-choice-card--web2 .feature-icon {
  color: #60a5fa;
}

.auth-choice-card--dark.auth-choice-card--web3 .feature-icon {
  color: #4ade80;
}

.cta-button {
  margin-top: auto;
  align-self: center;
  width: 88%;
  max-width: 280px;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 30px rgba(59, 130, 246, 0.25);
}

.auth-choice-card--web3 .cta-button:hover {
  box-shadow: 0 18px 30px rgba(34, 197, 94, 0.35);
}

@media (max-width: 1024px) {
  .auth-choice-card {
    max-width: 360px;
    height: 460px;
  }

  .card-front__body {
    padding: 2.5rem 2.25rem 2.1rem;
  }
}

@media (max-width: 720px) {
  .auth-choice-card {
    max-width: 320px;
    min-height: 360px;
    height: auto;
  }

  .card-front__body {
    padding: 2.25rem 1.75rem 1.9rem;
  }

  .cta-button {
    width: 100%;
    max-width: none;
  }
}
</style>

