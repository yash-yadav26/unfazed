import { CalendarDays, Check, MessageCircle, Search } from "lucide-react";

function ClientPreview() {
  const features = [
    "Find therapists that match your needs",
    "Book sessions at a convenient time",
    "Communicate securely with your therapist",
    "Track your therapy progress",
    "Access shared resources and notes",
  ];

  return (
    <section id="clients" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        {/* Client Dashboard Preview */}
        <div className="order-2 lg:order-1">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-lg">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs text-slate-400">Client Dashboard</p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                Welcome back, Alex
              </h3>

              {/* Next Session */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Next Session</p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      Tomorrow, 10:00 AM
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      with Dr. Sarah
                    </p>
                  </div>

                  <CalendarDays className="text-violet-600" size={22} />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs text-slate-400">Sessions</p>

                  <p className="mt-2 text-xl font-bold text-slate-900">12</p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-slate-400">Progress</p>

                  <p className="mt-2 text-xl font-bold text-slate-900">80%</p>
                </div>
              </div>

              {/* Tools */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <Search className="text-violet-600" size={18} />

                  <span className="text-xs font-semibold text-slate-700">
                    Find Therapist
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <MessageCircle className="text-violet-600" size={18} />

                  <span className="text-xs font-semibold text-slate-700">
                    Messages
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-1 lg:order-2">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">
            For Clients
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Therapy that fits your life.
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-slate-600">
            Find the right therapist, book sessions that work for you, and keep
            your therapy journey organized in one simple place.
          </p>

          <div className="mt-7 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={14} />
                </div>

                <p className="text-sm font-medium text-slate-700">{feature}</p>
              </div>
            ))}
          </div>

          {/* Important: Client signup */}
          <a
            href="/signup/client"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Get Started as a Client
          </a>
        </div>
      </div>
    </section>
  );
}

export default ClientPreview;
