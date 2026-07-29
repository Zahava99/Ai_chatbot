import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft, Home, Loader2 } from "lucide-react";
import { formatPrice } from "@/hook/useFormatPrice";
import { verifyPayment } from "@/api/paymentApi";

/**
 * VNPay response code mapping
 */
const RESPONSE_MESSAGES = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
  "24": "Khách hàng hủy giao dịch.",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định.",
};

function formatPayDate(raw) {
  if (!raw || raw.length !== 14) return raw || "—";
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const h = raw.slice(8, 10);
  const min = raw.slice(10, 12);
  const s = raw.slice(12, 14);
  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(null); // { success, message, tokensAdded }

  // Extract VNPay params for display
  const responseCode = searchParams.get("vnp_ResponseCode") || "";
  const transactionStatus = searchParams.get("vnp_TransactionStatus") || "";
  const amount = parseInt(searchParams.get("vnp_Amount") || "0", 10) / 100;
  const orderInfo = searchParams.get("vnp_OrderInfo") || "";
  const bankCode = searchParams.get("vnp_BankCode") || "";
  const bankTranNo = searchParams.get("vnp_BankTranNo") || "";
  const cardType = searchParams.get("vnp_CardType") || "";
  const payDate = searchParams.get("vnp_PayDate") || "";
  const transactionNo = searchParams.get("vnp_TransactionNo") || "";
  const txnRef = searchParams.get("vnp_TxnRef") || "";

  // Call backend to verify the payment on mount
  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyPayment(location.search);
        setVerified(result);
      } catch (err) {
        setVerified({ success: false, message: err.message });
      } finally {
        setVerifying(false);
      }
    }

    if (location.search) {
      verify();
    } else {
      setVerifying(false);
      setVerified({ success: false, message: "Không có thông tin thanh toán." });
    }
  }, []);

  const isSuccess = verified?.success ?? (responseCode === "00" && transactionStatus === "00");
  const message = verified?.message || RESPONSE_MESSAGES[responseCode] || "Lỗi không xác định.";

  // Loading state while verifying with backend
  if (verifying) {
    return (
      <div className="min-h-screen bg-app text-app flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
        <p className="text-sm opacity-70">Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-app flex flex-col">
      {/* Top bar */}
      <div className="relative flex items-center justify-center px-6 py-4 border-b border-app-border">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Trang chủ"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Kết quả thanh toán</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-app-border bg-panel p-8 flex flex-col items-center gap-6">
          {/* Status icon */}
          {isSuccess ? (
            <CheckCircle size={64} className="text-emerald-500" />
          ) : (
            <XCircle size={64} className="text-red-500" />
          )}

          {/* Status text */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h2>
            <p className="text-sm opacity-70">{message}</p>
            {isSuccess && verified?.tokensAdded && (
              <p className="text-sm font-medium text-emerald-500 mt-1">
                +{verified.tokensAdded} token đã được cộng vào tài khoản
              </p>
            )}
          </div>

          {/* Transaction details */}
          <div className="w-full space-y-3 text-sm">
            <DetailRow label="Nội dung" value={decodeURIComponent(orderInfo.replace(/\+/g, " "))} />
            <DetailRow label="Số tiền" value={`${formatPrice(amount)} VND`} highlight />
            <DetailRow label="Mã giao dịch" value={txnRef} />
            <DetailRow label="Mã GD ngân hàng" value={bankTranNo || "—"} />
            <DetailRow label="Ngân hàng" value={bankCode} />
            <DetailRow label="Loại thẻ" value={cardType} />
            <DetailRow label="Mã thanh toán VNPay" value={transactionNo || "—"} />
            <DetailRow label="Thời gian" value={formatPayDate(payDate)} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium border border-app-border hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Home size={16} />
              Trang chủ
            </button>
            {!isSuccess && (
              <button
                onClick={() => navigate("/upgrade")}
                className="flex-1 py-2.5 rounded-full text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-app-border last:border-0">
      <span className="opacity-60 shrink-0">{label}</span>
      <span className={`text-right break-all ${highlight ? "font-semibold text-emerald-500" : ""}`}>
        {value}
      </span>
    </div>
  );
}
