import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "@/features/admin/components/revenue-report/chartConfig";
import { useTheme } from "@/context/ThemeContext";

const integer = new Intl.NumberFormat("vi-VN");

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function PaidOrdersBarChart({ rows, period }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const normalized = useMemo(() => (Array.isArray(rows) ? rows : []).map((row) => ({
    label: row?.label == null ? "—" : String(row.label),
    value: safeNumber(row?.orders),
  })), [rows]);
  const allZero = normalized.length > 0 && normalized.every((item) => item.value === 0);

  const data = useMemo(() => ({
    labels: normalized.map((item) => item.label),
    datasets: [{
      label: "Đơn đã thanh toán",
      data: normalized.map((item) => item.value),
      backgroundColor: "rgba(96, 165, 250, .72)",
      hoverBackgroundColor: "#60a5fa",
      borderColor: "#60a5fa",
      borderWidth: 1,
      borderRadius: 5,
      maxBarThickness: 34,
    }],
  }), [normalized]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 450 },
    plugins: {
      title: {
        display: true,
        text: period === "monthly" ? "Đơn đã thanh toán theo tháng" : "Đơn đã thanh toán theo ngày",
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
          pointStyle: "rectRounded",
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
          label: (context) => `Đơn đã thanh toán: ${integer.format(safeNumber(context.raw))}`,
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
          precision: 0,
          color: isDark ? "rgba(255,255,255,.42)" : "rgba(24,24,27,.48)",
          callback: (value) => integer.format(safeNumber(value)),
        },
      },
    },
  }), [allZero, isDark, period]);

  if (!normalized.length) {
    return <div className="grid h-72 place-items-center text-sm text-app opacity-40">
      Không có dữ liệu đơn hàng trong khoảng đã chọn.
    </div>;
  }

  return <div className="relative min-h-[280px] w-full">
    {allZero && (
      <div className="absolute left-1/2 top-12 z-10 -translate-x-1/2 rounded-full border border-app-border bg-panel/90 px-3 py-1.5 text-xs text-app opacity-70 shadow-sm">
        Chưa có đơn đã thanh toán trong khoảng này
      </div>
    )}
    <Bar data={data} options={options} />
  </div>;
}

