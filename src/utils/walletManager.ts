import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet';

export const walletManager = new WalletManager({
  wallets: [WalletId.DEFLY, WalletId.PERA, WalletId.WALLETCONNECT],
  defaultNetwork: NetworkId.TESTNET, // or NetworkId.MAINNET
});