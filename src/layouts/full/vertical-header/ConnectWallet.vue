<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useWallet, WalletId } from '@txnlab/use-wallet-vue';
import { addManualWallet, removeManualWallet } from '@/lib/walletManager';
import { activeAccount as walletManagerAccount } from '@/lib/walletManager';
import { isWalletModalOpen as storeWalletModalOpen } from '@/stores/walletStore';
import { useUser } from '@clerk/vue';
import { generateAlgorandWallet, storeWallet } from '@/lib/algorand/walletGenerator';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Wallet hook from @txnlab/use-wallet-vue
const walletHook = useWallet();
const { wallets, activeAccount, activeWallet, isReady } = walletHook;

// Make activeAccount available globally for walletStore fallback
if (typeof window !== 'undefined') {
  (window as any).__useWalletActiveAccount = activeAccount;
  watch(activeAccount, (newVal) => {
    (window as any).__useWalletActiveAccount = newVal;
  });
}

// Get Clerk user
const { user } = useUser();

// Modal visibility - use the store ref directly
const isWalletModalOpen = storeWalletModalOpen;
const showDisconnectConfirm = ref(false);
const showCreateWallet = ref(false);

// Wallet generation state
const isGenerating = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const toastMsg = ref('');
const showToast = ref(false);
const copied = ref(false);

// Listen for custom event to show create wallet
onMounted(() => {
  window.addEventListener('show-create-wallet', () => {
    // Instead of showing modal, redirect to unified wallet auth flow
    router.push('/wallet-auth');
    isWalletModalOpen.value = false;
  });
});

// Manual wallet input
const manualWallet = ref<{ address: string }>({ address: '' });

// Sync useWallet activeAccount with walletManager - This ensures state is shared across all components
watch(activeAccount, (newAccount) => {
  console.log('[ConnectWallet] Active account changed:', newAccount);
  if (newAccount?.address) {
    // Sync to walletManager for persistence and cross-component access
    walletManagerAccount.value = { address: newAccount.address };
    console.log('[ConnectWallet] Synced activeAccount to walletManager:', newAccount.address);
    // Dispatch custom event for components that might be listening
    window.dispatchEvent(new CustomEvent('wallet-connected', { 
      detail: { address: newAccount.address } 
    }));
  } else {
    // Clear walletManager if disconnected
    walletManagerAccount.value = null;
    console.log('[ConnectWallet] Cleared walletManager activeAccount');
    // Dispatch disconnect event
    window.dispatchEvent(new CustomEvent('wallet-disconnected'));
  }
}, { immediate: true });

// Watchers for logging
watch(isWalletModalOpen, (val) => {
  console.log('[ConnectWallet] Wallet modal visibility changed:', val);
  console.log('[ConnectWallet] isWalletModalOpen value:', isWalletModalOpen.value);
}, { immediate: true });

