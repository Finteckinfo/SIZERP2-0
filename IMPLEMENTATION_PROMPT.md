# Prompt ya Kuunda SIZ Token Balance Component kwa SIZERP2-0

## Lengo
Kuunda komponenti inayosoma na kuonyesha mizani ya SIZ token katika SIZERP2-0 ERP application kwa kutumia muundo sawa na ile iliyotumika katika https://www.siz.land/wallet.

## Muundo wa Aplikesheni ya SIZERP2-0

### Technology Stack
- **Framework**: Vue 3 (Composition API)
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Wallet Integration**: `@txnlab/use-wallet-vue` (v4.3.1)
- **Algorand SDK**: `algosdk` (v3.5.2)
- **Build Tool**: Vite

### Structure ya Files
- **Source Directory**: `src/`
- **Views**: `src/views/dashboards/default/`
- **Components**: `src/views/dashboards/default/components/`
- **Services**: `src/services/`
- **Stores**: `src/stores/`
- **Lib**: `src/lib/`

### Dashboard Route
- **Path**: `/dashboard/default`
- **Component**: `src/views/dashboards/default/DefaultDashboard.vue`
- **URL**: `https://erp.siz.land/dashboard/default`

---

## Mambo ya Kuzingatia Katika Ujenzi

### 1. Muundo wa Siz.land Application

**Location ya Reference Code:**
- `c:\Users\user1\Pictures\next-web3-template-main\src\components\ui\walletBalance.tsx`
- `c:\Users\user1\Pictures\next-web3-template-main\src\lib\config.ts`

**Key Components:**
- `WalletBalance` - Component kuu ya kuonyesha mizani
- `fetchAccountInfo()` - Function ya kupata taarifa za akaunti
- `getSizAssetId()` - Function ya kupata SIZ Asset ID kwa network
- `formatSizTokenAmount()` - Function ya kuweka kiasi kwa muundo unaofaa

### 2. Muundo wa SIZERP2-0

**Existing Wallet Integration:**
- Wallet management iko katika: `src/lib/walletManager.ts`
- Wallet store iko katika: `src/stores/walletStore.ts`
- `useWallet()` hook inapatikana kutoka `@txnlab/use-wallet-vue`
- Networks zimeundwa tayari: Mainnet, Testnet, Betanet, Fnet, Localnet

**Existing Components Pattern:**
- Tumia Vuetify 3 components (`v-card`, `v-btn`, `v-chip`, nk)
- Tumia Composition API na `<script setup lang="ts">`
- Tumia CSS variables za theming (`var(--erp-card-bg)`, `var(--erp-text)`, nk)
- Components ziko katika folder ya `components/` ndani ya dashboard

### 3. Configuration Inayohitajika

**SIZ Token Asset IDs:**
```typescript
// Mainnet
const SIZ_ASSET_ID_MAINNET = 3186560531;

// Testnet  
const SIZ_TOKEN_ASSET_ID_TESTNET = 739030083;
```

**Network Configuration:**
- Networks zimeundwa tayari katika `src/lib/walletManager.ts`
- Inatumia `NetworkId.MAINNET` na `NetworkId.TESTNET` kutoka `@txnlab/use-wallet-vue`

---

## Maagizo ya Ujenzi

### Hatua ya 1: Kuunda Config File

**File**: `src/lib/sizTokenConfig.ts`

```typescript
import { NetworkId } from '@txnlab/use-wallet-vue';

// SIZ Token Asset IDs kwa kila network
export const SIZ_ASSET_IDS: Record<NetworkId, number> = {
  [NetworkId.MAINNET]: 3186560531,
  [NetworkId.TESTNET]: 739030083,
  [NetworkId.BETANET]: 0, // Tafadhali ongeza ikiwa unahitaji
  [NetworkId.FNET]: 0, // Tafadhali ongeza ikiwa unahitaji
  [NetworkId.LOCALNET]: 0, // Tafadhali ongeza ikiwa unahitaji
};

// Function ya kupata SIZ Asset ID kwa network
export function getSizAssetId(networkId: NetworkId): number {
  return SIZ_ASSET_IDS[networkId] || 0;
}

// Function ya kuweka kiasi cha SIZ token kwa muundo unaofaa
// SIZ tokens zina decimals 2, hivyo 100 base units = 1.00 SIZ
export function formatSizTokenAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}
```

