<template>
  <div class="modern-settings">
    <!-- Hero Section -->
    <div class="settings-hero">
      <RetroGrid />
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="48" color="white">mdi-cog</v-icon>
        </div>
        <h1 class="hero-title">Settings</h1>
        <p class="hero-subtitle">Customize your experience and manage your account</p>
      </div>
    </div>

    <!-- Modern Tab Navigation -->
    <div class="settings-nav">
      <div class="nav-container">
        <div class="tab-nav">
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            <v-icon size="20">mdi-account-circle</v-icon>
            <span>Account</span>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'preferences' }"
            @click="activeTab = 'preferences'"
          >
            <v-icon size="20">mdi-tune</v-icon>
            <span>Preferences</span>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'wallet' }"
            @click="activeTab = 'wallet'"
          >
            <v-icon size="20">mdi-wallet</v-icon>
            <span>Wallet Account</span>
            <div class="tab-indicator"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="settings-content">
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeTab === 'account'" key="account" class="content-panel">
          <div class="panel-header">
            <h2>Account Management</h2>
            <p>Manage your profile, security settings, and connected accounts</p>
          </div>
          <div class="clerk-wrapper">
            <UserProfile
              routing="hash"
              :appearance="clerkAppearance"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'preferences'" key="preferences" class="content-panel">
          <div class="panel-header">
            <h2>Preferences</h2>
            <p>Customize how the app looks and behaves for you</p>
          </div>
          
          <div class="preferences-grid">
            <!-- Theme Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-palette</v-icon>
                <h3>Appearance</h3>
              </div>
              <div class="theme-options">
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'system' }"
                  @click="prefs.theme = 'system'"
                >
                  <v-icon size="32">mdi-monitor</v-icon>
                  <span>System</span>
                  <p>Follow system theme</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'light' }"
                  @click="prefs.theme = 'light'"
                >
                  <v-icon size="32">mdi-white-balance-sunny</v-icon>
                  <span>Light</span>
                  <p>Always light mode</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'dark' }"
                  @click="prefs.theme = 'dark'"
                >
                  <v-icon size="32">mdi-weather-night</v-icon>
                  <span>Dark</span>
                  <p>Always dark mode</p>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-bell</v-icon>
                <h3>Notifications</h3>
              </div>
              <div class="notification-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates via email</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyEmail" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>In-App Notifications</h4>
                    <p>Show notifications within the app</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyInApp" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Dashboard Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-view-dashboard</v-icon>
                <h3>Dashboard</h3>
              </div>
              <div class="dashboard-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Default Start Page</h4>
                    <p>Choose your landing page</p>
                  </div>
                  <v-select
                    v-model="prefs.startPage"
                    :items="startPages"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-calendar-clock</v-icon>
                <h3>Date & Time</h3>
              </div>
              <div class="datetime-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Date Format</h4>
                    <p>How dates are displayed</p>
                  </div>
                  <v-select
                    v-model="prefs.dateFormat"
                    :items="dateFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Time Format</h4>
                    <p>12-hour or 24-hour format</p>
                  </div>
                  <v-select
                    v-model="prefs.timeFormat"
                    :items="timeFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'wallet'" key="wallet" class="content-panel">
          <div class="panel-header">
            <h2>Wallet Account</h2>
            <p>Manage your Algorand wallet and SIZCOIN balance</p>
          </div>

          <div class="wallet-grid">
            <!-- Wallet Connection Status -->
            <div class="wallet-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-wallet</v-icon>
                <h3>Wallet Connection</h3>
              </div>

              <div v-if="isWalletConnected" class="wallet-connected">
                <v-alert type="success" variant="tonal" class="mb-4">
                  <div class="d-flex align-items-center">
                    <v-icon class="mr-2">mdi-check-circle</v-icon>
                    <span>Wallet Connected</span>
                  </div>
                </v-alert>

                <div class="wallet-details">
                  <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <div class="detail-value">
                      <code class="wallet-address">{{ connectedWallet }}</code>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click="copyAddress"
                        :title="copied ? 'Copied!' : 'Copy address'"
                      >
                        <v-icon size="18" :color="copied ? 'success' : 'default'">
                          {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
                        </v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Network:</span>
                    <span class="detail-value">
                      <v-chip :color="currentNetwork === 'mainnet' ? 'success' : 'warning'" size="small">
                        {{ currentNetwork === 'mainnet' ? 'MainNet' : 'TestNet' }}
                      </v-chip>
                    </span>
                  </div>
                </div>

                <div class="wallet-actions mt-4">
                  <v-btn color="error" variant="outlined" @click="handleDisconnect">
                    <v-icon start>mdi-logout</v-icon>
                    Disconnect Wallet
                  </v-btn>
                </div>
              </div>

              <div v-else class="wallet-disconnected">
                <v-alert type="info" variant="tonal" class="mb-4">
                  <div class="d-flex align-items-center">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    <span>No wallet connected</span>
                  </div>
                </v-alert>

                <p class="text-body-2 mb-4">
                  Connect your Algorand wallet to view your SIZCOIN balance and manage transactions.
                </p>

                <v-btn color="primary" variant="elevated" @click="handleConnect">
                  <v-icon start>mdi-wallet-plus</v-icon>
                  Connect Wallet
                </v-btn>
              </div>
            </div>

            <!-- SIZCOIN Balance (shown only when connected) -->
            <div v-if="isWalletConnected" class="wallet-section">
              <div class="section-header">
                <v-icon size="24" color="success">mdi-cash-multiple</v-icon>
                <h3>SIZCOIN Balance</h3>
              </div>

              <div class="balance-display">
                <div v-if="balanceLoading" class="text-center py-6">
                  <v-progress-circular indeterminate color="primary" />
                  <p class="text-body-2 mt-3">Loading balance...</p>
                </div>

                <div v-else-if="balanceError" class="text-center py-6">
                  <v-icon size="48" color="error">mdi-alert-circle</v-icon>
                  <p class="text-body-2 mt-3 text-error">{{ balanceError }}</p>
                  <v-btn size="small" variant="outlined" class="mt-3" @click="loadBalance">
                    <v-icon start>mdi-refresh</v-icon>
                    Retry
                  </v-btn>
                </div>

                <div v-else class="balance-content">
                  <div class="balance-main">
                    <span class="balance-amount">{{ formatAmount(sizBalance) }}</span>
                    <span class="balance-currency">SIZ</span>
                  </div>

                  <div class="balance-actions mt-4">
                    <v-btn size="small" variant="outlined" @click="loadBalance" :loading="balanceLoading">
                      <v-icon start>mdi-refresh</v-icon>
                      Refresh
                    </v-btn>
                    <v-btn size="small" variant="outlined" color="primary" :href="getExplorerAddressUrl(connectedWallet)" target="_blank">
                      <v-icon start>mdi-open-in-new</v-icon>
                      View on Explorer
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent SIZ Transactions (shown only when connected) -->
            <div v-if="isWalletConnected" class="wallet-section full-width">
              <div class="section-header">
                <v-icon size="24" color="info">mdi-history</v-icon>
                <h3>Recent SIZCOIN Transactions</h3>
              </div>

              <div v-if="transactionsLoading" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" />
                <p class="text-body-2 mt-3">Loading transactions...</p>
              </div>

              <div v-else-if="transactions.length === 0" class="text-center py-6">
                <v-icon size="48" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
                <p class="text-body-2 mt-3">No SIZCOIN transactions found</p>
              </div>

              <div v-else class="transactions-list">
                <div v-for="tx in transactions.slice(0, 5)" :key="tx.id" class="transaction-item">
                  <div class="tx-icon">
                    <v-icon :color="tx.type === 'receive' ? 'success' : 'error'" size="20">
                      {{ tx.type === 'receive' ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                    </v-icon>
                  </div>
                  <div class="tx-details">
                    <div class="tx-type">{{ tx.type === 'receive' ? 'Received' : 'Sent' }}</div>
                    <div class="tx-date">{{ formatDate(tx.timestamp) }}</div>
                  </div>
                  <div class="tx-amount">
                    <span :class="tx.type === 'receive' ? 'text-success' : 'text-error'">
                      {{ tx.type === 'receive' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} SIZ
                    </span>
                  </div>
                  <div class="tx-action">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :href="getExplorerTxUrl(tx.hash)"
                      target="_blank"
                      title="View on Explorer"
                    >
                      <v-icon size="18">mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div class="text-center mt-4">
                  <v-btn variant="outlined" size="small" @click="navigateToPayments">
                    View All Transactions
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- Connect Wallet Modal -->
  <ConnectWallet />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserProfile } from '@clerk/vue';
import { RetroGrid } from '@/components/ui/retro-grid';
import { connectedWallet, isWalletConnected, isWalletModalOpen } from '@/stores/walletStore';
import { removeManualWallet } from '@/lib/walletManager';
import { getAddressExplorerUrl, getExplorerUrl } from '@/services/paymentService';
import algosdk from 'algosdk';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const activeTab = ref('account');

// Wallet tab state
const copied = ref(false);
const currentNetwork = ref('testnet');
const sizBalance = ref(0);
const balanceLoading = ref(false);
const balanceError = ref('');
const transactions = ref<Array<{
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: string;
  hash: string;
}>>([]);
const transactionsLoading = ref(false);

const dateFormats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const timeFormats = ['24h', '12h'];
const startPages = [
  { title: 'Default Dashboard', value: '/dashboards/default' },
  { title: 'Projects', value: '/projects' },
  { title: 'Analytics', value: '/analytics' }
];

const prefs = ref({
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  notifyEmail: true,
  notifyInApp: true,
  startPage: '/dashboards/default'
});

const saveKey = 'app-user-preferences-v1';

onMounted(() => {
  try {
    const raw = localStorage.getItem(saveKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      prefs.value = { ...prefs.value, ...parsed };
    }
  } catch {}
  applyTheme();
  // React to OS theme changes when set to system
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => prefs.value.theme === 'system' && applyTheme());
  } catch {}
  
  // Check URL params for tab selection
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam === 'wallet') {
    activeTab.value = 'wallet';
    // Load wallet data if connected
    if (isWalletConnected.value) {
      loadBalance();
      loadTransactions();
    }
  }
});

