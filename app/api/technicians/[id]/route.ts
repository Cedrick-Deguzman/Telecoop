import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, contactNumber, area, status } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const technician = await prisma.technician.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        contactNumber: contactNumber?.trim() || null,
        area: area?.trim() || null,
        status: status || 'active',
      },
    });
    return NextResponse.json(technician);
  } catch {
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
}
