// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueTablerIcons from 'vue-tabler-icons';
import print from 'vue3-print-nb';
import VueApexCharts from 'vue3-apexcharts';
import { clerkPlugin } from '@clerk/vue';

import { WalletManagerPlugin } from '@txnlab/use-wallet-vue';
import { wallets } from './lib/walletManager';

// Define networks with required properties
const networks = {
  mainnet: {
    algod: {
      server: 'https://mainnet-algorand.api.purestake.io/ps2',
      port: '',
      token: 'YOUR_ALGOD_TOKEN',
      baseServer: 'https://mainnet-algorand.api.purestake.io/ps2'
    },
    indexer: {
      server: 'https://mainnet-algorand.api.purestake.io/idx2',
      port: '',
      token: 'YOUR_INDEXER_TOKEN',
      baseServer: 'https://mainnet-algorand.api.purestake.io/idx2'
    }
  }
  // Add other networks as needed
};

const app = createApp(App);

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
});
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);

// ✅ Register Wallet Manager plugin
app.use(WalletManagerPlugin, {
  wallets,
  networks,
  defaultNetwork: 'mainnet'
});

app.use(vuetify).mount('#app');
