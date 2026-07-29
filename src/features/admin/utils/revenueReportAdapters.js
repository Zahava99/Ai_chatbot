const CONTAINERS = ["data", "result"];
const LIST_KEYS = ["items", "orders", "transactions", "records", "history", "daily", "monthly", "packages", "models"];

export function unwrap(value) {
  let current = value;
  for (const key of CONTAINERS) {
    if (current && typeof current === "object" && !Array.isArray(current) && current[key] != null) {
      current = current[key];
    }
  }
  return current;
}

export function toList(value) {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (!unwrapped || typeof unwrapped !== "object") return [];
  const key = LIST_KEYS.find((candidate) => Array.isArray(unwrapped[candidate]));
  return key ? unwrapped[key] : [];
}

export function firstPresent(record, keys) {
  if (!record || typeof record !== "object") return undefined;
  const key = keys.find((candidate) => Object.prototype.hasOwnProperty.call(record, candidate));
  return key ? record[key] : undefined;
}

export function mapSeries(payload, period) {
  return toList(payload).map((row, index) => ({
    raw: row,
    key: firstPresent(row, ["date", "day", "month", "period", "label"]) ?? index,
    label: firstPresent(row, period === "daily"
      ? ["date", "day", "label"]
      : ["month", "period", "label"]),
    revenue: firstPresent(row, ["revenue", "totalRevenue", "amount"]),
    orderCount: firstPresent(row, ["orderCount", "totalOrders", "ordersCount"]),
  })).filter((row) => row.label != null || row.revenue != null);
}

export function mapMonthlyRevenue(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { year: undefined, items: [] };
  }

  const items = Array.isArray(payload.data)
    ? payload.data.map((row) => ({
        raw: row,
        key: row.month,
        label: row.monthName,
        month: row.month,
        revenue: row.revenue,
        orders: row.orders,
        newStudents: row.newStudents,
      }))
    : [];

  return { year: payload.year, items };
}

export function mapDailyRevenue(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { from: undefined, to: undefined, items: [] };
  }

  const items = Array.isArray(payload.data)
    ? payload.data.map((row) => ({
        raw: row,
        key: row.date,
        label: row.date,
        date: row.date,
        revenue: row.revenue,
        orders: row.orders,
      }))
    : [];

  return { from: payload.from, to: payload.to, items };
}

export function mapPackages(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((row, index) => ({
    raw: row,
    key: row.packageId ?? index,
    packageId: row.packageId,
    name: row.name,
    description: row.description,
    price: row.price,
    tokenAmount: row.tokenAmount,
    isActive: row.isActive,
    totalOrders: row.totalOrders,
    paidOrders: row.paidOrders,
    pendingOrders: row.pendingOrders,
    failedOrders: row.failedOrders,
    totalRevenue: row.totalRevenue,
    totalTokensIssued: row.totalTokensIssued,
    avgRevenuePerDay: row.avgRevenuePerDay,
  }));
}

export function mapOrders(payload, page = 1, pageSize = 20) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const totalCount = Number(payload?.totalCount ?? 0);
  return {
    items: items.map((row, index) => ({
      raw: row,
      key: row.id ?? index,
      id: row.id,
      orderRef: row.orderRef,
      userId: row.userId,
      userFullName: row.userFullName,
      userEmail: row.userEmail,
      packageId: row.packageId,
      packageName: row.packageName,
      amountPaid: row.amountPaid,
      tokenAmount: row.tokenAmount,
      status: row.status,
      vnpayTransactionId: row.vnpayTransactionId,
      vnpayBankCode: row.vnpayBankCode,
      vnpayCardType: row.vnpayCardType,
      paidAtUtc: row.paidAtUtc,
      createdAtUtc: row.createdAtUtc,
      expiredAtUtc: row.expiredAtUtc,
      refundable: row.status === "Paid",
    })),
    page: Number(page),
    pageSize: Number(pageSize),
    totalCount,
    totalRevenue: payload?.totalRevenue,
    totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
  };
}

export function mapStudentRevenueHistory(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return {
    userId: payload.userId,
    fullName: payload.fullName,
    email: payload.email,
    availableTokens: payload.availableTokens,
    usedTokens: payload.usedTokens,
    walletExpiresAtUtc: payload.walletExpiresAtUtc,
    totalSpent: payload.totalSpent,
    totalOrders: payload.totalOrders,
    orders: mapOrders({
      items: Array.isArray(payload.orders) ? payload.orders : [],
      totalCount: payload.totalOrders,
      totalRevenue: payload.totalSpent,
    }, 1, Math.max(1, payload.totalOrders ?? 1)).items,
    recentTransactions: Array.isArray(payload.recentTransactions)
      ? payload.recentTransactions.map((row) => ({
          id: row.id,
          type: row.type,
          delta: row.delta,
          balanceAfter: row.balanceAfter,
          description: row.description,
          createdAtUtc: row.createdAtUtc,
        }))
      : [],
  };
}

export function mapRefundOrderResponse(payload) {
  return {
    message: payload?.message,
  };
}

export function mapSummary(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

  const fields = [
    ["totalRevenue", "Total Revenue"],
    ["revenueThisMonth", "Revenue This Month"],
    ["revenueLastMonth", "Revenue Last Month"],
    ["monthOverMonthGrowthPct", "Month Over Month Growth"],
    ["totalOrders", "Total Orders"],
    ["ordersThisMonth", "Orders This Month"],
    ["pendingOrders", "Pending Orders"],
    ["failedOrders", "Failed Orders"],
    ["totalStudentsWithWallet", "Total Students With Wallet"],
    ["activeWallets", "Active Wallets"],
    ["expiredWallets", "Expired Wallets"],
    ["conversionRatePct", "Conversion Rate"],
    ["totalTokensIssued", "Total Tokens Issued"],
    ["totalTokensConsumed", "Total Tokens Consumed"],
    ["totalTokensRemaining", "Total Tokens Remaining"],
    ["tokenConsumptionRatePct", "Token Consumption Rate"],
  ];

  return fields
    .filter(([key]) => Object.prototype.hasOwnProperty.call(payload, key))
    .map(([key, label]) => ({ key, label, value: payload[key] }));
}

export function mapTokenUsage(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const mapUser = (row) => ({
    userId: row.userId,
    fullName: row.fullName,
    email: row.email,
    availableTokens: row.availableTokens,
    usedTokens: row.usedTokens,
    totalSpent: row.totalSpent,
  });
  return {
    activeWallets: payload.activeWallets,
    expiredWallets: payload.expiredWallets,
    zeroBalanceWallets: payload.zeroBalanceWallets,
    avgTokensPerStudent: payload.avgTokensPerStudent,
    topByUsage: Array.isArray(payload.topByUsage) ? payload.topByUsage.map(mapUser) : [],
    topBySpend: Array.isArray(payload.topBySpend) ? payload.topBySpend.map(mapUser) : [],
  };
}

export function humanize(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
