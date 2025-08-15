<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClerk, useUser } from '@clerk/vue';
import { LogoutIcon, SettingsIcon, UserIcon, WalletIcon, SearchIcon } from 'vue-tabler-icons';
import ConnectWallet from './ConnectWallet.vue';
import { connectedWallet, openWalletModal } from '@/stores/walletStore';

const swt1 = ref(true);
const swt2 = ref(false);

const clerk = useClerk();
const { user } = useUser();

// Logout function
async function handleLogout() {
  try {
    await clerk.value?.signOut();
    window.location.href = '/login';
  } catch (err) {
    console.error('Logout failed', err);
  }
}

// First name greeting
const firstName = computed(() => user.value?.firstName ?? 'User');
</script>

<template>
  <div class="pa-4">
    <h4 class="mb-n1">Good Morning, <span>{{ firstName }}</span></h4>
    <span class="text-subtitle-2 text-medium-emphasis">Project admin</span>

    <v-text-field
      placeholder="Search"
      class="my-3"
      color="primary"
      variant="outlined"
      hide-details
    >
      <template v-slot:prepend-inner>
        <SearchIcon stroke-width="1.5" size="20" class="text-lightText" />
      </template>
    </v-text-field>

    <v-divider></v-divider>
    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <div class="bg-lightprimary rounded-md px-5 py-3 my-3">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Allow Notifications</h5>
          <v-switch v-model="swt2" color="primary" hide-details></v-switch>
        </div>

        <!-- Wallet section -->
        <div class="mt-4 d-flex justify-center">
          <v-btn
            v-if="!connectedWallet"
            color="primary"
            class="d-flex align-center"
            @click="openWalletModal"
          >
            <WalletIcon size="20" class="mr-2" /> Connect Wallet
          </v-btn>

          <div v-else class="connected-wallet">
            Connected Wallet: <strong>{{ connectedWallet }}</strong>
          </div>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list class="mt-3">
        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <SettingsIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Account Settings</v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Social Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="handleLogout" color="secondary" rounded="md">
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>

    <!-- Connect Wallet Modal -->
    <ConnectWallet />
  </div>
</template>

<style scoped>
.connected-wallet {
  font-weight: bold;
  color: #333;
}
.v-list-item:hover {
  background-color: #f5f5f5;
}
</style>
