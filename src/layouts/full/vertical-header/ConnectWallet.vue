<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useUser } from '@clerk/vue';
import { connectedWallet, isWalletModalOpen } from '@/stores/walletStore';

// Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Manual wallet form
const manualWallet = ref({ address: '', secret: '' });

// User info
const { user } = useUser();

// Wallet options (UI only)
interface WalletOption { name: string; img: string; }
const walletOptions: WalletOption[] = [
  { name: 'Defly', img: '/src/assets/images/wallets/defly.png' },
  { name: 'Pera', img: '/src/assets/images/wallets/pera.png' },
  { name: 'WalletConnect', img: '/src/assets/images/wallets/walletconnect.png' },
];

// Sync wallet to DB
async function syncWallet(walletAddress: string) {
  try {
    const res = await axios.post(`${BACKEND_URL}/api/user/wallet`, {
      userId: user.value?.id,
      walletAddress,
    });

    connectedWallet.value = res.data.wallet;
    isWalletModalOpen.value = false;
    alert('Wallet connected and synced!');
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.error || 'Failed to connect wallet');
  }
}

// Manual wallet connect
async function connectManualWallet() {
  if (!manualWallet.value.address) {
    alert('Please enter wallet address.');
    return;
  }
  await syncWallet(manualWallet.value.address);
}

// Provider wallet connect (via WalletManager / Txn Labs)
async function connectProviderWallet(walletName: string) {
  // Example placeholder for WalletManager
  const fakeAddress = 'ALG-' + Math.random().toString(36).substring(2, 10);

  // Here you would replace `fakeAddress` with the actual WalletManager address
  await syncWallet(fakeAddress);
}
</script>

<template>
  <v-dialog v-model="isWalletModalOpen" max-width="500">
    <v-card>
      <v-card-title class="headline">Connect Wallet</v-card-title>
      <v-card-text>
        <!-- Manual Wallet -->
        <div class="mb-4">
          <v-text-field v-model="manualWallet.address" label="Wallet Address" outlined dense />
          <v-text-field v-model="manualWallet.secret" label="Mnemonic / Secret" type="password" outlined dense />
          <v-btn color="primary" class="mt-2" @click="connectManualWallet">
            Connect Manual Wallet
          </v-btn>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Provider Wallets -->
        <div>
          <h6>Select a wallet provider:</h6>
          <v-list>
            <v-list-item
              v-for="wallet in walletOptions"
              :key="wallet.name"
              class="d-flex align-center"
              @click="connectProviderWallet(wallet.name)"
              style="cursor: pointer;"
            >
              <v-list-item-avatar><v-img :src="wallet.img" alt="wallet logo" /></v-list-item-avatar>
              <v-list-item-title>{{ wallet.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="isWalletModalOpen = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-list-item:hover { background-color: #f5f5f5; }
</style>
