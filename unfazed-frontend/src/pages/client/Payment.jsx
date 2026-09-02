import { useState } from "react";
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
  Wallet,
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

            /* -----------------------------------------------
               VERIFY PAYMENT + CREATE SESSION
            ------------------------------------------------ */

            const completeResponse = await completePayment({
              razorpayOrderId: response.razorpay_order_id,

              razorpayPaymentId: response.razorpay_payment_id,

              razorpaySignature: response.razorpay_signature,
            });

            const completeData = completeResponse?.data;

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

            setPaymentError(
              error?.response?.data?.message ||
                "Payment was received but verification failed. Please contact support.",
            );
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
          },
        },
      };

      /* -------------------------------------------------------
         OPEN RAZORPAY
      ------------------------------------------------------- */

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response);

        setPaymentError(
          response?.error?.description || "Payment failed. Please try again.",
        );

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);

      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start payment. Please try again.",
      );

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
              HEADING
          ==================================================== */}

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Payment
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Complete your payment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your session details and continue securely.
            </p>
          </div>

          {/* ===================================================
              ERROR
          ==================================================== */}

          {paymentError && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
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
                {/* Therapist */}

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

                {/* Test Mode */}

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
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

                {/* Pay */}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet size={17} />
                      Pay ₹{amount.toLocaleString("en-IN")}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                  <LockKeyhole size={13} />
                  Secure Razorpay Test Checkout
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
