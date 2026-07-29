import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "@/features/admin/components/revenue-report/chartConfig";
import { useTheme } from "@/context/ThemeContext";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function RevenueLineChart({ rows, period }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const normalized = useMemo(() => (Array.isArray(rows) ? rows : []).map((row) => ({
    label: row?.label == null ? "—" : String(row.label),
    value: safeNumber(row?.revenue),
  })), [rows]);
  const allZero = normalized.length > 0 && normalized.every((item) => item.value === 0);

  const data = useMemo(() => ({
    labels: normalized.map((item) => item.label),
    datasets: [{
      label: "Revenue",
      data: normalized.map((item) => item.value),
      borderColor: "#34d399",
      pointBackgroundColor: "#34d399",
      pointBorderColor: isDark ? "#202427" : "#ffffff",
      pointBorderWidth: 2,
      pointRadius: normalized.length > 31 ? 2 : 3.5,
      pointHoverRadius: 6,
      borderWidth: 2.5,
      tension: 0.32,
      fill: true,
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(52, 211, 153, 0.12)";
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(52, 211, 153, 0.28)");
        gradient.addColorStop(1, "rgba(52, 211, 153, 0.01)");
        return gradient;
      },
    }],
  }), [isDark, normalized]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 450 },
    plugins: {
      title: {
        display: true,
        text: period === "monthly" ? "Revenue by month" : "Revenue by days",
        color: isDark ? "rgba(255,255,255,.82)" : "rgba(24,24,27,.82)",
        align: "start",
        font: { size: 13, weight: 600 },
      },
      legend: {
        display: true,
        align: "end",
        labels: {
          color: isDark ? "rgba(255,255,255,.58)" : "rgba(24,24,27,.58)",
          usePointStyle: true,
          pointStyle: "line",
          boxWidth: 28,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#181b1e" : "#ffffff",
        titleColor: isDark ? "#ffffff" : "#18181b",
        bodyColor: isDark ? "rgba(255,255,255,.75)" : "rgba(24,24,27,.72)",
        borderColor: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label ?? "—",
          label: (context) => `Doanh thu: ${currency.format(safeNumber(context.raw))}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)" },
        ticks: {
          color: isDark ? "rgba(255,255,255,.42)" : "rgba(24,24,27,.48)",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: period === "monthly" ? 12 : 8,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: allZero ? 1 : undefined,
        grid: { color: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)" },
        border: { display: false },
        ticks: {
          color: isDark ? "rgba(255,255,255,.42)" : "rgba(24,24,27,.48)",
          callback: (value) => currency.format(safeNumber(value)),
          maxTicksLimit: 6,
        },
      },
    },
  }), [allZero, isDark, period]);

  if (!normalized.length) {
    return <div className="grid h-80 place-items-center text-sm text-app opacity-40">
      No order date in timerange
    </div>;
  }

  return <div className="relative min-h-[320px] w-full">
    {allZero && (
      <div className="absolute left-1/2 top-12 z-10 -translate-x-1/2 rounded-full border border-app-border bg-panel/90 px-3 py-1.5 text-xs text-app opacity-70 shadow-sm">
        No payment in timerange
      </div>
    )}
    <Line data={data} options={options} />
  </div>;
}

