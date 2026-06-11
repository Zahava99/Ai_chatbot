import { API_CONFIG } from "@/config/api";
import { getAccessToken, getRefreshToken, storeTokens } from "@/features/auth/api/authUtils";

const AUTH_BASE = `${API_CONFIG.BASE_URL}/api/v1/auth`;

/**
 * POST /api/v1/auth/login
 * Stores access_token and refresh_token in sessionStorage on success.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ accessToken: string, refreshToken: string, accessTokenExpiresAtUtc: string, mustChangePassword: boolean }>}
 */
export async function login(email, password) {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = `Login failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  storeTokens(data);
  return data;
}

/**
 * POST /api/v1/auth/change-password
 * Requires a valid access token in sessionStorage.
 *
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function changePassword(currentPassword, newPassword) {
  const token = getAccessToken();

  const response = await fetch(`${AUTH_BASE}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    let message = `Change password failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
}

/**
 * GET /api/v1/auth/me
 * Returns the current user's profile, roles, and permissions.
 * Requires a valid access token in sessionStorage.
 *
 * @returns {Promise<{ id: number, email: string, fullName: string, mustChangePassword: boolean, roles: string[], permissions: string[] }>}
 */
export async function getMe() {
  const token = getAccessToken();
  const response = await fetch(`${AUTH_BASE}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = `Failed to fetch user profile (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data;
}

/**
 * POST /api/v1/auth/logout
 * Invalidates the session on the server. Requires the current access token.
 * The refresh token is sent in the body so the server can revoke it too.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();

  const response = await fetch(`${AUTH_BASE}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    let message = `Logout failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
}
