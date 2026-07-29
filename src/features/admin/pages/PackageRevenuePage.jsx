import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  getPackageRevenue,
  getRevenueErrorMessage,
} from "@/features/admin/api/revenueReportApi";
import { mapPackages } from "@/features/admin/utils/revenueReportAdapters";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
const number = new Intl.NumberFormat("vi-VN");
const COLORS = ["#34d399", "#60a5fa", "#a78bfa", "#fbbf24", "#fb7185"];

function display(value) {
  return value == null || value === "" ? "—" : value;
}

function formatNumber(value) {
  return value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : number.format(Number(value));
}

function formatMoney(value) {
  return value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : money.format(Number(value));
}

function Skeleton() {
  return <div className="space-y-5 p-6 animate-pulse">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
      ))}
    </div>
    <div className="h-3 rounded-full bg-black/5 dark:bg-white/5" />
    <div className="h-80 rounded-2xl bg-black/5 dark:bg-white/5" />
  </div>;
}

export default function PackageRevenuePage() {
  const [state, setState] = useState({ loading: true, data: [], error: "" });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await getPackageRevenue();
      setState({ loading: false, data: mapPackages(response), error: "" });
    } catch (error) {
      setState({ loading: false, data: [], error: getRevenueErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totals = useMemo(() => state.data.reduce((result, item) => ({
    revenue: result.revenue + (Number(item.totalRevenue) || 0),
    paidOrders: result.paidOrders + (Number(item.paidOrders) || 0),
    tokensIssued: result.tokensIssued + (Number(item.totalTokensIssued) || 0),
    activePackages: result.activePackages + (item.isActive ? 1 : 0),
  }), { revenue: 0, paidOrders: 0, tokensIssued: 0, activePackages: 0 }), [state.data]);

  return <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 xl:p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-app opacity-40">Admin Reports</p>
        <h1 className="text-2xl font-bold leading-tight text-app">Doanh thu theo gói dịch vụ</h1>
        <p className="mt-1 text-sm text-app opacity-50">
          Theo dõi doanh thu, số đơn và lượng token phát hành của từng gói dịch vụ.
        </p>
      </div>
      <button onClick={load} disabled={state.loading} className="flex items-center justify-center gap-2 rounded-xl border border-app-border bg-panel px-4 py-2.5 text-sm text-app disabled:opacity-50">
        <RefreshCw size={15} className={state.loading ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>

    <section className="overflow-hidden rounded-2xl border border-app-border bg-panel">
      {state.loading ? <Skeleton /> : state.error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-20 text-center">
          <AlertCircle size={24} className="text-red-400" />
          <p className="text-sm text-red-400">{state.error}</p>
          <button onClick={load} className="rounded-lg border border-app-border px-4 py-2 text-sm text-app">
            Thử lại
          </button>
        </div>
      ) : !state.data.length ? (
        <p className="py-20 text-center text-sm text-app opacity-40">Không có dữ liệu gói dịch vụ</p>
      ) : (
        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatMoney(totals.revenue)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Tổng doanh thu các gói</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(totals.paidOrders)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Đơn đã thanh toán</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(totals.tokensIssued)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Token đã phát hành</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(totals.activePackages)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Gói đang hoạt động</p>
            </div>
          </div>

          <div className="flex h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            {state.data.map((item, index) => (
              <span
                key={item.key}
                title={`${display(item.name)}: ${formatMoney(item.totalRevenue)}`}
                style={{
                  width: `${totals.revenue ? (Number(item.totalRevenue) / totals.revenue) * 100 : 0}%`,
                  background: COLORS[index % COLORS.length],
                }}
              />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-app-border text-xs text-app opacity-40">
                <tr>
                  <th className="px-3 py-3">Gói</th>
                  <th>Giá</th>
                  <th>Token</th>
                  <th>Tổng đơn</th>
                  <th>Đã thanh toán</th>
                  <th>Đang chờ</th>
                  <th>Thất bại</th>
                  <th>Doanh thu</th>
                  <th>TB/ngày</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {state.data.map((item) => (
                  <tr key={item.key} className="border-b border-app-border last:border-0">
                    <td className="px-3 py-3 font-medium text-app">{display(item.name)}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td>{formatNumber(item.tokenAmount)}</td>
                    <td>{formatNumber(item.totalOrders)}</td>
                    <td>{formatNumber(item.paidOrders)}</td>
                    <td>{formatNumber(item.pendingOrders)}</td>
                    <td>{formatNumber(item.failedOrders)}</td>
                    <td>{formatMoney(item.totalRevenue)}</td>
                    <td>{formatMoney(item.avgRevenuePerDay)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-1 text-xs ${item.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-black/5 text-app opacity-50 dark:bg-white/5"}`}>
                        {item.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  </div>;
}

