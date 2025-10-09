<template>
  <div class="modern-settings">
    <!-- Hero Section -->
    <div class="settings-hero">
      <RetroGrid />
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="48" color="white">mdi-cog</v-icon>
        </div>
        <h1 class="hero-title">Settings</h1>
        <p class="hero-subtitle">Customize your experience and manage your account</p>
      </div>
    </div>

    <!-- Modern Tab Navigation -->
    <div class="settings-nav">
      <div class="nav-container">
        <div class="tab-nav">
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            <v-icon size="20">mdi-account-circle</v-icon>
            <span>Account</span>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'preferences' }"
            @click="activeTab = 'preferences'"
          >
            <v-icon size="20">mdi-tune</v-icon>
            <span>Preferences</span>
            <div class="tab-indicator"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="settings-content">
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeTab === 'account'" key="account" class="content-panel">
          <div class="panel-header">
            <h2>Account Management</h2>
            <p>Manage your profile, security settings, and connected accounts</p>
          </div>
          <div class="clerk-wrapper">
            <UserProfile
              routing="hash"
              :appearance="clerkAppearance"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'preferences'" key="preferences" class="content-panel">
          <div class="panel-header">
            <h2>Preferences</h2>
            <p>Customize how the app looks and behaves for you</p>
          </div>
          
          <div class="preferences-grid">
            <!-- Theme Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-palette</v-icon>
                <h3>Appearance</h3>
              </div>
              <div class="theme-options">
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'system' }"
                  @click="prefs.theme = 'system'"
                >
                  <v-icon size="32">mdi-monitor</v-icon>
                  <span>System</span>
                  <p>Follow system theme</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'light' }"
                  @click="prefs.theme = 'light'"
                >
                  <v-icon size="32">mdi-white-balance-sunny</v-icon>
                  <span>Light</span>
                  <p>Always light mode</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'dark' }"
                  @click="prefs.theme = 'dark'"
                >
                  <v-icon size="32">mdi-weather-night</v-icon>
                  <span>Dark</span>
                  <p>Always dark mode</p>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-bell</v-icon>
                <h3>Notifications</h3>
              </div>
              <div class="notification-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates via email</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyEmail" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>In-App Notifications</h4>
                    <p>Show notifications within the app</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyInApp" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Dashboard Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-view-dashboard</v-icon>
                <h3>Dashboard</h3>
              </div>
              <div class="dashboard-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Default Start Page</h4>
                    <p>Choose your landing page</p>
                  </div>
                  <v-select
                    v-model="prefs.startPage"
                    :items="startPages"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-calendar-clock</v-icon>
                <h3>Date & Time</h3>
              </div>
              <div class="datetime-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Date Format</h4>
                    <p>How dates are displayed</p>
                  </div>
                  <v-select
                    v-model="prefs.dateFormat"
                    :items="dateFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Time Format</h4>
                    <p>12-hour or 24-hour format</p>
                  </div>
                  <v-select
                    v-model="prefs.timeFormat"
                    :items="timeFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import { UserProfile } from '@clerk/vue';
import { RetroGrid } from '@/components/ui/retro-grid';

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

// Clerk appearance - responsive styling with mobile popup behavior
const clerkAppearance = {
  variables: {
    colorBackground: 'transparent',
    colorText: 'var(--erp-text)',
    colorTextSecondary: 'var(--erp-text)',
    colorPrimary: 'var(--erp-accent-green)',
    borderRadius: '12px',
    fontFamily: 'inherit'
  },
  elements: {
    rootBox: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    card: {
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: 'none',
      background: 'transparent',
      border: 'none'
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'var(--erp-text)'
    },
    scrollBox: {
      maxWidth: '100%'
    },
    formFieldInput: {
      borderRadius: '8px',
      border: '1px solid var(--erp-border)',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)'
    },
    formFieldLabel: {
      color: 'var(--erp-text)'
    },
    socialButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    socialButton: {
      borderRadius: '8px',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)',
      border: '1px solid var(--erp-border)'
    }
  }
} as any;
</script>

<style scoped>
.modern-settings {
  min-height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

/* Hero Section */
.settings-hero {
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, var(--erp-accent-indigo) 100%);
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.settings-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
}

