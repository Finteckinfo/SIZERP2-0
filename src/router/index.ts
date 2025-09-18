import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { Clerk } from '@clerk/clerk-js';

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
    MainRoutes,
    PublicRoutes
  ]
});

router.beforeEach(async (to, from, next) => {
  await clerk.load();
  const userId = clerk.user?.id || null;

  const publicPages = ['/login', '/register', '/login1', '/error', '/sso-callback'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // If this is a satellite domain and user needs authentication
  if (authRequired && !userId) {
    if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true' && import.meta.env.VITE_CLERK_SIGN_IN_URL) {
      // Redirect to primary domain for authentication
      window.location.href = import.meta.env.VITE_CLERK_SIGN_IN_URL;
      return;
    } else {
      // Fallback to local login (shouldn't happen in satellite mode)
      next('/login');
    }
  } else if (userId && (to.path === '/login' || to.path === '/login1')) {
    // User is already authenticated, redirect to dashboard
    next('/');
  } else {
    next();
  }
});
