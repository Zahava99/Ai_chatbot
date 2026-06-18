import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

/**
 * GET /api/v1/admin/users
 * Returns a paginated list of all users.
 */
export async function fetchAdminUsers({ page = 1, pageSize = 100, search = "" } = {}) {
  let url = `${API_CONFIG.BASE_URL}/api/v1/admin/users?page=${page}&pageSize=${pageSize}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
  }

  return res.json(); // { items, page, pageSize, totalCount, totalPages }
}

/**
 * POST /api/v1/admin/users
 * Creates a new user. Roles are assigned by the backend based on the provided roles array.
 * @param {{ email: string, fullName: string, password: string, roles: string[] }} payload
 */
export async function createAdminUser(payload) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/admin/users`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Try to extract a server error message if available
    let message = `Failed to create user: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch (_) { /* ignore parse errors */ }
    throw new Error(message);
  }

  return res.json();
}
