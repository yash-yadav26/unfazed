import { useEffect, useMemo, useState } from "react";
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

        setTherapistError(
          error?.response?.data?.message || "Failed to load therapist details.",
        );
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

        setSlotError(
          error?.response?.data?.message ||
            "Failed to load available time slots.",
        );
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
    if (
      !therapist ||
      !selectedDate ||
      !selectedSlot ||
      !sessionDuration ||
      price === null ||
      price === undefined
    ) {
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
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
                  value={formatTime(selectedSlot)}
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

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Book a Session
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Book with {therapist.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Choose a date and select an available session time.
            </p>
          </div>

          {/* =====================================================
              THERAPIST CARD
          ====================================================== */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Choose Date
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Select any available date.
                </p>
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
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Available Time Slots
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : "Choose a date first"}
                </p>
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
                      <div className="mt-6 rounded-xl bg-violet-50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                          Selected Slot
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {formatDate(selectedDate)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatTime(selectedSlot)}
                              {" • "}
                              {sessionDuration
                                ? `${sessionDuration} minutes`
                                : "Session"}
                            </p>

                            {price !== null && price !== undefined && (
                              <p className="mt-2 flex items-center gap-1 text-sm font-bold text-violet-700">
                                <IndianRupee size={14} />
                                {price}
                              </p>
                            )}
                          </div>

                          <CheckCircle2 size={19} className="text-violet-600" />
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
                      className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {booking ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Opening Payment...
                        </>
                      ) : (
                        <>
                          Continue to Payment
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
              INFO
          ====================================================== */}

          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4">
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
