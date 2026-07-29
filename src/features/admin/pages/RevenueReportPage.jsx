import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, ChevronLeft, ChevronRight, Download, Loader2,
  RefreshCw, RotateCcw, Search, WalletCards, X,
} from "lucide-react";
import {
  exportRevenueOrdersCsv, getDailyRevenue, getMonthlyRevenue,
  getRevenueBlobErrorMessage, getRevenueErrorMessage, getRevenueOrders, getRevenueSummary,
  getStudentRevenueHistory, refundOrder,
} from "@/features/admin/api/revenueReportApi";
import {
  mapOrders, mapSummary,
  mapDailyRevenue, mapMonthlyRevenue, mapRefundOrderResponse,
  mapStudentRevenueHistory,
} from "@/features/admin/utils/revenueReportAdapters";
import RevenueLineChart from "@/features/admin/components/revenue-report/RevenueLineChart";
import PaidOrdersBarChart from "@/features/admin/components/revenue-report/PaidOrdersBarChart";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const number = new Intl.NumberFormat("vi-VN");
const today = new Date();
const isoDate = (date) => date.toISOString().slice(0, 10);
const initialFrom = new Date(today.getFullYear(), today.getMonth(), 1);

function display(value) {
  return value == null || value === "" || (typeof value === "number" && !Number.isFinite(value))
    ? "—"
    : value;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatMetric(key, value) {
  if (value == null || value === "") return "—";
  if (/revenue|amount|price|cost|refund/i.test(key) && Number.isFinite(Number(value))) {
    return money.format(Number(value));
  }
  if (/Pct$/.test(key) && Number.isFinite(Number(value))) {
    return `${number.format(Number(value))}%`;
  }
  return Number.isFinite(Number(value)) ? number.format(Number(value)) : String(value);
}

function ErrorState({ message, retry }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 text-sm text-red-400">
      <span className="flex items-center gap-2"><AlertCircle size={15} />{message}</span>
      {retry && <button onClick={retry} className="underline">Thử lại</button>}
    </div>
  );
}

function Skeleton({ rows = 3 }) {
  return <div className="p-5 space-y-3 animate-pulse">{Array.from({ length: rows }).map((_, i) =>
    <div key={i} className="h-8 rounded-lg bg-black/5 dark:bg-white/5" />)}</div>;
}

function Panel({ title, children, action }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-app-border bg-panel">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-app-border px-5 py-3">
        <h2 className="text-sm font-semibold text-app">{title}</h2>{action}
      </header>
      {children}
    </section>
  );
}

function Modal({ title, close, children }) {
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-app-border bg-panel shadow-2xl">
      <header className="sticky top-0 flex items-center justify-between border-b border-app-border bg-panel px-5 py-4">
        <h2 className="text-base font-semibold text-app">{title}</h2>
        <button onClick={close} aria-label="Đóng"><X size={18} /></button>
      </header>{children}
    </div>
  </div>;
}

