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
const lastValidated = ref<number>(0);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to parse JWT token client-side
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[NextAuth] Failed to parse JWT:', e);
    return null;
  }
}

/**
 * NextAuth composable to replace Clerk's useAuth()
 * Validates session from shared cookie across siz.land domains
 */
export function useNextAuth() {
  const validateSession = async (force = false) => {
    // Return if already validating
    if (isValidating.value) return;

    // Check cache validity
    const now = Date.now();
    const isCacheValid = lastValidated.value > 0 && (now - lastValidated.value < CACHE_TTL);

    // If cache is valid and we have data (or explicitly null), don't revalidate unless forced
    if (!force && isCacheValid && isLoaded.value) {
      return;
    }

    isValidating.value = true;

    try {
      // Check for NextAuth session cookie (shared across .siz.land domains)
      const sessionToken = getCookie('next-auth.session-token') ||
        getCookie('__Secure-next-auth.session-token') ||
        getCookie('siz_sso_token'); // Also check specifically for our SSO token

      if (!sessionToken) {
        // Fallback: Check SSO sessionStorage for ERP users
        const ssoUserJson = sessionStorage.getItem('erp_user');
        const ssoToken = sessionStorage.getItem('erp_session_token');

        if (ssoUserJson && ssoToken) {
          try {
            const ssoUser = JSON.parse(ssoUserJson);

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

            lastValidated.value = Date.now();
            isLoaded.value = true;
            return;
          } catch (err) {
            console.error('[NextAuth] Failed to parse SSO user:', err);
          }
        }

        sessionCache.value = null;
        lastValidated.value = Date.now();
        isLoaded.value = true;
        return;
      }

      // OPTIMIZATION: Try to decode JWT client-side first to bypass Vercel firewall
      // This avoids the 403 error from the backend validation call
      const decodedToken = parseJwt(sessionToken);
      if (decodedToken) {
        console.log('[NextAuth] Successfully decoded session token client-side');

        // Map decoded token to session structure
        // Handle both NextAuth structure and our custom SSO token structure
        const user = {
          id: decodedToken.sub || decodedToken.userId || decodedToken.id,
          email: decodedToken.email,
          name: decodedToken.name,
          firstName: decodedToken.name?.split(' ')[0] || decodedToken.email?.split('@')[0],
          lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
          walletAddress: decodedToken.walletAddress || '',
          authMethod: decodedToken.authMethod || 'sso',
          image: decodedToken.picture || decodedToken.image
        };

        sessionCache.value = {
          user: user as NextAuthUser,
          expires: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        lastValidated.value = Date.now();
        isLoaded.value = true;

        // We can skip backend validation if we successfully decoded the token
        // But we might want to do it in background just in case (optional)
        return;
      }

      // Fallback to backend validation if client-side decode fails
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
        sessionCache.value = session;
      } else {
        // If backend fails (e.g. 403 firewall), but we have a token, 
        // we should have handled it above. If we reached here, it means
        // token was invalid OR we couldn't decode it.
        sessionCache.value = null;
      }
      lastValidated.value = Date.now();
    } catch (error) {
      console.error('[NextAuth] Session validation error:', error);
      // Don't clear cache on error, just keep old data if available
      if (!sessionCache.value) sessionCache.value = null;
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
    window.addEventListener('storage', () => validateSession(true));

    // Poll for sessionStorage changes (storage event doesn't fire for same tab)
    // Optimized: Check every 30 seconds instead of 1 second
    const checkSSOInterval = setInterval(() => {
      // Only check if page is visible
      if (document.hidden) return;

      const ssoUser = sessionStorage.getItem('erp_user');
      const hasSession = !!sessionCache.value;

      // If we have SSO data but no cached session, validate
      if (ssoUser && !hasSession) {
        validateSession(true);
      }

      // If we have a cached session but SSO data is gone, clear cache
      if (!ssoUser && hasSession && sessionCache.value?.user?.authMethod === 'sso') {
        sessionCache.value = null;
        lastValidated.value = Date.now();
      }

      // Revalidate if cache expired
      if (Date.now() - lastValidated.value > CACHE_TTL) {
        validateSession();
      }
    }, 30000); // Check every 30 seconds

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
