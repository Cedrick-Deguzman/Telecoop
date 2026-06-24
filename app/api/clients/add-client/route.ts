import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncClientDueDate } from "@/lib/billing-cycle";
import { getFirstDueDate, getDaysOfService, getProratedAmount } from "@/lib/billing-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, planName, installationDate, napboxId, portNumber, billingDay } = body;

    if (!name || !planName || !installationDate) {
      return NextResponse.json(
        { error: "Name, plan, and installation date are required" },
        { status: 400 }
      );
    }

    if (!billingDay || ![15, 30].includes(Number(billingDay))) {
      return NextResponse.json(
        { error: "Billing day must be 15 or 30" },
        { status: 400 }
      );
    }

    if (!napboxId || !portNumber) {
      return NextResponse.json(
        { error: "Napbox and port selection are required" },
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

    const monthlyFee = plan.price;
    const billingDayNum = Number(billingDay);
    const installDate = new Date(installationDate);
    const firstDueDate = getFirstDueDate(installDate, billingDayNum);
    const days = getDaysOfService(installDate, firstDueDate);
    const proratedAmount = getProratedAmount(monthlyFee, days);

    const port = await prisma.napboxPort.findFirst({
      where: { napboxId: Number(napboxId), portNumber: Number(portNumber) }
    });

    if (!port) {
      return NextResponse.json({ error: "Port not found" }, { status: 404 });
    }

    // Create the client
    const newClient = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address?.trim() || null,
        plan: { connect: { id: plan.id } },
        monthlyFee,
        billingDay: billingDayNum,
        status: "active",
        installationDate: installDate,
        dueDate: firstDueDate,
      },
    });

    // Update port and connect to this client
    await prisma.napboxPort.updateMany({
      where: {
        napboxId: Number(napboxId),
        portNumber: Number(portNumber),
      },
      data: {
        status: "occupied",
        clientId: newClient.id,
        connectedSince: new Date(),
      },
    });

    // Update napbox summary
    const occupied = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "occupied" },
    });
    const available = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "available" },
    });
    const faulty = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "faulty" },
    });

    await prisma.napbox.update({
      where: { id: Number(napboxId) },
      data: {
        availablePorts: available,
        occupiedPorts: occupied,
        faultyPorts: faulty,
      },
    });

    await prisma.invoice.create({
      data: {
        clientId: newClient.id,
        amount: proratedAmount,
        billingDate: installDate,
        dueDate: firstDueDate,
        status: "pending",
      },
    });

    await syncClientDueDate(newClient.id);

    return NextResponse.json(newClient);
  } catch (error: unknown) {
    console.error("Error adding client:", error);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}
