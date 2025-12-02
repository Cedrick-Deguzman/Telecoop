import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const months: { month: string; revenue: number }[] = [];

    // Get payments for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const agg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });

      // Ensure revenue is always a number
      const revenue = agg._sum.amount ?? 0;

      const monthStr = start.toLocaleString("default", { month: "short", year: "numeric" });
      months.push({ month: monthStr, revenue });
    }

    return NextResponse.json(months);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
