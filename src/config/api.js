
// Central API configuration
import { getAccessToken } from "@/features/auth/api/authUtils";

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  TIMEOUT: 10000,
};

/**
 * Build request headers with a fresh access token.
 * Call this per-request so the token is always current.
 */
export function getAuthHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}