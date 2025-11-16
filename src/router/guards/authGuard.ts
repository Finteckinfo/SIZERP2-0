import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

/**
 * Authentication Guard for Satellite Domain (erp.siz.land)
 * 
 * This guard ensures that:
 * 1. Users are authenticated via Clerk session from primary domain (siz.land)
 * 2. Unauthenticated users are redirected to siz.land for login
 * 3. The intended destination is preserved for post-auth redirect
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Wait for Clerk to load
  const clerk = (window as any).Clerk;
  
  if (!clerk) {
    console.log('Waiting for Clerk to initialize...');
    // Redirect to auth loading page while Clerk initializes
    return next('/auth-loading');
  }

  const isAuthenticated = clerk.session && clerk.user;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth-loading',
    '/unauthorized',
    '/error'
  ];
  
  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return next();
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated - redirecting to primary domain (siz.land)');
    
    // Store intended destination for post-auth redirect
    try {
      sessionStorage.setItem('post_auth_redirect', to.fullPath);
    } catch (error) {
      console.warn('Unable to save redirect destination:', error);
    }
    
    // Redirect to primary domain for authentication
    const signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || 'https://siz.land/login';
    
    // Use window.location to navigate to primary domain
    window.location.href = signInUrl;
    return;
  }

  // User is authenticated, allow navigation
  console.log('User authenticated, proceeding to:', to.path);
  next();
}

/**
 * Helper function to check if Clerk is ready
 */
export function isClerkReady(): boolean {
  const clerk = (window as any).Clerk;
  return !!(clerk && clerk.loaded);
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
