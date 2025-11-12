import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '@mdi/font/css/materialdesignicons.css';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import '@/assets/css/theme.css';
import '@/index.css';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueTablerIcons from 'vue-tabler-icons';
import print from 'vue3-print-nb';
import VueApexCharts from 'vue3-apexcharts';
import { clerkPlugin } from '@clerk/vue';
import { dark } from '@clerk/themes';

// ---- Node.js polyfills for browser ----
import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

// Polyfill global objects for browser
(window as any).Buffer = Buffer;
(window as any).EventEmitter = EventEmitter;

// Ensure process is defined globally
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Ensure global is defined
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// ---- Wallet Manager ----
import { WalletManagerPlugin } from '@txnlab/use-wallet-vue';
import { networks, wallets } from './lib/walletManager';
import type { NetworkConfig } from '@txnlab/use-wallet';

const app = createApp(App);

// ---- Clerk Authentication ----
console.log('[main.ts] Initializing Clerk plugin');

// Satellite domain configuration
const clerkConfig: any = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  appearance: {
    baseTheme: dark,
    variables: {
      colorPrimary: '#5BC85B',
      colorBackground: 'transparent',
      colorInputBackground: 'transparent',
    },
  },
};

// Add satellite domain configuration if enabled
if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true') {
  console.log('[main.ts] Configuring as Clerk satellite domain');
  console.log('[main.ts] Satellite domain:', import.meta.env.VITE_CLERK_DOMAIN);
  console.log('[main.ts] Primary sign-in URL:', import.meta.env.VITE_CLERK_SIGN_IN_URL);
  console.log('[main.ts] Primary sign-up URL:', import.meta.env.VITE_CLERK_SIGN_UP_URL);
  
  clerkConfig.isSatellite = true;
  clerkConfig.domain = import.meta.env.VITE_CLERK_DOMAIN;
  clerkConfig.signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL;
  clerkConfig.signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL;
}

app.use(clerkPlugin, clerkConfig);

// Add global Clerk readiness check
app.config.globalProperties.$clerkReady = false;

// Wait for Clerk to be ready before allowing API calls
window.addEventListener('load', () => {
  const checkClerkReady = () => {
    if (window.Clerk?.session && window.Clerk?.user) {
      console.log('[main.ts] Clerk is ready, allowing API calls');
      app.config.globalProperties.$clerkReady = true;
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('clerk-ready'));
    } else {
      console.log('[main.ts] Clerk not ready yet, retrying...');
      setTimeout(checkClerkReady, 100);
    }
  };
  
  checkClerkReady();
});

// ---- Standard Plugins ----
console.log('[main.ts] Registering router, pinia, and other plugins');
app.use(router);
app.use(createPinia());
app.use(PerfectScrollbarPlugin);
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);

// ---- Vuetify ----
app.use(vuetify);

// ---- WalletManagerPlugin for network management ONLY ----
console.log('[main.ts] Registering WalletManagerPlugin with networks:', Object.keys(networks));
console.log('[main.ts] Registering WalletManagerPlugin with wallets:', wallets.length);
app.use(WalletManagerPlugin, {
  wallets: wallets,
  networks: networks as Record<string, NetworkConfig>,
  defaultNetwork: 'mainnet',
});

app.mount('#app');
console.log('[main.ts] App mounted');
