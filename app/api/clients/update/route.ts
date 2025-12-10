import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, planId, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Validate status
    const allowedStatus = ["active", "inactive"];
    if (status && !allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        // Use nested relation to update plan
        ...(planId
          ? { plan: { connect: { id: Number(planId) } } }
          : { plan: { disconnect: true } }
        ),
        status,
        // Only set reactivatedAt if status is active
        ...(status === "active" ? { reactivatedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
      include: {
        plan: true,
        invoices: true,
        payment: true,
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    console.error("Error updating client:", error);

    return NextResponse.json(
      { error: "Failed to update client", details: error.message },
      { status: 500 }
    );
  }
}