// Sync wallet to backend
async function postWalletToExternalDB(walletAddress: string) {
  console.log('🔍 [Wallet] Starting postWalletToExternalDB with:', {
    walletAddress,
    userId: user.value?.id ? `${user.value.id.substring(0, 8)}...` : 'undefined'
  });

  if (!user.value?.id) {
    console.log('⚠️ [Wallet] No user available, skipping external DB post');
    return;
  }

  try {
    const requestBody = {
      userId: user.value.id,
      walletAddress
    };
    
    console.log('🔍 [Wallet] Making API call to /api/user/wallet with body:', {
      userId: `${user.value.id.substring(0, 8)}...`,
      walletAddress
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/api/user/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔍 [Wallet] API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ [Wallet] API error response:', errorText);
      // Don't throw - just log the error
      return;
    }

    const data = await response.json();
    console.log('✅ [Wallet] API success response:', data);
    console.log('✅ [Wallet] Wallet address posted to external database successfully');
  } catch (error) {
    console.error('❌ [Wallet] Error posting wallet to external database:', {
      message: error instanceof Error ? error.message : String(error),
      userId: user.value?.id ? `${user.value.id.substring(0, 8)}...` : 'undefined',
      walletAddress
    });
    // Don't throw - just log the error
  }
}

// Connect wallet using useWallet hook
async function connectWallet(walletId: WalletId) {
  if (!wallets.value || !Array.isArray(wallets.value)) {
    console.error('[ConnectWallet] Wallets not available');
    toastMsg.value = 'Wallets are not ready yet. Please try again.';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    return;
  }

  const wallet = wallets.value.find(w => w.id === walletId);
  if (!wallet) {
    console.error('[ConnectWallet] Wallet not found:', walletId);
    toastMsg.value = 'Wallet provider not found.';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    return;
  }

  try {
    console.log('[ConnectWallet] Attempting to connect wallet:', walletId);
    await wallet.connect();
    console.log('[ConnectWallet] Wallet connected successfully');
    
    // Wait a bit for activeAccount to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sync to walletManager (watch should handle this, but ensure it's synced)
    if (activeAccount.value?.address) {
      walletManagerAccount.value = { address: activeAccount.value.address };
      console.log('[ConnectWallet] Synced wallet to walletManager after connection');
      
      // Post wallet address to external database after successful connection
      console.log('🔍 [Wallet] Wallet connected, posting address to external DB:', activeAccount.value.address);
      await postWalletToExternalDB(activeAccount.value.address);
    } else {
      console.log('⚠️ [Wallet] Wallet connected but no active account address available');
    }
    
    isWalletModalOpen.value = false;
    toastMsg.value = 'Wallet connected successfully!';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
  } catch (err: any) {
    console.error('Wallet connect error:', err);

    const canceled =
      err?.data?.type === 'CONNECT_MODAL_CLOSED' ||
      err?.message?.includes('cancelled') ||
      err?.message === 'Operation Cancelled' ||
      err?.message?.includes('User rejected');

    toastMsg.value = canceled
      ? 'Wallet connection was cancelled.'
      : err?.message || 'Failed to connect wallet. Try again.';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
  }
}

// Generate new wallet
async function handleGenerateWallet() {
  isGenerating.value = true;
  error.value = null;
  success.value = null;

  try {
    // Generate wallet
    const wallet = generateAlgorandWallet();
    console.log('✅ [Create Wallet] Wallet generated successfully:', wallet.address);
    
    // Store wallet locally
    storeWallet(wallet);
    console.log('✅ [Create Wallet] Wallet stored locally');

    // Auto-connect using manual wallet method since CUSTOM provider might not be available
    try {
      // Use addManualWallet to connect the generated wallet
      addManualWallet(wallet.address);
      console.log('✅ [Create Wallet] Generated wallet connected via manual method');
      
      // Post wallet address to external database after successful connection
      if (wallet.address) {
        console.log('🔍 [Create Wallet] Generated wallet connected, posting address to external DB:', wallet.address);
        await postWalletToExternalDB(wallet.address);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('wallet-connected', { 
          detail: { address: wallet.address } 
        }));
      }
    } catch (connectError) {
      console.error('🔍 [Create Wallet] Failed to connect generated wallet:', connectError);
      // Don't throw error here as wallet was still generated successfully
    }

    // Notify that a wallet has been generated
    window.dispatchEvent(new CustomEvent('walletGenerated'));
    
    success.value = 'Wallet generated successfully!';
    
    // Close modals
    isWalletModalOpen.value = false;
    showCreateWallet.value = false;
    
    // Show success message briefly before redirect
    setTimeout(() => {
      // Redirect to a new wallet page or just close
      // router.push('/new-wallet');
    }, 1500);
    
  } catch (err: any) {
    console.error('Wallet generation failed:', err);
    error.value = err?.message || 'Failed to generate wallet. Please try again.';
  } finally {
    isGenerating.value = false;
  }
}

