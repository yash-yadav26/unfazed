import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Users,
  CalendarDays,
  MessageCircle,
} from "lucide-react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import TherapistPreview from "../../components/therapist/TherapistPreview";
import ClientPreview from "../../components/client/ClientPreview";

import heroImage from "../../assets/LandingImage.png";

const features = [
  {
    title: "Easy Scheduling",
    description:
      "Manage availability, book sessions, and keep appointments organized.",
  },
  {
    title: "Client Management",
    description:
      "Keep client information, progress, and session history organized.",
  },
  {
    title: "Secure Communication",
    description:
      "Stay connected with secure and private communication.",
  },
  {
    title: "Notes & Documents",
    description:
      "Create session notes and manage important therapy resources.",
  },
  {
    title: "Secure & Private",
    description:
      "A privacy-focused experience for therapists and clients.",
  },
  {
    title: "Simple Experience",
    description:
      "Everything you need without unnecessary complexity.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up as a therapist or client and create your account.",
  },
  {
    number: "02",
    title: "Book or Set Up",
    description:
      "Therapists manage their practice while clients book sessions.",
  },
  {
    number: "03",
    title: "Connect & Grow",
    description:
      "Connect securely and keep your therapy journey organized.",
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
                <Sparkles size={14} />

                A better way to experience therapy
              </div>

              {/* Heading */}
              <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
                Therapy that fits

                <span className="block text-violet-200">
                  your life.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-lg leading-8 text-violet-100">
                Unfazed helps clients connect with therapists and helps
                therapists manage their practice, sessions, and clients in
                one simple place.
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
                  <ShieldCheck
                    className="shrink-0 text-violet-200"
                    size={18}
                  />

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
                  <Sparkles
                    className="shrink-0 text-violet-200"
                    size={18}
                  />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Easy to Use
                    </p>

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
                    <p className="text-xs font-bold text-white">
                      Human First
                    </p>

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

        <section
          id="features"
          className="bg-white py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

            <div className="mx-auto max-w-2xl text-center">

              <span className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-bold text-violet-600">
                Everything you need
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                All-in-one therapy management
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-500">
                Powerful tools for therapists and a seamless experience for
                clients.
              </p>

            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-100/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </section>


        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}

        <section
          id="how-it-works"
          className="bg-slate-50 py-20"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700">
                Simple. Secure. Effective.
              </span>

              <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
                How Unfazed works
              </h2>

              <p className="mt-4 text-slate-500">
                Getting started is simple.
              </p>

            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">

              {steps.map((step) => (
                <div
                  key={step.number}
                  className="text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-bold text-violet-600 shadow-lg shadow-violet-100">
                    {step.number}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}

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

        <section
          id="about"
          className="bg-slate-50 py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

            <div className="mx-auto max-w-2xl text-center">

              <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700">
                About Unfazed
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Making therapy simpler and more connected
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600">
                Unfazed is designed to make the therapy experience easier
                for both clients and therapists. From finding the right
                therapist to managing sessions and communication, everything
                is brought together in one simple platform.
              </p>

            </div>


            <div className="mt-12 grid gap-6 md:grid-cols-2">

              {/* Clients */}
              <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-sm">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Users size={25} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  For Clients
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  A simple way to find therapists, book sessions, stay
                  connected, and keep track of your therapy journey.
                </p>

                <div className="mt-6 space-y-3">

                  {[
                    "Find the right therapist",
                    "Book therapy sessions",
                    "Stay connected securely",
                    "Track your therapy journey",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-slate-700"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                        ✓
                      </div>

                      {item}
                    </div>
                  ))}

                </div>
              </div>


              {/* Therapists */}
              <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <CalendarDays size={25} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  For Therapists
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Tools to manage your practice, clients, availability,
                  sessions, notes, and communication from one place.
                </p>

                <div className="mt-6 space-y-3">

                  {[
                    "Manage your availability",
                    "Manage your clients",
                    "Organize therapy sessions",
                    "Create and manage notes",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-slate-700"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        ✓
                      </div>

                      {item}
                    </div>
                  ))}

                </div>
              </div>

            </div>


            {/* Small Statement */}
            <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-white px-6 py-5 text-center shadow-sm">

              <MessageCircle
                className="shrink-0 text-violet-600"
                size={20}
              />

              <p className="text-sm font-medium leading-6 text-slate-600">
                One platform. Two experiences. A simpler way to connect,
                manage, and grow through therapy.
              </p>

            </div>

          </div>
        </section>


        {/* =====================================================
            FINAL CTA
        ====================================================== */}

        <section className="bg-white px-5 py-16">

          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-12 text-center shadow-2xl shadow-violet-200 sm:px-12">

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-violet-100">
              Choose how you want to use Unfazed and get started today.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

              <a
                href="/signup/client"
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
              >
                Get Started as a Client
              </a>

              <a
                href="/signup/therapist"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Join as a Therapist
              </a>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Landing;