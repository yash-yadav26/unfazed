import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { forgotPassword, verifyOtp, resetPassword } from "../../api/authapi";

function ForgotPassword() {
  const navigate = useNavigate();

  // =========================================================
  // STEP
  // =========================================================

  const [step, setStep] = useState("EMAIL");

  // EMAIL -> OTP -> RESET

  // =========================================================
  // FORM STATES
  // =========================================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================================
  // UI STATES
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // SEND OTP
  // =========================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: email.trim(),
      });

      setSuccess(
        "If the account exists, a password reset OTP has been sent to your email.",
      );

      setStep("OTP");
    } catch (error) {
      console.error("Forgot password failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);

      await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      setSuccess("OTP verified successfully.");

      setStep("RESET");
    } catch (error) {
      console.error("OTP verification failed:", error);

      setError(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email: email.trim(),
        password,
        confirmPassword,
      });

      setSuccess(
        "Password reset successfully. You can now login with your new password.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Password reset failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await forgotPassword({
        email: email.trim(),
      });

      setSuccess("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP failed:", error);

      setError(error.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-10">
          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <HeartHandshake size={26} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
              {step === "EMAIL" && "Forgot your password?"}

              {step === "OTP" && "Verify your OTP"}

              {step === "RESET" && "Create new password"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {step === "EMAIL" &&
                "Enter your registered email and we'll send you a password reset OTP."}

              {step === "OTP" && `Enter the 6-digit OTP sent to ${email}.`}

              {step === "RESET" &&
                "Create a new password for your Unfazed account."}
            </p>
          </div>

          {/* =====================================================
              STEP INDICATOR
          ====================================================== */}

          <div className="mt-8 flex items-center justify-center gap-2">
            <Step
              active={step === "EMAIL"}
              completed={step === "OTP" || step === "RESET"}
              number="1"
              text="Email"
            />

            <div className="h-px w-10 bg-slate-200" />

            <Step
              active={step === "OTP"}
              completed={step === "RESET"}
              number="2"
              text="OTP"
            />

            <div className="h-px w-10 bg-slate-200" />

            <Step
              active={step === "RESET"}
              completed={false}
              number="3"
              text="Reset"
            />
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* =====================================================
              SUCCESS
          ====================================================== */}

          {success && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs font-medium leading-5 text-emerald-700">
                {success}
              </p>
            </div>
          )}

          {/* =====================================================
              EMAIL STEP
          ====================================================== */}

          {step === "EMAIL" && (
            <form onSubmit={handleSendOtp} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =====================================================
              OTP STEP
          ====================================================== */}

          {step === "OTP" && (
            <form onSubmit={handleVerifyOtp} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Enter OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="h-14 w-full rounded-xl border border-slate-200 text-center text-xl font-bold tracking-[0.4em] outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full text-center text-xs font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Change email
              </button>
            </form>
          )}

          {/* =====================================================
              RESET PASSWORD STEP
          ====================================================== */}

          {step === "RESET" && (
            <form onSubmit={handleResetPassword} className="mt-7 space-y-5">
              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =====================================================
              SECURITY NOTE
          ====================================================== */}

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} />
            Your password reset process is secure.
          </div>

          {/* =====================================================
              BACK TO LOGIN
          ====================================================== */}

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// STEP COMPONENT
// =========================================================

function Step({ active, completed, number, text }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${
          active || completed
            ? "bg-violet-600 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {completed ? <CheckCircle2 size={15} /> : number}
      </div>

      <span
        className={`hidden text-[11px] font-semibold sm:block ${
          active || completed ? "text-violet-600" : "text-slate-400"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export default ForgotPassword;
