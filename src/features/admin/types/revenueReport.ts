/**
 * Mirrors GetRevenueSummary.PackageRevenueSummary in
 * Chatbot.Application.Features.Payment.RevenueReportFeatures.
 */
export interface PackageRevenueSummary {
  packageId: number;
  packageName: string;
  price: number;
  tokenAmount: number;
  orderCount: number;
  revenue: number;
  tokensIssued: number;
  revenueSharePct: number;
}

/**
 * Direct JSON response from GET /api/v1/reports/revenue/summary.
 *
 * ASP.NET Core serializes the C# record properties as camelCase JSON.
 * None of these properties are nullable in the backend DTO.
 */
export interface RevenueSummaryResponse {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  monthOverMonthGrowthPct: number;
  totalOrders: number;
  ordersThisMonth: number;
  pendingOrders: number;
  failedOrders: number;
  totalStudentsWithWallet: number;
  activeWallets: number;
  expiredWallets: number;
  conversionRatePct: number;
  totalTokensIssued: number;
  totalTokensConsumed: number;
  totalTokensRemaining: number;
  tokenConsumptionRatePct: number;
  topPackages: PackageRevenueSummary[];
}

/** Mirrors GetMonthlyRevenue.MonthlyData in the backend application layer. */
export interface MonthlyRevenueData {
  month: number;
  monthName: string;
  revenue: number;
  orders: number;
  newStudents: number;
}

/**
 * Direct response envelope returned by RevenueReportController.GetMonthly.
 */
export interface MonthlyRevenueResponse {
  year: number;
  data: MonthlyRevenueData[];
}

/** Mirrors GetDailyRevenue.DailyData in the backend application layer. */
export interface DailyRevenueData {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * Direct response envelope returned by RevenueReportController.GetDaily.
 * `from`, `to` and each data item's `date` use yyyy-MM-dd.
 */
export interface DailyRevenueResponse {
  from: string;
  to: string;
  data: DailyRevenueData[];
}

/** Mirrors GetPackageStats.PackageStat in the backend application layer. */
export interface PackageRevenueStat {
  packageId: number;
  name: string;
  description?: string | null;
  price: number;
  tokenAmount: number;
  isActive: boolean;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  totalTokensIssued: number;
  avgRevenuePerDay: number;
}

/** GET /api/v1/reports/revenue/packages returns the array directly. */
export type PackageRevenueResponse = PackageRevenueStat[];

export type RevenueOrderStatus =
  | "Pending"
  | "Paid"
  | "Expired"
  | "Failed"
  | "Refunded";

/** Mirrors ListOrders.OrderDto in the backend application layer. */
export interface RevenueOrder {
  id: number;
  orderRef: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  packageId: number;
  packageName: string;
  amountPaid: number;
  tokenAmount: number;
  status: RevenueOrderStatus;
  vnpayTransactionId?: string | null;
  vnpayBankCode?: string | null;
  vnpayCardType?: string | null;
  paidAtUtc?: string | null;
  createdAtUtc: string;
  expiredAtUtc: string;
}

/** Direct response returned by ListOrders.Result. */
export interface RevenueOrdersResponse {
  items: RevenueOrder[];
  totalCount: number;
  totalRevenue: number;
}

export interface RevenueOrdersParams {
  status?: RevenueOrderStatus;
  userId?: number;
  packageId?: number;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Mirrors GetStudentPurchaseHistory.TransactionRow. */
export interface StudentTokenTransaction {
  id: number;
  type: string;
  delta: number;
  balanceAfter: number;
  description?: string | null;
  createdAtUtc: string;
}

/** Direct response returned by GetStudentPurchaseHistory.StudentPurchaseHistory. */
export interface StudentRevenueHistoryResponse {
  userId: number;
  fullName: string;
  email: string;
  availableTokens: number;
  usedTokens: number;
  walletExpiresAtUtc?: string | null;
  totalSpent: number;
  totalOrders: number;
  orders: RevenueOrder[];
  recentTransactions: StudentTokenTransaction[];
}

/** Body accepted by RefundOrderRequest. */
export interface RefundOrderRequest {
  reason: string;
}

/** Response returned for a successful or business-rule refund result. */
export interface RefundOrderResponse {
  message: string;
}

export interface RevenueOrdersExportParams {
  status?: RevenueOrderStatus;
  from?: string;
  to?: string;
}

/**
 * Logical schema of one exported CSV row. The endpoint serializes these fields
 * into CSV bytes rather than returning JSON objects.
 */
export interface RevenueOrdersCsvRow {
  id: number;
  orderRef: string;
  userEmail: string;
  userFullName: string;
  packageName: string;
  amountPaid: number;
  tokenAmount: number;
  status: RevenueOrderStatus;
  vnpayTransactionId?: string | null;
  vnpayBankCode?: string | null;
  paidAtUtc?: string | null;
  createdAtUtc: string;
}

export type RevenueOrdersCsvResponse = Blob;

/** Mirrors GetTokenUsageStats.TopUser. */
export interface TokenUsageTopUser {
  userId: number;
  fullName: string;
  email: string;
  availableTokens: number;
  usedTokens: number;
  totalSpent: number;
}

/** Direct response returned by GetTokenUsageStats.Result. */
export interface TokenUsageResponse {
  topByUsage: TokenUsageTopUser[];
  topBySpend: TokenUsageTopUser[];
  activeWallets: number;
  expiredWallets: number;
  zeroBalanceWallets: number;
  avgTokensPerStudent: number;
}
