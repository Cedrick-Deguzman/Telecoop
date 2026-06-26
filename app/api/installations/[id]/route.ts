import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MATERIAL_USAGE_INCLUDE = {
  include: {
    inventoryItem: {
      select: { id: true, name: true, unit: true, category: { select: { name: true } } },
    },
  },
  orderBy: { inventoryItem: { name: 'asc' as const } },
};

// Sync serial status whenever onuSerial/routerSerial changes on the installation
async function syncSerialDeployment(
  installationId: number,
  prevOnu: string | null,
  prevRouter: string | null,
  nextOnu: string | null,
  nextRouter: string | null,
) {
  const ops: Promise<unknown>[] = [];

  const handleSerialChange = async (prev: string | null, next: string | null) => {
    // Unlink the old serial if it changed
    if (prev && prev !== next) {
      const old = await prisma.inventorySerial.findUnique({ where: { serialNumber: prev } });
      if (old && old.installationId === installationId) {
        ops.push(
          prisma.inventorySerial.update({
            where: { id: old.id },
            data: { status: 'in_stock', installationId: null },
          })
        );
      }
    }

    // Link the new serial if it changed
    if (next && next !== prev) {
      const serial = await prisma.inventorySerial.findUnique({ where: { serialNumber: next } });
      if (serial && serial.status !== 'deployed') {
        ops.push(
          prisma.inventorySerial.update({
            where: { id: serial.id },
            data: { status: 'deployed', installationId },
          })
        );
      }
    }
  };

  await handleSerialChange(prevOnu, nextOnu);
  await handleSerialChange(prevRouter, nextRouter);

  if (ops.length > 0) await Promise.all(ops);
}

// Deduct consumables only — serials are already deployed via syncSerialDeployment
async function triggerConsumableDeduction(installationId: number) {
  const installation = await prisma.installation.findUnique({
    where: { id: installationId },
    include: { materialUsages: { include: { inventoryItem: true } } },
  });
  if (!installation) return;

  const ops: Promise<unknown>[] = [];

  for (const usage of installation.materialUsages) {
    const qty = usage.quantity;
    if (!qty || qty <= 0) continue;

    ops.push(
      prisma.inventoryItem.update({
        where: { id: usage.inventoryItemId },
        data: { quantity: { decrement: qty } },
      }),
      prisma.inventoryTransaction.create({
        data: {
          itemId: usage.inventoryItemId,
          type: 'usage',
          quantity: qty,
          installationId,
          notes: 'Auto-deducted on installation completion',
          performedBy: 'System',
        },
      })
    );
  }

  if (ops.length > 0) await Promise.all(ops);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const installationId = Number(id);
    const body = await req.json();
    const {
      prospectName, prospectPhone, prospectAddress,
      technicianId, scheduledDate, completedDate, status, notes,
      clientId, convertedAt,
      napboxId, portNumber, fiberCore, dropCableLength,
      onuSerial, routerSerial, macAddress,
      rxReading, txReading,
      latitude, longitude,
    } = body;

    // Read previous state before update
    const prev = await prisma.installation.findUnique({
      where: { id: installationId },
      select: { status: true, onuSerial: true, routerSerial: true },
    });

    const installation = await prisma.installation.update({
      where: { id: installationId },
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
        ...(napboxId !== undefined && { napboxId: napboxId ? Number(napboxId) : null }),
        ...(portNumber !== undefined && { portNumber: portNumber ? Number(portNumber) : null }),
        ...(fiberCore !== undefined && { fiberCore: fiberCore?.trim() || null }),
        ...(dropCableLength !== undefined && { dropCableLength: dropCableLength !== '' ? Number(dropCableLength) : null }),
        ...(onuSerial !== undefined && { onuSerial: onuSerial?.trim() || null }),
        ...(routerSerial !== undefined && { routerSerial: routerSerial?.trim() || null }),
        ...(macAddress !== undefined && { macAddress: macAddress?.trim() || null }),
        ...(rxReading !== undefined && { rxReading: rxReading !== '' ? Number(rxReading) : null }),
        ...(txReading !== undefined && { txReading: txReading !== '' ? Number(txReading) : null }),
        ...(latitude !== undefined && { latitude: latitude ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? Number(longitude) : null }),
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        napbox: { select: { id: true, name: true } },
        materialUsages: MATERIAL_USAGE_INCLUDE,
        photos: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Sync serial deployed/in_stock status whenever serials change
    const nextOnu = onuSerial !== undefined ? (onuSerial?.trim() || null) : (prev?.onuSerial ?? null);
    const nextRouter = routerSerial !== undefined ? (routerSerial?.trim() || null) : (prev?.routerSerial ?? null);
    await syncSerialDeployment(
      installationId,
      prev?.onuSerial ?? null,
      prev?.routerSerial ?? null,
      nextOnu,
      nextRouter,
    );

    // Deduct consumables only on first transition to completed
    if (status === 'completed' && prev?.status !== 'completed') {
      await triggerConsumableDeduction(installationId);
    }

    return NextResponse.json(installation);
  } catch {
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }
}
