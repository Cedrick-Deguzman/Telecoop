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

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: ITEM_INCLUDE,
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, categoryId, unit, lowStockThreshold } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

    const item = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        unit: unit || 'pcs',
        quantity: 0,
        ...(lowStockThreshold !== undefined && lowStockThreshold !== '' && {
          lowStockThreshold: Number(lowStockThreshold),
        }),
      },
      include: ITEM_INCLUDE,
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
