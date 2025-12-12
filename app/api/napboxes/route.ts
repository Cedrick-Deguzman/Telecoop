import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const napboxes = await prisma.napbox.findMany({
      include: {
        ports: {
          include: {
            client: {
              select: {
                name: true,
                plan: { select: { name: true } },
                installationDate: true, // optional, for connectedSince
                status: true, // include client status
              }
            }
          }
        }
      }
    });

    // Map ports to include clientName, clientPlan, connectedSince
    const mappedNapboxes = napboxes.map(napbox => ({
      ...napbox,
      ports: napbox.ports.map(port => ({
        portNumber: port.portNumber,
        status: port.status,
        clientId: port.clientId,
        clientName: port.client ? port.client.name : undefined,
        clientPlan: port.client?.plan ? port.client.plan.name : undefined,
        connectedSince: port.connectedSince ? port.connectedSince.toISOString() : undefined,
        clientStatus: port.client ? port.client.status : undefined,
      }))
    }));

    return NextResponse.json(mappedNapboxes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch NAP boxes' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, totalPorts, status, installDate } = body;

    if (!name || !location || !totalPorts || !status || !installDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const napbox = await prisma.napbox.create({
      data: {
        name,
        location,
        totalPorts,
        availablePorts: totalPorts,
        occupiedPorts: 0,
        faultyPorts: 0,
        status,
        installDate: new Date(installDate),
        ports: {
          create: Array.from({ length: totalPorts }, (_, i) => ({
            portNumber: i + 1,
            status: 'available',
          })),
        },
      },
      include: { ports: true },
    });

    return NextResponse.json(napbox);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create NAP box' }, { status: 500 });
  }
};

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, location, totalPorts, status, installDate } = body;

    if (!id || !name || !location || !totalPorts || !status || !installDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch existing napbox
    const existingNapbox = await prisma.napbox.findUnique({
      where: { id },
      include: { ports: true },
    });

    if (!existingNapbox) {
      return NextResponse.json({ error: 'NAP box not found' }, { status: 404 });
    }

    // If totalPorts changed, reset ports
    if (totalPorts !== existingNapbox.totalPorts) {
      // Delete old ports
      await prisma.napboxPort.deleteMany({ where: { napboxId: id } });

      // Create new ports
      await prisma.napboxPort.createMany({
        data: Array.from({ length: totalPorts }, (_, i) => ({
          portNumber: i + 1,
          status: 'available',
          napboxId: id,
        })),
      });
    }

    // Update napbox
    const updatedNapbox = await prisma.napbox.update({
      where: { id },
      data: {
        name,
        location,
        totalPorts,
        availablePorts: totalPorts,
        occupiedPorts: 0,
        faultyPorts: 0,
        status,
        installDate: new Date(installDate),
      },
      include: { ports: true },
    });

    return NextResponse.json(updatedNapbox);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update NAP box' }, { status: 500 });
  }
}
