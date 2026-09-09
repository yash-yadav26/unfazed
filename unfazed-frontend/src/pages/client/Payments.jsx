import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  HeartHandshake,
  IndianRupee,
  Receipt,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { getMyPayments } from "../../api/paymentApi";

function Payments() {
  /* =========================================================
     STATE
  ========================================================== */

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH PAYMENT HISTORY
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyPayments();

        if (!isMounted) {
          return;
        }

        const data = response?.data;

        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch payment history:", err);

        const errorMessage =
          err?.response?.data?.message ||
          "Unable to load payment history. Please try again.";

        setError(errorMessage);

        toast.error(errorMessage, {
          id: "payments-load-error",
        });

        setPayments([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     TOTAL PAID
  ========================================================== */

  const totalPaid = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  /* =========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-16 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/20 blur-3xl" />

      <Header />

      <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {/* ===================================================
              PAGE HEADER
          ==================================================== */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                Payments
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Payment History
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your therapy payment history and transaction details.
            </p>
          </div>

          {/* ===================================================
              SUMMARY CARDS
          ==================================================== */}

          {!loading && !error && payments.length > 0 && (
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {/* Total Payments */}

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-32px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_24px_60px_-30px_rgba(99,102,241,0.22)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm">
                    <Receipt size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Payments
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {
                        payments.filter((payment) => payment.status === "PAID")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-32px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_24px_60px_-30px_rgba(16,185,129,0.18)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 shadow-sm">
                    <IndianRupee size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Amount Paid
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      ₹{totalPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              LOADING
          ==================================================== */}

          {loading && (
            <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.24)]">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading payment history...
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              ERROR
          ==================================================== */}

          {!loading && error && (
            <div className="mt-8 rounded-[24px] border border-red-100 bg-gradient-to-br from-red-50 to-white px-5 py-6 shadow-sm">
              <div className="flex items-start gap-3">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Unable to load payments
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              EMPTY
          ==================================================== */}

          {!loading && !error && payments.length === 0 && (
            <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-5 py-16 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.20)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 ring-8 ring-violet-50">
                <CreditCard size={25} />
              </div>

              <h2 className="mt-5 text-base font-bold text-slate-800">
                No payment history
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                Your successful and previous therapy payments will appear here
                after you book a session.
              </p>

              <Link
                to="/client/therapists"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <CalendarDays size={15} />
                Book a Session
              </Link>
            </section>
          )}

          {/* ===================================================
              PAYMENT LIST
          ==================================================== */}

          {!loading && !error && payments.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  All Payments
                </h2>

                <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-700">
                  {payments.length}{" "}
                  {payments.length === 1 ? "Transaction" : "Transactions"}
                </span>
              </div>

              <div className="space-y-4">
                {payments.map((payment) => (
                  <PaymentCard key={payment._id} payment={payment} />
                ))}
              </div>
            </section>
          )}

          {/* ===================================================
              SECURITY INFO
          ==================================================== */}

          <section className="relative mt-8 overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_18px_50px_-35px_rgba(99,102,241,0.22)] sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Secure Payment Records
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your payment records are linked to your therapy sessions and
                  stored securely in your account.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PAYMENT CARD
========================================================= */

function PaymentCard({ payment }) {
  const therapist =
    payment?.therapistId && typeof payment.therapistId === "object"
      ? payment.therapistId
      : null;

  const session =
    payment?.sessionId && typeof payment.sessionId === "object"
      ? payment.sessionId
      : null;

  const therapistName = therapist?.name || "Therapist";

  const amount = Number(payment?.amount || 0);

  const status = payment?.status || "CREATED";

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-32px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_26px_65px_-30px_rgba(99,102,241,0.24)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* =================================================
            LEFT
        ================================================== */}

        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
              status === "PAID"
                ? "bg-emerald-50 text-emerald-600"
                : status === "FAILED"
                  ? "bg-red-50 text-red-600"
                  : status === "REFUNDED"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-violet-50 text-violet-600"
            }`}
          >
            {status === "PAID" ? (
              <CheckCircle2 size={20} />
            ) : status === "FAILED" ? (
              <XCircle size={20} />
            ) : (
              <CreditCard size={20} />
            )}
          </div>

          <div className="min-w-0">
            {/* Title */}

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Therapy Session
              </h3>

              <PaymentStatusBadge status={status} />
            </div>

            {/* Therapist */}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserRound size={13} />
                {therapistName}
              </span>

              {/* Payment Date */}

              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatDate(payment?.paidAt || payment?.createdAt)}
              </span>

              {/* Session Date */}

              {session?.date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  Session: {formatDate(session.date)}
                </span>
              )}

              {/* Session Time */}

              {session?.startTime && (
                <span className="flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {formatTime(session.startTime)}
                </span>
              )}
            </div>

            {/* Transaction IDs */}

            <div className="mt-3 space-y-1">
              {payment?.razorpayOrderId && (
                <p className="truncate text-[10px] text-slate-400">
                  Order ID:{" "}
                  <span className="font-medium text-slate-500">
                    {payment.razorpayOrderId}
                  </span>
                </p>
              )}

              {payment?.razorpayPaymentId && (
                <p className="truncate text-[10px] text-slate-400">
                  Payment ID:{" "}
                  <span className="font-medium text-slate-500">
                    {payment.razorpayPaymentId}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================== */}

        <div className="flex min-w-[120px] flex-col items-start gap-2 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4 py-3 lg:items-end">
          <div className="flex items-center gap-1 text-xl font-bold text-slate-900">
            <IndianRupee size={17} />
            {amount.toLocaleString("en-IN")}
          </div>

          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {payment?.currency || "INR"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT STATUS BADGE
========================================================= */

function PaymentStatusBadge({ status }) {
  let className = "border-violet-100 bg-violet-50 text-violet-700";

  if (status === "PAID") {
    className = "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "FAILED") {
    className = "border-red-100 bg-red-50 text-red-700";
  }

  if (status === "REFUNDED") {
    className = "border-amber-100 bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/client" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
            <HeartHandshake size={19} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">
              Unfazed
            </p>

            <p className="text-[9px] text-slate-500">Client Portal</p>
          </div>
        </Link>

        <Link
          to="/client"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    </header>
  );
}

/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(timeValue) {
  if (!timeValue) {
    return "—";
  }

  const [hours, minutes] = String(timeValue).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(timeValue);
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default Payments;
