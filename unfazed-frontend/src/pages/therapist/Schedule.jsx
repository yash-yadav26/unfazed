import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  HeartHandshake,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
} from "../../api/availabilityApi";

// ===============================
// Constants
// ===============================

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_MAP = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};

// ===============================
// Initial Weekly State
// ===============================

const getInitialAvailability = () =>
  DAYS.map((day) => ({
    id: null,
    day,
    enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
      day,
    ),
    startTime: "10:00",
    endTime: "18:00",
  }));

// ===============================
// Component
// ===============================

function Schedule() {
  // ===============================
  // Weekly Availability
  // ===============================

  const [availability, setAvailability] = useState(getInitialAvailability());

  // ===============================
  // Session Settings
  // ===============================

  const [sessionDuration, setSessionDuration] = useState("");
  const [bufferTime, setBufferTime] = useState("");
  const [sessionPrice, setSessionPrice] = useState("");

  // ===============================
  // One-time Changes
  // ===============================

  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const [overrides, setOverrides] = useState([]);

  const [overrideForm, setOverrideForm] = useState({
    date: "",
    type: "blocked",
    startTime: "10:00",
    endTime: "18:00",
    duration: "",
    buffer: "",
    price: "",
  });

  // ===============================
  // UI States
  // ===============================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overrideSaving, setOverrideSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===============================
  // Load Availability
  // ===============================

  const loadAvailability = async () => {
    try {
      setError("");

      const response = await getMyAvailability();

      const records = response?.data || [];

      const weeklyRecords = records.filter((item) => item.type === "WEEKLY");

      const overrideRecords = records.filter(
        (item) => item.type === "OVERRIDE" || item.type === "BLOCKED",
      );

      // ===============================
      // Session Settings
      // ===============================

      let savedDuration = "";
      let savedBuffer = "";
      let savedPrice = "";

      const firstWeeklyRecord = weeklyRecords[0];

      if (firstWeeklyRecord) {
        savedDuration =
          firstWeeklyRecord.sessionDuration !== null &&
          firstWeeklyRecord.sessionDuration !== undefined
            ? String(firstWeeklyRecord.sessionDuration)
            : "";

        savedBuffer =
          firstWeeklyRecord.bufferTime !== null &&
          firstWeeklyRecord.bufferTime !== undefined
            ? String(firstWeeklyRecord.bufferTime)
            : "";

        savedPrice =
          firstWeeklyRecord.price !== null &&
          firstWeeklyRecord.price !== undefined
            ? String(firstWeeklyRecord.price)
            : "";
      }

      setSessionDuration(savedDuration);
      setBufferTime(savedBuffer);
      setSessionPrice(savedPrice);

      // ===============================
      // Weekly Availability
      // ===============================

      const updatedDays = getInitialAvailability().map((day) => {
        const record = weeklyRecords.find(
          (item) => item.dayOfWeek === DAY_MAP[day.day],
        );

        if (!record) {
          return day;
        }

        return {
          ...day,
          id: record._id,
          enabled: Boolean(record.isAvailable),
          startTime: record.startTime || "10:00",
          endTime: record.endTime || "18:00",
        };
      });

      setAvailability(updatedDays);

      // ===============================
      // One-time Changes
      // ===============================

      const mappedOverrides = overrideRecords.map((item) => ({
        id: item._id,
        date: formatDateForInput(item.date),
        type: item.type === "BLOCKED" ? "blocked" : "custom",
        startTime: item.startTime || "10:00",
        endTime: item.endTime || "18:00",
        duration:
          item.sessionDuration !== null && item.sessionDuration !== undefined
            ? String(item.sessionDuration)
            : "",
        buffer:
          item.bufferTime !== null && item.bufferTime !== undefined
            ? String(item.bufferTime)
            : "",
        price:
          item.price !== null && item.price !== undefined
            ? String(item.price)
            : "",
      }));

      setOverrides(mappedOverrides);
    } catch (error) {
      console.error("Failed to load availability:", error);

      setError(
        error.response?.data?.message || "Unable to load your availability.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Initial Load
  // ===============================

  useEffect(() => {
    const fetchData = async () => {
      await loadAvailability();
    };

    fetchData();
  }, []);

  // ===============================
  // Toggle Day
  // ===============================

  const toggleDay = (dayName) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.day === dayName
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item,
      ),
    );
  };

  // ===============================
  // Update Time
  // ===============================

  const updateTime = (dayName, field, value) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.day === dayName
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // ===============================
  // Override Form Change
  // ===============================

  const handleOverrideChange = (e) => {
    const { name, value } = e.target;

    setOverrideForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // Add One-time Change
  // ===============================

  const addOverride = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!overrideForm.date) {
      setError("Please select a date.");
      return;
    }

    if (
      overrideForm.type === "custom" &&
      overrideForm.startTime >= overrideForm.endTime
    ) {
      setError("End time must be later than start time.");
      return;
    }

    if (overrideForm.type === "custom") {
      const duration = Number(overrideForm.duration);
      const buffer = Number(overrideForm.buffer);
      const price = Number(overrideForm.price);

      if (
        overrideForm.duration === "" ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 240
      ) {
        setError(
          "Session duration must be a whole number between 1 and 240 minutes.",
        );
        return;
      }

      if (
        overrideForm.buffer === "" ||
        !Number.isInteger(buffer) ||
        buffer < 0 ||
        buffer > 120
      ) {
        setError(
          "Buffer time must be a whole number between 0 and 120 minutes.",
        );
        return;
      }

      if (overrideForm.price === "" || !Number.isFinite(price) || price < 0) {
        setError("Please enter a valid session price.");
        return;
      }
    }

    try {
      setOverrideSaving(true);

      // ===============================
      // BLOCKED
      // ===============================

      if (overrideForm.type === "blocked") {
        const response = await createAvailability({
          type: "BLOCKED",
          date: overrideForm.date,
          isAvailable: false,
        });

        const created = response?.data;

        setOverrides((prev) => [
          ...prev,
          {
            id: created?._id,
            date: overrideForm.date,
            type: "blocked",
            startTime: "10:00",
            endTime: "18:00",
            duration: "",
            buffer: "",
            price: "",
          },
        ]);
      }

      // ===============================
      // CUSTOM HOURS
      // ===============================

      if (overrideForm.type === "custom") {
        const response = await createAvailability({
          type: "OVERRIDE",
          date: overrideForm.date,
          isAvailable: true,
          startTime: overrideForm.startTime,
          endTime: overrideForm.endTime,
          sessionDuration: Number(overrideForm.duration),
          bufferTime: Number(overrideForm.buffer),
          price: Number(overrideForm.price),
        });

        const created = response?.data;

        setOverrides((prev) => [
          ...prev,
          {
            id: created?._id,
            date: overrideForm.date,
            type: "custom",
            startTime: overrideForm.startTime,
            endTime: overrideForm.endTime,
            duration: String(overrideForm.duration),
            buffer: String(overrideForm.buffer),
            price: String(overrideForm.price),
          },
        ]);
      }

      // ===============================
      // Reset Form
      // ===============================

      setOverrideForm({
        date: "",
        type: "blocked",
        startTime: "10:00",
        endTime: "18:00",
        duration: sessionDuration,
        buffer: bufferTime,
        price: sessionPrice,
      });

      setShowOverrideForm(false);

      setSuccess("One-time change added successfully.");
    } catch (error) {
      console.error("Failed to add one-time change:", error);

      setError(
        error.response?.data?.message || "Unable to add one-time change.",
      );
    } finally {
      setOverrideSaving(false);
    }
  };

  // ===============================
  // Delete One-time Change
  // ===============================

  const deleteOverride = async (id) => {
    try {
      setError("");
      setSuccess("");

      await deleteAvailability(id);

      setOverrides((prev) => prev.filter((item) => item.id !== id));

      setSuccess("One-time change deleted successfully.");
    } catch (error) {
      console.error("Failed to delete one-time change:", error);

      setError(
        error.response?.data?.message || "Unable to delete one-time change.",
      );
    }
  };

  // ===============================
  // Save Weekly Availability
  // ===============================

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      // ===============================
      // Validate Session Duration
      // ===============================

      const numericDuration = Number(sessionDuration);

      if (
        sessionDuration === "" ||
        !Number.isInteger(numericDuration) ||
        numericDuration < 1 ||
        numericDuration > 240
      ) {
        throw new Error(
          "Session duration must be a whole number between 1 and 240 minutes.",
        );
      }

      // ===============================
      // Validate Buffer
      // ===============================

      const numericBuffer = Number(bufferTime);

      if (
        bufferTime === "" ||
        !Number.isInteger(numericBuffer) ||
        numericBuffer < 0 ||
        numericBuffer > 120
      ) {
        throw new Error(
          "Buffer time must be a whole number between 0 and 120 minutes.",
        );
      }

      // ===============================
      // Validate Price
      // ===============================

      if (
        sessionPrice === "" ||
        !Number.isFinite(Number(sessionPrice)) ||
        Number(sessionPrice) < 0
      ) {
        throw new Error("Please enter a valid session price.");
      }

      const numericPrice = Number(sessionPrice);

      // ===============================
      // Validate Enabled Days
      // ===============================

      const invalidDay = availability.find(
        (day) =>
          day.enabled &&
          (!day.startTime || !day.endTime || day.startTime >= day.endTime),
      );

      if (invalidDay) {
        throw new Error(
          `${invalidDay.day}: End time must be later than start time.`,
        );
      }

      // ===============================
      // Create / Update Each Day
      // ===============================

      await Promise.all(
        availability.map(async (day) => {
          const payload = {
            type: "WEEKLY",
            dayOfWeek: DAY_MAP[day.day],
            isAvailable: day.enabled,
            sessionDuration: numericDuration,
            bufferTime: numericBuffer,
          };

          if (day.enabled) {
            payload.startTime = day.startTime;
            payload.endTime = day.endTime;
            payload.price = numericPrice;
          }

          // ===============================
          // Create
          // ===============================

          if (!day.id) {
            await createAvailability(payload);
            return;
          }

          // ===============================
          // Update
          // ===============================

          await updateAvailability(day.id, payload);
        }),
      );

      // ===============================
      // Reload From Backend
      // ===============================

      await loadAvailability();

      setSuccess("Availability saved successfully.");
    } catch (error) {
      console.error("Failed to save availability:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save availability.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // Guided Setup State
  // ===============================

  const enabledDayCount = availability.filter((day) => day.enabled).length;
  const hasSessionSettings =
    sessionDuration !== "" &&
    bufferTime !== "" &&
    sessionPrice !== "";

  const hasWeeklySetup = enabledDayCount > 0;

  const guideStep = showOverrideForm
    ? 3
    : hasSessionSettings && hasWeeklySetup
      ? 3
      : hasSessionSettings
        ? 2
        : 1;

  // ===============================
  // Render
  // ===============================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
            </div>
          </Link>

          <Link
            to="/therapist/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-16 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/15 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {/* ===============================
              HEADING
          =============================== */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <CalendarDays size={12} className="text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                Scheduling
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Manage your availability
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Set up your booking schedule in three simple steps so clients
              always see the correct days, times, duration, and price.
            </p>
          </div>

          {/* ===============================
              QUICK START GUIDE
          =============================== */}

          <section className="mt-6 overflow-hidden rounded-[28px] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50/70 p-5 shadow-[0_18px_55px_-35px_rgba(124,58,237,0.35)] sm:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-2.5 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">
                      Quick setup
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                    Set your availability in 3 simple steps
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    New here? Start from the top and move down. You can change
                    these settings anytime.
                  </p>
                </div>

                <span className="self-start rounded-full border border-violet-200 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold text-violet-700 shadow-sm">
                  Step {guideStep} of 3
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <GuideStep
                  number="01"
                  title="Set session basics"
                  description="Choose session duration, buffer time, and your standard price."
                  active={guideStep === 1}
                  completed={hasSessionSettings}
                />

                <GuideStep
                  number="02"
                  title="Choose weekly hours"
                  description="Turn days on and set the hours when clients can book you."
                  active={guideStep === 2}
                  completed={hasWeeklySetup}
                />

                <GuideStep
                  number="03"
                  title="Add exceptions"
                  description="Block a date or create custom hours for a specific day."
                  active={guideStep === 3}
                  completed={overrides.length > 0}
                />
              </div>
            </div>
          </section>

          {/* ===============================
              ERROR
          =============================== */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-3.5 shadow-sm">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* ===============================
              SUCCESS
          =============================== */}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3.5 shadow-sm">
              <p className="text-xs font-medium text-emerald-700">{success}</p>
            </div>
          )}

          {/* ===============================
              LOADING
          =============================== */}

          {loading ? (
            <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.24)]">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                Loading availability...
              </div>
            </div>
          ) : (
            <>
              {/* =================================================
                  SESSION SETTINGS
              ================================================== */}

              <section className="relative mt-8 overflow-hidden rounded-[28px] border border-violet-100/80 bg-white p-5 shadow-[0_22px_65px_-35px_rgba(99,102,241,0.26)] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm ring-1 ring-violet-100">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Session Settings
                      </h2>

                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-violet-700">
                        Step 1
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Start here. This becomes your default session setup for
                      the days you make available.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {/* Session Duration */}

                  <div>
                    <label
                      htmlFor="sessionDuration"
                      className="mb-3 block text-xs font-semibold text-slate-700"
                    >
                      Session Duration (minutes)
                    </label>

                    <input
                      id="sessionDuration"
                      type="number"
                      min="1"
                      max="240"
                      step="1"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      placeholder="e.g. 30, 45, 60"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />

                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      How long one bookable session should last.
                    </p>
                  </div>

                  {/* Buffer */}

                  <div>
                    <label
                      htmlFor="bufferTime"
                      className="mb-3 block text-xs font-semibold text-slate-700"
                    >
                      Buffer Time (minutes)
                    </label>

                    <input
                      id="bufferTime"
                      type="number"
                      min="0"
                      max="120"
                      step="1"
                      value={bufferTime}
                      onChange={(e) => setBufferTime(e.target.value)}
                      placeholder="e.g. 0, 5, 10, 15"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />

                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      Leave breathing room between consecutive sessions.
                    </p>
                  </div>

                  {/* Price */}

                  <div>
                    <label
                      htmlFor="sessionPrice"
                      className="mb-3 block text-xs font-semibold text-slate-700"
                    >
                      Session Price (₹)
                    </label>

                    <input
                      id="sessionPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={sessionPrice}
                      onChange={(e) => setSessionPrice(e.target.value)}
                      placeholder="Enter session price"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />

                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      Your standard price for one session of this duration.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3">
                  <Check size={14} className="shrink-0 text-violet-600" />
                  <p className="text-[10px] font-semibold leading-5 text-violet-700">
                    Next: turn on the days you work and set the hours clients
                    can book.
                  </p>
                </div>
              </section>

              {/* =================================================
                  WEEKLY AVAILABILITY
              ================================================== */}

              <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.22)]">
                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/20 to-indigo-50/30 px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Weekly Availability
                    </h2>

                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-indigo-700">
                      Step 2
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Turn a day on, then choose its start and end time. Turn it
                    off for your regular day off.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {availability.map((day) => (
                    <div
                      key={day.day}
                      className="px-5 py-5 transition duration-200 hover:bg-violet-50/25 sm:px-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Day */}

                        <div className="flex items-center gap-4 lg:w-48">
                          <button
                            type="button"
                            onClick={() => toggleDay(day.day)}
                            className={`relative h-6 w-11 rounded-full shadow-inner transition ${
                              day.enabled
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                                : "bg-slate-200"
                            }`}
                            aria-label={`Toggle ${day.day}`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                day.enabled ? "left-6" : "left-1"
                              }`}
                            />
                          </button>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {day.day}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {day.enabled
                                ? "Clients can book in this time range"
                                : "Click the switch to make this day bookable"}
                            </p>
                          </div>
                        </div>

                        {/* Time */}

                        {day.enabled ? (
                          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-slate-500">
                                From
                              </label>

                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) =>
                                  updateTime(
                                    day.day,
                                    "startTime",
                                    e.target.value,
                                  )
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                              />
                            </div>

                            <span className="hidden text-slate-300 sm:block">
                              →
                            </span>

                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-slate-500">
                                To
                              </label>

                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(e) =>
                                  updateTime(day.day, "endTime", e.target.value)
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                              />
                            </div>

                            <p className="text-[10px] leading-5 text-slate-400 sm:ml-2">
                              Clients will only see slots inside these hours.
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">
                              Not available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
                  <p className="text-[10px] font-medium leading-5 text-slate-500">
                    Tip: this is your normal weekly routine. Use One-time
                    Changes only when a specific date needs a different schedule.
                  </p>
                </div>
              </section>

              {/* =================================================
                  ONE-TIME CHANGES
              ================================================== */}

              <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.22)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        One-time Changes
                      </h2>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                        Step 3 · Optional
                      </span>
                    </div>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                      Your weekly schedule stays the same unless you add an
                      exception here. Use this for holidays, blocked dates, or
                      a different schedule on one specific day.
                    </p>
                  </div>

                  {!showOverrideForm && (
                    <p className="text-[10px] font-semibold text-slate-400 sm:ml-auto">
                      Need a date-specific change? Click Add Change.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    {showOverrideForm ? <X size={16} /> : <Plus size={16} />}

                    {showOverrideForm ? "Close" : "Add Change"}
                  </button>
                </div>

                {/* ===============================
                    Override Form
                =============================== */}

                {showOverrideForm && (
                  <form
                    onSubmit={addOverride}
                    className="border-b border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-violet-50/30 p-5 sm:p-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {/* Date */}

                      <div>
                        <label
                          htmlFor="overrideDate"
                          className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                          Date
                        </label>

                        <input
                          id="overrideDate"
                          name="date"
                          type="date"
                          value={overrideForm.date}
                          onChange={handleOverrideChange}
                          min={getTodayDate()}
                          required
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>

                      {/* Type */}

                      <div>
                        <label
                          htmlFor="overrideType"
                          className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                          Change Type
                        </label>

                        <select
                          id="overrideType"
                          name="type"
                          value={overrideForm.type}
                          onChange={handleOverrideChange}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                        >
                          <option value="blocked">Block Entire Day</option>

                          <option value="custom">Custom Hours</option>
                        </select>
                      </div>

                      {/* Custom Hours */}

                      {overrideForm.type === "custom" && (
                        <>
                          <div>
                            <label
                              htmlFor="overrideStart"
                              className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                              From
                            </label>

                            <input
                              id="overrideStart"
                              name="startTime"
                              type="time"
                              value={overrideForm.startTime}
                              onChange={handleOverrideChange}
                              required
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="overrideEnd"
                              className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                              To
                            </label>

                            <input
                              id="overrideEnd"
                              name="endTime"
                              type="time"
                              value={overrideForm.endTime}
                              onChange={handleOverrideChange}
                              required
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="overrideDuration"
                              className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                              Session Duration (minutes)
                            </label>

                            <input
                              id="overrideDuration"
                              name="duration"
                              type="number"
                              min="1"
                              max="240"
                              step="1"
                              value={overrideForm.duration}
                              onChange={handleOverrideChange}
                              placeholder="e.g. 60"
                              required
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="overrideBuffer"
                              className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                              Buffer Time (minutes)
                            </label>

                            <input
                              id="overrideBuffer"
                              name="buffer"
                              type="number"
                              min="0"
                              max="120"
                              step="1"
                              value={overrideForm.buffer}
                              onChange={handleOverrideChange}
                              placeholder="e.g. 15"
                              required
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="overridePrice"
                              className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                              Session Price (₹)
                            </label>

                            <input
                              id="overridePrice"
                              name="price"
                              type="number"
                              min="0"
                              step="1"
                              value={overrideForm.price}
                              onChange={handleOverrideChange}
                              placeholder="Enter price"
                              required
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                      <p className="text-[10px] font-semibold leading-5 text-violet-700">
                        Choose <span className="font-extrabold">Block Entire Day</span>
                        when you are unavailable. Choose <span className="font-extrabold">Custom Hours</span>
                        when this date should have different hours, duration,
                        buffer, or price than your normal schedule.
                      </p>
                    </div>
                    {/* ===============================
                        Add Change Button
                    =============================== */}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={overrideSaving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-xs font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {overrideSaving ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            Add Change
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ===============================
                    Override List
                =============================== */}

                <div className="p-5 sm:p-6">
                  {overrides.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                      <CalendarDays
                        size={22}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No one-time changes
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Add a blocked date or custom schedule when needed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overrides.map((item) => (
                        <div
                          key={item.id}
                          className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50/60 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                {item.date}
                              </p>

                              <span
                                className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${
                                  item.type === "blocked"
                                    ? "border-red-100 bg-red-50 text-red-700"
                                    : "border-violet-100 bg-violet-50 text-violet-700"
                                }`}
                              >
                                {item.type === "blocked"
                                  ? "Blocked"
                                  : "Custom Hours"}
                              </span>
                            </div>

                            {item.type === "custom" && (
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>
                                  {item.startTime} - {item.endTime}
                                </span>

                                <span>{item.duration} min</span>

                                <span>{item.buffer} min buffer</span>

                                <span>₹{item.price}</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteOverride(item.id)}
                            className="flex h-10 w-10 items-center justify-center self-start rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:self-auto"
                            aria-label="Delete one-time change"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  SAVE AREA
              ================================================== */}

              <div className="relative mt-7 flex flex-col gap-4 overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_18px_55px_-35px_rgba(99,102,241,0.28)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-violet-600"
                  />

                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      Almost done — save your schedule
                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                      Once saved, Unfazed uses these settings to generate the
                      bookable slots your clients see.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Availability
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ===============================
// Helpers
// ===============================

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();

  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* ===============================
   GUIDED SETUP STEP
=============================== */

function GuideStep({ number, title, description, active, completed }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        completed
          ? "border-emerald-200 bg-emerald-50/80"
          : active
            ? "border-violet-300 bg-white shadow-md shadow-violet-100/60"
            : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[10px] font-extrabold ${
            completed
              ? "bg-emerald-500 text-white"
              : active
                ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {completed ? <Check size={17} /> : number}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-extrabold text-slate-800">{title}</p>

            {active && !completed && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-violet-700">
                Start here
              </span>
            )}

            {completed && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                Done
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
