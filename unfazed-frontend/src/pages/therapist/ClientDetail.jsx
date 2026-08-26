import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  HeartHandshake,
  Mail,
  Phone,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";

function ClientDetail() {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("overview");

  // Temporary UI data.
  // Backend integration later:
  // GET /clients/:id
  const client = {
    id,
    name: "Ananya Sharma",
    email: "ananya@example.com",
    phone: "+91 98765 43210",
    status: "Active",
    tags: ["Anxiety"],
    joinedDate: "10 August 2026",
    lastSession: "16 August 2026",
    nextSession: "18 August 2026, 10:00 AM",
  };

  // Backend integration later:
  // GET /clients/:id/intake
  const intake = {
    demographics: {
      age: "27",
      gender: "Female",
      occupation: "Software Professional",
    },
    presentingConcern: "Managing anxiety and work-related stress.",
    history:
      "Client has experienced increased stress over the last few months.",
  };

  // Backend integration later:
  // GET /clients/:id/intake
  // Consent record should come from backend.
  const consentGiven = true;
  const consentDate = "10 August 2026";

  // Session history will later come from Scheduling.
  const sessions = [
    {
      id: 1,
      date: "16 Aug 2026",
      time: "10:00 AM",
      type: "Individual Therapy",
      status: "Completed",
    },
    {
      id: 2,
      date: "12 Aug 2026",
      time: "10:00 AM",
      type: "Individual Therapy",
      status: "Completed",
    },
    {
      id: 3,
      date: "08 Aug 2026",
      time: "10:00 AM",
      type: "Anxiety Support",
      status: "Completed",
    },
    {
      id: 4,
      date: "18 Aug 2026",
      time: "10:00 AM",
      type: "Individual Therapy",
      status: "Upcoming",
    },
  ];

  // Payment history will later come from Payment module.
  const payments = [
    {
      id: 1,
      date: "16 Aug 2026",
      amount: "₹1,000",
      status: "Paid",
    },
    {
      id: 2,
      date: "12 Aug 2026",
      amount: "₹1,000",
      status: "Paid",
    },
    {
      id: 3,
      date: "08 Aug 2026",
      amount: "₹1,000",
      status: "Paid",
    },
  ];

  // Notes will later come from Clinical Documentation module.
  const notes = [
    {
      id: 1,
      date: "16 Aug 2026",
      title: "Session follow-up",
      description: "Discussed current stressors and coping strategies.",
    },
    {
      id: 2,
      date: "12 Aug 2026",
      title: "Session note",
      description:
        "Worked on breathing techniques and managing anxious thoughts.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
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

          {/* Back */}
          <Link
            to="/therapist/clients"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Clients
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              CLIENT HEADER
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              {/* Client identity */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
                  {getInitials(client.name)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                      {client.name}
                    </h1>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      {client.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Client since {client.joinedDate}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600"
                      >
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Privacy indicator */}
              <div className="flex items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">
                <ShieldCheck size={15} className="text-emerald-600" />
                Private Client Record
              </div>
            </div>

            {/* Contact information */}
            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <InfoItem
                icon={<Mail size={16} />}
                label="Email"
                value={client.email}
              />

              <InfoItem
                icon={<Phone size={16} />}
                label="Phone"
                value={client.phone}
              />

              <InfoItem
                icon={<CalendarDays size={16} />}
                label="Next Session"
                value={client.nextSession}
              />
            </div>
          </section>

          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat
              label="Total Sessions"
              value="12"
              icon={<CalendarDays size={18} />}
            />

            <MiniStat
              label="Completed"
              value="11"
              icon={<CheckCircle2 size={18} />}
            />

            <MiniStat
              label="Total Paid"
              value="₹12,000"
              icon={<Wallet size={18} />}
            />

            <MiniStat
              label="Last Session"
              value="Today"
              icon={<Clock3 size={18} />}
            />
          </div>

          {/* =================================================
              TABS
          ================================================== */}

          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-max border-b border-slate-200">
              {[
                ["overview", "Overview"],
                ["intake", "Intake"],
                ["sessions", "Sessions"],
                ["payments", "Payments"],
                ["notes", "Notes"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={`relative px-5 py-3 text-sm font-semibold transition ${
                    activeTab === value
                      ? "text-violet-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {label}

                  {activeTab === value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================
              TAB CONTENT
          ================================================== */}

          <div className="mt-6">
            {/* =================================================
                OVERVIEW
            ================================================== */}

            {activeTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Basic Information
                    </h2>
                  </div>

                  <div className="space-y-4 p-5">
                    <DetailRow label="Full Name" value={client.name} />

                    <DetailRow label="Email" value={client.email} />

                    <DetailRow label="Phone" value={client.phone} />

                    <DetailRow label="Status" value={client.status} />

                    <DetailRow label="Client Since" value={client.joinedDate} />
                  </div>
                </section>

                {/* Tags */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Client Tags
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Tags associated with this client.
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Upcoming Session */}
                <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 lg:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                      <CalendarDays size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-violet-600">
                        Upcoming Session
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {client.nextSession}
                      </h3>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* =================================================
                INTAKE
            ================================================== */}

            {activeTab === "intake" && (
              <div className="space-y-6">
                {/* Demographics */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Demographics
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Information submitted through the client intake form.
                    </p>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-3">
                    <DetailRow label="Age" value={intake.demographics.age} />

                    <DetailRow
                      label="Gender"
                      value={intake.demographics.gender}
                    />

                    <DetailRow
                      label="Occupation"
                      value={intake.demographics.occupation}
                    />
                  </div>
                </section>

                {/* Presenting Concern + History */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className="text-base font-bold text-slate-900">
                    Intake Information
                  </h2>

                  <div className="mt-6 space-y-5">
                    <IntakeBlock
                      title="Presenting Concern"
                      value={intake.presentingConcern}
                    />

                    <IntakeBlock title="History" value={intake.history} />
                  </div>
                </section>

                {/* Consent */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Digital Consent
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Auditable consent record.
                      </p>
                    </div>

                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>

                  {consentGiven ? (
                    <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <CheckCircle2 size={13} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-700">
                            Consent given
                          </p>

                          <p className="mt-1 text-xs text-emerald-600">
                            Client has completed the required consent.
                          </p>

                          <p className="mt-2 text-[10px] text-emerald-500">
                            Recorded on {consentDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-700">
                        Consent pending
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* =================================================
                SESSION HISTORY
            ================================================== */}

            {activeTab === "sessions" && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Session History
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Sessions associated with this client.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {session.type}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {session.date} • {session.time}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold sm:self-auto ${
                          session.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================
                PAYMENT HISTORY
            ================================================== */}

            {activeTab === "payments" && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Payment History
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Payments associated with this client.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Wallet size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Therapy Session
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {payment.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {payment.amount}
                        </p>

                        <span className="text-[10px] font-semibold text-emerald-600">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================
                NOTES
            ================================================== */}

            {activeTab === "notes" && (
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Notes
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Notes associated with this client.
                    </p>
                  </div>

                  <Link
                    to="/therapist/notes"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600"
                  >
                    View Notes
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {notes.map((note) => (
                    <div key={note.id} className="px-5 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <FileText size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {note.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {note.description}
                          </p>

                          <p className="mt-2 text-[10px] text-slate-400">
                            {note.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <div className="mt-0.5 text-violet-600">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-500">{label}</p>

          <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="text-right text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

/* =========================================================
   INTAKE BLOCK
========================================================= */

function IntakeBlock({ title, value }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>

      <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default ClientDetail;
