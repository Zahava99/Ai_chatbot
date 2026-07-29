import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  getRevenueErrorMessage,
  getTokenUsage,
} from "@/features/admin/api/revenueReportApi";
import { mapTokenUsage } from "@/features/admin/utils/revenueReportAdapters";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
const number = new Intl.NumberFormat("vi-VN");

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
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
      ))}
    </div>
    <div className="h-56 rounded-2xl bg-black/5 dark:bg-white/5" />
    <div className="h-56 rounded-2xl bg-black/5 dark:bg-white/5" />
  </div>;
}

function RankingTable({ title, rows, metric }) {
  return <section>
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-app opacity-50">{title}</h2>
    {!rows.length ? (
      <div className="grid h-36 place-items-center rounded-2xl border border-app-border text-sm text-app opacity-40">
        Không có dữ liệu xếp hạng
      </div>
    ) : (
      <div className="overflow-x-auto rounded-2xl border border-app-border">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-app-border text-xs text-app opacity-40">
            <tr>
              <th className="px-4 py-3">#</th>
              <th>Học sinh</th>
              <th>Token khả dụng</th>
              <th>Token đã dùng</th>
              <th>Đã chi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${metric}-${row.userId}`} className="border-b border-app-border last:border-0">
                <td className="px-4 py-3 text-app opacity-40">{index + 1}</td>
                <td>
                  <span className="block font-medium text-app">{display(row.fullName)}</span>
                  <span className="block text-xs text-app opacity-45">{display(row.email)}</span>
                </td>
                <td>{formatNumber(row.availableTokens)}</td>
                <td className={metric === "usage" ? "font-semibold text-emerald-400" : ""}>
                  {formatNumber(row.usedTokens)}
                </td>
                <td className={metric === "spend" ? "font-semibold text-emerald-400" : ""}>
                  {formatMoney(row.totalSpent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>;
}

export default function TokenUsagePage() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await getTokenUsage();
      setState({ loading: false, data: mapTokenUsage(response), error: "" });
    } catch (error) {
      setState({ loading: false, data: null, error: getRevenueErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 xl:p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-app opacity-40">Admin Reports</p>
        <h1 className="text-2xl font-bold leading-tight text-app">Token Usage</h1>
        <p className="mt-1 text-sm text-app opacity-50">
          Theo dõi tình trạng ví token và những học sinh sử dụng hoặc chi tiêu nhiều nhất.
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
      ) : !state.data ? (
        <p className="py-20 text-center text-sm text-app opacity-40">Không có dữ liệu</p>
      ) : (
        <div className="space-y-7 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(state.data.activeWallets)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Ví đang hoạt động</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(state.data.expiredWallets)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Ví đã hết hạn</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(state.data.zeroBalanceWallets)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Ví hết token</p>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-5 dark:bg-white/[.03]">
              <p className="text-2xl font-semibold text-app">{formatNumber(state.data.avgTokensPerStudent)}</p>
              <p className="mt-1 text-sm text-app opacity-45">Token khả dụng TB/học sinh</p>
            </div>
          </div>

          <RankingTable title="Top 10 sử dụng token" rows={state.data.topByUsage} metric="usage" />
          <RankingTable title="Top 10 chi tiêu" rows={state.data.topBySpend} metric="spend" />
        </div>
      )}
    </section>
  </div>;
}
