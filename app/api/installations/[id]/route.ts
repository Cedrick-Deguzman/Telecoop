import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { prospectName, prospectPhone, prospectAddress, technicianId, scheduledDate, completedDate, status, notes, clientId, convertedAt } = body;

    const installation = await prisma.installation.update({
      where: { id: Number(id) },
      data: {
        ...(prospectName !== undefined && { prospectName: prospectName?.trim() || null }),
        ...(prospectPhone !== undefined && { prospectPhone: prospectPhone?.trim() || null }),
        ...(prospectAddress !== undefined && { prospectAddress: prospectAddress?.trim() || null }),
        ...(technicianId !== undefined && { technicianId: technicianId ? Number(technicianId) : null }),
        ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
        ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(clientId !== undefined && { clientId: clientId ? Number(clientId) : null }),
        ...(convertedAt !== undefined && { convertedAt: convertedAt ? new Date(convertedAt) : null }),
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(installation);
  } catch {
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }
}
