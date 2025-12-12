import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        plan: true,
        payment: {
          orderBy: { paymentDate: "desc" },
          take: 1,
        },
        napboxPort: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map 'payment' to 'payments' to match frontend
    const formatted = clients.map((c) => ({
      ...c,
      payments: c.payment.map((p) => ({
        paymentDate: p.paymentDate,
        amount: p.amount,
      })),
      napboxPort: c.napboxPort
      ? {
        id: c.napboxPort.id,
        portNumber: c.napboxPort.portNumber,
        status: c.napboxPort.status,
        napboxId: c.napboxPort.napboxId,
      }
      : null
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
