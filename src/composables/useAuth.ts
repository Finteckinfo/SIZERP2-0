import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name?: string;
}

const user = ref<User | null>(null);
const loading = ref(false);
const initialized = ref(false);

export function useAuth() {
  const router = useRouter();

  const isAuthenticated = computed(() => !!user.value);
  
  const displayName = computed(() => {
    if (!user.value) return '';
    if (user.value.firstName || user.value.lastName) {
      return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
    }
    return user.value.email;
  });

  async function checkSession() {
    if (initialized.value && user.value) {
      return user.value;
    }

    loading.value = true;
    try {
      // Check if NextAuth session cookie exists by calling the primary domain
      const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';
      const response = await fetch(`${ssoDomain}/api/auth/session`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          user.value = {
            id: session.user.id || session.user.email,
            email: session.user.email,
            firstName: session.user.name?.split(' ')[0] || null,
            lastName: session.user.name?.split(' ').slice(1).join(' ') || null,
            name: session.user.name
          };
          initialized.value = true;
          return user.value;
        }
      }
      
      user.value = null;
      initialized.value = true;
      return null;
    } catch (error) {
      console.error('Session check failed:', error);
      user.value = null;
      initialized.value = true;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';
      const response = await fetch(`${ssoDomain}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        await checkSession();
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    user.value = null;
    initialized.value = false;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      router.push('/login');
    }
  }

  function redirectToLogin() {
    // Redirect to primary domain for login
    const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';
    window.location.href = `${ssoDomain}/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    displayName,
    checkSession,
    login,
    logout,
    redirectToLogin
  };
}
