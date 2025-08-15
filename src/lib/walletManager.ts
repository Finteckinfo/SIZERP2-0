import {
  NetworkId,
  WalletId,
  type SupportedWallet,
  type WalletConnectOptions,
  useWallet
} from '@txnlab/use-wallet-vue';
import { GeneratedWalletProvider } from './GeneratedWalletProvider';
import type { WalletAccount } from '@txnlab/use-wallet-vue';

const local = typeof window !== 'undefined' && localStorage.getItem('generated-wallet');
const customGeneratedWallet: SupportedWallet[] = local
  ? [
      {
        id: WalletId.CUSTOM,
        options: {
          provider: new GeneratedWalletProvider(JSON.parse(local) as WalletAccount),
        },
        metadata: {
          name: 'Generated Wallet',
          icon: '/algorand-logo.svg',
        },
      }
    ]
  : [];

export const wallets: SupportedWallet[] = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
  {
    id: WalletId.LUTE,
    options: { siteName: 'Sizland' },
  },
  {
    id: WalletId.WALLETCONNECT,
    options: {
      projectId: 'ca6bb8f4043b588e05597964fc1bcbb7',
      metadata: {
        name: 'Sizland',
        description: 'SizLand ERP',
        url: 'https://sizerp-2-0.vercel.app/',
        icons: ['https://sizerp-2-0.vercel.app/favicon.svg'],
      },
    } satisfies WalletConnectOptions,
  },
  ...customGeneratedWallet,
];

export const networks = {
  [NetworkId.TESTNET]: {
    name: 'Testnet',
    algod: { baseServer: 'https://testnet-api.algonode.cloud', port: '', token: '' },
    indexer: { baseServer: 'https://testnet-idx.algonode.cloud', port: '', token: '' },
    chainId: 'algorand:416001', // <-- CAIP-2 format
  },
  [NetworkId.MAINNET]: {
    name: 'MainNet',
    algod: { baseServer: 'https://mainnet-api.algonode.cloud', port: '', token: '' },
    indexer: { baseServer: 'https://mainnet-idx.algonode.cloud', port: '', token: '' },
    chainId: 'algorand:4160', // <-- CAIP-2 format
  },
};

// WalletManager instance

// Hook to use in components
export function useWalletStore() {
  
  return useWallet();
}
