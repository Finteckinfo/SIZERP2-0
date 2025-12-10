/**
 * Cookie utility functions for NextAuth session management
 */

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    // Debug log for troubleshooting
    if (cookieValue) {
      console.log(`[Cookie] Found cookie: ${name} = ${cookieValue.substring(0, 50)}...`);
    }
    return cookieValue;
  }
  return null;
}

export function setCookie(name: string, value: string, days: number = 30): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.siz.land;secure;samesite=lax`;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.siz.land`;
}

export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  return document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

// Debug helper - logs all cookies
export function debugCookies(): void {
  console.log('[Cookie] All available cookies:', Object.keys(getAllCookies()));
  console.log('[Cookie] Raw document.cookie:', document.cookie);
}