export default function RevenueReportPage() {
  const [filters, setFilters] = useState({ from: isoDate(initialFrom), to: isoDate(today), status: "", search: "", page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState("daily");
  const [year, setYear] = useState(today.getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState({ loading: true, data: [], error: "" });
  const [chart, setChart] = useState({ loading: true, data: [], error: "" });
  const [orders, setOrders] = useState({ loading: true, data: mapOrders([]), error: "" });
  const [history, setHistory] = useState(null);
  const [refund, setRefund] = useState(null);
  const [notice, setNotice] = useState(null);
  const [exporting, setExporting] = useState(false);
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message, kind = "success") => {
    setNotice({ message, kind });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFilters((old) => ({ ...old, search: searchInput, page: 1 })), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setSummary((s) => ({ ...s, loading: true, error: "" }));
    getRevenueSummary().then((data) => active && setSummary({ loading: false, data: mapSummary(data), error: "" }))
      .catch((e) => active && setSummary({ loading: false, data: [], error: getRevenueErrorMessage(e) }));
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    setChart((s) => ({ ...s, loading: true, error: "" }));
    const request = tab === "daily"
      ? getDailyRevenue({ from: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : null, to: filters.to ? new Date(`${filters.to}T23:59:59`).toISOString() : null })
      : getMonthlyRevenue({ year });
    request.then((data) => {
      if (!active) return;
      const mapped = tab === "monthly"
        ? mapMonthlyRevenue(data).items
        : mapDailyRevenue(data).items;
      setChart({ loading: false, data: mapped, error: "" });
    })
      .catch((e) => active && setChart({ loading: false, data: [], error: getRevenueErrorMessage(e) }));
    return () => { active = false; };
  }, [tab, year, filters.from, filters.to, refreshKey]);

  useEffect(() => {
    let active = true;
    setOrders((s) => ({ ...s, loading: true, error: "" }));
    const params = { ...filters, from: filters.from || null, to: filters.to || null };
    getRevenueOrders(params).then((data) => active && setOrders({ loading: false, data: mapOrders(data, filters.page, filters.pageSize), error: "" }))
      .catch((e) => active && setOrders({ loading: false, data: mapOrders([]), error: getRevenueErrorMessage(e) }));
    return () => { active = false; };
  }, [filters, refreshKey]);

  const setPreset = (days) => {
    const end = new Date();
    const start = days === "month" ? new Date(end.getFullYear(), end.getMonth(), 1) : new Date(Date.now() - (days - 1) * 86400000);
    setFilters((f) => ({ ...f, from: isoDate(start), to: isoDate(end), page: 1 }));
  };

  const openHistory = async (order) => {
    setHistory({ loading: true, data: null, error: "", order });
    try {
      const data = await getStudentRevenueHistory(order.userId);
      setHistory({ loading: false, data: mapStudentRevenueHistory(data), error: "", order });
    } catch (e) {
      setHistory({ loading: false, data: null, error: getRevenueErrorMessage(e), order });
    }
  };

  const doRefund = async () => {
    setRefund((r) => ({ ...r, loading: true, error: "" }));
    try {
      const response = mapRefundOrderResponse(
        await refundOrder(refund.order.id, { reason: refund.reason.trim() })
      );
      setRefund(null);
      showNotice(display(response.message));
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setRefund((r) => ({ ...r, loading: false, error: getRevenueErrorMessage(e, "Hoàn tiền thất bại.") }));
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const params = {
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };
      const response = await exportRevenueOrdersCsv(params);
      const disposition = response.headers["content-disposition"] || "";
      const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1];
      const filename = encoded ? decodeURIComponent(encoded) : plain || `revenue-orders-${isoDate(today)}.csv`;
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
      URL.revokeObjectURL(url); showNotice("Đã xuất báo cáo CSV.");
    } catch (e) { showNotice(await getRevenueBlobErrorMessage(e), "error"); }
    finally { setExporting(false); }
  };

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (/success|completed|paid/.test(value)) return "bg-emerald-500/10 text-emerald-400";
    if (/pending/.test(value)) return "bg-yellow-500/10 text-yellow-400";
    if (/failed|cancel|expired/.test(value)) return "bg-red-500/10 text-red-400";
    if (/refund/.test(value)) return "bg-violet-500/10 text-violet-400";
    return "bg-black/5 dark:bg-white/5 text-app";
  };

  const monthlyTotals = useMemo(() => chart.data.reduce((totals, row) => ({
    revenue: totals.revenue + (Number(row.revenue) || 0),
    orders: totals.orders + (Number(row.orders) || 0),
    newStudents: totals.newStudents + (Number(row.newStudents) || 0),
  }), { revenue: 0, orders: 0, newStudents: 0 }), [chart.data]);
  const dailyTotals = useMemo(() => chart.data.reduce((totals, row) => ({
    revenue: totals.revenue + (Number(row.revenue) || 0),
    orders: totals.orders + (Number(row.orders) || 0),
  }), { revenue: 0, orders: 0 }), [chart.data]);

  return <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 xl:p-8">
    {notice && <div className={`fixed right-5 top-16 z-[110] rounded-xl px-4 py-3 text-sm text-white shadow-xl ${notice.kind === "error" ? "bg-red-500" : "bg-emerald-500"}`}>{notice.message}</div>}
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div><p className="mb-1 text-xs uppercase tracking-widest text-app opacity-40">Admin</p>
        <h1 className="text-2xl font-bold leading-tight text-app">Revenue Report</h1>
        <p className="mt-1 text-sm text-app opacity-50">Track revenue, orders, service packages, and token usage.</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setRefreshKey((k) => k + 1)} className="flex items-center gap-2 rounded-xl border border-app-border bg-panel px-4 py-2 text-sm"><RefreshCw size={15} /> Refresh</button>
        <button disabled={exporting} onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export CSV</button>
      </div>
    </div>

    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-app-border bg-panel p-4">
      <label className="text-xs text-app opacity-60">From<input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))} className="mt-1 block rounded-lg border border-app-border bg-transparent px-3 py-2 text-sm text-app" /></label>
      <label className="text-xs text-app opacity-60">To<input type="date" value={filters.to} min={filters.from} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))} className="mt-1 block rounded-lg border border-app-border bg-transparent px-3 py-2 text-sm text-app" /></label>
      {[["7 days", 7], ["30 days", 30], ["Month", "month"]].map(([label, value]) => <button key={label} onClick={() => setPreset(value)} className="rounded-lg bg-black/5 px-3 py-2 text-xs text-app dark:bg-white/5">{label}</button>)}
    </div>

    {summary.loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-app-border bg-panel p-5"><div className="h-4 w-4 rounded bg-black/10 dark:bg-white/10" /><div className="mt-5 h-6 w-24 rounded bg-black/10 dark:bg-white/10" /><div className="mt-2 h-3 w-32 rounded bg-black/10 dark:bg-white/10" /></div>)}</div>
      : summary.error ? <Panel title="Tổng quan"><ErrorState message={summary.error} retry={() => setRefreshKey((k) => k + 1)} /></Panel>
        : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summary.data.length ? summary.data.map((item) => <div key={item.key} className="rounded-2xl border border-app-border bg-panel p-5"><WalletCards size={18} className="mb-5 text-emerald-400" /><p className="text-2xl font-bold text-app">{formatMetric(item.key, item.value)}</p><p className="mt-1 text-xs text-app opacity-45">{item.label}</p></div>) : <p className="text-sm opacity-40">Không có dữ liệu tổng quan.</p>}</div>}

    <Panel title="Revenue over time" action={<div className="flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
      {["daily", "monthly"].map((value) => <button key={value} onClick={() => setTab(value)} aria-pressed={tab === value} className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${tab === value ? "bg-emerald-500 text-white shadow-sm" : "text-app opacity-50 hover:opacity-90"}`}>{value}</button>)}</div>}>
      {tab === "monthly" && <div className="px-5 pt-4"><select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-lg border border-app-border bg-panel px-3 py-2 text-sm">{[0, 1, 2, 3, 4].map((n) => <option key={n}>{today.getFullYear() - n}</option>)}</select></div>}
      {tab === "monthly" && !chart.loading && !chart.error && chart.data.length > 0 && <div className="grid gap-3 px-5 pt-4 sm:grid-cols-3">
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{money.format(monthlyTotals.revenue)}</p><p className="mt-1 text-xs text-app opacity-45">Annual revenue {year}</p></div>
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{number.format(monthlyTotals.orders)}</p><p className="mt-1 text-xs text-app opacity-45">Order has been paid</p></div>
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{money.format(monthlyTotals.revenue / chart.data.length)}</p><p className="mt-1 text-xs text-app opacity-45">Average monthly revenue</p></div>
      </div>}
      {tab === "daily" && !chart.loading && !chart.error && chart.data.length > 0 && <div className="grid gap-3 px-5 pt-4 sm:grid-cols-3">
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{money.format(dailyTotals.revenue)}</p><p className="mt-1 text-xs text-app opacity-45">Revenue in the range</p></div>
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{number.format(dailyTotals.orders)}</p><p className="mt-1 text-xs text-app opacity-45">Paid Orders</p></div>
        <div className="rounded-xl border border-transparent bg-black/[.03] p-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-md dark:bg-white/[.03]"><p className="text-xl font-bold tracking-tight text-app">{money.format(dailyTotals.revenue / chart.data.length)}</p><p className="mt-1 text-xs text-app opacity-45">Average days revenue</p></div>
      </div>}
      {chart.loading ? <Skeleton rows={6} /> : chart.error ? <ErrorState message={chart.error} retry={() => setRefreshKey((key) => key + 1)} /> : <div className="min-w-0 space-y-6 p-4 sm:p-5">
        <RevenueLineChart rows={chart.data} period={tab} />
        <div className="border-t border-app-border pt-5">
          <PaidOrdersBarChart rows={chart.data} period={tab} />
        </div>
      </div>}
    </Panel>

    <Panel title="Order list">
      <div className="flex flex-wrap gap-3 border-b border-app-border p-4">
        <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-2.5 opacity-35" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Mã đơn hàng hoặc người dùng" className="w-full rounded-lg border border-app-border bg-transparent py-2 pl-9 pr-3 text-sm" /></div>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} className="rounded-lg border border-app-border bg-panel px-3 py-2 text-sm"><option value="">All Status</option><option>Pending</option><option>Paid</option><option>Expired</option><option>Failed</option><option>Refunded</option></select>
      </div>
      {orders.loading ? <Skeleton rows={7} /> : orders.error ? <ErrorState message={orders.error} /> : <div className="overflow-x-auto">
        {orders.data.items.length > 0 && <div className="grid gap-3 border-b border-app-border p-4 sm:grid-cols-3">
          <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold text-app">{money.format(Number(orders.data.totalRevenue ?? 0))}</p><p className="text-xs opacity-45">Revenue by filter</p></div>
          <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold text-app">{number.format(orders.data.totalCount)}</p><p className="text-xs opacity-45">Total order by filter</p></div>
          <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold text-app">{number.format(orders.data.items.length)}</p><p className="text-xs opacity-45">Current Order</p></div>
        </div>}
        {!orders.data.items.length ? <p className="py-16 text-center text-sm opacity-40">Không có đơn hàng</p> : <table className="w-full min-w-[1100px] text-left text-sm"><thead className="border-b border-app-border text-xs opacity-40"><tr><th className="px-5 py-3">Mã đơn</th><th>User</th><th>Package</th><th>Prices</th><th>Token</th><th>Status</th><th>VNPAY Info</th><th>Payment date</th>
          {/* <th>Thao tác</th> */}
        </tr></thead>
          <tbody>{orders.data.items.map((order) => <tr key={order.key} className="border-b border-app-border last:border-0"><td className="px-5 py-3 font-medium">{display(order.orderRef)}</td><td>{order.userId != null ? <button onClick={() => openHistory(order)} className="text-left text-emerald-400 hover:underline"><span className="block">{display(order.userFullName)}</span><span className="block text-xs opacity-60">{display(order.userEmail)}</span></button> : <><span className="block">{display(order.userFullName)}</span><span className="block text-xs opacity-60">{display(order.userEmail)}</span></>}</td><td>{display(order.packageName)}</td><td>{formatMetric("amount", order.amountPaid)}</td><td>{formatMetric("tokens", order.tokenAmount)}</td><td><span className={`rounded-full px-2 py-1 text-xs ${statusClass(order.status)}`}>{display(order.status)}</span></td><td><span className="block">{display(order.vnpayBankCode)}</span><span className="block text-xs opacity-50">{display(order.vnpayCardType)} · {display(order.vnpayTransactionId)}</span></td><td>{formatDate(order.paidAtUtc)}</td>
          {/* <td>{order.refundable && order.id != null ? <button onClick={() => setRefund({ order, reason: "", loading: false, error: "" })} className="flex items-center gap-1 text-xs text-red-400"><RotateCcw size={13} /> Refund</button> : "—"}</td> */}
          </tr>)}</tbody></table>}
        <div className="flex items-center justify-between p-4 text-xs opacity-60"><span>{number.format(orders.data.totalCount)} Order</span><div className="flex items-center gap-2"><button disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}><ChevronLeft size={16} /></button><span>{orders.data.page} / {Math.max(1, orders.data.totalPages)}</span><button disabled={orders.data.page >= orders.data.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}><ChevronRight size={16} /></button></div></div>
      </div>}
    </Panel>

    {history && <Modal title="Lịch sử thanh toán" close={() => setHistory(null)}>{history.loading ? <Skeleton rows={6} /> : history.error ? <ErrorState message={history.error} retry={() => openHistory(history.order)} /> : <HistoryContent data={history.data} refresh={() => openHistory(history.order)} />}</Modal>}
    {refund && <Modal title="Xác nhận hoàn tiền" close={() => !refund.loading && setRefund(null)}><div className="space-y-4 p-5"><div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-500">Thao tác hoàn tiền có thể không thể hoàn tác. Backend sẽ chuyển đơn sang Refunded và thu hồi token của đơn khỏi ví học sinh.</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-black/[.03] p-3 dark:bg-white/[.03]"><p className="truncate text-sm font-semibold">{display(refund.order.orderRef ?? refund.order.id)}</p><p className="text-xs opacity-45">Order Code</p></div><div className="rounded-xl bg-black/[.03] p-3 dark:bg-white/[.03]"><p className="text-sm font-semibold">{formatMetric("amount", refund.order.amountPaid)}</p><p className="text-xs opacity-45">Prices</p></div><div className="rounded-xl bg-black/[.03] p-3 dark:bg-white/[.03]"><p className="text-sm font-semibold">{formatMetric("tokens", refund.order.tokenAmount)}</p><p className="text-xs opacity-45">Token thu hồi</p></div><div className="rounded-xl bg-black/[.03] p-3 dark:bg-white/[.03]"><p className="text-sm font-semibold">{display(refund.order.status)}</p><p className="text-xs opacity-45">Status</p></div></div><label className="block text-sm">Lý do hoàn tiền<textarea value={refund.reason} onChange={(e) => setRefund((r) => ({ ...r, reason: e.target.value }))} rows={4} className="mt-2 w-full rounded-xl border border-app-border bg-transparent p-3" required /></label>{refund.error && <ErrorState message={refund.error} />}<div className="flex justify-end gap-2"><button disabled={refund.loading} onClick={() => setRefund(null)} className="rounded-lg px-4 py-2 text-sm">Hủy</button><button disabled={refund.loading || !refund.reason.trim()} onClick={doRefund} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white disabled:opacity-50">{refund.loading && <Loader2 size={14} className="animate-spin" />} Xác nhận hoàn tiền</button></div></div></Modal>}
  </div>;
}

function HistoryContent({ data, refresh }) {
  if (!data) return <p className="p-8 text-center text-sm opacity-40">No Data</p>;
  return <div className="space-y-6 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="font-semibold text-app">{display(data.fullName)}</p><p className="text-sm opacity-50">{display(data.email)}</p></div>
      <button onClick={refresh} className="flex items-center gap-2 rounded-lg border border-app-border px-3 py-2 text-xs"><RefreshCw size={13} /> Refresh</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold">{money.format(Number(data.totalSpent ?? 0))}</p><p className="text-xs opacity-45">Total spent</p></div>
      <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold">{number.format(Number(data.totalOrders ?? 0))}</p><p className="text-xs opacity-45">Total order</p></div>
      <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold">{formatMetric("tokens", data.availableTokens)}</p><p className="text-xs opacity-45">Total tokens available</p></div>
      <div className="rounded-xl bg-black/[.03] p-4 dark:bg-white/[.03]"><p className="text-lg font-semibold">{formatMetric("tokens", data.usedTokens)}</p><p className="text-xs opacity-45">Tokens used</p></div>
    </div>
    <p className="text-xs opacity-50">Expired history: {formatDate(data.walletExpiresAtUtc)}</p>
    <section>
      <h3 className="mb-3 text-sm font-semibold text-app">Order</h3>
      {!data.orders.length ? <p className="rounded-xl border border-app-border py-8 text-center text-sm opacity-40">No Order</p> : <div className="space-y-3">{data.orders.map((order) => <div key={order.id} className="rounded-xl border border-app-border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm font-medium">{display(order.packageName)}</p><p className="text-xs opacity-45">{display(order.orderRef)}</p></div><div className="text-right"><p className="text-sm font-medium">{formatMetric("amount", order.amountPaid)}</p><p className="text-xs opacity-45">{display(order.status)}</p></div></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs opacity-50"><span>{formatMetric("tokens", order.tokenAmount)} token</span><span>{formatDate(order.paidAtUtc ?? order.createdAtUtc)}</span></div></div>)}</div>}
    </section>
    <section>
      <h3 className="mb-3 text-sm font-semibold text-app">Most recent token transaction</h3>
      {!data.recentTransactions.length ? <p className="rounded-xl border border-app-border py-8 text-center text-sm opacity-40">No token transactions</p> : <div className="divide-y divide-app-border rounded-xl border border-app-border">{data.recentTransactions.map((transaction) => <div key={transaction.id} className="flex items-start justify-between gap-4 p-3"><div><p className="text-sm font-medium">{display(transaction.type)}</p><p className="text-xs opacity-45">{display(transaction.description)}</p><p className="mt-1 text-xs opacity-35">{formatDate(transaction.createdAtUtc)}</p></div><div className="text-right"><p className={`text-sm font-semibold ${Number(transaction.delta) >= 0 ? "text-emerald-400" : "text-red-400"}`}>{Number(transaction.delta) > 0 ? "+" : ""}{formatMetric("tokens", transaction.delta)}</p><p className="text-xs opacity-45">Number of {formatMetric("tokens", transaction.balanceAfter)}</p></div></div>)}</div>}
    </section>
  </div>;
}
