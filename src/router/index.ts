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
  
  const publicPages = ['/login', '/register', '/login1', '/error', '/sso-callback'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // If authentication is required, show loading screen first
  if (authRequired) {
    // Check if Clerk is already ready
    if (window.Clerk?.session && window.Clerk?.user?.id) {
      // Clerk is ready, proceed
      next();
      return;
    }
    
    // Clerk not ready, show loading screen
    next('/auth-loading');
    return;
  } else if (clerk.user?.id && (to.path === '/login' || to.path === '/login1')) {
    // User is already authenticated, redirect to dashboard
    next('/dashboard');
  } else {
    next();
  }
});
