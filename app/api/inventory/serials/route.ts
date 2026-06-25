import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InventorySerialStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') as InventorySerialStatus | null;

    const serials = await prisma.inventorySerial.findMany({
      where: {
        ...(status && { status }),
        ...(category && { item: { category: { name: category } } }),
      },
      include: {
        item: { select: { id: true, name: true, category: { select: { name: true } } } },
        installation: {
          select: { id: true, prospectName: true, client: { select: { name: true } } },
        },
      },
      orderBy: { serialNumber: 'asc' },
    });
    return NextResponse.json(serials);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch serials' }, { status: 500 });
  }
}