const savePrefs = () => {
  try {
    localStorage.setItem(saveKey, JSON.stringify(prefs.value));
  } catch {}
};

// Theme application
const theme = useTheme();

const applyTheme = () => {
  if (prefs.value.theme === 'light') {
    theme.setTheme(false); // false = light mode
  } else if (prefs.value.theme === 'dark') {
    theme.setTheme(true); // true = dark mode
  } else {
    // system
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.setTheme(prefersDark);
  }
};

watch(() => prefs.value.theme, () => {
  applyTheme();
  savePrefs();
});

// Wallet tab functions
const handleConnect = () => {
  isWalletModalOpen.value = true;
};

const handleDisconnect = () => {
  if (confirm('Are you sure you want to disconnect your wallet?')) {
    removeManualWallet();
    sizBalance.value = 0;
    transactions.value = [];
  }
};

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(connectedWallet.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getExplorerAddressUrl = (address: string) => {
  return getAddressExplorerUrl(address);
};

const getExplorerTxUrl = (txHash: string) => {
  return getExplorerUrl(txHash);
};

const navigateToPayments = () => {
  router.push('/payments');
};

// Load SIZ balance from Algorand
const loadBalance = async () => {
  if (!connectedWallet.value) return;
  
  try {
    balanceLoading.value = true;
    balanceError.value = '';
    
    // Get current network
    currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
    
    // Connect to Algorand node
    const baseServer = currentNetwork.value === 'mainnet' 
      ? 'https://mainnet-api.algonode.cloud'
      : 'https://testnet-api.algonode.cloud';
    
    const algodClient = new algosdk.Algodv2('', baseServer, '');
    
    // Get account info
    const accountInfo = await algodClient.accountInformation(connectedWallet.value).do();
    
    // Find SIZ token balance
    // TODO: Replace with actual SIZCOIN asset ID
    const SIZ_ASSET_ID = 0; // Replace with real SIZCOIN asset ID
    
    if (SIZ_ASSET_ID === 0) {
      // Using ALGO for now (microAlgos to Algos)
      sizBalance.value = Number(accountInfo.amount) / 1000000;
    } else {
      // Find SIZ asset in account's assets
      const sizAsset = accountInfo.assets?.find((asset: any) => asset['asset-id'] === SIZ_ASSET_ID);
      sizBalance.value = sizAsset ? Number(sizAsset.amount) / 1000000 : 0; // Assuming 6 decimals
    }
    
    console.log('[Settings/Wallet] Balance loaded:', sizBalance.value);
    
  } catch (error: any) {
    console.error('[Settings/Wallet] Failed to load balance:', error);
    balanceError.value = error.message || 'Failed to load balance';
  } finally {
    balanceLoading.value = false;
  }
};

// Load SIZ transactions from Algorand
const loadTransactions = async () => {
  if (!connectedWallet.value) return;
  
  try {
    transactionsLoading.value = true;
    
    // Get current network
    currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
    
    // Connect to Algorand indexer
    const indexerServer = currentNetwork.value === 'mainnet'
      ? 'https://mainnet-idx.algonode.cloud'
      : 'https://testnet-idx.algonode.cloud';
    
    const indexerClient = new algosdk.Indexer('', indexerServer, '');
    
    // Get recent transactions for this address
    const txnResponse = await indexerClient
      .searchForTransactions()
      .address(connectedWallet.value)
      .limit(10)
      .do();
    
    // TODO: Filter for SIZ token transactions only
    const SIZ_ASSET_ID = 0; // Replace with real SIZCOIN asset ID
    
    if (txnResponse.transactions) {
      transactions.value = txnResponse.transactions
        .filter((tx: any) => {
          // If SIZ_ASSET_ID is 0, show ALGO transactions for now
          if (SIZ_ASSET_ID === 0) return tx['tx-type'] === 'pay';
          // Otherwise filter for asset transfers
          return tx['tx-type'] === 'axfer' && tx['asset-transfer-transaction']?.['asset-id'] === SIZ_ASSET_ID;
        })
        .map((tx: any) => {
          const isSender = tx.sender === connectedWallet.value;
          const amount = SIZ_ASSET_ID === 0 
            ? (tx['payment-transaction']?.amount || 0) / 1000000
            : (tx['asset-transfer-transaction']?.amount || 0) / 1000000;
          
          return {
            id: tx.id,
            type: isSender ? 'send' : 'receive',
            amount,
            timestamp: new Date((tx['round-time'] || 0) * 1000).toISOString(),
            hash: tx.id
          };
        });
    }
    
    console.log('[Settings/Wallet] Transactions loaded:', transactions.value.length);
    
  } catch (error: any) {
    console.error('[Settings/Wallet] Failed to load transactions:', error);
  } finally {
    transactionsLoading.value = false;
  }
};

// Watch wallet connection to load data
watch(isWalletConnected, (connected) => {
  if (connected && activeTab.value === 'wallet') {
    loadBalance();
    loadTransactions();
  }
});

// Watch active tab to load data when switching to wallet
watch(activeTab, (newTab) => {
  if (newTab === 'wallet' && isWalletConnected.value) {
    loadBalance();
    loadTransactions();
  }
});

// Clerk appearance - responsive styling with mobile popup behavior
const clerkAppearance = {
  variables: {
    colorBackground: 'transparent',
    colorText: 'var(--erp-text)',
    colorTextSecondary: 'var(--erp-text)',
    colorPrimary: 'var(--erp-accent-green)',
    borderRadius: '12px',
    fontFamily: 'inherit'
  },
  elements: {
    rootBox: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    card: {
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: 'none',
      background: 'transparent',
      border: 'none'
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'var(--erp-text)'
    },
    scrollBox: {
      maxWidth: '100%'
    },
    formFieldInput: {
      borderRadius: '8px',
      border: '1px solid var(--erp-border)',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)'
    },
    formFieldLabel: {
      color: 'var(--erp-text)'
    },
    socialButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    socialButton: {
      borderRadius: '8px',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)',
      border: '1px solid var(--erp-border)'
    }
  }
} as any;
</script>

