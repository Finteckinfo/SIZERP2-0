import { ref, watch } from 'vue';
import { WalletId, NetworkId, type SupportedWallet } from '@txnlab/use-wallet-vue';
import type { AlgodTokenHeader, BaseHTTPClient, CustomTokenHeader } from 'algosdk';

// Tracks currently active wallet
export const activeAccount = ref<{ address: string } | null>(null);

// Log changes automatically
watch(activeAccount, (val) => {
  if (val) console.log('[walletManager] Wallet connected:', val.address);
  else console.log('[walletManager] Wallet disconnected');
});

// Wallet providers
import deflyIcon from '@/assets/images/wallets/defly.png';
import peraIcon from '@/assets/images/wallets/pera.png';
import wcIcon from '@/assets/images/wallets/walletconnect.png';

export const wallets: SupportedWallet[] = [
  {
    id: WalletId.DEFLY,
    options: { shouldShowSignTxnToast: false },
    metadata: { name: 'Defly', icon: deflyIcon },
  },
  {
    id: WalletId.PERA,
    options: { shouldShowSignTxnToast: false },
    metadata: { name: 'Pera', icon: peraIcon },
  },
  {
    id: WalletId.WALLETCONNECT,
    options: {
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
      metadata: {
        name: 'Sizland',
        description: 'Vue dApp with Algorand WalletConnect',
        url: 'https://sizerp-2-0.vercel.app/',
        icons: [wcIcon],
      },
    } as any,
    metadata: { name: 'WalletConnect', icon: wcIcon },
  },
];

// Network configurations
export const networks: Record<NetworkId, {
  algod: { server: string; port: string; token: string | AlgodTokenHeader | CustomTokenHeader | BaseHTTPClient; baseServer: string };
  indexer: { server: string; port: string | number; token: string | AlgodTokenHeader | CustomTokenHeader | BaseHTTPClient; baseServer: string; headers?: Record<string, string> };
  chainId?: string;
}> = {
  [NetworkId.MAINNET]: {
    algod: { server: 'https://mainnet-api.algonode.cloud', port: '443', token: '', baseServer: 'https://mainnet-api.algonode.cloud' },
    indexer: { server: 'https://mainnet-idx.algonode.cloud', port: '443', token: '', baseServer: 'https://mainnet-idx.algonode.cloud' },
    chainId: 'algorand:4160',
  },
  [NetworkId.TESTNET]: {
    algod: { server: 'https://testnet-api.algonode.cloud', port: '443', token: '', baseServer: 'https://testnet-api.algonode.cloud' },
    indexer: { server: 'https://testnet-idx.algonode.cloud', port: '443', token: '', baseServer: 'https://testnet-idx.algonode.cloud' },
    chainId: 'algorand:416001',
  },
  [NetworkId.BETANET]: {
    algod: { server: 'https://betanet-api.algonode.cloud', port: '443', token: '', baseServer: 'https://betanet-api.algonode.cloud' },
    indexer: { server: 'https://betanet-idx.algonode.cloud', port: '443', token: '', baseServer: 'https://betanet-idx.algonode.cloud' },
    chainId: 'algorand:416002',
  },
  [NetworkId.FNET]: {
    algod: { server: 'https://finnet-api.algonode.cloud', port: '443', token: '', baseServer: 'https://finnet-api.algonode.cloud' },
    indexer: { server: 'https://finnet-idx.algonode.cloud', port: '443', token: '', baseServer: 'https://finnet-idx.algonode.cloud' },
    chainId: 'algorand:416003',
  },
  [NetworkId.LOCALNET]: {
    algod: { server: 'http://localhost:4001', port: '4001', token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', baseServer: 'http://localhost:4001' },
    indexer: { server: 'http://localhost:8980', port: '8980', token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', baseServer: 'http://localhost:8980' },
    chainId: 'algorand:local',
  },
};

// Manual wallet management
export function addManualWallet(address: string) {
  console.log('[walletManager] addManualWallet called with', address);
  activeAccount.value = { address };
}

export function removeManualWallet() {
  console.log('[walletManager] removeManualWallet called');
  activeAccount.value = null;
}

export function isWalletConnected(): boolean {
  const connected = activeAccount.value !== null;
  console.log('[walletManager] isWalletConnected =', connected);
  return connected;
}
