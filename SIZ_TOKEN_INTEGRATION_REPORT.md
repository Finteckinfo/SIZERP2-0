# Ripoti ya Uchambuzi: Jinsi Application Inavyosoma SIZ Token kwenye https://www.siz.land/wallet

## Muhtasari wa Muundo

Aplikesheni ya **siz.land** inatumia **Next.js** na **React** kuonyesha mizani ya SIZ token kwa kutumia teknolojia za Algorand blockchain.

---

## Muundo wa Components Zinazohusika

### 1. **WalletBalance Component** (`src/components/ui/walletBalance.tsx`)

**Jukumu kuu:** Komponenti ya mkuu inayosoma na kuonyesha mizani ya SIZ token

**Vitendaji vya muhimu:**
- `fetchAccountInfo()` - Inapata taarifa za akaunti kutoka Algorand blockchain
- `getSizAssetId()` - Inapata Asset ID ya SIZ token kwa network iliyochaguliwa (mainnet/testnet)
- `formatSizTokenAmount()` - Inaweka kiasi cha token kwa muundo unaofaa (gawanya kwa 100)

**Jinsi inavyofanya kazi:**
1. Inatumia `useWallet()` hook kutoka `@txnlab/use-wallet-react` kuunganisha na wallet
2. Inajenga Algorand client kwa network iliyochaguliwa (mainnet/testnet)
3. Inapata taarifa za akaunti kwa kutumia `algod.accountInformation()`
4. Inatafuta SIZ token katika assets za wallet kwa kulinganisha Asset ID
5. Inaonyesha kiasi cha SIZ token na taarifa zake (jina, unit name, decimals)

**Configuration:**
```typescript
// SIZ Asset IDs za networks tofauti
const SIZ_ASSET_IDS = {
  testnet: 739030083,
  mainnet: 3186560531
}
```

### 2. **WalletGenerator Component** (`src/components/ui/walletGenerator.tsx`)

**Jukumu kuu:** Kuunda wallet mpya za Algorand

**Vitendaji vya muhimu:**
- `generateAlgorandWallet()` - Kuunda account mpya
- `storeWallet()` - Kuhifadhi wallet kwenye localStorage

### 3. **Config Module** (`src/lib/config.ts`)

**Jukumu kuu:** Kufanya configuration ya networks na SIZ Asset IDs

**Sifa za muhimu:**
- `SIZ_ASSET_IDS` - Kamusi ya Asset IDs kwa kila network
- `ALGORAND_NETWORKS` - Configuration ya networks (mainnet, testnet)
  - Algod URLs
  - Indexer URLs
  - Chain IDs

### 4. **ARC-59 Integration** (`src/lib/algorand/arc59-send.ts`)

**Jukumu kuu:** Kuendesha ARC-0059 protocol kwa kupeleka SIZ tokens kwa watumiaji wasio-opted-in

**Vitendaji vya muhimu:**
- `claimSizFromInboxWithWallet()` - Kuchukua tokens kutoka inbox kwa kutumia wallet ya mtumiaji
- `sendSizViaArc59()` - Kupeleka tokens kwa kutumia ARC-0059 protocol

### 5. **Wallet Generator Library** (`src/lib/algorand/walletGenerator.ts`)

**Jukumu kuu:** Kuunda na kusimamia wallets za Algorand

**Vitendaji vya muhimu:**
- `generateAlgorandWallet()` - Kuunda wallet mpya
- `recoverAlgorandWallet()` - Kurejesha wallet kutoka mnemonic
- `storeWallet()` / `loadWallet()` - Kuhifadhi na kupakia wallet kutoka localStorage

---

## Packages Zinazohitajika

### Core Dependencies

1. **@txnlab/use-wallet-react** (v4.1.0)
   - Hook ya kusaidia kuunganisha na Algorand wallets
   - Hutoa `useWallet()` hook
   - Inasaidia Defly, Pera, WalletConnect, na custom wallets

2. **algosdk** (v3.3.1)
   - Algorand Software Development Kit
   - Kutengeneza na kuendesha transactions
   - Kuunda accounts na wallets
   - Kuwasiliana na Algorand networks

3. **@algorandfoundation/algokit-utils** (v9.1.2)
   - AlgoKit utilities za kusaidia development
   - `AlgorandClient` class kwa kuwasaidiana na blockchain
   - Inawezesha transaction signing na broadcasting

