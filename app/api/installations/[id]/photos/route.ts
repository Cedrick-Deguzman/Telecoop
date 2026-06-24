import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file     = formData.get('file')     as File   | null;
    const category = formData.get('category') as string | null;
    const caption  = formData.get('caption')  as string | null;

    if (!file)     return NextResponse.json({ error: 'No file provided' },      { status: 400 });
    if (!category) return NextResponse.json({ error: 'Category is required' },  { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `telecoop/installations/${id}`, resource_type: 'image' },
        (error, res) => { if (error) reject(error); else resolve(res as { secure_url: string; public_id: string }); }
      ).end(buffer);
    });

    const photo = await prisma.installationPhoto.create({
      data: {
        installationId: Number(id),
        url:       result.secure_url,
        publicId:  result.public_id,
        category,
        caption:   caption?.trim() || null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
