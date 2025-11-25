<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNextAuth } from '@/composables/useNextAuth';
import { useTheme } from '@/composables/useTheme';
import { useRouter } from 'vue-router';

const loading = ref(true);
const errorMsg = ref("");
const { isDark } = useTheme();
const { validateSession } = useNextAuth();
const router = useRouter();

onMounted(async () => {
  try {
    console.log('[SSO Callback] Starting SSO validation...');

    // Get SSO token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('ssoToken');

    if (!ssoToken) {
      throw new Error('No SSO token provided in URL');
    }

    console.log('[SSO Callback] Validating SSO token...');

    // Validate SSO token with backend
    const backendUrl = 'https://siz.land';
    const response = await fetch(`${backendUrl}/api/auth/validate-sso-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ssoToken })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'SSO validation failed');
    }

    const data = await response.json();
    console.log('[SSO Callback] SSO validation successful');

    // Store user data in sessionStorage for ERP to use
    sessionStorage.setItem('erp_user', JSON.stringify(data.user));
    sessionStorage.setItem('erp_session_token', data.sessionToken);
    sessionStorage.setItem('erp_auth_timestamp', Date.now().toString());

    console.log('[SSO Callback] User data stored, redirecting to dashboard');

    // Check if we have a redirect URL from session storage or URL
    const redirectUrl = urlParams.get('redirect') || sessionStorage.getItem('post_auth_redirect') || '/dashboard/default';
    sessionStorage.removeItem('post_auth_redirect');

    // Redirect to intended destination
    window.location.href = redirectUrl;

  } catch (err: any) {
    console.error("[SSO Callback] Authentication error:", err);
    errorMsg.value = err.message || "Authentication failed. Please try again.";
    loading.value = false;
  }
});
</script>

<template>
  <div :class="{ 'dark-theme': isDark }" class="callback-container">
    <template v-if="loading">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="auto" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-h6">Completing authentication...</p>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="auto" class="text-center">
          <v-icon color="error" size="48">mdi-alert-circle</v-icon>
          <p class="mt-4 text-h6 red--text">{{ errorMsg }}</p>
          <v-btn color="primary" class="mt-4" to="/login" variant="flat">Try Again</v-btn>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.callback-container {
  height: 100vh;
}
</style>
