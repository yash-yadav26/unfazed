import {
  CalendarDays,
  Check,
  MessageCircle,
  NotebookTabs,
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
    <section id="therapists" className="bg-violet-50/60 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        {/* Content */}
        <div>
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-violet-600 shadow-sm">
            For Therapists
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need to run your practice.
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-slate-600">
            Manage your practice, clients, sessions and communication from one
            simple platform.
          </p>

          <div className="mt-7 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                  <Check size={14} />
                </div>

                <p className="text-sm font-medium text-slate-700">{feature}</p>
              </div>
            ))}
          </div>

          {/* Important: Therapist signup */}
          <a
            href="/signup/therapist"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Get Started as a Therapist
          </a>
        </div>

        {/* Therapist Dashboard Preview */}
        <div className="rounded-3xl border border-white bg-white p-5 shadow-xl shadow-violet-100">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Therapist Dashboard</p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Good morning, Dr. Sarah
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Users size={18} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-400">Today's Sessions</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">6</p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-400">Active Clients</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">24</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="text-sm font-bold text-slate-900">Practice Tools</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-violet-50 p-4 text-center">
                  <CalendarDays className="mx-auto text-violet-600" size={20} />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Calendar
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-4 text-center">
                  <Users className="mx-auto text-violet-600" size={20} />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Clients
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-4 text-center">
                  <NotebookTabs className="mx-auto text-violet-600" size={20} />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Notes
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <MessageCircle className="text-violet-600" size={18} />

                <p className="text-xs font-medium text-slate-600">
                  Secure client communication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TherapistPreview;
