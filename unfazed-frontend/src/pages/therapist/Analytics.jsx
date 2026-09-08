import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Activity,
  BarChart3,
  HeartHandshake,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAnalyticsOverview,
  getRevenueTrend,
  getClientAnalytics,
} from "../../api/therapistAnalyticsApi";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

/* =========================================================
   PAGE
========================================================= */

function Analytics() {
  const [data, setData] = useState({
    overview: {
      revenue: 0,
      activeClients: 0,
    },

    revenue: [],

    clients: {
      totalClients: 0,
      activeClients: 0,
      newClients: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH ANALYTICS
  ========================================================== */

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /*
       * Teeno analytics APIs parallel mein call hongi.
       */

      const [overviewResponse, revenueResponse, clientsResponse] =
        await Promise.all([
          getAnalyticsOverview(),
          getRevenueTrend(),
          getClientAnalytics(),
        ]);

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   statusCode: 200,
       *   message: "...",
       *   data: ...
       * }
       */

      setData({
        overview: overviewResponse?.data || {
          revenue: 0,
          activeClients: 0,
        },

        revenue: Array.isArray(revenueResponse?.data)
          ? revenueResponse.data
          : [],

        clients: clientsResponse?.data || {
          totalClients: 0,
          activeClients: 0,
          newClients: 0,
        },
      });
    } catch (err) {
      console.error("Failed to fetch therapist analytics:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load analytics. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      fetchAnalytics();
    }, 0);

    return () => clearTimeout(initialLoad);
  }, []);

  /* =========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  /* =========================================================
     REVENUE SUMMARY
  ========================================================== */

  const revenueSummary = useMemo(() => {
    if (!data.revenue.length) {
      return {
        highestMonth: null,
        lowestMonth: null,
      };
    }

    const highestMonth = data.revenue.reduce((highest, current) =>
      Number(current.revenue || 0) > Number(highest.revenue || 0)
        ? current
        : highest,
    );

    const lowestMonth = data.revenue.reduce((lowest, current) =>
      Number(current.revenue || 0) < Number(lowest.revenue || 0)
        ? current
        : lowest,
    );

    return {
      highestMonth,
      lowestMonth,
    };
  }, [data.revenue]);

  /* =========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
        <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="pointer-events-none fixed -right-28 top-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-8 lg:px-10">
            <Link to="/therapist/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">
                  Unfazed
                </p>

                <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="px-5 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <RefreshCw size={20} className="animate-spin" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading analytics...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching your practice data.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================== */

  if (error && !data.revenue.length) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
        <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="pointer-events-none fixed -right-28 top-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link to="/therapist/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">
                  Unfazed
                </p>

                <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
              </div>
            </Link>

            <Link
              to="/therapist/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="px-5 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
            <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <BarChart3 size={21} />
              </div>

              <h1 className="mt-4 text-base font-bold text-slate-900">
                Unable to load analytics
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

              <button
                type="button"
                onClick={() => fetchAnalytics()}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/20 blur-3xl" />
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
            </div>
          </Link>

          <Link
            to="/therapist/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <BarChart3 size={12} className="text-violet-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">
                  Practice Analytics
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Get a quick view of revenue performance, client activity, and
                the trends shaping your practice.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* =================================================
              ERROR BANNER
          ================================================== */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50 px-4 py-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Activity size={16} />
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Analytics refreshed with an issue
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              TOP STATS
          ================================================== */}

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Revenue"
              value={formatCurrency(data.overview.revenue)}
              subtitle="Total paid revenue"
              icon={<Wallet size={20} />}
              accent="violet"
            />

            <StatCard
              title="Active Clients"
              value={data.overview.activeClients}
              subtitle="Clients with valid sessions"
              icon={<Users size={20} />}
              accent="indigo"
            />

            <StatCard
              title="New Clients"
              value={data.clients.newClients}
              subtitle="New clients in the current analytics period"
              icon={<TrendingUp size={20} />}
              accent="emerald"
            />
          </div>

          {/* =================================================
              REVENUE TREND
          ================================================== */}

          <section className="mt-6 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <TrendingUp size={18} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Revenue Trend
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Monthly paid revenue performance.
                </p>
              </div>

              <div className="hidden" />
            </div>

            <div className="p-5 sm:p-6">
              {data.revenue.length > 0 ? (
                <>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.revenue}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                          tickFormatter={(value) =>
                            `₹${Number(value).toLocaleString("en-IN")}`
                          }
                        />

                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: "#7c3aed",
                          }}
                          activeDot={{
                            r: 6,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Summary */}

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <SmallSummary
                      label="Highest Month"
                      value={
                        revenueSummary.highestMonth
                          ? `${revenueSummary.highestMonth.month} • ${formatCurrency(
                              revenueSummary.highestMonth.revenue,
                            )}`
                          : "—"
                      }
                    />

                    <SmallSummary
                      label="Lowest Month"
                      value={
                        revenueSummary.lowestMonth
                          ? `${revenueSummary.lowestMonth.month} • ${formatCurrency(
                              revenueSummary.lowestMonth.revenue,
                            )}`
                          : "—"
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-[340px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <TrendingUp size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      No revenue data yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Paid revenue will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              CLIENT OVERVIEW
          ================================================== */}

          <section className="mt-6 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/20 to-indigo-50/30 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Users size={18} />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Client Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Understand your client base at a glance.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <MiniMetric
                label="Total Clients"
                value={data.clients.totalClients}
              />

              <MiniMetric
                label="Active Clients"
                value={data.clients.activeClients}
              />

              <MiniMetric label="New Clients" value={data.clients.newClients} />
            </div>
          </section>

          {/* =================================================
              DATA NOTE
          ================================================== */}

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-medium text-slate-400">
            <BarChart3 size={13} className="text-violet-400" />
            Analytics are calculated from your real sessions and payment data.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, subtitle, icon, accent = "violet" }) {
  const variants = {
    violet: {
      icon: "from-violet-100 to-indigo-100 text-violet-700 ring-violet-100",
      value: "text-violet-700",
      border: "border-violet-100/80",
    },
    indigo: {
      icon: "from-indigo-100 to-blue-100 text-indigo-700 ring-indigo-100",
      value: "text-indigo-700",
      border: "border-indigo-100/80",
    },
    emerald: {
      icon: "from-emerald-100 to-teal-100 text-emerald-700 ring-emerald-100",
      value: "text-emerald-700",
      border: "border-emerald-100/80",
    },
  };

  const variant = variants[accent] || variants.violet;

  return (
    <div className={`rounded-[24px] border bg-white p-5 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-34px_rgba(99,102,241,0.22)] ${variant.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className={`mt-2 truncate text-2xl font-extrabold tracking-tight ${variant.value}`}>
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm ring-1 ring-violet-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-slate-500">{label}</p>

          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
          <Users size={18} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL SUMMARY
========================================================= */

function SmallSummary({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default Analytics;
