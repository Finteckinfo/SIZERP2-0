import { useClerk } from '@clerk/vue';
import { logger } from './logger';

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
        logger.debug('Clerk not ready yet, waiting...');
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
        logger.error('Failed to get JWT token from Clerk API template');
        return null;
      }

      // Decode JWT to get expiration (basic decode without external libraries)
      const payload = this.decodeJWTPayload(token);
      if (payload && payload.exp) {
        this.tokenExpiry = payload.exp * 1000; // Convert to milliseconds
        this.tokenCache = token;
        
        // Enhanced JWT payload verification (only in development)
        logger.security('JWT Token obtained', {
          userId: payload.user_id,
          sub: payload.sub,
          email: payload.email,
          expiresAt: new Date(this.tokenExpiry).toISOString()
        });

        // CRITICAL: Check if email is a template literal
        if (payload.email && payload.email.includes('{{')) {
          logger.error('JWT contains template literals in email field');
          if (logger.isDev()) {
            logger.debug('Email field contains template literal', { email: payload.email });
          }
          logger.warn('Continuing with invalid email - may cause backend errors');
        }

        // Verify essential claims
        if (!payload.user_id && !payload.sub) {
          logger.error('JWT missing user_id/sub claim');
          this.clearTokenCache();
          return null;
        }
        if (!payload.email) {
          logger.error('JWT missing email claim');
          this.clearTokenCache();
          return null;
        }

        // CRITICAL: Sync user with backend after getting JWT
        await this.syncUserWithBackend(payload);
      }

      return token;
    } catch (error) {
      logger.error('Error getting JWT token', error);
      this.clearTokenCache();
      return null;
    }
  }

  // Sync user with backend to ensure session alignment
  private async syncUserWithBackend(payload: any): Promise<void> {
    try {
      logger.info('Syncing user with backend', {
        userId: payload.user_id || payload.sub
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

      logger.info('User synchronized with backend successfully');
    } catch (error: any) {
      logger.warn('Failed to sync user with backend');
      
      // Enhanced error handling for different scenarios
      if (error?.response?.status === 404) {
        logger.warn('Backend sync endpoint not found - user sync skipped');
        logger.debug('This is normal if the endpoint is not yet deployed');
      } else if (error?.response?.status === 401) {
        logger.error('Authentication failed during user sync');
        logger.debug('Check if JWT token is valid and not expired');
      } else if (error?.response?.status === 500) {
        logger.error('Backend error during user sync');
        logger.debug('Check backend logs for database connection issues');
      } else {
        logger.error('Unknown error during user sync', error);
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
      logger.error('Failed to decode JWT payload', error);
      return null;
    }
  }

  // Handle authentication errors
  public handleAuthError(error: any): void {
    // Sanitized error logging - details only in development
    logger.error('Authentication error occurred', error, {
      status: error.response?.status,
      message: error.message
    });

    if (logger.isDev()) {
      // Detailed debugging info only in development
      logger.debug('Full auth error details', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    if (error.response?.status === 401) {
      logger.warn('Unauthorized request - clearing token cache');
      this.clearTokenCache();
    }
  }

  // Reset redirect flag (call this after successful login)
  public resetRedirectFlag(): void {
    this.isRedirecting = false;
    logger.debug('Redirect flag reset');
  }

  // Check if we're currently redirecting
  public isCurrentlyRedirecting(): boolean {
    return this.isRedirecting;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
