import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      prospectName, prospectPhone, prospectAddress,
      technicianId, scheduledDate, completedDate, status, notes,
      clientId, convertedAt,
      napboxId, portNumber, fiberCore, dropCableLength,
      onuSerial, routerSerial, macAddress,
      rxReading, txReading,
      latitude, longitude,
    } = body;

    const installation = await prisma.installation.update({
      where: { id: Number(id) },
      data: {
        ...(prospectName !== undefined && { prospectName: prospectName?.trim() || null }),
        ...(prospectPhone !== undefined && { prospectPhone: prospectPhone?.trim() || null }),
        ...(prospectAddress !== undefined && { prospectAddress: prospectAddress?.trim() || null }),
        ...(technicianId !== undefined && { technicianId: technicianId ? Number(technicianId) : null }),
        ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
        ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(clientId !== undefined && { clientId: clientId ? Number(clientId) : null }),
        ...(convertedAt !== undefined && { convertedAt: convertedAt ? new Date(convertedAt) : null }),
        ...(napboxId !== undefined && { napboxId: napboxId ? Number(napboxId) : null }),
        ...(portNumber !== undefined && { portNumber: portNumber ? Number(portNumber) : null }),
        ...(fiberCore !== undefined && { fiberCore: fiberCore?.trim() || null }),
        ...(dropCableLength !== undefined && { dropCableLength: dropCableLength !== '' ? Number(dropCableLength) : null }),
        ...(onuSerial !== undefined && { onuSerial: onuSerial?.trim() || null }),
        ...(routerSerial !== undefined && { routerSerial: routerSerial?.trim() || null }),
        ...(macAddress !== undefined && { macAddress: macAddress?.trim() || null }),
        ...(rxReading !== undefined && { rxReading: rxReading !== '' ? Number(rxReading) : null }),
        ...(txReading !== undefined && { txReading: txReading !== '' ? Number(txReading) : null }),
        ...(latitude !== undefined && { latitude: latitude ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? Number(longitude) : null }),
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        napbox: { select: { id: true, name: true } },
        materials: true,
        photos: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(installation);
  } catch {
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }
}
