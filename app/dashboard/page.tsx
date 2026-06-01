"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardStats } from "./types";
import { DashboardSkeleton } from "./components/PageSkeletons";
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatPercent,
} from "@/app/utils/format";

const colorMap: Record<string, string> = {
  amber: "var(--color-chart-4)",
  purple: "var(--color-chart-3)",
  pink: "var(--color-chart-5)",
  indigo: "var(--color-chart-1)",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/clients/stats");
        const data: DashboardStats = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setStats({
          totalClients: 0,
          monthlyChangeClients: 0,
          revenue: 0,
          monthlyChangeRevenue: 0,
          activeConnections: 0,
          uptime: 0,
          revenueData: [],
          newClientsData: [],
          planDistribution: [],
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const cards = [
    {
      label: "Total Clients",
      value: stats?.totalClients ?? 0,
      detail: `${formatPercent(stats?.monthlyChangeClients ?? 0)} vs last month`,
      positive: (stats?.monthlyChangeClients ?? 0) >= 0,
      icon: Users,
      accent: "from-sky-500/20 via-sky-500/10 to-transparent",
      valueClass: "text-slate-950",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats?.revenue ?? 0),
      detail: `${formatPercent(stats?.monthlyChangeRevenue ?? 0)} vs last month`,
      positive: (stats?.monthlyChangeRevenue ?? 0) >= 0,
      icon: CircleDollarSign,
      accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      valueClass: "text-slate-950",
    },
    {
      label: "Active Connections",
      value: formatCompactNumber(stats?.activeConnections ?? 0),
      detail: `${(stats?.uptime ?? 0).toFixed(1)}% uptime`,
      positive: true,
      icon: Wifi,
      accent: "from-violet-500/20 via-violet-500/10 to-transparent",
      valueClass: "text-slate-950",
    },
  ];

  const filteredPlans = (stats?.planDistribution ?? []).filter((plan) => Number(plan.clients) > 0);

  return (
    <div className="space-y-6">
      <section className="shell-panel-strong grid-fade relative overflow-hidden p-6 sm:p-8">
        <div className="relative space-y-5">
          <div className="space-y-3">
            <p className="section-kicker">Operations Snapshot</p>
            <div className="space-y-3">
              <h2 className="max-w-3xl text-3xl text-slate-950 sm:text-4xl">
                Keep subscriber growth, collections, and network availability in one clear view.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                The overview below highlights current revenue momentum, client acquisition, and the most recent
                billing-related activity.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              const TrendIcon = card.positive ? ArrowUpRight : ArrowDownRight;

              return (
                <div key={card.label} className="shell-panel relative overflow-hidden p-5">
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${card.accent}`} />
                  <div className="relative space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="section-kicker">{card.label}</p>
                        <p className={`mt-3 text-3xl leading-none ${card.valueClass}`}>{card.value}</p>
                      </div>
                      <div className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
                        <Icon className="text-slate-700" size={22} />
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                        card.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <TrendIcon size={16} />
                      <span>{card.detail}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="shell-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Revenue</p>
              <h2 className="text-2xl text-slate-950">Monthly collections trend</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {stats?.revenueData.length ?? 0} months tracked
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.revenueData ?? []}>
              <defs>
                <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#235ca7" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#235ca7" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(16,35,63,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#5c6f8f" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#5c6f8f"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#235ca7" strokeWidth={3} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="shell-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Acquisition</p>
              <h2 className="text-2xl text-slate-950">New client signups</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Rolling monthly view</div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.newClientsData ?? []}>
              <CartesianGrid stroke="rgba(16,35,63,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#5c6f8f" tickLine={false} axisLine={false} />
              <YAxis stroke="#5c6f8f" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="clients" fill="#7f5af0" radius={[12, 12, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="shell-panel p-6">
          <div className="mb-5">
            <p className="section-kicker">Adoption</p>
            <h2 className="text-2xl text-slate-950">Plan distribution</h2>
          </div>

          {filteredPlans.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={filteredPlans}
                  dataKey="clients"
                  cx="50%"
                  cy="50%"
                  outerRadius={82}
                  innerRadius={42}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                >
                  {filteredPlans.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMap[entry.color] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-500">
              No plan distribution data is available yet.
            </div>
          )}
        </div>

        <div className="shell-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Activity</p>
              <h2 className="text-2xl text-slate-950">Recent account events</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {(stats?.recentActivity ?? []).length} records
            </div>
          </div>

          <div className="space-y-3">
            {(stats?.recentActivity ?? []).slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 transition hover:border-slate-300"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">{activity.client}</p>
                    <p className="text-sm text-slate-500">{activity.action}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-base font-semibold text-slate-900">{activity.amount}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(activity.time)}</p>
                  </div>
                </div>
              </div>
            ))}

            {(stats?.recentActivity ?? []).length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-500">
                No recent activity to display.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
