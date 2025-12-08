<script setup lang="ts">
import { ref, computed } from 'vue'
import { LogoutIcon, SettingsIcon, UserIcon, SearchIcon } from 'vue-tabler-icons'
import { useNextAuth } from '@/composables/useNextAuth'

const swt1 = ref(true)
const swt2 = ref(false)
const { user } = useNextAuth()
const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land'

// fallback if no name
const firstName = computed(() => user.value?.firstName || user.value?.name || 'Guest')
const userEmail = computed(() => user.value?.email || 'Authenticated via Sizland SSO')

function handleManageAccount() {
  const redirectTarget = encodeURIComponent(window.location.href)
  window.location.href = `${ssoDomain}/profile?redirect=${redirectTarget}`
}

async function handleLogout() {
  try {
    window.location.href = `${ssoDomain}/api/auth/signout?callbackUrl=${encodeURIComponent(ssoDomain)}`
  } catch (error) {
    console.error('Logout error:', error)
  }
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
      variant="outlined"
      hide-details
    >
      <template v-slot:prepend-inner>
        <SearchIcon stroke-width="1.5" size="20" class="SearchIcon" />
      </template>
    </v-text-field>

    <v-divider></v-divider>

    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <div class="rounded-md px-5 py-3 my-3" :style="{ background: 'var(--erp-surface)', color: 'var(--erp-text)' }">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Allow Notifications</h5>
          <v-switch v-model="swt2" hide-details inset :style="{ '--v-theme-primary': 'var(--erp-accent-indigo)' }"></v-switch>
        </div>
      </div>

      <!-- Wallet Connect button -->
      <div class="my-4 rounded-lg pa-4" :style="{ background: 'var(--erp-surface)', color: 'var(--erp-text)' }">
        <p class="text-subtitle-1 font-weight-medium mb-1">{{ userEmail }}</p>
        <p class="text-body-2 text-medium-emphasis mb-3">
          Account managed centrally via Sizland SSO.
        </p>
        <v-btn
          block
          class="rounded-lg"
          color="primary"
          variant="flat"
          @click="handleManageAccount"
        >
          Manage Account
        </v-btn>
      </div>

      <v-list class="mt-3">
        <v-list-item rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <SettingsIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Account Settings </v-list-item-title>
        </v-list-item>

        <v-list-item rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Social Profile </v-list-item-title>
          <template v-slot:append>
            <v-chip class="text-white" text="02" variant="flat" size="small" :style="{ background: 'var(--erp-accent-indigo)' }" />
          </template>
        </v-list-item>

        <v-list-item @click="handleLogout()" rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Logout </v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>
