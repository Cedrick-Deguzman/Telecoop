import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    if (!['serialized', 'consumable'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    const category = await prisma.inventoryCategory.create({
      data: { name: name.trim(), type },
    });
    return NextResponse.json(category);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
