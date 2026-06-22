import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const installations = await prisma.installation.findMany({
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(installations);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospectName, prospectPhone, prospectAddress, technicianId, scheduledDate, status, notes } = body;
    if (!prospectName?.trim()) {
      return NextResponse.json({ error: 'Prospect name is required' }, { status: 400 });
    }
    const installation = await prisma.installation.create({
      data: {
        prospectName: prospectName.trim(),
        prospectPhone: prospectPhone?.trim() || null,
        prospectAddress: prospectAddress?.trim() || null,
        technicianId: technicianId ? Number(technicianId) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: status || 'pending',
        notes: notes?.trim() || null,
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(installation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create installation' }, { status: 500 });
  }
}
