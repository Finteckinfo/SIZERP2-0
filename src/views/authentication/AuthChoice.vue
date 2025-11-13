<template>
  <LandingBackground>
    <div class="auth-choice-page">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="logo-container mb-4">
              <img src="/images/sizlogo.png" alt="SIZ Logo" class="auth-logo" />
            </div>
            <h1 class="text-h3 font-weight-bold mb-3 ecosystem-font">
              Welcome to SizLand ERP
            </h1>
            <p class="text-h6 text-medium-emphasis">
              Choose your preferred authentication method
            </p>
          </div>

          <!-- Authentication Options -->
          <v-row class="auth-options">
            <!-- Web3 Wallet Authentication -->
        <v-col cols="12" md="6">
          <component
            :is="selectedCardComponent"
            title="Web3 Mode"
            badge="Crypto Friendly"
            :features="web3Features"
            flavor="web3"
            :cta-label="'Continue with Wallet'"
            @click="handleWeb3Choice"
          />
        </v-col>

        <!-- Web2 Traditional Authentication -->
        <v-col cols="12" md="6">
          <component
            :is="selectedCardComponent"
            title="Web2 Mode"
            badge="Traditional Login"
            :features="web2Features"
            flavor="web2"
            :cta-label="'Continue with Email/Social'"
            @click="handleWeb2Choice"
          />
        </v-col>
          </v-row>

          <!-- Help Section -->
          <div class="text-center mt-8 help-section">
            <v-btn
              variant="text"
              color="primary"
              @click="showHelp = true"
            >
              <v-icon start>mdi-help-circle</v-icon>
              Need help choosing?
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Help Dialog -->
    <v-dialog v-model="showHelp" max-width="600">
      <v-card :style="helpDialogCardStyle">
        <v-card-title class="headline">
          <v-icon class="mr-2" color="primary">mdi-help-circle</v-icon>
          Authentication Methods Explained
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="help-content">
            <h4 class="mb-3">Web3 Mode (Wallet-First)</h4>
            <p class="mb-4">
              Your wallet becomes your identity. You'll create or connect a blockchain wallet that serves 
              as your login credential. This is the true Web3 experience - decentralized and 
              censorship-resistant. You'll set a password to protect your wallet and can recover it with 
              security questions if needed.
            </p>

            <h4 class="mb-3">Web2 Mode (Traditional)</h4>
            <p class="mb-4">
              Use familiar login methods like email/password or social accounts (Google, GitHub). 
              You can optionally connect a wallet later to access blockchain features. This is easier 
              for newcomers and allows multi-device access.
            </p>

            <h4 class="mb-3">Which should I choose?</h4>
            <ul class="mb-4">
              <li class="mb-2">
                <strong>Choose Web3</strong> if you're familiar with cryptocurrency and want full 
                decentralization.
              </li>
              <li class="mb-2">
                <strong>Choose Web2</strong> if you're new to crypto or prefer traditional login methods.
              </li>
            </ul>

            <v-alert type="info" variant="tonal">
              <strong>Note:</strong> You can always switch between modes later in your account settings!
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="showHelp = false">
            Got it!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </div>
  </LandingBackground>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import LandingBackground from '@/components/ui/LandingBackground.vue';
import AuthChoiceCard from './components/AuthChoiceCard.vue';
import AuthChoiceCardMobile from './components/AuthChoiceCardMobile.vue';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();

const showHelp = ref(false);
const isMobile = ref(false);

const { isDark } = useTheme();

const helpDialogCardStyle = computed(() => {
  if (isDark.value) {
    return {
      '--v-theme-surface': '#101827',
      '--v-theme-surface-variant': '#1d283a',
      'background-color': '#101827',
      color: '#e2e8f0',
    } as const;
  }

  return {
    '--v-theme-surface': '#ffffff',
    '--v-theme-surface-variant': '#f5f7fa',
    'background-color': '#ffffff',
    color: '#0f172a',
  } as const;
});

const web3Features = [
  'Wallet-first authentication',
  'Full decentralization',
  'Direct blockchain access',
  'Secure password protection',
  'Account recovery options',
];

const web2Features = [
  'Email/password login',
  'Social login (Google, Apple)',
  'Connect wallet later (optional)',
  'Easy account recovery',
  'Multi-device access',
];

const selectedCardComponent = computed(() =>
  isMobile.value ? AuthChoiceCardMobile : AuthChoiceCard
);

const handleWeb3Choice = () => {
  // Store preference
  localStorage.setItem('auth_mode', 'web3');
  router.push('/wallet-auth');
};

const handleWeb2Choice = () => {
  // Store preference
  localStorage.setItem('auth_mode', 'web2');
  router.push('/login');
};

let mediaQuery: MediaQueryList | null = null;

const evaluateViewport = () => {
  if (typeof window === 'undefined') {
    isMobile.value = false;
    return;
  }

  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(max-width: 768px)');
  }
  isMobile.value = mediaQuery.matches;
};

const handleMediaChange = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches;
};

onMounted(() => {
  evaluateViewport();
  if (mediaQuery) {
    mediaQuery.addEventListener('change', handleMediaChange);
  }
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange);
  }
});
</script>

<style lang="scss" scoped>
.auth-choice-page {
  min-height: 100vh;
  padding: 4rem 0;
  position: relative;
  z-index: 10;
  color: var(--erp-text);
}

:global(.dark-theme) .auth-choice-page {
  color: #f8fafc;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.auth-choice-page h1,
.auth-choice-page .text-h6 {
  color: inherit;
}

.auth-options {
  margin-top: 3rem;
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
  justify-items: center;
  gap: 2.5rem;
}

.auth-options :deep(.v-col) {
  width: 100%;
  max-width: 560px;
  padding: 0 !important;
  margin: 0;
  display: flex;
  justify-content: center;
}

.help-section {
  margin-bottom: 0;
}

.ecosystem-font {
  font-family: 'PIXymbols Very Loose W01 Reg', 'Poppins', sans-serif;
  letter-spacing: 0.08em;
}

.help-content {
  line-height: 1.6;
}

.help-content ul {
  padding-left: 1.5rem;
}

.help-content li {
  list-style-type: disc;
}

/* Responsive */
@media (max-width: 1200px) {
  .auth-options {
    gap: 2rem;
  }

  .help-section {
    margin-bottom: 3.5rem;
  }
}

@media (max-width: 768px) {
  .auth-choice-page {
    padding: 1.5rem 0;
  }

  .auth-options {
    margin-top: 1.5rem;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }

  .auth-options :deep(.v-col) {
    max-width: 100%;
  }

  .help-section {
    margin-bottom: 4.5rem;
  }
}

@media (min-width: 960px) {
  .auth-options {
    grid-template-columns: repeat(2, minmax(520px, 1fr));
  }

  .auth-options :deep(.v-col) {
    max-width: 580px;
  }
}

@media (max-width: 600px) {
  .auth-logo {
    width: 80px;
    height: 80px;
  }
}
</style>
