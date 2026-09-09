import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getTherapistBySlug } from "../../api/therapistApi";
import { getAvailableSessionSlots } from "../../api/sessionApi";

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  /* =========================================================
     THERAPIST
  ========================================================== */

  const [therapist, setTherapist] = useState(null);
  const [therapistLoading, setTherapistLoading] = useState(true);
  const [therapistError, setTherapistError] = useState("");

  /* =========================================================
     BOOKING STATE
  ========================================================== */

  const [selectedDate, setSelectedDate] = useState(
    () => location.state?.selectedDate || "",
  );

  const [selectedSlot, setSelectedSlot] = useState(
    () => location.state?.selectedSlot || "",
  );

  /* =========================================================
     AVAILABLE SLOTS / AVAILABILITY DETAILS
  ========================================================== */

  const [availableSlots, setAvailableSlots] = useState([]);

  const [sessionDuration, setSessionDuration] = useState(null);

  const [bufferTime, setBufferTime] = useState(null);

  const [price, setPrice] = useState(null);

  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  /* =========================================================
     BOOKING
  ========================================================== */

  const [booking, setBooking] = useState(false);

  const [bookingSuccess] = useState(Boolean(location.state?.paymentSuccess));

  /* =========================================================
     LOAD THERAPIST BY SLUG
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchTherapist = async () => {
      try {
        setTherapistLoading(true);
        setTherapistError("");

        const response = await getTherapistBySlug(slug);

        if (!mounted) return;

        setTherapist(response?.data || null);
      } catch (error) {
        if (!mounted) return;

        console.error("Failed to fetch therapist:", error);

        const message =
          error?.response?.data?.message || "Failed to load therapist details.";

        setTherapistError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setTherapistLoading(false);
        }
      }
    };

    if (slug) {
      fetchTherapist();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* =========================================================
     LOAD AVAILABLE SLOTS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchSlots = async () => {
      if (!selectedDate || !therapist?._id) {
        setAvailableSlots([]);
        setSessionDuration(null);
        setBufferTime(null);
        setPrice(null);
        return;
      }

      try {
        setSlotLoading(true);
        setSlotError("");

        const response = await getAvailableSessionSlots({
          therapistId: therapist._id,
          date: selectedDate,
        });

        if (!mounted) return;

        /*
         * Backend response:
         *
         * {
         *   date,
         *   dayOfWeek,
         *   sessionDuration,
         *   bufferTime,
         *   price,
         *   slots
         * }
         */

        const data = response?.data || {};

        const slots = Array.isArray(data.slots) ? data.slots : [];

        const duration = data.sessionDuration ?? null;

        const buffer = data.bufferTime ?? null;

        const sessionPrice = data.price ?? null;

        setAvailableSlots(slots);
        setSessionDuration(duration);
        setBufferTime(buffer);
        setPrice(sessionPrice);

        /*
         * If previously selected slot is not available
         * for this date, clear it.
         */
        setSelectedSlot((currentSlot) =>
          slots.includes(currentSlot) ? currentSlot : "",
        );
      } catch (error) {
        if (!mounted) return;

        console.error("Failed to fetch available slots:", error);

        setAvailableSlots([]);
        setSessionDuration(null);
        setBufferTime(null);
        setPrice(null);
        setSelectedSlot("");

        const message =
          error?.response?.data?.message ||
          "Failed to load available time slots.";

        setSlotError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setSlotLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      mounted = false;
    };
  }, [selectedDate, therapist?._id]);

  /* =========================================================
     DATE CONFIG
  ========================================================== */

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =========================================================
     DATE CHANGE
  ========================================================== */

  const handleDateChange = (event) => {
    const date = event.target.value;

    setSelectedDate(date);
    setSelectedSlot("");

    setAvailableSlots([]);
    setSessionDuration(null);
    setBufferTime(null);
    setPrice(null);

    setSlotError("");
  };

  /* =========================================================
     SLOT SELECT
  ========================================================== */

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  /* =========================================================
     CONFIRM BOOKING
  ========================================================== */

  const handleBooking = async () => {
    if (!therapist) {
      toast.error("Therapist details are not available.");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a session date.");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a session time.");
      return;
    }

    if (!sessionDuration) {
      toast.error("Session duration is not available for the selected date.");
      return;
    }

    if (price === null || price === undefined) {
      toast.error(
        "Session price is not available. Please select another date.",
      );
      return;
    }

    try {
      setBooking(true);

      const bookingData = {
        therapist,

        therapistId: therapist._id,

        selectedDate,

        selectedSlot,

        duration: sessionDuration,

        bufferTime,

        amount: price,
      };

      /*
       * Current flow:
       *
       * Booking Page
       *      ↓
       * Payment Page
       *      ↓
       * Successful payment
       *      ↓
       * Session creation
       *
       * Price comes from backend availability.
       */

      navigate("/client/payment", {
        state: bookingData,
      });
    } catch (error) {
      console.error("Booking initialization failed:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to continue to payment. Please try again.";

      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  /* =========================================================
     THERAPIST LOADING
  ========================================================== */

  if (therapistLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading therapist...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     THERAPIST ERROR
  ========================================================== */

  if (therapistError || !therapist) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-red-600">
                {therapistError || "Therapist not found."}
              </p>

              <Link
                to="/client/therapists"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
              >
                <ArrowLeft size={14} />
                Back to Therapists
              </Link>
            </section>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     BOOKING CONFIRMED SCREEN
  ========================================================== */

  if (bookingSuccess) {
    const confirmedSlot = location.state?.selectedSlot || selectedSlot;
    const confirmedDuration = location.state?.duration ?? sessionDuration;

    const confirmedPrice = location.state?.amount ?? price;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              {/* Success Icon */}

              <div className="text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                  <CheckCircle2 size={12} />
                  Step 05 · Confirmed
                </div>

                <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                  <CheckCircle2 size={30} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Booking Confirmed
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Your session is booked
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your session with{" "}
                  <span className="font-semibold text-slate-700">
                    {therapist.name}
                  </span>{" "}
                  has been successfully booked and paid.
                </p>
              </div>

              {/* Details */}

              <div className="mt-7 space-y-3">
                <BookingDetail
                  icon={<UserRound size={16} />}
                  label="Therapist"
                  value={therapist.name}
                />

                <BookingDetail
                  icon={<CalendarDays size={16} />}
                  label="Date"
                  value={formatDate(selectedDate)}
                />

                <BookingDetail
                  icon={<Clock3 size={16} />}
                  label="Time"
                  value={
                    confirmedSlot ? formatTime(confirmedSlot) : "Session time"
                  }
                />

                <BookingDetail
                  icon={<Clock3 size={16} />}
                  label="Duration"
                  value={
                    confirmedDuration
                      ? `${confirmedDuration} minutes`
                      : "Session"
                  }
                />

                {confirmedPrice !== null && confirmedPrice !== undefined && (
                  <BookingDetail
                    icon={<IndianRupee size={16} />}
                    label="Amount Paid"
                    value={`₹${confirmedPrice}`}
                  />
                )}

                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-emerald-600">
                      Payment
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                      Paid successfully
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/client/sessions")}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
                >
                  View My Sessions
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/client")}
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Go to Dashboard
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     BOOKING PROGRESS / GUIDANCE
  ========================================================== */

  const currentStep = !selectedDate ? 1 : !selectedSlot ? 2 : 3;

  const bookingSteps = [
    {
      number: 1,
      label: "Choose date",
      helper: "Pick a day",
      icon: CalendarDays,
    },
    {
      number: 2,
      label: "Choose time",
      helper: "Select a slot",
      icon: Clock3,
    },
    {
      number: 3,
      label: "Review",
      helper: "Check your session",
      icon: CheckCircle2,
    },
    {
      number: 4,
      label: "Payment",
      helper: "Confirm securely",
      icon: ShieldCheck,
    },
  ];

  /* =========================================================
     MAIN BOOKING PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Back */}

          <Link
            to="/client/therapists"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Therapists
          </Link>

          {/* Heading */}

          <div className="mt-7 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/60 to-indigo-50/70 p-6 shadow-[0_20px_60px_-35px_rgba(79,70,229,0.45)] sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 shadow-sm">
                  <Sparkles size={12} />
                  Guided booking
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Book a session with{" "}
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
                    {therapist.name}
                  </span>
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  New to Unfazed? No worries. Just follow the steps below —
                  we’ll guide you from choosing a date to secure payment.
                </p>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  You&apos;re on
                </p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  Step {currentStep} of 4
                </p>
              </div>
            </div>
          </div>

          {/* Guided booking steps */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 md:grid-cols-4">
              {bookingSteps.map((step) => {
                const StepIcon = step.icon;
                const complete = currentStep > step.number;
                const active = currentStep === step.number;

                return (
                  <div
                    key={step.number}
                    className={`relative rounded-2xl border p-3.5 transition ${
                      active
                        ? "border-violet-300 bg-violet-50 shadow-sm"
                        : complete
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                            : complete
                              ? "bg-emerald-500 text-white"
                              : "bg-white text-slate-400 shadow-sm"
                        }`}
                      >
                        {complete ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <StepIcon size={17} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                            active
                              ? "text-violet-600"
                              : complete
                                ? "text-emerald-600"
                                : "text-slate-400"
                          }`}
                        >
                          0{step.number}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {step.helper}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-violet-800">
                  {currentStep === 1
                    ? "Start here: choose a date"
                    : currentStep === 2
                      ? "Great — now choose a convenient time"
                      : currentStep === 3
                        ? "Almost there — review your session"
                        : "Your session is ready for secure payment"}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-violet-700/80">
                  {currentStep === 1
                    ? "Pick any date from today onward. We’ll load the therapist’s real availability for that day."
                    : currentStep === 2
                      ? "Only available slots for your selected date are shown. Tap one to continue."
                      : currentStep === 3
                        ? "Check the selected date, time, duration and price before moving to payment."
                        : "You’ll be taken to the payment page next. Your booking is confirmed after successful payment."}
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              THERAPIST CARD
          ====================================================== */}

          <section className="mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-1">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <UserRound size={23} />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {therapist.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {therapist.title || "Therapist"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {Array.isArray(therapist.specializations) &&
                      therapist.specializations.length > 0 && (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">
                          {therapist.specializations[0]}
                        </span>
                      )}

                    <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      <MapPin size={10} />
                      India
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-violet-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                  Therapist Profile
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-700">
                  /{slug}
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              SELECTED SESSION INFO
          ====================================================== */}

          {selectedDate && (sessionDuration !== null || price !== null) && (
            <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">
                    Session Details
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Based on the selected date
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {sessionDuration !== null && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                      <Clock3 size={15} className="text-violet-600" />

                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Duration
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          {sessionDuration} min
                        </p>
                      </div>
                    </div>
                  )}

                  {price !== null && price !== undefined && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                      <IndianRupee size={15} className="text-violet-600" />

                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Session Price
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          ₹{price}
                        </p>
                      </div>
                    </div>
                  )}

                  {bufferTime !== null && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                      <Clock3 size={15} className="text-slate-500" />

                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Buffer
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          {bufferTime} min
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              BOOKING AREA
          ====================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* ===================================================
                DATE
            ==================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/70 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700">
                        Step 01
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Choose Date
                      </h2>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Select the day you&apos;d like to talk to your therapist.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <label
                  htmlFor="sessionDate"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Session Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-600"
                  />

                  <input
                    id="sessionDate"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={today}
                    className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {selectedDate && (
                  <div className="mt-5 rounded-xl bg-violet-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                      Selected Date
                    </p>

                    <p className="mt-1 text-base font-bold text-slate-900">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                )}

                {!selectedDate && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
                    <CalendarDays
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Select a date to see available slots
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-violet-600"
                  />

                  <p className="text-[10px] leading-4 text-slate-500">
                    Available times will be shown according to the
                    therapist&apos;s schedule and your local timezone.
                  </p>
                </div>
              </div>
            </section>

            {/* ===================================================
                SLOTS
            ==================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/70 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-700">
                        Step 02
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Choose Time
                      </h2>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {selectedDate
                        ? `Available slots for ${formatDate(selectedDate)}`
                        : "Choose a date first to see available times."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {!selectedDate ? (
                  <div className="rounded-2xl bg-slate-50 p-10 text-center">
                    <Clock3 size={26} className="mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      Select a date
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Available session slots will appear here.
                    </p>
                  </div>
                ) : slotLoading ? (
                  <div className="rounded-2xl bg-slate-50 p-10 text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      Loading available slots...
                    </p>
                  </div>
                ) : slotError ? (
                  <div className="rounded-2xl bg-red-50 p-10 text-center">
                    <Clock3 size={26} className="mx-auto text-red-300" />

                    <p className="mt-3 text-sm font-semibold text-red-700">
                      {slotError}
                    </p>

                    <p className="mt-1 text-xs text-red-500">
                      Please try selecting the date again.
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-10 text-center">
                    <Clock3 size={26} className="mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No available slots
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Please choose another date.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* =========================================
                        SESSION INFO
                    ========================================== */}

                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock3 size={15} className="text-violet-600" />

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Session Duration
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {sessionDuration !== null
                            ? `${sessionDuration} minutes`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee size={15} className="text-violet-600" />

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Session Price
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {price !== null && price !== undefined
                            ? `₹${price}`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* =========================================
                        SLOT BUTTONS
                    ========================================== */}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {availableSlots.map((slot) => {
                        const selected = selectedSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition ${
                              selected
                                ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-200"
                                : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock3
                                size={16}
                                className={
                                  selected
                                    ? "text-violet-100"
                                    : "text-violet-600"
                                }
                              />

                              <span className="text-sm font-semibold">
                                {formatTime(slot)}
                              </span>
                            </div>

                            {selected && <CheckCircle2 size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* =========================================
                        SELECTED SLOT
                    ========================================== */}

                    {selectedSlot && (
                      <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700">
                              Step 03 · Review
                            </span>
                            <p className="mt-2 text-sm font-black text-slate-900">
                              Your session is selected
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                              Please check these details before continuing to
                              payment.
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                            <CheckCircle2 size={18} />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
                              Date
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatDate(selectedDate)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
                              Time
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatTime(selectedSlot)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
                              Amount
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs font-black text-violet-700">
                              <IndianRupee size={12} />
                              {price ?? "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* =========================================
                        PAYMENT BUTTON
                    ========================================== */}

                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={
                        !selectedSlot ||
                        !sessionDuration ||
                        price === null ||
                        price === undefined ||
                        booking
                      }
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-4 text-xs font-black text-white shadow-[0_14px_30px_-14px_rgba(124,58,237,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-15px_rgba(124,58,237,0.9)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {booking ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Preparing secure payment...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={15} />
                          Continue to Secure Payment
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* =====================================================
              WHAT HAPPENS NEXT
          ====================================================== */}

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Step 04
                  </p>
                  <h3 className="text-sm font-black text-slate-900">
                    Secure payment & confirmation
                  </h3>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-bold text-slate-700">
                    1. Continue
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Open the payment page with your selected session details.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-bold text-slate-700">
                    2. Pay securely
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Complete the payment to confirm your booking.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-bold text-slate-700">
                    3. Session booked
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    You&apos;ll see the confirmed date, time and payment status.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <Sparkles size={16} />
                </div>

                <div>
                  <p className="text-xs font-black text-violet-800">
                    New client tip
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-violet-700/80">
                    Choose a time when you can be comfortable and uninterrupted.
                    You can review everything before payment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              INFO
          ====================================================== */}

          <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <CalendarDays
                size={18}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <div>
                <p className="text-xs font-bold text-violet-700">
                  How booking works
                </p>

                <p className="mt-1 text-[11px] leading-5 text-violet-600/80">
                  Select a date and available time, continue to payment, and
                  your session will be confirmed after successful payment.
                </p>
              </div>
            </div>
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

        <Link
          to="/client"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    </header>
  );
}

/* =========================================================
   BOOKING DETAIL
========================================================= */

function BookingDetail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default BookingPage;