### Supporting Packages

4. **@clerk/nextjs** (v6.32.0)
   - Authentication na user management
   - Inatumika kuhifadhi user IDs na emails

5. **lucide-react** (v0.441.0)
   - Icons za UI

6. **next/router** (built-in)
   - Navigation kwa Next.js

### Network Configuration

**Algorand Networks:**
- **Mainnet**: `https://mainnet-api.algonode.cloud`
- **Testnet**: `https://testnet-api.algonode.cloud`

**SIZ Token Asset IDs:**
- **Mainnet**: `3186560531`
- **Testnet**: `739030083`

---

## Mchakato wa Kusoma SIZ Token

### Hatua za Kwanza

1. **Wallet Connection**
   ```typescript
   const { activeAccount, algodClient } = useWallet();
   ```
   - User huunganisha wallet yake (Defly, Pera, WalletConnect, au custom)

2. **Network Selection**
   ```typescript
   const [selectedNetwork, setSelectedNetwork] = useState<Network>('mainnet');
   ```
   - User anaweza kuchagua network (mainnet/testnet)

3. **Fetch Account Info**
   ```typescript
   const account = await algod.accountInformation(activeAccount.address).do();
   ```
   - Application inapata taarifa kamili za akaunti kutoka blockchain

4. **Find SIZ Asset**
   ```typescript
   const sizAssetId = getSizAssetId(selectedNetwork); // 3186560531 for mainnet
   const sizAsset = account.assets.find(
     asset => Number(asset.assetId) === sizAssetId
   );
   ```
   - Inatafuta SIZ token katika assets za wallet

5. **Fetch Asset Details**
   ```typescript
   const assetInfo = await algod.getAssetByID(sizAssetId).do();
   ```
   - Inapata taarifa za token (jina, unit name, decimals)

6. **Display Balance**
   ```typescript
   const amount = sizAsset ? Number(sizAsset.amount) : 0;
   const formatted = formatSizTokenAmount(amount); // amount / 100
   ```
   - Kiasi kinaonyeshwa kwenye UI baada ya kuweka kwa muundo unaofaa

### Formatting Logic

SIZ tokens zina decimals 2, hivyo:
- Kiasi cha msingi (base units): `100` = `1.00 SIZ tokens`
- Kiasi kilichoonyeshwa: `formatSizTokenAmount(100)` = `"1.00"`

---

## Muundo wa Data Flow

```
User Action (Connect Wallet)
    ↓
useWallet Hook (@txnlab/use-wallet-react)
    ↓
activeAccount.address obtained
    ↓
fetchAccountInfo() called
    ↓
Create Algorand Client (algosdk.Algodv2)
    ↓
Fetch account info from blockchain (algod.accountInformation())
    ↓
Search for SIZ Asset ID in account.assets array
    ↓
If found: Fetch asset details (name, unitName, decimals)
    ↓
Format amount (divide by 100 for 2 decimals)
    ↓
Display in UI (WalletBalance component)
```

---

## Maadili ya Mazingira (Environment Variables)

Aplikesheni inategemea environment variables zifuatazo:

```env
# ARC-0059 Configuration
NEXT_PUBLIC_ARC59_APP_ID=2449590623  # Mainnet
# NEXT_PUBLIC_ARC59_APP_ID=643020148  # Testnet

# SIZ Token Asset IDs
NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID=3186560531  # Mainnet
# NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID_TESTNET=739030083  # Testnet

# Central Wallet (for ARC-0059 operations)
NEXT_PUBLIC_CENTRAL_WALLET_ADDRESS=<wallet_address>
CENTRAL_WALLET_MNEMONIC=<mnemonic_phrase>
```

---

## Hitimisho

Aplikesheni ya siz.land inasoma SIZ tokens kwa:
1. Kuunganisha na Algorand wallet kwa kutumia `@txnlab/use-wallet-react`
2. Kuchagua network (mainnet/testnet)
3. Kupata taarifa za akaunti kutoka Algorand blockchain
4. Kutafuta SIZ token kwa kulinganisha Asset ID
5. Kuonyesha kiasi kwa muundo unaofaa (gawanya kwa 100)

Muundo huu unatumia teknolojia za kisasa za Algorand na inaweza kuwa na mtu mwingine kwa urahisi kwa kutumia muundo huo huo katika SIZERP2-0.


