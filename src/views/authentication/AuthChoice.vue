<template>
  <div class="auth-choice-page" :class="{ 'dark-theme': isDark }">
    <!-- Theme Toggle -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>

    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="logo-container mb-4">
              <img src="/images/sizlogo.png" alt="SIZ Logo" class="auth-logo" />
            </div>
            <h1 class="text-h3 font-weight-bold mb-3">
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
              <v-card
                class="auth-option-card web3-card"
                elevation="8"
                @click="handleWeb3Choice"
              >
                <v-card-text class="pa-8">
                  <div class="option-header mb-4">
                    <div class="icon-container web3-icon mb-4">
                      <v-icon size="72" color="white">mdi-wallet</v-icon>
                    </div>
                    <div class="d-flex align-items-center justify-center mb-2">
                      <h2 class="text-h4 font-weight-bold mr-2 text-white">Web3 Mode</h2>
                      <v-chip color="success" size="small" variant="elevated">
                        Recommended for Crypto Users
                      </v-chip>
                    </div>
                  </div>

                  <v-list class="feature-list bg-transparent">
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="white">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-white">Wallet-first authentication</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="white">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-white">Full decentralization</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="white">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-white">Direct blockchain access</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="white">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-white">Secure password protection</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="white">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-white">Account recovery options</v-list-item-title>
                    </v-list-item>
                  </v-list>

                  <v-btn
                    color="white"
                    variant="elevated"
                    size="large"
                    block
                    class="mt-6"
                    @click.stop="handleWeb3Choice"
                  >
                    <v-icon start>mdi-wallet-plus</v-icon>
                    Continue with Wallet
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Web2 Traditional Authentication -->
            <v-col cols="12" md="6">
              <v-card
                class="auth-option-card web2-card"
                elevation="8"
                @click="handleWeb2Choice"
              >
                <v-card-text class="pa-8">
                  <div class="option-header mb-4">
                    <div class="icon-container web2-icon mb-4">
                      <v-icon size="72" color="primary">mdi-account-circle</v-icon>
                    </div>
                    <div class="d-flex align-items-center justify-center mb-2">
                      <h2 class="text-h4 font-weight-bold mr-2">Web2 Mode</h2>
                      <v-chip color="info" size="small" variant="elevated">
                        Familiar & Easy
                      </v-chip>
                    </div>
                  </div>

                  <v-list class="feature-list">
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Email/password login</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Social login (Google, GitHub)</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Connect wallet later (optional)</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Easy account recovery</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Multi-device access</v-list-item-title>
                    </v-list-item>
                  </v-list>

                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    class="mt-6"
                    @click.stop="handleWeb2Choice"
                  >
                    <v-icon start>mdi-login</v-icon>
                    Continue with Email/Social
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Help Section -->
          <div class="text-center mt-8">
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
      <v-card>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';

const router = useRouter();
const { isDark } = useTheme();

const showHelp = ref(false);

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
</script>

<style lang="scss" scoped>
.auth-choice-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.auth-choice-page.dark-theme {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.theme-toggle-container {
  position: fixed;
  top: 28px;
  right: 56px;
  z-index: 1000;
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
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.auth-options {
  margin-top: 3rem;
}

.auth-option-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 24px;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.auth-option-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.web3-card {
  background: linear-gradient(135deg, #5BC85B 0%, #4BB74B 100%);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.web3-card:hover {
  background: linear-gradient(135deg, #4BB74B 0%, #3BA63B 100%);
  box-shadow: 0 20px 40px rgba(91, 200, 91, 0.5);
}

.web2-card {
  background: white;
  border: 3px solid rgba(102, 126, 234, 0.3);
}

.dark-theme .web2-card {
  background: #1a2332;
  color: white;
}

.web2-card:hover {
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.icon-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.web3-icon {
  background: rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.web2-icon {
  background: rgba(102, 126, 234, 0.1);
}

.dark-theme .web2-icon {
  background: rgba(102, 126, 234, 0.2);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0);
  }
}

.feature-list {
  background: transparent;
}

.feature-list .v-list-item-title {
  font-size: 1rem;
  line-height: 1.5;
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
@media (max-width: 960px) {
  .auth-option-card {
    min-height: auto;
    margin-bottom: 2rem;
  }
}

@media (max-width: 600px) {
  .auth-choice-page {
    padding: 1rem 0;
  }

  .auth-logo {
    width: 80px;
    height: 80px;
  }

  .theme-toggle-container {
    top: 15px;
    right: 15px;
  }

  .icon-container {
    width: 80px;
    height: 80px;
  }

  .auth-option-card {
    margin-bottom: 1.5rem;
  }
}
</style>