// Connect manual wallet (by address only)
async function connectManualWallet() {
  console.log('[ConnectWallet] Attempting manual wallet connect', manualWallet.value);
  if (!manualWallet.value.address) {
    toastMsg.value = 'Please enter wallet address!';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    return;
  }
  
  // Validate address format (basic check)
  if (manualWallet.value.address.length !== 58) {
    toastMsg.value = 'Invalid wallet address format!';
    showToast.value = true;
    setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    return;
  }
  
  // Sync to backend first
  await postWalletToExternalDB(manualWallet.value.address);
  
  // Add manual wallet - this will update walletManager.activeAccount
  addManualWallet(manualWallet.value.address);
  console.log('[ConnectWallet] Manual wallet connected:', manualWallet.value.address);
  
  // Manually sync to useWallet activeAccount by dispatching event
  // The watcher will pick this up, but we also dispatch event for immediate notification
  window.dispatchEvent(new CustomEvent('wallet-connected', { 
    detail: { address: manualWallet.value.address } 
  }));
  
  isWalletModalOpen.value = false;
  toastMsg.value = 'Wallet connected successfully!';
  showToast.value = true;
  setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
}

// Handle disconnect
async function handleDisconnect() {
  if (activeWallet.value) {
    try {
      await activeWallet.value.disconnect();
      console.log('[ConnectWallet] Wallet disconnected via hook');
    } catch (err) {
      console.error('[ConnectWallet] Error disconnecting via hook:', err);
      // Fallback to manual removal
      removeManualWallet();
    }
  } else {
    removeManualWallet();
  }
  // The watcher will dispatch 'wallet-disconnected' event automatically
  showDisconnectConfirm.value = false;
  isWalletModalOpen.value = false;
  toastMsg.value = 'Wallet disconnected';
  showToast.value = true;
  setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
}

// Copy address
async function handleCopyAddress() {
  if (activeAccount.value?.address) {
    try {
      await navigator.clipboard.writeText(activeAccount.value.address);
      copied.value = true;
      toastMsg.value = 'Address copied to clipboard!';
      showToast.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
      setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      toastMsg.value = 'Failed to copy address';
      showToast.value = true;
      setTimeout(() => { showToast.value = false; toastMsg.value = ''; }, 3000);
    }
  }
}

// Shorten address for display
const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
</script>

