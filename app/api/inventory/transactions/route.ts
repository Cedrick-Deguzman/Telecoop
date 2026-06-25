import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      include: {
        item: {
          select: { id: true, name: true, unit: true, category: { select: { name: true, type: true } } },
        },
        serial: { select: { id: true, serialNumber: true } },
        installation: {
          select: { id: true, prospectName: true, client: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
