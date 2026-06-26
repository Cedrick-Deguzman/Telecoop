import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { PHOTO_RULES, PHOTO_OWNER_FIELD, isPhotoRecordType } from '@/lib/photoConfig';

// Generic photo upload — works for any record type declared in PHOTO_RULES.
// Body (multipart/form-data): file, recordType, recordId, category, caption?
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file       = formData.get('file')       as File   | null;
    const recordType = formData.get('recordType') as string | null;
    const recordId   = formData.get('recordId')   as string | null;
    const category   = formData.get('category')   as string | null;
    const caption    = formData.get('caption')    as string | null;

    if (!file)                       return NextResponse.json({ error: 'No file provided' },     { status: 400 });
    if (!isPhotoRecordType(recordType)) return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
    if (!recordId || Number.isNaN(Number(recordId)))
                                     return NextResponse.json({ error: 'Invalid record id' },    { status: 400 });
    if (!category)                   return NextResponse.json({ error: 'Category is required' },  { status: 400 });
    if (!PHOTO_RULES[recordType].categories.includes(category))
                                     return NextResponse.json({ error: 'Unknown category for this record type' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `telecoop/${recordType}/${recordId}`,
          resource_type: 'image',
          // Server-side compression: cap dimensions + automatic quality/format.
          transformation: [
            { width: 1600, height: 1600, crop: 'limit' },
            { quality: 'auto:good', fetch_format: 'auto' },
          ],
        },
        (error, res) => { if (error) reject(error); else resolve(res as { secure_url: string; public_id: string }); },
      ).end(buffer);
    });

    const photo = await prisma.photo.create({
      data: {
        [PHOTO_OWNER_FIELD[recordType]]: Number(recordId),
        url:      result.secure_url,
        publicId: result.public_id,
        category,
        caption:  caption?.trim() || null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
