import { HeartHandshake, Heart, Sparkles, ArrowUpRight } from "lucide-react";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* =====================================================
          BACKGROUND DECORATIONS
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        {/* =====================================================
            TOP BRAND STATEMENT
        ====================================================== */}

        <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-1.5">
              <Sparkles
                size={13}
                className="text-violet-300"
                fill="currentColor"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                Therapy. Together.
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              A simpler way to connect,
              <span className="text-violet-400"> heal & grow.</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Unfazed brings therapists and clients together through a simple,
              organized and human-centered therapy experience.
            </p>
          </div>

          {/* Small visual mark */}
          <div className="hidden items-center gap-3 lg:flex">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-violet-500/50" />

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-violet-300">
              <Heart size={17} />
            </div>

            <div className="h-px w-12 bg-gradient-to-l from-transparent to-violet-500/50" />
          </div>
        </div>

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:gap-16">
          {/* =================================================
              BRAND
          ================================================== */}

          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-950/40">
                <HeartHandshake size={24} />

                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-violet-300" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Unfazed
                </h2>

                <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500">
                  Therapy. Together.
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
              A simple platform connecting therapists and clients for a better,
              more organized therapy experience.
            </p>

            {/* Mini trust points */}
            <div className="mt-7 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400">
                Private & Secure
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400">
                Simple Experience
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400">
                Human First
              </div>
            </div>
          </div>

          {/* =================================================
              PLATFORM
          ================================================== */}

          <div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />

              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                Platform
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              <a
                href="#therapists"
                className="group flex items-center justify-between text-sm text-slate-400 transition hover:text-white"
              >
                <span>For Therapists</span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>

              <a
                href="#clients"
                className="group flex items-center justify-between text-sm text-slate-400 transition hover:text-white"
              >
                <span>For Clients</span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>

              <a
                href="#how-it-works"
                className="group flex items-center justify-between text-sm text-slate-400 transition hover:text-white"
              >
                <span>How It Works</span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>

              <a
                href="#about"
                className="group flex items-center justify-between text-sm text-slate-400 transition hover:text-white"
              >
                <span>About Us</span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </a>
            </div>
          </div>

          {/* =================================================
              THERAPY CARD
          ================================================== */}

          <div>
            <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/80 via-slate-900 to-indigo-950/70 p-6 shadow-2xl shadow-black/20">
              {/* Card Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-500/10 text-violet-300">
                    <Heart size={18} />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[9px] font-semibold text-slate-400">
                      People first
                    </span>
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-bold leading-6 text-white">
                  Your mental health matters.
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Take one step at a time. You don't have to go through it
                  alone.
                </p>

                {/* Progress decoration */}
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />

                  <div className="h-1.5 w-10 rounded-full bg-violet-500/40" />

                  <div className="h-1.5 w-4 rounded-full bg-violet-500/20" />

                  <div className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-violet-300">
                    <Sparkles size={11} />
                    One step at a time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM
        ====================================================== */}

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © 2026 Unfazed. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Made with</span>

            <Heart size={12} className="text-violet-400" fill="currentColor" />

            <span>for a better therapy experience.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
