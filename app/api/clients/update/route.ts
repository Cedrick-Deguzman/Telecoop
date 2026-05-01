import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, planId, status, napboxId, portNumber } = body;
    const clientId = Number(id);

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const allowedStatus = ["active", "inactive"];
    if (status && !allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Fetch existing client + port
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { napboxPort: true },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const normalizedPlanId =
      planId === null || planId === undefined ? null : Number(planId);
    const planChanged = normalizedPlanId !== existingClient.planId;
    let nextMonthlyFee: number | undefined;

    if (planChanged && normalizedPlanId !== null) {
      const targetPlan = await prisma.plan.findUnique({
        where: { id: normalizedPlanId },
        select: { price: true },
      });

      if (!targetPlan) {
        return NextResponse.json({ error: "Selected plan does not exist" }, { status: 400 });
      }

      nextMonthlyFee = targetPlan.price;
    }

    async function syncNapboxSummary(napboxIdToSync: number) {
      const [occupied, available, faulty] = await Promise.all([
        prisma.napboxPort.count({ where: { napboxId: napboxIdToSync, status: "occupied" } }),
        prisma.napboxPort.count({ where: { napboxId: napboxIdToSync, status: "available" } }),
        prisma.napboxPort.count({ where: { napboxId: napboxIdToSync, status: "faulty" } }),
      ]);

      await prisma.napbox.update({
        where: { id: napboxIdToSync },
        data: { occupiedPorts: occupied, availablePorts: available, faultyPorts: faulty },
      });
    }

    const currentPort = existingClient.napboxPort;

    /* ===============================
       CLIENT BECOMES INACTIVE
       =============================== */
    if (status === "inactive" && currentPort) {

      // Save last connection info
      await prisma.client.update({
        where: { id: clientId },
        data: {
          lastNapboxId: currentPort.napboxId,
          lastPortNumber: currentPort.portNumber,
        },
      });

      // Release port
      await prisma.napboxPort.update({
        where: { id: currentPort.id },
        data: {
          status: "available",
          clientId: null,
          connectedSince: null,
        },
      });

      await syncNapboxSummary(currentPort.napboxId);
    }

    /* ===============================
       CLIENT BECOMES ACTIVE (ASSIGN / KEEP PORT)
       =============================== */
    if (status === "active" && napboxId && portNumber) {
      const targetNapboxId = Number(napboxId);
      const targetPortNumber = Number(portNumber);
      const isSamePort =
        currentPort?.napboxId === targetNapboxId &&
        currentPort?.portNumber === targetPortNumber;

      if (isSamePort) {
        // Keep the current assignment when the user edits other client fields.
      } else {
      const newPort = await prisma.napboxPort.findFirst({
        where: {
          napboxId: targetNapboxId,
          portNumber: targetPortNumber,
        },
      });

      if (!newPort || (newPort.status !== "available" && newPort.clientId !== clientId)) {
        return NextResponse.json(
          { error: "Selected port is not available" },
          { status: 400 }
        );
      }

      if (currentPort) {
        await prisma.napboxPort.update({
          where: { id: currentPort.id },
          data: {
            status: "available",
            clientId: null,
            connectedSince: null,
          },
        });
      }

      await prisma.napboxPort.update({
        where: { id: newPort.id },
        data: {
          status: "occupied",
          clientId,
          connectedSince: newPort.clientId === clientId ? newPort.connectedSince : new Date(),
        },
      });

      const napboxesToSync = new Set<number>([targetNapboxId]);
      if (currentPort) {
        napboxesToSync.add(currentPort.napboxId);
      }

      for (const napboxIdToSync of napboxesToSync) {
        await syncNapboxSummary(napboxIdToSync);
      }
      }
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
      where: { id: clientId },
      data: {
        name,
        email,
        phone,
        status,
        updatedAt: new Date(),
        ...(status === "active" ? { reactivatedAt: new Date() } : {}),
        ...(normalizedPlanId
          ? { plan: { connect: { id: normalizedPlanId } } }
          : { plan: { disconnect: true } }),
        ...(nextMonthlyFee !== undefined ? { monthlyFee: nextMonthlyFee } : {}),
      },
      include: {
        plan: true,
        invoices: true,
        payment: true,
        napboxPort: { include: { napbox: true } },
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      {
        error: "Failed to update client",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