### Hatua ya 2: Kuunda Service ya Wallet Balance

**File**: `src/services/sizTokenService.ts`

```typescript
import algosdk from 'algosdk';
import { NetworkId } from '@txnlab/use-wallet-vue';
import { getSizAssetId } from '@/lib/sizTokenConfig';

export interface AccountInfo {
  amount: number; // ALGO balance (microALGO)
  minBalance: number;
  assets: Array<{
    assetId: number;
    amount: number;
    name?: string;
    unitName?: string;
    decimals?: number;
  }>;
}

export interface SizTokenBalance {
  assetId: number;
  amount: number; // Base units
  formattedAmount: string; // Formatted for display (e.g., "1.00")
  name: string;
  unitName: string;
  decimals: number;
  found: boolean;
}

/**
 * Fetch account information from Algorand blockchain
 */
export async function fetchAccountInfo(
  walletAddress: string,
  networkId: NetworkId
): Promise<AccountInfo | null> {
  try {
    // Create Algorand client based on network
    const algodConfig = networkId === NetworkId.TESTNET
      ? { server: 'https://testnet-api.algonode.cloud', port: '', token: '' }
      : { server: 'https://mainnet-api.algonode.cloud', port: '', token: '' };

    const algod = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port);
    
    // Fetch account information
    const account = await algod.accountInformation(walletAddress).do();

    // Get SIZ asset ID for the network
    const sizAssetId = getSizAssetId(networkId);

    // Find SIZ asset in account assets
    const accountAssets = account.assets || [];
    const sizAsset = accountAssets.find(
      (asset: any) => Number(asset.assetId) === sizAssetId
    );

    // Fetch asset details
    let name = 'SIZ Token';
    let unitName = 'SIZ';
    let decimals = 0;
    
    if (sizAsset) {
      try {
        const assetInfo = await algod.getAssetByID(sizAssetId).do();
        name = assetInfo.params.name || 'SIZ Token';
        unitName = assetInfo.params.unitName || 'SIZ';
        decimals = assetInfo.params.decimals || 0;
      } catch (e) {
        console.warn('Failed to fetch asset details:', e);
      }
    }

    // Format assets array
    const formattedAssets = sizAsset ? [{
      assetId: sizAssetId,
      amount: Number(sizAsset.amount),
      name,
      unitName,
      decimals,
    }] : [];

    return {
      amount: Number(account.amount),
      minBalance: Number(account.minBalance || 0),
      assets: formattedAssets,
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    return null;
  }
}

/**
 * Get SIZ token balance for a wallet
 */
export async function getSizTokenBalance(
  walletAddress: string,
  networkId: NetworkId
): Promise<SizTokenBalance | null> {
  const accountInfo = await fetchAccountInfo(walletAddress, networkId);
  
  if (!accountInfo) {
    return null;
  }

  const sizAsset = accountInfo.assets[0];
  const sizAssetId = getSizAssetId(networkId);

  if (!sizAsset) {
    return {
      assetId: sizAssetId,
      amount: 0,
      formattedAmount: '0.00',
      name: 'SIZ Token',
      unitName: 'SIZ',
      decimals: 0,
      found: false,
    };
  }

  return {
    assetId: sizAsset.assetId,
    amount: sizAsset.amount,
    formattedAmount: (sizAsset.amount / 100).toFixed(2),
    name: sizAsset.name || 'SIZ Token',
    unitName: sizAsset.unitName || 'SIZ',
    decimals: sizAsset.decimals || 0,
    found: true,
  };
}
```