/* Modern Tab Navigation */
.settings-nav {
  background: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.tab-nav {
  display: flex;
  gap: 0;
  position: relative;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--erp-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 140px;
  justify-content: center;
}

.tab-button:hover {
  color: var(--erp-text);
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.tab-button.active {
  color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 8%, var(--erp-surface));
  border-bottom-color: var(--erp-accent-green);
}

.tab-button .v-icon {
  transition: all 0.3s ease;
}

.tab-button.active .v-icon {
  color: var(--erp-accent-green);
  transform: scale(1.1);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--erp-accent-green);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px 2px 0 0;
}

.tab-button.active .tab-indicator {
  width: 100%;
}

.tab-button span {
  transition: all 0.3s ease;
  font-weight: inherit;
}

.tab-button.active span {
  font-weight: 600;
}

/* Content Area */
.settings-content {
  padding: 2rem;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

.content-panel {
  max-width: 1000px;
  margin: 0 auto;
}

.panel-header {
  text-align: center;
  margin-bottom: 3rem;
}

.panel-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
}

.panel-header p {
  font-size: 1.125rem;
  color: var(--erp-text);
  margin: 0;
}

/* Clerk Wrapper */
.clerk-wrapper {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Preferences Grid */
.preferences-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.preference-section {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

/* Theme Options */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.theme-option {
  padding: 1.5rem;
  border: 2px solid var(--erp-border);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--erp-card-bg);
}

.theme-option:hover {
  border-color: var(--erp-accent-green);
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
}

.theme-option .v-icon {
  margin-bottom: 0.75rem;
  color: var(--erp-accent-green);
}

.theme-option span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--erp-text);
}

.theme-option p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
}

/* Setting Items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--erp-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--erp-text);
}

.setting-info p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
  opacity: 0.7;
}

/* Form Input Styling */
.modern-settings :deep(.v-field) {
  background-color: var(--erp-surface) !important;
  border: 1px solid var(--erp-border) !important;
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input::placeholder) {
  color: var(--erp-text) !important;
  opacity: 0.5 !important;
}

.modern-settings :deep(.v-field__outline) {
  border-color: var(--erp-border) !important;
}

.modern-settings :deep(.v-field--focused .v-field__outline) {
  border-color: var(--erp-accent-green) !important;
  border-width: 2px !important;
}

.modern-settings :deep(.v-label) {
  color: var(--erp-text) !important;
  opacity: 0.7 !important;
}

.modern-settings :deep(.v-field--focused .v-label) {
  color: var(--erp-accent-green) !important;
  opacity: 1 !important;
}

.modern-settings :deep(.v-list) {
  background-color: var(--erp-card-bg) !important;
  border: 1px solid var(--erp-border) !important;
}

.modern-settings :deep(.v-list-item) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-list-item:hover) {
  background-color: var(--erp-surface) !important;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-settings {
    background: transparent !important;
  }
  
  .settings-hero {
    padding: 1.5rem 1rem;
    background: transparent !important;
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .settings-nav {
    background: transparent !important;
    border: none !important;
    margin-bottom: 1rem;
  }
  
  .nav-container {
    padding: 0;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    min-width: 120px;
    font-size: 0.9rem;
    background: var(--erp-surface) !important;
    border-radius: 8px;
    margin-right: 0.5rem;
  }
  
  .settings-content {
    padding: 0;
    background: transparent !important;
  }
  
  .content-panel {
    max-width: 100%;
  }
  
  .panel-header { margin-bottom: 1rem; }
  
  .preference-section {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  /* Clerk mobile full-width */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    background: transparent !important;
    border: none !important;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .clerk-wrapper :deep(.cl-formField) {
    margin-bottom: 1rem;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    width: 100% !important;
    min-width: auto !important;
  }
}

@media (max-width: 480px) {
  .settings-hero {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.85rem;
  }
  
  .nav-container {
    padding: 0;
  }
  
  .tab-button {
    padding: 0.5rem 0.75rem;
    min-width: 90px;
    font-size: 0.8rem;
    gap: 0.25rem;
    margin-right: 0.25rem;
  }
  
  .tab-button .v-icon {
    font-size: 16px;
  }
  
  .preference-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .theme-option {
    padding: 0.75rem;
  }
  
  /* Clerk full-bleed on very small screens */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  .clerk-wrapper :deep(.cl-headerTitle) {
    font-size: 18px !important;
    text-align: center;
  }
  
  .clerk-wrapper :deep(.cl-formFieldLabel) {
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    font-size: 16px !important; /* Prevents zoom on iOS */
    padding: 12px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButtons) {
    gap: 8px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButton) {
    padding: 12px !important;
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-button) {
    padding: 12px 16px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
  }
}
</style>

