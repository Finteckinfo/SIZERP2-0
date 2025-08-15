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

import { WalletManagerPlugin, NetworkId } from '@txnlab/use-wallet-vue';

import { wallets, networks } from './lib/walletManager';

const app = createApp(App);
app.use(clerkPlugin, { publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY });
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);

app.use(WalletManagerPlugin, {
  wallets,
  networks,
  defaultNetwork: NetworkId.MAINNET, // Now resolves correctly
});

app.use(vuetify).mount('#app');
