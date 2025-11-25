import { getCookie } from '@/utils/cookies';
import { logger } from './logger';

/**
 * NextAuth Service - Replaces Clerk authService
 * Manages JWT tokens from NextAuth session for backend API calls
 */
export class NextAuthService {
  private static instance: NextAuthService;
  private tokenCache: string | null = null;
  private tokenExpiry: number | null = null;
  private userCache: any = null;

  private constructor() {}

  public static getInstance(): NextAuthService {
    if (!NextAuthService.instance) {
      NextAuthService.instance = new NextAuthService();
    }
    return NextAuthService.instance;
  }

  /**
   * Check if NextAuth session exists
   */
  private hasSession(): boolean {
    const sessionToken = getCookie('next-auth.session-token') || 
                        getCookie('__Secure-next-auth.session-token');
    return !!sessionToken;
  }

  /**
   * Get JWT token for backend API calls
   * This validates the NextAuth session and returns a backend-compatible token
   * Also supports SSO sessions as fallback
   */
  public async getJWTToken(): Promise<string | null> {
    try {
      // Check if NextAuth session exists first
      if (this.hasSession()) {
        // Return cached token if still valid
        if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
          return this.tokenCache;
        }

        // Validate session with backend and get JWT
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/auth/session`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          logger.error('[NextAuth] Session validation failed:', response.status);
          this.clearTokenCache();
          return null;
        }

        const session = await response.json();

        if (!session || !session.user) {
          logger.error('[NextAuth] Invalid session response');
          this.clearTokenCache();
          return null;
        }

        // Store user data
        this.userCache = session.user;

        // Get or create JWT token from session cookie
        const sessionToken = getCookie('next-auth.session-token') ||
                            getCookie('__Secure-next-auth.session-token');

        if (sessionToken) {
          // Cache the token
          this.tokenCache = sessionToken;
          // NextAuth tokens typically expire in 30 days
          this.tokenExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);

          logger.security('[NextAuth] JWT Token obtained', {
            userId: session.user.id,
            email: session.user.email,
          });

          // Sync user with backend
          await this.syncUserWithBackend(session.user);

          return sessionToken;
        }
      }

      // If no NextAuth session, check for SSO session
      logger.debug('[NextAuth] No NextAuth session, checking SSO session...');
      const ssoUser = sessionStorage.getItem('erp_user');
      const ssoToken = sessionStorage.getItem('erp_session_token');

      if (ssoUser && ssoToken) {
        // Validate SSO session is still valid (24 hours)
        const timestamp = sessionStorage.getItem('erp_auth_timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (age > maxAge) {
            // Session expired, clear storage
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_session_token');
            sessionStorage.removeItem('erp_auth_timestamp');
            logger.debug('[NextAuth] SSO session expired');
            return null;
          }
        }

        logger.debug('[NextAuth] Using SSO session token');
        return ssoToken;
      }

      logger.debug('[NextAuth] No session found');
      return null;
    } catch (error) {
      logger.error('[NextAuth] Error getting JWT token', error);
      this.clearTokenCache();
      return null;
    }
  }

  /**
   * Sync user with backend database
   */
  private async syncUserWithBackend(user: any): Promise<void> {
    try {
      logger.info('[NextAuth] Syncing user with backend', { userId: user.id });

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/sync-user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0],
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' '),
        }),
      });

      if (response.ok) {
        logger.info('[NextAuth] User synchronized with backend successfully');
      } else {
        logger.warn('[NextAuth] Failed to sync user with backend', { status: response.status });
      }
    } catch (error: any) {
      logger.warn('[NextAuth] Error syncing user with backend:', error.message);
      // Don't throw - allow authentication to continue
    }
  }

  /**
   * Get authentication headers for API calls
   * Supports both NextAuth sessions and SSO sessions
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    // First, try to get NextAuth session token
    const sessionToken = getCookie('next-auth.session-token') ||
                        getCookie('__Secure-next-auth.session-token');

    if (sessionToken) {
      return {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      };
    }

    // If no NextAuth session, check for SSO session
    try {
      const ssoUser = sessionStorage.getItem('erp_user');
      const ssoToken = sessionStorage.getItem('erp_session_token');

      if (ssoUser && ssoToken) {
        // Validate SSO session is still valid (24 hours)
        const timestamp = sessionStorage.getItem('erp_auth_timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (age > maxAge) {
            // Session expired, clear storage
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_session_token');
            sessionStorage.removeItem('erp_auth_timestamp');
            throw new Error('SSO session expired');
          }
        }

        logger.debug('[NextAuth] Using SSO session for API authentication');
        return {
          'Authorization': `Bearer ${ssoToken}`,
          'Content-Type': 'application/json',
        };
      }
    } catch (error) {
      logger.warn('[NextAuth] SSO session validation failed:', error);
    }

    throw new Error('No NextAuth session available');
  }

  /**
   * Get current user data
   */
  public getUser(): any {
    return this.userCache;
  }

  /**
   * Clear token cache (for logout)
   */
  public clearTokenCache(): void {
    this.tokenCache = null;
    this.tokenExpiry = null;
    this.userCache = null;
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  /**
   * Handle authentication errors
   */
  public handleAuthError(error: any): void {
    logger.error('[NextAuth] Authentication error occurred', error);

    if (error.response?.status === 401) {
      logger.warn('[NextAuth] Unauthorized - clearing token cache');
      this.clearTokenCache();
      
      // Redirect to SSO login
      const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://siz.land';
      window.location.href = `${ssoUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }
  }
}

// Export singleton instance
export const nextAuthService = NextAuthService.getInstance();
