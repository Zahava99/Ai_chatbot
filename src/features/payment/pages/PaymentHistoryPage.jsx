import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { getWalletHistory } from "@/api/paymentApi";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [walletHistory, setWalletHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getWalletHistory();
        setWalletHistory(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-app text-app flex flex-col">
      {/* Top bar */}
      <div className="relative flex items-center justify-center px-6 py-4 border-b border-app-border">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Lịch sử ví token</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center py-8">Không thể tải lịch sử: {error}</p>
        )}

        {!loading && !error && walletHistory.length === 0 && (
          <p className="text-center opacity-60 py-16">Chưa có giao dịch ví nào.</p>
        )}

        {!loading && !error && walletHistory.length > 0 && (
          <div className="space-y-3">
            {walletHistory.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-app-border bg-panel"
              >
                <Wallet size={24} className="text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs opacity-60 mt-0.5">{formatDate(tx.createdAtUtc)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${tx.delta > 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {tx.delta > 0 ? "+" : ""}{tx.delta} token
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">Số dư: {tx.balanceAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
