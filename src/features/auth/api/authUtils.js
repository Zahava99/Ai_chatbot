// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  ACCESS_TOKEN_EXPIRES: "access_token_expires_at",
};

/**
 * Persist tokens returned by the API into sessionStorage.
 * @param {{ accessToken: string, refreshToken: string, accessTokenExpiresAtUtc: string }} data
 */
export function storeTokens(data) {
  sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken);
  sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refreshToken);
  sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES, data.accessTokenExpiresAtUtc);
}

/**
 * Clear all stored auth tokens (logout helper).
 */
export function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES);
}

/**
 * Retrieve the stored access token.
 * @returns {string | null}
 */
export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * Retrieve the stored refresh token.
 * @returns {string | null}
 */
export function getRefreshToken() {
  return sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * Retrieve the stored access token expiry (ISO 8601 UTC string).
 * @returns {string | null}
 */
export function getAccessTokenExpiry() {
  return sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES);
}

/**
 * Check whether the current access token is expired or about to expire.
 * Uses a 60-second buffer so we refresh slightly before actual expiry.
 * @returns {boolean}
 */
export function isTokenExpired() {
  const expiry = getAccessTokenExpiry();
  if (!expiry) return true;

  const expiresAt = new Date(expiry).getTime();
  const now = Date.now();
  const BUFFER_MS = 60 * 1000; // refresh 60s before expiry

  return now >= expiresAt - BUFFER_MS;
}

/**
 * Ensures a fresh access token is available.
 * If the token is expired/expiring, it calls the refresh endpoint.
 * Returns the valid access token, or null if refresh fails.
 *
 * @returns {Promise<string | null>}
 */
let refreshPromise = null;

export async function ensureFreshToken() {
  const token = getAccessToken();
  if (!token) return null;

  if (!isTokenExpired()) return token;

  // Deduplicate concurrent refresh calls
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { refreshToken } = await import("@/features/auth/api/authApi");
        const data = await refreshToken();
        return data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
