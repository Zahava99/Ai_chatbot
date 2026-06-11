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
