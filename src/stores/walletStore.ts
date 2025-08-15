import { ref } from 'vue';

// Reactive state for wallet
export const connectedWallet = ref('');
export const isWalletModalOpen = ref(false);

// Function to open wallet modal
export function openWalletModal() {
  isWalletModalOpen.value = true;
}
