import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  HeartHandshake,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  User,
} from "lucide-react";

import { registerUser } from "../../api/authapi";

function ClientSignup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* =========================================================
     HANDLE CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "CLIENT",
      });

      console.log("Client signup successful:", response);
      toast.success(response?.message || "Account created successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Client signup failed:", error);

      const apiData = error?.response?.data;
      const validationMessages = Array.isArray(apiData?.errors)
        ? apiData.errors
            .map((item) => item?.message)
            .filter(Boolean)
        : [];

      const message =
        validationMessages.length > 0
          ? validationMessages.join(" • ")
          : apiData?.message ||
            error?.message ||
            "Unable to create account. Please try again.";

      toast.error(message);

      setErrors({
        general:
          error.response?.data?.message ||
          "Unable to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-0 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-white shadow-xl sm:min-h-[calc(100vh-32px)] sm:rounded-3xl lg:min-h-[calc(100vh-48px)]">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 lg:flex">
          {/* Background decorations */}

          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-teal-300/40 blur-3xl" />

          <div className="absolute bottom-[-100px] left-[-80px] h-80 w-[500px] rounded-[50%] bg-emerald-200/50" />

          <div className="relative z-10 flex w-full flex-col p-8 xl:p-11">
            {/* Logo */}

            <Link to="/" className="flex w-fit items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <HeartHandshake size={21} />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  Unfazed
                </p>

                <p className="text-[10px] font-medium text-slate-500">
                  Therapy. Together.
                </p>
              </div>
            </Link>

            {/* Main content */}

            <div className="mt-14 xl:mt-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Heart size={13} />
                For Clients
              </div>

              <h1 className="mt-6 max-w-md text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 xl:text-5xl">
                Take the first step
                <span className="block text-emerald-600">
                  toward feeling better.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
                Create your Unfazed account to connect with therapists, book
                sessions, and keep your therapy journey organized.
              </p>
            </div>

            {/* Benefits */}

            <div className="mt-9 space-y-4">
              <SignupFeature
                icon={<CalendarDays size={16} />}
                title="Find and book therapy sessions"
              />

              <SignupFeature
                icon={<MessageCircle size={16} />}
                title="Stay connected with your therapist"
              />

              <SignupFeature
                icon={<CheckCircle2 size={16} />}
                title="Keep your sessions organized"
              />

              <SignupFeature
                icon={<ShieldCheck size={16} />}
                title="Private and secure experience"
              />
            </div>

            {/* Bottom card */}

            <div className="relative mt-auto pt-8">
              <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-6 backdrop-blur">
                <div className="absolute -right-5 -top-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-200/60">
                  <HeartHandshake size={32} className="text-emerald-500" />
                </div>

                <div className="relative z-10 max-w-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Heart size={15} />
                    </div>

                    <span className="text-xs font-bold text-slate-700">
                      Your journey starts here
                    </span>
                  </div>

                  <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-slate-800">
                    A simple place to connect, talk, and move forward at your
                    own pace.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Therapy. Together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE - SIGNUP FORM
        ====================================================== */}

        <section className="flex w-full flex-col bg-white lg:w-[55%]">
          {/* Top */}

          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            {/* Mobile logo */}

            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">Unfazed</p>

                <p className="text-[9px] text-slate-500">Therapy. Together.</p>
              </div>
            </Link>

            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-emerald-600"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>

          {/* Form area */}

          <div className="flex flex-1 items-center justify-center px-6 pb-8 sm:px-10">
            <div className="w-full max-w-[420px]">
              {/* Heading */}

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <HeartHandshake size={23} />
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Start your therapy journey with Unfazed
                </p>
              </div>

              {/* Client badge */}

              <div className="mt-5 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <User size={14} />
                  Client Account
                </div>
              </div>

              {/* General error */}

              {errors.general && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-medium text-red-600">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Full Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                        errors.name
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      }`}
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                        errors.email
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={`h-11 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                        errors.password
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {errors.password}
                    </p>
                  )}
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
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`h-11 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Create Account */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Log In
                  </Link>
                </p>
              </div>

              {/* Privacy */}

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} />
                Your information is private and secure.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   SIGNUP FEATURE
========================================================= */

function SignupFeature({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-600">{title}</p>
    </div>
  );
}

export default ClientSignup;
