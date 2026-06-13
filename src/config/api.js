
// Central API configuration
import { getAccessToken, ensureFreshToken } from "@/features/auth/api/authUtils";

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  TIMEOUT: 10000,
};

/**
 * Build request headers with a fresh access token.
 * Automatically refreshes the token if it's expired/expiring.
 * NOTE: This is async now — await it before making requests.
 *
 * @returns {Promise<Record<string, string>>}
 */
export async function getAuthHeaders() {
  const token = await ensureFreshToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Synchronous version — uses whatever token is currently in storage
 * without attempting a refresh. Use only when you can't await.
 */
export function getAuthHeadersSync() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}