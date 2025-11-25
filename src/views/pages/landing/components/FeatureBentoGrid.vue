<template>
  <div class="bento-grid">
    <article
      v-for="feature in features"
      :key="feature.title"
      class="bento-card"
      :class="[`bento-card--${feature.variant}`, feature.layout]"
    >
      <div class="bento-card__background">
        <span class="bento-card__orb" />
        <span class="bento-card__wave" />
      </div>

      <div class="bento-card__content">
        <div class="bento-card__icon">
          <v-icon :color="feature.iconColor" size="28">
            {{ feature.icon }}
          </v-icon>
        </div>

        <div class="bento-card__header">
          <h3>{{ feature.title }}</h3>
          <small>{{ feature.subtitle }}</small>
        </div>

        <p>{{ feature.description }}</p>

        <div class="bento-card__cta">
          <span>{{ feature.cta }}</span>
          <v-icon size="18">
            mdi-arrow-top-right
          </v-icon>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  icon: string;
  iconColor: string;
  variant: 'emerald' | 'indigo' | 'violet' | 'amber' | 'sky' | 'rose';
  layout: string;
}

const features: Feature[] = [
  {
    title: 'Secure Escrow',
    subtitle: 'Algorand-backed trust',
    description:
      'Safeguard every payment with on-chain escrow and automated release rules that give both teams and contributors confidence.',
    cta: 'Explore escrow flow',
    icon: 'mdi-shield-lock',
    iconColor: '#4ade80',
    variant: 'emerald',
    layout: 'layout--center-tall',
  },
  {
    title: 'Web3 Native',
    subtitle: 'Wallet-first experience',
    description:
      'Instant account verification, SIZ coin balances, and signature-based approvals—built for a borderless workforce.',
    cta: 'See wallet tooling',
    icon: 'mdi-wallet-plus',
    iconColor: '#60a5fa',
    variant: 'sky',
    layout: 'layout--left-top',
  },
  {
    title: 'Remote Alignment',
    subtitle: 'Granular permissions',
    description:
      'Keep work private to the people involved. Owners, managers, creators, and assignees collaborate without noisy spillover.',
    cta: 'Review access rules',
    icon: 'mdi-account-group',
    iconColor: '#c084fc',
    variant: 'violet',
    layout: 'layout--left-bottom',
  },
  {
    title: 'Guaranteed Payouts',
    subtitle: 'Smart contract payouts',
    description:
      'Task states sync with escrow so milestones trigger real payouts without manual intervention or accounting delays.',
    cta: 'View payment stages',
    icon: 'mdi-rocket-launch',
    iconColor: '#f97316',
    variant: 'amber',
    layout: 'layout--right-top',
  },
  {
    title: 'Operational Clarity',
    subtitle: 'Bento analytics',
    description:
      'Surface live obligations, processing transfers, and released funds in one glance with our new escrow analytics widgets.',
    cta: 'Open analytics suite',
    icon: 'mdi-chart-box',
    iconColor: '#818cf8',
    variant: 'indigo',
    layout: 'layout--right-bottom',
  },
  {
    title: 'Global Ecosystem',
    subtitle: 'Talent without borders',
    description:
      'Match contributors and projects in any market, with instant onboarding flows and localized compliance baked into the platform.',
    cta: 'Discover the network',
    icon: 'mdi-earth',
    iconColor: '#f472b6',
    variant: 'rose',
    layout: 'layout--center-short',
  },
];
</script>

<style scoped>
.bento-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  position: relative;
  z-index: 1;
}

.bento-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  min-height: 240px;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.bento-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 22px 50px rgba(15, 23, 42, 0.26),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.bento-card__background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bento-card__orb,
.bento-card__wave {
  position: absolute;
  border-radius: 999px;
  filter: blur(0);
  opacity: 0.6;
  transform: scale(1);
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.bento-card__orb {
  top: -40%;
  right: -30%;
  width: 220px;
  height: 220px;
}

.bento-card__wave {
  bottom: -45%;
  left: -15%;
  width: 280px;
  height: 280px;
  transform: rotate(20deg);
}

.bento-card:hover .bento-card__orb {
  transform: scale(1.1);
  opacity: 0.74;
}

.bento-card:hover .bento-card__wave {
  transform: rotate(12deg) scale(1.05);
  opacity: 0.7;
}

.bento-card__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 2.2rem 2rem;
  color: rgba(15, 23, 42, 0.92);
}

.dark-theme .bento-card__content {
  color: rgba(241, 245, 249, 0.95);
}

.bento-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
}

.dark-theme .bento-card__icon {
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.bento-card__header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.bento-card__header small {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.75;
}

.bento-card__content p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.bento-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.bento-card:hover .bento-card__cta {
  opacity: 1;
}

.bento-card--emerald {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(22, 101, 52, 0.12));
  border-color: rgba(34, 197, 94, 0.25);
}

.bento-card--emerald .bento-card__orb {
  background: radial-gradient(circle, rgba(34, 197, 94, 0.45), transparent 70%);
}

.bento-card--emerald .bento-card__wave {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.45), rgba(56, 189, 248, 0.18));
}

.bento-card--sky {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(14, 116, 144, 0.14));
  border-color: rgba(56, 189, 248, 0.28);
}

.bento-card--sky .bento-card__orb {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.5), transparent 70%);
}

.bento-card--sky .bento-card__wave {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.38), rgba(59, 130, 246, 0.18));
}

.bento-card--violet {
  background: linear-gradient(135deg, rgba(192, 132, 252, 0.16), rgba(109, 40, 217, 0.15));
  border-color: rgba(192, 132, 252, 0.26);
}

.bento-card--violet .bento-card__orb {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.48), transparent 70%);
}

.bento-card--violet .bento-card__wave {
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.42), rgba(236, 72, 153, 0.15));
}

.bento-card--amber {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(234, 88, 12, 0.12));
  border-color: rgba(251, 191, 36, 0.28);
}

.bento-card--amber .bento-card__orb {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%);
}

.bento-card--amber .bento-card__wave {
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.35), rgba(251, 113, 133, 0.16));
}

.bento-card--indigo {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(79, 70, 229, 0.16));
  border-color: rgba(79, 70, 229, 0.3);
}

.bento-card--indigo .bento-card__orb {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent 70%);
}

.bento-card--indigo .bento-card__wave {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(79, 70, 229, 0.38));
}

.bento-card--rose {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(190, 24, 93, 0.14));
  border-color: rgba(244, 114, 182, 0.32);
}

.bento-card--rose .bento-card__orb {
  background: radial-gradient(circle, rgba(244, 114, 182, 0.55), transparent 70%);
}

.bento-card--rose .bento-card__wave {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.42), rgba(129, 140, 248, 0.18));
}

.layout--left-top,
.layout--left-bottom,
.layout--right-top,
.layout--right-bottom,
.layout--center-tall,
.layout--center-short {
  grid-column: auto;
  grid-row: auto;
}

@media (min-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(190px, 1fr));
  }

  .layout--left-top {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .layout--left-bottom {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
  }

  .layout--center-tall {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .layout--center-short {
    grid-column: 2 / 3;
    grid-row: 3 / 4;
  }

  .layout--right-top {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
  }

  .layout--right-bottom {
    grid-column: 3 / 4;
    grid-row: 2 / 4;
  }
}

@media (max-width: 719px) {
  .bento-card {
    min-height: 220px;
  }

  .bento-card__content {
    padding: 1.9rem 1.6rem;
  }
}
</style>

