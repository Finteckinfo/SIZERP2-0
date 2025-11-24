import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { getCookie } from '@/utils/cookies';

// SSO Configuration - Receive auth from primary domain (siz.land)
const SSO_PRIMARY_DOMAIN = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://siz.land';

function hasNextAuthSession(): boolean {
  // Debug: Log all cookies
  console.log('[Router Debug] All cookies:', document.cookie);
  
  const sessionToken = getCookie('next-auth.session-token') || 
                      getCookie('__Secure-next-auth.session-token');
  
  console.log('[Router Debug] Session token found:', !!sessionToken);
  if (sessionToken) {
    console.log('[Router Debug] Session token value (first 20 chars):', sessionToken.substring(0, 20));
  }
  
  return !!sessionToken;
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', component: () => import('@/views/pages/maintenance/error/Error404Page.vue') },
    { path: '/sso-callback', component: () => import('@/views/authentication/SSOCallback.vue') },
    { path: '/auth-loading', component: () => import('@/views/pages/maintenance/AuthLoadingPage.vue') },
    MainRoutes,
    PublicRoutes
  ]
});

router.beforeEach(async (to, from, next) => {
  // Skip loading page to avoid infinite loop
  if (to.path === '/auth-loading' || to.path === '/sso-callback') {
    next();
    return;
  }

  const publicPages = ['/login', '/register', '/login1', '/error'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // Check for NextAuth session (shared via .siz.land domain)
  const hasSession = hasNextAuthSession();

  if (authRequired) {
    if (hasSession) {
      // Session exists, proceed
      console.log('[Router] NextAuth session found, allowing access');
      next();
    } else {
      // No session, redirect to SSO login
      console.log('[Router] No NextAuth session, redirecting to SSO');
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `${SSO_PRIMARY_DOMAIN}/login?redirect=${redirectUrl}`;
    }
  } else if (hasSession && (to.path === '/login' || to.path === '/login1')) {
    // User is already authenticated, redirect to dashboard
    next('/dashboard');
  } else {
    next();
  }
});
