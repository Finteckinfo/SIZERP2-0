// src/stores/walletStore.ts
import { ref, type Ref } from 'vue';

// Tracks the connected wallet address (optional)
export const connectedWallet: Ref<string> = ref('');

// Controls the Connect Wallet modal
export const isWalletModalOpen: Ref<boolean> = ref(false);

export function openWalletModal() {
  console.log('openWalletModal called');
  isWalletModalOpen.value = true;
}

export function closeWalletModal() {
  console.log('closeWalletModal called');
  isWalletModalOpen.value = false;
}
export function setConnectedWallet(address: string) {
  console.log('setConnectedWallet called with address:', address);
  connectedWallet.value = address;
}