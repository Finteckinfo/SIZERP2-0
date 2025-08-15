<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useUser } from '@clerk/vue';
import { connectedWallet, isWalletModalOpen } from '@/stores/walletStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const manualWallet = ref({ address: '', secret: '' });
const { user } = useUser();

interface WalletOption { name: string; img: string; }
const walletOptions: WalletOption[] = [
  { name: 'Defly', img: '/src/assets/images/wallets/defly.png' },
  { name: 'Pera', img: '/src/assets/images/wallets/pera.png' },
  { name: 'WalletConnect', img: '/src/assets/images/wallets/walletconnect.png' },
];

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

async function connectManualWallet() {
  if (!manualWallet.value.address) {
    alert('Please enter wallet address.');
    return;
  }
  await syncWallet(manualWallet.value.address);
}

async function connectProviderWallet(walletName: string) {
  const fakeAddress = 'ALG-' + Math.random().toString(36).substring(2, 10);
  await syncWallet(fakeAddress);
}
</script>

<template>
  <v-dialog v-model="isWalletModalOpen" max-width="500">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold">
        Connect Your Wallet
      </v-card-title>

      <v-card-text>
        <!-- Manual Wallet -->
        <section class="mb-6">
          <h6 class="mb-2 text-subtitle-1 font-weight-medium">Manual Entry</h6>
          <v-text-field
            v-model="manualWallet.address"
            label="Wallet Address"
            outlined
            dense
            hide-details
          />
          <v-text-field
            v-model="manualWallet.secret"
            label="Mnemonic / Secret"
            type="password"
            outlined
            dense
            hide-details
          />
          <v-btn
            color="primary"
            class="mt-3"
            block
            @click="connectManualWallet"
          >
            Connect Manual Wallet
          </v-btn>
        </section>

        <v-divider class="my-4"></v-divider>

        <!-- Provider Wallets -->
        <section>
          <h6 class="mb-3 text-subtitle-1 font-weight-medium">Wallet Providers</h6>
          <v-list>
            <v-list-item
              v-for="wallet in walletOptions"
              :key="wallet.name"
              class="wallet-option"
              @click="connectProviderWallet(wallet.name)"
            >
              <v-list-item-avatar size="40">
                <v-img :src="wallet.img" alt="wallet logo" />
              </v-list-item-avatar>
              <v-list-item-title class="font-weight-medium">
                {{ wallet.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </section>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="isWalletModalOpen = false">
          Cancel
        </v-btn>
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