<style scoped>
.modern-settings {
  min-height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

/* Hero Section */
.settings-hero {
  background: transparent;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1.5rem;
}

.hero-icon .v-icon {
  color: var(--erp-accent-green);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

/* Modern Tab Navigation */
.settings-nav {
  background: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.tab-nav {
  display: flex;
  gap: 0;
  position: relative;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--erp-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 140px;
  justify-content: center;
}

.tab-button:hover {
  color: var(--erp-text);
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.tab-button.active {
  color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 8%, var(--erp-surface));
  border-bottom-color: var(--erp-accent-green);
}

.tab-button .v-icon {
  transition: all 0.3s ease;
}

.tab-button.active .v-icon {
  color: var(--erp-accent-green);
  transform: scale(1.1);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--erp-accent-green);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px 2px 0 0;
}

.tab-button.active .tab-indicator {
  width: 100%;
}

.tab-button span {
  transition: all 0.3s ease;
  font-weight: inherit;
}

.tab-button.active span {
  font-weight: 600;
}

/* Content Area */
.settings-content {
  padding: 2rem;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

.content-panel {
  max-width: 1000px;
  margin: 0 auto;
}

.panel-header {
  text-align: center;
  margin-bottom: 3rem;
}

.panel-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
}

.panel-header p {
  font-size: 1.125rem;
  color: var(--erp-text);
  margin: 0;
}

/* Clerk Wrapper */
.clerk-wrapper {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Preferences Grid */
.preferences-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.preference-section {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

/* Theme Options */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.theme-option {
  padding: 1.5rem;
  border: 2px solid var(--erp-border);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--erp-card-bg);
}

.theme-option:hover {
  border-color: var(--erp-accent-green);
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
}

.theme-option .v-icon {
  margin-bottom: 0.75rem;
  color: var(--erp-accent-green);
}

.theme-option span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--erp-text);
}

.theme-option p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
}

