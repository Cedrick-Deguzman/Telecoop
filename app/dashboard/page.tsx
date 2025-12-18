"use client";

import { useEffect, useState } from "react";
import { Users, PhilippinePeso, Wifi } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardStats } from "./types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const colorMap: Record<string, string> = {
    amber: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    indigo: "#6366f1",
  };
  // Fetch all dashboard stats
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
      }
    };

    fetchStats();
  }, []);

  // Format currency in PHP
  const formatCurrency = (value: number) =>
    `₱${value?.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Clients */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Clients</p>
              <p className="text-3xl mt-2">
                {stats ? stats.totalClients : "Loading..."}
              </p>
              {stats?.monthlyChangeClients !== null && stats?.monthlyChangeClients !== undefined && (
                <p className={`text-sm mt-2 ${stats.monthlyChangeClients >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.monthlyChangeClients >= 0 ? "+" : ""}
                  {stats.monthlyChangeClients.toFixed(1)}% from last month
                </p>
              )}
            </div>
            <div className="bg-indigo-100 p-4 rounded-full">
              <Users className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Monthly Revenue</p>
              <p className="text-3xl mt-2">
                {stats ? formatCurrency(stats.revenue) : "Loading..."}
              </p>
              {stats && stats.monthlyChangeRevenue !== null && (
                <p className={`text-sm mt-2 ${stats.monthlyChangeRevenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.monthlyChangeRevenue >= 0 ? "+" : ""}
                  {stats.monthlyChangeRevenue.toFixed(1)}% from last month
                </p>
              )}
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <PhilippinePeso className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Connections</p>
              <p className="text-3xl mt-2">
                {stats ? stats.activeConnections : "Loading..."}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {stats?.uptime !== null && stats?.uptime !== undefined ? `${stats.uptime.toFixed(1)}% uptime` : "N/A"}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <Wifi className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.revenueData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₱${value?.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* New Clients Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl mb-4">New Clients</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.newClientsData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clients" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl mb-4">Plan Distribution</h2>
            {stats?.planDistribution && stats.planDistribution.length > 0 && (
              (() => {
                const filteredPlans = stats.planDistribution.filter(p => Number(p.clients) > 0); // use 'clients', not 'value' if your API returns 'clients'
                return (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={filteredPlans}
                        dataKey="clients" // use the correct key from your API
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {filteredPlans.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorMap[entry.color] || "#9ca3af"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()
            )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats?.recentActivity?.slice(0,4).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div>
                  <p>{activity.client}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <div className="text-right">
                  <p>{activity.amount}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
