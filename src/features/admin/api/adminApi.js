import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

const adminClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Attach auth token to every request
adminClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET /api/v1/admin/users
 * Returns a paginated list of all users.
 */
export async function fetchAdminUsers({ page = 1, pageSize = 100, search = "" } = {}) {
  const params = { page, pageSize };
  if (search) params.search = search;

  const { data } = await adminClient.get("/api/v1/admin/users", { params });
  return data; // { items, page, pageSize, totalCount, totalPages }
}

/**
 * POST /api/v1/admin/users
 * Creates a new user. Roles are assigned by the backend based on the provided roles array.
 * @param {{ email: string, fullName: string, password: string, roles: string[] }} payload
 */
export async function createAdminUser(payload) {
  try {
    const { data } = await adminClient.post("/api/v1/admin/users", payload);
    return data;
  } catch (err) {
    // Extract server error message if available
    const message =
      err.response?.data?.message ??
      `Failed to create user: ${err.response?.status ?? err.message}`;
    throw new Error(message);
  }
}
