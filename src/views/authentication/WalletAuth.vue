<template>
  <LandingBackground>
    <div class="wallet-auth-page">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
          <!-- Step 1: Initial Choice (New vs Existing Wallet) -->
          <v-card
            v-if="currentStep === 'choice'"
            elevation="8"
            class="auth-card pa-8"
            :style="authCardStyle"
          >
            <div class="text-center mb-6">
              <div class="logo-container mb-4">
                <img src="/images/sizlogo.png" alt="SIZ Logo" class="auth-logo" />
              </div>
              <h1 class="text-h4 font-weight-bold mb-3 ecosystem-font">
                Web3 Authentication
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Do you have an existing wallet or would you like to create a new one?
              </p>
            </div>

            <!-- New Wallet Option -->
            <v-card
              class="wallet-choice-card new-wallet mb-4"
              elevation="4"
              @click="handleNewWallet"
            >
              <v-card-text class="pa-6">
                <div class="d-flex align-items-center">
                  <div class="choice-icon-container mr-4">
                    <v-icon size="48" color="white">mdi-wallet-plus</v-icon>
                  </div>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1 text-white">Create New Wallet</h3>
                    <p class="text-body-2 mb-0 text-white">
                      Generate a secure wallet with recovery options
                    </p>
                  </div>
                  <v-icon size="32" color="white">mdi-chevron-right</v-icon>
                </div>
              </v-card-text>
            </v-card>

            <!-- Existing Wallet Option -->
            <v-card
              class="wallet-choice-card existing-wallet"
              elevation="4"
              @click="handleExistingWallet"
            :style="existingWalletCardStyle"
            >
              <v-card-text class="pa-6">
                <div class="d-flex align-items-center">
                  <div class="choice-icon-container existing mr-4">
                    <v-icon size="48" color="primary">mdi-wallet</v-icon>
                  </div>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1">Connect Existing Wallet</h3>
                    <p class="text-body-2 mb-0 text-medium-emphasis">
                      Use Pera, Defly, or WalletConnect
                    </p>
                  </div>
                  <v-icon size="32" color="grey">mdi-chevron-right</v-icon>
                </div>
              </v-card-text>
            </v-card>

            <!-- Back to Auth Choice -->
            <div class="text-center mt-6">
              <v-btn
                variant="text"
                color="grey"
                @click="router.push('/auth-choice')"
              >
                <v-icon start>mdi-arrow-left</v-icon>
                Back to authentication methods
              </v-btn>
            </div>
          </v-card>

          <!-- Step 2: Create New Wallet -->
          <v-card
            v-if="currentStep === 'create'"
            elevation="8"
            class="auth-card pa-8"
            :style="authCardStyle"
          >
            <div class="text-center mb-6">
              <v-icon size="64" color="success" class="mb-3">mdi-wallet-plus</v-icon>
              <h2 class="text-h5 font-weight-bold mb-2">Create New Wallet</h2>
              <p class="text-body-2 text-medium-emphasis">
                Your wallet will be generated securely in your browser
              </p>
            </div>

            <v-alert v-if="createError" type="error" variant="tonal" class="mb-4">
              {{ createError }}
            </v-alert>

            <v-btn
              color="primary"
              size="large"
              block
              @click="generateNewWallet"
              :loading="isGenerating"
              :disabled="isGenerating"
            >
              <v-icon start>mdi-creation</v-icon>
              {{ isGenerating ? 'Generating...' : 'Generate Wallet' }}
            </v-btn>

            <v-btn
              variant="text"
              block
              class="mt-3"
              @click="currentStep = 'choice'"
              :disabled="isGenerating"
            >
              Back
            </v-btn>
          </v-card>

          <!-- Step 3: Display Mnemonic -->
          <v-card
            v-if="currentStep === 'mnemonic'"
            elevation="8"
            class="auth-card pa-8"
            :style="authCardStyle"
          >
            <div class="text-center mb-6">
              <v-icon size="64" color="warning" class="mb-3">mdi-key-variant</v-icon>
              <h2 class="text-h5 font-weight-bold mb-2">Save Your Recovery Phrase</h2>
              <p class="text-body-2 text-medium-emphasis">
                Write down these words in order. You'll need them to recover your wallet.
              </p>
            </div>

            <v-alert type="warning" variant="tonal" class="mb-4">
              <strong>Important:</strong> Never share your recovery phrase with anyone!
            </v-alert>

            <!-- Mnemonic Display -->
            <v-card
              variant="outlined"
              class="mnemonic-card mb-4"
              :style="mnemonicCardStyle"
            >
              <v-card-text class="pa-4">
                <div class="mnemonic-grid">
                  <div
                    v-for="(word, index) in mnemonicWords"
                    :key="index"
                    class="mnemonic-word"
                  >
                    <span class="word-number">{{ index + 1 }}.</span>
                    <span class="word-text">{{ word }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Confirmation Checkbox -->
            <v-checkbox
              v-model="mnemonicConfirmed"
              color="primary"
              label="I have written down my recovery phrase"
              hide-details
              class="mb-4"
            />

            <v-btn
              color="primary"
              size="large"
              block
              @click="currentStep = 'password'"
              :disabled="!mnemonicConfirmed"
            >
              Continue
            </v-btn>

            <v-btn
              variant="text"
              block
              class="mt-3"
              @click="cancelWalletCreation"
            >
              Cancel
            </v-btn>
          </v-card>

          <!-- Step 4: Set Password -->
          <v-card
            v-if="currentStep === 'password'"
            elevation="8"
            class="auth-card pa-8"
            :style="authCardStyle"
          >
            <div class="text-center mb-6">
              <v-icon size="64" color="primary" class="mb-3">mdi-lock</v-icon>
              <h2 class="text-h5 font-weight-bold mb-2">Set Wallet Password</h2>
              <p class="text-body-2 text-medium-emphasis">
                Create a password to protect your wallet for future logins
              </p>
            </div>

            <v-alert v-if="passwordError" type="error" variant="tonal" class="mb-4">
              {{ passwordError }}
            </v-alert>

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              variant="outlined"
              :rules="[rules.required, rules.minLength]"
              class="mb-3"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              :rules="[rules.required, rules.match]"
              class="mb-4"
            />

            <!-- Password Strength Indicator -->
            <div class="mb-4">
              <div class="text-caption mb-1">Password Strength:</div>
              <v-progress-linear
                :model-value="passwordStrength"
                :color="passwordStrengthColor"
                height="8"
                rounded
              />
            </div>

            <v-btn
              color="primary"
              size="large"
              block
              @click="savePassword"
              :disabled="!isPasswordValid"
            >
              Continue
            </v-btn>

            <v-btn
              variant="text"
              block
              class="mt-3"
              @click="currentStep = 'mnemonic'"
            >
              Back
            </v-btn>
          </v-card>

          <!-- Step 5: Security Questions -->
          <v-card
            v-if="currentStep === 'security'"
            elevation="8"
            class="auth-card pa-8"
            :style="authCardStyle"
          >
            <div class="text-center mb-6">
              <v-icon size="64" color="info" class="mb-3">mdi-help-circle</v-icon>
              <h2 class="text-h5 font-weight-bold mb-2">Security Questions</h2>
              <p class="text-body-2 text-medium-emphasis">
                Set up recovery questions to help recover your account
              </p>
            </div>

            <v-alert v-if="securityError" type="error" variant="tonal" class="mb-4">
              {{ securityError }}
            </v-alert>

            <div v-for="(qa, index) in securityQA" :key="index" class="mb-4">
              <v-select
                v-model="qa.questionId"
                :items="availableQuestions(index)"
                item-title="question"
                item-value="id"
                label="Select a question"
                variant="outlined"
                class="mb-2"
              />
              <v-text-field
                v-model="qa.answer"
                label="Your answer"
                variant="outlined"
                :rules="[rules.required]"
              />
            </div>

            <v-btn
              color="primary"
              size="large"
              block
              @click="saveSecurityQuestions"
              :loading="isSaving"
              :disabled="!areSecurityQuestionsValid || isSaving"
            >
              Complete Setup
            </v-btn>

            <v-btn
              variant="text"
              block
              class="mt-3"
              @click="currentStep = 'password'"
              :disabled="isSaving"
            >
              Back
            </v-btn>
          </v-card>

          <!-- Connect Existing Wallet Modal -->
          <ConnectWallet />
        </v-col>
      </v-row>
    </v-container>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccess" max-width="500" persistent>
      <v-card>
        <v-card-text class="text-center pa-8">
          <v-icon size="80" color="success" class="mb-4">mdi-check-circle</v-icon>
          <h2 class="text-h5 font-weight-bold mb-3">Wallet Created Successfully!</h2>
          <p class="text-body-1 mb-4">
            Your wallet has been set up and secured. You can now access the platform.
          </p>
          <v-btn
            color="primary"
            size="large"
            block
            @click="redirectToDashboard"
          >
            Go to Dashboard
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Toast Notifications -->
    <v-snackbar
      v-model="showToast"
      :timeout="3000"
      :color="toastColor"
      location="top"
    >
      {{ toastMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showToast = false">Close</v-btn>
      </template>
    </v-snackbar>
    </div>
  </LandingBackground>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import LandingBackground from '@/components/ui/LandingBackground.vue';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';
import { generateAlgorandWallet } from '@/lib/algorand/walletGenerator';
import { encryptWallet, storeEncryptedWallet } from '@/services/walletEncryption';
import { 
  storeSecurityAnswers, 
  SECURITY_QUESTIONS, 
  type SecurityQuestion 
} from '@/services/securityQuestions';
import { isWalletModalOpen } from '@/stores/walletStore';
import { addManualWallet } from '@/lib/walletManager';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const { isDark } = useTheme();

const authCardStyle = computed(() => {
  if (isDark.value) {
    return {
      '--v-theme-surface': '#1a2332',
      'background-color': '#1a2332'
    };
  }
  return {
    '--v-theme-surface': '#ffffff',
    'background-color': '#ffffff'
  };
});

const existingWalletCardStyle = computed(() => {
  if (isDark.value) {
    return {
      '--v-theme-surface': '#1f2a3a',
      'background-color': '#1f2a3a'
    };
  }
  return {
    '--v-theme-surface': '#ffffff',
    'background-color': '#ffffff'
  };
});

const mnemonicCardStyle = computed(() => {
  if (isDark.value) {
    return {
      '--v-theme-surface': '#252f3f',
      'background-color': '#252f3f'
    };
  }
  return {
    '--v-theme-surface': 'rgba(91, 200, 91, 0.05)',
    'background-color': 'rgba(91, 200, 91, 0.05)'
  };
});

// State
type Step = 'choice' | 'create' | 'mnemonic' | 'password' | 'security';
const currentStep = ref<Step>('choice');
const isGenerating = ref(false);
const isSaving = ref(false);
const createError = ref('');
const passwordError = ref('');
const securityError = ref('');
const showSuccess = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('info');

// Wallet data
const generatedWallet = ref<any>(null);
const mnemonicWords = ref<string[]>([]);
const mnemonicConfirmed = ref(false);

// Password
const password = ref('');
const confirmPassword = ref('');

// Security Questions
const securityQA = ref<{ questionId: string; answer: string }[]>([
  { questionId: '', answer: '' },
  { questionId: '', answer: '' },
  { questionId: '', answer: '' }
]);

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (v: string) => v.length >= 12 || 'Password must be at least 12 characters',
  hasUpperCase: (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  hasLowerCase: (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  hasNumber: (v: string) => /\d/.test(v) || 'Password must contain a number',
  hasSpecial: (v: string) => /[^a-zA-Z\d]/.test(v) || 'Password must contain a special character',
  match: (v: string) => v === password.value || 'Passwords must match'
};

// Password strength
const passwordStrength = computed(() => {
  const pass = password.value;
  if (!pass) return 0;
  
  let strength = 0;
  if (pass.length >= 8) strength += 25;
  if (pass.length >= 12) strength += 25;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25;
  if (/\d/.test(pass)) strength += 12.5;
  if (/[^a-zA-Z\d]/.test(pass)) strength += 12.5;
  
  return strength;
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 50) return 'error';
  if (passwordStrength.value < 75) return 'warning';
  return 'success';
});

const isPasswordValid = computed(() => {
  const pass = password.value;
  return (
    pass.length >= 12 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /\d/.test(pass) &&
    /[^a-zA-Z\d]/.test(pass) &&
    pass === confirmPassword.value
  );
});

// Available questions for each dropdown (excluding already selected)
const availableQuestions = (currentIndex: number) => {
  const selectedIds = securityQA.value
    .map((qa, index) => index !== currentIndex ? qa.questionId : null)
    .filter(id => id !== null);
  
  return SECURITY_QUESTIONS.filter(q => !selectedIds.includes(q.id));
};

const areSecurityQuestionsValid = computed(() => {
  return securityQA.value.every(qa => qa.questionId && qa.answer.trim().length > 0);
});

// Handlers
const handleNewWallet = () => {
  currentStep.value = 'create';
};

const handleExistingWallet = () => {
  isWalletModalOpen.value = true;
  // Listen for wallet connection
  window.addEventListener('wallet-connected', handleExistingWalletConnected, { once: true });
};

const handleExistingWalletConnected = async (event: any) => {
  try {
    // Mark as Web3 authenticated
    localStorage.setItem('web3_authenticated', 'true');
    
    // Get wallet address for username
    const walletAddress = localStorage.getItem('active_wallet');
    if (walletAddress) {
      // Store user info with wallet address as identifier
      const userInfo = {
        authMethod: 'web3',
        walletAddress: walletAddress,
        username: `User-${walletAddress.substring(0, 8)}`,
        displayName: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
        createdAt: Date.now()
      };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
    
    toastMessage.value = 'Wallet connected successfully!';
    toastColor.value = 'success';
    showToast.value = true;
    
    // Redirect to dashboard
    setTimeout(() => {
      redirectToDashboard();
    }, 1000);
  } catch (error) {
    console.error('Error handling wallet connection:', error);
  }
};

const generateNewWallet = async () => {
  isGenerating.value = true;
  createError.value = '';

  try {
    // Generate wallet
    const wallet = generateAlgorandWallet();
    generatedWallet.value = wallet;
    mnemonicWords.value = wallet.mnemonic.split(' ');

    currentStep.value = 'mnemonic';
  } catch (error: any) {
    createError.value = error.message || 'Failed to generate wallet';
  } finally {
    isGenerating.value = false;
  }
};

const savePassword = async () => {
  if (!isPasswordValid.value) {
    passwordError.value = 'Please enter a valid password';
    return;
  }

  passwordError.value = '';
  currentStep.value = 'security';
};

const saveSecurityQuestions = async () => {
  if (!areSecurityQuestionsValid.value) {
    securityError.value = 'Please answer all security questions';
    return;
  }

  isSaving.value = true;
  securityError.value = '';

  try {
    // Store security answers
    await storeSecurityAnswers(securityQA.value);

    // Encrypt and store wallet
    if (generatedWallet.value && password.value) {
      const walletData = {
        mnemonic: generatedWallet.value.mnemonic,
        address: generatedWallet.value.address,
        createdAt: Date.now()
      };

      const encrypted = await encryptWallet(walletData, password.value);
      storeEncryptedWallet(encrypted);

      // Connect the wallet
      addManualWallet(generatedWallet.value.address);
    }

    // Mark as Web3 authenticated
    localStorage.setItem('web3_authenticated', 'true');
    
    // Store user info with wallet address
    if (generatedWallet.value) {
      const userInfo = {
        authMethod: 'web3',
        walletAddress: generatedWallet.value.address,
        username: `User-${generatedWallet.value.address.substring(0, 8)}`,
        displayName: `${generatedWallet.value.address.substring(0, 6)}...${generatedWallet.value.address.substring(generatedWallet.value.address.length - 4)}`,
        createdAt: Date.now()
      };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }

    showSuccess.value = true;
  } catch (error: any) {
    securityError.value = error.message || 'Failed to save security questions';
  } finally {
    isSaving.value = false;
  }
};

const cancelWalletCreation = () => {
  if (confirm('Are you sure you want to cancel? Your generated wallet will be lost.')) {
    generatedWallet.value = null;
    mnemonicWords.value = [];
    mnemonicConfirmed.value = false;
    currentStep.value = 'choice';
  }
};

const redirectToDashboard = () => {
  // Check for post-auth action
  const postAuthAction = localStorage.getItem('post_auth_action');
  
  if (postAuthAction === 'create_project') {
    localStorage.removeItem('post_auth_action');
    router.push('/projects/create');
  } else if (postAuthAction === 'join_project') {
    localStorage.removeItem('post_auth_action');
    router.push('/invitations');
  } else {
    // Default to main ERP dashboard
    router.push('/dashboard/default');
  }
};

// Watch for existing wallet connection from different path
watch(isWalletModalOpen, (isOpen) => {
  if (!isOpen && currentStep.value === 'choice') {
    // Check if wallet was connected
    const walletConnected = localStorage.getItem('active_wallet');
    if (walletConnected) {
      // Mark as Web3 authenticated and store user info
      localStorage.setItem('web3_authenticated', 'true');
      
      const userInfo = {
        authMethod: 'web3',
        walletAddress: walletConnected,
        username: `User-${walletConnected.substring(0, 8)}`,
        displayName: `${walletConnected.substring(0, 6)}...${walletConnected.substring(walletConnected.length - 4)}`,
        createdAt: Date.now()
      };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
      toastMessage.value = 'Wallet connected successfully!';
      toastColor.value = 'success';
      showToast.value = true;
      
      setTimeout(() => {
        redirectToDashboard();
      }, 1000);
    }
  }
});
</script>

<style lang="scss" scoped>
.wallet-auth-page {
  min-height: 100vh;
  padding: 4rem 0;
  position: relative;
  z-index: 10;
  color: var(--erp-text);
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-logo {
  width: 100px;
  height: 100px;
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

.auth-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.ecosystem-font {
  font-family: 'PIXymbols Very Loose W01 Reg', 'Poppins', sans-serif;
  letter-spacing: 0.08em;
}

:global(.dark-theme) .auth-card {
  background: #1a2332;
}

.wallet-choice-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
}

.wallet-choice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.wallet-choice-card.new-wallet {
  background: linear-gradient(135deg, #5BC85B 0%, #4BB74B 100%);
  border: none;
}

.wallet-choice-card.new-wallet:hover {
  background: linear-gradient(135deg, #4BB74B 0%, #3BA63B 100%);
}

.wallet-choice-card.existing-wallet {
  background: white;
  border: 2px solid rgba(91, 200, 91, 0.3);
}

:global(.dark-theme) .wallet-choice-card.existing-wallet {
  background: #2a3442;
  border-color: rgba(91, 200, 91, 0.5);
}

.choice-icon-container {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.choice-icon-container.existing {
  background: rgba(91, 200, 91, 0.1);
}

.mnemonic-card {
  background: rgba(91, 200, 91, 0.05);
}

:global(.dark-theme) .mnemonic-card {
  background: rgba(91, 200, 91, 0.1);
}

.mnemonic-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.mnemonic-word {
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

:global(.dark-theme) .mnemonic-word {
  background: #2a3442;
  border-color: rgba(255, 255, 255, 0.1);
}

.word-number {
  color: #5BC85B;
  font-weight: 600;
  margin-right: 0.5rem;
}

.word-text {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 600px) {
  .wallet-auth-page {
    padding: 1rem 0;
  }

  .auth-card {
    padding: 1.5rem !important;
  }

  .auth-logo {
    width: 80px;
    height: 80px;
  }

  .choice-icon-container {
    width: 48px;
    height: 48px;
  }

  .mnemonic-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
 