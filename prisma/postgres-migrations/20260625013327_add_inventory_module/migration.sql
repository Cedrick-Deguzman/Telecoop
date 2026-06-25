-- CreateEnum
CREATE TYPE "InventoryItemType" AS ENUM ('serialized', 'consumable');

-- CreateEnum
CREATE TYPE "InventorySerialStatus" AS ENUM ('in_stock', 'deployed', 'returned', 'damaged');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('stock_in', 'release', 'return', 'usage');

-- AlterTable
ALTER TABLE "installationmaterial" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "inventorycategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InventoryItemType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventorycategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventoryitem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockThreshold" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventoryitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventoryserial" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "InventorySerialStatus" NOT NULL DEFAULT 'in_stock',
    "installationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventoryserial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventorytransaction" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION,
    "serialId" INTEGER,
    "installationId" INTEGER,
    "notes" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventorytransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventorycategory_name_key" ON "inventorycategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventoryserial_serialNumber_key" ON "inventoryserial"("serialNumber");

-- AddForeignKey
ALTER TABLE "inventoryitem" ADD CONSTRAINT "inventoryitem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "inventorycategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryserial" ADD CONSTRAINT "inventoryserial_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventoryitem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryserial" ADD CONSTRAINT "inventoryserial_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventorytransaction" ADD CONSTRAINT "inventorytransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventoryitem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventorytransaction" ADD CONSTRAINT "inventorytransaction_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "inventoryserial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventorytransaction" ADD CONSTRAINT "inventorytransaction_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
