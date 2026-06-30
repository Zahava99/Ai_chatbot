import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

const MAX_USERS_PAGE_SIZE = 100;

async function parseErrorResponse(res, fallback) {
  try {
    const data = await res.json();
    return data.detail ?? data.message ?? data.title ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * GET /api/v1/admin/users
 * Returns a paginated list of all users.
 */
export async function fetchAdminUsers({ page = 1, pageSize = 100, search = "" } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(
    MAX_USERS_PAGE_SIZE,
    Math.max(1, Number(pageSize) || MAX_USERS_PAGE_SIZE)
  );
  let url = `${API_CONFIG.BASE_URL}/api/v1/admin/users?page=${safePage}&pageSize=${safePageSize}`;
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
    const message = await parseErrorResponse(
      res,
      `Failed to fetch users: ${res.status} ${res.statusText}`
    );
    throw new Error(message);
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
    const message = await parseErrorResponse(
      res,
      `Failed to create user: ${res.status} ${res.statusText}`
    );
    throw new Error(message);
  }

  return res.json();
}

/**
 * POST /api/v1/admin/users/:id/active
 * Activates or deactivates a user.
 */
export async function setAdminUserActive(id, isActive) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/admin/users/${id}/active`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const message = await parseErrorResponse(
      res,
      `Failed to update user status: ${res.status} ${res.statusText}`
    );
    throw new Error(message);
  }
}

