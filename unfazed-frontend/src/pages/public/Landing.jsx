import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import TherapistPreview from "../../components/therapist/TherapistPreview";
import ClientPreview from "../../components/client/ClientPreview";

import heroImage from "../../assets/LandingImage.png";

const features = [
  {
    number: "01",
    title: "Easy Scheduling",
    description:
      "Manage availability, book sessions, and keep appointments organized.",
    icon: CalendarDays,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    borderColor: "border-violet-100",
    glow: "group-hover:shadow-violet-100/70",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    number: "02",
    title: "Client Management",
    description:
      "Keep client information, progress, and session history organized.",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
    glow: "group-hover:shadow-blue-100/70",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    title: "Secure Communication",
    description: "Stay connected with secure and private communication.",
    icon: MessageCircle,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    glow: "group-hover:shadow-emerald-100/70",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    number: "04",
    title: "Notes & Documents",
    description: "Create session notes and manage important therapy resources.",
    icon: ClipboardCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100",
    glow: "group-hover:shadow-amber-100/60",
    accent: "from-amber-500 to-orange-500",
  },
  {
    number: "05",
    title: "Secure & Private",
    description: "A privacy-focused experience for therapists and clients.",
    icon: ShieldCheck,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-100",
    glow: "group-hover:shadow-indigo-100/70",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    number: "06",
    title: "Simple Experience",
    description: "Everything you need without unnecessary complexity.",
    icon: Sparkles,
    iconBg: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
    borderColor: "border-fuchsia-100",
    glow: "group-hover:shadow-fuchsia-100/60",
    accent: "from-fuchsia-500 to-violet-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up as a client or therapist and get started in minutes.",
    icon: Users,
    numberColor: "bg-violet-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    borderHover: "hover:border-violet-200",
    bgHover: "hover:bg-violet-50/30",
    accent: "bg-gradient-to-r from-violet-500 to-indigo-500",
  },
  {
    number: "02",
    title: "Connect and plan",
    description: "Find the right match, schedule sessions, and stay organized.",
    icon: CalendarDays,
    numberColor: "bg-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
    bgHover: "hover:bg-blue-50/30",
    accent: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    title: "Make progress together",
    description: "Use simple tools to communicate, manage care, and grow.",
    icon: HeartHandshake,
    numberColor: "bg-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-200",
    bgHover: "hover:bg-emerald-50/30",
    accent: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700">
          {/* Background Decorations */}
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 pb-16 pt-20 sm:px-8 lg:grid-cols-2 lg:px-10">
            {/* =================================================
                HERO CONTENT
            ================================================== */}

            <div>
              {/* Small Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                <Sparkles size={14} />A better way to experience therapy
              </div>

              {/* Heading */}
              <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
                Therapy that fits
                <span className="block text-violet-200">your life.</span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-lg leading-8 text-violet-100">
                Unfazed helps clients connect with therapists and helps
                therapists manage their practice, sessions, and clients in one
                simple place.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {/* Client Signup */}
                <a
                  href="/signup/client"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-violet-700 shadow-xl transition hover:bg-violet-50"
                >
                  Get Started as a Client
                  <ArrowRight size={17} />
                </a>

                {/* Therapist Signup */}
                <a
                  href="/signup/therapist"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Join as a Therapist
                </a>
              </div>

              {/* Trust Points */}
              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                {/* Private */}
                <div className="flex items-start gap-2">
                  <ShieldCheck className="shrink-0 text-violet-200" size={18} />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Private & Secure
                    </p>

                    <p className="mt-1 text-[11px] text-violet-200">
                      Built with privacy in mind
                    </p>
                  </div>
                </div>

                {/* Easy */}
                <div className="flex items-start gap-2">
                  <Sparkles className="shrink-0 text-violet-200" size={18} />

                  <div>
                    <p className="text-xs font-bold text-white">Easy to Use</p>

                    <p className="mt-1 text-[11px] text-violet-200">
                      Simple & intuitive
                    </p>
                  </div>
                </div>

                {/* Human */}
                <div className="flex items-start gap-2">
                  <HeartHandshake
                    className="shrink-0 text-violet-200"
                    size={18}
                  />

                  <div>
                    <p className="text-xs font-bold text-white">Human First</p>

                    <p className="mt-1 text-[11px] text-violet-200">
                      Designed around people
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                HERO IMAGE
            ================================================== */}

            <div className="relative flex items-center justify-center">
              <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur">
                <img
                  src={heroImage}
                  alt="Therapist helping a client"
                  className="block h-auto w-full rounded-[1.5rem] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        {/* =====================================================
    FEATURES
====================================================== */}

        <section
          id="features"
          className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
        >
          {/* =================================================
      BACKGROUND DECORATIONS
  ================================================== */}

          <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-violet-100/40 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-100/20 blur-3xl" />

          {/* Decorative dots */}
          <div className="pointer-events-none absolute left-8 top-20 hidden grid-cols-4 gap-2 opacity-40 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-violet-300"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-24 right-10 hidden grid-cols-4 gap-2 opacity-40 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-indigo-300"
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* =================================================
        SECTION HEADER
    ================================================== */}

            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 shadow-sm">
                <Sparkles
                  size={14}
                  className="text-violet-600"
                  fill="currentColor"
                />

                <span className="text-xs font-bold text-violet-700">
                  Everything you need
                </span>
              </div>

              {/* Heading */}
              <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Everything you need to make
                <span className="block text-violet-600">therapy easier.</span>
              </h2>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Powerful tools for therapists and a seamless experience for
                clients, all brought together in one simple platform.
              </p>
            </div>

            {/* =================================================
        FEATURE GRID
    ================================================== */}

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.number}
                    className={`
              group relative overflow-hidden rounded-3xl
              border ${feature.borderColor}
              bg-white
              p-6 sm:p-7
              shadow-[0_10px_35px_rgba(15,23,42,0.045)]
              transition-all duration-300
              hover:-translate-y-2
              hover:shadow-[0_22px_50px_rgba(15,23,42,0.09)]
              ${feature.glow}
            `}
                  >
                    {/* =================================================
                TOP ACCENT
            ================================================== */}

                    <div
                      className={`
                absolute left-0 right-0 top-0 h-1
                bg-gradient-to-r ${feature.accent}
                opacity-60
                transition-all duration-300
                group-hover:opacity-100
              `}
                    />

                    {/* =================================================
                CARD TOP
            ================================================== */}

                    <div className="flex items-start justify-between">
                      {/* Icon */}
                      <div
                        className={`
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl
                  ${feature.iconBg}
                  ${feature.iconColor}
                  transition-all duration-300
                  group-hover:scale-105
                  group-hover:rotate-2
                `}
                      >
                        <Icon size={23} strokeWidth={1.9} />
                      </div>

                      {/* Number */}
                      <span className="text-xs font-extrabold tracking-widest text-slate-200 transition-colors duration-300 group-hover:text-slate-300">
                        {feature.number}
                      </span>
                    </div>

                    {/* =================================================
                CONTENT
            ================================================== */}

                    <div className="mt-7">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                        {feature.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {feature.description}
                      </p>
                    </div>

                    {/* =================================================
                BOTTOM LINK / ACCENT
            ================================================== */}

                    <div className="mt-7 flex items-center justify-between">
                      {/* Accent line */}
                      <div
                        className={`
                  h-1 w-10 rounded-full
                  bg-gradient-to-r ${feature.accent}
                  transition-all duration-300
                  group-hover:w-16
                `}
                      />

                      {/* Learn more visual */}
                      <div className="flex items-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Built for you
                        </span>

                        <ArrowRight size={13} className="text-violet-500" />
                      </div>
                    </div>

                    {/* =================================================
                HOVER GLOW
            ================================================== */}

                    <div
                      className={`
                pointer-events-none absolute -bottom-16 -right-16
                h-32 w-32 rounded-full
                bg-gradient-to-br ${feature.accent}
                opacity-0 blur-3xl
                transition-opacity duration-300
                group-hover:opacity-10
              `}
                    />
                  </div>
                );
              })}
            </div>

            {/* =================================================
        BOTTOM FEATURE STRIP
    ================================================== */}

            <div className="mx-auto mt-10 max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-5 shadow-sm">
                {/* Accent */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-indigo-500" />

                <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Designed with simplicity and privacy in mind.
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Everything stays focused on creating a better therapy
                      experience.
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="hidden text-violet-500 sm:block"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}

        <section
          id="how-it-works"
          className="relative overflow-hidden border-y border-slate-100 bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 sm:py-24 lg:py-28"
        >
          {/* =================================================
              BACKGROUND DECORATIONS
          ================================================== */}

          <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-100/40 blur-3xl" />

          {/* Decorative Dots - Left */}
          <div className="pointer-events-none absolute left-8 top-20 hidden grid-cols-4 gap-2 opacity-50 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-violet-300"
              />
            ))}
          </div>

          {/* Decorative Dots - Right */}
          <div className="pointer-events-none absolute bottom-20 right-10 hidden grid-cols-4 gap-2 opacity-40 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-purple-300"
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* =================================================
                SECTION HEADER
            ================================================== */}

            <div className="mx-auto max-w-2xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
                <Sparkles
                  size={14}
                  className="text-violet-600"
                  fill="currentColor"
                />

                <span className="text-xs font-bold text-violet-700">
                  Simple. Secure. Effective.
                </span>
              </div>

              {/* Heading */}
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                How <span className="text-violet-600">Unfazed</span> works
              </h2>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Getting started is simple. Whether you're a therapist or a
                client, Unfazed makes every step easy.
              </p>
            </div>

            {/* =================================================
                STEPS
            ================================================== */}

            <div className="relative mt-14 lg:mt-16">
              {/* Desktop Connecting Line */}
              <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[42px] hidden h-px bg-gradient-to-r from-violet-200 via-blue-200 to-emerald-200 lg:block" />

              {/* Desktop Line Dots */}
              <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[38px] hidden justify-between lg:flex">
                <span className="h-2 w-2 rounded-full bg-violet-300" />
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
              </div>

              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className={`
                        group relative rounded-3xl
                        border border-slate-100
                        bg-white p-6
                        shadow-[0_10px_35px_rgba(15,23,42,0.05)]
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]
                        ${step.borderHover}
                        ${step.bgHover}
                        sm:p-7
                      `}
                    >
                      {/* Top Row */}
                      <div className="relative z-10 flex items-center justify-between">
                        {/* Number */}
                        <div
                          className={`
                            flex h-[72px] w-[72px]
                            items-center justify-center
                            rounded-full
                            ${step.numberColor}
                            text-xl font-extrabold text-white
                            shadow-lg
                            transition-transform duration-300
                            group-hover:scale-105
                          `}
                        >
                          {step.number}
                        </div>

                        {/* Icon */}
                        <div
                          className={`
                            flex h-11 w-11
                            items-center justify-center
                            rounded-2xl
                            ${step.iconBg}
                            ${step.iconColor}
                            transition-transform duration-300
                            group-hover:rotate-3
                          `}
                        >
                          <Icon size={21} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-7">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>
                      </div>

                      {/* Bottom Accent */}
                      <div
                        className={`
                          mt-6 h-1 w-12 rounded-full
                          transition-all duration-300
                          group-hover:w-20
                          ${step.accent}
                        `}
                      />

                      {/* Step Label */}
                      <div className="absolute bottom-6 right-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                          Step {step.number}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                BOTTOM TRUST STRIP
            ================================================== */}

            <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-purple-50 to-violet-50 px-5 py-4 text-center sm:flex-row sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                <Check size={16} strokeWidth={3} />
              </div>

              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                One simple platform for a better therapy experience.
              </p>

              <ArrowRight
                size={16}
                className="hidden text-violet-500 sm:block"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            THERAPIST
        ====================================================== */}

        <TherapistPreview />

        {/* =====================================================
            CLIENT
        ====================================================== */}

        <ClientPreview />

        {/* =====================================================
            ABOUT US
        ====================================================== */}

        {/* =====================================================
    ABOUT US
====================================================== */}

        <section
          id="about"
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/50 py-20 sm:py-24 lg:py-28"
        >
          {/* =================================================
      BACKGROUND DECORATIONS
  ================================================== */}

          <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />

          <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-100/30 blur-3xl" />

          {/* Decorative dots */}
          <div className="pointer-events-none absolute left-8 top-20 hidden grid-cols-4 gap-2 opacity-50 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-violet-300"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-24 right-10 hidden grid-cols-4 gap-2 opacity-40 sm:grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-emerald-300"
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* =================================================
        SECTION HEADER
    ================================================== */}

            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 shadow-sm">
                <Sparkles
                  size={14}
                  className="text-violet-600"
                  fill="currentColor"
                />

                <span className="text-xs font-bold text-violet-700">
                  About Unfazed
                </span>
              </div>

              {/* Heading */}
              <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Making therapy
                <span className="text-violet-600"> simpler, </span>
                more connected.
              </h2>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Unfazed brings clients and therapists together through a simple,
                organized platform designed around the therapy experience.
              </p>
            </div>

            {/* =================================================
        MAIN STORY CARD
    ================================================== */}

            <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              {/* Top Gradient Strip */}
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />

              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                {/* =================================================
            LEFT — BRAND STORY
        ================================================== */}

                <div className="relative p-7 sm:p-10 lg:p-12">
                  {/* Small Label */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <HeartHandshake size={20} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
                        Our Approach
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        People first. Always.
                      </p>
                    </div>
                  </div>

                  {/* Story */}
                  <h3 className="mt-8 max-w-xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                    One simple place for the
                    <span className="text-violet-600">
                      {" "}
                      entire therapy journey.
                    </span>
                  </h3>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                    Unfazed is designed to make the therapy experience easier
                    for both clients and therapists. From finding the right
                    therapist to managing sessions and communication, everything
                    is brought together in one simple platform.
                  </p>

                  {/* Highlight Points */}
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {/* Point 1 */}
                    <div className="group rounded-2xl border border-violet-100 bg-violet-50/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-violet-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                          <Users size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Built for people
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Simple & human-centered
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Point 2 */}
                    <div className="group rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <ShieldCheck size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Privacy focused
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Secure & private experience
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Statement */}
                  <div className="mt-8 flex items-start gap-3 border-t border-slate-100 pt-7">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                      <Sparkles size={15} />
                    </div>

                    <p className="text-sm font-medium leading-6 text-slate-600">
                      We believe technology should make therapy feel easier, not
                      more complicated.
                    </p>
                  </div>
                </div>

                {/* =================================================
            RIGHT — TWO EXPERIENCES
        ================================================== */}

                <div className="relative bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 lg:p-10">
                  {/* Small heading */}
                  <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      One platform
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Two experiences, one purpose.
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* =================================================
                CLIENT CARD
            ================================================== */}

                    <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/50">
                      {/* Accent */}
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-indigo-500" />

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition-transform duration-300 group-hover:scale-105">
                          <Users size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-bold text-slate-900">
                              For Clients
                            </h4>

                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-bold text-violet-600">
                              Your Journey
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            A simple way to find therapists, book sessions, stay
                            connected, and keep track of your therapy journey.
                          </p>

                          {/* Features */}
                          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                            {[
                              "Find therapists",
                              "Book sessions",
                              "Secure messaging",
                              "Track progress",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center gap-2"
                              >
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                  <Check size={9} strokeWidth={3} />
                                </div>

                                <span className="text-[10px] font-medium text-slate-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                THERAPIST CARD
            ================================================== */}

                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/50">
                      {/* Accent */}
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                          <CalendarDays size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-bold text-slate-900">
                              For Therapists
                            </h4>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                              Your Practice
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Tools to manage your practice, clients,
                            availability, sessions, notes, and communication
                            from one place.
                          </p>

                          {/* Features */}
                          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                            {[
                              "Manage availability",
                              "Manage clients",
                              "Organize sessions",
                              "Manage notes",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center gap-2"
                              >
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                  <Check size={9} strokeWidth={3} />
                                </div>

                                <span className="text-[10px] font-medium text-slate-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
              MINI TRUST BAR
          ================================================== */}

                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-emerald-100 text-violet-600">
                      <MessageCircle size={17} />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-900">
                        Connect. Manage. Grow.
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        Everything in one simple platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
        BOTTOM BRAND STATEMENT
    ================================================== */}

            <div className="mx-auto mt-10 max-w-3xl">
              <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-emerald-50 px-6 py-5 text-center shadow-sm">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-emerald-500" />

                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                  <HeartHandshake
                    size={19}
                    className="shrink-0 text-violet-600"
                  />

                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    One platform. Two experiences.
                    <span className="text-violet-600">
                      {" "}
                      A simpler way to connect through therapy.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;
