import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

/**
 * Authentication Guard for ERP (erp.siz.land)
 * 
 * This guard ensures that:
 * 1. Users are authenticated via NextAuth session from primary domain (siz.land)
 * 2. Unauthenticated users are redirected to siz.land for login
 * 3. The intended destination is preserved for post-auth redirect
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth-loading',
    '/unauthorized',
    '/error',
    '/sso-callback'
  ];
  
  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return next();
  }

  // Check if user is authenticated via NextAuth session
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'GET',
      credentials: 'include', // Include cookies for cross-origin requests
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const session = await response.json();
      if (session && session.user) {
        // User is authenticated, allow navigation
        console.log('[AuthGuard] User authenticated, proceeding to:', to.path);
        return next();
      }
    }
  } catch (error) {
    console.error('[AuthGuard] Error checking session:', error);
  }
  
  // User not authenticated - redirect to primary domain (siz.land) auth-choice page
  console.log('[AuthGuard] User not authenticated - redirecting to primary domain (siz.land) auth-choice page');
  
  // Store intended destination for post-auth redirect (full URL for cross-domain)
  try {
    sessionStorage.setItem('post_auth_redirect', window.location.href);
  } catch (error) {
    console.warn('[AuthGuard] Unable to save redirect destination:', error);
  }
  
  // Redirect to primary domain's auth-choice page for centralized authentication
  const authChoiceUrl = 'https://siz.land/auth-choice';
  
  // Use window.location to navigate to primary domain
  window.location.href = authChoiceUrl;
}

/**
 * Helper function to check if user has NextAuth session
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const session = await response.json();
      return !!(session && session.user);
    }
  } catch (error) {
    console.error('[AuthGuard] Error checking authentication:', error);
  }
  return false;
}

/**
 * Helper function to get stored redirect destination
 */
export function getPostAuthRedirect(): string | null {
  try {
    const redirect = sessionStorage.getItem('post_auth_redirect');
    if (redirect && redirect !== '/auth-loading') {
      return redirect;
    }
  } catch (error) {
    console.warn('Unable to retrieve redirect destination:', error);
  }
  return null;
}

/**
 * Helper function to clear stored redirect destination
 */
export function clearPostAuthRedirect(): void {
  try {
    sessionStorage.removeItem('post_auth_redirect');
  } catch (error) {
    console.warn('Unable to clear redirect destination:', error);
  }
}
