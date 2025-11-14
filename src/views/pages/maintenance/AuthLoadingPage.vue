<template>
  <AuthLoadingScreen
    :loading-title="status.loadingTitle"
    :loading-subtitle="status.loadingSubtitle"
    :progress-value="status.progress"
    :progress-text="status.progressText"
    :tip-text="status.tipText"
    :show-retry="status.hasError"
    :retrying="retrying"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { clerkReadinessService } from '@/services/clerkReadinessService';
import AuthLoadingScreen from '@/components/AuthLoadingScreen.vue';

const router = useRouter();
const status = ref(clerkReadinessService.getStatus());
const retrying = ref(false);

const redirectAfterAuth = () => {
  try {
    const target = sessionStorage.getItem('post_auth_redirect');
    if (target && target !== '/auth-loading') {
      sessionStorage.removeItem('post_auth_redirect');
      router.replace(target);
      return;
    }
  } catch (error) {
    console.warn('Unable to read post-auth redirect target', error);
  }
  router.replace('/dashboard');
};

const clearRedirectHint = () => {
  try {
    sessionStorage.removeItem('post_auth_redirect');
  } catch (error) {
    console.warn('Unable to clear post-auth redirect', error);
  }
};

const handleRetry = async () => {
  retrying.value = true;
  try {
    const success = await clerkReadinessService.retry();
    if (success) {
      redirectAfterAuth();
    }
  } catch (error) {
    console.error('Retry failed:', error);
  } finally {
    retrying.value = false;
  }
};

const checkAuthentication = async () => {
  try {
    const success = await clerkReadinessService.waitForClerk();
    
    if (success) {
      // Clerk is ready, check if user is authenticated
      if (window.Clerk?.user?.id) {
        // User is authenticated, redirect to intended destination
        redirectAfterAuth();
      } else {
        // User not authenticated - redirect to main site for satellite domains
        if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true' && import.meta.env.VITE_CLERK_SIGN_IN_URL) {
          console.log('🔄 Redirecting to main site - user not authenticated');
          window.location.href = import.meta.env.VITE_CLERK_SIGN_IN_URL;
        } else {
          clearRedirectHint();
          router.push('/login');
        }
      }
    } else {
      // Clerk failed to load - redirect to main site for satellite domains
      if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true' && import.meta.env.VITE_CLERK_SIGN_IN_URL) {
        console.log('🔄 Redirecting to main site due to authentication failure');
        window.location.href = import.meta.env.VITE_CLERK_SIGN_IN_URL;
      } else {
        clearRedirectHint();
        router.push('/login');
      }
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    clearRedirectHint();
    router.push('/login');
  }
};

onMounted(() => {
  // Start the authentication process
  checkAuthentication();
});

onUnmounted(() => {
  clerkReadinessService.destroy();
});
</script>
