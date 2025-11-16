import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { Clerk } from '@clerk/clerk-js';
import { clerkReadinessService } from '@/services/clerkReadinessService';

// Initialize Clerk with satellite domain configuration if needed
const clerkOptions: any = {};

if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true') {
  clerkOptions.isSatellite = true;
  clerkOptions.domain = import.meta.env.VITE_CLERK_DOMAIN;
  clerkOptions.signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL;
  clerkOptions.signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL;
}

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY, clerkOptions);

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
  if (to.path === '/auth-loading') {
    next();
    return;
  }

  // Load Clerk first
  await clerk.load();
  
  const publicPages = ['/login', '/register', '/login1', '/error', '/sso-callback', '/auth-choice', '/wallet-auth'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);
  
  // Check if in satellite mode
  const isSatelliteMode = import.meta.env.VITE_CLERK_IS_SATELLITE === 'true';

  // If authentication is required, show loading screen first
  if (authRequired) {
    // Check if Clerk is already ready
    if (window.Clerk?.session && window.Clerk?.user?.id) {
      // Clerk is ready, proceed
      next();
      return;
    }
    
    // User not authenticated
    if (isSatelliteMode) {
      // In satellite mode, redirect to primary domain for authentication
      console.log('Redirecting to primary domain for authentication');
      try {
        sessionStorage.setItem('post_auth_redirect', to.fullPath || to.path);
      } catch (error) {
        console.warn('Unable to cache post-auth redirect', error);
      }
      // Redirect to primary domain sign-in
      const signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || 'https://siz.land/login';
      window.location.href = signInUrl;
      return;
    } else {
      // Not in satellite mode, show loading screen
      try {
        sessionStorage.setItem('post_auth_redirect', to.fullPath || to.path);
      } catch (error) {
        console.warn('Unable to cache post-auth redirect', error);
      }
      next('/auth-loading');
      return;
    }
  } else if (clerk.user?.id && (to.path === '/login' || to.path === '/login1')) {
    // User is already authenticated, redirect to dashboard
    next('/dashboard');
  } else if (isSatelliteMode && (to.path === '/login' || to.path === '/register' || to.path === '/auth-choice' || to.path === '/wallet-auth')) {
    // In satellite mode, these auth pages should not be accessible
    // Redirect to primary domain
    const targetUrl = to.path === '/register' 
      ? import.meta.env.VITE_CLERK_SIGN_UP_URL 
      : import.meta.env.VITE_CLERK_SIGN_IN_URL;
    window.location.href = targetUrl || 'https://siz.land' + to.path;
    return;
  } else {
    next();
  }
});
