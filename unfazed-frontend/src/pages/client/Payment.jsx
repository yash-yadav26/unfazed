import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  CreditCard,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state || null;

  /* =========================================================
     NO BOOKING DATA
  ========================================================== */

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <CreditCard size={26} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              No booking selected
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please choose a therapist and session slot before
              proceeding to payment.
            </p>

            <Link
              to="/client/therapists"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              Choose Therapist
              <ArrowRight size={15} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const therapistName =
    booking.therapist?.name || "Therapist";

  const therapistTitle =
    booking.therapist?.title || "Therapist";

  const therapistSlug =
    booking.therapist?.slug || "dr-sharma";

  const selectedDate =
    booking.selectedDate || "";

  const selectedSlot =
    booking.selectedSlot || "";

  const duration =
    booking.duration || 60;

  const amount =
    booking.amount || 1000;

  /* =========================================================
     DEMO PAYMENT

     Abhi Razorpay bilkul nahi use hoga.
     Sirf navigation test hogi.
  ========================================================== */

  const handlePayment = async () => {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      navigate(
        `/client/booking/${therapistSlug}`,
        {
          replace: true,
          state: {
            paymentSuccess: true,
            selectedDate,
            selectedSlot,
            duration,
            amount,
            paymentId: `demo_payment_${Date.now()}`,
          },
        },
      );
    } catch (error) {
      console.error(
        "Demo payment failed:",
        error,
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Back */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Booking
          </button>

          {/* Heading */}

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Payment
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Complete your payment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your session details and continue.
            </p>
          </div>

          {/* Main */}

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Session Details */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-slate-900">
                  Session Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Review your appointment before payment.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-4 rounded-2xl bg-violet-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                      Therapist
                    </p>

                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      {therapistName}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {therapistTitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <PaymentDetail
                    icon={<CalendarDays size={16} />}
                    label="Date"
                    value={formatDate(selectedDate)}
                  />

                  <PaymentDetail
                    icon={<Clock3 size={16} />}
                    label="Time"
                    value={selectedSlot}
                  />

                  <PaymentDetail
                    icon={<Clock3 size={16} />}
                    label="Duration"
                    value={`${duration} minutes`}
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-[11px] leading-5 text-slate-500">
                    Demo payment mode is active. No real payment is
                    being processed right now.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Summary */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-slate-900">
                  Payment Summary
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Therapy Session
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      ₹{amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-slate-950">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Wallet size={17} />
                  Pay ₹{amount.toLocaleString("en-IN")}
                  <ArrowRight size={16} />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                  <LockKeyhole size={13} />
                  Demo Payment • No Real Money
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/client"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
            <HeartHandshake size={19} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">
              Unfazed
            </p>

            <p className="text-[9px] text-slate-500">
              Client Portal
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <LockKeyhole size={14} />
          Demo Checkout
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   PAYMENT DETAIL
========================================================= */

function PaymentDetail({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        {icon}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-slate-700">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(
    `${dateString}T00:00:00`,
  );

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default Payment;