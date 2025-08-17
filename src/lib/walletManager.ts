// src/lib/walletManager.ts
import { ref, watch } from 'vue';
import { WalletId, NetworkId, type SupportedWallet } from '@txnlab/use-wallet-vue';

// Tracks currently active wallet
export const activeAccount = ref<{ address: string } | null>(null);

// Log changes automatically
watch(activeAccount, (val) => {
  if (val) {
    console.log('Wallet connected:', val.address);
  } else {
    console.log('Wallet disconnected');
  }
});

// Wallet providers
export const wallets: SupportedWallet[] = [
  { id: WalletId.DEFLY },
  { id: WalletId.PERA },
  {
    id: WalletId.WALLETCONNECT,
    options: {
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string,
      metadata: {
        name: 'Sizland',
        description: 'Vue dApp with Algorand WalletConnect',
        url: 'https://sizerp-2-0.vercel.app/',
        icons: ['https://sizerp-2-0.vercel.app/favicon.ico'],
      },
    },
  },
];

// Networks config
export const networks: Record<NetworkId, {
  algod: { server: string; port: string };
  indexer: { server: string; port: string };
}> = {
  [NetworkId.MAINNET]: { algod: { server: 'https://mainnet-api.algonode.cloud', port: '' }, indexer: { server: 'https://mainnet-idx.algonode.cloud', port: '' } },
  [NetworkId.TESTNET]: { algod: { server: 'https://testnet-api.algonode.cloud', port: '' }, indexer: { server: 'https://testnet-idx.algonode.cloud', port: '' } },
  [NetworkId.BETANET]: { algod: { server: '', port: '' }, indexer: { server: '', port: '' } },
  [NetworkId.FNET]: { algod: { server: '', port: '' }, indexer: { server: '', port: '' } },
  [NetworkId.LOCALNET]: { algod: { server: '', port: '' }, indexer: { server: '', port: '' } },
};

// Add manual wallet
export function addManualWallet(address: string) {
  console.log('addManualWallet called with', address);
  activeAccount.value = { address };
}
// Remove manual wallet
export function removeManualWallet() {
  console.log('removeManualWallet called');
  activeAccount.value = null;
}