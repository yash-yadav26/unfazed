import { useState } from "react";
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
  Sparkles,
  Users,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("client");

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    client: {
      email: "",
      password: "",
    },

    therapist: {
      email: "",
      password: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isTherapist = role === "therapist";

  const currentForm = formData[role];

  /* =========================================================
     ROLE CHANGE
  ========================================================== */

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    setErrors({});

    /*
     * Password visibility reset kar rahe hain
     * taaki role switch clean rahe.
     */
    setShowPassword(false);
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [role]: {
        ...prev[role],
        [name]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    const newErrors = {};

    if (!currentForm.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!currentForm.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
     
     FINAL FLOW:
     
     CLIENT
       Login
        ↓
     /client/profile-setup
     
     THERAPIST
       Login
        ↓
     /therapist/profile-setup
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      /*
       * Backend later:
       *
       * POST /auth/login
       *
       * {
       *   email,
       *   password,
       *   role
       * }
       *
       * Response:
       * {
       *   token,
       *   user
       * }
       */

      console.log("Login data:", {
        email: currentForm.email,
        password: currentForm.password,
        role: role.toUpperCase(),
      });

      /*
       * Demo delay
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      /*
       * =====================================================
       * DEMO NAVIGATION
       * =====================================================
       *
       * Login ke baad token future backend flow mein milega.
       *
       * Abhi direct navigation:
       *
       * Therapist → Therapist Profile Setup
       * Client    → Client Profile Setup
       */

      if (role === "therapist") {
        navigate("/therapist/profile-setup");
      } else {
        navigate("/client/profile-setup");
      }
    } catch (error) {
      console.error("Login failed:", error);

      setErrors({
        general: "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-0 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-white shadow-xl sm:min-h-[calc(100vh-32px)] sm:rounded-3xl lg:min-h-[calc(100vh-48px)]">
        {/* =====================================================
            LEFT PANEL
        ====================================================== */}

        <section
          className={`relative hidden w-[45%] overflow-hidden lg:flex ${
            isTherapist
              ? "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100"
              : "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100"
          }`}
        >
          {/* Decorative background */}

          <div
            className={`absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl ${
              isTherapist ? "bg-violet-300/40" : "bg-emerald-300/40"
            }`}
          />

          <div
            className={`absolute -bottom-32 -right-20 h-96 w-96 rounded-full blur-3xl ${
              isTherapist ? "bg-indigo-300/40" : "bg-teal-300/40"
            }`}
          />

          <div
            className={`absolute bottom-[-100px] left-[-80px] h-80 w-[500px] rounded-[50%] ${
              isTherapist ? "bg-violet-200/40" : "bg-emerald-200/50"
            }`}
          />

          <div className="relative z-10 flex w-full flex-col p-8 xl:p-11">
            {/* Logo */}

            <Link to="/" className="flex w-fit items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${
                  isTherapist ? "bg-violet-600" : "bg-emerald-600"
                }`}
              >
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

            <div className="mt-16 xl:mt-20">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isTherapist
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isTherapist ? <CalendarDays size={13} /> : <Heart size={13} />}

                {isTherapist ? "For Therapists" : "For Clients"}
              </div>

              <h1 className="mt-6 max-w-md text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 xl:text-5xl">
                {isTherapist ? (
                  <>
                    Your practice,
                    <span className="block text-violet-600">
                      all in one place.
                    </span>
                  </>
                ) : (
                  <>
                    Support that fits
                    <span className="block text-emerald-600">your life.</span>
                  </>
                )}
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
                {isTherapist
                  ? "Manage your clients, appointments, notes, availability, and more — efficiently and securely."
                  : "Book sessions, connect with your therapist, and take steps toward a healthier, happier you."}
              </p>
            </div>

            {/* Features */}

            <div className="mt-9 space-y-4">
              {isTherapist ? (
                <>
                  <Feature
                    icon={<ShieldCheck size={16} />}
                    title="Secure & Private"
                    color="violet"
                  />

                  <Feature
                    icon={<Users size={16} />}
                    title="Manage your clients & sessions"
                    color="violet"
                  />

                  <Feature
                    icon={<CalendarDays size={16} />}
                    title="Calendar & availability"
                    color="violet"
                  />

                  <Feature
                    icon={<Sparkles size={16} />}
                    title="Simple practice management"
                    color="violet"
                  />
                </>
              ) : (
                <>
                  <Feature
                    icon={<CalendarDays size={16} />}
                    title="Book & manage sessions"
                    color="emerald"
                  />

                  <Feature
                    icon={<MessageCircle size={16} />}
                    title="Chat securely with your therapist"
                    color="emerald"
                  />

                  <Feature
                    icon={<CheckCircle2 size={16} />}
                    title="Keep your therapy journey organized"
                    color="emerald"
                  />

                  <Feature
                    icon={<ShieldCheck size={16} />}
                    title="Your privacy comes first"
                    color="emerald"
                  />
                </>
              )}
            </div>

            {/* Bottom card */}

            <div className="relative mt-auto pt-8">
              <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-6 backdrop-blur">
                <div
                  className={`absolute -right-5 -top-5 flex h-24 w-24 items-center justify-center rounded-full ${
                    isTherapist ? "bg-violet-200/60" : "bg-emerald-200/60"
                  }`}
                >
                  {isTherapist ? (
                    <CalendarDays size={32} className="text-violet-500" />
                  ) : (
                    <HeartHandshake size={32} className="text-emerald-500" />
                  )}
                </div>

                <div className="relative z-10 max-w-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isTherapist
                          ? "bg-violet-100 text-violet-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      <Heart size={15} />
                    </div>

                    <span className="text-xs font-bold text-slate-700">
                      Unfazed
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">
                    {isTherapist
                      ? "Focus on your clients. We'll help with the rest."
                      : "You don't have to go through it alone."}
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
            RIGHT LOGIN PANEL
        ====================================================== */}

        <section className="flex w-full flex-col bg-white lg:w-[55%]">
          {/* Top bar */}

          <div className="flex items-center justify-between px-6 py-6 sm:px-10">
            {/* Mobile Logo */}

            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">Unfazed</p>

                <p className="text-[9px] text-slate-500">Therapy. Together.</p>
              </div>
            </Link>

            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>

          {/* Login content */}

          <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
            <div className="w-full max-w-[410px]">
              {/* Heading */}

              <div className="text-center">
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${
                    isTherapist
                      ? "bg-violet-100 text-violet-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  <HeartHandshake size={23} />
                </div>

                <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                  Welcome back!
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Log in to your {isTherapist ? "therapist" : "client"} account
                </p>
              </div>

              {/* Role Tabs */}

              <div className="mt-8 grid grid-cols-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleChange("client")}
                  className={`relative pb-3 text-sm font-semibold transition ${
                    !isTherapist
                      ? "text-emerald-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Client
                  {!isTherapist && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("therapist")}
                  className={`relative pb-3 text-sm font-semibold transition ${
                    isTherapist
                      ? "text-violet-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Therapist
                  {isTherapist && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                  )}
                </button>
              </div>

              {/* General error */}

              {errors.general && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-medium text-red-600">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Login Form */}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                      value={currentForm.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      required
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 ${
                        errors.email
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : isTherapist
                            ? "border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className={`text-xs font-semibold transition ${
                        isTherapist
                          ? "text-violet-600 hover:text-violet-700"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={currentForm.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 ${
                        errors.password
                          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : isTherapist
                            ? "border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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

                {/* Login Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isTherapist
                      ? "bg-violet-600 shadow-violet-200 hover:bg-violet-700"
                      : "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Logging In...
                    </>
                  ) : (
                    <>
                      Log In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Signup */}

              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">Don't have an account?</p>

                <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold">
                  <Link
                    to="/signup/client"
                    className="text-emerald-600 transition hover:text-emerald-700"
                  >
                    Client Sign Up
                  </Link>

                  <span className="text-slate-300">|</span>

                  <Link
                    to="/signup/therapist"
                    className="text-violet-600 transition hover:text-violet-700"
                  >
                    Therapist Sign Up
                  </Link>
                </div>
              </div>

              {/* Privacy */}

              <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-400">
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
   FEATURE
========================================================= */

function Feature({ icon, title, color }) {
  const violet = color === "violet";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          violet
            ? "bg-violet-100 text-violet-600"
            : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-600">{title}</p>
    </div>
  );
}

export default Login;
