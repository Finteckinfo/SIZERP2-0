<template>
  <v-card
    class="mobile-auth-card"
    :class="[`mobile-auth-card--${flavor}`]"
    rounded="xl"
    elevation="12"
    @click="handleClick"
  >
    <BorderBeam
      class="mobile-auth-card__beam"
      :size="140"
      :border-width="2"
      :duration="7"
      :color-from="flavor === 'web3' ? '#34d399' : '#60a5fa'"
      :color-to="flavor === 'web3' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)'"
    />

    <div class="mobile-auth-card__body">
      <div class="mobile-auth-card__header">
        <div class="mobile-auth-card__icon">
          <component :is="iconComponent" />
        </div>
        <div class="mobile-auth-card__text">
          <span class="mobile-auth-card__badge">{{ badge }}</span>
          <h3 class="mobile-auth-card__title">{{ title }}</h3>
        </div>
      </div>

      <ul class="mobile-auth-card__features">
        <li v-for="feature in features" :key="feature">
          <v-icon size="18" :color="featureIconColor">mdi-check-circle</v-icon>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <v-btn
        :color="flavor === 'web3' ? 'success' : 'primary'"
        block
        size="large"
        class="mobile-auth-card__cta"
        @click.stop="handleClick"
      >
        <v-icon start size="18">
          {{ flavor === 'web3' ? 'mdi-wallet-plus' : 'mdi-login' }}
        </v-icon>
        {{ ctaLabel }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Web3Icon from './icons/Web3Icon.vue';
import Web2Icon from './icons/Web2Icon.vue';
import BorderBeam from '@/components/ui/BorderBeam.vue';

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
const featureIconColor = computed(() =>
  props.flavor === 'web3' ? '#34d399' : '#3b82f6'
);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.mobile-auth-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 420px;
  color: rgba(15, 23, 42, 0.92);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(243, 245, 248, 0.92));
  transition: transform 0.3s ease;
}

.mobile-auth-card--web3 {
  background: linear-gradient(135deg, rgba(91, 200, 91, 0.16), rgba(236, 253, 245, 0.95));
}

.mobile-auth-card--web2 {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(239, 246, 255, 0.95));
}

.mobile-auth-card__beam {
  mix-blend-mode: screen;
}

.mobile-auth-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.75rem;
  padding: 2.25rem 1.9rem 1.9rem;
  min-height: 460px;
}

.mobile-auth-card__header {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.mobile-auth-card__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 14px;
}

.mobile-auth-card__icon svg {
  width: 100%;
  height: 100%;
}

.mobile-auth-card__text {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.mobile-auth-card__title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mobile-auth-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.75);
}

.mobile-auth-card--web3 .mobile-auth-card__badge {
  background: rgba(34, 197, 94, 0.18);
  color: #047857;
}

.mobile-auth-card--web2 .mobile-auth-card__badge {
  background: rgba(59, 130, 246, 0.18);
  color: #1d4ed8;
}

.mobile-auth-card__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1rem;
}

.mobile-auth-card__features li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: inherit;
}

.mobile-auth-card__cta {
  font-weight: 600;
  letter-spacing: 0.02em;
}

:global(.dark-theme) .mobile-auth-card {
  background: rgba(15, 23, 42, 0.9);
  color: #e2e8f0;
}

:global(.dark-theme) .mobile-auth-card--web3 {
  background: linear-gradient(135deg, rgba(17, 64, 37, 0.92), rgba(6, 15, 11, 0.92));
}

:global(.dark-theme) .mobile-auth-card--web2 {
  background: linear-gradient(135deg, rgba(29, 52, 97, 0.92), rgba(9, 13, 28, 0.92));
}

:global(.dark-theme) .mobile-auth-card__badge {
  background: rgba(226, 232, 240, 0.14);
  color: rgba(226, 232, 240, 0.92);
}

:global(.dark-theme) .mobile-auth-card__features li {
  color: rgba(226, 232, 240, 0.9);
}

:global(.dark-theme) .mobile-auth-card__icon svg {
  color: inherit;
}

@media (max-width: 420px) {
  .mobile-auth-card {
    margin: 0 auto;
  }

  .mobile-auth-card__header {
    align-items: flex-start;
  }

  .mobile-auth-card__body {
    padding: 2rem 1.4rem 1.75rem;
    min-height: 420px;
  }
}

@media (max-width: 380px) {
  .mobile-auth-card__icon {
    width: 44px;
    height: 44px;
  }

  .mobile-auth-card__body {
    gap: 1.4rem;
  }
}
</style>