### Hatua ya 3: Kuunda Vue Component

**File**: `src/views/dashboards/default/components/SizTokenBalance.vue`

**Mfano wa Component:**

```vue
<template>
  <v-card elevation="0" class="siz-token-balance-card">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon size="24" color="primary" class="mr-3">mdi-coin</v-icon>
      <span class="text-h6">SIZ Token Balance</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        variant="text"
        @click="refreshBalance"
        :loading="loading"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Not Connected State -->
      <div v-if="!isWalletConnected" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-wallet-off</v-icon>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Connect your wallet to view SIZ token balance
        </p>
        <v-btn color="primary" @click="openWalletModal">
          Connect Wallet
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="text-body-2 text-medium-emphasis mt-4">Loading balance...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-4">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" variant="outlined" @click="refreshBalance">
          Retry
        </v-btn>
      </div>

      <!-- Balance Display -->
      <div v-else-if="tokenBalance" class="balance-display">
        <!-- Network Badge -->
        <div class="mb-4">
          <v-chip
            size="small"
            :color="networkId === NetworkId.MAINNET ? 'success' : 'warning'"
            class="mb-2"
          >
            <v-icon start size="16">{{ networkId === NetworkId.MAINNET ? 'mdi-network' : 'mdi-test-tube' }}</v-icon>
            {{ networkId === NetworkId.MAINNET ? 'Mainnet' : 'Testnet' }}
          </v-chip>
        </div>

        <!-- Balance Amount -->
        <div class="text-center mb-4">
          <div class="text-h3 font-weight-bold mb-2" style="color: var(--erp-accent-green);">
            {{ tokenBalance.formattedAmount }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ tokenBalance.unitName }} Tokens
          </div>
        </div>

        <!-- Token Details -->
        <v-divider class="my-4"></v-divider>
        <div class="token-details">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Token Name:</span>
            <span class="text-body-2 font-weight-medium">{{ tokenBalance.name }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Asset ID:</span>
            <span class="text-body-2 font-weight-medium font-mono">{{ tokenBalance.assetId }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-body-2 text-medium-emphasis">Wallet Address:</span>
            <span class="text-body-2 font-weight-medium font-mono text-truncate" style="max-width: 120px;">
              {{ walletAddress.slice(0, 8) }}...{{ walletAddress.slice(-8) }}
            </span>
          </div>
        </div>

        <!-- No Tokens Message -->
        <v-alert
          v-if="!tokenBalance.found"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          No SIZ tokens found in this wallet. You may need to opt-in to the SIZ token.
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useWallet, NetworkId } from '@txnlab/use-wallet-vue';
import { connectedWallet, isWalletConnected, isWalletModalOpen } from '@/stores/walletStore';
import { getSizTokenBalance, type SizTokenBalance } from '@/services/sizTokenService';

// Wallet hooks
const { activeNetwork } = useWallet();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const tokenBalance = ref<SizTokenBalance | null>(null);

// Computed
const walletAddress = computed(() => connectedWallet.value || '');
const networkId = computed(() => activeNetwork.value?.networkId || NetworkId.MAINNET);

// Functions
const refreshBalance = async () => {
  if (!isWalletConnected.value || !walletAddress.value) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const balance = await getSizTokenBalance(walletAddress.value, networkId.value);
    tokenBalance.value = balance;
  } catch (err) {
    console.error('Error fetching SIZ token balance:', err);
    error.value = 'Failed to load SIZ token balance. Please try again.';
  } finally {
    loading.value = false;
  }
};

const openWalletModal = () => {
  isWalletModalOpen.value = true;
};

// Watch for wallet connection changes
watch([isWalletConnected, networkId], () => {
  if (isWalletConnected.value) {
    refreshBalance();
  } else {
    tokenBalance.value = null;
    error.value = null;
  }
}, { immediate: true });

// Refresh on mount if wallet is already connected
onMounted(() => {
  if (isWalletConnected.value) {
    refreshBalance();
  }
});
</script>

<style scoped>
.siz-token-balance-card {
  background: var(--erp-card-bg) !important;
  color: var(--erp-text) !important;
  border: 1px solid var(--erp-border) !important;
}

.balance-display {
  min-height: 200px;
}

.token-details {
  padding: 8px 0;
}
</style>
```

