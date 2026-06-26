import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const photo = await prisma.photo.findUnique({ where: { id: Number(id) } });
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

    await cloudinary.uploader.destroy(photo.publicId);
    await prisma.photo.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
