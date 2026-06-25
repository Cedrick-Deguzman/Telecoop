import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    const { quantity, serialIds, notes } = await req.json();

    const session = await getServerSession(authOptions);
    const performedBy = session?.user?.name ?? session?.user?.email ?? 'System';

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const isSerialized = item.category.type === 'serialized';

    if (isSerialized) {
      if (!Array.isArray(serialIds) || serialIds.length === 0) {
        return NextResponse.json({ error: 'Select at least one serial to release' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.inventorySerial.updateMany({
          where: { id: { in: serialIds }, status: 'in_stock' },
          data: { status: 'deployed' },
        }),
        prisma.inventoryTransaction.createMany({
          data: serialIds.map((sid: number) => ({
            itemId,
            type: 'release' as const,
            serialId: sid,
            notes: notes?.trim() || null,
            performedBy: performedBy?.trim() || null,
          })),
        }),
      ]);

      return NextResponse.json({ released: serialIds.length });
    } else {
      if (!quantity || Number(quantity) <= 0) {
        return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
      }

      const qty = Number(quantity);
      if (item.quantity < qty) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: itemId },
          data: { quantity: { decrement: qty } },
        }),
        prisma.inventoryTransaction.create({
          data: {
            itemId,
            type: 'release',
            quantity: qty,
            notes: notes?.trim() || null,
            performedBy: performedBy?.trim() || null,
          },
        }),
      ]);

      return NextResponse.json({ released: qty });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to release stock' }, { status: 500 });
  }
}