/* Setting Items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--erp-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--erp-text);
}

.setting-info p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
  opacity: 0.7;
}

/* Form Input Styling */
.modern-settings :deep(.v-field) {
  background-color: var(--erp-surface) !important;
  border: 1px solid var(--erp-border) !important;
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input::placeholder) {
  color: var(--erp-text) !important;
  opacity: 0.5 !important;
}

.modern-settings :deep(.v-field__outline) {
  border-color: var(--erp-border) !important;
}

.modern-settings :deep(.v-field--focused .v-field__outline) {
  border-color: var(--erp-accent-green) !important;
  border-width: 2px !important;
}

.modern-settings :deep(.v-label) {
  color: var(--erp-text) !important;
  opacity: 0.7 !important;
}

.modern-settings :deep(.v-field--focused .v-label) {
  color: var(--erp-accent-green) !important;
  opacity: 1 !important;
}

.modern-settings :deep(.v-list) {
  background-color: var(--erp-card-bg) !important;
  border: 1px solid var(--erp-border) !important;
}

.modern-settings :deep(.v-list-item) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-list-item:hover) {
  background-color: var(--erp-surface) !important;
}

/* Wallet Tab Styles */
.wallet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.wallet-section {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 24px;
}

.wallet-section.full-width {
  grid-column: 1 / -1;
}

