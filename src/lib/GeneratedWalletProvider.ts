// src/lib/GeneratedWalletProvider.ts
import type {
  W3WalletProvider,
  WalletAccount,
  SignMetadata,
  SignDataResponse,
  WalletTransaction,
} from '@txnlab/use-wallet-vue';

/**
 * Minimal GeneratedWalletProvider used for dev/testing.
 * Replace signTxns / signData implementations with real signing logic when needed.
 */
export class GeneratedWalletProvider implements W3WalletProvider {
  private _account: WalletAccount;

  constructor(account: WalletAccount) {
    this._account = account;
  }

  // return a single account as a Promise (matches W3WalletProvider signatures)
  async account(): Promise<WalletAccount> {
    return this._account;
  }

  // connect returns list of accounts
  async connect(): Promise<WalletAccount[]> {
    return [this._account];
  }

  async disconnect(): Promise<void> {
    // no-op for generated wallet
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async accounts(): Promise<WalletAccount[]> {
    return [this._account];
  }

  /**
   * signTxns:
   * - should sign provided transactions and return an array of base64-encoded signed transactions or nulls.
   * - here we provide a placeholder that returns nulls (no actual signing).
   */
  async signTxns(transactions: WalletTransaction[]): Promise<(string | null)[]> {
    // TODO: replace with real signing logic (use algosdk to sign, then encode to base64)
    return transactions.map(() => null);
  }

  /**
   * signData:
   * - returns a SignDataResponse matching the types in @txnlab/use-wallet-vue
   * - signer must be Uint8Array, domain is a string per library typing
   */
  async signData(
    data: string,
    _metadata?: SignMetadata
  ): Promise<SignDataResponse> {
    return {
      signature: new Uint8Array(), // placeholder empty signature
      data,
      // signer must be Uint8Array: encode the address text to bytes
      signer: new TextEncoder().encode(this._account.address),
      // domain is a string in the current types
      domain: '',
      authenticatorData: new Uint8Array(),
    };
  }
}
