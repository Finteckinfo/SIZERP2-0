import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { Clerk } from '@clerk/clerk-js';

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

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

  const publicPages = ['/login', '/register', '/login1', '/error'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  if (authRequired && !userId) {
    next('/login');
  } else if (userId && (to.path === '/login' || to.path === '/login1')) {
    next('/');
  } else {
    next();
  }
});
