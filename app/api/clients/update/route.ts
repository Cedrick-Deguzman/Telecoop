import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, planId, status, napboxId, portNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const allowedStatus = ["active", "inactive"];
    if (status && !allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Fetch existing client + port
    const existingClient = await prisma.client.findUnique({
      where: { id: Number(id) },
      include: { napboxPort: true },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    /* ===============================
       CLIENT BECOMES INACTIVE
       =============================== */
    if (status === "inactive" && existingClient.napboxPort) {
      const port = existingClient.napboxPort;

      // Save last connection info
      await prisma.client.update({
        where: { id: Number(id) },
        data: {
          lastNapboxId: port.napboxId,
          lastPortNumber: port.portNumber,
        },
      });

      // Release port
      await prisma.napboxPort.update({
        where: { id: port.id },
        data: {
          status: "available",
          clientId: null,
          connectedSince: null,
        },
      });

      // Update napbox inventory
      const [occupied, available, faulty] = await Promise.all([
        prisma.napboxPort.count({ where: { napboxId: port.napboxId, status: "occupied" } }),
        prisma.napboxPort.count({ where: { napboxId: port.napboxId, status: "available" } }),
        prisma.napboxPort.count({ where: { napboxId: port.napboxId, status: "faulty" } }),
      ]);

      await prisma.napbox.update({
        where: { id: port.napboxId },
        data: { occupiedPorts: occupied, availablePorts: available, faultyPorts: faulty },
      });
    }

    /* ===============================
       CLIENT BECOMES ACTIVE (ASSIGN PORT)
       =============================== */
    if (status === "active" && napboxId && portNumber) {
      const newPort = await prisma.napboxPort.findFirst({
        where: {
          napboxId: Number(napboxId),
          portNumber: Number(portNumber),
          status: "available",
        },
      });

      if (!newPort) {
        return NextResponse.json(
          { error: "Selected port is not available" },
          { status: 400 }
        );
      }

      await prisma.napboxPort.update({
        where: { id: newPort.id },
        data: {
          status: "occupied",
          clientId: Number(id),
          connectedSince: new Date(),
        },
      });

      const [occupied, available, faulty] = await Promise.all([
        prisma.napboxPort.count({ where: { napboxId: Number(napboxId), status: "occupied" } }),
        prisma.napboxPort.count({ where: { napboxId: Number(napboxId), status: "available" } }),
        prisma.napboxPort.count({ where: { napboxId: Number(napboxId), status: "faulty" } }),
      ]);

      await prisma.napbox.update({
        where: { id: Number(napboxId) },
        data: { occupiedPorts: occupied, availablePorts: available, faultyPorts: faulty },
      });
    }
    
    // Enforce napbox + port when activating
    if (status === "active") {
      if (napboxId == null || portNumber == null) {
        return NextResponse.json(
          { error: "Napbox and port are required when activating a client" },
          { status: 400 }
        );
      }
    }

    /* ===============================
       FINAL CLIENT UPDATE
       =============================== */
    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        status,
        updatedAt: new Date(),
        ...(status === "active" ? { reactivatedAt: new Date() } : {}),
        ...(planId
          ? { plan: { connect: { id: Number(planId) } } }
          : { plan: { disconnect: true } }),
      },
      include: {
        plan: true,
        invoices: true,
        payment: true,
        napboxPort: { include: { napbox: true } },
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
