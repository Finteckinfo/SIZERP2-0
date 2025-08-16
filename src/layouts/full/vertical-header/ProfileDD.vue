<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { LogoutIcon, SettingsIcon, UserIcon, SearchIcon } from 'vue-tabler-icons'
import { useUser } from '@clerk/vue'

// wallet modal state from store
import { isWalletModalOpen } from '@/stores/walletStore'

const swt1 = ref(true)
const swt2 = ref(false)
const authStore = useAuthStore()

const { user } = useUser()

// fallback if no name
const firstName = computed(() => user.value?.firstName || 'Guest')
function openWalletModal() {
  isWalletModalOpen.value = true
}
</script>

<template>
  <div class="pa-4">
    <h4 class="mb-n1">
      Good Morning, <span class="font-weight-regular">{{ firstName }}</span>
    </h4>
    <span class="text-subtitle-2 text-medium-emphasis">Project admin</span>

    <v-text-field
      persistent-placeholder
      placeholder="Search"
      class="my-3"
      color="primary"
      variant="outlined"
      hide-details
    >
      <template v-slot:prepend-inner>
        <SearchIcon stroke-width="1.5" size="20" class="text-lightText SearchIcon" />
      </template>
    </v-text-field>

    <v-divider></v-divider>

    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <div class="bg-lightprimary rounded-md px-5 py-3 my-3">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Start DND Mode</h5>
          <div>
            <v-switch v-model="swt1" color="primary" hide-details></v-switch>
          </div>
        </div>
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Allow Notifications</h5>
          <div>
            <v-switch v-model="swt2" color="primary" hide-details></v-switch>
          </div>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- Wallet Connect button -->
      <div class="my-4">
        <v-btn
          color="primary"
          block
          class="rounded-lg"
          @click="openWalletModal"
        >
          Connect Wallet
        </v-btn>
      </div>

      <v-divider></v-divider>

      <v-list class="mt-3">
        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <SettingsIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Account Settings </v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Social Profile </v-list-item-title>
          <template v-slot:append>
            <v-chip
              color="warning"
              class="text-white"
              text="02"
              variant="flat"
              size="small"
            />
          </template>
        </v-list-item>

        <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Logout </v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>
