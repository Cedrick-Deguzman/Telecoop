import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const ref = req.nextUrl.searchParams.get("ref");

  if (!clientId || !ref) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        referenceNumber: ref,
      },
      select: {
        id: true,
        clientId: true,
        client: {
            select: { name: true }
        },
        billingDate: true,
        amount: true,
      },
    });

    const formattedInvoices = invoices.map(inv => ({
        id: inv.id,
        clientId: inv.clientId,
        clientName: inv.client.name, // optional
        month: new Date(inv.billingDate).toLocaleString("default", { month: "long", year: "numeric" }),
        amount: inv.amount,
     }));
    return NextResponse.json(formattedInvoices); // always returns an array
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to check reference" }, { status: 500 });
  }
}