.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  opacity: 0.7;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--erp-text);
}

.wallet-address {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 6px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.balance-display {
  min-height: 150px;
}

.balance-content {
  text-align: center;
  padding: 24px;
}

.balance-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.balance-amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--erp-accent-green);
  line-height: 1;
}

.balance-currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--erp-text);
  opacity: 0.6;
}

.balance-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--erp-page-bg);
  transform: translateX(4px);
}

.tx-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--erp-card-bg);
  border-radius: 8px;
}

.tx-details {
  flex: 1;
}

.tx-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
}

.tx-date {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.tx-amount {
  font-size: 0.9375rem;
  font-weight: 700;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-settings {
    background: transparent !important;
  }
  
  .settings-hero {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .settings-nav {
    background: transparent !important;
    border: none !important;
    margin-bottom: 1rem;
  }
  
  .nav-container {
    padding: 0;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    min-width: 120px;
    font-size: 0.9rem;
    background: var(--erp-surface) !important;
    border-radius: 8px;
    margin-right: 0.5rem;
  }
  
  .settings-content {
    padding: 0;
    background: transparent !important;
  }
  
  .content-panel {
    max-width: 100%;
  }
  
  .panel-header { margin-bottom: 1rem; }
  
  .preference-section {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  /* Clerk mobile full-width */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    background: transparent !important;
    border: none !important;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .clerk-wrapper :deep(.cl-formField) {
    margin-bottom: 1rem;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    width: 100% !important;
    min-width: auto !important;
  }
}

@media (max-width: 480px) {
  .settings-hero {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.85rem;
  }
  
  .nav-container {
    padding: 0;
  }
  
  .tab-button {
    padding: 0.5rem 0.75rem;
    min-width: 90px;
    font-size: 0.8rem;
    gap: 0.25rem;
    margin-right: 0.25rem;
  }
  
  .tab-button .v-icon {
    font-size: 16px;
  }
  
  .preference-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .theme-option {
    padding: 0.75rem;
  }
  
  /* Clerk full-bleed on very small screens */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  .clerk-wrapper :deep(.cl-headerTitle) {
    font-size: 18px !important;
    text-align: center;
  }
  
  .clerk-wrapper :deep(.cl-formFieldLabel) {
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    font-size: 16px !important; /* Prevents zoom on iOS */
    padding: 12px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButtons) {
    gap: 8px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButton) {
    padding: 12px !important;
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-button) {
    padding: 12px 16px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
  }
}
</style>

