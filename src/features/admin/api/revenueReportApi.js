import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { ensureFreshToken } from "@/features/auth/api/authUtils";

const revenueClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

revenueClient.interceptors.request.use(async (config) => {
  const token = await ensureFreshToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

/**
 * @returns {Promise<import("../types/revenueReport").RevenueSummaryResponse>}
 */
export function getRevenueSummary() {
  return revenueClient.get("/api/v1/reports/revenue/summary").then(({ data }) => data);
}

/**
 * @param {{ year?: number }} params
 * @returns {Promise<import("../types/revenueReport").MonthlyRevenueResponse>}
 */
export function getMonthlyRevenue(params) {
  return revenueClient
    .get("/api/v1/reports/revenue/monthly", { params: cleanParams(params) })
    .then(({ data }) => data);
}

/**
 * @param {{ from?: string, to?: string }} params
 * @returns {Promise<import("../types/revenueReport").DailyRevenueResponse>}
 */
export function getDailyRevenue(params) {
  return revenueClient
    .get("/api/v1/reports/revenue/daily", { params: cleanParams(params) })
    .then(({ data }) => data);
}

/** @returns {Promise<import("../types/revenueReport").PackageRevenueResponse>} */
export function getPackageRevenue() {
  return revenueClient.get("/api/v1/reports/revenue/packages").then(({ data }) => data);
}

/**
 * @param {import("../types/revenueReport").RevenueOrdersParams} params
 * @returns {Promise<import("../types/revenueReport").RevenueOrdersResponse>}
 */
export function getRevenueOrders(params) {
  return revenueClient
    .get("/api/v1/reports/revenue/orders", { params: cleanParams(params) })
    .then(({ data }) => data);
}

/**
 * @param {number} userId
 * @returns {Promise<import("../types/revenueReport").StudentRevenueHistoryResponse>}
 */
export function getStudentRevenueHistory(userId) {
  return revenueClient
    .get(`/api/v1/reports/revenue/students/${encodeURIComponent(userId)}/history`)
    .then(({ data }) => data);
}

/**
 * @param {number} orderId
 * @param {import("../types/revenueReport").RefundOrderRequest} requestBody
 * @returns {Promise<import("../types/revenueReport").RefundOrderResponse>}
 */
export function refundOrder(orderId, requestBody) {
  return revenueClient
    .post(`/api/v1/reports/revenue/orders/${encodeURIComponent(orderId)}/refund`, requestBody)
    .then(({ data }) => data);
}

/**
 * @param {import("../types/revenueReport").RevenueOrdersExportParams} params
 * @returns {Promise<import("axios").AxiosResponse<import("../types/revenueReport").RevenueOrdersCsvResponse>>}
 */
export function exportRevenueOrdersCsv(params) {
  return revenueClient.get("/api/v1/reports/revenue/orders/export-csv", {
    params: cleanParams(params),
    responseType: "blob",
  });
}

/** @returns {Promise<import("../types/revenueReport").TokenUsageResponse>} */
export function getTokenUsage() {
  return revenueClient.get("/api/v1/reports/revenue/token-usage").then(({ data }) => data);
}

export function getRevenueErrorMessage(error, fallback = "Không thể tải dữ liệu.") {
  const status = error?.response?.status;
  const body = error?.response?.data;
  const backendMessage =
    (typeof body === "string" && body) ||
    body?.detail ||
    body?.message ||
    body?.title;
  if (backendMessage) return backendMessage;
  if (status === 401) return "Phiên đăng nhập đã hết hạn.";
  if (status === 403) return "Bạn không có quyền truy cập báo cáo doanh thu.";
  if (status === 404) return "Không tìm thấy dữ liệu.";
  if (status >= 500) return "Hệ thống đang gặp lỗi. Vui lòng thử lại sau.";
  if (error?.code === "ERR_NETWORK" || (!error?.response && error?.request)) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  }
  return fallback;
}

export async function getRevenueBlobErrorMessage(error, fallback = "Không thể xuất CSV.") {
  const blob = error?.response?.data;
  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const body = JSON.parse(text);
      error.response.data = body;
    } catch {
      // Keep the original Blob when the error body is not JSON.
    }
  }
  return getRevenueErrorMessage(error, fallback);
}
