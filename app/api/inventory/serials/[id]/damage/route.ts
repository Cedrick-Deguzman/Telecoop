import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serialId = Number(id);
    const { reason, notes } = await req.json();

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const performedBy = session?.user?.name ?? session?.user?.email ?? 'System';

    const serial = await prisma.inventorySerial.findUnique({
      where: { id: serialId },
    });

    if (!serial) {
      return NextResponse.json({ error: 'Serial not found' }, { status: 404 });
    }

    if (!['in_stock', 'returned'].includes(serial.status)) {
      return NextResponse.json(
        { error: 'Only in-stock or returned serials can be marked as damaged' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.inventorySerial.update({
        where: { id: serialId },
        data: { status: 'damaged' },
      }),
      prisma.inventoryTransaction.create({
        data: {
          itemId: serial.itemId,
          type: 'damaged',
          serialId,
          notes: [reason.trim(), notes?.trim()].filter(Boolean).join(' — '),
          performedBy,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to mark serial as damaged' }, { status: 500 });
  }
}
