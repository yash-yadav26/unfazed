import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Heart,
  HeartHandshake,
  Languages,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

function TherapistPublicProfile() {
  const { slug } = useParams();

  /*
   * =========================================================
   * MOCK THERAPIST DATA
   *
   * Backend/public profile API later:
   * GET /therapists/:slug
   * =========================================================
   */

  const therapists = {
    "dr-sharma": {
      name: "Dr. Sharma",
      title: "Clinical Psychologist",
      slug: "dr-sharma",
      location: "India",
      experience: "8 years experience",
      rating: "4.9",
      reviews: "124",
      bio: "I provide a safe and supportive space where you can talk openly, understand what you are experiencing, and work towards meaningful change at your own pace.",
      about:
        "My approach to therapy is practical, compassionate, and focused on helping clients better understand their thoughts, emotions, and patterns. I work collaboratively with clients to develop strategies that feel realistic and useful in everyday life.",
      specializations: [
        "Anxiety & Stress",
        "Depression",
        "Workplace Stress",
        "Self-Esteem",
      ],
      languages: ["English", "Hindi", "Hinglish"],
      services: [
        {
          id: "individual",
          title: "Individual Therapy",
          description:
            "One-on-one therapy focused on your personal goals and concerns.",
          duration: "60 min",
          price: "₹1,000",
        },
        {
          id: "anxiety",
          title: "Anxiety Support",
          description:
            "Support for anxiety, overthinking, stress, and emotional overwhelm.",
          duration: "60 min",
          price: "₹1,000",
        },
      ],
    },

    "dr-neha-gupta": {
      name: "Dr. Neha Gupta",
      title: "Counselling Psychologist",
      slug: "dr-neha-gupta",
      location: "India",
      experience: "6 years experience",
      rating: "4.8",
      reviews: "96",
      bio: "I help clients navigate emotional challenges, relationships, and life transitions in a warm and non-judgmental environment.",
      about:
        "I believe therapy works best when clients feel heard, respected, and involved in the process. My sessions focus on practical support and building healthier patterns in relationships and everyday life.",
      specializations: [
        "Relationships",
        "Family Concerns",
        "Emotional Wellbeing",
        "Life Transitions",
      ],
      languages: ["English", "Hindi"],
      services: [
        {
          id: "relationship",
          title: "Relationship Counseling",
          description:
            "Support for communication, relationship concerns, and emotional connection.",
          duration: "60 min",
          price: "₹1,000",
        },
        {
          id: "individual",
          title: "Individual Therapy",
          description:
            "A confidential one-on-one space for personal concerns and emotional wellbeing.",
          duration: "60 min",
          price: "₹1,000",
        },
      ],
    },

    "dr-rahul-mehta": {
      name: "Dr. Rahul Mehta",
      title: "Therapist",
      slug: "dr-rahul-mehta",
      location: "India",
      experience: "7 years experience",
      rating: "4.9",
      reviews: "108",
      bio: "I support clients dealing with depression, low motivation, difficult life transitions, and emotional challenges.",
      about:
        "My work focuses on creating a comfortable environment where clients can explore difficult experiences without judgment and build healthier ways of coping.",
      specializations: [
        "Depression",
        "Stress Management",
        "Life Transitions",
        "Emotional Support",
      ],
      languages: ["English", "Hindi"],
      services: [
        {
          id: "depression",
          title: "Depression Support",
          description:
            "Structured support for low mood, motivation, and emotional challenges.",
          duration: "60 min",
          price: "₹1,000",
        },
        {
          id: "individual",
          title: "Individual Therapy",
          description:
            "One-on-one sessions focused on your personal goals and wellbeing.",
          duration: "60 min",
          price: "₹1,000",
        },
      ],
    },
  };

  const therapist = therapists[slug] || therapists["dr-sharma"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/client/therapists" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Profile</p>
            </div>
          </Link>

          <Link
            to="/client/therapists"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Therapists
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {/* =================================================
              HERO
          ================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                {/* Therapist Info */}

                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 sm:h-24 sm:w-24">
                    <UserRound size={36} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {therapist.name}
                      </h1>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={11} />
                        Verified
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {therapist.title}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm">
                        <MapPin size={11} />
                        {therapist.location}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm">
                        <UserRound size={11} />
                        {therapist.experience}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm">
                        <Star
                          size={11}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {therapist.rating}
                        <span className="text-slate-400">
                          ({therapist.reviews})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking CTA */}

                <div className="w-full lg:w-auto">
                  <Link
                    to={`/client/booking/${therapist.slug}`}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 lg:w-auto"
                  >
                    <CalendarDays size={17} />
                    Book a Session
                    <ArrowRight size={16} />
                  </Link>

                  <p className="mt-2 text-center text-[10px] text-slate-400 lg:text-right">
                    View available dates & times
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              CONTENT GRID
          ================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            {/* =================================================
                LEFT
            ================================================== */}

            <div className="space-y-6">
              {/* About */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Heart size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      About {therapist.name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      A little about their approach
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {therapist.about}
                </p>
              </section>

              {/* Specializations */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-base font-bold text-slate-900">
                  Specializations
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Areas this therapist commonly works with
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {therapist.specializations.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              {/* Services */}

              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h2 className="text-base font-bold text-slate-900">
                    Services
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Available therapy sessions
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {therapist.services.map((service) => (
                    <div key={service.id} className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <HeartHandshake size={18} />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              {service.title}
                            </h3>

                            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                              {service.description}
                            </p>

                            <p className="mt-2 text-[10px] font-medium text-slate-400">
                              {service.duration}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-base font-bold text-slate-900">
                            {service.price}
                          </p>

                          <Link
                            to={`/client/booking/${therapist.slug}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                          >
                            Book
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT
            ================================================== */}

            <div className="space-y-6">
              {/* Quick Intro */}

              <section className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">
                  About the Therapist
                </p>

                <p className="mt-3 text-sm leading-6 text-violet-950/80">
                  {therapist.bio}
                </p>
              </section>

              {/* Languages */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-violet-600">
                    <Languages size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Languages
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Available for sessions
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {therapist.languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </section>

              {/* Privacy */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Private & Secure
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your conversations and therapy information remain private
                      and protected.
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA */}

              <section className="rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-bold">Ready to get started?</p>

                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Choose a convenient date and time for your first session.
                </p>

                <Link
                  to={`/client/booking/${therapist.slug}`}
                  className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 text-xs font-bold text-white transition hover:bg-violet-500"
                >
                  Book a Session
                  <ArrowRight size={15} />
                </Link>
              </section>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck size={13} />
            Your therapy journey is private and secure.
          </div>
        </div>
      </main>
    </div>
  );
}

export default TherapistPublicProfile;
