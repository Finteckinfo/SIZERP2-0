<script setup lang="ts">
import { RouterView } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { useCustomizerStore } from '../../stores/customizer';
const customizer = useCustomizerStore();
</script>

<template>
  <v-locale-provider>
    <v-app
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']"
      :style="{ backgroundColor: 'var(--erp-header-bg)' }"
    >
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main>
        <v-container fluid class="page-wrapper" :style="{ backgroundColor: 'var(--erp-page-bg)' }">
          <div class="page-content-wrapper">
            <v-card 
              class="page-content-card" 
              elevation="0" 
              :style="{ 
                backgroundColor: 'var(--erp-sidebar-bg)',
                border: '1px solid var(--erp-border)'
              }"
            >
              <RouterView />
            </v-card>
            <v-btn
              class="customizer-btn"
              size="large"
              icon
              variant="flat"
              color="secondary"
              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
            >
              <SettingsIcon class="icon" />
            </v-btn>
          </div>
        </v-container>
       
          <div>
            <FooterPanel />
          </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<style scoped>
.page-content-wrapper {
  position: relative;
  min-height: calc(100vh - 200px); /* Account for header and footer */
}

.page-content-card {
  margin: 24px;
  border-radius: 16px;
  padding: 24px;
  min-height: calc(100vh - 280px); /* Account for margins and padding */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-content-card {
    margin: 16px;
    padding: 16px;
  }
}
</style>
