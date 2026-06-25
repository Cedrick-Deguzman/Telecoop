-- CreateTable
CREATE TABLE "installationmaterialusage" (
    "id" SERIAL NOT NULL,
    "installationId" INTEGER NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installationmaterialusage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "installationmaterialusage_installationId_inventoryItemId_key" ON "installationmaterialusage"("installationId", "inventoryItemId");

-- AddForeignKey
ALTER TABLE "installationmaterialusage" ADD CONSTRAINT "installationmaterialusage_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installationmaterialusage" ADD CONSTRAINT "installationmaterialusage_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventoryitem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
