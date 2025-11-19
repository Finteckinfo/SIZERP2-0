import { ref, computed, onMounted, watch } from 'vue';
import { getCookie } from '@/utils/cookies';

export interface NextAuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface NextAuthSession {
  user: NextAuthUser;
  expires: string;
}

const sessionCache = ref<NextAuthSession | null>(null);
const isLoaded = ref(false);
const isValidating = ref(false);

/**
 * NextAuth composable to replace Clerk's useAuth()
 * Validates session from shared cookie across siz.land domains
 */
export function useNextAuth() {
  const validateSession = async () => {
    if (isValidating.value) return;
    
    isValidating.value = true;
    
    try {
      // Check for NextAuth session cookie (shared across .siz.land domains)
      const sessionToken = getCookie('next-auth.session-token') || 
                          getCookie('__Secure-next-auth.session-token');
      
      if (!sessionToken) {
        console.log('[NextAuth] No session token found');
        sessionCache.value = null;
        isLoaded.value = true;
        isValidating.value = false;
        return;
      }

      console.log('[NextAuth] Session token found, validating...');

      // Validate session with backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/session`, {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const session = await response.json();
        console.log('[NextAuth] Session validated:', session.user?.email);
        sessionCache.value = session;
      } else {
        console.log('[NextAuth] Session validation failed:', response.status);
        sessionCache.value = null;
      }
    } catch (error) {
      console.error('[NextAuth] Session validation error:', error);
      sessionCache.value = null;
    } finally {
      isLoaded.value = true;
      isValidating.value = false;
    }
  };

  // Validate on mount
  onMounted(() => {
    validateSession();
  });

  // Watch for cookie changes
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', validateSession);
  }

  const isSignedIn = computed(() => !!sessionCache.value);
  const user = computed(() => sessionCache.value?.user || null);

  return {
    isLoaded,
    isSignedIn,
    user,
    session: sessionCache,
    validateSession,
  };
}
