import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const installationId = Number(id);
    const { usages } = (await req.json()) as {
      usages: Array<{ inventoryItemId: number; quantity: number }>;
    };

    const validUsages = (usages ?? []).filter(u => u.quantity > 0);

    // Replace all existing usages atomically
    await prisma.$transaction(async (tx) => {
      await tx.installationMaterialUsage.deleteMany({ where: { installationId } });
      for (const u of validUsages) {
        await tx.installationMaterialUsage.create({
          data: {
            installationId,
            inventoryItemId: u.inventoryItemId,
            quantity: u.quantity,
          },
        });
      }
    });

    const saved = await prisma.installationMaterialUsage.findMany({
      where: { installationId },
      include: {
        inventoryItem: {
          select: { id: true, name: true, unit: true, category: { select: { name: true } } },
        },
      },
      orderBy: { inventoryItem: { name: 'asc' } },
    });

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: 'Failed to save material usage' }, { status: 500 });
  }
}
