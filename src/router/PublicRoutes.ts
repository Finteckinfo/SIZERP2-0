const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'Landing',
      path: '/',
      component: () => import('@/views/pages/LandingPage.vue')
    },
    {
      name: 'Authentication',
      path: '/login',
      beforeEnter: () => {
        // Redirect to primary domain for authentication
        if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true' && import.meta.env.VITE_CLERK_SIGN_IN_URL) {
          window.location.href = import.meta.env.VITE_CLERK_SIGN_IN_URL;
          return false;
        }
        return true;
      },
      component: () => import('@/views/authentication/LoginPage.vue')
    },
    {
      name: 'Register',
      path: '/register',
      beforeEnter: () => {
        // Redirect to primary domain for registration
        if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true' && import.meta.env.VITE_CLERK_SIGN_UP_URL) {
          window.location.href = import.meta.env.VITE_CLERK_SIGN_UP_URL;
          return false;
        }
        return true;
      },
      component: () => import('@/views/authentication/LoginPage.vue')
    },
    {
      name: 'Error 404',
      path: '/error',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    {
      name: 'SSO - callback',
      path: '/sso-callback',
      component: () => import('@/views/authentication/SSOCallback.vue')
    }
  ]
};

export default PublicRoutes;
