import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Heart,
  LogOut,
  MessageCircle,
  NotebookTabs,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

function TherapistPreview() {
  const features = [
    "Manage your schedule and availability",
    "Organize and manage your clients",
    "Create and manage session notes",
    "Communicate securely with clients",
    "Track sessions and practice activity",
  ];

  return (
    <section
      id="therapists"
      className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-3xl" />

      {/* Decorative dots */}
      <div className="pointer-events-none absolute left-8 top-10 hidden gap-2 opacity-50 sm:flex">
        <span className="h-2 w-2 rounded-full bg-violet-300" />
        <span className="h-2 w-2 rounded-full bg-violet-300" />
        <span className="h-2 w-2 rounded-full bg-violet-300" />
        <span className="h-2 w-2 rounded-full bg-violet-300" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl min-w-0 items-center gap-10 px-3 sm:gap-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
        {/* =========================================================
            LEFT CONTENT
        ========================================================= */}
        <div className="min-w-0 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <Sparkles
              size={15}
              className="text-violet-600"
              fill="currentColor"
            />

            <span className="text-xs font-bold text-violet-700">
              Built for Therapists
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:mt-6 sm:text-5xl">
            Everything you need
            <br />
            to run{" "}
            <span className="relative inline-block text-violet-600">
              your practice.
              <span className="absolute -bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rotate-[-2deg] rounded-full bg-gradient-to-r from-violet-500 to-purple-400" />
            </span>
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-7">
            Manage your practice, clients, sessions and communication from one
            simple, secure platform built around the way you work.
          </p>

          {/* Features */}
          <div className="mt-7 space-y-3.5 sm:mt-8 sm:space-y-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="group flex min-w-0 items-start gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-200 transition-transform duration-200 group-hover:scale-110">
                  <Check size={14} strokeWidth={3} />
                </div>

                <p className="min-w-0 flex-1 break-words text-sm font-medium text-slate-700 sm:text-[15px]">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/signup/therapist"
            className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(124,58,237,0.32)] sm:mt-9 sm:w-fit sm:px-6"
          >
            Get Started as a Therapist
            <ArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          {/* Trust text */}
          <div className="mt-4 flex min-w-0 items-start gap-2 text-[11px] font-medium leading-5 text-slate-500 sm:mt-5 sm:text-xs">
            <ShieldCheck size={16} className="text-violet-500" />

            <span className="min-w-0 break-words">
              Secure. Private. Built for you.
            </span>
          </div>
        </div>

        {/* =========================================================
            THERAPIST DASHBOARD PREVIEW
        ========================================================= */}
        <div className="relative min-w-0 w-full">
          {/* Glow behind dashboard */}
          <div className="absolute inset-8 rounded-[2.5rem] bg-violet-300/30 blur-3xl" />

          {/* Main Dashboard Card */}
          <div className="relative w-full min-w-0 rounded-[1.5rem] border border-white/80 bg-white/90 p-2 shadow-[0_25px_70px_rgba(76,29,149,0.16)] backdrop-blur sm:rounded-[2rem] sm:p-4">
            <div className="flex w-full min-w-0 overflow-hidden rounded-[1.25rem] border border-violet-100 bg-white sm:rounded-[1.5rem]">
              {/* =====================================================
                  SIDEBAR
              ===================================================== */}
              <aside className="hidden w-[72px] shrink-0 flex-col items-center bg-gradient-to-b from-violet-600 via-purple-600 to-violet-700 py-5 sm:flex">
                {/* Logo */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-md">
                  <span className="text-lg font-extrabold">U</span>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex flex-1 flex-col items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                    <BarChart3 size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <CalendarDays size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <Users size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <NotebookTabs size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <MessageCircle size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <BarChart3 size={17} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200 transition hover:bg-white/10 hover:text-white">
                    <Settings size={17} />
                  </div>
                </div>

                {/* Logout */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-200">
                  <LogOut size={17} />
                </div>
              </aside>

              {/* =====================================================
                  DASHBOARD CONTENT
              ===================================================== */}
              <div className="min-w-0 flex-1 overflow-hidden bg-gradient-to-br from-white to-violet-50/40 p-3 sm:p-5">
                {/* Dashboard Header */}
                <div className="flex min-w-0 items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-violet-600">
                      Therapist Dashboard
                    </p>

                    <h3 className="mt-1 break-words text-[16px] font-bold leading-6 tracking-tight text-slate-900 sm:text-xl">
                      Good morning, Dr. Sarah 👋
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    {/* Notification */}
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm">
                      <Bell size={16} />

                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
                    </div>

                    {/* Avatar */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                      DS
                    </div>
                  </div>
                </div>

                {/* =================================================
                    STATS
                ================================================= */}
                <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                  {/* Sessions */}
                  <div className="min-w-0 rounded-2xl border border-violet-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
                    <div className="flex min-w-0 items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="break-words text-[10px] font-medium text-slate-500 sm:text-xs">
                          Today's Sessions
                        </p>

                        <p className="mt-1.5 text-xl font-black text-slate-900 sm:text-2xl">
                          6
                        </p>

                        <p className="break-words mt-1 text-[10px] font-semibold text-emerald-500">
                          +2 from yesterday
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <CalendarDays size={17} />
                      </div>
                    </div>
                  </div>

                  {/* Clients */}
                  <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
                    <div className="flex min-w-0 items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="break-words text-[10px] font-medium text-slate-500 sm:text-xs">
                          Active Clients
                        </p>

                        <p className="mt-1.5 text-xl font-black text-slate-900 sm:text-2xl">
                          24
                        </p>

                        <p className="break-words mt-1 text-[10px] font-semibold text-emerald-500">
                          +5 this week
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                        <Users size={17} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    PRACTICE TOOLS
                ================================================= */}
                <div className="mt-3 w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="min-w-0 text-sm font-bold text-slate-900">
                      Practice Tools
                    </p>

                    <span className="text-[10px] font-semibold text-violet-500">
                      View all
                    </span>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:gap-2.5">
                    {/* Calendar */}
                    <div className="group min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/60">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                        <CalendarDays size={17} />
                      </div>

                      <p className="mt-2 text-[11px] font-bold text-slate-800">
                        Calendar
                      </p>

                      <p className="mt-0.5 hidden text-[9px] text-slate-400 sm:block">
                        Manage schedule
                      </p>
                    </div>

                    {/* Clients */}
                    <div className="group min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition group-hover:bg-emerald-500 group-hover:text-white">
                        <Users size={17} />
                      </div>

                      <p className="mt-2 text-[11px] font-bold text-slate-800">
                        Clients
                      </p>

                      <p className="mt-0.5 hidden text-[9px] text-slate-400 sm:block">
                        Manage clients
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="group min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition group-hover:bg-blue-500 group-hover:text-white">
                        <NotebookTabs size={17} />
                      </div>

                      <p className="mt-2 text-[11px] font-bold text-slate-800">
                        Notes
                      </p>

                      <p className="mt-0.5 hidden text-[9px] text-slate-400 sm:block">
                        Session notes
                      </p>
                    </div>
                  </div>

                  {/* Secure Communication */}
                  <div className="mt-3 flex min-w-0 items-center gap-2.5 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                      <MessageCircle size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[11px] font-bold text-slate-900">
                        Secure client communication
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-slate-500">
                        Send messages and share files securely
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-violet-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating decoration */}
          <div className="absolute -bottom-5 -right-3 hidden h-16 w-16 rounded-2xl border border-violet-100 bg-white/80 shadow-lg backdrop-blur sm:block">
            <div className="flex h-full items-center justify-center">
              <Heart
                size={24}
                className="text-violet-500"
                fill="currentColor"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TherapistPreview;
