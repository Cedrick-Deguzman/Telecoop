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
        return NextResponse.json({ error: 'Select at least one serial to return' }, { status: 400 });
      }

      // Fetch serials first so we know which installations to clear
      const serials = await prisma.inventorySerial.findMany({
        where: { id: { in: serialIds } },
        select: { id: true, serialNumber: true, installationId: true },
      });

      await prisma.$transaction(async (tx) => {
        // Return the serials
        await tx.inventorySerial.updateMany({
          where: { id: { in: serialIds } },
          data: { status: 'returned', installationId: null },
        });

        // Clear the device field on each linked installation
        for (const serial of serials) {
          if (!serial.installationId) continue;

          const installation = await tx.installation.findUnique({
            where: { id: serial.installationId },
            select: { onuSerial: true, routerSerial: true },
          });
          if (!installation) continue;

          const clearData: { onuSerial?: null; routerSerial?: null } = {};
          if (installation.onuSerial === serial.serialNumber) clearData.onuSerial = null;
          if (installation.routerSerial === serial.serialNumber) clearData.routerSerial = null;

          if (Object.keys(clearData).length > 0) {
            await tx.installation.update({
              where: { id: serial.installationId },
              data: clearData,
            });
          }
        }

        // Log transactions
        await tx.inventoryTransaction.createMany({
          data: serialIds.map((sid: number) => ({
            itemId,
            type: 'return' as const,
            serialId: sid,
            notes: notes?.trim() || null,
            performedBy: performedBy?.trim() || null,
          })),
        });
      });

      return NextResponse.json({ returned: serialIds.length });
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
            type: 'return',
            quantity: qty,
            notes: notes?.trim() || null,
            performedBy: performedBy?.trim() || null,
          },
        }),
      ]);

      return NextResponse.json({ returned: qty });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to return stock' }, { status: 500 });
  }
}
