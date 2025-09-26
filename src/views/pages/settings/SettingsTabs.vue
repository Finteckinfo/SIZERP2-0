<template>
  <div class="settings-tabs-container">
    <v-card elevation="0" class="pa-0">
      <v-card-title class="d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center">
          <v-icon size="24" color="primary" icon="mdi-cog" />
          <span class="text-h6 font-weight-medium ms-2">Settings</span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="start"
          class="px-3"
        >
          <v-tab value="account">
            <v-icon start icon="mdi-account-cog" /> Account
          </v-tab>
          <v-tab value="preferences">
            <v-icon start icon="mdi-tune" /> Preferences
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-window v-model="activeTab" class="settings-window">
          <v-window-item value="account">
            <div class="tab-content pa-4">
              <div class="mb-3 text-body-2 text-medium-emphasis">Manage your Clerk profile, security, and connected accounts.</div>
              <div class="profile-wrapper">
                <UserProfile
                  routing="hash"
                  :appearance="clerkAppearance"
                />
              </div>
            </div>
          </v-window-item>

        <v-window-item value="preferences">
          <div class="tab-content pa-4">
            <div class="mb-3 text-body-2 text-medium-emphasis">Customize how the app looks and behaves for you. These settings are local to your browser for now.</div>

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="flat" class="pa-4 preference-card">
                  <div class="d-flex align-center mb-3">
                    <v-icon icon="mdi-theme-light-dark" color="primary" class="me-2" />
                    <span class="text-subtitle-1 font-weight-medium">Theme</span>
                  </div>
                  <v-radio-group v-model="prefs.theme" inline>
                    <v-radio label="System" value="system" />
                    <v-radio label="Light" value="light" />
                    <v-radio label="Dark" value="dark" />
                  </v-radio-group>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="flat" class="pa-4 preference-card">
                  <div class="d-flex align-center mb-3">
                    <v-icon icon="mdi-calendar" color="primary" class="me-2" />
                    <span class="text-subtitle-1 font-weight-medium">Date & Time</span>
                  </div>
                  <v-select
                    v-model="prefs.dateFormat"
                    :items="dateFormats"
                    label="Date format"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="mb-3"
                  />
                  <v-select
                    v-model="prefs.timeFormat"
                    :items="timeFormats"
                    label="Time format"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                  />
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="flat" class="pa-4 preference-card">
                  <div class="d-flex align-center mb-3">
                    <v-icon icon="mdi-bell-ring" color="primary" class="me-2" />
                    <span class="text-subtitle-1 font-weight-medium">Notifications</span>
                  </div>
                  <v-switch v-model="prefs.notifyEmail" color="primary" hide-details label="Email notifications" />
                  <v-switch v-model="prefs.notifyInApp" color="primary" hide-details label="In-app notifications" />
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="flat" class="pa-4 preference-card">
                  <div class="d-flex align-center mb-3">
                    <v-icon icon="mdi-view-dashboard-outline" color="primary" class="me-2" />
                    <span class="text-subtitle-1 font-weight-medium">Dashboard</span>
                  </div>
                  <v-select
                    v-model="prefs.startPage"
                    :items="startPages"
                    label="Default start page"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                  />
                </v-card>
              </v-col>

              <v-col cols="12" class="d-flex justify-end">
                <v-btn color="primary" variant="elevated" @click="savePrefs" prepend-icon="mdi-content-save">
                  Save Preferences
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import { UserProfile } from '@clerk/vue';

const activeTab = ref('account');

const dateFormats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const timeFormats = ['24h', '12h'];
const startPages = [
  { title: 'Default Dashboard', value: '/dashboards/default' },
  { title: 'Projects', value: '/projects' },
  { title: 'Analytics', value: '/analytics' }
];

const prefs = ref({
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  notifyEmail: true,
  notifyInApp: true,
  startPage: '/dashboards/default'
});

const saveKey = 'app-user-preferences-v1';

onMounted(() => {
  try {
    const raw = localStorage.getItem(saveKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      prefs.value = { ...prefs.value, ...parsed };
    }
  } catch {}
  applyTheme();
  // React to OS theme changes when set to system
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => prefs.value.theme === 'system' && applyTheme());
  } catch {}
});

const savePrefs = () => {
  try {
    localStorage.setItem(saveKey, JSON.stringify(prefs.value));
  } catch {}
};

// Theme application
const theme = useTheme();
const setVuetifyTheme = (mode: 'light' | 'dark') => {
  try {
    theme.global.name.value = mode; // expects themes named 'light' and 'dark'
    document.documentElement.dataset.theme = mode;
  } catch {
    document.documentElement.dataset.theme = mode;
  }
};

const applyTheme = () => {
  if (prefs.value.theme === 'light') return setVuetifyTheme('light');
  if (prefs.value.theme === 'dark') return setVuetifyTheme('dark');
  // system
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return setVuetifyTheme(prefersDark ? 'dark' : 'light');
};

watch(() => prefs.value.theme, () => {
  applyTheme();
  savePrefs();
});

// Tame Clerk layout so it doesn't overflow the card
const clerkAppearance = {
  variables: {
    colorBackground: 'transparent'
  },
  elements: {
    rootBox: {
      width: '100%'
    },
    card: {
      width: '100%',
      maxWidth: '920px',
      margin: '0 auto',
      boxShadow: 'none',
      background: 'transparent'
    },
    headerTitle: {
      fontSize: '20px'
    },
    scrollBox: {
      maxWidth: '100%'
    }
  }
} as any;
</script>

<style scoped>
.settings-tabs-container {
  padding: 16px;
}

.settings-window {
  min-height: 400px;
}

.profile-wrapper :deep(*) {
  /* Allow Clerk profile to expand nicely */
  width: 100%;
}

.profile-wrapper {
  max-width: 980px;
  margin: 0 auto;
}

/* Ensure large provider icons or images don't overflow */
.profile-wrapper :deep(img) {
  max-width: 100%;
  height: auto;
}

.profile-wrapper :deep(.cl-socialButtonsIcon) {
  width: 24px;
  height: 24px;
}

.preference-card {
  background: rgba(248, 250, 252, 0.6);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
}
</style>

