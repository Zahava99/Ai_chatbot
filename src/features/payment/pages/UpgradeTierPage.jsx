import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPackages, createOrder } from "@/api/paymentApi";
import { formatPrice } from "@/hook/useFormatPrice";

export default function UpgradeTierPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(null); // packageId being purchased

  useEffect(() => {
    async function fetchPackages() {
      try {
        const data = await getPackages();
        setPackages(data.filter((pkg) => pkg.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  async function handlePurchase(packageId) {
    try {
      setPurchasing(packageId);
      const { paymentUrl } = await createOrder(packageId);
      // Redirect user to VNPay payment gateway
      window.location.href = paymentUrl;
    } catch (err) {
      setError(err.message);
      setPurchasing(null);
    }
  }

  return (
    <div className="min-h-screen bg-app text-app flex flex-col">
      {/* Top bar with centered title */}
      <div className="relative flex items-center justify-center px-6 py-4 border-b border-app-border">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Upgrade Tier</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {loading && (
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        )}

        {error && (
          <p className="text-red-500 text-sm">Failed to load packages: {error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {packages.map((pkg, index) => {
              const isHighlight = index === packages.length - 1;

              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-2xl border p-6 min-h-[500px] transition-colors ${
                    isHighlight
                      ? "border-blue-500/50 bg-gradient-to-b from-blue-950/40 to-panel"
                      : "border-app-border bg-panel"
                  }`}
                >
                  {/* Badge for last tier */}
                  {isHighlight && (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-wider bg-white/10 border border-white/20 rounded px-2 py-0.5">
                      POPULAR
                    </span>
                  )}

                  {/* Tier name */}
                  <h2 className="text-xl font-bold mb-3">{pkg.name}</h2>

                  {/* Price + Description centered */}
                  <div className="flex flex-col items-center text-center my-auto">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xs align-top">đ</span>
                      <span className="text-4xl font-bold tracking-tight">{formatPrice(pkg.price)}</span>
                      <span className="text-xs opacity-60 ml-1">VND / {pkg.validityDays} ngày</span>
                    </div>

                    <p className="text-sm opacity-70 mb-1">{pkg.description}</p>
                    <p className="text-sm font-medium">{pkg.tokenAmount} token</p>
                  </div>

                  {/* CTA Button at bottom */}
                  <button
                    onClick={() => index !== 0 && handlePurchase(pkg.id)}
                    disabled={index === 0 || purchasing === pkg.id}
                    className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                      isHighlight
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "border border-app-border text-app hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    {purchasing === pkg.id
                      ? "Đang xử lý..."
                      : index === 0
                        ? "Your current plan"
                        : `Upgrade to ${pkg.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
