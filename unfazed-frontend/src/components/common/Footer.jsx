import { HeartHandshake, Heart, Sparkles } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">

        {/* Main Footer */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">

          {/* Brand */}
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-900/30">
                <HeartHandshake size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Unfazed
                </h2>

                <p className="text-[10px] font-medium text-slate-500">
                  Therapy. Together.
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              A simple platform connecting therapists and clients
              for a better therapy experience.
            </p>
          </div>

          {/* Platform */}
          <div className="lg:mr-16">
            <h3 className="text-sm font-bold text-white">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <a
                href="#therapists"
                className="block transition hover:text-white"
              >
                For Therapists
              </a>

              <a
                href="#clients"
                className="block transition hover:text-white"
              >
                For Clients
              </a>

              <a
                href="#how-it-works"
                className="block transition hover:text-white"
              >
                How It Works
              </a>

              <a
                href="#about"
                className="block transition hover:text-white"
              >
                About Us
              </a>
            </div>
          </div>

          {/* Right Side Therapy Card */}
          <div className="hidden w-72 lg:block">
            <div className="relative overflow-hidden rounded-2xl border border-violet-900/40 bg-gradient-to-br from-violet-950 to-slate-900 p-6">

              {/* Decorative Circle */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-600/20 blur-xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                    <Heart size={19} />
                  </div>

                  <Sparkles
                    size={18}
                    className="text-violet-400"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  Your mental health matters.
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Take one step at a time. You don't have to
                  go through it alone.
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <div className="h-1.5 w-8 rounded-full bg-violet-500/40" />
                  <div className="h-1.5 w-3 rounded-full bg-violet-500/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-slate-800 pt-5">
          <p className="text-xs text-slate-500">
            © 2026 Unfazed. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;