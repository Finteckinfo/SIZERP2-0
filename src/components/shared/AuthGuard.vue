<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useNextAuth } from '@/composables/useNextAuth';
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { getCookie } from '@/utils/cookies';

const router = useRouter();
const { isLoaded, isSignedIn } = useNextAuth();
const { isDark } = useTheme();

// Check for SSO token cookie directly (same logic as router guard)
// This prevents race conditions where isSignedIn hasn't been set yet
const hasSSOCookie = computed(() => {
  return !!(getCookie('next-auth.session-token') ||
    getCookie('__Secure-next-auth.session-token') ||
    getCookie('siz_sso_token'));
});

// Combined auth check: either async session validation passed OR SSO cookie exists
const isAuthenticated = computed(() => isSignedIn.value || hasSSOCookie.value);

onMounted(() => {
  console.log('[AuthGuard] Mount check:', {
    isLoaded: isLoaded.value,
    isSignedIn: isSignedIn.value,
    hasSSOCookie: hasSSOCookie.value,
    isAuthenticated: isAuthenticated.value
  });
  
  if (isLoaded.value && !isAuthenticated.value) {
    // Redirect to primary domain for authentication
    console.error('[AuthGuard] ❌ Not authenticated, redirecting to login');
    const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://siz.land';
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
  } else if (isAuthenticated.value) {
    console.log('[AuthGuard] ✅ Authenticated, allowing access');
  }
});
</script>

<template>
  <div 
    v-if="isAuthenticated"
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
  <div v-else-if="isLoaded" class="auth-loading">
    <!-- Show loading while checking auth -->
    <div class="d-flex justify-center align-center" style="height: 100vh;">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>
