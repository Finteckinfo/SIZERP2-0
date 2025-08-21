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
        
        // Enhanced JWT payload verification
        console.log('🔍 JWT Token obtained - VERIFYING PAYLOAD:', {
          userId: payload.user_id,
          sub: payload.sub,
          email: payload.email,
          audience: payload.aud,
          issuer: payload.iss,
          expiresAt: new Date(this.tokenExpiry).toISOString(),
          tokenPreview: token.substring(0, 20) + '...'
        });

        // CRITICAL: Check if email is a template literal
        if (payload.email && payload.email.includes('{{')) {
          console.error('🚨 CRITICAL: JWT contains template literals!');
          console.error('❌ Email field:', payload.email);
          console.error('💡 Fix: Update Clerk JWT template to use email_address field');
          console.error('💡 Expected: user@example.com, Got:', payload.email);
          
          // Still continue but warn about the issue
          console.warn('⚠️ Continuing with invalid email - this will cause backend errors');
        }

        // Verify essential claims
        if (!payload.user_id && !payload.sub) {
          console.error('JWT missing user_id/sub claim');
          this.clearTokenCache();
          return null;
        }
        if (!payload.email) {
          console.error('JWT missing email claim');
          this.clearTokenCache();
          return null;
        }

        // CRITICAL: Sync user with backend after getting JWT
        await this.syncUserWithBackend(payload);
      }

      return token;
    } catch (error) {
      console.error('Error getting JWT token:', error);
      this.clearTokenCache();
      return null;
    }
  }

  // Sync user with backend to ensure session alignment
  private async syncUserWithBackend(payload: any): Promise<void> {
    try {
      console.log('🔄 Syncing user with backend...', {
        userId: payload.user_id || payload.sub,
        email: payload.email
      });

      // Import authApi dynamically to avoid circular dependency
      const { authApi } = await import('./projectApi');
      
      // Make a sync request to backend to ensure user exists
      await authApi.syncUser({
        userId: payload.user_id || payload.sub,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name
      });

      console.log('✅ User synchronized with backend successfully');
    } catch (error: any) {
      console.warn('⚠️ Failed to sync user with backend:', error);
      
      // Enhanced error handling for different scenarios
      if (error?.response?.status === 404) {
        console.warn('⚠️ Backend sync endpoint not found - user sync skipped');
        console.log('💡 This is normal if the endpoint is not yet deployed');
      } else if (error?.response?.status === 401) {
        console.error('❌ Authentication failed during user sync');
        console.log('💡 Check if JWT token is valid and not expired');
      } else if (error?.response?.status === 500) {
        console.error('❌ Backend error during user sync');
        console.log('💡 Check backend logs for database connection issues');
      } else {
        console.error('❌ Unknown error during user sync:', error);
      }
      
      // Don't throw error - allow authentication to continue
      // The backend webhooks should handle user creation automatically
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
    console.error('🚨 AUTH ERROR DETECTED - NO REDIRECT FOR DEBUGGING:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data,
      fullError: error
    });

    // COMPLETELY DISABLE ALL REDIRECTS FOR DEBUGGING
    console.log('🚫 REDIRECT DISABLED - You can now see the actual errors!');
    
    if (error.response?.status === 401) {
      console.error('❌ 401 UNAUTHORIZED ERROR DETAILS:', {
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
        authHeaderPreview: error.config?.headers?.Authorization?.substring(0, 50) + '...',
        responseData: error.response?.data,
        responseHeaders: error.response?.headers
      });
      
      this.clearTokenCache();
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
