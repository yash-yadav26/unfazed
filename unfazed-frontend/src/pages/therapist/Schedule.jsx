import { useState } from "react";
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SESSION_DURATIONS = [30, 45, 60, 90];

const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30];

function Schedule() {
  const [availability, setAvailability] = useState(
    DAYS.map((day) => ({
      id: day.toLowerCase(),
      day,
      enabled: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ].includes(day),
      startTime: "10:00",
      endTime: "18:00",
      slots: [],
    })),
  );

  const [sessionDuration, setSessionDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(15);

  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const [overrides, setOverrides] = useState([]);

  const [overrideForm, setOverrideForm] = useState({
    date: "",
    type: "blocked",
    startTime: "10:00",
    endTime: "18:00",
    note: "",
  });

  const toggleDay = (id) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item,
      ),
    );
  };

  const updateTime = (id, field, value) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleOverrideChange = (e) => {
    const { name, value } = e.target;

    setOverrideForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOverride = (e) => {
    e.preventDefault();

    if (!overrideForm.date) return;

    setOverrides((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...overrideForm,
      },
    ]);

    setOverrideForm({
      date: "",
      type: "blocked",
      startTime: "10:00",
      endTime: "18:00",
      note: "",
    });

    setShowOverrideForm(false);
  };

  const deleteOverride = (id) => {
    setOverrides((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    const payload = {
      availability,
      sessionDuration,
      bufferTime,
      overrides,
    };

    // API baad mein connect karenge:
    // POST /scheduling/availability
    // PATCH /scheduling/availability/:id
    console.log("Scheduling data:", payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Page Heading */}
          <div>
            <div className="flex items-center gap-2 text-violet-600">
              <CalendarDays size={18} />

              <span className="text-xs font-bold uppercase tracking-wide">
                Scheduling
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Manage your availability
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Set the days and times when clients can book sessions with you.
            </p>
          </div>

          {/* =================================================
              SESSION SETTINGS
          ================================================== */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Clock3 size={19} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Session Settings
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Choose how your bookable sessions should be generated.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Session Duration */}
              <div>
                <label className="mb-3 block text-xs font-semibold text-slate-700">
                  Session Duration
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {SESSION_DURATIONS.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setSessionDuration(duration)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        sessionDuration === duration
                          ? "border-violet-500 bg-violet-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Buffer */}
              <div>
                <label
                  htmlFor="bufferTime"
                  className="mb-3 block text-xs font-semibold text-slate-700"
                >
                  Buffer Time Between Sessions
                </label>

                <select
                  id="bufferTime"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {BUFFER_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes === 0 ? "No buffer" : `${minutes} minutes`}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-[11px] text-slate-400">
                  Buffer time helps prevent back-to-back sessions.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              WEEKLY AVAILABILITY
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-base font-bold text-slate-900">
                Weekly Availability
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Set your regular working hours for each day.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {availability.map((day) => (
                <div key={day.id} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Day */}
                    <div className="flex items-center gap-4 lg:w-48">
                      <button
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`relative h-6 w-11 rounded-full transition ${
                          day.enabled ? "bg-violet-600" : "bg-slate-200"
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
                          {day.enabled ? "Available" : "Day off"}
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
                              updateTime(day.id, "startTime", e.target.value)
                            }
                            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                              updateTime(day.id, "endTime", e.target.value)
                            }
                            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                          />
                        </div>
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
          </section>

          {/* =================================================
              OVERRIDES / BLOCKED DATES
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  One-time Changes
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Add blocked dates or temporary schedule changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-100 transition hover:bg-violet-700"
              >
                {showOverrideForm ? <X size={16} /> : <Plus size={16} />}

                {showOverrideForm ? "Close" : "Add Change"}
              </button>
            </div>

            {/* Override Form */}
            {showOverrideForm && (
              <form
                onSubmit={addOverride}
                className="border-b border-slate-100 bg-slate-50 p-5 sm:p-6"
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
                      required
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="blocked">Block Entire Day</option>

                      <option value="custom">Custom Hours</option>
                    </select>
                  </div>

                  {/* Start */}
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
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Note */}
                <div className="mt-4">
                  <label
                    htmlFor="overrideNote"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Note
                  </label>

                  <input
                    id="overrideNote"
                    name="note"
                    type="text"
                    value={overrideForm.note}
                    onChange={handleOverrideChange}
                    placeholder="e.g. Personal appointment"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Check size={15} />
                    Add Change
                  </button>
                </div>
              </form>
            )}

            {/* Override List */}
            <div className="p-5 sm:p-6">
              {overrides.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <CalendarDays size={22} className="mx-auto text-slate-300" />

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
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.date}
                          </p>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                              item.type === "blocked"
                                ? "bg-red-50 text-red-600"
                                : "bg-violet-50 text-violet-600"
                            }`}
                          >
                            {item.type === "blocked"
                              ? "Blocked"
                              : "Custom Hours"}
                          </span>
                        </div>

                        {item.type === "custom" && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.startTime} - {item.endTime}
                          </p>
                        )}

                        {item.note && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.note}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteOverride(item.id)}
                        className="flex h-9 w-9 items-center justify-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 sm:self-auto"
                        aria-label="Delete override"
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

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Availability settings
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your saved availability will be used to generate bookable
                  slots for clients.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              <Save size={17} />
              Save Availability
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Schedule;
