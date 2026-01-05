import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id, paymentMethod, referenceNumber } = await req.json();

  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "paid",
        paidDate: new Date(),
        paymentMethod,
        referenceNumber,
      },
    });

    await prisma.payment.create({
      data: {
        clientId: invoice.clientId,
        amount: invoice.amount,
        paymentDate: new Date(),
        method: paymentMethod,
        referenceNumber,
      },
    });

    return NextResponse.json(invoice);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cannot mark as paid" }, { status: 500 });
  }
}
