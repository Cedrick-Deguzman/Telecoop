import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { dropCable, scConnector, cableTies, clamps, patchCord } = body;

    const fields = { dropCable, scConnector, cableTies, clamps, patchCord };
    const missing = Object.entries(fields)
      .filter(([, v]) => v === '' || v === null || v === undefined)
      .map(([k]) => k);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `All material quantities are required: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const material = await prisma.installationMaterial.upsert({
      where: { installationId: Number(id) },
      create: {
        installationId: Number(id),
        dropCable:   dropCable   !== '' && dropCable   != null ? Number(dropCable)   : null,
        scConnector: scConnector !== '' && scConnector != null ? Number(scConnector) : null,
        cableTies:   cableTies   !== '' && cableTies   != null ? Number(cableTies)   : null,
        clamps:      clamps      !== '' && clamps      != null ? Number(clamps)      : null,
        patchCord:   patchCord   !== '' && patchCord   != null ? Number(patchCord)   : null,
        submittedAt: new Date(),
      },
      update: {
        dropCable:   dropCable   !== '' && dropCable   != null ? Number(dropCable)   : null,
        scConnector: scConnector !== '' && scConnector != null ? Number(scConnector) : null,
        cableTies:   cableTies   !== '' && cableTies   != null ? Number(cableTies)   : null,
        clamps:      clamps      !== '' && clamps      != null ? Number(clamps)      : null,
        patchCord:   patchCord   !== '' && patchCord   != null ? Number(patchCord)   : null,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(material);
  } catch {
    return NextResponse.json({ error: 'Failed to submit materials' }, { status: 500 });
  }
}
