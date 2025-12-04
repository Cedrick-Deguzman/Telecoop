import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.invoice.findMany({
      where: {
        status: "paid",
      },
      include: {
        client: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        paidDate: "desc",
      },
    });

    const formatted = payments.map(inv => ({
      id: inv.id,
      invoiceId: inv.id,
      clientId: inv.clientId,
      clientName: inv.client.name,
      plan: inv.client.plan?.name ?? "",
      amount: inv.amount,
      method: inv.paymentMethod,
      date: inv.paidDate?.toISOString().split("T")[0] ?? "",
      status: inv.status,
      billingDate: inv.billingDate?.toISOString().split("T")[0] ?? "",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