### Hatua ya 4: Kuongeza Component kwenye Dashboard

**File**: `src/views/dashboards/default/DefaultDashboard.vue`

**Ongeza kwenye template (baada ya Quick Actions section):**

```vue
<!-- SIZ Token Balance Widget -->
<v-row class="mb-6">
  <v-col cols="12" md="4">
    <SizTokenBalance />
  </v-col>
</v-row>
```

**Ongeza import kwenye script:**

```typescript
import SizTokenBalance from './components/SizTokenBalance.vue';
```

---

## Mambo ya Kuzingatia

### 1. Theming
- Tumia CSS variables zilizopo:
  - `var(--erp-card-bg)` - Background ya cards
  - `var(--erp-text)` - Rangi ya maandishi
  - `var(--erp-border)` - Rangi ya mipaka
  - `var(--erp-accent-green)` - Rangi ya accent kwa SIZ token

### 2. Network Selection
- Component inapaswa kuonyesha network iliyochaguliwa
- Inapaswa kufanya refresh automatik wakati network inabadilika
- Mainnet na Testnet zina Asset IDs tofauti

### 3. Error Handling
- Handle kesi za wallet isiyo-unganishwa
- Handle kesi za network errors
- Handle kesi za token isiyo-patikanayo katika wallet

### 4. Performance
- Cache balance results kwa muda mfupi
- Tumia loading states kwa UX nzuri
- Avoid unnecessary API calls

### 5. Responsive Design
- Component inapaswa kuwa responsive
- Tumia Vuetify grid system (`v-row`, `v-col`)
- Test kwenye devices tofauti

---

## Testing Checklist

- [ ] Component inaonyesha "Connect Wallet" wakati wallet haijaunganishwa
- [ ] Component inaonyesha loading state wakati inapata balance
- [ ] Component inaonyesha balance kwa usahihi wakati wallet imeunganishwa
- [ ] Component inaonyesha network badge (Mainnet/Testnet) kwa usahihi
- [ ] Component inafanya refresh automatik wakati network inabadilika
- [ ] Component inaonyesha error message kwa makosa ya network
- [ ] Component inaonyesha "No tokens" message wakati wallet haina SIZ tokens
- [ ] Component inaonyesha token details kwa usahihi (name, Asset ID, address)
- [ ] Formatting ya kiasi ni sahihi (2 decimal places)
- [ ] Component ni responsive kwenye devices tofauti

---

## Additional Resources

### Files ya Kumbukumbu
1. **Reference Component**: `c:\Users\user1\Pictures\next-web3-template-main\src\components\ui\walletBalance.tsx`
2. **Reference Config**: `c:\Users\user1\Pictures\next-web3-template-main\src\lib\config.ts`

### Documentation
- [@txnlab/use-wallet-vue Documentation](https://github.com/TxnLab/use-wallet)
- [Algorand SDK Documentation](https://developer.algorand.org/docs/sdks/javascript/)
- [Vuetify 3 Components](https://vuetifyjs.com/en/components/all/)

---

## Hitimisho

Kwa kufuata muundo huu, utaweza kuunda komponenti inayosoma na kuonyesha mizani ya SIZ token katika SIZERP2-0 kwa kutumia muundo sawa na ile ya siz.land, lakini iliyobadilishwa kuwa na Vue 3 na Vuetify 3.

**Muhimu:** Hakikisha unatumia muundo wa SIZERP2-0 (Vue 3, Vuetify, Composition API) na siyo muundo wa Next.js/React kutoka siz.land application.

