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
      where: {
        installationDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    const monthlyChangeClients =
      lastMonthClients === 0
        ? totalClients === 0
          ? 0
          : 100
        : ((totalClients - lastMonthClients) / lastMonthClients) * 100;

    // === Revenue & Monthly Change ===
    const lastMonthRevenueAggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });
    const lastMonthRevenue = lastMonthRevenueAggregate._sum.amount ?? 0;

    const thisMonthRevenueAggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentDate: { gte: startOfThisMonth, lte: now } },
    });
    const revenue = thisMonthRevenueAggregate._sum.amount ?? 0;

    const monthlyChangeRevenue =
      lastMonthRevenue === 0
        ? revenue === 0
          ? 0
          : 100
        : ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // === Active Connections & Uptime ===
    const activeConnections = await prisma.client.count({
      where: { status: "active" },
    });
    const uptime = totalClients ? (activeConnections / totalClients) * 100 : 0;

    // === Revenue Chart (last 12 months) ===
    const revenueData = ( await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        return prisma.payment.aggregate({
          _sum: { amount: true },
          where: { paymentDate: { gte: start, lte: end } },
        }).then((agg) => ({
          month: start.toLocaleString("en-US", { month: "short" }),
          revenue: agg._sum.amount ?? 0,
        }));
      })
     )
    ).reverse();

    // === New Clients Chart (last 6 months) ===
    const newClientsData = ( await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        return prisma.client.count({
          where: { installationDate: { gte: start, lte: end } },
        }).then((count) => ({
          month: start.toLocaleString("en-US", { month: "short" }),
          clients: count,
        }));
      })
     )
    ).reverse();

    // === Plan Distribution ===
    const plans = await prisma.plan.findMany({
      include: { clients: true }, // include related clients
    });

    const planDistribution = plans.map((plan) => ({
      name: plan.name,
      clients: plan.clients.length,
      color: plan.color || "#9ca3af",
    }));

    // === Recent Activity ===
    const recentPayments = await prisma.payment.findMany({
      orderBy: { paymentDate: "desc" },
      take: 5,
      include: { client: true },
    });

    const recentActivity = recentPayments.map((p) => ({
      id: p.id,
      client: p.client?.name ?? "Unknown",
      action: "Payment received",
      amount: `₱${p.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
      time: p.paymentDate.toLocaleString(),
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
