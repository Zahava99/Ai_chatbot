import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import Header from "@/components/common/header";
import { AuthBrand, AuthCard } from "@/features/auth/components/authCommonUI";

const STEPS = ["email", "otp", "done"];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  function handleEmailSubmit(e) {
    e.preventDefault();
    setStep("otp");
  }

  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  }

  function handleOtpSubmit(e) {
    e.preventDefault();
    setStep("done");
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AuthBrand />
        <AuthCard>
          {step === "email" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Mail size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-app">Forgot Password</p>
                  <p className="text-xs text-app opacity-50">We'll send a reset code to your email</p>
                </div>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">School Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
                >
                  Send Reset Code
                </button>
              </form>
              <p className="text-center text-sm text-app opacity-40 mt-4">
                <Link to="/login" className="text-emerald-400 hover:underline font-medium flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to Sign in
                </Link>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <KeyRound size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-app">Enter OTP Code</p>
                  <p className="text-xs text-app opacity-50">Sent to {email}</p>
                </div>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-11 h-12 text-center rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-app text-lg font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
                >
                  Verify Code
                </button>
              </form>
              <p className="text-center text-sm text-app opacity-40 mt-4">
                Didn't receive it?{" "}
                <button className="text-emerald-400 hover:underline font-medium">Resend</button>
              </p>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-app">Password Reset!</p>
              <p className="text-sm text-app opacity-50 text-center">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center mt-2"
              >
                Back to Sign in
              </Link>
            </div>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
