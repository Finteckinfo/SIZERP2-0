<template>
  <div 
    v-if="!walletConnected" 
    class="wallet-guard"
    :class="{ 'dark-theme': isDark }"
  >
    <v-container 
      fluid 
      class="fill-height"
      :class="{ 'dark-theme': isDark }"
    >
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card 
            elevation="0" 
            class="text-center pa-8"
            :class="{ 'dark-theme': isDark }"
          >
            <v-avatar size="80" color="warning" class="mb-6">
              <span class="text-h3">🔒</span>
            </v-avatar>
            
            <h2 class="text-h4 font-weight-bold mb-4">
              Wallet Required
            </h2>
            
            <p class="text-body-1 text-medium-emphasis mb-6">
              This page requires a connected wallet to access. Please connect your wallet to continue.
            </p>
            
            <!-- Debug info for development -->
            <div v-if="isDevelopment" class="text-left mb-4 p-3 bg-grey-lighten-4 rounded">
              <p class="text-caption font-weight-medium mb-2">Debug Info:</p>
              <p class="text-caption">Wallet Address: {{ walletAddress || 'None' }}</p>
              <p class="text-caption">Connection Status: {{ walletConnected ? 'Connected' : 'Disconnected' }}</p>
              <p class="text-caption">Active Account: {{ JSON.stringify(activeAccount) }}</p>
              
              <!-- Test buttons for debugging -->
              <div class="mt-3">
                <v-btn size="small" variant="outlined" @click="checkWalletStatus" class="mr-2">
                  Check Status
                </v-btn>
                <v-btn size="small" variant="outlined" @click="forceRefresh" class="mr-2">
                  Force Refresh
                </v-btn>
                <v-btn size="small" variant="outlined" @click="clearWallet" color="error">
                  Clear Wallet
                </v-btn>
              </div>
            </div>
            
            <v-btn
              color="primary"
              size="large"
              @click="handleOpenWalletModal"
              class="mb-4"
            >
              Connect Wallet
            </v-btn>
            
            <div class="text-center">
              <v-btn
                color="secondary"
                variant="text"
                @click="$router.push('/app')"
              >
                Back to Dashboard
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Connect Wallet Modal -->
    <ConnectWallet />
  </div>
  
  <div 
    v-else
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { connectedWallet, isWalletConnected, openWalletModal, getWalletStatus } from '@/stores/walletStore';
import { activeAccount, clearWalletConnection } from '@/lib/walletManager';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';

const { isDark } = useTheme();

// Check if wallet is connected
const walletConnected = computed(() => {
  return isWalletConnected.value;
});

// Get wallet address for debugging
const walletAddress = computed(() => {
  return connectedWallet.value;
});

// Check if we're in development mode
const isDevelopment = computed(() => {
  return import.meta.env.DEV;
});

// Open wallet modal
const handleOpenWalletModal = () => {
  openWalletModal();
};

// Debug logging
onMounted(() => {
  console.log('[WalletGuard] Component mounted');
  console.log('[WalletGuard] Initial wallet state:', {
    connected: walletConnected.value,
    address: walletAddress.value,
    activeAccount: activeAccount.value
  });
});

// Debug functions
const checkWalletStatus = () => {
  const status = getWalletStatus();
  console.log('[WalletGuard] Current wallet status:', status);
  alert(`Wallet Status:\nConnected: ${status.isWalletConnected}\nAddress: ${status.connectedWallet || 'None'}\nActive Account: ${JSON.stringify(status.activeAccount)}`);
};

const forceRefresh = () => {
  console.log('[WalletGuard] Force refreshing wallet state');
  // Force a reactive update by accessing the computed values
  walletConnected.value;
  walletAddress.value;
  alert('Wallet state refreshed. Check console for details.');
};

const clearWallet = () => {
  console.log('[WalletGuard] Clearing wallet connection');
  clearWalletConnection();
  alert('Wallet connection cleared. You should now see the locked page.');
};
</script>

<style scoped>
.wallet-guard {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}
</style>
