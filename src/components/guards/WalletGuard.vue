<template>
  <div v-if="!walletConnected" class="wallet-guard">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="0" class="text-center pa-8">
            <v-avatar size="80" color="warning" class="mb-6">
              <span class="text-h3">🔒</span>
            </v-avatar>
            
            <h2 class="text-h4 font-weight-bold mb-4">
              Wallet Required
            </h2>
            
            <p class="text-body-1 text-medium-emphasis mb-6">
              This page requires a connected wallet to access. Please connect your wallet to continue.
            </p>
            
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
                @click="$router.push('/dashboard/default')"
              >
                Back to Dashboard
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { connectedWallet, openWalletModal } from '@/stores/walletStore';

// Check if wallet is connected
const walletConnected = computed(() => {
  return connectedWallet.value !== '';
});

// Open wallet modal
const handleOpenWalletModal = () => {
  openWalletModal();
};
</script>

<style scoped>
.wallet-guard {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}
</style>
