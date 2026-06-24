import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { photoId } = await params;

    const photo = await prisma.installationPhoto.findUnique({
      where: { id: Number(photoId) },
    });

    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

    await cloudinary.uploader.destroy(photo.publicId);
    await prisma.installationPhoto.delete({ where: { id: Number(photoId) } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
