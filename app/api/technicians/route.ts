import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const technicians = await prisma.technician.findMany({
      include: { _count: { select: { installations: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(technicians);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contactNumber, area, status } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const technician = await prisma.technician.create({
      data: {
        name: name.trim(),
        contactNumber: contactNumber?.trim() || null,
        area: area?.trim() || null,
        status: status || 'active',
      },
    });
    return NextResponse.json(technician, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create technician' }, { status: 500 });
  }
}
