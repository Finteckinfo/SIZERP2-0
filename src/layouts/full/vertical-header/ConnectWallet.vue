<script setup lang="ts">
import { ref, watch, type Ref, onMounted } from 'vue';
import { WalletId } from '@txnlab/use-wallet-vue';
import { wallets as rawWallets, activeAccount, addManualWallet, removeManualWallet } from '@/lib/walletManager';
import { isWalletModalOpen as storeWalletModalOpen } from '@/stores/walletStore';

// Wallet SDKs - using dynamic imports to avoid require issues
let DeflyConnect: any = null;
let PeraWalletConnect: any = null;
let WalletConnectProvider: any = null;

// Modal visibility
const isWalletModalOpen = storeWalletModalOpen as Ref<boolean>;
const showDisconnectConfirm = ref(false);

// Manual wallet input
const manualWallet = ref<{ address: string; secret: string }>({ address: '', secret: '' });

// Filter wallets for UI iteration
const wallets = rawWallets.filter(
  (w): w is { id: WalletId; metadata: { name: string; icon: string }; options?: any } =>
    typeof w === 'object' && w !== null && 'id' in w
);

// Watchers for logging
watch(isWalletModalOpen, val => console.log('[ConnectWallet] Wallet modal visibility:', val));
watch(activeAccount, val => console.log('[ConnectWallet] Active account changed:', val));
watch(manualWallet, val => console.log('[ConnectWallet] Manual wallet changed:', val));

// Initialize wallet libraries
onMounted(async () => {
  try {
    // Dynamic imports to avoid require issues
    const deflyModule = await import('@blockshake/defly-connect');
    DeflyConnect = deflyModule.connect ?? deflyModule.default ?? deflyModule;
    
    const peraModule = await import('@perawallet/connect');
    PeraWalletConnect = peraModule.PeraWalletConnect;
    
    const wcModule = await import('@walletconnect/web3-provider');
    WalletConnectProvider = wcModule.default;
    
    console.log('[ConnectWallet] Wallet libraries loaded successfully');
  } catch (error) {
    console.error('[ConnectWallet] Failed to load wallet libraries:', error);
  }
});

// --- Connect Manual Wallet ---
function connectManualWallet() {
  console.log('[ConnectWallet] Attempting manual wallet connect', manualWallet.value);
  if (!manualWallet.value.address) return alert('Enter wallet address!');
  addManualWallet(manualWallet.value.address);
  console.log('[ConnectWallet] Manual wallet connected:', manualWallet.value.address);
  isWalletModalOpen.value = false;
}

// --- Connect Provider Wallet ---
async function connectProviderWallet(walletId: WalletId) {
  console.log('[ConnectWallet] Attempting provider wallet connect:', walletId);

  try {
    if (walletId === WalletId.DEFLY) {
      if (!DeflyConnect) {
        throw new Error('Defly library not loaded');
      }
      const account = await DeflyConnect();
      if (account?.address) {
        addManualWallet(account.address);
        console.log('[ConnectWallet] Defly wallet connected:', account.address);
        isWalletModalOpen.value = false;
      }

    } else if (walletId === WalletId.PERA) {
      if (!PeraWalletConnect) {
        throw new Error('Pera library not loaded');
      }
      const pera = new PeraWalletConnect();
      const accounts = await pera.connect();
      if (accounts?.length) {
        addManualWallet(accounts[0]);
        console.log('[ConnectWallet] Pera wallet connected:', accounts[0]);
        isWalletModalOpen.value = false;
      }

    } else if (walletId === WalletId.WALLETCONNECT) {
      if (!WalletConnectProvider) {
        throw new Error('WalletConnect library not loaded');
      }
      const provider = new WalletConnectProvider({
        rpc: { 416001: 'https://testnet-api.algonode.cloud' },
        qrcode: true,
      });
      await provider.enable();
      const accounts = provider.accounts;
      if (accounts?.length) {
        addManualWallet(accounts[0]);
        console.log('[ConnectWallet] WalletConnect connected:', accounts[0]);
        isWalletModalOpen.value = false;
      }

    } else {
      alert('Unsupported wallet');
      console.warn('[ConnectWallet] Unsupported wallet:', walletId);
    }
  } catch (e: any) {
    console.error('[ConnectWallet] Provider wallet connect error:', e);
    alert(e?.message || 'Wallet connection failed.');
  }
}

// --- Disconnect Wallet ---
function disconnectWallet() {
  console.log('[ConnectWallet] Disconnecting wallet');
  removeManualWallet();
  showDisconnectConfirm.value = false;
}
</script>

<template>
  <v-dialog v-model="isWalletModalOpen" max-width="500" z-index="2000">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold">Connect Wallet</v-card-title>
      <v-card-text>
        <!-- Manual Wallet -->
        <section class="mb-6">
          <h6 class="mb-2 text-subtitle-1 font-weight-medium">Manual Entry</h6>
          <v-text-field v-model="manualWallet.address" label="Wallet Address" outlined dense hide-details />
          <v-text-field v-model="manualWallet.secret" label="Mnemonic / Secret" type="password" outlined dense hide-details />
          <v-btn color="primary" class="mt-3" block @click="connectManualWallet">Connect Manual Wallet</v-btn>
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
                <v-img :src="wallet.metadata.icon" alt="wallet logo" />
              </v-list-item-avatar>
              <v-list-item-title class="font-weight-medium">{{ wallet.metadata.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </section>

        <!-- Disconnect Confirmation -->
        <v-dialog v-model="showDisconnectConfirm" max-width="300">
          <v-card class="rounded-lg">
            <v-card-title class="headline">Disconnect Wallet?</v-card-title>
            <v-card-actions>
              <v-btn color="grey" @click="showDisconnectConfirm = false">Cancel</v-btn>
              <v-btn color="red" @click="disconnectWallet">Disconnect</v-btn>
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
</template>
