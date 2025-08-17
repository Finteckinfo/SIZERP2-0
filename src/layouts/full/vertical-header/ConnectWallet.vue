<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { WalletId, useWallet } from '@txnlab/use-wallet-vue'
import { wallets as rawWallets, activeAccount, addManualWallet } from '@/lib/walletManager'
import { isWalletModalOpen as storeWalletModalOpen } from '@/stores/walletStore'

// Modal ref
const isWalletModalOpen = storeWalletModalOpen as Ref<boolean>

// Disconnect confirmation
const showDisconnectConfirm = ref(false)

// Manual wallet
const manualWallet = ref<{ address: string; secret: string }>({ address: '', secret: '' })

// Wallet provider
const { connect, activeAccount: providerAccount } = useWallet() as any

const wallets = rawWallets.filter(
  (w): w is { id: WalletId; options?: any } => typeof w === 'object' && w !== null && 'id' in w
)

// Watchers for debug
watch(isWalletModalOpen, val => console.log('Wallet modal visibility:', val))
watch(activeAccount, val => console.log('Active account changed:', val))
watch(manualWallet, val => console.log('Manual wallet changed:', val))

function connectManualWallet() {
  console.log('connectManualWallet clicked:', manualWallet.value)
  if (!manualWallet.value.address) return alert('Enter wallet address!')
  addManualWallet(manualWallet.value.address)
  console.log('Manual wallet connected:', manualWallet.value.address)
  isWalletModalOpen.value = false
}

async function connectProviderWallet(walletId: WalletId) {
  console.log('connectProviderWallet clicked:', walletId)
  try {
    await connect(walletId)
    if (providerAccount.value?.address) {
      addManualWallet(providerAccount.value.address)
      console.log('Provider wallet connected:', providerAccount.value.address)
      isWalletModalOpen.value = false
    } else {
      alert('No accounts returned from wallet.')
    }
  } catch (e: any) {
    console.error('Provider wallet connect error:', e)
    alert(e.message || 'Wallet connection failed.')
  }
}

function disconnectWallet() {
  console.log('disconnectWallet clicked. Active before:', activeAccount.value)
  activeAccount.value = null
  showDisconnectConfirm.value = false
  console.log('Wallet disconnected. Active after:', activeAccount.value)
}
</script>

<template>
  <v-dialog v-model="isWalletModalOpen" max-width="500" z-index="2000">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold">Connect Wallet</v-card-title>
      <v-card-text>
        <section class="mb-6">
          <h6 class="mb-2 text-subtitle-1 font-weight-medium">Manual Entry</h6>
          <v-text-field v-model="manualWallet.address" label="Wallet Address" outlined dense hide-details />
          <v-text-field v-model="manualWallet.secret" label="Mnemonic / Secret" type="password" outlined dense hide-details />
          <v-btn color="primary" class="mt-3" block @click="connectManualWallet">Connect Manual Wallet</v-btn>
        </section>

        <v-divider class="my-4"></v-divider>

        <section>
          <h6 class="mb-3 text-subtitle-1 font-weight-medium">Wallet Providers</h6>
          <v-list>
            <v-list-item v-for="wallet in wallets" :key="wallet.id" class="wallet-option" @click="connectProviderWallet(wallet.id)">
              <v-list-item-avatar size="40">
                <v-img :src="`/src/assets/images/wallets/${wallet.id}.png`" alt="wallet logo" />
              </v-list-item-avatar>
              <v-list-item-title class="font-weight-medium">{{ wallet.id }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </section>

        <v-dialog v-model="showDisconnectConfirm" max-width="300">
          <v-card class="rounded-lg">
            <v-card-title class="headline">Disconnect Wallet?</v-card-title>
            <v-card-actions>
              <v-btn color="grey" @click="showDisconnectConfirm = false">Cancel</v-btn>
              <v-btn color="red" @click="disconnectWallet">Disconnect</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="isWalletModalOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
