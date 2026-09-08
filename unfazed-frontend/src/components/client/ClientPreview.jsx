import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function ClientPreview() {
  const features = [
    "Find therapists that match your needs",
    "Book sessions at a convenient time",
    "Communicate securely with your therapist",
    "Track your therapy progress",
    "Access shared resources and notes",
  ];

  return (
    <section
      id="clients"
      className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-violet-50/40 py-12 sm:py-20 lg:py-24"
    >
      {/* =========================================================
          BACKGROUND DECORATIONS
      ========================================================= */}

      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 -top-20 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />

      {/* Decorative dots */}
      <div className="pointer-events-none absolute right-8 top-16 hidden grid-cols-4 gap-2 opacity-50 sm:grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-emerald-300"
          />
        ))}
      </div>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:gap-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
        {/* =======================================================
            CLIENT DASHBOARD PREVIEW
        ======================================================= */}

        <div className="order-2 lg:order-1">
          <div className="relative">
            {/* Dashboard Glow */}
            <div className="absolute inset-8 rounded-[2.5rem] bg-emerald-300/25 blur-3xl" />

            {/* Main Dashboard */}
            <div className="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-2.5 shadow-[0_25px_70px_rgba(16,185,129,0.14)] backdrop-blur sm:rounded-[2rem] sm:p-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white">
                {/* =================================================
                    DASHBOARD HEADER
                ================================================== */}

                <div className="bg-gradient-to-r from-emerald-50 via-white to-violet-50/60 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600">
                        Client Dashboard
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                        Welcome back, Alex 👋
                      </h3>

                      <p className="mt-1 text-[11px] text-slate-500">
                        Here's what's happening with your journey.
                      </p>
                    </div>

                    {/* Profile */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white shadow-sm">
                      A
                    </div>
                  </div>

                  {/* =================================================
                      NEXT SESSION
                  ================================================== */}

                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-sm sm:mt-6 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <CalendarDays size={20} />
                        </div>

                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Next Session
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            Tomorrow, 10:00 AM
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            with Dr. Sarah
                          </p>
                        </div>
                      </div>

                      <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-600 sm:inline-flex">
                        Upcoming
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      STATS
                  ================================================== */}

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Sessions */}
                    <div className="rounded-2xl border border-violet-100 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                            Sessions
                          </p>

                          <p className="mt-1.5 text-2xl font-bold text-slate-900">
                            12
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-violet-500">
                            Total sessions
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <CalendarDays size={17} />
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                            Progress
                          </p>

                          <p className="mt-1.5 text-2xl font-bold text-slate-900">
                            80%
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-emerald-500">
                            Keep going
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <TrendingUp size={17} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      CLIENT TOOLS
                  ================================================== */}

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">
                        Your Tools
                      </p>

                      <span className="text-[10px] font-semibold text-emerald-600">
                        Explore
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3">
                      {/* Find Therapist */}
                      <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/60">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                          <Search size={17} />
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-slate-800">
                            Find Therapist
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            Find your match
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                          <MessageCircle size={17} />
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-slate-800">
                            Messages
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            Stay connected
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Secure communication */}
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                        <ShieldCheck size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-900">
                          Your conversations stay private
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-slate-500">
                          Secure communication with your therapist
                        </p>
                      </div>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Heart */}
            <div className="absolute -bottom-5 -left-3 hidden h-16 w-16 rounded-2xl border border-emerald-100 bg-white/90 shadow-lg backdrop-blur sm:block">
              <div className="flex h-full items-center justify-center">
                <Heart
                  size={24}
                  className="text-emerald-500"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            CONTENT
        ======================================================= */}

        <div className="order-1 lg:order-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 shadow-sm">
            <Sparkles
              size={14}
              className="text-emerald-600"
              fill="currentColor"
            />

            <span className="text-xs font-bold text-emerald-700">
              Built for Clients
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:mt-6 sm:text-5xl">
            Therapy that fits
            <br />
            <span className="relative inline-block text-emerald-600">
              your life.
              <span className="absolute -bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rotate-[2deg] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
            </span>
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-7">
            Find the right therapist, book sessions that work for you, and keep
            your therapy journey organized in one simple, supportive place.
          </p>

          {/* Features */}
          <div className="mt-7 space-y-3.5 sm:mt-8 sm:space-y-4">
            {features.map((feature) => (
              <div key={feature} className="group flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200 transition-transform duration-200 group-hover:scale-110">
                  <Check size={14} strokeWidth={3} />
                </div>

                <p className="text-sm font-medium text-slate-700 sm:text-[15px]">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/signup/client"
            className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(16,185,129,0.30)] sm:mt-9 sm:w-fit sm:px-6"
          >
            Get Started as a Client
            <ArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          {/* Trust */}
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-500 sm:mt-5 sm:text-xs">
            <ShieldCheck size={16} className="text-emerald-500" />

            <span>Private. Supportive. Designed around you.</span>
          </div>

          {/* Small reassurance */}
          <div className="mt-6 flex items-center gap-3 sm:mt-7">
            <div className="flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[10px] font-bold text-violet-600">
                A
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[10px] font-bold text-emerald-600">
                J
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[10px] font-bold text-blue-600">
                M
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              A simpler way to take care of your mental wellbeing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientPreview;
