import { prisma } from '@/lib/prisma';

async function main() {
  const existing = await prisma.inventoryCategory.findUnique({ where: { name: 'ONU' } });
  if (existing) {
    await prisma.inventoryCategory.update({ where: { name: 'ONU' }, data: { name: 'Modem-Router' } });
    console.log('Renamed ONU → Modem-Router');
  } else {
    console.log('ONU category not found — may already be renamed');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
