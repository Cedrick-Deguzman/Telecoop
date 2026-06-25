import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InventorySerialStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { serialNumber, macAddress, status } = await req.json();

    if (serialNumber !== undefined && !serialNumber?.trim()) {
      return NextResponse.json({ error: 'Serial number cannot be empty' }, { status: 400 });
    }

    const serial = await prisma.inventorySerial.update({
      where: { id: Number(id) },
      data: {
        ...(serialNumber !== undefined && { serialNumber: serialNumber.trim() }),
        ...(macAddress !== undefined && { macAddress: macAddress?.trim() || null }),
        ...(status !== undefined && { status: status as InventorySerialStatus }),
      },
    });

    return NextResponse.json(serial);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Serial number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update serial' }, { status: 500 });
  }
}
