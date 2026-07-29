import { API_CONFIG } from "../config/api";
import { getAuthHeaders } from "@/features/auth/utills/authUtils";

/**
 * Fetch available payment packages.
 * GET /api/v1/payment/packages
 * @returns {Promise<Array>} The packages array
 */
export async function getPackages() {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/packages`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new tier package (admin).
 * POST /api/v1/payment/packages
 * @param {{ name: string, description?: string, tokenAmount: number, price: number, validityDays: number, displayOrder: number }} payload
 * @returns {Promise<Object>} The created package
 */
export async function createPackage(payload) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/packages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create package: ${response.status}`);
  }

  return response.json();
}

/**
 * Update an existing tier package (admin).
 * PUT /api/v1/payment/packages/:id
 * @param {number|string} packageId
 * @param {{ name: string, description?: string, tokenAmount: number, price: number, validityDays: number, isActive: boolean, displayOrder: number }} payload
 * @returns {Promise<Object>} The updated package
 */
export async function updatePackage(packageId, payload) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/packages/${packageId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update package: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Delete a tier package (admin).
 * DELETE /api/v1/payment/packages/:id
 * @param {number|string} packageId
 * @returns {Promise<void>}
 */
export async function deletePackage(packageId) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/packages/${packageId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete package: ${response.status}`);
  }
}

/**
 * Create a payment order and get the VNPay redirect URL.
 * POST /api/v1/payment/orders
 * @param {number} packageId - The package to purchase
 * @returns {Promise<{ paymentUrl: string }>} The VNPay payment URL to redirect the user to
 */
export async function createOrder(packageId) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/orders`;

  // Build returnUrl pointing to FE's payment result page
  const returnUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/payment/result`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ packageId, returnUrl }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create order: ${response.status}`);
  }

  return response.json();
}


/**
 * Verify payment by forwarding VNPay query params to backend.
 * GET /api/v1/payment/vnpay/return?vnp_Amount=...&vnp_ResponseCode=...
 * @param {string} queryString - The full query string from VNPay redirect (including '?')
 * @returns {Promise<{ success: boolean, message: string, orderId?: number, tokensAdded?: number }>}
 */
export async function verifyPayment(queryString) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/vnpay/return${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Verification failed: ${response.status}`);
  }

  return response.json();
}


/**
 * Fetch the current user's payment history.
 * GET /api/v1/payment/orders
 * @returns {Promise<Array>} List of past orders
 */
export async function getPaymentHistory() {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/orders`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment history: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch the current user's wallet transaction history.
 * GET /api/v1/payment/wallet/me/history
 * @returns {Promise<Array>} List of wallet transactions
 */
export async function getWalletHistory() {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/wallet/me/history`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet history: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch a specific user's wallet info.
 * GET /api/v1/payment/wallet/user/:userId
 * @param {number|string} userId - The user ID
 * @returns {Promise<Object>} The user's wallet data
 */
export async function getUserWallet(userId) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/payment/wallet/user/${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user wallet: ${response.status}`);
  }

  return response.json();
}
