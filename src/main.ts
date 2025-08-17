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

// ---- Node.js polyfills for browser (lightweight shims) ----
import { Buffer } from 'buffer';

// Minimal EventEmitter shim for browser usage (covers on/off/once/emit)
class BrowserEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function) {
    const arr = this.listeners.get(event) || [];
    arr.push(listener);
    this.listeners.set(event, arr);
    return this;
  }

  addListener(event: string, listener: Function) {
    return this.on(event, listener);
  }

  once(event: string, listener: Function) {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  off(event: string, listener?: Function) {
    if (!listener) {
      this.listeners.delete(event);
    } else {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter((l) => l !== listener));
    }
    return this;
  }

  removeListener(event: string, listener: Function) {
    return this.off(event, listener);
  }

  emit(event: string, ...args: any[]) {
    const arr = this.listeners.get(event) || [];
    for (const l of arr.slice()) {
      try {
        l(...args);
      } catch {
        // swallow individual listener errors to emulate Node behavior more closely
      }
    }
    return arr.length > 0;
  }
}

// Polyfill global objects for browser using lightweight shims
(window as any).Buffer = Buffer;
(window as any).global = window;
// Expose the Vite environment to libraries expecting process.env
(window as any).process = { env: import.meta.env };

// Provide the minimal EventEmitter
(window as any).EventEmitter = BrowserEventEmitter;

// Minimal util shim to avoid runtime require('util') errors for simple uses
(window as any).util = {
  isBuffer: (obj: any) => !!(obj && obj instanceof (window as any).Buffer),
  inspect: (obj: any) => {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  },
  format: (...args: any[]) => args.join(' '),
};

// ---- Wallet Manager ----
import { WalletManagerPlugin } from '@txnlab/use-wallet-vue';
import { networks } from './lib/walletManager';
import type { NetworkConfig } from '@txnlab/use-wallet';

const app = createApp(App);

// ---- Clerk Authentication ----
console.log('[main.ts] Initializing Clerk plugin');
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
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
app.use(WalletManagerPlugin, {
  networks: networks as Record<string, NetworkConfig>,
  defaultNetwork: 'mainnet',
});

app.mount('#app');
console.log('[main.ts] App mounted');
