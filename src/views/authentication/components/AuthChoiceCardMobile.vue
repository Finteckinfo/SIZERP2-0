<template>
  <v-card
    class="mobile-auth-card"
    :class="[`mobile-auth-card--${flavor}`]"
    rounded="xl"
    elevation="8"
    @click="handleClick"
  >
    <div class="mobile-auth-card__header">
      <div class="mobile-auth-card__icon">
        <component :is="iconComponent" />
      </div>
      <div class="mobile-auth-card__text">
        <span class="mobile-auth-card__badge">{{ badge }}</span>
        <h3>{{ title }}</h3>
      </div>
    </div>

    <v-divider class="my-4" />

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
  </v-card>
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
const featureIconColor = computed(() =>
  props.flavor === 'web3' ? '#34d399' : '#3b82f6'
);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.mobile-auth-card {
  width: 100%;
  background: var(--v-theme-surface);
  color: inherit;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-auth-card--web3 {
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.mobile-auth-card--web2 {
  border: 1px solid rgba(59, 130, 246, 0.35);
}

.mobile-auth-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-auth-card__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-auth-card__icon svg {
  width: 100%;
  height: 100%;
}

.mobile-auth-card__text h3 {
  margin: 0.2rem 0 0;
  font-size: 1.25rem;
  font-weight: 600;
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
  gap: 0.85rem;
  font-size: 0.95rem;
}

.mobile-auth-card__features li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mobile-auth-card__cta {
  font-weight: 600;
  letter-spacing: 0.02em;
}

:global(.dark-theme) .mobile-auth-card {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(148, 163, 184, 0.18);
}

:global(.dark-theme) .mobile-auth-card__badge {
  background: rgba(226, 232, 240, 0.12);
  color: rgba(226, 232, 240, 0.9);
}

:global(.dark-theme) .mobile-auth-card--web3 {
  border-color: rgba(34, 197, 94, 0.32);
}

:global(.dark-theme) .mobile-auth-card--web2 {
  border-color: rgba(96, 165, 250, 0.28);
}
</style>
