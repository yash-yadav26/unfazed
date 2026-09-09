import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  CreditCard,
  HeartHandshake,
  IndianRupee,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Sparkles,
} from "lucide-react";

import { createPaymentOrder, completePayment } from "../../api/paymentApi";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/* =========================================================
   LOAD RAZORPAY CHECKOUT SCRIPT
========================================================= */

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state || null;

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentError, setPaymentError] = useState("");

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
              Please choose a therapist and session slot before proceeding to
              payment.
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

  /* =========================================================
     BOOKING DATA
  ========================================================== */

  const therapist = booking.therapist || null;

  const therapistName = therapist?.name;

  const therapistTitle = therapist?.title;

  const therapistSlug = therapist?.slug;

  const therapistId = booking.therapistId;

  const selectedDate = booking.selectedDate;

  const selectedSlot = booking.selectedSlot;

  const duration = booking.duration;

  const amount = booking.amount;

  const bufferTime = booking.bufferTime;

  /* =========================================================
     REQUIRED BOOKING VALIDATION
  ========================================================== */

  const hasValidBooking =
    Boolean(therapist) &&
    Boolean(therapistName) &&
    Boolean(therapistSlug) &&
    Boolean(therapistId) &&
    Boolean(selectedDate) &&
    Boolean(selectedSlot) &&
    typeof duration === "number" &&
    Number.isFinite(duration) &&
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount >= 0;

  /* =========================================================
     HANDLE PAYMENT
  ========================================================== */

  const handlePayment = async () => {
    if (!hasValidBooking || paymentLoading) {
      if (!hasValidBooking && !paymentLoading) {
        toast.error(
          "Some booking details are missing. Please go back and select the therapist, date and session slot again.",
          { id: "payment-invalid-booking" },
        );
      }

      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      /* -------------------------------------------------------
         LOAD RAZORPAY
      ------------------------------------------------------- */

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      /* -------------------------------------------------------
         CREATE ORDER
         
         IMPORTANT:
         Backend calculates the actual amount from availability.
      ------------------------------------------------------- */

      const orderResponse = await createPaymentOrder({
        therapistId,
        date: selectedDate,
        startTime: selectedSlot,
      });

      const orderData = orderResponse?.data;

      if (!orderData?.razorpayOrderId) {
        throw new Error("Unable to create payment order.");
      }

      /* -------------------------------------------------------
         USE BACKEND RESPONSE
      ------------------------------------------------------- */

      const razorpayKey =
        orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      const orderAmount = Number(orderData.amountInPaise);

      const orderPrice = Number(orderData.amount);

      const orderCurrency = orderData.currency || "INR";

      if (!razorpayKey) {
        throw new Error("Razorpay Key ID is not configured.");
      }

      if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
        throw new Error("Invalid payment amount received from server.");
      }

      toast.success("Secure payment checkout is ready.", {
        id: "payment-checkout-ready",
      });

      /* -------------------------------------------------------
         RAZORPAY CHECKOUT
      ------------------------------------------------------- */

      const options = {
        key: razorpayKey,

        amount: orderAmount,

        currency: orderCurrency,

        name: "Unfazed",

        description: `Therapy Session with ${therapistName}`,

        order_id: orderData.razorpayOrderId,

        handler: async (response) => {
          try {
            setPaymentLoading(true);
            setPaymentError("");

            toast.loading("Verifying your payment...", {
              id: "payment-verification",
            });

            /* -----------------------------------------------
               VERIFY PAYMENT + CREATE SESSION
            ------------------------------------------------ */

            const completeResponse = await completePayment({
              razorpayOrderId: response.razorpay_order_id,

              razorpayPaymentId: response.razorpay_payment_id,

              razorpaySignature: response.razorpay_signature,
            });

            const completeData = completeResponse?.data;

            toast.dismiss("payment-verification");

            toast.success("Payment verified. Your session is confirmed.", {
              id: "payment-success",
            });

            /* -----------------------------------------------
               PAYMENT + SESSION SUCCESS
            ------------------------------------------------ */

            navigate(`/client/booking/${therapistSlug}`, {
              replace: true,

              state: {
                paymentSuccess: true,

                therapist,

                therapistId,

                selectedDate,

                selectedSlot,

                duration:
                  completeData?.session?.duration ??
                  orderData.sessionDuration ??
                  duration,

                bufferTime: orderData.bufferTime ?? bufferTime,

                amount: completeData?.payment?.amount ?? orderPrice,

                paymentId:
                  completeData?.payment?.razorpayPaymentId ??
                  response.razorpay_payment_id,

                sessionId: completeData?.session?._id ?? null,
              },
            });
          } catch (error) {
            console.error("Payment verification failed:", error);

            const errorMessage =
              error?.response?.data?.message ||
              "Payment was received but verification failed. Please contact support.";

            toast.dismiss("payment-verification");
            setPaymentError(errorMessage);

            toast.error(errorMessage, {
              id: "payment-verification-error",
            });
          } finally {
            setPaymentLoading(false);
          }
        },

        theme: {
          color: "#7c3aed",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);

            toast("Payment checkout was closed.", {
              id: "payment-checkout-closed",
              icon: "ℹ️",
            });
          },
        },
      };

      /* -------------------------------------------------------
         OPEN RAZORPAY
      ------------------------------------------------------- */

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response);

        const errorMessage =
          response?.error?.description || "Payment failed. Please try again.";

        setPaymentError(errorMessage);

        toast.error(errorMessage, {
          id: "payment-failed",
        });

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to start payment. Please try again.";

      setPaymentError(errorMessage);

      toast.error(errorMessage, {
        id: "payment-init-error",
      });

      setPaymentLoading(false);
    }
  };

  /* =========================================================
     INVALID BOOKING
  ========================================================== */

  if (!hasValidBooking) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <CreditCard size={26} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Invalid booking details
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Some required booking information is missing. Please go back and
              select the therapist, date, and session slot again.
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/therapists")}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              Choose Therapist
              <ArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     PAYMENT PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* ===================================================
              BACK
          ==================================================== */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={paymentLoading}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={14} />
            Back to Booking
          </button>

          {/* ===================================================
              GUIDED PAYMENT HEADER
          ==================================================== */}

          <section className="mt-7 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-indigo-50/80 p-6 shadow-[0_22px_65px_-40px_rgba(79,70,229,0.5)] sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-violet-700 shadow-sm">
                  <Sparkles size={12} />
                  Guided checkout
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  One final step to{" "}
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
                    confirm your session
                  </span>
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Review your appointment details first. When everything looks
                  right, continue to secure payment and your session will be
                  confirmed after successful verification.
                </p>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Booking status
                </p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  Step 04 of 04
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["01", "Date", "Selected"],
                ["02", "Time", "Selected"],
                ["03", "Review", "You're here"],
                ["04", "Payment", "Secure checkout"],
              ].map(([number, label, helper], index) => {
                const active = index === 3;
                const complete = index < 3;

                return (
                  <div
                    key={number}
                    className={`rounded-2xl border p-3.5 ${
                      active
                        ? "border-violet-300 bg-violet-50 shadow-sm"
                        : complete
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-100 bg-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${
                          active
                            ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                            : complete
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {complete ? "✓" : number}
                      </div>

                      <div>
                        <p
                          className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
                            active
                              ? "text-violet-600"
                              : complete
                                ? "text-emerald-600"
                                : "text-slate-400"
                          }`}
                        >
                          {number}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-slate-800">
                          {label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {helper}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-100 bg-white/75 px-4 py-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-violet-800">
                  Review before you pay
                </p>
                <p className="mt-1 text-[11px] leading-5 text-violet-700/80">
                  Your therapist, date, time, duration and final amount are shown
                  below. Check these details before opening the payment checkout.
                </p>
              </div>
            </div>
          </section>

          {/* ===================================================
              ERROR
          ==================================================== */}

          {paymentError && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <CreditCard
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-xs font-bold text-red-700">
                    Payment Error
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {paymentError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              CONTENT
          ==================================================== */}

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* =================================================
                SESSION DETAILS
            ================================================== */}

            <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.45)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/70 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-violet-700">
                        Step 03
                      </span>
                      <h2 className="text-base font-black text-slate-900">
                        Review Session
                      </h2>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Make sure everything is correct before moving to secure payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* Therapist */}

                <div className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
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
                      {therapistTitle || "Therapist"}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}

                <div className="mt-5 space-y-3">
                  <PaymentDetail
                    icon={<CalendarDays size={16} />}
                    label="Date"
                    value={formatDate(selectedDate)}
                  />

                  <PaymentDetail
                    icon={<Clock3 size={16} />}
                    label="Time"
                    value={formatTime(selectedSlot)}
                  />

                  <PaymentDetail
                    icon={<Clock3 size={16} />}
                    label="Duration"
                    value={`${duration} minutes`}
                  />

                  <PaymentDetail
                    icon={<IndianRupee size={16} />}
                    label="Session Price"
                    value={`₹${amount.toLocaleString("en-IN")}`}
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-black text-emerald-800">
                      Details verified for checkout
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-emerald-700/80">
                      The payment order is created from the server using the selected
                      therapist, date and time.
                    </p>
                  </div>
                </div>

                {/* Test Mode */}

                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Razorpay Test Mode
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      This is a test payment. No real money will be deducted.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                PAYMENT SUMMARY
            ================================================== */}

            <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.45)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/70 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-indigo-700">
                        Step 04
                      </span>
                      <h2 className="text-base font-black text-slate-900">
                        Secure Payment
                      </h2>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Complete payment to confirm your therapy session.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm">
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

                {/* Pay */}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-4 text-sm font-black text-white shadow-[0_16px_34px_-16px_rgba(124,58,237,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-16px_rgba(124,58,237,0.95)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {paymentLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Securing your payment...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={16} />
                      Pay ₹{amount.toLocaleString("en-IN")} Securely
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-400">
                  <LockKeyhole size={13} />
                  Secure Razorpay Test Checkout
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold text-slate-700">
                    What happens next?
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Razorpay checkout opens → payment is verified → your session is
                    created → you return to a booking-confirmed screen.
                  </p>
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
        <Link to="/client" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
            <HeartHandshake size={19} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">
              Unfazed
            </p>

            <p className="text-[9px] text-slate-500">Client Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <LockKeyhole size={14} />
          Razorpay Test Checkout
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   PAYMENT DETAIL
========================================================= */

function PaymentDetail({ icon, label, value }) {
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
   FORMAT DATE
========================================================= */

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T00:00:00`);

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

function formatTime(timeString) {
  if (!timeString) {
    return "—";
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeString;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default Payment;