<template>
  <!-- Toast Message - Only show when there's a message -->
  <v-snackbar
    v-if="toastMsg"
    v-model="showToast"
    :timeout="3000"
    color="info"
    location="top"
  >
    {{ toastMsg }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="showToast = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>

  <!-- Main Wallet Connect Dialog -->
  <v-dialog v-model="isWalletModalOpen" max-width="500" z-index="2000">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold d-flex align-center">
        <v-icon class="mr-2">mdi-wallet</v-icon>
        Connect Wallet
      </v-card-title>
      
      <v-card-text>
        <!-- Not Ready State -->
        <div v-if="!isReady" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <p class="text-body-2 text-medium-emphasis mt-4">Loading wallets...</p>
        </div>

        <!-- Connected State -->
        <div v-else-if="activeAccount" class="wallet-connected-state">
          <div class="text-center mb-4">
            <v-avatar size="64" color="success" class="mb-3">
              <v-icon size="32" color="white">mdi-check-circle</v-icon>
            </v-avatar>
            <h6 class="text-h6 mb-2">Wallet Connected</h6>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ shortenAddress(activeAccount.address) }}
            </p>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex flex-column gap-2">
            <v-btn
              variant="outlined"
              color="primary"
              @click="handleCopyAddress"
              block
            >
              <v-icon start>mdi-content-copy</v-icon>
              {{ copied ? 'Copied!' : 'Copy Address' }}
            </v-btn>
            
            <v-btn
              variant="outlined"
              color="error"
              @click="showDisconnectConfirm = true"
              block
            >
              <v-icon start>mdi-logout</v-icon>
              Disconnect
            </v-btn>
          </div>
        </div>

        <!-- Not Connected State - Wallet Options -->
        <div v-else>
          <!-- Siz Wallet Option (First and Primary) -->
          <section class="mb-4">
            <h6 class="mb-3 text-subtitle-1 font-weight-medium">Recommended</h6>
            <v-list class="pa-0">
              <v-list-item
                class="wallet-option mb-2 siz-wallet-option"
                @click="router.push('/wallet-auth'); isWalletModalOpen = false"
                :style="{ 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  border: '2px solid #5BC85B',
                  background: 'linear-gradient(135deg, rgba(91, 200, 91, 0.1) 0%, rgba(75, 183, 75, 0.05) 100%)'
                }"
              >
                <v-list-item-avatar size="40" class="mr-3">
                  <v-img src="/wallets/siz.png" alt="Siz Wallet logo" />
                </v-list-item-avatar>
                <v-list-item-title class="font-weight-bold" style="color: #5BC85B;">Siz Wallet</v-list-item-title>
                <v-list-item-subtitle class="text-caption">Create or connect your Siz wallet</v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon color="success">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </section>

          <v-divider class="my-4"></v-divider>

          <!-- Provider Wallets -->
          <section>
            <h6 class="mb-3 text-subtitle-1 font-weight-medium">Other Wallet Providers</h6>
            <div v-if="!wallets || wallets.length === 0" class="text-center py-4">
              <p class="text-body-2 text-medium-emphasis">No wallet providers available</p>
            </div>
            <v-list v-else class="pa-0">
              <v-list-item
                v-for="wallet in wallets"
                :key="wallet.id"
                class="wallet-option mb-2"
                @click="connectWallet(wallet.id)"
                :style="{ cursor: 'pointer', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)' }"
              >
                <v-list-item-avatar size="40" class="mr-3">
                  <v-img :src="wallet.metadata?.icon" alt="wallet logo" />
                </v-list-item-avatar>
                <v-list-item-title class="font-weight-medium">{{ wallet.metadata?.name || 'Unknown Wallet' }}</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </section>

          <v-divider class="my-4"></v-divider>

          <!-- Manual Entry -->
          <section class="mb-4">
            <h6 class="mb-3 text-subtitle-1 font-weight-medium">Connect Manually</h6>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Enter your Algorand wallet address (58 characters)
            </p>
            <v-text-field
              v-model="manualWallet.address"
              label="Wallet Address"
              variant="outlined"
              density="comfortable"
              placeholder="Enter your Algorand wallet address"
              :rules="[
                v => !!v || 'Wallet address is required',
                v => v.length === 58 || 'Wallet address must be 58 characters'
              ]"
              class="mb-2"
            />
            <v-btn
              color="primary"
              block
              @click="connectManualWallet"
              :disabled="!manualWallet.address || manualWallet.address.length !== 58"
            >
              <v-icon start>mdi-link</v-icon>
              Connect Manual Wallet
            </v-btn>
          </section>

          <v-divider class="my-4"></v-divider>

          <!-- Create New Wallet -->
          <section class="text-center">
            <p class="text-body-2 text-medium-emphasis mb-2">
              Don't have a wallet?
            </p>
            <v-btn
              variant="text"
              color="primary"
              @click="router.push('/wallet-auth'); isWalletModalOpen = false"
            >
              Create New Wallet
            </v-btn>
          </section>
        </div>

        <!-- Disconnect Confirmation -->
        <v-dialog v-model="showDisconnectConfirm" max-width="300">
          <v-card class="rounded-lg">
            <v-card-title class="headline">Disconnect Wallet?</v-card-title>
            <v-card-text>
              Are you sure you want to disconnect your wallet?
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" @click="showDisconnectConfirm = false">Cancel</v-btn>
              <v-btn color="error" @click="handleDisconnect">Disconnect</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="isWalletModalOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Wallet Dialog -->
  <v-dialog v-model="showCreateWallet" max-width="500" z-index="2001">
    <v-card class="rounded-xl">
      <v-card-title class="headline text-center">
        🎉 Create Your Sizland Wallet
      </v-card-title>
      <v-card-text>
        <p class="text-body-1 text-center text-medium-emphasis mb-4">
          Your wallet will be generated locally in your browser. Nothing is sent to a server.
        </p>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="success"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          {{ success }}
        </v-alert>

        <div class="d-flex flex-column gap-2 mt-4">
          <v-btn
            color="grey"
            variant="outlined"
            @click="showCreateWallet = false"
            :disabled="isGenerating"
            block
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleGenerateWallet"
            :disabled="isGenerating"
            :loading="isGenerating"
            block
          >
            <v-icon start>mdi-wallet-plus</v-icon>
            {{ isGenerating ? 'Generating...' : 'Generate Wallet' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.wallet-option:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease;
}

.wallet-connected-state {
  min-height: 200px;
}
</style>
