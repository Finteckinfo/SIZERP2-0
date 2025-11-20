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
    console.log('[SSO Callback] Validating NextAuth session from siz.land...');
    
    // Validate NextAuth session (cookie should be shared from siz.land)
    await validateSession();
    
    // Check if we have a redirect URL from session storage
    const redirectUrl = sessionStorage.getItem('post_auth_redirect');
    sessionStorage.removeItem('post_auth_redirect');
    
    // Redirect to intended destination or dashboard
    console.log('[SSO Callback] Authentication successful, redirecting...');
    window.location.href = redirectUrl || "/dashboard";
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
