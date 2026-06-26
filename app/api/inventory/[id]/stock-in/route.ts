import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    const { quantity, serialNumbers, macAddresses, notes, performedBy } = await req.json();

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const isSerialized = item.category.type === 'serialized';

    if (isSerialized) {
      if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
        return NextResponse.json({ error: 'Serial numbers are required for serialized items' }, { status: 400 });
      }

      const trimmed = serialNumbers.map((s: string) => s.trim()).filter(Boolean);

      const existing = await prisma.inventorySerial.findMany({
        where: { serialNumber: { in: trimmed } },
        select: { serialNumber: true },
      });
      if (existing.length > 0) {
        return NextResponse.json(
          { error: `Serial numbers already exist: ${existing.map(e => e.serialNumber).join(', ')}` },
          { status: 409 }
        );
      }

      const macMap: Record<string, string> = {};
      if (Array.isArray(macAddresses)) {
        trimmed.forEach((sn: string, i: number) => {
          if (macAddresses[i]?.trim()) macMap[sn] = macAddresses[i].trim();
        });
      }

      const serials = await prisma.$transaction(
        trimmed.map((sn: string) =>
          prisma.inventorySerial.create({
            data: { itemId, serialNumber: sn, macAddress: macMap[sn] ?? null, status: 'in_stock' },
          })
        )
      );

      await prisma.inventoryTransaction.createMany({
        data: serials.map(s => ({
          itemId,
          type: 'stock_in' as const,
          serialId: s.id,
          notes: notes?.trim() || null,
          performedBy: performedBy?.trim() || null,
        })),
      });

      return NextResponse.json({
        added: serials.length,
        serials: serials.map(s => ({ id: s.id, serialNumber: s.serialNumber })),
      });
    } else {
      if (!quantity || Number(quantity) <= 0) {
        return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
      }

      const qty = Number(quantity);
      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: itemId },
          data: { quantity: { increment: qty } },
        }),
        prisma.inventoryTransaction.create({
          data: {
            itemId,
            type: 'stock_in',
            quantity: qty,
            notes: notes?.trim() || null,
            performedBy: performedBy?.trim() || null,
          },
        }),
      ]);

      return NextResponse.json({ added: qty });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to stock in' }, { status: 500 });
  }
}
