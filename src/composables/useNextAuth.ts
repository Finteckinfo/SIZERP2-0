import { ref, computed, onMounted, watch } from 'vue';
import { getCookie } from '@/utils/cookies';

export interface NextAuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  walletAddress?: string;
  authMethod?: string;
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
        console.log('[NextAuth] No session token found, checking SSO sessionStorage...');
        
        // Fallback: Check SSO sessionStorage for ERP users
        const ssoUserJson = sessionStorage.getItem('erp_user');
        const ssoToken = sessionStorage.getItem('erp_session_token');
        
        if (ssoUserJson && ssoToken) {
          try {
            const ssoUser = JSON.parse(ssoUserJson);
            console.log('[NextAuth] SSO session found:', ssoUser.email);
            
            // Convert SSO user to NextAuth format
            sessionCache.value = {
              user: {
                id: ssoUser.id,
                email: ssoUser.email,
                name: ssoUser.name,
                firstName: ssoUser.name?.split(' ')[0] || ssoUser.email.split('@')[0],
                lastName: ssoUser.name?.split(' ').slice(1).join(' ') || '',
                walletAddress: ssoUser.walletAddress || '',
                authMethod: ssoUser.authMethod || 'sso'
              },
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            isLoaded.value = true;
            isValidating.value = false;
            return;
          } catch (err) {
            console.error('[NextAuth] Failed to parse SSO user:', err);
          }
        }
        
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

  // Watch for cookie changes and SSO sessionStorage updates
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', validateSession);
    
    // Poll for sessionStorage changes (storage event doesn't fire for same tab)
    const checkSSOInterval = setInterval(() => {
      const ssoUser = sessionStorage.getItem('erp_user');
      const hasSession = !!sessionCache.value;
      
      // If we have SSO data but no cached session, validate
      if (ssoUser && !hasSession) {
        console.log('[NextAuth] SSO session detected, revalidating...');
        validateSession();
      }
      
      // If we have a cached session but SSO data is gone, clear cache
      if (!ssoUser && hasSession && sessionCache.value?.user?.authMethod === 'sso') {
        console.log('[NextAuth] SSO session cleared, invalidating...');
        sessionCache.value = null;
      }
    }, 1000); // Check every second
    
    // Cleanup on unmount
    window.addEventListener('beforeunload', () => {
      clearInterval(checkSSOInterval);
    });
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
