import {
  ChevronDown,
  Menu,
  X,
  Brain,
  Heart,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";

function Navbar() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
            <span className="text-base font-bold">U</span>
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Unfazed
            </h1>

            <p className="text-[9px] font-medium text-slate-500">
              Therapy. Together.
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#therapists"
            className="text-[13px] font-medium text-slate-600 transition hover:text-violet-600"
          >
            For Therapists
          </a>

          <a
            href="#clients"
            className="text-[13px] font-medium text-slate-600 transition hover:text-violet-600"
          >
            For Clients
          </a>

          <a
            href="#how-it-works"
            className="text-[13px] font-medium text-slate-600 transition hover:text-violet-600"
          >
            How It Works
          </a>

          <a
            href="#features"
            className="text-[13px] font-medium text-slate-600 transition hover:text-violet-600"
          >
            Features
          </a>

          <a
            href="#about"
            className="text-[13px] font-medium text-slate-600 transition hover:text-violet-600"
          >
            About Us
          </a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-4 lg:flex">

          {/* Login */}
          <a
            href="/login"
            className="text-[13px] font-semibold text-slate-700 transition hover:text-violet-600"
          >
            Log In
          </a>

          <div className="h-5 w-px bg-slate-200" />

          {/* Signup Dropdown */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setIsSignupOpen(!isSignupOpen)}
              className={`
                flex h-10 items-center gap-1.5 rounded-xl
                bg-gradient-to-r from-violet-600 to-purple-600
                px-4 text-[13px] font-semibold text-white
                shadow-[0_5px_18px_rgba(124,58,237,0.22)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_8px_24px_rgba(124,58,237,0.30)]
                ${isSignupOpen ? "shadow-[0_8px_24px_rgba(124,58,237,0.30)]" : ""}
              `}
            >
              Sign Up

              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`
                  transition-transform duration-200
                  ${isSignupOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Dropdown */}
            {isSignupOpen && (
              <div
                className="
                  absolute right-0 top-[calc(100%+12px)]
                  w-[290px]
                  overflow-hidden
                  rounded-2xl
                  border border-violet-100
                  bg-white
                  p-2
                  shadow-[0_20px_50px_rgba(76,29,149,0.16)]
                  ring-1 ring-violet-50
                "
              >

                {/* Dropdown Header */}
                <div className="mb-1 rounded-xl bg-gradient-to-br from-violet-50 via-purple-50 to-white px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
                      <Heart size={15} fill="currentColor" />
                    </div>

                    <div>
                      <p className="text-[13px] font-bold text-slate-900">
                        Join Unfazed
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Choose how you'd like to get started
                      </p>
                    </div>
                  </div>
                </div>

                {/* Therapist */}
                <a
                  href="/signup/therapist"
                  onClick={() => setIsSignupOpen(false)}
                  className="
                    group mt-1 flex items-center gap-3
                    rounded-xl p-3
                    transition-all duration-200
                    hover:bg-violet-50
                  "
                >
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-xl
                      bg-violet-100 text-violet-600
                      transition-all duration-200
                      group-hover:bg-violet-600
                      group-hover:text-white
                    "
                  >
                    <Brain size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-900">
                      Therapist
                    </p>

                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      Create your therapist account
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="
                      text-slate-300
                      transition-all duration-200
                      group-hover:translate-x-0.5
                      group-hover:text-violet-600
                    "
                  />
                </a>

                {/* Divider */}
                <div className="mx-3 border-t border-slate-100" />

                {/* Client */}
                <a
                  href="/signup/client"
                  onClick={() => setIsSignupOpen(false)}
                  className="
                    group flex items-center gap-3
                    rounded-xl p-3
                    transition-all duration-200
                    hover:bg-fuchsia-50
                  "
                >
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-xl
                      bg-fuchsia-100 text-fuchsia-600
                      transition-all duration-200
                      group-hover:bg-fuchsia-600
                      group-hover:text-white
                    "
                  >
                    <Heart size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-900">
                      Client
                    </p>

                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      Start your therapy journey
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="
                      text-slate-300
                      transition-all duration-200
                      group-hover:translate-x-0.5
                      group-hover:text-fuchsia-600
                    "
                  />
                </a>

                {/* Bottom accent */}
                <div className="mt-1 h-1 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="
            rounded-xl border border-slate-200
            p-2 text-slate-700
            transition hover:border-violet-200
            hover:bg-violet-50 hover:text-violet-600
            lg:hidden
          "
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-1">

            <a
              href="#therapists"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
            >
              For Therapists
            </a>

            <a
              href="#clients"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
            >
              For Clients
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
            >
              How It Works
            </a>

            <a
              href="#features"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
            >
              Features
            </a>

            <a
              href="#about"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
            >
              About Us
            </a>

            {/* Mobile Auth */}
            <div className="mt-3 border-t border-slate-100 pt-3">

              <a
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Log In
              </a>

              <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-violet-500">
                Join Unfazed
              </p>

              <a
                href="/signup/therapist"
                className="
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-medium text-slate-700
                  transition hover:bg-violet-50 hover:text-violet-600
                "
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Brain size={16} />
                </span>

                Therapist Sign Up
              </a>

              <a
                href="/signup/client"
                className="
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-medium text-slate-700
                  transition hover:bg-fuchsia-50 hover:text-fuchsia-600
                "
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-600">
                  <Heart size={16} />
                </span>

                Client Sign Up
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;