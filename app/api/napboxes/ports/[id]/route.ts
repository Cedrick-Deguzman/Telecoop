import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MANUAL_PORT_STATUSES = ["available", "faulty", "internal_use", "test_line"] as const;

function summarizePortCounts(
  ports: Array<{ status: string }>
) {
  const availablePorts = ports.filter((port) => port.status === "available").length;
  const occupiedPorts = ports.filter((port) => port.status === "occupied").length;
  const faultyPorts = ports.filter((port) => port.status === "faulty").length;
  const internalUsePorts = ports.filter((port) => port.status === "internal_use").length;
  const testLinePorts = ports.filter((port) => port.status === "test_line").length;

  return {
    availablePorts,
    occupiedPorts,
    faultyPorts,
    internalUsePorts,
    testLinePorts,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const portId = Number(id);
    const body = await req.json();
    const nextStatus = body?.status as string | undefined;

    if (!portId || !nextStatus || !MANUAL_PORT_STATUSES.includes(nextStatus as (typeof MANUAL_PORT_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid port update request" }, { status: 400 });
    }

    const existingPort = await prisma.napboxPort.findUnique({
      where: { id: portId },
    });

    if (!existingPort) {
      return NextResponse.json({ error: "Port not found" }, { status: 404 });
    }

    if (existingPort.clientId !== null) {
      return NextResponse.json(
        { error: "Client-linked ports must be managed from the client record" },
        { status: 400 }
      );
    }

    await prisma.napboxPort.update({
      where: { id: portId },
      data: {
        status: nextStatus,
        clientId: null,
        connectedSince: null,
      },
    });

    const updatedNapbox = await prisma.napbox.findUnique({
      where: { id: existingPort.napboxId },
      include: {
        ports: {
          include: {
            client: {
              select: {
                name: true,
                plan: { select: { name: true } },
                status: true,
              },
            },
          },
        },
      },
    });

    if (!updatedNapbox) {
      return NextResponse.json({ error: "NAP box not found" }, { status: 404 });
    }

    const counts = summarizePortCounts(updatedNapbox.ports);

    await prisma.napbox.update({
      where: { id: updatedNapbox.id },
      data: {
        availablePorts: counts.availablePorts,
        occupiedPorts: counts.occupiedPorts,
        faultyPorts: counts.faultyPorts,
      },
    });

    return NextResponse.json({
      ...updatedNapbox,
      ...counts,
      ports: updatedNapbox.ports.map((port) => ({
        id: port.id,
        portNumber: port.portNumber,
        status: port.status,
        clientId: port.clientId,
        clientName: port.client?.name,
        clientPlan: port.client?.plan?.name,
        connectedSince: port.connectedSince ? port.connectedSince.toISOString() : undefined,
        clientStatus: port.client?.status,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update port status" }, { status: 500 });
  }
}
