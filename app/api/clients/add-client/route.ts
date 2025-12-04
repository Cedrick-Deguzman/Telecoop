import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate random 8-character account number
function generateAccountNumber() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, planName, installationDate } = body;

    if (!name || !planName || !installationDate) {
      return NextResponse.json(
        { error: "Name, plan, and installation date are required" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Selected plan does not exist in database" },
        { status: 400 }
      );
    }

    // Use plan.price instead of static mapping
    const monthlyFee = plan.price;

    const dueDate = new Date(installationDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    // Create the client with a connected plan
    const newClient = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        plan: { connect: { id: plan.id } }, // <- connect relation
        monthlyFee,
        status: "active",
        installationDate: new Date(installationDate),
        accountNumber: generateAccountNumber(),
        dueDate,
      },
    });
    
    await prisma.invoice.create({
    data: {
      clientId: newClient.id,
      amount: newClient.monthlyFee,
      billingDate: newClient.installationDate,
      dueDate: new Date(newClient.installationDate.getTime() + 30*24*60*60*1000), // +1 month
      status: "pending",
    }
  });

    return NextResponse.json(newClient);
  } catch (error: any) {
    console.error("Error adding client:", error);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}
