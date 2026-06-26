import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const installations = await prisma.installation.findMany({
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        napbox: { select: { id: true, name: true } },
        materialUsages: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, category: { select: { name: true } } },
            },
          },
          orderBy: { inventoryItem: { name: 'asc' } },
        },
        photos: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(installations);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prospectName, prospectPhone, prospectAddress,
      technicianId, scheduledDate, completedDate, status, notes,
      napboxId, portNumber, fiberCore, dropCableLength,
      onuSerial, routerSerial, macAddress,
      rxReading, txReading,
      latitude, longitude,
    } = body;

    if (!prospectName?.trim()) {
      return NextResponse.json({ error: 'Prospect name is required' }, { status: 400 });
    }

    const installation = await prisma.installation.create({
      data: {
        prospectName: prospectName.trim(),
        prospectPhone: prospectPhone?.trim() || null,
        prospectAddress: prospectAddress?.trim() || null,
        technicianId: technicianId ? Number(technicianId) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
        status: status || 'pending',
        notes: notes?.trim() || null,
        napboxId: napboxId ? Number(napboxId) : null,
        portNumber: portNumber ? Number(portNumber) : null,
        fiberCore: fiberCore?.trim() || null,
        dropCableLength: dropCableLength ? Number(dropCableLength) : null,
        onuSerial: onuSerial?.trim() || null,
        routerSerial: routerSerial?.trim() || null,
        macAddress: macAddress?.trim() || null,
        rxReading: rxReading !== undefined && rxReading !== '' ? Number(rxReading) : null,
        txReading: txReading !== undefined && txReading !== '' ? Number(txReading) : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        napbox: { select: { id: true, name: true } },
        materialUsages: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, category: { select: { name: true } } },
            },
          },
          orderBy: { inventoryItem: { name: 'asc' } },
        },
        photos: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(installation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create installation' }, { status: 500 });
  }
}
