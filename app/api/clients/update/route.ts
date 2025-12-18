import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, planId, status, napboxId, portNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Validate status
    const allowedStatus = ["active", "inactive"];
    if (status && !allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Build data object for update
    const data: any = {
      name,
      email,
      phone,
      status,
      updatedAt: new Date(),
      ...(status === "active" ? { reactivatedAt: new Date() } : {}),
      ...(planId
        ? { plan: { connect: { id: Number(planId) } } }
        : { plan: { disconnect: true } }),
    };

    // Handle napboxPort update if provided
    if (napboxId !== undefined && portNumber !== undefined) {
      // Mark old port as available if client had one
      const oldPort = await prisma.napboxPort.findFirst({ where: { clientId: Number(id) } });
      if (oldPort) {
        await prisma.napboxPort.update({
          where: { id: oldPort.id },
          data: { status: "available", clientId: null, connectedSince: null },
        });
      }

      // Assign new port
      const newPort = await prisma.napboxPort.findFirst({
        where: { napboxId: Number(napboxId), portNumber: Number(portNumber), status: "available" },
      });

      if (!newPort) {
        return NextResponse.json({ error: "Selected port is not available" }, { status: 400 });
      }

      await prisma.napboxPort.update({
        where: { id: newPort.id },
        data: { status: "occupied", clientId: Number(id), connectedSince: new Date() },
      });
    }

    // Count occupied and available ports
    const occupied = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "occupied" },
    });
    const available = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "available" },
    });
    const faulty = await prisma.napboxPort.count({
      where: { napboxId: Number(napboxId), status: "faulty" },
    });

    // Update napbox summary
    await prisma.napbox.update({
      where: { id: Number(napboxId) },
      data: {
        availablePorts: available,
        occupiedPorts: occupied,
        faultyPorts: faulty,
      },
    });

    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data,
      include: {
        plan: true,
        invoices: true,
        payment: true,
        napboxPort: {
          include: {
            napbox: true, // Include the related napbox
          },
        },
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
