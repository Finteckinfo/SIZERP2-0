import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { getCookie } from '@/utils/cookies';

// SSO Configuration - Receive auth from primary domain (siz.land)
const SSO_PRIMARY_DOMAIN = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';

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

function hasSessionStorageAuth(): boolean {
  try {
    const user = sessionStorage.getItem('erp_user');
    const sessionToken = sessionStorage.getItem('erp_session_token');
    const timestamp = sessionStorage.getItem('erp_auth_timestamp');

    if (!user || !sessionToken || !timestamp) {
      return false;
    }

    // Check if session is still valid (24 hours)
    const age = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
      // Session expired, clear storage
      sessionStorage.removeItem('erp_user');
      sessionStorage.removeItem('erp_session_token');
      sessionStorage.removeItem('erp_auth_timestamp');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Router] Error checking sessionStorage auth:', error);
    return false;
  }
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

  // Check for SSO token in URL or cookie
  const urlParams = new URLSearchParams(window.location.search);
  let ssoToken = urlParams.get('ssoToken');

  // If no token in URL, check cookie
  if (!ssoToken) {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)siz_sso_token=([^;]+)/);
    if (cookieMatch) {
      ssoToken = cookieMatch[1];
      console.log('[Router] SSO token found in cookie');
    }
  } else {
    console.log('[Router] SSO token found in URL');
  }

  if (ssoToken) {
    console.log('[Router] SSO token detected, handling client‑side');
    // The backend already set the `siz_sso_token` cookie.
    // Remove the token from the URL to keep the address clean.
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
    // Verify the cookie is present; if not, force a reload to give useNextAuth another chance.
    const cookieMatch = document.cookie.match(/(?:^|;\s*)siz_sso_token=([^;]+)/);
    if (!cookieMatch) {
      console.warn('[Router] SSO cookie not found after handling token – reloading page');
      window.location.reload();
    }
    // Continue routing – `useNextAuth` will pick up the cookie.
    // No need to redirect elsewhere.
  }

  const publicPages = ['/login', '/register', '/login1', '/error'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // Check for session (either cookie or sessionStorage from SSO)
  const hasSession = hasNextAuthSession() || hasSessionStorageAuth();

  if (authRequired) {
    if (hasSession) {
      // Session exists, proceed
      console.log('[Router] Session found, allowing access');
      next();
    } else {
      // No session, redirect to SSO login
      console.log('[Router] No session, redirecting to SSO login');
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
