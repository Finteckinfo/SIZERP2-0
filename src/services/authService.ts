import { useClerk } from '@clerk/vue';

// JWT Token Management Service
export class AuthService {
  private static instance: AuthService;
  private tokenCache: string | null = null;
  private tokenExpiry: number | null = null;
  private isRedirecting: boolean = false;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if Clerk is ready and user is authenticated
  private isClerkReady(): boolean {
    return !!(window.Clerk?.session && window.Clerk?.user);
  }

  // Get JWT token from Clerk with proper error handling
  public async getJWTToken(): Promise<string | null> {
    try {
      // Wait for Clerk to be ready
      if (!this.isClerkReady()) {
        console.log('Clerk not ready yet, waiting...');
        return null;
      }

      // Check if we have a cached valid token
      if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.tokenCache;
      }

      // Get fresh JWT token from Clerk API template
      const token = await window.Clerk?.session?.getToken({ 
        template: "API" 
      });

      if (!token) {
        console.error('Failed to get JWT token from Clerk API template');
        return null;
      }

      // Decode JWT to get expiration (basic decode without external libraries)
      const payload = this.decodeJWTPayload(token);
      if (payload && payload.exp) {
        this.tokenExpiry = payload.exp * 1000; // Convert to milliseconds
        this.tokenCache = token;
        
        // Log token info for debugging
        console.log('JWT Token obtained:', {
          userId: payload.user_id,
          email: payload.email,
          expiresAt: new Date(this.tokenExpiry).toISOString(),
          tokenPreview: token.substring(0, 20) + '...'
        });
      }

      return token;
    } catch (error) {
      console.error('Error getting JWT token:', error);
      this.clearTokenCache();
      return null;
    }
  }

  // Get authentication headers for API calls
  public async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getJWTToken();
    
    if (!token) {
      throw new Error('No valid JWT token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Clear token cache (useful for logout)
  public clearTokenCache(): void {
    this.tokenCache = null;
    this.tokenExpiry = null;
  }

  // Check if token is expired
  public isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  // Basic JWT payload decoder (no external dependencies)
  private decodeJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }

  // Handle authentication errors
  public handleAuthError(error: any): void {
    if (error.response?.status === 401 && !this.isRedirecting) {
      console.error('Authentication failed - clearing token cache');
      this.clearTokenCache();
      
      // Prevent redirect loops
      this.isRedirecting = true;
      
      // Only redirect if not already on login/register pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('Redirecting to login due to 401 error');
        window.location.href = '/login';
      } else {
        console.log('Already on auth page, not redirecting');
        // Reset redirect flag after a delay
        setTimeout(() => {
          this.isRedirecting = false;
        }, 1000);
      }
    } else if (error.response?.status === 401) {
      console.log('401 error but already redirecting or on auth page, ignoring');
    }
  }

  // Reset redirect flag (call this after successful login)
  public resetRedirectFlag(): void {
    this.isRedirecting = false;
    console.log('Redirect flag reset');
  }

  // Check if we're currently redirecting
  public isCurrentlyRedirecting(): boolean {
    return this.isRedirecting;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
