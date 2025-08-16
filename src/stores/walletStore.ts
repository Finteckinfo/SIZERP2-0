// src/stores/walletStore.ts
import { ref, type Ref } from 'vue';

// Make sure TypeScript knows these are Refs
export const connectedWallet: Ref<string> = ref('');
export const isWalletModalOpen: Ref<boolean> = ref(false);

export function openWalletModal() {
  isWalletModalOpen.value = true;
}
export function closeWalletModal() {
  isWalletModalOpen.value = false;
}