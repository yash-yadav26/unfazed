import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CalendarX2,
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

/* =========================================================
   MOCK ANALYTICS DATA

   Backend connect hone ke baad isi data ko APIs se replace
   karenge:

   GET /analytics/overview
   GET /analytics/revenue
   GET /analytics/clients
========================================================= */

const overviewData = {
  revenue: 48500,
  activeClients: 24,
  noShowRate: 8.2,

  revenueChange: 12.5,
  clientChange: 3,
  noShowChange: -2.5,
};

const revenueData = [
  {
    month: "Mar",
    revenue: 28000,
  },
  {
    month: "Apr",
    revenue: 33500,
  },
  {
    month: "May",
    revenue: 39000,
  },
  {
    month: "Jun",
    revenue: 42000,
  },
  {
    month: "Jul",
    revenue: 45500,
  },
  {
    month: "Aug",
    revenue: 48500,
  },
];

const clientAnalyticsData = {
  totalClients: 31,
  activeClients: 24,
  newClients: 6,
  returningClients: 18,
};

function Analytics() {
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState({
    overview: overviewData,
    revenue: revenueData,
    clients: clientAnalyticsData,
  });

  /* =========================================================
     REFRESH MOCK DATA

     Backend connect hone ke baad yahin APIs call karenge.
  ========================================================== */

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setData({
        overview: {
          ...overviewData,
        },

        revenue: [...revenueData],

        clients: {
          ...clientAnalyticsData,
        },
      });

      setRefreshing(false);
    }, 600);
  };

  /* =========================================================
     FORMATTERS
  ========================================================== */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatPercent = (value) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  /* =========================================================
     DERIVED VALUES
  ========================================================== */

  const revenueSummary = useMemo(() => {
    const values = data.revenue.map((item) => Number(item.revenue) || 0);

    if (!values.length) {
      return {
        highest: 0,
        lowest: 0,
      };
    }

    return {
      highest: Math.max(...values),
      lowest: Math.min(...values),
    };
  }, [data.revenue]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
            </div>
          </Link>

          {/* Back */}
          <Link
            to="/therapist/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-600">
                <BarChart3 size={17} />

                <span className="text-xs font-bold uppercase tracking-wide">
                  Practice Analytics
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track your practice revenue, active clients and session no-show
                rate.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* =================================================
              TOP STATS
          ================================================== */}

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {/* Revenue */}
            <StatCard
              title="Revenue"
              value={formatCurrency(data.overview.revenue)}
              subtitle="Current period"
              icon={<Wallet size={20} />}
              trend={`+${data.overview.revenueChange}% this month`}
              trendPositive
            />

            {/* Active Clients */}
            <StatCard
              title="Active Clients"
              value={data.overview.activeClients}
              subtitle="Currently active"
              icon={<Users size={20} />}
              trend={`+${data.overview.clientChange} this month`}
              trendPositive
            />

            {/* No-show */}
            <StatCard
              title="No-show Rate"
              value={formatPercent(data.overview.noShowRate)}
              subtitle="Scheduled sessions"
              icon={<CalendarX2 size={20} />}
              trend={`${data.overview.noShowChange}% vs previous`}
              trendPositive={data.overview.noShowChange <= 0}
            />
          </div>

          {/* =================================================
              REVENUE TREND
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
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
                  Monthly revenue performance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-semibold text-violet-700">
                  Monthly
                </span>
              </div>
            </div>

            <div className="p-5">
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
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
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

              {/* Revenue summary */}
              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <SmallSummary
                  label="Highest Month"
                  value={formatCurrency(revenueSummary.highest)}
                />

                <SmallSummary
                  label="Lowest Month"
                  value={formatCurrency(revenueSummary.lowest)}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              CLIENT OVERVIEW
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="text-base font-bold text-slate-900">
                Client Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Client-related practice metrics.
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <MiniMetric
                label="Total Clients"
                value={data.clients.totalClients}
              />

              <MiniMetric
                label="Active Clients"
                value={data.clients.activeClients}
              />

              <MiniMetric label="New Clients" value={data.clients.newClients} />

              <MiniMetric
                label="Returning Clients"
                value={data.clients.returningClients}
              />
            </div>
          </section>

          {/* =================================================
              NO-SHOW OVERVIEW
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <CalendarX2 size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    No-show Overview
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Percentage of scheduled sessions that were marked as
                    no-show.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl font-bold text-slate-950">
                  {formatPercent(data.overview.noShowRate)}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Current no-show rate
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER NOTE
          ================================================== */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <BarChart3 size={14} />

            <span>
              Analytics data will be connected to backend aggregation APIs.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>

          {trend && (
            <p
              className={`mt-2 text-[11px] font-semibold ${
                trendPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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
    <div className="rounded-xl bg-slate-50 p-4">
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
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default Analytics;
