import { useClerk } from '@clerk/vue';

// JWT Token Management Service
export class AuthService {
  private static instance: AuthService;
  private tokenCache: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Get JWT token from Clerk with proper error handling
  public async getJWTToken(): Promise<string | null> {
    try {
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
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing token cache');
      this.clearTokenCache();
      
      // Redirect to login if we're not already there
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
