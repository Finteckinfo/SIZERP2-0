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
import { networks } from './lib/walletManager';
import type { NetworkConfig } from '@txnlab/use-wallet';

const app = createApp(App);

// Clerk authentication
console.log('[main.ts] Initializing Clerk plugin');
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
});

// Standard plugins
console.log('[main.ts] Registering router, pinia, and other plugins');
app.use(router);
app.use(createPinia());
app.use(PerfectScrollbarPlugin);
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);

// Vuetify must be registered last before mount
app.use(vuetify);

// WalletManagerPlugin — use networks from walletManager.ts
console.log('[main.ts] Registering WalletManagerPlugin with networks:', Object.keys(networks));
app.use(WalletManagerPlugin, {
  networks: networks as Record<string, NetworkConfig>,
  defaultNetwork: 'mainnet',
});

app.mount('#app');
console.log('[main.ts] App mounted');
