<script setup lang="ts">
import { ref } from 'vue';
import type { SupportedWallet } from '@txnlab/use-wallet-vue'; // ✅ type-only import
import { WalletId, useWallet } from '@txnlab/use-wallet-vue';
import { wallets as rawWallets, activeAccount, addManualWallet } from '@/lib/walletManager';
import { isWalletModalOpen as storeWalletModalOpen } from '@/stores/walletStore';

// Refs
const isWalletModalOpen = storeWalletModalOpen; // boolean ref
const showDisconnectConfirm = ref(false);

// Manual wallet
const manualWallet = ref<{ address: string; secret: string }>({ address: '', secret: '' });

// Ensure wallets array has proper TS type
const wallets: { id: WalletId; options?: any }[] = rawWallets.filter(
  (w): w is { id: WalletId; options?: any } => 'id' in w
);

// Wallet provider
const { connect, activeAccount: providerAccount } = useWallet() as any;

// Connect manual wallet
function connectManualWallet() {
  if (!manualWallet.value.address) return alert('Enter wallet address!');
  addManualWallet(manualWallet.value.address);
  isWalletModalOpen.value = false;
}

// Connect provider wallet
async function connectProviderWallet(walletId: WalletId) {
  try {
    await connect(walletId);
    if (providerAccount.value?.address) {
      addManualWallet(providerAccount.value.address);
      isWalletModalOpen.value = false;
    } else {
      alert('No accounts returned from wallet.');
    }
  } catch (e: any) {
    alert(e.message || 'Wallet connection failed.');
  }
}

// Disconnect wallet
function disconnectWallet() {
  activeAccount.value = null;
  showDisconnectConfirm.value = false;
}
</script>

<template>
  <v-dialog v-model="isWalletModalOpen.value" max-width="500">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold">
        Connect Wallet
      </v-card-title>

      <v-card-text>
        <!-- Manual Wallet -->
        <section class="mb-6">
          <h6 class="mb-2 text-subtitle-1 font-weight-medium">Manual Entry</h6>
          <v-text-field
            v-model="manualWallet.value.address"
            label="Wallet Address"
            outlined
            dense
            hide-details
          />
          <v-text-field
            v-model="manualWallet.value.secret"
            label="Mnemonic / Secret"
            type="password"
            outlined
            dense
            hide-details
          />
          <v-btn color="primary" class="mt-3" block @click="connectManualWallet">
            Connect Manual Wallet
          </v-btn>
        </section>

        <v-divider class="my-4"></v-divider>

        <!-- Provider Wallets -->
        <section>
          <h6 class="mb-3 text-subtitle-1 font-weight-medium">Wallet Providers</h6>
          <v-list>
            <v-list-item
              v-for="wallet in wallets"
              :key="wallet.id"
              class="wallet-option"
              @click="connectProviderWallet(wallet.id)"
            >
              <v-list-item-avatar size="40">
                <v-img :src="`/src/assets/images/wallets/${wallet.id}.png`" alt="wallet logo" />
              </v-list-item-avatar>
              <v-list-item-title class="font-weight-medium">{{ wallet.id }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </section>

        <!-- Disconnect confirm -->
        <v-dialog v-model="showDisconnectConfirm.value" max-width="300">
          <v-card class="rounded-lg">
            <v-card-title class="headline">Disconnect Wallet?</v-card-title>
            <v-card-actions>
              <v-btn color="grey" @click="showDisconnectConfirm.value = false">Cancel</v-btn>
              <v-btn color="red" @click="disconnectWallet">Disconnect</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="isWalletModalOpen.value = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.wallet-option {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.wallet-option:hover {
  background-color: #f5f5f5;
}
</style>
