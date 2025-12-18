import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          // Invoices within the current month
          {
            billingDate: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
          {
            status: "pending",
            billingDate: { lt: firstDayOfMonth },
          },
          // Overdue invoices
          {
            status: { not: "paid" },
            dueDate: { lt: today },
          },
        ],
      },
      include: {
        client: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = invoices.map(inv => {
      let status = inv.status;

      // Auto-mark as overdue if past due
      if (status !== "paid" && inv.dueDate < today) {
        status = "overdue";
      }

      return {
        id: inv.id,
        clientId: inv.clientId,
        clientName: inv.client.name,
        email: inv.client.email ?? "",
        plan: inv.client.plan?.name ?? "",
        amount: inv.amount,
        billingDate: inv.billingDate.toISOString().split("T")[0],
        dueDate: inv.dueDate.toISOString().split("T")[0],
        status,
        paymentMethod: inv.paymentMethod ?? undefined,
        paidDate: inv.paidDate ? inv.paidDate.toISOString().split("T")[0] : undefined,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
  }
}
