import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // === Total Clients & Monthly Change ===
    const totalClients = await prisma.client.count();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthClients = await prisma.client.count({
      where: { installationDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });

    // Monthly change for clients
    const monthlyChangeClients =
     lastMonthClients === 0
      ? totalClients === 0
        ? 0   // nothing changed
        : 100 // last month 0, this month > 0
      : ((totalClients - lastMonthClients) / lastMonthClients) * 100;

    // === Revenue ===
    const lastMonthRevenueAggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });
    const lastMonthRevenue = lastMonthRevenueAggregate._sum.amount ?? 0;

    const thisMonthRevenueAggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfThisMonth, lte: now } },
    });
    const revenue = thisMonthRevenueAggregate._sum.amount ?? 0;
            
    const monthlyChangeRevenue =
     lastMonthRevenue === 0
      ? revenue === 0
        ? 0
        : 100 // first revenue ever
      : ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // === Active Connections ===
    const activeConnections = await prisma.client.count({
      where: { status: "active" },
    });

    // === Uptime ===
    // For simplicity, assuming all clients are up; replace with actual calculation
    const uptime = totalClients ? (activeConnections / totalClients) * 100 : 0;

    // === Revenue Chart Data (last 11 months) ===
    const revenueData: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const agg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });
      revenueData.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        revenue: agg._sum.amount ?? 0,
      });
    }

    // === New Clients Chart Data (last 6 months) ===
    const newClientsData: { month: string; clients: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await prisma.client.count({
        where: { installationDate: { gte: start, lte: end } },
      });
      newClientsData.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        clients: count,
      });
    }

    // === Plan Distribution ===
    const plans = await prisma.client.groupBy({
      by: ["plan"],
      _count: { plan: true },
    });

    const planDistribution = plans.map((p) => {
        let color = "#9ca3af";
        if (p.plan.includes("Basic 50Mbps")) color = "#6366f1";
        else if (p.plan.includes("Standard 100Mbps")) color = "#8b5cf6";
        else if (p.plan.includes("Premium 500Mbps")) color = "#ec4899";
        else if (p.plan.includes("Ultra 1Gbps")) color = "#f59e0b";

        return {
            name: p.plan, // keep the full name with price if you want
            value: p._count.plan,
            color,
        };
    });

    // === Recent Activity ===
    const recentPayments = await prisma.payment.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { client: true },
    });

    const recentActivity = recentPayments.map((p) => ({
      id: p.id,
      client: p.client.name,
      action: "Payment received",
      amount: `₱${p.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
      time: p.date.toLocaleString(),
    }));

    return NextResponse.json({
      totalClients,
      monthlyChangeClients: parseFloat(monthlyChangeClients.toFixed(1)),
      revenue,
      monthlyChangeRevenue: parseFloat(monthlyChangeRevenue.toFixed(1)),
      activeConnections,
      uptime,
      revenueData,
      newClientsData,
      planDistribution,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
