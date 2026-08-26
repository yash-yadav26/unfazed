import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
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
              className="flex h-10 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Sign Up

              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  isSignupOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isSignupOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-52 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)]">

                {/* Therapist */}
                <a
                  href="/signup/therapist"
                  onClick={() => setIsSignupOpen(false)}
                  className="block rounded-lg px-3.5 py-3 transition hover:bg-violet-50"
                >
                  <p className="text-[13px] font-semibold text-slate-900">
                    Therapist Sign Up
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                    Create your therapist account
                  </p>
                </a>

                {/* Client */}
                <a
                  href="/signup/client"
                  onClick={() => setIsSignupOpen(false)}
                  className="block rounded-lg px-3.5 py-3 transition hover:bg-violet-50"
                >
                  <p className="text-[13px] font-semibold text-slate-900">
                    Client Sign Up
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                    Start your therapy journey
                  </p>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
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
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              For Therapists
            </a>

            <a
              href="#clients"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              For Clients
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>

            <a
              href="#features"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Features
            </a>

            <a
              href="#about"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

              <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sign Up
              </p>

              <a
                href="/signup/therapist"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50"
              >
                Therapist Sign Up
              </a>

              <a
                href="/signup/client"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50"
              >
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