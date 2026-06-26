import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ITEM_INCLUDE = {
  category: true,
  serials: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      installation: {
        select: { id: true, prospectName: true, client: { select: { name: true } } },
      },
      photos: { orderBy: { createdAt: 'asc' as const } },
    },
  },
  _count: { select: { serials: true } },
  photos: { orderBy: { createdAt: 'asc' as const } },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id: Number(id) },
      include: ITEM_INCLUDE,
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, lowStockThreshold, unit } = await req.json();

    const item = await prisma.inventoryItem.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(unit !== undefined && { unit }),
        ...(lowStockThreshold !== undefined && {
          lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : null,
        }),
      },
      include: ITEM_INCLUDE,
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
