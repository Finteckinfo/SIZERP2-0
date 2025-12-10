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

  private constructor() { }

  public static getInstance(): NextAuthService {
    if (!NextAuthService.instance) {
      NextAuthService.instance = new NextAuthService();
    }
    return NextAuthService.instance;
  }

  private isLikelyJwt(token: string | null | undefined): boolean {
    return !!token && token.includes('.') && token.split('.').length === 3;
  }

  /**
   * Decode JWT payload
   */
  public decodeJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Check if NextAuth session exists
   */
  private hasSession(): boolean {
    const sessionToken = getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token') ||
      getCookie('siz_sso_token'); // Add check for SSO token
    return !!sessionToken;
  }

  /**
   * PERFORMANCE: Get JWT token synchronously from cookie/cache
   * No network calls - instant response
   */
  public getJWTTokenSync(): string | null {
    // Return cached token if still valid
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    // Check SSO sessionStorage first (guaranteed to be JWT)
    const ssoToken = this.getValidSsoToken();
    if (ssoToken) {
      this.tokenCache = ssoToken;
      this.tokenExpiry = Date.now() + (10 * 60 * 1000);
      return ssoToken;
    }

    // Get token from cookie (synchronous) but only use if it's a JWT
    const sessionToken = this.getNextAuthCookieToken();

    if (sessionToken && this.isLikelyJwt(sessionToken)) {
      this.tokenCache = sessionToken;
      this.tokenExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes cache
      return sessionToken;
    }

    return null;
  }

  private getNextAuthCookieToken(): string | null {
    return getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token') ||
      getCookie('siz_sso_token');
  }

  private getValidSsoToken(): string | null {
    const ssoToken = sessionStorage.getItem('erp_session_token');
    if (!ssoToken) return null;

    const timestamp = sessionStorage.getItem('erp_auth_timestamp');
    if (!timestamp) return null;

    const age = Date.now() - parseInt(timestamp);
    if (age >= 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem('erp_user');
      sessionStorage.removeItem('erp_session_token');
      sessionStorage.removeItem('erp_auth_timestamp');
      logger.debug('[NextAuth] SSO session expired');
      return null;
    }

    return ssoToken;
  }

  /**
   * Get JWT token for backend API calls
   * PERFORMANCE: Uses sync method first, only falls back to async if needed
   */
  public async getJWTToken(): Promise<string | null> {
    // PERFORMANCE: Try sync first
    const syncToken = this.getJWTTokenSync();
    if (syncToken) {
      return syncToken;
    }

    try {
      // Check if NextAuth session exists first
      if (this.hasSession()) {
        // Return cached token if still valid
        if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
          return this.tokenCache;
        }

        // Get token from cookie but only if it looks like a JWT
        const sessionToken = this.getNextAuthCookieToken();

        if (sessionToken && this.isLikelyJwt(sessionToken)) {
          // PERFORMANCE: Use token directly without backend validation
          // Backend validation happens on actual API calls
          this.tokenCache = sessionToken;
          this.tokenExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
          return sessionToken;
        }
      }

      // If no valid NextAuth JWT, check for SSO session token
      logger.debug('[NextAuth] No valid NextAuth JWT, checking SSO session...');
      const ssoToken = this.getValidSsoToken();

      if (ssoToken) {
        logger.debug('[NextAuth] Using SSO session token');
        this.tokenCache = ssoToken;
        this.tokenExpiry = Date.now() + (10 * 60 * 1000);
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
   * Get authentication headers for API calls
   * Supports both NextAuth sessions and SSO sessions
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    const apiBaseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

    // CHECK: Do we have a cached valid backend token?
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      if (this.isLikelyJwt(this.tokenCache)) {
        return {
          'Authorization': `Bearer ${this.tokenCache}`,
          'Content-Type': 'application/json',
        };
      }
    }

    // SPECIAL HANDLING: Exchange SSO Identity for Backend Token
    // Because of secret mismatch between Vercel (Frontend) and Render (Backend),
    // the backend cannot verify the SSO token directly.
    // WORKAROUND: We use the wallet address to "login" to the backend silently.
    try {
      // 1. Get Wallet Address from SSO Token or Storage
      let walletAddress: string | null = null;

      const ssoCookie = getCookie('siz_sso_token');
      if (ssoCookie) {
        const payload = this.decodeJWTPayload(ssoCookie);
        if (payload?.walletAddress) {
          walletAddress = payload.walletAddress;
        } else if (payload?.email && payload.email.endsWith('@wallet.local')) {
          // Extract wallet from email
          // Email format: "{8chars}@wallet.local" - not enough info
          // But wait, the SSO callback stores full user in sessionStorage
        }
      }

      if (!walletAddress) {
        const erpUser = sessionStorage.getItem('erp_user');
        if (erpUser) {
          const user = JSON.parse(erpUser);
          if (user.walletAddress || (user.email && user.email.includes('@wallet.local'))) {
            // For wallet users, we need the wallet address
            walletAddress = user.walletAddress || user.address;
          }
        }
      }

      // 2. If we found a wallet address, perform Token Exchange
      if (walletAddress) {
        console.log('[NextAuth] 🔄 Exchanging SSO identity for Backend Token:', walletAddress);

        // Call backend wallet-login endpoint
        // Use fetch directly to avoid infinite loop with interceptors
        const response = await fetch(`${apiBaseUrl}/api/auth/wallet-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            domain: window.location.hostname
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            console.log('[NextAuth] ✅ Obtained valid Backend Token via exchange');
            this.tokenCache = data.token;
            this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

            return {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            };
          }
        } else {
          console.warn('[NextAuth] Token exchange failed:', response.status);
        }
      }
    } catch (exchangeError) {
      console.error('[NextAuth] Token exchange error:', exchangeError);
    }

    // ORIGINAL LOGIC (Fallback if exchange fails or not wallet user)

    // PRIORITY 1: Check for siz_sso_token cookie first (this is a proper JWT)
    const ssoTokenCookie = getCookie('siz_sso_token');
    if (ssoTokenCookie && this.isLikelyJwt(ssoTokenCookie)) {
      logger.debug('[NextAuth] Using siz_sso_token cookie for API authentication');
      console.log('[NextAuth] ✅ Found siz_sso_token cookie, using for API auth');
      return {
        'Authorization': `Bearer ${ssoTokenCookie}`,
        'Content-Type': 'application/json',
      };
    }

    // PRIORITY 2: SSO session token from sessionStorage
    const ssoToken = this.getValidSsoToken();
    if (ssoToken) {
      logger.debug('[NextAuth] Using SSO session for API authentication');
      console.log('[NextAuth] ✅ Found SSO session token, using for API auth');
      return {
        'Authorization': `Bearer ${ssoToken}`,
        'Content-Type': 'application/json',
      };
    }

    // PRIORITY 3: Fallback to other NextAuth cookie tokens only if they resemble a JWT
    const sessionToken = getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token');
    if (sessionToken && this.isLikelyJwt(sessionToken)) {
      console.log('[NextAuth] ✅ Found next-auth session token, using for API auth');
      return {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      };
    }

    console.error('[NextAuth] ❌ No valid authentication token found');
    console.error('[NextAuth] Available cookies:', {
      'siz_sso_token': !!getCookie('siz_sso_token'),
      'next-auth.session-token': !!getCookie('next-auth.session-token'),
      '__Secure-next-auth.session-token': !!getCookie('__Secure-next-auth.session-token')
    });
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
      const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';
      window.location.href = `${ssoUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }
  }
}

// Export singleton instance
export const nextAuthService = NextAuthService.getInstance();
