import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: {
            include : {
                plan: true, 
            },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform for frontend BillingRecord format
    const formatted = invoices.map(inv => ({
      id: inv.id,
      clientId: inv.clientId,
      clientName: inv.client.name,
      email: inv.client.email ?? "",
      plan: inv.client.plan?.name ?? "",
      amount: inv.amount,
      billingDate: inv.billingDate.toISOString().split("T")[0],
      dueDate: inv.dueDate.toISOString().split("T")[0],
      status: inv.status as "paid" | "pending" | "overdue",
      paidDate: inv.paidDate
        ? inv.paidDate.toISOString().split("T")[0]
        : undefined,
      paymentMethod: inv.paymentMethod ?? undefined,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
  }
}
