import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ REQUIRED
    const invoiceId = Number(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice id" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          include: { plan: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: invoice.id,
      clientId: invoice.clientId,
      clientName: invoice.client.name,
      email: invoice.client.email,
      plan: invoice.client.plan?.name ?? "N/A",
      amount: invoice.amount,
      status: invoice.status,
      billingDate: invoice.billingDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString(),
      paymentMethod: invoice.paymentMethod,
    });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
