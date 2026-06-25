import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = [
  { name: 'Modem-Router',type: 'serialized'  as const },
  { name: 'Router',      type: 'serialized'  as const },
  { name: 'Switch',      type: 'serialized'  as const },
  { name: 'Tools',       type: 'serialized'  as const },
  { name: 'Drop Cable',  type: 'consumable'  as const },
  { name: 'SC Connector',type: 'consumable'  as const },
  { name: 'Patch Cord',  type: 'consumable'  as const },
  { name: 'Cable Ties',  type: 'consumable'  as const },
  { name: 'Clamps',      type: 'consumable'  as const },
];

async function main() {
  console.log('Seeding inventory categories...');

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.inventoryCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    console.log(`  ${cat.type === 'serialized' ? '[S]' : '[C]'} ${cat.name}`);
  }

  console.log('\nInventory categories seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
